/**
 * GET  /api/admin/push-products  — count check
 * POST /api/admin/push-products  — push ONE product by index
 *
 * Body: { index: number, mode: "upsert" | "reset" }
 * When index === 0 and mode === "reset", the collection is wiped first.
 * Each call upserts a single document so the client can stream progress.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import rawProducts from '@/lib/products.json';

const ADMIN_SECRET = process.env.ADMIN_PUSH_SECRET;

function auth(req: NextRequest): boolean {
  return !!ADMIN_SECRET && req.headers.get('x-admin-secret') === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    await connectDB();
    const dbCount    = await ProductModel.countDocuments();
    const localCount = (rawProducts as unknown[]).length;
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

  const products = rawProducts as Record<string, unknown>[];
  const total    = products.length;

  if (index < 0 || index >= total) {
    return NextResponse.json({ error: `Index ${index} out of range (0–${total - 1}).` }, { status: 400 });
  }

  try {
    await connectDB();

    // Wipe collection only on first document of a reset run
    if (mode === 'reset' && index === 0) {
      await ProductModel.deleteMany({});
    }

    const doc = products[index] as { id: number } & Record<string, unknown>;
    const result = await ProductModel.findOneAndUpdate(
      { id: doc.id },
      { $set: doc },
      { upsert: true, new: true },
    );

    const isNew = !result;
    return NextResponse.json({
      ok: true,
      index,
      total,
      id:     doc.id,
      name:   doc.name,
      action: isNew ? 'inserted' : 'updated',
      done:   index === total - 1,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Push failed.', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
