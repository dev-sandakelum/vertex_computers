import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CATEGORY_SLUGS } from '@/lib/data';
import CategoryView from '@/app/components/views/CategoryView';
import { getAllProducts } from '@/lib/db/products';

interface Props {
  params: Promise<{ category: string }>;
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

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const name     = CATEGORY_SLUGS[category] ?? category;
  const products = await getAllProducts();
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }} className="muted">Loading products…</div>}>
      <CategoryView products={products} activeCategory={name} />
    </Suspense>
  );
}
