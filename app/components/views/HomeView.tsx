'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, PRODUCTS } from '@/lib/data';
import ProductCard from '@/app/components/ui/ProductCard';
import SvgIcon from '@/app/components/ui/SvgIcon';

const FEATURED = [0, 1, 3, 4].map((i) => PRODUCTS[i]);
const DEALS = [2, 6, 10, 4].map((i) => PRODUCTS[i]);

const PROMOS = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12l4 4L19 6"/></svg>,
    title: 'Compatibility Checked',
    desc: 'Socket & wattage mismatches flagged',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z"/></svg>,
    title: '2-Year Warranty',
    desc: 'On every component we sell',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 8.7 8.7 0 0 1-3.8-.9L3 21l2.1-5.6a8 8 0 0 1-1-3.9A8.4 8.4 0 0 1 12.6 3.2 8.4 8.4 0 0 1 21 11.5Z"/></svg>,
    title: 'Live Expert Chat',
    desc: 'Real builders, 7 days a week',
  },
];

export default function HomeView() {
  const { setView, openProduct } = useApp();

  return (
    <div>
      {/* Promo band — mobile only (desktop uses topbar in Header) */}
      <div className="promo-band">
        🚚 <b>Free shipping</b> over $99 · 30-day returns · Live expert chat
      </div>

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="container">
        <div className="hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">New — Nova RTX 9090 Series</span>
            <h1>Build Your Dream Rig,<br />Part by Part.</h1>
            <p>Premium PC components with transparent specs, honest stock levels, and expert support.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm"
                style={{ background: '#fff', color: '#12233f', fontWeight: 700 }}
                onClick={() => setView('category')}
              >
                Shop the Sale →
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
                onClick={() => openProduct(0)}
              >
                Flagship GPU
              </button>
            </div>
            <div className="hero-chips">
              <span>⚡ 16GB GDDR7</span>
              <span>❄ Triple-Fan</span>
              <span>🎮 4K Ready</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="gpu-visual">
              <svg width="120" height="80"><use href="#i-gpu" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shop by Category — desktop grid ──────────── */}
      <div className="container desktop-cat-section">
        <div className="home-section">
          <div className="section-head">
            <h2 className="section-title">Shop by Category</h2>
            <a className="link" href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Browse all →</a>
          </div>
          <div className="cat-grid">
            {CATS.map((c) => (
              <div
                key={c.n}
                className="cat-tile"
                onClick={() => setView('category')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setView('category')}
                role="button"
              >
                <span className="cat-ic"><SvgIcon id={c.ic} width={30} height={30} /></span>
                {c.n}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile category hscroll */}
      <div className="mobile-section-head">
        <h2 className="section-title" style={{ fontSize: '18px' }}>Shop by Category</h2>
        <a className="link" href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>All →</a>
      </div>
      <div className="hscroll">
        {CATS.map((c) => (
          <div
            key={c.n}
            className="cat-scroll-tile"
            onClick={() => setView('category')}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setView('category')}
            role="button"
          >
            <span className="cat-ic"><SvgIcon id={c.ic} width={24} height={24} /></span>
            {c.n}
          </div>
        ))}
      </div>

      {/* ── Featured This Week ────────────────────────── */}
      <div className="container">
        <div className="home-section">
          <div className="section-head">
            <h2 className="section-title">Featured This Week</h2>
            <a className="link" href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>View all →</a>
          </div>
          <div className="product-grid">
            {FEATURED.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        {/* ── Hot Deals ─────────────────────────────────── */}
        <div className="home-section">
          <div className="section-head">
            <h2 className="section-title">Hot Deals 🔥</h2>
            <a className="link" href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>All →</a>
          </div>
          <div className="product-grid">
            {DEALS.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        {/* ── Desktop promo strip ────────────────────── */}
        <div className="promo-strip">
          {PROMOS.map((p) => (
            <div key={p.title} className="promo">
              <span className="p-ic">{p.icon}</span>
              <div><b>{p.title}</b><small>{p.desc}</small></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile promo list ─────────────────────────── */}
      <div className="px promo-list-mobile">
        {PROMOS.map((p) => (
          <div key={p.title} className="promo">
            <span className="p-ic">{p.icon}</span>
            <div><b>{p.title}</b><small>{p.desc}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
