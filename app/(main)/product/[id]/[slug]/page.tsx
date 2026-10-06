import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fmt, slugify } from '@/lib/data';
import ProductView from '@/app/components/views/ProductView';
import { getTopProductPaths, getProductById, getAllProducts } from '@/lib/db/products';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

/**
 * ISR: pages not pre-built are rendered on first visit and cached for 1 hour.
 * This prevents pre-rendering all 700+ products at build time (ENOSPC on Vercel).
 */
export const dynamicParams = true;
export const revalidate    = 3600; // 1 hour

/**
 * Only pre-render the top 30 products at build time (featured + highest-reviewed).
 * All other /product/[id]/[slug] URLs are rendered on first request and cached via ISR.
 */
export async function generateStaticParams() {
  return getTopProductPaths(30);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }  = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: 'Product Not Found' };

  const price      = fmt(product.price);
  const stockLabel = product.stock === 'in' ? 'In Stock' : product.stock === 'low' ? 'Low Stock' : 'Out of Stock';
  const specValues = Object.values(product.specs).slice(0, 3).join(', ');
  const firstSpec  = Object.values(product.specs)[0] ?? product.category;

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
  const { id }    = await params;
  const productId = Number(id);

  // Both queries run in parallel. getAllProducts() is React.cache'd so if
  // generateMetadata already called getProductById this render, it's free.
  const [product, allProducts] = await Promise.all([
    getProductById(productId),
    getAllProducts(),
  ]);

  if (!product) notFound();

  return <ProductView product={product} allProducts={allProducts} />;
}

// Suppress unused import warning — slugify is used by paths / admin utilities
void slugify;
