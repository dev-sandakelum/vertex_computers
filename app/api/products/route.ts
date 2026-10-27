/**
 * GET /api/products — paginated catalog batches for the infinite-scroll
 * product grid (CategoryView → ProductGrid).
 *
 * WHY A ROUTE HANDLER (not a Server Action):
 *  - Fetchable with plain `fetch()` + `AbortController` — Server Actions are
 *    POSTs whose cancellation and idempotent retry semantics are awkward.
 *  - The paging model (offset/limit as URL params) maps naturally onto a GET
 *    endpoint and can later gain CDN/`next` caching for free.
 *  - Matches the repo's existing convention (app/api/auth/*, app/api/admin/*).
 *
 * Query params (all optional):
 *   category  display name (e.g. "GPUs")      q     search text
 *   tag       tag filter (e.g. "deal")        sort  pop|lo|hi|new|rating
 *   brands    comma-separated brand names     cats  comma-separated categories
 *   min, max  price bounds                    stock=1 / sale=1  toggles
 *   offset    zero-based index into the filtered+sorted result (default 0)
 *   limit     batch size, clamped to 1..48 (default 12)
 *
 * Response: { products, total, offset, nextOffset }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/db/products';
import { BATCH_SIZE, parseCatalogQuery, queryProducts } from '@/lib/catalog';

function parseBoundedInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const query = parseCatalogQuery(k => sp.get(k));

  const offset = parseBoundedInt(sp.get('offset'), 0, 0, 100_000);
  const limit = parseBoundedInt(sp.get('limit'), BATCH_SIZE, 1, 48);

  const { items, total } = await queryProducts(await getAllProducts(), query);
  const products = items.slice(offset, offset + limit);

  return NextResponse.json(
    {
      products,
      total,
      offset,
      nextOffset: offset + products.length,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
