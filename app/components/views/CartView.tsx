'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, STOCK_MAP, fmt, productIc, productImg, productSpecList, type StockLevel } from '@/lib/data';

const PENDING_IMG = '/pending.png';

export default function CartView() {
  const { cart, cartSubtotal, cartTax, cartTotal, cartCount, changeQty, removeItem, removeItems, showToast } = useApp();

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const allSelected  = cart.length > 0 && selected.size === cart.length;
  const someSelected = selected.size > 0;

  function toggleSelect(i: number) {
    setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
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
    setSelected(prev => {
      const n = new Set<number>();
      prev.forEach(idx => { if (idx < i) n.add(idx); else if (idx > i) n.add(idx - 1); });
      return n;
    });
    removeItem(i);
    showToast('Item removed');
  }

  const EmptyCart = () => (
    <div className="empty-state">
      <div className="big">🛒</div>
      <h3 style={{ color: 'var(--ink)', marginBottom: '6px' }}>Your cart is empty</h3>
      <p>Time to spec out something legendary.</p>
      <Link href="/shop" className="btn btn-primary" style={{ marginTop: '18px', display: 'inline-flex' }}>Start Shopping</Link>
    </div>
  );

  const Summary = ({ compact = false }: { compact?: boolean }) => (
    <aside className={`summary card${compact ? '' : ''}`}>
      <h3 style={{ fontSize: compact ? '14.5px' : '17px', marginBottom: compact ? '10px' : '16px' }}>Order Summary</h3>
      <div className="sumrow"><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
      <div className="sumrow"><span>Shipping</span><span style={{ color: 'var(--green)', fontWeight: 600 }}>FREE</span></div>
      <div className="sumrow"><span>Est. tax</span><span>{fmt(cartTax)}</span></div>
      <div className="promo-row">
        <input placeholder="Promo code" aria-label="Promo code" />
        <button className="btn btn-secondary btn-sm" onClick={() => showToast('Promo code applied (demo) 🎉')}>Apply</button>
      </div>
      <div className="sumrow total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
      {!compact && (
        <Link href="/checkout/shipping" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px', borderRadius: '12px' }}>
          Proceed to Checkout →
        </Link>
      )}
      <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '10px', color: 'var(--muted)' }}>
        🔒 Secure 256-bit encrypted checkout
      </p>
    </aside>
  );

  return (
    <div>
      {/* ── Desktop ── */}
      <div className="cart-desktop">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="bc-sep">/</span>
            <b className="bc-cur">Cart</b>
          </nav>

          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
            Your Cart{' '}
            <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--muted)' }}>
              ({cartCount} item{cartCount !== 1 ? 's' : ''})
            </span>
          </h1>

          <div className="cart-layout">
            <div className="card">
              {cart.length === 0 ? (
                <EmptyCart />
              ) : (
                <>
                  {/* Bulk bar */}
                  {someSelected ? (
                    <div className="bulk-bar">
                      <label className="bulk-check-label">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all items" />
                        <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
                      </label>
                      <span style={{ marginRight: 'auto', fontSize: '13px', color: 'var(--muted)' }}>{selected.size} of {cart.length} selected</span>
                      <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>🗑 Delete ({selected.size})</button>
                    </div>
                  ) : (
                    <div className="bulk-bar bulk-bar-idle">
                      <label className="bulk-check-label">
                        <input type="checkbox" checked={false} onChange={toggleAll} aria-label="Select all items" />
                        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Select items to bulk delete</span>
                      </label>
                    </div>
                  )}

                  {cart.map((item, i) => {
                    const p = PRODUCTS.find(prod => prod.id === item.id)!;
                    const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];
                    const ic    = productIc(p);
                    const img   = productImg(p);
                    const specs = productSpecList(p);
                    const isChecked = selected.has(i);
                    return (
                      <div key={`${item.id}-${i}`} className={`cart-item${isChecked ? ' cart-item-selected' : ''}`}>
                        <label className="ci-checkbox" aria-label={`Select ${p.name}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(i)} />
                        </label>
                        <div className="ci-img">
                          {img ? (
                            <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = PENDING_IMG; }} />
                          ) : (
                            <svg width="48" height="36"><use href={`#${ic}`} /></svg>
                          )}
                        </div>
                        <div>
                          <div className="ci-name">{p.name}</div>
                          <div className="ci-meta">{p.brand} · {specs[0]} · <span className={`badge ${badgeClass}`} style={{ fontSize: '10.5px', padding: '2px 8px' }}>{stockLabel}</span></div>
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
            <Summary />
          </div>

          <div style={{ marginTop: '12px', paddingBottom: '8px' }}>
            <Link href="/shop" className="link">← Continue shopping</Link>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="cart-mobile">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <b className="bc-cur">Cart</b>
        </nav>

        <h1 className="px" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
          Your Cart{' '}
          <span style={{ fontWeight: 500, fontSize: '13px', color: 'var(--muted)' }}>
            ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </span>
        </h1>

        <div className="card px" style={{ margin: '0 16px' }}>
          {cart.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {someSelected ? (
                <div className="bulk-bar-m">
                  <label className="bulk-check-label">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                    <span style={{ fontSize: '13px' }}>{selected.size} selected</span>
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>🗑 Delete ({selected.size})</button>
                </div>
              ) : (
                <div className="bulk-bar-m" style={{ background: 'transparent' }}>
                  <label className="bulk-check-label">
                    <input type="checkbox" checked={false} onChange={toggleAll} aria-label="Select all" />
                    <span style={{ color: 'var(--muted)', fontSize: '12.5px' }}>Select to bulk delete</span>
                  </label>
                </div>
              )}

              {cart.map((item, i) => {
                const p     = PRODUCTS.find(prod => prod.id === item.id)!;
                const ic    = productIc(p);
                const img   = productImg(p);
                const specs = productSpecList(p);
                const isChecked = selected.has(i);
                return (
                  <div key={`m-${item.id}-${i}`} className={`cart-item-m${isChecked ? ' cart-item-selected' : ''}`}>
                    <label className="ci-checkbox" style={{ paddingTop: '14px' }} aria-label={`Select ${p.name}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(i)} />
                    </label>
                    <div className="ci-img" style={{ width: '64px', height: '52px', borderRadius: '8px', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = PENDING_IMG; }} />
                      ) : (
                        <svg width="32" height="28"><use href={`#${ic}`} /></svg>
                      )}
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

        <div className="card px" style={{ margin: '16px 16px 0', padding: '18px' }}>
          <Summary compact />
        </div>

        <p style={{ fontSize: '12px', textAlign: 'center', margin: '8px 0', color: 'var(--muted)' }}>
          <Link href="/shop" className="link">← Continue shopping</Link>
        </p>

        <div className="sticky-checkout">
          <Link href="/checkout/shipping" className="btn btn-primary btn-block btn-lg" style={{ borderRadius: '12px' }}>
            Checkout — {fmt(cartTotal)}
          </Link>
        </div>
      </div>
    </div>
  );
}
