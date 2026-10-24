/**
 * GET  /api/admin/products?page=1&limit=20&search=rtx
 * PATCH /api/admin/products  — update stock/price by product id
 * Requires admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import { toImageUrl } from '@/lib/data';

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit   = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const search  = searchParams.get('search')?.trim() ?? '';
  const category = searchParams.get('category')?.trim() ?? '';

  try {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (search)   query.$text = { $search: search };
    if (category) query.category = category;

    const [total, docs] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query, { name: 1, brand: 1, category: 1, price: 1, stock: 1, stockCount: 1, id: 1, slug: 1, 'images': { $slice: 1 } })
        .sort(search ? { score: { $meta: 'textScore' } } : { id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const products = docs.map((d) => ({
      id:         (d as Record<string, unknown>).id,
      name:       (d as Record<string, unknown>).name,
      brand:      (d as Record<string, unknown>).brand,
      category:   (d as Record<string, unknown>).category,
      price:      (d as Record<string, unknown>).price,
      stock:      (d as Record<string, unknown>).stock,
      stockCount: (d as Record<string, unknown>).stockCount,
      slug:       (d as Record<string, unknown>).slug,
      image:      toImageUrl(((d as Record<string, unknown>).images as { url: string }[] | undefined)?.[0]?.url ?? ''),
    }));

    return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { id: number; stock?: string; price?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.stock !== undefined) update.stock = body.stock;
  if (body.price !== undefined) update.price = body.price;
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  try {
    await connectDB();
    const doc = await ProductModel.findOneAndUpdate({ id: body.id }, { $set: update }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}
