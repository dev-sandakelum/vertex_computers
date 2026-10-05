'use client';

/**
 * CheckoutViews — Shipping, Review, and Confirm steps.
 *
 * Changes from the original:
 *   - Shipping form is now controlled state, persisted to sessionStorage
 *     so the data survives navigation between steps.
 *   - Review step loads the PayHere JS SDK via a <script> tag.
 *   - "Place Order" is replaced by <PayHereButton>, which creates an order
 *     server-side and opens the PayHere Sandbox popup.
 *   - /checkout/confirm is kept as a fallback for direct navigation,
 *     but the real confirmation flow goes through /payment/success.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, fmt, productImg } from '@/lib/data';
import PayHereButton from '@/app/components/payment/PayHereButton';

const PENDING_IMG = '/pending.png';
const SHIPPING_STORAGE_KEY = 'vertex_checkout_shipping';

/* ─── Shipping state shape ────────────────────────────────── */
interface ShippingState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
}

function makeDefaultShipping(authUser?: { firstName?: string; lastName?: string; email?: string; phone?: string } | null): ShippingState {
  return {
    firstName: authUser?.firstName ?? 'John',
    lastName:  authUser?.lastName  ?? 'Doe',
    email:     authUser?.email     ?? 'name@example.com',
    phone:     authUser?.phone     ?? '+1 (555) 000-0000',
    address:   '123 Example St',
    apt:       '',
    city:      'Springfield',
    state:     'IL',
    zip:       '62704',
    country:   'United States',
    shippingMethod: 'standard',
  };
}

function loadShipping(authUser?: { firstName?: string; lastName?: string; email?: string; phone?: string } | null): ShippingState {
  if (typeof window === 'undefined') return makeDefaultShipping(authUser);
  try {
    const raw = sessionStorage.getItem(SHIPPING_STORAGE_KEY);
    if (raw) return { ...makeDefaultShipping(authUser), ...JSON.parse(raw) };
  } catch {}
  return makeDefaultShipping(authUser);
}

