'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { fmt, productImg, productIc } from '@/lib/data';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PENDING_IMG = '/pending.png';
const FREE_SHIP_THRESHOLD = 99;

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, cartSubtotal, changeQty, removeItem, showToast, products, authUser } = useApp();
  const router = useRouter();

  const shipPct      = Math.min(100, (cartSubtotal / FREE_SHIP_THRESHOLD) * 100);
  const remaining    = Math.max(0, FREE_SHIP_THRESHOLD - cartSubtotal);
  const freeUnlocked = cartSubtotal >= FREE_SHIP_THRESHOLD;

  function handleRemove(i: number) {
    removeItem(i);
    showToast('Item removed from cart');
  }

  function handleCheckout() {
    onClose();
    if (!authUser) {
      showToast('Please sign in to proceed to checkout.');
      router.push('/account/login?next=/checkout/shipping');
      return;
    }
    router.push('/checkout/shipping');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop${open ? ' show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`cd-panel${open ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        {/* ── Header ── */}
        <div className="cd-head">
          <h2 className="cd-title">YOUR CART</h2>
          <button className="cd-close" onClick={onClose} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Items ── */}
        <div className="cd-body">
          {cart.length === 0 ? (
            <div className="cd-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>
                <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
              </svg>
              <p>Your cart is empty</p>
              <button className="btn btn-primary" style={{ marginTop: '16px', borderRadius: '99px' }} onClick={onClose}>
                Keep Shopping
              </button>
            </div>
          ) : (
            <ul className="cd-list">
              {cart.map((item, i) => {
                const p = products.find(x => x.id === item.id);
                if (!p) return null;
                const img = productImg(p);
                const ic  = productIc(p);
                return (
                  <li key={`${item.id}-${i}`} className="cd-item">
                    {/* Thumbnail */}
                    <div className="cd-thumb">
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PENDING_IMG; }}
                        />
                      ) : (
                        <svg width="52" height="40" aria-hidden="true">
                          <use href={`#${ic}`} />
                        </svg>
                      )}
                    </div>

                    {/* Info + qty */}
                    <div className="cd-info">
                      <p className="cd-brand">{p.brand}</p>
                      <p className="cd-name">{p.name}</p>
                      <div className="cd-qty-row">
                        {/* Qty stepper */}
                        <div className="cd-qty" role="group" aria-label={`Quantity for ${p.name}`}>
                          <button
                            onClick={() => changeQty(i, -1)}
                            aria-label="Decrease quantity"
                            disabled={item.q <= 1}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
                          </button>
                          <span>{item.q}</span>
                          <button onClick={() => changeQty(i, 1)} aria-label="Increase quantity">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          className="cd-remove"
                          onClick={() => handleRemove(i)}
                          aria-label={`Remove ${p.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7h16M9 7V4.8a1 1 0 0 1 1-.8h4a1 1 0 0 1 1 .8V7m3 0-1 13.2a1.6 1.6 0 0 1-1.6 1.4H8.6A1.6 1.6 0 0 1 7 20.2L6 7M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Line price */}
                    <span className="cd-price">{fmt(p.price * item.q)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {cart.length > 0 && (
          <div className="cd-foot">
            {/* Shipping progress */}
            <div className="cd-ship-bar-wrap">
              <div className="cd-ship-bar">
                <div className="cd-ship-fill" style={{ width: `${shipPct}%` }} />
              </div>
              <p className="cd-ship-note">
                {freeUnlocked
                  ? 'Free shipping unlocked 🎉'
                  : <>{fmt(remaining)} away from free shipping</>
                }
              </p>
            </div>

            {/* Subtotal */}
            <div className="cd-subtotal">
              <span>Subtotal</span>
              <b>{fmt(cartSubtotal)}</b>
            </div>

            {/* Checkout CTA */}
            <button
              className="cd-checkout-btn"
              onClick={handleCheckout}
              style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
            >
              {authUser ? `Checkout · ${fmt(cartSubtotal)}` : `Sign in to Checkout · ${fmt(cartSubtotal)}`}
            </button>

            <p className="cd-note">Taxes calculated at checkout</p>
          </div>
        )}
      </aside>
    </>
  );
}
