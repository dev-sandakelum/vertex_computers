'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import {
  PRODUCTS, fmt, STOCK_MAP, productPath, categorySlug,
  productIc, productImg, productOld, productRev,
  productTag, type StockLevel,
} from '@/lib/data';

interface Props { productId: number; }

export default function ProductView({ productId }: Props) {
  const { addToCart, showToast } = useApp();
  const p = PRODUCTS.find(prod => prod.id === productId) ?? PRODUCTS[0];
  const [qty, setQty]           = useState(1);
  const [activeThumb, setThumb] = useState(0);
  const [activeTab, setTab]     = useState<'specs' | 'reviews' | 'qa'>('specs');
  const [openAcc, setOpenAcc]   = useState<number | null>(0);
  const [wishlist, setWishlist] = useState(false);
  const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];

  const ic       = productIc(p);
  const img      = productImg(p);
  const old      = productOld(p);
  const rev      = productRev(p);
  const tag      = productTag(p);
  const activeImg = p.images[activeThumb]?.url ?? img;
  const sku      = p.sku ?? `${p.brand.toUpperCase().slice(0, 2)}-${String(p.id).padStart(3, '0')}`;
  const saveAmt  = old ? old - p.price : 0;
  const savePct  = old ? Math.round((1 - p.price / old) * 100) : 0;
  const outOfStock = p.stock === 'out';

  const SPECS: [string, string][] = Object.entries(p.specs ?? {}).slice(0, 16);
  if (SPECS.length === 0) {
    SPECS.push(
      ['Brand', p.brand],
      ['Price', fmt(p.price)],
      ['Rating', `${p.rating} stars · ${rev} reviews`],
      ['Stock', stockLabel],
    );
  }

  const relatedProducts = (p.relatedProductIds ?? [])
    .slice(0, 4)
    .map(id => PRODUCTS.find(prod => prod.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  function handleAddToCart() {
    addToCart(p.id, qty);
    showToast(`Added to cart — ${p.name.split(' ').slice(0, 3).join(' ')} ✓`);
  }

  function toggleWishlist() {
    setWishlist(w => !w);
    showToast(wishlist ? 'Removed from wishlist' : 'Saved to wishlist ♡');
  }

  /* ── Star renderer ── */
  function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    const full  = Math.floor(rating);
    const empty = 5 - full;
    return (
      <span className="stars" style={{ fontSize: size }}>
        {'★'.repeat(full)}{'☆'.repeat(empty)}
      </span>
    );
  }

  return (
    <div className="pdp-page">

      {/* Breadcrumbs */}
      <div className="breadcrumbs container">
        <Link href="/">Home</Link>
        <span className="bc-sep">/</span>
        <Link href={`/shop/${categorySlug(p.category)}`}>{p.category}</Link>
        <span className="bc-sep">/</span>
        <span className="bc-cur">{p.name.split(' ').slice(0, 5).join(' ')}</span>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP — hero 2-col
      ══════════════════════════════════════════ */}
      <div className="container pdp-desktop">
        <div className="pdp">

          {/* ── Gallery: vertical thumbs + main image ── */}
          <div className="pdp-gallery">
            {/* Vertical thumbnail strip */}
            {p.images.length > 1 && (
              <div className="pdp-thumbs-v">
                {p.images.slice(0, 6).map((image, i) => (
                  <button
                    key={image.id}
                    className={`pdp-thumb${i === activeThumb ? ' on' : ''}`}
                    aria-label={`View image ${i + 1}`}
                    onClick={() => setThumb(i)}
                  >
                    <img src={image.url} alt={image.alt} />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="pdp-main-img">
              {tag && <span className="pdp-tag">{tag}</span>}
              {activeImg
                ? <img src={activeImg} alt={p.name} />
                : <svg width="100" height="80"><use href={`#${ic}`} /></svg>
              }
              <span className="pdp-zoom-hint">🔍 Hover to zoom</span>
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="pdp-info">

            {/* Brand + SKU */}
            <div className="pdp-topline">
              <Link href={`/shop/${categorySlug(p.category)}`} className="pdp-brand-link">
                {p.brand}
              </Link>
              <span className="pdp-sku">SKU {sku}</span>
            </div>

            {/* Product name */}
            <h1 className="pdp-name">{p.name}</h1>

            {/* Ratings + stock */}
            <div className="pdp-meta-row">
              <Stars rating={parseFloat(p.rating)} size={15} />
              <a href="#reviews-tab" className="pdp-rev-link" onClick={e => { e.preventDefault(); setTab('reviews'); document.querySelector('.spec-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                {p.rating} · {rev} {rev === 1 ? 'review' : 'reviews'}
              </a>
              <span className="pdp-meta-sep" />
              <span className={`badge ${badgeClass}`}>{stockLabel}</span>
              {p.stockCount && p.stockCount < 10 && p.stock !== 'out' && (
                <span className="pdp-low-stock">Only {p.stockCount} left!</span>
              )}
            </div>

            {/* Price */}
            <div className="pdp-price-box">
              {old && <span className="pdp-was">Was {fmt(old)}</span>}
              <div className="pdp-price-row">
                <span className="pdp-price">{fmt(p.price)}</span>
                {old && (
                  <span className="pdp-save-badge">
                    Save {savePct}%
                  </span>
                )}
              </div>
              {old && (
                <span className="pdp-save-amt">
                  You save {fmt(saveAmt)}
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="pdp-desc">{p.shortDescription}</p>

            {/* Key highlights */}
            {p.highlights && p.highlights.length > 0 && (
              <ul className="pdp-highlights">
                {p.highlights.slice(0, 5).map((h, i) => (
                  <li key={i}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {/* Key specs chips */}
            {SPECS.slice(0, 6).length > 0 && (
              <div className="pdp-spec-chips">
                {SPECS.slice(0, 6).map(([label, value]) => (
                  <div key={label} className="pdp-chip">
                    <span className="chip-label">{label}</span>
                    <span className="chip-val">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pdp-divider" />

            {/* Qty + Add to Cart */}
            <div className="pdp-actions">
              <div className="pdp-qty-row">
                <label className="pdp-qty-label">Qty</label>
                <div className="qty" role="group" aria-label="Quantity">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="pdp-btn-row">
                <button
                  className="btn btn-primary btn-lg pdp-cart-btn"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className={`pdp-wish-btn${wishlist ? ' active' : ''}`}
                  aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  onClick={toggleWishlist}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill={wishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Delivery / trust strip */}
            <div className="pdp-delivery-strip">
              <div className="pdp-delivery-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/>
                </svg>
                <div>
                  <b>Free Delivery</b>
                  <span> on orders over $99 · </span>
                  <span>{p.shipping?.estimatedDelivery ?? 'Est. 3–5 business days'}</span>
                </div>
              </div>
              <div className="pdp-delivery-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/>
                </svg>
                <div>
                  <b>{p.warranty?.duration ?? '2-Year'} Warranty</b>
                  <span> · {p.returns?.window ?? 30}-day hassle-free returns</span>
                </div>
              </div>
            </div>

            {/* Trust badges row */}
            <div className="pdp-trust-row">
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>
                Compatibility-checked
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
                Secure checkout
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 3v4l3 3"/></svg>
                24/7 support
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BELOW FOLD — Specs / Reviews / Q&A + sidebar
        ══════════════════════════════════════════ */}
        <div className="pdp-below" id="reviews-tab">
          {/* Tabs */}
          <div className="pdp-tabs">
            <button className={activeTab === 'specs'   ? 'on' : ''} onClick={() => setTab('specs')}>Specifications</button>
            <button className={activeTab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>Reviews ({rev})</button>
            <button className={activeTab === 'qa'      ? 'on' : ''} onClick={() => setTab('qa')}>Q&amp;A</button>
          </div>

          <div className="pdp-tab-body card">

            {/* ── Specs ── */}
            {activeTab === 'specs' && (
              <div className="pdp-spec-layout">
                <div className="pdp-spec-main">
                  <table className="spec-table">
                    <tbody>
                      {SPECS.map(([label, value]) => (
                        <tr key={label}><td>{label}</td><td>{value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {p.compatibility && (
                  <div className="pdp-spec-aside">
                    <h3 className="aside-head">Compatibility Notes</h3>
                    <p className="muted" style={{ fontSize: '13.5px', lineHeight: 1.6 }}>{p.compatibility.notes}</p>
                    {p.compatibility.testedBoards && p.compatibility.testedBoards.length > 0 && (
                      <>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '16px', marginBottom: '8px' }}>Tested Boards</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {p.compatibility.testedBoards.map(b => (
                            <li key={b} style={{ fontSize: '13px', color: 'var(--text-2)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Reviews ── */}
            {activeTab === 'reviews' && (
              <div className="pdp-reviews-layout">
                {p.reviews?.featured && p.reviews.featured.length > 0 ? (
                  <>
                    {/* Summary sidebar */}
                    <div className="reviews-summary-col">
                      <div className="rev-big-score">
                        <span className="rev-score-num">{p.reviews.average.toFixed(1)}</span>
                        <Stars rating={p.reviews.average} size={20} />
                        <span className="rev-score-total">{p.reviews.total} reviews</span>
                      </div>
                      {p.reviews.distribution && (
                        <div className="rev-dist">
                          {[5,4,3,2,1].map(star => {
                            const count = p.reviews!.distribution[String(star)] ?? 0;
                            const pct   = p.reviews!.total > 0 ? Math.round((count / p.reviews!.total) * 100) : 0;
                            return (
                              <div key={star} className="rev-dist-row">
                                <span className="rev-dist-label">{star} ★</span>
                                <div className="rev-dist-bar"><div className="rev-dist-fill" style={{ width: `${pct}%` }} /></div>
                                <span className="rev-dist-pct">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Review list */}
                    <div className="reviews-list-col">
                      {p.reviews.featured.map(review => (
                        <div key={review.id} className="review-card">
                          <div className="review-card-head">
                            <div className="review-avatar">{review.author.charAt(0)}</div>
                            <div className="review-meta">
                              <div className="review-author-row">
                                <strong className="review-author">{review.author}</strong>
                                {review.verified && <span className="verified-chip">✓ Verified Purchase</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Stars rating={review.rating} size={13} />
                                <span className="review-date">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="review-title">{review.title}</p>
                          <p className="review-body">{review.body}</p>
                          {review.helpful !== undefined && (
                            <button className="helpful-btn">👍 Helpful ({review.helpful})</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '32px 24px' }}>
                    <p className="muted">No reviews yet. Be the first to review this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Q&A ── */}
            {activeTab === 'qa' && (
              <div style={{ padding: '28px 24px' }}>
                <p className="muted" style={{ fontSize: '14px' }}>
                  Have a question about this product?{' '}
                  <a href="#" className="link" onClick={e => e.preventDefault()}>Ask the community →</a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related / Frequently Bought Together ── */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related">
            <div className="section-head">
              <h2 className="section-title">Frequently Bought Together</h2>
              <Link href={`/shop/${categorySlug(p.category)}`} className="link">View all →</Link>
            </div>
            <div className="product-grid">
              {relatedProducts.map(rp => {
                const rpIc  = productIc(rp);
                const rpImg = productImg(rp);
                return (
                  <Link key={rp.id} href={productPath(rp.id)} className="pcard">
                    <div className="pcard-img">
                      {rpImg
                        ? <img src={rpImg} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="44" height="44"><use href={`#${rpIc}`} /></svg>
                      }
                    </div>
                    <div className="pcard-body">
                      <span className="pcard-brand">{rp.brand}</span>
                      <span className="pcard-name">{rp.name}</span>
                      <Stars rating={parseFloat(rp.rating)} size={12} />
                      <div className="pcard-foot">
                        <span className="price">{fmt(rp.price)}</span>
                        <button className="add-btn" onClick={e => { e.preventDefault(); addToCart(rp.id, 1); showToast('Added ✓'); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE — stacked
      ══════════════════════════════════════════ */}

      {/* Mobile image carousel */}
      <div className="pdp-mob-gallery">
        <div className="pdp-mob-img">
          {tag && <span className="pdp-tag">{tag}</span>}
          {activeImg
            ? <img src={activeImg} alt={p.name} />
            : <svg width="80" height="60"><use href={`#${ic}`} /></svg>
          }
        </div>
        {p.images.length > 1 && (
          <div className="pdp-mob-dots">
            {p.images.slice(0, 5).map((_, i) => (
              <button key={i} className={`pdp-dot${i === activeThumb ? ' on' : ''}`} aria-label={`Image ${i+1}`} onClick={() => setThumb(i)} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile info block */}
      <div className="pdp-mob-info px">
        <div className="pdp-topline" style={{ marginTop: '14px' }}>
          <span className="pdp-brand-link">{p.brand}</span>
          <span className="pdp-sku">SKU {sku}</span>
        </div>
        <h1 className="pdp-name" style={{ fontSize: '19px', marginTop: '6px' }}>{p.name}</h1>
        <div className="pdp-meta-row" style={{ marginBottom: '12px' }}>
          <Stars rating={parseFloat(p.rating)} size={14} />
          <span className="pdp-rev-link">{p.rating} · {rev} reviews</span>
          <span className="pdp-meta-sep" />
          <span className={`badge ${badgeClass}`}>{stockLabel}</span>
        </div>
        <div className="pdp-price-box" style={{ marginBottom: '12px' }}>
          {old && <span className="pdp-was">Was {fmt(old)}</span>}
          <div className="pdp-price-row">
            <span className="pdp-price" style={{ fontSize: '28px' }}>{fmt(p.price)}</span>
            {old && <span className="pdp-save-badge">Save {savePct}%</span>}
          </div>
          {old && <span className="pdp-save-amt">You save {fmt(saveAmt)}</span>}
        </div>
        <p className="pdp-desc">{p.shortDescription}</p>
        <div className="pdp-delivery-strip" style={{ marginTop: '14px' }}>
          <div className="pdp-delivery-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/></svg>
            <div><b>Free Delivery</b> on orders over $99</div>
          </div>
          <div className="pdp-delivery-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg>
            <div><b>{p.warranty?.duration ?? '2-Year'} Warranty</b> · {p.returns?.window ?? 30}-day returns</div>
          </div>
        </div>
      </div>

      {/* Mobile accordions */}
      <div className="accordion">
        {([
          {
            label: 'Specifications',
            content: (
              <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                <table className="spec-table">
                  <tbody>{SPECS.map(([l, v]) => <tr key={l}><td>{l}</td><td>{v}</td></tr>)}</tbody>
                </table>
              </div>
            ),
          },
          {
            label: `Reviews (${rev})`,
            content: p.reviews?.featured && p.reviews.featured.length > 0 ? (
              <div style={{ paddingBottom: '14px' }}>
                <div className="rev-big-score" style={{ flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', marginBottom: '16px' }}>
                  <span className="rev-score-num">{p.reviews.average.toFixed(1)}</span>
                  <div>
                    <Stars rating={p.reviews.average} size={14} />
                    <span className="muted" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>{p.reviews.total} reviews</span>
                  </div>
                </div>
                {p.reviews.featured.slice(0, 3).map(review => (
                  <div key={review.id} className="review-card" style={{ border: 'none', borderTop: '1px solid var(--border)', borderRadius: 0, padding: '12px 0', marginBottom: 0 }}>
                    <div className="review-card-head">
                      <div className="review-avatar">{review.author.charAt(0)}</div>
                      <div className="review-meta">
                        <strong className="review-author">{review.author}</strong>
                        <Stars rating={review.rating} size={12} />
                      </div>
                    </div>
                    <p className="review-title" style={{ marginTop: '6px' }}>{review.title}</p>
                    <p className="review-body">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>No reviews yet.</p>,
          },
          {
            label: 'Q&A',
            content: <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>Q&amp;A coming soon.</p>,
          },
        ] as const).map((item, i) => (
          <div key={item.label} className={`acc-item${openAcc === i ? ' open' : ''}`}>
            <button className="acc-head" onClick={() => setOpenAcc(openAcc === i ? null : i)}>
              {item.label} <span className="chev">▾</span>
            </button>
            <div className="acc-body">{item.content}</div>
          </div>
        ))}
      </div>

      {/* Mobile related */}
      {relatedProducts.length > 0 && (
        <>
          <div className="mobile-section-head">
            <h2 className="section-title" style={{ fontSize: '15px' }}>Frequently Bought Together</h2>
          </div>
          <div className="hscroll">
            {relatedProducts.map(rp => {
              const rpIc  = productIc(rp);
              const rpImg = productImg(rp);
              return (
                <Link key={rp.id} href={productPath(rp.id)} className="hcard">
                  <div className="hcard-img">
                    {rpImg
                      ? <img src={rpImg} alt={rp.name} style={{ width: '40px', height: '36px', objectFit: 'contain' }} />
                      : <svg width="40" height="36"><use href={`#${rpIc}`} /></svg>
                    }
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="pcard-brand">{rp.brand}</span>
                    <span className="pcard-name" style={{ fontSize: '12.5px' }}>{rp.name}</span>
                    <div className="pcard-foot" style={{ marginTop: 'auto' }}>
                      <span className="price" style={{ fontSize: '14px' }}>{fmt(rp.price)}</span>
                      <button className="add-btn" onClick={e => { e.preventDefault(); addToCart(rp.id, 1); showToast('Added ✓'); }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <div style={{ height: '80px' }} />

      {/* Mobile sticky buy bar */}
      <div className="sticky-buy">
        <div className="qty" role="group" aria-label="Quantity">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} aria-label="Increase">+</button>
        </div>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={outOfStock}>
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          className={`pdp-wish-btn${wishlist ? ' active' : ''}`}
          style={{ width: '48px', height: '48px' }}
          aria-label="Wishlist"
          onClick={toggleWishlist}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
