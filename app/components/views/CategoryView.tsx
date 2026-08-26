'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS } from '@/lib/data';
import ProductCard from '@/app/components/ui/ProductCard';

type SortKey = 'pop' | 'lo' | 'hi' | 'new';

function sortProducts(products: typeof PRODUCTS, key: SortKey) {
  const arr = [...products];
  if (key === 'lo') return arr.sort((a, b) => a.price - b.price);
  if (key === 'hi') return arr.sort((a, b) => b.price - a.price);
  if (key === 'new') return arr.sort((a, b) => b.id - a.id);
  return arr.sort((a, b) => b.rev - a.rev);
}

interface Props {
  /** Category name passed from the route (e.g. "GPUs"). Omit to show all. */
  activeCategory?: string;
}

export default function CategoryView({ activeCategory }: Props) {
  const { toggleFilterDrawer, showToast } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('pop');
  const sorted = sortProducts(PRODUCTS, sortKey);
  const title = activeCategory ?? 'All Components';

  return (
    <div>
      {/* Mobile sticky toolbar */}
      <div className="shop-toolbar-sticky">
        <span className="muted" style={{ fontSize: '12px' }}>
          <b style={{ color: 'var(--text-1)' }}>{sorted.length}</b> of 148
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={toggleFilterDrawer}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h18M6 12h12M10 19h4"/>
            </svg>
            Filters
          </button>
          <select
            aria-label="Sort by"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--text-1)', fontSize: '12.5px', fontWeight: 500 }}
          >
            <option value="pop">Popularity</option>
            <option value="lo">Price ↑</option>
            <option value="hi">Price ↓</option>
            <option value="new">Newest</option>
          </select>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> /
          <Link href="/shop">Components</Link> /
          <b style={{ color: 'var(--text-1)' }}>{title}</b>
        </div>

        <div className="shop-layout">
          {/* Sidebar filters */}
          <aside className="filters card">
            <h3>Filters</h3>
            <span className="muted" style={{ fontSize: '12.5px' }}>148 products</span>
            <FilterGroups showToast={showToast} />
          </aside>

          <div>
            {/* Desktop toolbar */}
            <div className="shop-toolbar">
              <span className="muted" style={{ fontSize: '13.5px' }}>
                <b style={{ color: 'var(--text-1)' }}>{sorted.length}</b> of 148 results
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary btn-sm filter-toggle" onClick={toggleFilterDrawer}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 5h18M6 12h12M10 19h4"/>
                  </svg>
                  Filters
                </button>
                <select
                  aria-label="Sort by"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                >
                  <option value="pop">Sort: Popularity</option>
                  <option value="lo">Price: Low → High</option>
                  <option value="hi">Price: High → Low</option>
                  <option value="new">Newest</option>
                </select>
              </div>
            </div>

            <div className="product-grid px">
              {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            <div className="pagination">
              <button aria-label="Previous">‹</button>
              <button className="on">1</button>
              <button>2</button>
              <button>3</button>
              <button>…</button>
              <button aria-label="Next">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroups({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <>
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
          <input placeholder="$ Min" inputMode="numeric" aria-label="Min price" /> —
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
        <label className="fopt"><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> In stock only</label>
        <label className="fopt"><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /> On sale</label>
      </div>
      <button className="btn btn-primary btn-block btn-sm" style={{ marginTop: '10px' }} onClick={() => showToast('Filters applied ✓')}>Apply Filters</button>
      <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '6px' }} onClick={() => showToast('Filters cleared')}>Clear all</button>
    </>
  );
}
