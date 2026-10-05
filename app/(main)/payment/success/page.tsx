import type { Metadata } from 'next';
import PaymentSuccessView from './PaymentSuccessView';

export const metadata: Metadata = {
  title: 'Payment Status — Vertex Computers',
  description: 'Your payment status for your order at Vertex Computers.',
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
