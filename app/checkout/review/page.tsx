import type { Metadata } from 'next';
import { CheckoutReviewView } from '@/app/components/views/CheckoutViews';

export const metadata: Metadata = {
  title: 'Review Order — Checkout',
  description: 'Review your order details and payment before placing.',
};

export default function ReviewPage() {
  return <CheckoutReviewView />;
}
