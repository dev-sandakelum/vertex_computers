/**
 * PayHere Payment Retrieval API — SERVER SIDE ONLY.
 *
 * Used as a fallback when the IPN (notify_url) has not reached us — e.g. the
 * app runs on localhost / behind a firewall, the notify URL was misconfigured,
 * or PayHere's callback was delayed. The success page polls our status
 * endpoint, which calls `reconcileOrderWithPayHere()` for PENDING orders.
 *
 * Docs: https://support.payhere.lk/api-&-mobile-sdk/retrieval-api
 *
 *   1. POST {base}/oauth/token
 *        Authorization: Basic base64(app_id:app_secret)
 *        Content-Type: application/x-www-form-urlencoded
 *        grant_type=client_credentials
 *      → { access_token, token_type, expires_in, scope }
 *
 *   2. GET {base}/payment/search?order_id=...
 *        Authorization: Bearer <access_token>
 *      → { status: 1 | 0 | -1 | -2, msg, data: Payment[] | null }
 *
 * Requires PAYHERE_APP_ID / PAYHERE_APP_SECRET (a PayHere "Business App" with
 * the "Payment Retrieval API" permission). When they are absent every function
 * here is a no-op, so the IPN remains the only source of truth.
 */

import { getMerchantApiBase, getRetrievalCredentials } from './config';
import { buildCardInfo, type CardInfo } from './card';
import { getOrder, updateOrderStatus } from '../orderStore';
import { log } from '../logger';
import type { Order, OrderStatus } from './types';

/* ── Types for the PayHere response (only the fields we read) ── */

interface PayHerePayment {
  payment_id?: number | string;
  order_id?: string;
  date?: string;
  status?: string;          // RECEIVED | REFUND REQUESTED | REFUND PROCESSING | REFUNDED | CHARGEBACKED
  currency?: string;
  amount?: number | string;
  amount_detail?: {
    currency?: string;
    gross?: number | string;
    exchange_from?: string;
  };
  payment_method?: {
    method?: string;
    card_customer_name?: string;
    card_no?: string;
  };
}

interface PayHereSearchResponse {
  status: number;
  msg?: string;
  data?: PayHerePayment[] | null;
}

export interface RetrievedPayment {
  paymentId?: string;
  status: OrderStatus;
  rawStatus: string;
  method?: string;
  currency?: string;
  amount?: number;
  exchangeFrom?: string;
  card: CardInfo;
}

/* ── Access-token cache (per server instance) ── */

let tokenCache: { token: string; expiresAt: number; key: string } | null = null;

