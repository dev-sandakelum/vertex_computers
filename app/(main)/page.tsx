import type { Metadata } from 'next';
import HomeView from '@/app/components/views/HomeView';
import { getAllProducts } from '@/lib/db/products';
import { getAllBrands }   from '@/lib/db/brands';

export const metadata: Metadata = {
  title: 'Vertex Computers — PC Parts & Components',
  description: 'Premium PC components with transparent specs, honest stock levels, and expert support.',
};

export default async function HomePage() {
  const [products, brands] = await Promise.all([getAllProducts(), getAllBrands()]);
  return <HomeView products={products} brands={brands} />;
}
