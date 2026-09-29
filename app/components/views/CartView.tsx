'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, STOCK_MAP, fmt, productIc, productSpecList, type StockLevel } from '@/lib/data';

export default function CartView() {
  const { cart, cartSubtotal, cartTax, cartTotal, cartCount, changeQty, removeItem, removeItems, showToast } = useApp();
  const router = useRouter();

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allSelected = cart.length > 0 && selected.size === cart.length;
  const someSelected = selected.size > 0;

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(cart.map((_, i) => i)));
  }

  function handleBulkDelete() {
    const indices = Array.from(selected);
    removeItems(indices);
    setSelected(new Set());
    showToast(`${indices.length} item${indices.length !== 1 ? 's' : ''} removed`);
  }

  function handleRemoveSingle(i: number) {
    // keep selection consistent after a single remove
    setSelected(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
        // idx === i is the removed item, drop it
      });
      return next;
    });
    removeItem(i);
    showToast('Item removed');
  }

  return (
    <div>
      {/* ── Desktop layout (hidden on mobile via CSS) ── */}
      <div className="cart-desktop">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link> /
            <b style={{ color: 'var(--text-1)' }}>Cart</b>
          </div>
          <h1 className="section-title px" style={{ fontSize: '22px', marginBottom: '16px' }}>
            Your Cart{' '}
            <span className="muted" style={{ fontWeight: 500, fontSize: '14px' }}>
              ({cartCount} item{cartCount !== 1 ? 's' : ''})
            </span>
          </h1>

          <div className="cart-layout">
            {/* Desktop cart items */}
            <div className="card">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="big">🛒</div>
                  <h3 style={{ color: 'var(--text-1)', marginBottom: '6px' }}>Your cart is empty</h3>
                  <p>Time to spec out something legendary.</p>
                  <Link href="/shop" className="btn btn-primary" style={{ marginTop: '18px', display: 'inline-flex' }}>Start Shopping</Link>
                </div>
              ) : (
                <>
                  {/* Bulk action bar (desktop) */}
                  <div className="bulk-bar" style={{ opacity: someSelected ? 1 : 0, pointerEvents: someSelected ? 'auto' : 'none' }}>
                    <label className="bulk-check-label">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all items"
                      />
                      <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
                    </label>
                    <span className="muted" style={{ fontSize: '13px' }}>
                      {selected.size} of {cart.length} selected
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleBulkDelete}
                      aria-label={`Delete ${selected.size} selected items`}
                    >
                      🗑 Delete selected ({selected.size})
                    </button>
                  </div>

                  {/* Select all row when nothing selected yet */}
                  {!someSelected && (
                    <div className="bulk-bar bulk-bar-idle">
                      <label className="bulk-check-label">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={toggleAll}
                          aria-label="Select all items"
                        />
                        <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>Select items to bulk delete</span>
                      </label>
                    </div>
                  )}

                  {cart.map((item, i) => {
                    const p = PRODUCTS.find(prod => prod.id === item.id)!;
                    const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];
                    const ic = productIc(p);
                    const specs = productSpecList(p);
                    const isChecked = selected.has(i);
                    return (
                      <div
                        key={`${item.id}-${i}`}
                        className={`cart-item${isChecked ? ' cart-item-selected' : ''}`}
                      >
                        <label className="ci-checkbox" aria-label={`Select ${p.name}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(i)}
                          />
                        </label>
                        <div className="ci-img"><svg width="48" height="36"><use href={`#${ic}`} /></svg></div>
                        <div>
                          <div className="ci-name">{p.name}</div>
                          <div className="ci-meta">
                            {p.brand} · {specs[0]} ·{' '}
                            <span className={`badge ${badgeClass}`} style={{ fontSize: '10.5px', padding: '2px 8px' }}>{stockLabel}</span>
                          </div>
                          <button className="ci-remove" onClick={() => handleRemoveSingle(i)}>✕ Remove</button>
                        </div>
                        <div className="ci-right">
                          <div className="qty">
                            <button onClick={() => changeQty(i, -1)} aria-label="Decrease">−</button>
                            <span>{item.q}</span>
                            <button onClick={() => changeQty(i, 1)} aria-label="Increase">+</button>
                          </div>
                          <span className="price" style={{ fontSize: '16px' }}>{fmt(p.price * item.q)}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Desktop summary */}
            <aside className="summary card">
              <h3>Order Summary</h3>
              <div className="sumrow"><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
              <div className="sumrow"><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span></div>
              <div className="sumrow"><span>Est. tax</span><span>{fmt(cartTax)}</span></div>
              <div className="promo-row">
                <input placeholder="Promo code" aria-label="Promo code" />
                <button className="btn btn-secondary btn-sm" onClick={() => showToast('Code applied — nice try 😄')}>Apply</button>
              </div>
              <div className="sumrow total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
              <Link href="/checkout/shipping" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
                Proceed to Checkout →
              </Link>
              <p className="muted" style={{ fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>🔒 Secure 256-bit encrypted checkout</p>
            </aside>
          </div>

          <div style={{ marginTop: '12px', paddingBottom: '8px' }}>
            <Link href="/shop" className="link">← Continue shopping</Link>
          </div>
        </div>
      </div>

      {/* ── Mobile layout (hidden on desktop via CSS) ── */}
      <div className="cart-mobile">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> /
          <b style={{ color: 'var(--text-1)' }}>Cart</b>
        </div>
        <h1 className="section-title px" style={{ fontSize: '18px', marginBottom: '12px' }}>
          Your Cart{' '}
          <span className="muted" style={{ fontWeight: 500, fontSize: '13px' }}>
            ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </span>
        </h1>

        {/* Mobile cart items */}
        <div className="card px" style={{ margin: '0 16px' }}>
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="big">🛒</div>
              <h3 style={{ color: 'var(--text-1)', marginBottom: '6px' }}>Your cart is empty</h3>
              <p style={{ fontSize: '13px' }}>Time to spec out something legendary.</p>
              <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>Start Shopping</Link>
            </div>
          ) : (
            <>
              {/* Mobile bulk bar */}
              {someSelected ? (
                <div className="bulk-bar-m">
                  <label className="bulk-check-label">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all items"
                    />
                    <span style={{ fontSize: '13px' }}>{selected.size} selected</span>
                  </label>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleBulkDelete}
                    aria-label={`Delete ${selected.size} selected items`}
                  >
                    🗑 Delete ({selected.size})
                  </button>
                </div>
              ) : (
                <div className="bulk-bar-m bulk-bar-idle">
                  <label className="bulk-check-label">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={toggleAll}
                      aria-label="Select all items"
                    />
                    <span style={{ color: 'var(--text-2)', fontSize: '12.5px' }}>Select to bulk delete</span>
                  </label>
                </div>
              )}

              {cart.map((item, i) => {
                const p = PRODUCTS.find(prod => prod.id === item.id)!;
                const ic = productIc(p);
                const specs = productSpecList(p);
                const isChecked = selected.has(i);
                return (
                  <div
                    key={`m-${item.id}-${i}`}
                    className={`cart-item-m${isChecked ? ' cart-item-selected' : ''}`}
                  >
                    <label className="ci-checkbox" style={{ paddingTop: '14px' }} aria-label={`Select ${p.name}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(i)}
                      />
                    </label>
                    <div className="ci-img" style={{ width: '64px', height: '52px' }}>
                      <svg width="32" height="28"><use href={`#${ic}`} /></svg>
                    </div>
                    <div>
                      <div className="ci-name" style={{ fontSize: '13.5px' }}>{p.name}</div>
                      <div className="ci-meta">{p.brand} · {specs[0]}</div>
                      <div className="ci-bottom">
                        <div className="qty">
                          <button onClick={() => changeQty(i, -1)} aria-label="Decrease">−</button>
                          <span>{item.q}</span>
                          <button onClick={() => changeQty(i, 1)} aria-label="Increase">+</button>
                        </div>
                        <span className="price" style={{ fontSize: '14px' }}>{fmt(p.price * item.q)}</span>
                      </div>
                      <button className="ci-remove" onClick={() => handleRemoveSingle(i)}>✕ Remove</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Mobile summary */}
        <div className="card px" style={{ margin: '16px 16px 0', padding: '18px' }}>
          <h3 style={{ fontSize: '14.5px', marginBottom: '10px' }}>Order Summary</h3>
          <div className="sumrow"><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
          <div className="sumrow"><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span></div>
          <div className="sumrow"><span>Est. tax</span><span>{fmt(cartTax)}</span></div>
          <div className="promo-row">
            <input placeholder="Promo code" aria-label="Promo code" />
            <button className="btn btn-secondary btn-sm" onClick={() => showToast('Code applied — nice try 😄')}>Apply</button>
          </div>
          <div className="sumrow total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
        </div>
        <p className="muted px" style={{ fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>🔒 Secure 256-bit encrypted checkout</p>
        <div className="px" style={{ marginTop: '6px', textAlign: 'center', paddingBottom: '6px' }}>
          <Link href="/shop" className="link">← Continue shopping</Link>
        </div>

        {/* Mobile sticky checkout */}
        <div className="sticky-checkout">
          <Link href="/checkout/shipping" className="btn btn-primary btn-block btn-lg">
            Checkout — {fmt(cartTotal)}
          </Link>
        </div>
      </div>
    </div>
  );
}
