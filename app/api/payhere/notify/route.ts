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
    await updateOrderStatus(order_id, newStatus, payment_id || undefined, method || undefined);

    console.info(
      `[payhere/notify] Order ${order_id} → ${newStatus} (payment_id: ${payment_id}, method: ${method})`,
    );

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[payhere/notify] Unexpected error:', err);
    // Always return 200 to PayHere even on our internal errors to prevent retries
    return new NextResponse('OK', { status: 200 });
  }
}
