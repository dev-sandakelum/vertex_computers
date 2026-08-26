import type { Metadata } from 'next';
import CartView from '@/app/components/views/CartView';

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your selected PC components before checkout.',
};

export default function CartPage() {
  return <CartView />;
}
