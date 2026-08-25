'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import { CATS } from '@/lib/data';

export default function MobileSheets() {
  const { mobileDrawerOpen, filterDrawerOpen, closeDrawers, setView, showToast } = useApp();
  const anyOpen = mobileDrawerOpen || filterDrawerOpen;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`sheet-backdrop${anyOpen ? ' show' : ''}`}
        onClick={closeDrawers}
        aria-hidden="true"
      />

      {/* Mobile nav — bottom sheet */}
      <aside
        className={`bottom-sheet${mobileDrawerOpen ? ' show' : ''}`}
        aria-label="Menu"
        aria-hidden={!mobileDrawerOpen}
      >
        <div className="sheet-grip" />
        <div className="sheet-head">
          <b style={{ fontSize: '15px' }}>Menu</b>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close">✕</button>
        </div>
        <ul className="mobile-drawer-list">
          <li><a onClick={() => { setView('home'); closeDrawers(); }}>🏠 Home</a></li>
          {CATS.map((c) => (
            <li key={c.n}><a onClick={() => { setView('category'); closeDrawers(); }}>{c.n}</a></li>
          ))}
          <li><a onClick={() => { setView('login'); closeDrawers(); }}>👤 Account</a></li>
          <li><a onClick={() => { setView('cart'); closeDrawers(); }}>🛒 Cart</a></li>
        </ul>
      </aside>

      {/* Filter sheet */}
      <aside
        className={`bottom-sheet${filterDrawerOpen ? ' show' : ''}`}
        aria-label="Filters"
        aria-hidden={!filterDrawerOpen}
      >
        <div className="sheet-grip" />
        <div className="sheet-head">
          <b style={{ fontSize: '15px' }}>Filters</b>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close">✕</button>
        </div>
        <FilterContent showToast={showToast} />
        <button className="btn btn-primary btn-block" style={{ marginTop: '14px' }} onClick={closeDrawers}>
          Apply filters
        </button>
      </aside>
    </>
  );
}

function FilterContent({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <>
      <span className="muted" style={{ fontSize: '12px' }}>148 products</span>
      <div className="fgroup">
        <b>Category</b>
        {[['GPUs', '42'], ['CPUs', '28'], ['Motherboards', '25'], ['RAM', '19'], ['PSUs', '34']].map(([name, cnt], i) => (
          <label key={name} className="fopt">
            <input type="checkbox" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} />
            {name}<span className="cnt">{cnt}</span>
          </label>
        ))}
      </div>
      <div className="fgroup">
        <b>Brand</b>
        {[['Nova', '36'], ['Apex', '29'], ['Volt', '18'], ['Surge', '14'], ['Frost', '11']].map(([name, cnt]) => (
          <label key={name} className="fopt">
            <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
            {name}<span className="cnt">{cnt}</span>
          </label>
        ))}
      </div>
      <div className="fgroup">
        <b>Price Range</b>
        <div className="price-inputs">
          <input placeholder="$ Min" inputMode="numeric" aria-label="Min price" />
          —
          <input placeholder="$ Max" inputMode="numeric" aria-label="Max price" />
        </div>
      </div>
      <div className="fgroup">
        <b>VRAM</b>
        {[['8GB', '12'], ['12GB', '9'], ['16GB', '14'], ['24GB+', '7']].map(([name, cnt]) => (
          <label key={name} className="fopt">
            <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
            {name}<span className="cnt">{cnt}</span>
          </label>
        ))}
      </div>
      <div className="fgroup">
        <b>Availability</b>
        <label className="fopt">
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> In stock only
        </label>
        <label className="fopt">
          <input type="checkbox" style={{ accentColor: 'var(--accent)' }} /> On sale
        </label>
      </div>
    </>
  );
}
