'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, fmt, STOCK_MAP, productPath, categorySlug, productIc, productImg, productOld, productRev, productSpecList, type StockLevel } from '@/lib/data';

interface Props {
  productId: number;
}

export default function ProductView({ productId }: Props) {
  const { addToCart, showToast } = useApp();
  const p = PRODUCTS.find(prod => prod.id === productId) ?? PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'qa'>('specs');
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];
  const ic = productIc(p);
  const img = productImg(p);
  const old = productOld(p);
  const rev = productRev(p);
  const catName = p.category;

  /* Active image — driven by thumb selection */
  const activeImg = p.images[activeThumb]?.url ?? img;

  /* Build spec table rows from the rich specs object */
  const SPECS: [string, string][] = Object.entries(p.specs ?? {}).slice(0, 12);
  if (SPECS.length === 0) {
    SPECS.push(
      ['Brand', p.brand],
      ['Price', fmt(p.price)],
      ['Rating', `${p.rating} stars · ${rev} reviews`],
      ['Stock', stockLabel],
    );
  }

  /* Related products — use the product's own relatedProductIds, fallback to first 4 */
  const relatedIds = (p.relatedProductIds ?? []).slice(0, 4);
  const relatedProducts = relatedIds
    .map(id => PRODUCTS.find(prod => prod.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  function handleAddToCart() {
    addToCart(p.id, qty);
    showToast(`Added to cart — ${p.name.split(' ').slice(0, 3).join(' ')} ✓`);
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="breadcrumbs container">
        <Link href="/">Home</Link> /
        <Link href={`/shop/${categorySlug(catName)}`}>{catName}</Link> /
        <b style={{ color: 'var(--text-1)' }}>{p.name.split(' ').slice(0, 4).join(' ')}</b>
      </div>

      {/* ── Desktop 2-col layout ── */}
      <div className="container">
        <div className="pdp">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="main-img" style={{ position: 'relative' }}>
              {activeImg
                ? <img src={activeImg} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <svg width="120" height="90"><use href={`#${ic}`} /></svg>
              }
            </div>
            <div className="thumbs">
              {p.images.slice(0, 4).map((image, i) => (
                <button
                  key={image.id}
                  className={i === activeThumb ? 'on' : ''}
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <img src={image.url} alt={image.alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pdp-info">
            <span className="pcard-brand">{p.brand} · SKU {p.sku ?? `${p.brand.toUpperCase().slice(0, 2)}-${String(p.id).padStart(3, '0')}`}</span>
            <h1>{p.name}</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="stars">★★★★★ <small>{p.rating} · {rev} reviews</small></span>
              <span className={`badge ${badgeClass}`}>{stockLabel}</span>
            </div>
            <div className="pdp-price">
              {old && <s>{fmt(old)}</s>}
              {fmt(p.price)}
            </div>
            {old && (
              <span className="save-note">
                You save {fmt(old - p.price)} ({Math.round((1 - p.price / old) * 100)}%)
              </span>
            )}
            <p className="muted" style={{ marginTop: '14px', fontSize: '13.5px' }}>
              {p.shortDescription}
            </p>

            {/* Desktop buy controls */}
            <div className="pdp-buy">
              <div className="qty" role="group" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
              </div>
              <button className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: '180px' }} onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" aria-label="Wishlist" onClick={() => showToast('Saved to wishlist ♡')}>
                ♡
              </button>
            </div>

            <div className="trust">
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/></svg>
                Free shipping over $99
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg>
                {p.warranty ? `${p.warranty.duration} warranty` : '2-year warranty'} · {p.returns ? `${p.returns.window}-day returns` : '30-day returns'}
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12l4 4L19 6"/></svg>
                Compatibility-checked with your cart
              </div>
              <div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
                Secure checkout · all major cards
              </div>
            </div>
          </div>
        </div>

        {/* Desktop spec table */}
        <div className="spec-section">
          <div className="tabs">
            <button className={activeTab === 'specs' ? 'on' : ''} onClick={() => setActiveTab('specs')}>
              Full Specifications
            </button>
            <button className={activeTab === 'reviews' ? 'on' : ''} onClick={() => setActiveTab('reviews')}>
              Reviews ({rev})
            </button>
            <button className={activeTab === 'qa' ? 'on' : ''} onClick={() => setActiveTab('qa')}>
              Q&amp;A
            </button>
          </div>
          <div className="card" style={{ borderTopLeftRadius: 0, overflow: 'hidden' }}>
            {activeTab === 'specs' && (
              <table className="spec-table">
                <tbody>
                  {SPECS.map(([label, value]) => (
                    <tr key={label}><td>{label}</td><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div style={{ padding: '20px' }}>
                {p.reviews?.featured && p.reviews.featured.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>
                          {p.reviews.average.toFixed(1)}
                        </div>
                        <div className="stars" style={{ fontSize: '18px' }}>★★★★★</div>
                        <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>{p.reviews.total} reviews</div>
                      </div>
                      {p.reviews.distribution && (
                        <div style={{ flex: 1, maxWidth: '280px' }}>
                          {[5,4,3,2,1].map(star => {
                            const count = p.reviews!.distribution[String(star)] ?? 0;
                            const pct = p.reviews!.total > 0 ? Math.round((count / p.reviews!.total) * 100) : 0;
                            return (
                              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', width: '30px', textAlign: 'right', color: 'var(--text-2)' }}>{star}★</span>
                                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                                </div>
                                <span style={{ fontSize: '11px', width: '28px', color: 'var(--text-2)' }}>{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {p.reviews.featured.map(review => (
                        <div key={review.id} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <b style={{ fontSize: '14px', color: 'var(--text-1)' }}>{review.author}</b>
                                {review.verified && (
                                  <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>✓ Verified</span>
                                )}
                              </div>
                              <div className="stars" style={{ fontSize: '13px', marginTop: '2px' }}>
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                            </div>
                            <span className="muted" style={{ fontSize: '12px' }}>{review.date}</span>
                          </div>
                          <b style={{ display: 'block', marginTop: '8px', fontSize: '13.5px', color: 'var(--text-1)' }}>{review.title}</b>
                          <p className="muted" style={{ fontSize: '13px', marginTop: '4px', lineHeight: 1.5 }}>{review.body}</p>
                          {review.helpful !== undefined && (
                            <span className="muted" style={{ fontSize: '12px' }}>👍 {review.helpful} found this helpful</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <p className="muted">No reviews yet for this product.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'qa' && (
              <div style={{ padding: '20px' }}>
                <p className="muted" style={{ fontSize: '13px' }}>
                  Have a question about this product?{' '}
                  <a href="#" className="link" onClick={e => e.preventDefault()}>Ask the community →</a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop related */}
        {relatedProducts.length > 0 && (
          <div className="spec-section">
            <div className="section-head"><h2 className="section-title">Frequently Bought Together</h2></div>
            <div className="product-grid">
              {relatedProducts.map((rp) => {
                const rpIc = productIc(rp);
                const rpImg = productImg(rp);
                return (
                  <Link key={rp.id} href={productPath(rp.id)} className="pcard">
                    <div className="pcard-img">
                      {rpImg
                        ? <img src={rpImg} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                        : <svg width="44" height="44"><use href={`#${rpIc}`} /></svg>
                      }
                    </div>
                    <div className="pcard-body">
                      <span className="pcard-brand">{rp.brand}</span>
                      <span className="pcard-name">{rp.name}</span>
                      <div className="pcard-foot">
                        <span className="price">{fmt(rp.price)}</span>
                        <button className="add-btn" onClick={(e) => { e.preventDefault(); addToCart(rp.id, 1); showToast('Added ✓'); }}>
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

      {/* ── Mobile-only info ── */}
      <div className="pdp-info-mobile px" style={{ paddingTop: '16px' }}>
        <span className="pcard-brand">{p.brand} · SKU {p.sku ?? `${p.brand.toUpperCase().slice(0, 2)}-${String(p.id).padStart(3, '0')}`}</span>
        <h1 style={{ fontSize: '19px' }}>{p.name}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="stars">★★★★★ <small>{p.rating} · {rev} reviews</small></span>
          <span className={`badge ${badgeClass}`}>{stockLabel}</span>
        </div>
        <div className="pdp-price" style={{ fontSize: '26px' }}>
          {old && <s style={{ fontSize: '14px' }}>{fmt(old)}</s>}
          {fmt(p.price)}
        </div>
        {old && <span className="save-note">You save {fmt(old - p.price)} ({Math.round((1 - p.price / old) * 100)}%)</span>}
        <p className="muted" style={{ marginTop: '12px', fontSize: '13.5px' }}>
          {p.shortDescription}
        </p>
        <div className="trust" style={{ marginTop: '16px' }}>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/></svg> Free shipping over $99</div>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg> {p.warranty ? `${p.warranty.duration} warranty` : '2-year warranty'} · {p.returns ? `${p.returns.window}-day returns` : '30-day returns'}</div>
          <div><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12l4 4L19 6"/></svg> Compatibility-checked</div>
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="accordion">
        {[
          {
            label: 'Full Specifications',
            content: (
              <table className="spec-table" style={{ marginBottom: '14px' }}>
                <tbody>{SPECS.map(([l, v]) => <tr key={l}><td>{l}</td><td>{v}</td></tr>)}</tbody>
              </table>
            ),
          },
          {
            label: `Reviews (${rev})`,
            content: p.reviews?.featured && p.reviews.featured.length > 0 ? (
              <div style={{ paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-1)' }}>{p.reviews.average.toFixed(1)}</span>
                  <div>
                    <div className="stars">★★★★★</div>
                    <span className="muted" style={{ fontSize: '11px' }}>{p.reviews.total} reviews</span>
                  </div>
                </div>
                {p.reviews.featured.slice(0, 3).map(review => (
                  <div key={review.id} style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <b style={{ fontSize: '13px' }}>{review.author}</b>
                      <span className="muted" style={{ fontSize: '11px' }}>{review.date}</span>
                    </div>
                    <div className="stars" style={{ fontSize: '12px' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <b style={{ display: 'block', fontSize: '12.5px', marginTop: '4px' }}>{review.title}</b>
                    <p className="muted" style={{ fontSize: '12.5px', marginTop: '3px' }}>{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>No reviews yet.</p>
            ),
          },
          {
            label: 'Q&A',
            content: <p className="muted" style={{ fontSize: '13px', paddingBottom: '14px' }}>Q&amp;A coming soon.</p>,
          },
        ].map((item, i) => (
          <div key={item.label} className={`acc-item${openAccordion === i ? ' open' : ''}`}>
            <button className="acc-head" onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
              {item.label} <span className="chev">▾</span>
            </button>
            <div className="acc-body">{item.content}</div>
          </div>
        ))}
      </div>

      {/* Mobile related hscroll */}
      {relatedProducts.length > 0 && (
        <>
          <div className="mobile-section-head">
            <h2 className="section-title" style={{ fontSize: '15px' }}>Frequently Bought Together</h2>
          </div>
          <div className="hscroll">
            {relatedProducts.map((rp) => {
              const rpIc = productIc(rp);
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
                      <button className="add-btn" onClick={(e) => { e.preventDefault(); addToCart(rp.id, 1); showToast('Added ✓'); }}>
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
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
        </div>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>Add to Cart</button>
        <button className="btn btn-secondary btn-lg" style={{ width: '48px', padding: 0 }} aria-label="Wishlist" onClick={() => showToast('Saved to wishlist ♡')}>♡</button>
      </div>
    </div>
  );
}
