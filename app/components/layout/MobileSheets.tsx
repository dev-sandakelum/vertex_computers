'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';

/* Icon map: category name → SVG path(s) */
const CAT_ICONS: Record<string, React.ReactNode> = {
  GPUs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2M2 12h1M21 12h1"/>
    </svg>
  ),
  CPUs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3"/>
    </svg>
  ),
  Motherboards: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="3" width="20" height="18" rx="2"/><rect x="6" y="7" width="5" height="5" rx="1"/><path d="M15 8h3M15 11h3M6 15h12"/>
    </svg>
  ),
  RAM: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8V6M10 8V6M13 8V6M16 8V6M7 16v2M10 16v2M13 16v2M16 16v2"/>
    </svg>
  ),
  PSUs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M12 9v6M9 12h6"/>
    </svg>
  ),
  Storage: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="6" width="18" height="5" rx="1"/><rect x="3" y="13" width="18" height="5" rx="1"/><circle cx="7" cy="8.5" r="1"/><circle cx="7" cy="15.5" r="1"/>
    </svg>
  ),
  Cooling: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>
    </svg>
  ),
  Cases: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 2v20M12 6h4M12 10h4M12 14h4"/>
    </svg>
  ),
  Peripherals: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="9" width="9" height="13" rx="2"/><path d="M7 9V6a5 5 0 0 1 10 0v3h-4"/><rect x="16" y="9" width="5" height="7" rx="1"/>
    </svg>
  ),
};

export default function MobileSheets() {
  const { mobileDrawerOpen, filterDrawerOpen, closeDrawers, cartCount, showToast } = useApp();
  const anyOpen = mobileDrawerOpen || filterDrawerOpen;

  return (
    <>
      <div className={`sheet-backdrop${anyOpen ? ' show' : ''}`} onClick={closeDrawers} aria-hidden="true" />

      {/* Nav drawer */}
      <aside className={`bottom-sheet${mobileDrawerOpen ? ' show' : ''}`} aria-label="Menu" aria-hidden={!mobileDrawerOpen}>
        <div className="sheet-grip" />

        {/* Header */}
        <div className="sheet-head" style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="logo-mark" style={{ width: '30px', height: '30px', fontSize: '14px' }}>V</span>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-.01em' }}>VERTEX</span>
          </div>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Shop categories */}
        <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-2)', padding: '14px 6px 8px' }}>
          Shop by Category
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '6px',
        }}>
          {CATS.map((c) => (
            <Link
              key={c.n}
              href={`/shop/${categorySlug(c.n)}`}
              onClick={closeDrawers}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 13px',
                borderRadius: '10px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-1)',
              }}
            >
              <span style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'var(--accent-soft)', color: 'var(--accent)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                {CAT_ICONS[c.n]}
              </span>
              {c.n}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />

        {/* Quick links */}
        <p style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-2)', padding: '0 6px 8px' }}>
          Quick Links
        </p>
        <ul style={{ listStyle: 'none', display: 'grid', gap: '2px' }}>
          <li>
            <Link href="/" onClick={closeDrawers} style={quickLinkStyle}>
              <span style={{ ...quickIconStyle, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>
                </svg>
              </span>
              Home
            </Link>
          </li>
          <li>
            <Link href="/shop?tag=deal" onClick={closeDrawers} style={{ ...quickLinkStyle, color: 'var(--danger)' }}>
              <span style={{ ...quickIconStyle, background: 'rgba(217,67,47,.1)', color: 'var(--danger)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z"/><path d="M12 6v6l4 2"/>
                </svg>
              </span>
              Deals
              <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, background: 'var(--danger)', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>Hot</span>
            </Link>
          </li>
          <li>
            <Link href="/account/login" onClick={closeDrawers} style={quickLinkStyle}>
              <span style={{ ...quickIconStyle, background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21"/>
                </svg>
              </span>
              Account
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={closeDrawers} style={quickLinkStyle}>
              <span style={{ ...quickIconStyle, background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>
                  <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
                </svg>
              </span>
              Cart
              {cartCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>{cartCount}</span>
              )}
            </Link>
          </li>
        </ul>
      </aside>

      {/* Filter sheet */}
      <aside className={`bottom-sheet${filterDrawerOpen ? ' show' : ''}`} aria-label="Filters" aria-hidden={!filterDrawerOpen}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <b style={{ fontSize: '15px' }}>Filters</b>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close">✕</button>
        </div>
        <FilterContent showToast={showToast} />
        <button className="btn btn-primary btn-block" style={{ marginTop: '14px' }} onClick={closeDrawers}>Apply filters</button>
      </aside>
    </>
  );
}

const quickLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '11px 8px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-1)',
  transition: 'background .12s',
};

const quickIconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '9px',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};

function FilterContent({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <>
      <span className="muted" style={{ fontSize: '12px' }}>148 products</span>
      <div className="fgroup">
        <b>Category</b>
        {[['GPUs', '42'], ['CPUs', '28'], ['Motherboards', '25'], ['RAM', '19'], ['PSUs', '34']].map(([n, cnt], i) => (
          <label key={n} className="fopt">
            <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} />{n}<span className="cnt">{cnt}</span>
          </label>
        ))}
      </div>
      <div className="fgroup">
        <b>Brand</b>
        {[['Nova', '36'], ['Apex', '29'], ['Volt', '18'], ['Surge', '14'], ['Frost', '11']].map(([n, cnt]) => (
          <label key={n} className="fopt">
            <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />{n}<span className="cnt">{cnt}</span>
          </label>
        ))}
      </div>
      <div className="fgroup">
        <b>Price Range</b>
        <div className="price-inputs">
          <input placeholder="$ Min" inputMode="numeric" aria-label="Min price" /> — <input placeholder="$ Max" inputMode="numeric" aria-label="Max price" />
        </div>
      </div>
      <div className="fgroup">
        <b>Availability</b>
        <label className="fopt"><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> In stock only</label>
        <label className="fopt"><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /> On sale</label>
      </div>
    </>
  );
}
