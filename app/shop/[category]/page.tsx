import type { Metadata } from 'next';
import { CATEGORY_SLUGS } from '@/lib/data';
import CategoryView from '@/app/components/views/CategoryView';

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
  const name = CATEGORY_SLUGS[category] ?? category;
  return <CategoryView activeCategory={name} />;
}
