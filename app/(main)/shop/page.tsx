import { Suspense } from 'react';
import type { Metadata } from 'next';
import CategoryView from '@/app/components/views/CategoryView';
import { CategoryPageSkeleton } from '@/app/components/ui/Skeleton';
import { getAllProducts } from '@/lib/db/products';
import { BATCH_SIZE, computeFacets, parseCatalogQuery, queryProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Shop PC Components',
  description: 'Browse GPUs, CPUs, RAM, SSDs, PSUs, cases and more. Filter by brand, spec, and price.',
};

interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * SERVER COMPONENT — fetches and renders the FIRST batch (12 products) for
 * SEO and fast first paint; later batches stream in client-side via
 * <ProductGrid /> + GET /api/products. Fetching happens INSIDE the Suspense
 * boundary so the skeleton streams while the catalog (MongoDB or JSON
 * fallback) resolves.
 */
async function ShopProducts({ searchParams }: Props) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const query = parseCatalogQuery(get);

  const all = await getAllProducts();
  const { items, total } = queryProducts(all, query);
  const facets = computeFacets(all, undefined);

  return (
    <CategoryView
      query={query}
      initialProducts={items.slice(0, BATCH_SIZE)}
      total={total}
      facets={facets}
    />
  );
}

export default function ShopPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <ShopProducts searchParams={searchParams} />
    </Suspense>
  );
}
