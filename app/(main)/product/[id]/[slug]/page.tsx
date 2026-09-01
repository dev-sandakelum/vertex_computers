import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, fmt, slugify } from '@/lib/data';
import ProductView from '@/app/components/views/ProductView';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: String(p.id),
    slug: slugify(p.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === Number(id));
  if (!product) return { title: 'Product Not Found' };

  const price = fmt(product.price);
  const stockLabel = product.stock === 'in' ? 'In Stock' : product.stock === 'low' ? 'Low Stock' : 'Out of Stock';
  const specValues = Object.values(product.specs).slice(0, 3).join(', ');
  const firstSpec = Object.values(product.specs)[0] ?? product.category;

  return {
    title: product.name,
    description: `${product.name} — ${specValues}. ${price}. ${stockLabel}. Free shipping over $99. 2-year warranty.`,
    openGraph: {
      title: product.name,
      description: `${price} · ${firstSpec} · ${stockLabel}`,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) notFound();

  return <ProductView productId={productId} />;
}