async function getAccessToken(): Promise<string | null> {
  const creds = getRetrievalCredentials();
  if (!creds) return null;

  const key = `${creds.appId}:${creds.appSecret}`;
  if (tokenCache && tokenCache.key === key && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const res = await fetch(`${getMerchantApiBase()}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(key).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn(`[payhere/retrieval] Token request failed: HTTP ${res.status}`);
    return null;
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    console.warn('[payhere/retrieval] Token response had no access_token');
    return null;
  }

  // Refresh a little early so an in-flight request never uses a stale token.
  const ttlMs = Math.max(30, Number(json.expires_in) || 599) * 1000;
  tokenCache = { token: json.access_token, expiresAt: Date.now() + ttlMs - 15_000, key };
  return json.access_token;
}

/* ── Status mapping ── */

function mapPayHereStatus(raw: string | undefined): OrderStatus | null {
  const s = (raw ?? '').trim().toUpperCase();
  if (!s) return null;
  if (s === 'RECEIVED' || s === 'SUCCESS' || s === 'COMPLETED') return 'PAID';
  // Money was received; a refund is merely requested/in progress.
  if (s === 'REFUND REQUESTED' || s === 'REFUND PROCESSING') return 'PAID';
  if (s === 'REFUNDED' || s === 'CHARGEBACKED' || s === 'CHARGEBACK') return 'REFUNDED';
  if (s === 'CANCELED' || s === 'CANCELLED') return 'CANCELLED';
  if (s === 'FAILED' || s === 'DECLINED') return 'FAILED';
  if (s === 'PENDING' || s === 'AUTHORIZED') return 'PENDING';
  return null;
}

function toNumber(v: number | string | undefined): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Look up a payment on PayHere by the order_id we sent to checkout.
 * Returns null when the credentials are missing, the API is unreachable, or
 * PayHere has no record for the order (payment still in progress / abandoned).
 */
export async function fetchPaymentByOrderId(orderId: string): Promise<RetrievedPayment | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const url = `${getMerchantApiBase()}/payment/search?order_id=${encodeURIComponent(orderId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (res.status === 401) {
    // Token revoked / expired early — drop the cache so the next call re-auths.
    tokenCache = null;
    console.warn('[payhere/retrieval] Search returned 401 — token cache cleared');
    return null;
  }
  if (!res.ok) {
    console.warn(`[payhere/retrieval] Search failed for ${orderId}: HTTP ${res.status}`);
    return null;
  }

  const json = (await res.json()) as PayHereSearchResponse;
  const list = Array.isArray(json.data) ? json.data : [];
  if (json.status !== 1 || list.length === 0) {
    // -1 = no records found, 0 = pending, -2 = declined
    return null;
  }

  // PayHere does not enforce unique order_ids — prefer a successful payment,
  // otherwise take the most recent record.
  const mapped = list
    .map((p) => ({ p, status: mapPayHereStatus(p.status) }))
    .filter((x): x is { p: PayHerePayment; status: OrderStatus } => x.status !== null);
  if (mapped.length === 0) return null;

  const chosen =
    mapped.find((x) => x.status === 'PAID') ??
    mapped.find((x) => x.status === 'REFUNDED') ??
    mapped[mapped.length - 1];

  const { p, status } = chosen;
  const method = p.payment_method?.method;

  return {
    paymentId:    p.payment_id !== undefined ? String(p.payment_id) : undefined,
    status,
    rawStatus:    String(p.status ?? ''),
    method,
    currency:     p.currency ?? p.amount_detail?.currency,
    amount:       toNumber(p.amount) ?? toNumber(p.amount_detail?.gross),
    exchangeFrom: p.amount_detail?.exchange_from,
    card:         buildCardInfo(method, p.payment_method?.card_customer_name, p.payment_method?.card_no),
  };
}

/* ── Reconciliation ── */

// Avoid hammering PayHere when several pollers ask about the same order at once.
const inFlight    = new Map<string, Promise<Order>>();
const lastChecked = new Map<string, number>();
const MIN_INTERVAL_MS = 2_000;

/**
 * If `order` is still PENDING and the Retrieval API is configured, ask PayHere
 * for the real payment state and persist it. Returns the (possibly updated)
 * order. Never throws — any failure leaves the order untouched.
 */
export async function reconcileOrderWithPayHere(order: Order): Promise<Order> {
  if (order.status !== 'PENDING') return order;
  if (!getRetrievalCredentials()) return order;

  const existing = inFlight.get(order.orderId);
  if (existing) return existing;

  const last = lastChecked.get(order.orderId) ?? 0;
  if (Date.now() - last < MIN_INTERVAL_MS) return order;

  const task = (async (): Promise<Order> => {
    try {
      lastChecked.set(order.orderId, Date.now());
      const payment = await fetchPaymentByOrderId(order.orderId);
      if (!payment || payment.status === 'PENDING') return order;

      // ── Verify the payment matches what we expect ──
      const orderCurrency = order.currency.toUpperCase();
      const payCurrency   = payment.currency?.toUpperCase();
      const currencyOk =
        payCurrency === orderCurrency ||
        payment.exchangeFrom?.toUpperCase() === orderCurrency;

      if (!currencyOk) {
        console.warn(
          `[payhere/retrieval] Currency mismatch for ${order.orderId}: expected ${order.currency}, got ${payment.currency}`,
        );
        return order;
      }

      // Amount can only be compared when PayHere reports it in our currency.
      if (payCurrency === orderCurrency && payment.amount !== undefined) {
        if (Math.abs(payment.amount - order.total) > 0.01) {
          console.warn(
            `[payhere/retrieval] Amount mismatch for ${order.orderId}: expected ${order.total}, got ${payment.amount}`,
          );
          return order;
        }
      }

      // Re-read right before writing: the IPN may have landed meanwhile.
      const fresh = await getOrder(order.orderId);
      if (!fresh || fresh.status !== 'PENDING') return fresh ?? order;

      const updated = await updateOrderStatus(
        order.orderId,
        payment.status,
        payment.paymentId,
        payment.method,
        payment.status === 'PAID' ? payment.card : undefined,
      );

      await log({
        level: payment.status === 'PAID' ? 'success' : 'info',
        category: 'payment',
        message: `Order ${order.orderId} → ${payment.status} (via Retrieval API, PayHere status "${payment.rawStatus}")`,
        meta: { orderId: order.orderId, paymentId: payment.paymentId, method: payment.method, status: payment.status, source: 'retrieval' },
      });

      return updated ?? order;
    } catch (err) {
      console.error(`[payhere/retrieval] Reconcile failed for ${order.orderId}:`, err);
      return order;
    } finally {
      inFlight.delete(order.orderId);
    }
  })();

  inFlight.set(order.orderId, task);
  return task;
}
