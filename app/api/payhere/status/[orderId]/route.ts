/**
 * GET /api/payhere/status/[orderId]
 *
 * Returns the current server-side payment status for an order.
 * The success/cancel pages poll this endpoint to get the real status
 * instead of trusting URL params (which can be manipulated by users).
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
        lineTotal: i.lineTotal,
      })),
      itemCount:        order.items.reduce((s, i) => s + i.quantity, 0),
      firstName:        order.firstName,
      createdAt:        order.createdAt,
      updatedAt:        order.updatedAt,
      // Only include paymentMethod if paid
      ...(order.status === 'PAID' ? { paymentMethod: order.paymentMethod } : {}),
    });
  } catch (err) {
    console.error('[payhere/status] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
