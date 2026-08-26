'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';

export default function Drawers() {
  const { mobileDrawerOpen, filterDrawerOpen, closeDrawers, showToast } = useApp();

  return (
    <>
      <div className={`drawer-backdrop${mobileDrawerOpen || filterDrawerOpen ? ' show' : ''}`} onClick={closeDrawers} aria-hidden="true" />

      {/* Desktop side nav drawer */}
      <aside className={`mobile-drawer${mobileDrawerOpen ? ' show' : ''}`} aria-label="Mobile navigation">
        <div className="drawer-head">
          <Link href="/" className="logo" onClick={closeDrawers}>
            <span className="logo-mark">V</span>
            <span>VERTEX</span>
          </Link>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close">✕</button>
        </div>
        <ul>
          <li><Link href="/" onClick={closeDrawers}>🏠 Home</Link></li>
          {CATS.map((c) => (
            <li key={c.n}>
              <Link href={`/shop/${categorySlug(c.n)}`} onClick={closeDrawers}>{c.n}</Link>
            </li>
          ))}
          <li><Link href="/account/login" onClick={closeDrawers}>👤 Account</Link></li>
          <li><Link href="/cart" onClick={closeDrawers}>🛒 Cart</Link></li>
        </ul>
      </aside>

      {/* Desktop filter drawer */}
      <aside className={`filter-drawer${filterDrawerOpen ? ' show' : ''}`} aria-label="Filters">
        <div className="drawer-head">
          <h3>Filters</h3>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close">✕</button>
        </div>
        <FilterContent showToast={showToast} />
        <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={closeDrawers}>Apply filters</button>
      </aside>
    </>
  );
}

function FilterContent({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <>
      <span className="muted" style={{ fontSize: '12.5px' }}>148 products</span>
      {[['GPUs', '42'], ['CPUs', '28'], ['Motherboards', '25'], ['RAM', '19'], ['PSUs', '34']].length > 0 && (
        <div className="fgroup">
          <b>Category</b>
          {[['GPUs', '42'], ['CPUs', '28'], ['Motherboards', '25'], ['RAM', '19'], ['PSUs', '34']].map(([n, cnt], i) => (
            <label key={n} className="fopt">
              <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} />{n}<span className="cnt">{cnt}</span>
            </label>
          ))}
        </div>
      )}
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
      <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '10px' }} onClick={() => showToast('Filters applied ✓')}>Apply Filters</button>
      <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '6px' }} onClick={() => showToast('Filters cleared')}>Clear all</button>
    </>
  );
}
