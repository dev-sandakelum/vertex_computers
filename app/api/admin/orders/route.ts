/**
 * GET   /api/admin/orders?page=1&limit=20&status=PAID
 * PATCH /api/admin/orders  — update order status
 * Requires admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import OrderModel from '@/lib/models/Order';

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const status = searchParams.get('status')?.trim() ?? '';
  const search = searchParams.get('search')?.trim() ?? '';

  try {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId:   { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const [total, docs] = await Promise.all([
      OrderModel.countDocuments(query),
      OrderModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('orderId userId firstName lastName email total currency status createdAt updatedAt itemCount items paymentMethod')
        .lean(),
    ]);

    const orders = docs.map((o) => {
      const doc = o as Record<string, unknown>;
      const items = doc.items as { quantity: number }[] | undefined;
      return {
        orderId:       doc.orderId,
        customer:      `${doc.firstName} ${doc.lastName}`,
        email:         doc.email,
        total:         doc.total,
        currency:      doc.currency,
        status:        doc.status,
        paymentMethod: doc.paymentMethod,
        itemCount:     items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
        createdAt:     doc.createdAt,
        updatedAt:     doc.updatedAt,
      };
    });

    return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { orderId: string; status: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const VALID = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];
  if (!body.orderId || !VALID.includes(body.status)) {
    return NextResponse.json({ error: 'orderId and valid status required' }, { status: 400 });
  }

  try {
    await connectDB();
    const now = new Date().toISOString();
    const doc = await OrderModel.findOneAndUpdate(
      { orderId: body.orderId },
      { $set: { status: body.status, updatedAt: now } },
      { new: true },
    ).lean();
    if (!doc) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}
