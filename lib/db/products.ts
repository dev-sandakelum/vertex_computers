/**
 * Server-side product queries — MongoDB Atlas with local JSON fallback.
 *
 * When MONGODB_URI is set, all queries hit the DB.
 * Without it (or on error), falls back to the local products.json
 * so local dev works without any DB setup.
 *
 * ALL functions here are async and server-only (no 'use client').
 * Import them only in Server Components, API routes, or generateStaticParams.
 *
 * Performance notes:
 *  - getAllProducts() is wrapped in React.cache so within a single render pass
 *    it only runs once, no matter how many Server Components call it.
 *  - getTopProductPaths() fetches only id+slug (projection) for up to 30
 *    products, keeping generateStaticParams fast and disk-safe on Vercel.
 *  - getProductById() queries by the numeric `id` field (indexed) instead of
 *    fetching all products and filtering in JS.
 */

import { cache } from 'react';
import type { Product } from '@/lib/data';

/* ── Local JSON fallback ─────────────────────────────────── */
import rawProducts from '@/lib/products.json';
const LOCAL: Product[] = rawProducts as unknown as Product[];

function toProduct(doc: Record<string, unknown>): Product {
  // Serialize through JSON to strip all Mongoose internals (_id, __v, toJSON, Buffer, etc.)
  return JSON.parse(JSON.stringify(doc)) as Product;
}

/* ── Helpers ─────────────────────────────────────────────── */

async function dbConnect() {
  const { connectDB } = await import('@/lib/mongodb');
  const { default: Model } = await import('@/lib/models/Product');
  await connectDB();
  return Model;
}

/* ── Core getter (React.cache — deduped per render pass) ─── */

/**
 * All products.
 * Cached with React.cache so repeated calls in the same render tree
 * (e.g. ProductView fetching related products) share one DB query.
 */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  if (!process.env.MONGODB_URI) return LOCAL;
  try {
    const Model = await dbConnect();
    const docs = await Model.find({}).lean();
    return docs.map((d) => toProduct(d as Record<string, unknown>));
  } catch (e) {
    console.warn('[db/products] falling back to local JSON:', e);
    return LOCAL;
  }
});

/* ── Public API ──────────────────────────────────────────── */

/** Single product by numeric id — queries by indexed field, not full scan. */
export async function getProductById(id: number): Promise<Product | undefined> {
  if (!process.env.MONGODB_URI) return LOCAL.find((p) => p.id === id);
  try {
    const Model = await dbConnect();
    // Only select fields needed for the page — avoids transferring reviews, etc.
    // Remove the projection if your ProductView needs all fields.
    const doc = await Model.findOne({ id }).lean();
    return doc ? toProduct(doc as Record<string, unknown>) : undefined;
  } catch {
    return LOCAL.find((p) => p.id === id);
  }
}

/** Products filtered by category name (e.g. "GPUs"). */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!process.env.MONGODB_URI) return LOCAL.filter((p) => p.category === category);
  try {
    const Model = await dbConnect();
    const docs = await Model.find({ category }).lean();
    return docs.map((d) => toProduct(d as Record<string, unknown>));
  } catch {
    return LOCAL.filter((p) => p.category === category);
  }
}

/**
 * Top N product paths for generateStaticParams.
 *
 * Only fetches id + slug (projection) and limits to `limit` documents
 * so the build worker doesn't pre-render hundreds of pages.
 * The rest will be rendered on first visit and cached via ISR (revalidate).
 *
 * Default: top 30 by whichever order MongoDB returns them (insertion order).
 * To prioritise popular/featured products, add a `sort` here, e.g.:
 *   .sort({ 'metadata.featured': -1, reviewCount: -1 })
 */
export async function getTopProductPaths(
  limit = 30,
): Promise<{ id: string; slug: string }[]> {
  if (!process.env.MONGODB_URI) {
    return LOCAL
      .slice(0, limit)
      .map((p) => ({ id: String(p.id), slug: p.slug }));
  }
  try {
    const Model = await dbConnect();
    const docs = await Model.find({}, { id: 1, slug: 1, _id: 0 })
      .sort({ 'metadata.featured': -1, reviewCount: -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => ({
      id:   String((d as { id: number }).id),
      slug: (d as { slug: string }).slug,
    }));
  } catch {
    return LOCAL
      .slice(0, limit)
      .map((p) => ({ id: String(p.id), slug: p.slug }));
  }
}

/** All product paths — kept for admin/sitemap use; do NOT use in generateStaticParams. */
export async function getAllProductPaths(): Promise<{ id: string; slug: string }[]> {
  const all = await getAllProducts();
  return all.map((p) => ({ id: String(p.id), slug: p.slug }));
}

/** Total count. */
export async function getProductCount(): Promise<number> {
  if (!process.env.MONGODB_URI) return LOCAL.length;
  try {
    const Model = await dbConnect();
    return await Model.countDocuments();
  } catch {
    return LOCAL.length;
  }
}
