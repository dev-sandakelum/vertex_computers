/**
 * GET /api/payhere/status/[orderId]
 *
 * Returns the current server-side payment status for an order.
 * The success/cancel pages poll this endpoint to get the real status
 * instead of trusting URL params (which can be manipulated by users).
 *
 * When the order is PAID, the response additionally includes everything
 * the premium receipt screen needs: itemized lines, subtotal/tax/shipping,
 * and the non-sensitive card snapshot (brand, cardholder, last 4).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/orderStore';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { orderId } = await params;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 });
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Return only safe, non-sensitive fields to the client
    return NextResponse.json({
      orderId:          order.orderId,
      status:           order.status,
      total:            order.total,
      currency:         order.currency,
      items:            order.items.map((i) => ({
        name:      i.name,
        quantity:  i.quantity,
        price:     i.price,
        lineTotal: i.lineTotal,
      })),
      itemCount:        order.items.reduce((s, i) => s + i.quantity, 0),
      firstName:        order.firstName,
      // Receipt fields
      lastName:         order.lastName,
      subtotal:         order.subtotal,
      tax:              order.tax,
      // Shipping is derived from the stored totals (0 → "free" on receipt)
      shipping:         Math.max(0, Math.round((order.total - order.subtotal - order.tax) * 100) / 100),
      createdAt:        order.createdAt,
      updatedAt:        order.updatedAt,
      // Only include payment details when paid
      ...(order.status === 'PAID' ? {
        paymentMethod: order.paymentMethod,
        cardHolder:    order.cardHolder,
        cardLast4:     order.cardLast4,
        cardBrand:     order.cardBrand,
      } : {}),
    });
  } catch (err) {
    console.error('[payhere/status] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
