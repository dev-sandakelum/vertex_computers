import type { Metadata } from 'next';
import { CheckoutShippingView } from '@/app/components/views/CheckoutViews';

export const metadata: Metadata = {
  title: 'Shipping — Checkout',
  description: 'Enter your shipping address and choose a delivery method.',
};

export default function ShippingPage() {
  return <CheckoutShippingView />;
}
