'use client';

/**
 * PayHereButton
 *
 * Handles the full flow of initiating a PayHere payment:
 *   1. POST /api/payhere/hash → creates pending order + gets checkout hash
 *   2. Calls payhere.startPayment() using the hash
 *   3. On completion → redirects to /payment/success?orderId=...
 *   4. On dismissal  → resets to idle state
 *   5. On error      → shows error message
 *
 * The PayHere JS SDK is loaded via next/script (see the parent page/layout).
 * This component does NOT load the script itself — the checkout/review page does.
 */

import { useState, useCallback } from 'react';
import type { CartItem } from '@/lib/store';

/* ── PayHere global type (injected by payhere.js script) ── */
declare global {
  interface Window {
    payhere: {
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
      startPayment: (payment: Record<string, unknown>) => void;
    };
  }
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface PayHereButtonProps {
  cart: CartItem[];
  shipping: ShippingInfo;
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

type ButtonState = 'idle' | 'preparing' | 'waiting' | 'error';

export default function PayHereButton({
  cart,
  shipping,
  onSuccess,
  onCancel,
  disabled = false,
  className = '',
  label = 'Pay Now',
}: PayHereButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = useCallback(async () => {
    if (state !== 'idle') return;

    // Validate cart
    if (!cart.length) {
      setErrorMsg('Your cart is empty.');
      setState('error');
      return;
    }

    // Validate shipping
    const { firstName, lastName, email, phone, address, city, country } = shipping;
    if (!firstName || !lastName || !email || !phone || !address || !city || !country) {
      setErrorMsg('Please complete all shipping fields before paying.');
      setState('error');
      return;
    }

    setState('preparing');
    setErrorMsg('');

    try {
      // ── Step 1: Create order + get hash from server ──────────
      const res = await fetch('/api/payhere/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map((c) => ({ id: c.id, q: c.q })),
          shipping: { firstName, lastName, email, phone, address, city, country },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Server error (${res.status}). Please try again.`);
      }

      const data = await res.json();
      const {
        orderId,
        hash,
        merchantId,
        amount,
        currency,
        sandbox,
        items,
        returnUrl,
        cancelUrl,
        notifyUrl,
      } = data;

      // ── Step 2: Ensure PayHere SDK is loaded ─────────────────
      // Script loads asynchronously; wait up to 10s for window.payhere to appear.
      if (!window.payhere) {
        await new Promise<void>((resolve, reject) => {
          const deadline = Date.now() + 10000;
          const poll = setInterval(() => {
            if (window.payhere) {
              clearInterval(poll);
              resolve();
            } else if (Date.now() > deadline) {
              clearInterval(poll);
              reject(new Error('PayHere SDK did not load. Check your internet connection and refresh.'));
            }
          }, 200);
        });
      }

      setState('waiting');

      // ── Step 3: Register event handlers ──────────────────────
      window.payhere.onCompleted = function (completedOrderId: string) {
        // Note: payment may still be PENDING at this point.
        // The /payment/success page polls /api/payhere/status/[orderId] for the real status.
        onSuccess?.(completedOrderId);
        setState('idle');
      };

      window.payhere.onDismissed = function () {
        onCancel?.();
        setState('idle');
      };

      window.payhere.onError = function (error: string) {
        setErrorMsg(`PayHere error: ${error}`);
        setState('error');
      };

      // ── Step 4: Start payment popup ───────────────────────────
      window.payhere.startPayment({
        sandbox,
        merchant_id: merchantId,
        return_url: returnUrl,
        cancel_url:  cancelUrl,
        notify_url:  notifyUrl,
        order_id:    orderId,
        items,
        amount,
        currency,
        hash,
        first_name:  firstName,
        last_name:   lastName,
        email,
        phone,
        address,
        city,
        country,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
      setState('error');
    }
  }, [state, cart, shipping, onSuccess, onCancel]);

  const isDisabled = disabled || state === 'preparing' || state === 'waiting';

  const buttonLabel =
    state === 'preparing' ? 'Preparing Payment…' :
    state === 'waiting'   ? 'Complete in PayHere window…' :
    label;

  return (
    <div className="payhere-btn-wrap">
      <button
        type="button"
        onClick={handlePay}
        disabled={isDisabled}
        aria-busy={state === 'preparing' || state === 'waiting'}
        aria-label={buttonLabel}
        className={`btn btn-primary btn-lg btn-block${isDisabled ? ' btn--loading' : ''} ${className}`.trim()}
        style={{ borderRadius: '12px', position: 'relative' }}
      >
        {(state === 'preparing' || state === 'waiting') && (
          <span
            className="auth-spinner"
            style={{
              width: '16px',
              height: '16px',
              borderWidth: '2px',
              marginRight: '8px',
              display: 'inline-block',
              verticalAlign: 'middle',
            }}
          />
        )}
        <span style={{ verticalAlign: 'middle' }}>{buttonLabel}</span>
      </button>

      {state === 'error' && errorMsg && (
        <p
          role="alert"
          style={{
            color: 'var(--danger)',
            fontSize: '13px',
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          {errorMsg}{' '}
          <button
            type="button"
            onClick={() => { setState('idle'); setErrorMsg(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--blue)',
              cursor: 'pointer',
              fontSize: '13px',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Try again
          </button>
        </p>
      )}

      <p
        style={{
          fontSize: '11.5px',
          color: 'var(--muted)',
          textAlign: 'center',
          marginTop: '8px',
        }}
      >
        🔒 Payments secured by{' '}
        <span style={{ fontWeight: 600 }}>PayHere</span>
      </p>
    </div>
  );
}
