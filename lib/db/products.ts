/**
 * Server-side product queries — MongoDB Atlas with local JSON fallback.
 *
 * When MONGODB_URI is set, all queries hit the DB.
 * Without it (or on error), falls back to the local products.json
 * so local dev works without any DB setup.
 *
 * ALL functions here are async and server-only (no 'use client').
 * Import them only in Server Components, API routes, or generateStaticParams.
 */

import type { Product } from '@/lib/data';

/* ── Local JSON fallback ─────────────────────────────────── */
import rawProducts from '@/lib/products.json';
const LOCAL: Product[] = rawProducts as unknown as Product[];

function toProduct(doc: Record<string, unknown>): Product {
  // Serialize through JSON to strip all Mongoose internals (_id, __v, toJSON, Buffer, etc.)
  // This handles nested subdocuments that .lean() doesn't fully clean up.
  return JSON.parse(JSON.stringify(doc)) as Product;
}

/* ── Core getter ─────────────────────────────────────────── */

async function getAll(): Promise<Product[]> {
  if (!process.env.MONGODB_URI) return LOCAL;
  try {
    const { connectDB }      = await import('@/lib/mongodb');
    const { default: Model } = await import('@/lib/models/Product');
    await connectDB();
    const docs = await Model.find({}).lean();
    return docs.map((d) => toProduct(d as Record<string, unknown>));
  } catch (e) {
    console.warn('[db/products] falling back to local JSON:', e);
    return LOCAL;
  }
}

/* ── Public API ──────────────────────────────────────────── */

/** All products — use sparingly; prefer filtered queries. */
export async function getAllProducts(): Promise<Product[]> {
  return getAll();
}

/** Single product by numeric id. */
export async function getProductById(id: number): Promise<Product | undefined> {
  if (!process.env.MONGODB_URI) return LOCAL.find((p) => p.id === id);
  try {
    const { connectDB }      = await import('@/lib/mongodb');
    const { default: Model } = await import('@/lib/models/Product');
    await connectDB();
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
    const { connectDB }      = await import('@/lib/mongodb');
    const { default: Model } = await import('@/lib/models/Product');
    await connectDB();
    const docs = await Model.find({ category }).lean();
    return docs.map((d) => toProduct(d as Record<string, unknown>));
  } catch {
    return LOCAL.filter((p) => p.category === category);
  }
}

/** IDs + slugs for generateStaticParams. */
export async function getAllProductPaths(): Promise<{ id: string; slug: string }[]> {
  const all = await getAllProducts();
  return all.map((p) => ({ id: String(p.id), slug: p.slug }));
}

/** Total count. */
export async function getProductCount(): Promise<number> {
  if (!process.env.MONGODB_URI) return LOCAL.length;
  try {
    const { connectDB }      = await import('@/lib/mongodb');
    const { default: Model } = await import('@/lib/models/Product');
    await connectDB();
    return await Model.countDocuments();
  } catch {
    return LOCAL.length;
  }
}
