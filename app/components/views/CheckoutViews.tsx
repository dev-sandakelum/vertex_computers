'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, fmt, productIc, productImg } from '@/lib/data';

/* ── Step indicator ── */
type S = 'on' | 'done' | 'pending';
function Steps({ s, r, c }: { s: S; r: S; c: S }) {
  const cls = (x: S) => `step${x === 'on' ? ' on' : x === 'done' ? ' done' : ''}`;
  return (
    <div className="steps">
      <div className={cls(s)}><span className="dot">{s === 'done' ? '✓' : '1'}</span>Shipping</div>
      <div className={cls(r)}><span className="dot">{r === 'done' ? '✓' : '2'}</span>Review</div>
      <div className={cls(c)}><span className="dot">{c === 'done' ? '✓' : '3'}</span>Done</div>
    </div>
  );
}

function MiniCart() {
  const { cart } = useApp();
  if (!cart.length) return <p className="muted">No items</p>;
  return (
    <>
      {cart.map((item, i) => {
        const p = PRODUCTS.find(prod => prod.id === item.id);
        if (!p) return null;
        const ic = productIc(p);
        const img = productImg(p);
        return (
          <div key={i} className="mini-item">
            <div className="mini-img">
              {img
                ? <img src={img} alt={p.name} style={{ width: '24px', height: '20px', objectFit: 'contain' }} />
                : <svg width="24" height="20"><use href={`#${ic}`} /></svg>
              }
            </div>
            <div style={{ flex: 1 }}><b style={{ fontSize: '12.5px' }}>{p.name}</b><br /><small className="muted">Qty {item.q}</small></div>
            <b>{fmt(p.price * item.q)}</b>
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
      <div className="sumrow"><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span></div>
      <div className="sumrow"><span>Est. tax</span><span>{fmt(cartTax)}</span></div>
      <div className="sumrow total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
    </aside>
  );
}

/* ═══ SHIPPING ═══ */
export function CheckoutShippingView() {
  const router = useRouter();
  return (
    <div>
      <div className="container">
        <Steps s="on" r="pending" c="pending" />
        <div className="checkout-layout">
          <div className="card co-panel">
            <h2>Shipping Address</h2>
            <div className="field-row">
              <div className="field"><label htmlFor="fn">First name</label><input id="fn" defaultValue="John" autoComplete="given-name" /></div>
              <div className="field"><label htmlFor="ln">Last name</label><input id="ln" defaultValue="Doe" autoComplete="family-name" /></div>
            </div>
            <div className="field"><label htmlFor="em">Email</label><input id="em" type="email" defaultValue="name@example.com" autoComplete="email" /></div>
            <div className="field"><label htmlFor="ph">Phone</label><input id="ph" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" /></div>
            <div className="field"><label htmlFor="ad">Street address</label><input id="ad" defaultValue="123 Example St" autoComplete="street-address" /></div>
            <div className="field"><label htmlFor="ad2">Apt / suite <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input id="ad2" placeholder="Apt 4B" /></div>
            <div className="field-row">
              <div className="field"><label htmlFor="ct">City</label><input id="ct" defaultValue="Springfield" /></div>
              <div className="field"><label htmlFor="st">State</label><input id="st" defaultValue="IL" /></div>
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="zip">ZIP</label><input id="zip" defaultValue="62704" /></div>
              <div className="field"><label htmlFor="cy">Country</label>
                <select id="cy"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Sri Lanka</option><option>Australia</option></select>
              </div>
            </div>
            <hr className="divider" />
            <h2 style={{ fontSize: '14.5px' }}>Shipping Method</h2>
            <label className="ship-option"><input type="radio" name="ship" defaultChecked /><div><b>Standard Shipping</b><small>5–7 business days</small></div><span className="sp" style={{ color: 'var(--success)' }}>FREE</span></label>
            <label className="ship-option"><input type="radio" name="ship" /><div><b>Express Shipping</b><small>2 business days</small></div><span className="sp">$24.90</span></label>
            <Link href="/checkout/review" className="btn btn-primary btn-lg btn-block desktop-only" style={{ marginTop: '18px' }}>Continue to Review →</Link>
          </div>
          <OrderSummaryAside />
        </div>
      </div>
      <div className="sticky-checkout">
        <Link href="/checkout/review" className="btn btn-primary btn-lg btn-block">Continue to Review →</Link>
      </div>
    </div>
  );
}

/* ═══ REVIEW ═══ */
export function CheckoutReviewView() {
  const { cartTotal, cart } = useApp();
  return (
    <div>
      <div className="container">
        <Steps s="done" r="on" c="pending" />
        <div className="checkout-layout">
          <div className="card co-panel">
            <h2>Review Your Order</h2>
            <div className="review-block">
              <h4>Shipping to</h4>
              <Link href="/checkout/shipping" className="link edit">Edit</Link>
              <b>John Doe</b><br />
              <span className="muted" style={{ fontSize: '13px' }}>123 Example St, Springfield, IL 62704<br />name@example.com · +1 (555) 000-0000</span>
              <div style={{ marginTop: '8px' }}><span className="badge badge-success">Standard — FREE · 5–7 days</span></div>
            </div>
            <div className="review-block">
              <h4>Payment</h4><a className="link edit" href="#">Edit</a>
              <div className="field" style={{ marginTop: '6px' }}><label htmlFor="cc">Card number</label><input id="cc" placeholder="4242 4242 4242 4242" inputMode="numeric" /></div>
              <div className="field-row">
                <div className="field"><label htmlFor="exp">Expiry</label><input id="exp" placeholder="MM / YY" /></div>
                <div className="field"><label htmlFor="cvc">CVC</label><input id="cvc" placeholder="•••" inputMode="numeric" /></div>
              </div>
              <div className="field" style={{ marginBottom: '4px' }}><label htmlFor="nc">Name on card</label><input id="nc" defaultValue="John Doe" /></div>
              <label className="fopt" style={{ marginTop: '6px' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> Billing same as shipping</label>
            </div>
            <div className="review-block">
              <h4>Items ({cart.reduce((s, c) => s + c.q, 0)})</h4>
              <Link href="/cart" className="link edit">Edit</Link>
              <MiniCart />
            </div>
            <p className="muted" style={{ fontSize: '11.5px', textAlign: 'center', marginTop: '6px' }}>By placing your order you agree to our Terms &amp; Conditions.</p>
            <Link href="/checkout/confirm" className="btn btn-primary btn-lg btn-block desktop-only" style={{ marginTop: '12px' }}>
              Place Order — {fmt(cartTotal)}
            </Link>
          </div>
          <aside className="summary card" style={{ padding: '22px' }}>
            <h3>Order Summary</h3>
            <MiniCart />
            <p className="muted" style={{ fontSize: '12px', marginTop: '14px' }}>🔒 Your payment details are encrypted and never stored on our servers.</p>
          </aside>
        </div>
      </div>
      <div className="sticky-checkout">
        <Link href="/checkout/confirm" className="btn btn-primary btn-lg btn-block">
          Place Order — {fmt(cartTotal)}
        </Link>
      </div>
    </div>
  );
}

/* ═══ CONFIRMATION ═══ */
export function CheckoutConfirmView() {
  const { cartTotal } = useApp();
  return (
    <div className="container">
      <Steps s="done" r="done" c="on" />
      <div className="confirm-hero">
        <div className="check-ring">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5"/>
          </svg>
        </div>
        <h1>Order Confirmed! 🎉</h1>
        <p className="muted" style={{ marginTop: '6px', fontSize: '13px' }}>
          Confirmation sent to <b style={{ color: 'var(--text-1)' }}>name@example.com</b>
        </p>
        <span className="order-num">Order #VX-2026081617</span>
      </div>

      <div className="confirm-grid">
        <div className="card co-panel">
          <h2 style={{ fontSize: '15px' }}>Order Details</h2>
          <MiniCart />
          <div className="sumrow total"><span>Total Paid</span><span>{fmt(cartTotal)}</span></div>
        </div>
        <div>
          <div className="card co-panel" style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px' }}>Delivery Address</h2>
            <b>John Doe</b><br />
            <span className="muted" style={{ fontSize: '13px' }}>123 Example St, Springfield, IL 62704<br />United States</span>
            <hr className="divider" />
            <h2 style={{ fontSize: '15px' }}>Estimated Delivery</h2>
            <b style={{ color: 'var(--accent)' }}>Aug 27 – Aug 29, 2026</b><br />
            <span className="muted" style={{ fontSize: '13px' }}>Standard Shipping · FREE</span>
          </div>
          <Link href="/account" className="btn btn-primary btn-block">Track Order</Link>
          <Link href="/account" className="btn btn-secondary btn-block" style={{ marginTop: '10px' }}>View Order Details</Link>
          <Link href="/" className="btn btn-ghost btn-block" style={{ marginTop: '6px' }}>Continue Shopping</Link>
        </div>
      </div>
      <div style={{ height: '12px' }} />
    </div>
  );
}
