import type { Metadata } from 'next';
import HomeView from '@/app/components/views/HomeView';

export const metadata: Metadata = {
  title: 'Vertex Computers — PC Parts & Components',
  description: 'Premium PC components with transparent specs, honest stock levels, and expert support.',
};

export default function HomePage() {
  return <HomeView />;
}
