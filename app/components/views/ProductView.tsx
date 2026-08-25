'use client';

import { useState } from 'react';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, fmt, STOCK_MAP } from '@/lib/data';

const RELATED_IDS = [4, 6, 8, 3];

export default function ProductView() {
  const { currentProductId, setView, openProduct, addToCart, showToast } = useApp();
  const p = PRODUCTS[currentProductId] ?? PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [badgeClass, stockLabel] = STOCK_MAP[p.stock];

  function handleAddToCart() {
    addToCart(p.id, qty);
    showToast(`Added to cart — ${p.name.split(' ').slice(0, 3).join(' ')} ✓`);
  }

  const SPECS: [string, string][] = [
    ['GPU Chipset', p.name.split(' ').slice(0, 3).join(' ')],
    ['Price', fmt(p.price)],
    ['Specs', p.specs.join(' · ')],
    ['Rating', `${p.rating} stars · ${p.rev} reviews`],
    ['Warranty', '2 years, extendable'],
    ['Stock', stockLabel],
  ];

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs container">
        <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }}>Home</a> /
        <a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>{p.ic.includes('cpu') ? 'Processors' : p.ic.includes('ram') ? 'Memory' : 'Graphics Cards'}</a> /
        <b style={{ color: 'var(--text-1)' }}>{p.name.split(' ').slice(0, 3).join(' ')}</b>
      </div>

      {/* ── Desktop 2-col layout ──────────────────────── */}
      <div className="container">
        <div className="pdp">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="main-img" style={{ position: 'relative' }}>
              <svg width="120" height="90"><use href={`#${p.ic}`} /></svg>
            </div>
            {/* Desktop thumbs */}
            <div className="thumbs">
              {(['i-gpu', 'i-fan', 'i-mobo', 'i-case'] as const).map((ic, i) => (
                <button key={ic} className={i === 0 ? 'on' : ''} aria-label={`Image ${i + 1}`}>
                  <svg width="40" height="30"><use href={`#${ic}`} /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <span className="pcard-brand">{p.brand} · SKU {p.brand.toUpperCase().slice(0, 2)}-{String(p.id).padStart(3, '0')}</span>
            <h1>{p.name}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="stars">★★★★★ <small>{p.rating} · {p.rev} reviews</small></span>
              <span className={`badge ${badgeClass}`}>{stockLabel}</span>
            </div>
            <div className="pdp-price">
              {p.old && <s>{fmt(p.old)}</s>}
              {fmt(p.price)}
            </div>
            {p.old && (
              <span className="save-note">
                You save {fmt(p.old - p.price)} ({Math.round((1 - p.price / p.old) * 100)}%)
              </span>
            )}
            <p className="muted" style={{ marginTop: '14px', fontSize: '13.5px' }}>
              Premium components, factory overclocked and ready to install. Compatibility checked with your cart.
            </p>

            {/* Desktop buy controls */}
            <div className="pdp-buy">
              <div className="qty" role="group" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: '180px' }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-secondary btn-lg"
                aria-label="Wishlist"
                onClick={() => showToast('Saved to wishlist ♡')}
              >
                ♡
              </button>
            </div>

            <div className="trust">
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/>
                </svg>
                Free shipping over $99
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/>
                </svg>
                2-year warranty · 30-day returns
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12l4 4L19 6"/>
                </svg>
                Compatibility-checked with your cart
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
                </svg>
                Secure checkout · all major cards
              </div>
            </div>
          </div>
        </div>

        {/* Desktop spec table */}
        <div className="spec-section">
          <div className="tabs">
            <button className="on">Full Specifications</button>
            <button onClick={() => showToast('Reviews — coming soon')}>Reviews ({p.rev})</button>
            <button onClick={() => showToast('Q&A — coming soon')}>Q&amp;A</button>
          </div>
          <div className="card" style={{ borderTopLeftRadius: 0, overflow: 'hidden' }}>
            <table className="spec-table">
              <tbody>
                {SPECS.map(([label, value]) => (
                  <tr key={label}><td>{label}</td><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desktop related */}
        <div className="spec-section">
          <div className="section-head">
            <h2 className="section-title">Frequently Bought Together</h2>
          </div>
          <div className="product-grid">
            {RELATED_IDS.map((id) => {
              const rp = PRODUCTS[id];
              return (
                <article
                  key={id}
                  className="pcard"
                  onClick={() => openProduct(id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openProduct(id)}
                >
                  <div className="pcard-img"><svg width="44" height="44"><use href={`#${rp.ic}`} /></svg></div>
                  <div className="pcard-body">
                    <span className="pcard-brand">{rp.brand}</span>
                    <span className="pcard-name">{rp.name}</span>
                    <div className="pcard-foot">
                      <span className="price">{fmt(rp.price)}</span>
                      <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(rp.id, 1); showToast(`Added ✓`); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile-only product info ──────────────────── */}
      <div className="pdp-info px" style={{ paddingTop: '16px' }}>
        <span className="pcard-brand">{p.brand} · SKU {p.brand.toUpperCase().slice(0, 2)}-{String(p.id).padStart(3, '0')}</span>
        <h1 style={{ fontSize: '19px' }}>{p.name}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span className="stars">★★★★★ <small>{p.rating} · {p.rev} reviews</small></span>
          <span className={`badge ${badgeClass}`}>{stockLabel}</span>
        </div>
        <div className="pdp-price" style={{ fontSize: '26px' }}>
          {p.old && <s style={{ fontSize: '14px' }}>{fmt(p.old)}</s>}
          {fmt(p.price)}
        </div>
        {p.old && (
          <span className="save-note" style={{ fontSize: '12.5px' }}>
            You save {fmt(p.old - p.price)} ({Math.round((1 - p.price / p.old) * 100)}%)
          </span>
        )}
        <p className="muted" style={{ marginTop: '12px', fontSize: '13.5px' }}>
          Premium component, compatibility checked with your cart.
        </p>
        {/* Mobile trust badges (1-col) */}
        <div className="trust" style={{ marginTop: '16px' }}>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/></svg> Free shipping over $99</div>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg> 2-year warranty · 30-day returns</div>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12l4 4L19 6"/></svg> Compatibility-checked with your cart</div>
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="accordion">
        {[
          { label: 'Full Specifications', content: (
            <table className="spec-table" style={{ margin: '0 0 14px' }}>
              <tbody>
                {SPECS.map(([label, value]) => (
                  <tr key={label}><td>{label}</td><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
          )},
          { label: `Reviews (${p.rev})`, content: <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>Reviews coming in the live build.</p> },
          { label: 'Q&A', content: <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>Q&A coming in the live build.</p> },
        ].map((item, i) => (
          <div key={item.label} className={`acc-item${openAccordion === i ? ' open' : ''}`}>
            <button className="acc-head" onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
              {item.label} <span className="chev">▾</span>
            </button>
            <div className="acc-body">{item.content}</div>
          </div>
        ))}
      </div>

      {/* Mobile related — horizontal scroll */}
      <div className="px" style={{ marginTop: '20px' }}>
        <div className="section-head">
          <h2 className="section-title" style={{ fontSize: '15px' }}>Frequently Bought Together</h2>
        </div>
      </div>
      <div className="hscroll" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        {RELATED_IDS.map((id) => {
          const rp = PRODUCTS[id];
          return (
            <article key={id} className="hcard" onClick={() => openProduct(id)}>
              <div className="hcard-img"><svg width="40" height="36"><use href={`#${rp.ic}`} /></svg></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: 0 }}>
                <span className="pcard-brand">{rp.brand}</span>
                <span className="pcard-name" style={{ fontSize: '12.5px' }}>{rp.name}</span>
                <div className="pcard-foot" style={{ marginTop: 'auto' }}>
                  <span className="price" style={{ fontSize: '14px' }}>{fmt(rp.price)}</span>
                  <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(rp.id, 1); showToast('Added ✓'); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Spacer for sticky bar */}
      <div style={{ height: '80px' }} />

      {/* Mobile sticky buy bar */}
      <div className="sticky-buy">
        <div className="qty" role="group" aria-label="Quantity">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
        </div>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button
          className="btn btn-secondary btn-lg"
          style={{ width: '48px', padding: 0 }}
          aria-label="Wishlist"
          onClick={() => showToast('Saved to wishlist ♡')}
        >
          ♡
        </button>
      </div>
    </div>
  );
}
