'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import { CATS } from '@/lib/data';

export default function Drawers() {
  const { mobileDrawerOpen, filterDrawerOpen, closeDrawers, setView } = useApp();
  const anyOpen = mobileDrawerOpen || filterDrawerOpen;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${anyOpen ? ' show' : ''}`}
        onClick={closeDrawers}
        aria-hidden="true"
      />

      {/* Mobile nav drawer */}
      <aside
        className={`mobile-drawer${mobileDrawerOpen ? ' show' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileDrawerOpen}
      >
        <div className="drawer-head">
          <span className="logo">
            <span className="logo-mark">V</span>
            <span>VERTEX</span>
          </span>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close menu">✕</button>
        </div>
        <ul>
          <li>
            <a onClick={() => { setView('home'); closeDrawers(); }}>🏠 Home</a>
          </li>
          {CATS.map((c) => (
            <li key={c.n}>
              <a onClick={() => { setView('category'); closeDrawers(); }}>{c.n}</a>
            </li>
          ))}
          <li>
            <a onClick={() => { setView('login'); closeDrawers(); }}>👤 Account</a>
          </li>
          <li>
            <a onClick={() => { setView('cart'); closeDrawers(); }}>🛒 Cart</a>
          </li>
        </ul>
      </aside>

      {/* Filter drawer */}
      <aside
        className={`filter-drawer${filterDrawerOpen ? ' show' : ''}`}
        aria-label="Filters"
        aria-hidden={!filterDrawerOpen}
      >
        <div className="drawer-head">
          <h3>Filters</h3>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close filters">✕</button>
        </div>
        <FilterContent />
        <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={closeDrawers}>
          Apply filters
        </button>
      </aside>
    </>
  );
}

function FilterContent() {
  const { showToast } = useApp();
  return (
    <div>
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
        <b>Availability</b>
        <label className="fopt">
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> In stock only
        </label>
        <label className="fopt">
          <input type="checkbox" style={{ accentColor: 'var(--accent)' }} /> On sale
        </label>
      </div>
      <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '10px' }} onClick={() => showToast('Filters applied ✓')}>
        Apply Filters
      </button>
      <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '6px' }} onClick={() => showToast('Filters cleared')}>
        Clear all
      </button>
    </div>
  );
}
