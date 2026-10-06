/**
 * GET /api/account/orders
 * Returns all orders belonging to the logged-in user (matched by email).
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import OrderModel from '@/lib/models/Order';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.email) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  try {
    await connectDB();
    const orders = await OrderModel.find({ userId: session.email })
      .sort({ createdAt: -1 })
      .lean();

    const clean = orders.map((o) => {
      const { _id, __v, ...rest } = o as Record<string, unknown>;
      void _id; void __v;
      return rest;
    });

    return NextResponse.json({ orders: clean });
  } catch (err) {
    console.error('[account/orders]', err);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 500 });
  }
}
