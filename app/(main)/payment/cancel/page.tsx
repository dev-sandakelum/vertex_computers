import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Cancelled — Vertex Computers',
  description: 'Your payment was cancelled.',
};

export default function PaymentCancelPage() {
  return (
    <div className="container" style={{ maxWidth: '520px', paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
      <div className="card co-panel" style={{ padding: '36px 28px' }}>

        <div style={{ fontSize: '48px', marginBottom: '12px' }}>↩️</div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
          Payment Cancelled
        </h1>

        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          You cancelled the payment. No charge was made.
          Your cart has been saved — you can pick up right where you left off.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/checkout/review" className="btn btn-primary btn-block" style={{ borderRadius: '12px' }}>
            Return to Checkout
          </Link>
          <Link href="/cart" className="btn btn-secondary btn-block" style={{ borderRadius: '12px' }}>
            View Cart
          </Link>
          <Link href="/shop" className="btn btn-ghost btn-block" style={{ borderRadius: '12px' }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
