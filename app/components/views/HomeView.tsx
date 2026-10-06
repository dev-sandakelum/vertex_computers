'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATS, categorySlug, fmt, type Product } from '@/lib/data';
import type { Brand } from '@/lib/db/brands';
import ProductCard from '@/app/components/ui/ProductCard';
import SvgIcon from '@/app/components/ui/SvgIcon';
import BrandCarousel from '@/app/components/ui/BrandCarousel';
import { useMemo } from 'react';

interface Props {
  products: Product[];
  brands:   Brand[];
}

/* ── Countdown timer ── */
function useCountdown() {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    function tick() {
      const end = new Date();
      end.setHours(23, 59, 59, 0);
      if (end.getTime() - Date.now() < 3600e3) end.setDate(end.getDate() + 1);
      const secs = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
      setTime({
        h: String(Math.floor(secs / 3600)).padStart(2, '0'),
        m: String(Math.floor((secs % 3600) / 60)).padStart(2, '0'),
        s: String(secs % 60).padStart(2, '0'),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

const PENDING_IMG = '/pending.png';

export default function HomeView({ products, brands }: Props) {
  const flagship     = products[0];
  const dealProduct  = products.find(p => p.oldPrice && p.categorySlug === 'peripherals') ?? products.find(p => p.oldPrice) ?? products[0];
  const freshProduct = products.find(p => /new/i.test(p.tags?.[0] ?? '')) ?? products[0];
  const DEALS        = [2, 6, 10, 4].map(i => products[i]).filter(Boolean);
  const time         = useCountdown();
  const trending     = useMemo(() => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5), [products]);
  const recommended  = useMemo(() => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(5, 10), [products]);

  return (
    <div>
      {/* ── Mobile promo band ── */}
      <div className="promo-band">
        🚚 <b>Free shipping</b> over $99 · 30-day returns · Live expert chat
      </div>

      <div className="container">
        {/* ══ TN Hero ══ */}
        <section className="tn-hero" aria-label="Hero">
          <div>
            <p className="tn-eye">NEXT GEN PC HARDWARE</p>
            <h1>A Faster Build<br /><span className="grad">Starts Here</span></h1>
            <p>Explore {products.length} hand-picked components, compatibility-checked and backed by real builders.</p>
            <Link href="/shop" className="btn btn-solid btn-lg">
              Shop Components
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
            </Link>
            <div className="tn-chips">
              <span>
                <svg className="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                Compatibility checked
              </span>
              <span>
                <svg className="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z"/></svg>
                2-year warranty
              </span>
              <span>
                <svg className="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Builder support
              </span>
            </div>
          </div>

          {/* Hero product card */}
          <div className="tn-art">
            <div className="hero-product-card">
              <span className="hpc-badge">New Release</span>
              <div className="hpc-icon">
                <svg width="96" height="64"><use href="#i-gpu" /></svg>
              </div>
              <div className="hpc-name">{flagship.name}</div>
              <div className="hpc-brand">{flagship.brand}</div>
              <div className="hpc-specs">
                {Object.values(flagship.specs).slice(0, 3).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="hpc-footer">
                <span className="hpc-price">{fmt(flagship.price)}</span>
                <span className="hpc-rating">★ {flagship.rating} <span style={{ opacity: .6 }}>({flagship.reviewCount})</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Category grid (desktop) ══ */}
        <div className="desktop-cat-section">
          <div className="sec-h" style={{ marginTop: '44px' }}>
            <h2>Shop by Category</h2>
            <Link href="/shop">Browse all →</Link>
          </div>
          <nav className="tn-cats" aria-label="Product categories">
            {CATS.map((c) => (
              <Link key={c.n} href={`/shop/${categorySlug(c.n)}`}>
                <span className="ci"><SvgIcon id={c.ic} width={36} height={36} /></span>
                {c.n}
              </Link>
            ))}
          </nav>
        </div>

        {/* ══ Category scroll (mobile) ══ */}
      </div>

      <div className="mobile-section-head">
        <h2 className="section-title" style={{ fontSize: '18px', paddingLeft: 0 }}>Shop by Category</h2>
        <Link href="/shop" className="link" style={{ paddingRight: 0 }}>All →</Link>
      </div>
      <div className="hscroll" role="navigation" aria-label="Product categories">
        {CATS.map((c) => (
          <Link key={c.n} href={`/shop/${categorySlug(c.n)}`} className="cat-scroll-tile">
            <span className="cat-ic"><SvgIcon id={c.ic} width={22} height={22} /></span>
            {c.n}
          </Link>
        ))}
      </div>

      <div className="container">
        {/* ══ Brand carousel ══ */}
        <BrandCarousel brands={brands} />

        {/* ══ Trending / Featured ══ */}
        <div className="sec-h">
          <h2>Trending Products</h2>
          <Link href="/shop">View All →</Link>
        </div>
        <div className="pg5">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* ══ Promo banners ══ */}
        <div className="tn-promos">
          {/* Flash deals */}
          <div className="promo flash" role="banner">
            <div>
              <h3>FLASH OFFERS</h3>
              <p>Top tech. Lower prices. Hurry, limited time only!</p>
              <Link href="/shop?tag=deal" className="btn btn-lg">
                Shop Now
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
              </Link>
              <div id="cdown" aria-live="polite">
                Ends in <b>{time.h}</b><i>:</i><b>{time.m}</b><i>:</i><b>{time.s}</b>
              </div>
            </div>
            <div className="promo-art" aria-hidden="true">
              <svg viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: 'auto' }}>
                <rect x="17" y="44" width="11" height="94" rx="2.5"/>
                <rect x="28" y="50" width="196" height="82" rx="8"/>
                <rect x="180" y="41" width="30" height="9" rx="2.5"/>
                <circle cx="78" cy="91" r="26"/><circle cx="162" cy="91" r="26"/>
                <circle cx="37" cy="58" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="37" cy="124" r="1.6" fill="currentColor" stroke="none"/>
              </svg>
            </div>
          </div>

          {/* New arrivals */}
          <div className="promo newa" role="banner">
            <span className="new-badge">NEW</span>
            <div>
              <h3>New Arrivals</h3>
              <p>Be the first to experience what&apos;s next!</p>
              <Link href={`/product/${freshProduct.id}/${freshProduct.slug}`} className="btn btn-lg">
                Explore Now
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
            <div className="promo-art" aria-hidden="true">
              <svg viewBox="0 0 240 180" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: 'auto' }}>
                <rect x="62" y="32" width="116" height="116" rx="10"/>
                <rect x="84" y="54" width="72" height="72" rx="5"/>
                <rect x="102" y="72" width="36" height="36" rx="3"/>
                <path d="M102 72l13-13"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ══ Recommended ══ */}
        <div className="sec-h">
          <h2>Recommended for You</h2>
          <Link href="/shop">View All →</Link>
        </div>
        <div className="pg5">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* ══ Hot Deals ══ */}
        <div className="sec-h">
          <h2>Hot Deals 🔥</h2>
          <Link href="/shop?tag=deal">All →</Link>
        </div>
        <div className="product-grid">
          {DEALS.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* ══ Feature strip ══ */}
        <div className="tn-feat" aria-label="Why shop with us">
          <div>
            <span className="fi">
              <svg className="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7h13v10H3zM16 10h4l1 3v4h-5M6 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 6 20ZM18 20a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 20Z"/></svg>
            </span>
            <span><b>Free Shipping</b><small>On orders over $99</small></span>
          </div>
          <div>
            <span className="fi">
              <svg className="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.6 8.6A8 8 0 0 1 19.6 9.4M19.4 15.4A8 8 0 0 1 4.4 14.6"/><path d="M19.8 4.5v5h-5M4.2 19.5v-5h5"/></svg>
            </span>
            <span><b>Easy Returns</b><small>Hassle-free within 30 days</small></span>
          </div>
          <div>
            <span className="fi">
              <svg className="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span><b>Live Support</b><small>Real builders, 7 days a week</small></span>
          </div>
          <div>
            <span className="fi">
              <svg className="ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
            </span>
            <span><b>Genuine Products</b><small>100% original &amp; trusted</small></span>
          </div>
        </div>

        {/* ══ Newsletter ══ */}
        <NewsletterSection />
      </div>

      {/* Mobile promo list */}
      <div className="px promo-list-mobile">
        {[
          { icon: '✓', title: 'Compatibility Checked', desc: 'Socket & wattage mismatches flagged' },
          { icon: '🛡', title: '2-Year Warranty',       desc: 'On every component we sell' },
          { icon: '💬', title: 'Live Expert Chat',      desc: 'Real builders, 7 days a week' },
        ].map((p) => (
          <div key={p.title} className="promo" style={{ borderRadius: '14px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'grid', placeItems: 'center', background: 'var(--blue-soft)', color: 'var(--blue)', fontSize: '18px', flexShrink: 0 }}>{p.icon}</span>
            <div><b style={{ display: 'block', fontSize: '14px' }}>{p.title}</b><small style={{ color: 'var(--muted)', fontSize: '12.5px' }}>{p.desc}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done,  setDone]  = useState(false);
  const [err,   setErr]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setErr(true); return; }
    setErr(false);
    setDone(true);
  }

  return (
    <section className="tn-news" aria-label="Newsletter signup">
      <div>
        <h3>Join <span className="grad">Vertex+</span></h3>
        <p>Exclusive deals, early access to new launches and personalised recommendations.</p>
      </div>
      <div>
        {!done ? (
          <>
            <form onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(false); }}
              />
              <button className="btn btn-solid" type="submit">Subscribe</button>
            </form>
            {err && <p className="news-err show">Please enter a valid email address.</p>}
          </>
        ) : (
          <p className="news-ok show">You&apos;re on the list — the first build guide lands Friday.</p>
        )}
      </div>
    </section>
  );
}
