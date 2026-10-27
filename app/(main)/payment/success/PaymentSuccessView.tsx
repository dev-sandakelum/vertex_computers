'use client';

/**
 * PaymentSuccessView — shown after PayHere redirects the user back.
 *
 * IMPORTANT: This page polls /api/payhere/status/[orderId] for the REAL
 * payment status. It never trusts URL params to show "Payment Successful".
 *
 * When the order is PAID, a premium ticket-style receipt is shown
 * (see ReceiptTicket) rendered entirely from real order data.
 *
 * The page also clears the cart on confirmed PAID status.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { saveOrderLocally } from '@/lib/orderStorage';
import { fmt } from '@/lib/data';
import ReceiptTicket, { type ReceiptOrder } from '@/app/components/payment/ReceiptTicket';
import {
  RefreshIcon, CloseIcon, SignOutIcon, PackageXIcon,
} from '@/app/components/icons';

type ServerStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

interface OrderData extends ReceiptOrder {
  status: ServerStatus;
}

const MAX_POLLS = 12;       // poll up to 12 times
const POLL_INTERVAL = 3000; // every 3 seconds

export default function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart, showToast } = useApp();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payhere/status/${orderId}`);
      if (res.status === 404) {
        setError('Order not found. It may still be processing — please check your email.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data: OrderData = await res.json();
      setOrder(data);

      // Save to localStorage for local order history
      saveOrderLocally({
        orderId: data.orderId,
        total: data.total,
        currency: data.currency,
        status: data.status,
        createdAt: data.updatedAt,
        itemCount: data.itemCount,
      });

      if (data.status === 'PAID') {
        clearCart();
        showToast('Payment confirmed! 🎉 Your order is placed.');
        setLoading(false);
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setLoading(false);
      } else {
        // PENDING — keep polling
        setLoading(false);
      }
    } catch {
      setError('Could not retrieve payment status. Please refresh or check your email.');
      setLoading(false);
    }
  }, [orderId, clearCart, showToast]);

  /* ── Render ── */

  /* Missing orderId is knowable at render time — but the early return must
     sit BELOW all hooks (Rules of Hooks), so it lives after the effects. */

  // Initial fetch — async polling of the payment status API; setState only
  // runs after the fetch resolves, which is the intended data-fetch pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount; setState runs after await
    if (orderId) fetchStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while PENDING
  useEffect(() => {
    if (!order || order.status !== 'PENDING' || pollCount >= MAX_POLLS) return;

    const timer = setTimeout(async () => {
      setPollCount((c) => c + 1);
      await fetchStatus();
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [order, pollCount, fetchStatus]);

  /* ── Render ── */

  if (!orderId) {
    return (
      <div className="container" style={{ maxWidth: '520px', paddingTop: '60px', textAlign: 'center' }}>
        <div className="card co-panel" style={{ padding: '32px' }}>
          <PackageXIcon size={44} style={{ margin: '0 auto 12px', color: 'var(--red)', display: 'block' }} />
          <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>No Order ID</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            No order ID found in the URL. If you just paid, check your email for the receipt link.
          </p>
          <Link href="/" className="btn btn-primary btn-block" style={{ borderRadius: '12px' }}>Back to Home</Link>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <span className="auth-spinner" style={{ display: 'inline-block', width: '32px', height: '32px', borderWidth: '3px' }} />
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Checking payment status…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '520px', paddingTop: '60px', textAlign: 'center' }}>
        <div className="card co-panel" style={{ padding: '32px' }}>
          <PackageXIcon size={44} style={{ margin: '0 auto 12px', color: 'var(--red)', display: 'block' }} />
          <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>Status Unavailable</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>{error}</p>
          <Link href="/" className="btn btn-primary btn-block" style={{ borderRadius: '12px' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isPaid       = order.status === 'PAID';
  const isFailed     = order.status === 'FAILED';
  const isCancelled  = order.status === 'CANCELLED';
  const isPending    = order.status === 'PENDING';

  /* ── PAID: the premium ticket receipt (all real order data) ── */
  if (isPaid) {
    return (
      <>
        <ReceiptTicket order={order} />
        <div className="container receipt-followup">
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/account" className="btn btn-secondary">View Order Details</Link>
            <Link href="/shop" className="btn btn-ghost">Continue Shopping</Link>
          </div>
        </div>
      </>
    );
  }

  /* ── Non-paid statuses ── */
  return (
    <div className="container" style={{ maxWidth: '560px', paddingTop: '40px', paddingBottom: '40px' }}>

      {/* Status header */}
      <div className="confirm-hero" style={{ marginBottom: '20px' }}>
        {isPending && (
          <>
            <div className="check-ring" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }} aria-hidden="true">
              <RefreshIcon size={32} />
            </div>
            <h1>Payment Pending</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Your payment is being processed. This page updates automatically.
            </p>
            {pollCount < MAX_POLLS && (
              <span className="auth-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', borderWidth: '2px', marginTop: '10px' }} />
            )}
          </>
        )}

        {isFailed && (
          <>
            <div className="check-ring" style={{ background: 'var(--danger-soft)', color: 'var(--red)' }} aria-hidden="true">
              <CloseIcon size={32} />
            </div>
            <h1>Payment Failed</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Your payment could not be processed.
            </p>
          </>
        )}

        {isCancelled && (
          <>
            <div className="check-ring" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }} aria-hidden="true">
              <SignOutIcon size={32} />
            </div>
            <h1>Payment Cancelled</h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Your payment was cancelled. Nothing was charged.
            </p>
          </>
        )}
      </div>

      {/* Order details */}
      <div className="card co-panel" style={{ marginBottom: '14px' }}>
        <div className="sumrow">
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Order ID</span>
          <span className="order-num" style={{ fontSize: '12px' }}>{order.orderId}</span>
        </div>
        <div className="sumrow">
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Items</span>
          <span style={{ fontSize: '13px' }}>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="sumrow">
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Amount</span>
          <span style={{ fontFamily: 'var(--fm)', fontWeight: 700 }}>{fmt(order.total)}</span>
        </div>
        <div className="sumrow">
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Status</span>
          <span>
            <span
              className={`badge ${
                isPending   ? 'badge-warning'  :
                'badge-danger'
              }`}
            >
              {order.status}
            </span>
          </span>
        </div>
        {order.paymentMethod && (
          <div className="sumrow">
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Method</span>
            <span style={{ fontSize: '13px' }}>{order.paymentMethod}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(isFailed || isCancelled) && (
          <>
            <Link href="/checkout/review" className="btn btn-primary btn-block" style={{ borderRadius: '12px' }}>
              Try Again
            </Link>
            <Link href="/cart" className="btn btn-secondary btn-block" style={{ borderRadius: '12px' }}>
              Back to Cart
            </Link>
          </>
        )}

        {isPending && (
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ borderRadius: '12px' }}
            onClick={fetchStatus}
          >
            <RefreshIcon size={15} />
            Refresh Status
          </button>
        )}

        <Link href="/" className="btn btn-ghost btn-block" style={{ borderRadius: '12px' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
