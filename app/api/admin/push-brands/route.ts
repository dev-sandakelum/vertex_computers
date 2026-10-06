/**
 * GET  /api/admin/push-brands  — count check
 * POST /api/admin/push-brands  — push ONE brand by index
 *
 * Body: { index: number, mode: "upsert" | "reset" }
 * When index === 0 and mode === "reset", the collection is wiped first.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BrandModel from '@/lib/models/Brand';
import rawBrands from '@/lib/brands.json';

const ADMIN_SECRET = process.env.ADMIN_PUSH_SECRET;

function auth(req: NextRequest): boolean {
  return !!ADMIN_SECRET && req.headers.get('x-admin-secret') === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    await connectDB();
    const dbCount    = await BrandModel.countDocuments();
    const localCount = (rawBrands as unknown[]).length;
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

  const brands = rawBrands as Record<string, unknown>[];
  const total  = brands.length;

  if (index < 0 || index >= total) {
    return NextResponse.json({ error: `Index ${index} out of range (0–${total - 1}).` }, { status: 400 });
  }

  try {
    await connectDB();

    if (mode === 'reset' && index === 0) {
      await BrandModel.deleteMany({});
    }

    const doc = brands[index] as { id: string; name: string } & Record<string, unknown>;
    await BrandModel.findOneAndUpdate(
      { id: doc.id },
      { $set: doc },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      ok:   true,
      index,
      total,
      id:   doc.id,
      name: doc.name,
      done: index === total - 1,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Push failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
