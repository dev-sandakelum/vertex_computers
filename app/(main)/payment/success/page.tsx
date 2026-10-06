import type { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentSuccessView from './PaymentSuccessView';

export const metadata: Metadata = {
  title: 'Payment Status — Vertex Computers',
  description: 'Your payment status for your order at Vertex Computers.',
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <span className="auth-spinner" style={{ display: 'inline-block', width: '32px', height: '32px', borderWidth: '3px' }} />
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading…</p>
      </div>
    }>
      <PaymentSuccessView />
    </Suspense>
  );
}
