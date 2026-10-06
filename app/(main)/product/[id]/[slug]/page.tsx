import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fmt, slugify } from '@/lib/data';
import ProductView from '@/app/components/views/ProductView';
import { getAllProductPaths, getProductById, getAllProducts } from '@/lib/db/products';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllProductPaths();
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
  const [product, allProducts] = await Promise.all([
    getProductById(productId),
    getAllProducts(),
  ]);

  if (!product) notFound();

  return <ProductView product={product} allProducts={allProducts} />;
}

// Suppress unused import warning — slugify is used by generateStaticParams via getAllProductPaths
void slugify;
