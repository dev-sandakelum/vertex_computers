/**
 * GET  /api/admin/products?page=1&limit=20&search=rtx
 * POST  /api/admin/products  — create a new product (id/slug/icon auto-assigned)
 * PATCH /api/admin/products  — update stock/price by product id
 * Requires admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import ProductModel from '@/lib/models/Product';
import { toImageUrl, slugify, CATS, STOCK_MAP, type StockLevel } from '@/lib/data';
import { log } from '@/lib/logger';

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') return null;
  return session;
}

/* ── Create ─────────────────────────────────────────────────────── */

const VALID_CATEGORIES = CATS.map((c) => c.n);
const ICON_BY_CATEGORY: Record<string, string> = Object.fromEntries(CATS.map((c) => [c.n, c.ic]));

/**
 * Product images are rendered with next/image, which only accepts hosts
 * listed in next.config.ts. Accept the product-images CDN path form, that
 * CDN's raw URL, or a path under /public.
 */
const IMAGE_CDN_PREFIX = 'https://raw.githubusercontent.com/dev-sandakelum/product-images-for-vertex-computers/';
function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith('/product-images/')) return true;
  if (url.startsWith(IMAGE_CDN_PREFIX)) return true;
  if (url.startsWith('/') && !url.startsWith('//')) return true; // local /public asset
  return false;
}

interface CreateProductBody {
  name?: unknown; brand?: unknown; category?: unknown; price?: unknown; oldPrice?: unknown;
  stock?: unknown; stockCount?: unknown; sku?: unknown; partNumber?: unknown;
  shortDescription?: unknown; imageUrl?: unknown; highlights?: unknown; specs?: unknown; tags?: unknown;
}

function str(v: unknown): string { return typeof v === 'string' ? v.trim() : ''; }
function num(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: CreateProductBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // ── Validate ──
  const name             = str(body.name);
  const brand            = str(body.brand);
  const category         = str(body.category);
  const shortDescription = str(body.shortDescription);
  const stock            = str(body.stock) || 'in';
  const imageUrl         = str(body.imageUrl);
  const price            = num(body.price);
  const oldPrice         = num(body.oldPrice);
  const stockCount       = num(body.stockCount);

  const errors: string[] = [];
  if (!name || name.length > 120)                 errors.push('Name is required (max 120 characters).');
  if (!brand || brand.length > 60)                errors.push('Brand is required (max 60 characters).');
  if (!VALID_CATEGORIES.includes(category))       errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  if (price === null || Number.isNaN(price) || price < 0.01) errors.push('Price must be a number of at least 0.01.');
  if (oldPrice !== null && (Number.isNaN(oldPrice) || (price !== null && oldPrice <= price))) errors.push('Old price must be greater than the price (or left empty).');
  if (!['in', 'low', 'out'].includes(stock))      errors.push('Stock must be "in", "low" or "out".');
  if (stockCount !== null && (Number.isNaN(stockCount) || stockCount < 0 || !Number.isInteger(stockCount))) errors.push('Stock count must be a whole number of 0 or more.');
  if (shortDescription.length < 10 || shortDescription.length > 300) errors.push('Short description must be 10–300 characters.');
  if (imageUrl && !isAllowedImageUrl(imageUrl))  errors.push('Image must be a /product-images/... path, a raw.githubusercontent.com URL from the product-images repo, or a /public path.');

  const highlights = Array.isArray(body.highlights) ? body.highlights.map(str).filter(Boolean).slice(0, 8) : [];
  const tags       = Array.isArray(body.tags)       ? body.tags.map(str).filter(Boolean).slice(0, 5)       : [];
  const specs: Record<string, string> = {};
  if (body.specs && typeof body.specs === 'object' && !Array.isArray(body.specs)) {
    for (const [k, v] of Object.entries(body.specs as Record<string, unknown>)) {
      const key = k.trim().slice(0, 60); const val = str(v).slice(0, 120);
      if (key && val) specs[key] = val;
      if (Object.keys(specs).length >= 30) break;
    }
  }

  if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

  try {
    await connectDB();

    const now           = new Date().toISOString();
    const categorySlug  = category.toLowerCase().replace(/\s+/g, '-');
    const [badge, stockLabel] = STOCK_MAP[stock as StockLevel];
    void badge;

    // Assign the next free numeric id. The unique index on `id` guards the
    // race where two admins add at the same moment — retry a couple of times.
    let created: { id: number } | null = null;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      const top    = await ProductModel.findOne({ id: { $type: 'number' } }, { id: 1 }).sort({ id: -1 }).lean();
      const nextId = ((top?.id as number | undefined) ?? 0) + 1;
      const sku    = str(body.sku) || `${brand.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase().padEnd(2, 'X')}-${String(nextId).padStart(4, '0')}`;

      const doc = {
        id:               nextId,
        brand,
        name,
        slug:             slugify(name) || `product-${nextId}`,
        category,
        categorySlug,
        icon:             ICON_BY_CATEGORY[category] ?? 'i-gpu',
        price:            Math.round(price! * 100) / 100,
        oldPrice:         oldPrice !== null ? Math.round(oldPrice * 100) / 100 : null,
        currency:         'USD',
        savings:          oldPrice !== null ? Math.round((oldPrice - price!) * 100) / 100 : null,
        savingsPercent:   oldPrice !== null ? Math.round(((oldPrice - price!) / oldPrice) * 100) : null,
        stock,
        stockLabel,
        stockCount:       stockCount ?? (stock === 'out' ? 0 : stock === 'low' ? 5 : 50),
        rating:           '0.0',
        reviewCount:      0,
        sku,
        upc:              '',
        partNumber:       str(body.partNumber) || name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60),
        shortDescription,
        images:           imageUrl ? [{ id: 1, url: imageUrl, alt: name, primary: true }] : [],
        specs,
        tags,
        badges:           [],
        highlights,
        bundledItems:     [],
        shipping:         { freeShipping: true, freeShippingThreshold: 99, estimatedDelivery: '2–4 business days', expedited: { available: false, label: '', price: 0 } },
        warranty:         { duration: '1 year', type: 'Limited manufacturer warranty', extendable: false, extensionOptions: [] },
        returns:          { window: 30, windowUnit: 'days', condition: 'Unopened or defective items only', freeReturns: true },
        compatibility:    { notes: '', testedBoards: [] },
        reviews:          { average: 0, total: 0, distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }, featured: [] },
        relatedProductIds:    [],
        frequentlyBoughtWith: [],
        metadata:         { createdAt: now, updatedAt: now, publishedAt: now, visible: true, featured: false },
      };

      try {
        const saved = await ProductModel.create(doc);
        created = { id: saved.id };
      } catch (e) {
        lastErr = e;
        const isDup = typeof e === 'object' && e !== null && (e as { code?: number }).code === 11000;
        if (!isDup) throw e;
      }
    }

    if (!created) throw lastErr ?? new Error('Could not allocate a product id.');

    await log({ level: 'success', category: 'admin', message: `Product added: #${created.id} ${name}`, meta: { id: created.id, by: session.email } });

    return NextResponse.json({ ok: true, id: created.id, slug: slugify(name) }, { status: 201 });
  } catch (err) {
    console.error('[admin/products:POST]', err);
    return NextResponse.json({ error: 'Could not create the product.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
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
