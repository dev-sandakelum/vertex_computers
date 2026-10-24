/**
 * GET /api/admin/stats
 * Returns aggregate counts for the admin dashboard.
 * Requires admin session.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import OrderModel from '@/lib/models/Order';
import UserModel from '@/lib/models/User';
import LogModel from '@/lib/models/Log';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalLogs,
      paidOrders,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      ProductModel.countDocuments(),
      OrderModel.countDocuments(),
      UserModel.countDocuments(),
      LogModel.countDocuments(),
      OrderModel.countDocuments({ status: 'PAID' }),
      OrderModel.countDocuments({ status: 'PENDING' }),
      OrderModel.find({})
        .sort({ updatedAt: -1 })
        .limit(8)
        .select('orderId firstName lastName total status currency createdAt updatedAt')
        .lean(),
    ]);

    // Sum revenue from PAID orders
    const revenueAgg = await OrderModel.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalLogs,
      paidOrders,
      pendingOrders,
      totalRevenue,
      recentOrders: recentOrders.map((o) => ({
        orderId:   o.orderId,
        customer:  `${o.firstName} ${o.lastName}`,
        total:     o.total,
        currency:  o.currency,
        status:    o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'DB error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
