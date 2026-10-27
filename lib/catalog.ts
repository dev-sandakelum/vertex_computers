/**
 * Catalog query engine — the single source of truth for filtering, sorting
 * and batching the product catalog.
 *
 * Shared by THREE call sites so they can never drift apart:
 *   1. `app/(main)/shop/page.tsx`            (Server Component → first batch)
 *   2. `app/(main)/shop/[category]/page.tsx` (Server Component → first batch)
 *   3. `app/api/products/route.ts`           (Route Handler   → later batches)
 *
 * Pure functions over a `Product[]` — no I/O, no React, no server-only APIs,
 * so the module is safe to import anywhere (the `Product` import is
 * type-only, which is erased at compile time and pulls zero catalog data
 * into client bundles).
 *
 * PAGING MODEL — offset-based, deliberately:
 * The data layer is a static catalog (products.json / read-mostly Mongo)
 * with deterministic sort comparators and no concurrent writes during a
 * browsing session, so stable "keyset" cursors buy nothing here. Offsets
 * are trivially resumable after an error (retry from the same offset) and
 * map 1:1 onto the URL (shareable). If the catalog mutates mid-session
 * (admin push), a window can shift — client-side dedupe by `id` prevents
 * duplicates and a rare skip is an acceptable trade-off for this store.
 */

import type { Product } from '@/lib/data';

/* ── Types ─────────────────────────────────────────────────── */

export type SortKey = 'pop' | 'lo' | 'hi' | 'new' | 'rating';

export const SORT_KEYS: readonly SortKey[] = ['pop', 'lo', 'hi', 'new', 'rating'] as const;

/** Everything needed to reproduce one exact grid of products. */
export interface CatalogQuery {
  /** Category display name (e.g. "GPUs") — set by the [category] route, never a URL param. */
  category: string | undefined;
  /** Free-text search (`?q=`). */
  q: string;
  /** Tag filter (`?tag=`, e.g. "deal"). */
  tag: string;
  /** Brand names (`?brands=ASUS,MSI`). */
  brands: string[];
  /** Category names — only used on /shop, where no category is active (`?cats=GPUs,RAM`). */
  cats: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: SortKey;
}

/** Sidebar facet counts, computed server-side. */
export interface CatalogFacets {
  /** Brands visible in the current scope (category-aware), count > 0, sorted. */
  brands: { name: string; count: number }[];
  /** All categories with global counts, sorted — powers the /shop sidebar. */
  categories: { name: string; count: number }[];
}

const DEFAULT_QUERY: CatalogQuery = {
  category: undefined,
  q: '', tag: '',
  brands: [], cats: [],
  minPrice: null, maxPrice: null,
  inStockOnly: false, onSaleOnly: false,
  sort: 'pop',
};

/** Products per grid batch (server first paint AND every subsequent fetch). */
export const BATCH_SIZE = 12;

/* ── Param (de)serialization ───────────────────────────────── */

type Getter = (key: string) => string | null | undefined;

function csvToList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Parses catalog params from any key-value source:
 *  - Server pages:   `sp => (Array.isArray(sp[k]) ? sp[k][0] : sp[k])`
 *  - Route handler:  `k => req.nextUrl.searchParams.get(k)`
 * Invalid values fall back to defaults — never throw — so a malformed URL
 * still renders the page.
 */
export function parseCatalogQuery(get: Getter): CatalogQuery {
  const rawSort = get('sort');
  const min = get('min');
  const max = get('max');
  const minPrice = min != null && min !== '' && !Number.isNaN(Number.parseFloat(min)) ? Number.parseFloat(min) : null;
  const maxPrice = max != null && max !== '' && !Number.isNaN(Number.parseFloat(max)) ? Number.parseFloat(max) : null;
  return {
    ...DEFAULT_QUERY,
    category: get('category') ?? undefined,
    q: (get('q') ?? '').slice(0, 120),
    tag: (get('tag') ?? '').slice(0, 60),
    brands: csvToList(get('brands')),
    cats: csvToList(get('cats')),
    minPrice,
    maxPrice,
    inStockOnly: get('stock') === '1',
    onSaleOnly: get('sale') === '1',
    sort: SORT_KEYS.includes(rawSort as SortKey) ? (rawSort as SortKey) : 'pop',
  };
}

