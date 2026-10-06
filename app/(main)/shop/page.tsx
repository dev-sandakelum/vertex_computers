import { Suspense } from 'react';
import type { Metadata } from 'next';
import CategoryView from '@/app/components/views/CategoryView';
import { getAllProducts } from '@/lib/db/products';

export const metadata: Metadata = {
  title: 'Shop PC Components',
  description: 'Browse GPUs, CPUs, RAM, SSDs, PSUs, cases and more. Filter by brand, spec, and price.',
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }} className="muted">Loading products…</div>}>
      <CategoryView products={products} />
    </Suspense>
  );
}
