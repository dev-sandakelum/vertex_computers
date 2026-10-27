/**
 * POST /api/payhere/notify
 *
 * Receives PayHere's server-to-server Instant Payment Notification (IPN).
 * This is the authoritative source of payment truth — NEVER mark an order
 * as PAID based solely on the user reaching the return URL.
 *
 * PayHere sends form-encoded (application/x-www-form-urlencoded) POST data.
 * This endpoint MUST return HTTP 200 or PayHere will retry.
 *
 * Security checks performed:
 *   1. md5sig verification (using merchant secret)
 *   2. Order existence check
 *   3. Amount verification
 *   4. Currency verification
 *   5. Idempotency (already-PAID orders are not reprocessed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyNotificationHash, formatAmount } from '@/lib/payhere/hash';
import { getMerchantId, getMerchantSecret } from '@/lib/payhere/config';
import { getOrder, updateOrderStatus } from '@/lib/orderStore';
import { log } from '@/lib/logger';
import { PAYHERE_STATUS, type PayHereStatusCode } from '@/lib/payhere/types';

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse form-encoded body ───────────────────────────────
    const formData = await req.formData();
    const get = (key: string) => formData.get(key)?.toString() ?? '';

    const merchant_id       = get('merchant_id');
    const order_id          = get('order_id');
    const payment_id        = get('payment_id');
    const payhere_amount    = get('payhere_amount');
    const payhere_currency  = get('payhere_currency');
    const status_code       = get('status_code');
    const md5sig            = get('md5sig');
    const method            = get('method');
    // Optional card fields sent by PayHere (card_no arrives already masked)
    const card_holder_name  = get('card_holder_name');
    const card_no           = get('card_no');

    // ── 2. Validate required fields are present ──────────────────
    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      console.warn('[payhere/notify] Missing required notification fields');
      return new NextResponse('Bad Request', { status: 400 });
    }

    // ── 3. Verify the notification hash / signature ──────────────
    const isValid = verifyNotificationHash({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      md5sig,
      merchantSecret: getMerchantSecret(),
    });

    if (!isValid) {
      console.warn(`[payhere/notify] Invalid signature for order ${order_id}`);
      // Return 200 to stop PayHere retrying (but log the fraud attempt)
      return new NextResponse('OK', { status: 200 });
    }

    // ── 4. Verify our own merchant ID matches ────────────────────
    if (merchant_id !== getMerchantId()) {
      console.warn(`[payhere/notify] Merchant ID mismatch for order ${order_id}`);
      return new NextResponse('OK', { status: 200 });
    }

    // ── 5. Retrieve the order ────────────────────────────────────
    const order = await getOrder(order_id);
    if (!order) {
      console.warn(`[payhere/notify] Unknown order ID: ${order_id}`);
      return new NextResponse('OK', { status: 200 });
    }

    // ── 6. Idempotency — skip if already in a terminal state ─────
    if (order.status === 'PAID' || order.status === 'REFUNDED') {
      console.info(`[payhere/notify] Order ${order_id} already in terminal state ${order.status} — skipping`);
      return new NextResponse('OK', { status: 200 });
    }

    // ── 7. Verify amount ─────────────────────────────────────────
    const expectedAmount = formatAmount(order.total);
    if (payhere_amount !== expectedAmount) {
      console.warn(
        `[payhere/notify] Amount mismatch for order ${order_id}: expected ${expectedAmount}, got ${payhere_amount}`,
      );
      return new NextResponse('OK', { status: 200 });
    }

    // ── 8. Verify currency ───────────────────────────────────────
    if (payhere_currency.toUpperCase() !== order.currency.toUpperCase()) {
      console.warn(
        `[payhere/notify] Currency mismatch for order ${order_id}: expected ${order.currency}, got ${payhere_currency}`,
      );
      return new NextResponse('OK', { status: 200 });
    }

    // ── 9. Map status code to our OrderStatus ────────────────────
    const code = parseInt(status_code, 10) as PayHereStatusCode;
    const newStatus = PAYHERE_STATUS[code];

    if (!newStatus) {
      console.warn(`[payhere/notify] Unknown status_code ${status_code} for order ${order_id}`);
      return new NextResponse('OK', { status: 200 });
    }

    // ── 10. Update order ─────────────────────────────────────────
    // Capture the non-sensitive card snapshot for the receipt (only when
    // the payment actually succeeded). card_no arrives masked from PayHere —
    // we keep at most the last 4 digits, never the full number.
    const cardInfo: { cardHolder?: string; cardLast4?: string; cardBrand?: string } = {};
    if (newStatus === 'PAID') {
      if (card_holder_name) cardInfo.cardHolder = card_holder_name.trim().slice(0, 80);
      const digits = card_no.replace(/\D/g, '');
      if (digits.length >= 4) cardInfo.cardLast4 = digits.slice(-4);
      const m = method.toUpperCase();
      if (m.includes('VISA'))                       cardInfo.cardBrand = 'VISA';
      else if (m.includes('MASTER'))                cardInfo.cardBrand = 'MASTER';
      else if (m.includes('AMEX') || m.includes('AMERICAN')) cardInfo.cardBrand = 'AMEX';
      else if (m.includes('PAYPAL'))                cardInfo.cardBrand = 'PAYPAL';
      else if (m)                                   cardInfo.cardBrand = m.slice(0, 24);
    }

    await updateOrderStatus(order_id, newStatus, payment_id || undefined, method || undefined, cardInfo);

    await log({
      level: newStatus === 'PAID' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
      category: 'payment',
      message: `Order ${order_id} → ${newStatus}`,
      meta: { orderId: order_id, paymentId: payment_id, method, status: newStatus },
    });

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[payhere/notify] Unexpected error:', err);
    // Always return 200 to PayHere even on our internal errors to prevent retries
    return new NextResponse('OK', { status: 200 });
  }
}
