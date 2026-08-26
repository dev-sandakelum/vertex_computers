import type { Metadata } from 'next';
import { CheckoutConfirmView } from '@/app/components/views/CheckoutViews';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed. Thank you for shopping at Vertex Computers.',
};

export default function ConfirmPage() {
  return <CheckoutConfirmView />;
}
