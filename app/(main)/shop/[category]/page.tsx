import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CATEGORY_SLUGS } from '@/lib/data';
import CategoryView from '@/app/components/views/CategoryView';
import { CategoryPageSkeleton } from '@/app/components/ui/Skeleton';
import { getAllProducts } from '@/lib/db/products';
import { BATCH_SIZE, computeFacets, parseCatalogQuery, queryProducts } from '@/lib/catalog';

interface Props {
  params: Promise<{ category: string }>;
  /** Promise is passed THROUGH the Suspense boundary and awaited inside —
      the shell streams instantly while searchParams + catalog resolve. */
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = CATEGORY_SLUGS[category] ?? category;
  return {
    title: `${name} — PC Components`,
    description: `Shop the best ${name} at Vertex Computers. Fast shipping, 2-year warranty.`,
  };
}

/**
 * SERVER COMPONENT — fetches and renders the FIRST batch (12 products) for
 * SEO and fast first paint; later batches stream in client-side via
 * <ProductGrid /> + GET /api/products. `key={name}` remounts the view per
 * category so each category page starts from a fresh batch-1 state.
 */
async function CategoryProducts({ name, searchParams }: {
  name: string;
  searchParams?: Props['searchParams'];
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const query = { ...parseCatalogQuery(get), category: name };

  const all = await getAllProducts();
  const { items, total } = queryProducts(all, query);
  const facets = computeFacets(all, name);

  return (
    <CategoryView
      key={name}
      activeCategory={name}
      query={query}
      initialProducts={items.slice(0, BATCH_SIZE)}
      total={total}
      facets={facets}
    />
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const name = CATEGORY_SLUGS[category] ?? category;
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryProducts name={name} searchParams={searchParams} />
    </Suspense>
  );
}