/**
 * Serializes a query to URL params — the canonical string used BOTH as the
 * ProductGrid fetch query (offset/limit are appended separately) and as the
 * component key / sessionStorage identity, so "same string" === "same list".
 * Default values are omitted → clean, shareable URLs.
 */
export function catalogQueryToSearchParams(query: CatalogQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (query.category) p.set('category', query.category);
  if (query.q) p.set('q', query.q);
  if (query.tag) p.set('tag', query.tag);
  if (query.brands.length) p.set('brands', query.brands.join(','));
  if (query.cats.length) p.set('cats', query.cats.join(','));
  if (query.minPrice != null) p.set('min', String(query.minPrice));
  if (query.maxPrice != null) p.set('max', String(query.maxPrice));
  if (query.inStockOnly) p.set('stock', '1');
  if (query.onSaleOnly) p.set('sale', '1');
  if (query.sort !== 'pop') p.set('sort', query.sort);
  return p;
}

/* ── Filter + sort (same semantics as the old client-side code) ── */

export function filterProducts(all: Product[], query: CatalogQuery): Product[] {
  let r = all;
  if (query.category) r = r.filter(p => p.category === query.category);
  else if (query.cats.length > 0) r = r.filter(p => query.cats.includes(p.category));
  if (query.brands.length > 0) r = r.filter(p => query.brands.includes(p.brand));
  if (query.minPrice != null) { const min = query.minPrice; r = r.filter(p => p.price >= min); }
  if (query.maxPrice != null) { const max = query.maxPrice; r = r.filter(p => p.price <= max); }
  if (query.inStockOnly) r = r.filter(p => p.stock !== 'out');
  if (query.onSaleOnly) r = r.filter(p => p.oldPrice !== null && p.oldPrice > p.price);
  if (query.tag) {
    const tag = query.tag.toLowerCase();
    r = r.filter(p => p.tags?.some(t => t.toLowerCase().includes(tag)));
  }
  if (query.q.trim()) {
    const q = query.q.trim().toLowerCase();
    r = r.filter(p => {
      const specValues = Object.values(p.specs ?? {}).join(' ').toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) || specValues.includes(q) ||
        p.shortDescription?.toLowerCase().includes(q);
    });
  }
  return r;
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const a = [...list];
  switch (sort) {
    case 'lo':     return a.sort((x, y) => x.price - y.price);
    case 'hi':     return a.sort((x, y) => y.price - x.price);
    case 'new':    return a.sort((x, y) => y.id - x.id);
    case 'rating': return a.sort((x, y) => Number.parseFloat(y.rating) - Number.parseFloat(x.rating));
    default:       return a.sort((x, y) => y.reviewCount - x.reviewCount);
  }
}

/** Filter + sort in one shot. `items` is the full ordered result; slice batches off it. */
export function queryProducts(all: Product[], query: CatalogQuery): { items: Product[]; total: number } {
  const items = sortProducts(filterProducts(all, query), query.sort);
  return { items, total: items.length };
}

/* ── Facets for the filter sidebar ─────────────────────────── */

/**
 * Brand counts are scoped to the active category (same behaviour as the old
 * client-side sidebar): on /shop/gpus you only see brands that exist in GPUs.
 * Category counts are always global (they navigate between categories).
 */
export function computeFacets(all: Product[], activeCategory: string | undefined): CatalogFacets {
  const scoped = activeCategory ? all.filter(p => p.category === activeCategory) : all;

  const brandCounts = new Map<string, number>();
  for (const p of scoped) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);

  const catCounts = new Map<string, number>();
  for (const p of all) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);

  return {
    brands: [...brandCounts.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count })),
    categories: [...catCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count })),
  };
}