function saveShipping(data: ShippingState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/* ── Step indicator ── */
type S = 'on' | 'done' | 'pending';
function Steps({ s, r, c }: { s: S; r: S; c: S }) {
  const cls = (x: S) => `step${x === 'on' ? ' on' : x === 'done' ? ' done' : ''}`;
  return (
    <div className="steps" role="list" aria-label="Checkout progress">
      <div className={cls(s)} role="listitem"><span className="dot">{s === 'done' ? '✓' : '1'}</span>Shipping</div>
      <div className={cls(r)} role="listitem"><span className="dot">{r === 'done' ? '✓' : '2'}</span>Review</div>
      <div className={cls(c)} role="listitem"><span className="dot">{c === 'done' ? '✓' : '3'}</span>Done</div>
    </div>
  );
}

function MiniCart() {
  const { cart } = useApp();
  if (!cart.length) return <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No items</p>;
  return (
    <>
      {cart.map((item, i) => {
        const p = PRODUCTS.find(prod => prod.id === item.id);
        if (!p) return null;
        const img = productImg(p);
        return (
          <div key={i} className="mini-item">
            <div className="mini-img">
              {img ? (
                <img src={img} alt={p.name} style={{ width: '28px', height: '22px', objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = PENDING_IMG; }} />
              ) : (
                <svg width="24" height="20" style={{ opacity: .5 }}><use href="#i-gpu" /></svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: '12.5px', display: 'block' }}>{p.name}</b>
              <small style={{ color: 'var(--muted)' }}>Qty {item.q}</small>
            </div>
            <b style={{ fontFamily: 'var(--fm)', fontSize: '13px' }}>{fmt(p.price * item.q)}</b>
          </div>
        );
      })}
    </>
  );
}

function OrderSummaryAside() {
  const { cartSubtotal, cartTax, cartTotal } = useApp();
  return (
    <aside className="summary card">
      <h3>Order Summary</h3>
      <MiniCart />
      <div className="sumrow" style={{ marginTop: '12px' }}><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
      <div className="sumrow"><span>Shipping</span><span style={{ color: 'var(--green)', fontWeight: 600 }}>FREE</span></div>
      <div className="sumrow"><span>Est. tax</span><span>{fmt(cartTax)}</span></div>
      <div className="sumrow total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
      <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '12px', textAlign: 'center' }}>
        🔒 Payments secured by PayHere.
      </p>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════
   SHIPPING VIEW
   ════════════════════════════════════════════════════════════ */
export function CheckoutShippingView() {
  const { authUser, cart, showToast } = useApp();
  const router = useRouter();

  const [form, setForm] = useState<ShippingState>(() => makeDefaultShipping());

  // Hydrate from sessionStorage / authUser after mount
  useEffect(() => {
    setForm(loadShipping(authUser));
  }, [authUser]);

  const set = useCallback((field: keyof ShippingState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      showToast('Please fill in all required shipping fields.');
      return;
    }

    saveShipping(form);
    router.push('/checkout/review');
  }

  // Guard: empty cart
  if (typeof window !== 'undefined' && cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary" style={{ borderRadius: '10px' }}>Browse Products</Link>
      </div>
    );
  }

  const shippingCosts: Record<ShippingState['shippingMethod'], number> = {
    standard:  0,
    express:   24.90,
    overnight: 39.00,
  };

  return (
    <form onSubmit={handleContinue} noValidate>
      <div className="container">
        <Steps s="on" r="pending" c="pending" />
        <div className="checkout-layout">
          <div className="card co-panel">
            <h2>Shipping Address</h2>
            <div className="field-row">
              <div className="field">
                <label htmlFor="fn">First name</label>
                <input id="fn" value={form.firstName} onChange={e => set('firstName', e.target.value)} autoComplete="given-name" required />
              </div>
              <div className="field">
                <label htmlFor="ln">Last name</label>
                <input id="ln" value={form.lastName} onChange={e => set('lastName', e.target.value)} autoComplete="family-name" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="em">Email</label>
              <input id="em" type="email" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="ph">Phone</label>
              <input id="ph" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="field">
              <label htmlFor="ad">Street address</label>
              <input id="ad" value={form.address} onChange={e => set('address', e.target.value)} autoComplete="street-address" required />
            </div>
            <div className="field">
              <label htmlFor="ad2">
                Apt / suite <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
              </label>
              <input id="ad2" value={form.apt} onChange={e => set('apt', e.target.value)} placeholder="Apt 4B" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="ct">City</label>
                <input id="ct" value={form.city} onChange={e => set('city', e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="st">State</label>
                <input id="st" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="zip">ZIP</label>
                <input id="zip" value={form.zip} onChange={e => set('zip', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="cy">Country</label>
                <select id="cy" value={form.country} onChange={e => set('country', e.target.value)}>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Sri Lanka</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <hr className="divider" />
            <h2 style={{ fontSize: '15px', marginBottom: '12px' }}>Shipping Method</h2>

            {(
              [
                { value: 'standard',  label: 'Standard Shipping',  note: '5–7 business days', cost: shippingCosts.standard },
                { value: 'express',   label: 'Express Shipping',   note: '2 business days',   cost: shippingCosts.express },
                { value: 'overnight', label: 'Overnight',          note: 'Next business day', cost: shippingCosts.overnight },
              ] as { value: ShippingState['shippingMethod']; label: string; note: string; cost: number }[]
            ).map(opt => (
              <label key={opt.value} className="ship-option">
                <input
                  type="radio"
                  name="ship"
                  checked={form.shippingMethod === opt.value}
                  onChange={() => set('shippingMethod', opt.value)}
                />
                <div><b>{opt.label}</b><small>{opt.note}</small></div>
                <span className="sp" style={{ fontFamily: 'var(--fm)', ...(opt.cost === 0 ? { color: 'var(--green)' } : {}) }}>
                  {opt.cost === 0 ? 'FREE' : fmt(opt.cost)}
                </span>
              </label>
            ))}

            <button type="submit" className="btn btn-primary btn-lg btn-block desktop-only" style={{ marginTop: '18px', borderRadius: '12px' }}>
              Continue to Review →
            </button>
          </div>
          <OrderSummaryAside />
        </div>
      </div>
      <div className="sticky-checkout">
        <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ borderRadius: '12px' }}>
          Continue to Review →
        </button>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════
   REVIEW VIEW — PayHere integration lives here
   ════════════════════════════════════════════════════════════ */
export function CheckoutReviewView() {
  const { cart, cartTotal, authUser, showToast } = useApp();
  const router = useRouter();
  const [shipping, setShipping] = useState<ShippingState | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Hydrate shipping from sessionStorage after mount
  useEffect(() => {
    const saved = loadShipping(authUser);
    setShipping(saved);
  }, [authUser]);

  // Guard: empty cart
  if (typeof window !== 'undefined' && cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary" style={{ borderRadius: '10px' }}>Browse Products</Link>
      </div>
    );
  }

  function handlePaySuccess(orderId: string) {
    showToast('Redirecting to payment confirmation…');
    router.push(`/payment/success?orderId=${orderId}`);
  }

  function handlePayCancel() {
    showToast('Payment cancelled — you can try again any time.');
  }

  const shippingForButton = shipping
    ? {
        firstName: shipping.firstName,
        lastName:  shipping.lastName,
        email:     shipping.email,
        phone:     shipping.phone,
        address:   [shipping.address, shipping.apt].filter(Boolean).join(', '),
        city:      shipping.city,
        country:   shipping.country,
      }
    : {
        firstName: authUser?.firstName ?? '',
        lastName:  authUser?.lastName  ?? '',
        email:     authUser?.email     ?? '',
        phone:     authUser?.phone     ?? '',
        address:   '',
        city:      '',
        country:   'United States',
      };

  return (
    <div>
      {/* Load PayHere JS SDK — only on this page */}
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
        onError={() => showToast('Failed to load PayHere. Please refresh.')}
      />

      <div className="container">
        <Steps s="done" r="on" c="pending" />
        <div className="checkout-layout">
          <div className="card co-panel">
            <h2>Review Your Order</h2>

            {/* Shipping summary */}
            <div className="review-block">
              <h4>Shipping to</h4>
              <Link href="/checkout/shipping" className="link edit">Edit</Link>
              {shipping ? (
                <>
                  <b>{shipping.firstName} {shipping.lastName}</b><br />
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {[shipping.address, shipping.apt].filter(Boolean).join(', ')}, {shipping.city}, {shipping.state} {shipping.zip}<br />
                    {shipping.email} · {shipping.phone}
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <span className="badge badge-success">
                      {shipping.shippingMethod === 'standard'  ? 'Standard — FREE · 5–7 days' :
                       shipping.shippingMethod === 'express'   ? 'Express — $24.90 · 2 days'  :
                       'Overnight — $39.00 · Next day'}
                    </span>
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Loading…</span>
              )}
            </div>

            {/* Payment — PayHere handles card details; no card inputs needed here */}
            <div className="review-block">
              <h4>Payment</h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  padding: '10px 12px',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Secure payment via <b style={{ color: 'var(--ink)' }}>PayHere</b> — card details entered in a secure PayHere popup.
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="review-block">
              <h4>Items ({cart.reduce((s, c) => s + c.q, 0)})</h4>
              <Link href="/cart" className="link edit">Edit</Link>
              <MiniCart />
            </div>

            <p style={{ fontSize: '11.5px', color: 'var(--muted)', textAlign: 'center', marginTop: '6px' }}>
              By placing your order you agree to our Terms &amp; Conditions.
            </p>

            {/* PayHere Pay button — desktop */}
            <div className="desktop-only" style={{ marginTop: '12px' }}>
              <PayHereButton
                cart={cart}
                shipping={shippingForButton}
                onSuccess={handlePaySuccess}
                onCancel={handlePayCancel}
                disabled={!sdkReady}
                label={`Pay Now — ${fmt(cartTotal)}`}
              />
            </div>
          </div>

          <aside className="summary card" style={{ padding: '22px' }}>
            <h3>Order Summary</h3>
            <MiniCart />
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px' }}>
              🔒 Your payment is secured by PayHere and never stored on our servers.
            </p>
          </aside>
        </div>
      </div>

      {/* Mobile sticky Pay button */}
      <div className="sticky-checkout">
        <PayHereButton
          cart={cart}
          shipping={shippingForButton}
          onSuccess={handlePaySuccess}
          onCancel={handlePayCancel}
          disabled={!sdkReady}
          label={`Pay Now — ${fmt(cartTotal)}`}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CONFIRM VIEW — kept for direct URL access & demo fallback
   The real PayHere flow routes through /payment/success instead.
   ════════════════════════════════════════════════════════════ */
export function CheckoutConfirmView() {
  const { cartTotal } = useApp();
  return (
    <div className="container">
      <Steps s="done" r="done" c="on" />
      <div className="confirm-hero">
        <div className="check-ring" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5"/>
          </svg>
        </div>
        <h1>Order Confirmed! 🎉</h1>
        <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--muted)' }}>
          Confirmation sent to your email.
        </p>
      </div>

      <div className="confirm-grid">
        <div className="card co-panel">
          <h2 style={{ fontSize: '15px' }}>Order Details</h2>
          <MiniCart />
          <div className="sumrow total"><span>Total Paid</span><span>{fmt(cartTotal)}</span></div>
        </div>
        <div>
          <div className="card co-panel" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px' }}>Estimated Delivery</h2>
            <b style={{ color: 'var(--blue)' }}>5–7 business days</b><br />
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Standard Shipping · FREE</span>
          </div>
          <Link href="/account" className="btn btn-primary btn-block" style={{ borderRadius: '12px' }}>View Orders</Link>
          <Link href="/shop" className="btn btn-secondary btn-block" style={{ marginTop: '10px', borderRadius: '12px' }}>Continue Shopping</Link>
          <Link href="/" className="btn btn-ghost btn-block" style={{ marginTop: '6px', borderRadius: '12px' }}>Back to Home</Link>
        </div>
      </div>
      <div style={{ height: '12px' }} />
    </div>
  );
}
