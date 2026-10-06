/**
 * GET  /api/admin/push-logs  — count check
 * POST /api/admin/push-logs  — seed one log entry by index
 *
 * Seeds initial system/activity log entries into MongoDB.
 * Body: { index: number, mode: "upsert" | "reset" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LogModel from '@/lib/models/Log';

const ADMIN_SECRET = process.env.ADMIN_PUSH_SECRET;

function auth(req: NextRequest): boolean {
  return !!ADMIN_SECRET && req.headers.get('x-admin-secret') === ADMIN_SECRET;
}

const SEED_LOGS = [
  {
    level:     'info',
    category:  'system',
    message:   'Database initialized via admin push dashboard.',
    meta:      { source: 'admin/push' },
    timestamp: new Date().toISOString(),
  },
  {
    level:     'info',
    category:  'system',
    message:   'Product catalogue seeded from lib/products.json.',
    meta:      { source: 'admin/push' },
    timestamp: new Date().toISOString(),
  },
  {
    level:     'info',
    category:  'auth',
    message:   'Demo user seed completed.',
    meta:      { email: 'name@example.com' },
    timestamp: new Date().toISOString(),
  },
  {
    level:     'info',
    category:  'payment',
    message:   'PayHere sandbox integration active.',
    meta:      { sandbox: true },
    timestamp: new Date().toISOString(),
  },
  {
    level:     'warn',
    category:  'system',
    message:   'Admin push dashboard is active — disable before production deploy.',
    meta:      { route: '/admin/push' },
    timestamp: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    await connectDB();
    const dbCount    = await LogModel.countDocuments();
    const localCount = SEED_LOGS.length;
    return NextResponse.json({ dbCount, localCount });
  } catch (err) {
    return NextResponse.json(
      { error: 'DB check failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let index = 0;
  let mode: 'upsert' | 'reset' = 'upsert';
  try {
    const body = await req.json();
    index = typeof body?.index === 'number' ? body.index : 0;
    if (body?.mode === 'reset') mode = 'reset';
  } catch { /* default */ }

  const total = SEED_LOGS.length;
  if (index < 0 || index >= total) {
    return NextResponse.json({ error: `Index ${index} out of range.` }, { status: 400 });
  }

  try {
    await connectDB();

    if (mode === 'reset' && index === 0) {
      await LogModel.deleteMany({});
    }

    const doc = { ...SEED_LOGS[index], timestamp: new Date().toISOString() };
    await LogModel.create(doc);

    return NextResponse.json({
      ok:       true,
      index,
      total,
      category: doc.category,
      message:  doc.message,
      done:     index === total - 1,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Push failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
