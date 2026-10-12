/**
 * GET    /api/admin/logs?page=1&limit=50&level=error&category=payment
 * DELETE /api/admin/logs  — clear all logs (admin only)
 * Requires admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import LogModel from '@/lib/models/Log';

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit    = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? 50)));
  const level    = searchParams.get('level')?.trim()    ?? '';
  const category = searchParams.get('category')?.trim() ?? '';

  try {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (level)    query.level    = level;
    if (category) query.category = category;

    const [total, docs] = await Promise.all([
      LogModel.countDocuments(query),
      LogModel.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      logs: docs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const result = await LogModel.deleteMany({});
    return NextResponse.json({ ok: true, deleted: result.deletedCount });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}
