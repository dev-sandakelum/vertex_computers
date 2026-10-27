'use client';

/**
 * CategoryView — shop / category page shell (Issue 1 rework).
 *
 * ARCHITECTURE
 *  Server Component (page.tsx)  fetches + renders the FIRST batch (12) for
 *                              SEO and fast first paint, plus the total count
 *                              and sidebar facet counts, and passes them here.
 *  <ProductGrid /> (client)    receives the first batch as props and loads
 *                              further batches from /api/products via
 *                              IntersectionObserver (infinite scroll).
 *
 * FILTER STATE LIVES IN THE URL
 *  Every filter (q, tag, brands, cats, min, max, stock, sale, sort) is a
 *  searchParam, so any grid state is shareable/bookmarkable. Changing a
 *  filter navigates (router.replace — no history spam), which re-renders the
 *  server component with a fresh first batch; <ProductGrid key={query}> then
 *  REMOUNTS, which resets the list, cursor and observer and aborts any
 *  in-flight request. The transition is wrapped by React, so the old grid
 *  stays visible until the new payload arrives (no skeleton flash).
 *
 * DELETED (old pagination)
 *  PAGE_SIZE / pageWindow() / page state / totalPages / safePage / pageItems
 *  and the entire <nav class="pagination"> markup — see git.patch.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { type Product } from '@/lib/data';
import {
  type CatalogQuery, type SortKey, type CatalogFacets,
  catalogQueryToSearchParams,
} from '@/lib/catalog';
import ProductGrid from '@/app/components/ui/ProductGrid';
import { SearchXIcon, FlameIcon } from '@/app/components/icons';

interface Props {
  activeCategory?: string;
  /** Parsed + validated query — authoritative filter state (from the URL). */
  query: CatalogQuery;
  /** First batch (BATCH_SIZE items) rendered by the server. */
  initialProducts: Product[];
  /** Total products matching the query (server-computed). */
  total: number;
  /** Sidebar facet counts (server-computed). */
  facets: CatalogFacets;
}

/* ── Sort select (desktop toolbar + mobile sticky toolbar) ──── */

function SortSelect({ sortKey, onSort, style, className }: {
  sortKey: SortKey; onSort: (k: SortKey) => void;
  style?: React.CSSProperties; className?: string;
}) {
  return (
    <select
      aria-label="Sort by"
      value={sortKey}
      className={className}
      style={style}
      onChange={(e) => onSort(e.target.value as SortKey)}
    >
      <option value="pop">Sort: Popularity</option>
      <option value="lo">Price: Low → High</option>
      <option value="hi">Price: High → Low</option>
      <option value="new">Newest First</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
}

export default function CategoryView({ activeCategory, query, initialProducts, total, facets }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const { toggleFilterDrawer } = useApp();

  const title = activeCategory ?? (query.tag === 'deal'
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>Hot Deals <FlameIcon size={17} style={{ color: 'var(--red)' }} /></span>
    : 'All Components');

  /* ── URL plumbing ────────────────────────────────────────── */

  /**
   * Replace the URL query string. `replace` (not `push`) keeps the history
   * clean — undoing 6 checkbox clicks with one Back press — while the URL
   * stays fully shareable. `scroll: false` — scroll reset is handled below.
   */
  const applyParams = useCallback((next: URLSearchParams) => {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  /** Set / remove a single param (null or '' removes). */
  const updateParam = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value == null || value === '') p.delete(key);
    else p.set(key, value);
    applyParams(p);
  }, [searchParams, applyParams]);

  /** Toggle one value inside a comma-separated list param (brands / cats). */
  const toggleListParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    const list = (p.get(key) ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
    if (next.length) p.set(key, next.join(','));
    else p.delete(key);
    applyParams(p);
  }, [searchParams, applyParams]);

  function handleSort(key: SortKey) {
    updateParam('sort', key === 'pop' ? null : key); // omit the default → clean URLs
  }

  function clearUrlQuery() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('q');
    applyParams(p);
  }

  function clearAllFilters() {
    router.replace(pathname, { scroll: false }); // strip every param
  }

  /* ── Price inputs: local drafts + debounced URL commit ────── */

  const [minDraft, setMinDraft] = useState(query.minPrice != null ? String(query.minPrice) : '');
  const [maxDraft, setMaxDraft] = useState(query.maxPrice != null ? String(query.maxPrice) : '');

  /* Re-sync drafts when the URL changes externally (chip removal, clear all).
     "Adjust state during render" — the React-sanctioned pattern this repo
     already uses — instead of a setState-in-effect cascade. */
  const [prevMin, setPrevMin] = useState(query.minPrice);
  const [prevMax, setPrevMax] = useState(query.maxPrice);
  if (query.minPrice !== prevMin || query.maxPrice !== prevMax) {
    setPrevMin(query.minPrice);
    setPrevMax(query.maxPrice);
    setMinDraft(query.minPrice != null ? String(query.minPrice) : '');
    setMaxDraft(query.maxPrice != null ? String(query.maxPrice) : '');
  }

  /* Debounced commit: typing "1", "15", "150" fires one navigation, not three. */
  useEffect(() => {
    const min = minDraft.trim();
    const max = maxDraft.trim();
    const minOk = min === '' || !Number.isNaN(Number.parseFloat(min));
    const maxOk = max === '' || !Number.isNaN(Number.parseFloat(max));
    if (!minOk || !maxOk) return; // wait for a parseable number (or empty)
    if (min === (query.minPrice != null ? String(query.minPrice) : '') &&
        max === (query.maxPrice != null ? String(query.maxPrice) : '')) return; // no change
    const t = window.setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (min) p.set('min', min); else p.delete('min');
      if (max) p.set('max', max); else p.delete('max');
      applyParams(p);
    }, 600);
    return () => window.clearTimeout(t);
  }, [minDraft, maxDraft, query.minPrice, query.maxPrice, searchParams, applyParams]);

  /* ── Scroll reset on query change (skip initial mount) ────── */

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const firstRenderRef = useRef(true);
  const queryStr = useMemo(() => catalogQueryToSearchParams(query).toString(), [query]);
  useEffect(() => {
    if (firstRenderRef.current) { firstRenderRef.current = false; return; }
    resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [queryStr]);

  /* ── Active filter summary (chips + count badge) ─────────── */

  const chips: { label: string; onRemove: () => void }[] = [];
  if (query.q) chips.push({ label: `"${query.q}"`, onRemove: clearUrlQuery });
  if (query.tag) chips.push({ label: `Tag: ${query.tag}`, onRemove: () => updateParam('tag', null) });
  query.brands.forEach(b => chips.push({ label: b, onRemove: () => toggleListParam('brands', b) }));
  query.cats.forEach(c => chips.push({ label: c, onRemove: () => toggleListParam('cats', c) }));
  if (query.inStockOnly) chips.push({ label: 'In Stock', onRemove: () => updateParam('stock', null) });
  if (query.onSaleOnly)  chips.push({ label: 'On Sale',  onRemove: () => updateParam('sale', null) });
  if (query.minPrice != null || query.maxPrice != null) {
    chips.push({
      label: `$${query.minPrice ?? '0'}–$${query.maxPrice ?? '∞'}`,
      onRemove: () => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete('min'); p.delete('max');
        applyParams(p);
      },
    });
  }

  const activeFilterCount = chips.length;

  const filterControls = {
    toggleBrand: useCallback((brand: string) => toggleListParam('brands', brand), [toggleListParam]),
    toggleCat: useCallback((cat: string) => toggleListParam('cats', cat), [toggleListParam]),
    setStock: useCallback((on: boolean) => updateParam('stock', on ? '1' : null), [updateParam]),
    setSale: useCallback((on: boolean) => updateParam('sale', on ? '1' : null), [updateParam]),
  };

  return (
    <div>
      {/* ── Mobile sticky toolbar ── */}
      <div className="shop-toolbar-sticky">
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          <b style={{ color: 'var(--ink)' }}>{total}</b> result{total !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleFilterDrawer}
            style={{ position: 'relative', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h18M6 12h12M10 19h4"/>
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--blue)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <SortSelect
            sortKey={query.sort}
            onSort={handleSort}
            style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '12.5px', fontWeight: 500 }}
          />
        </div>
      </div>

      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <Link href="/shop">Components</Link>
          <span className="bc-sep">/</span>
          <b className="bc-cur">{title}</b>
        </nav>

        <div className="shop-layout">
          {/* ── Sidebar (desktop) ── */}
          <aside className="filters" aria-label="Product filters">
            <div className="side-card">
              <div className="side-top">
                <h3>Filters</h3>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--fm)', fontSize: '12px', color: 'var(--muted)' }}>
                  {total} results
                </span>
                {activeFilterCount > 0 && (
                  <button className="clear-btn" onClick={clearAllFilters}>Clear all</button>
                )}
              </div>
              <div className="side-scroll">
                <FilterGroups
                  query={query}
                  facets={facets}
                  activeCategory={activeCategory}
                  minDraft={minDraft}
                  maxDraft={maxDraft}
                  setMinDraft={setMinDraft}
                  setMaxDraft={setMaxDraft}
                  {...filterControls}
                />
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div ref={resultsRef} className="shop-results">
            {/* Desktop toolbar */}
            <div className="shop-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                  <b style={{ color: 'var(--ink)' }}>{total}</b> result{total !== 1 ? 's' : ''}
                </span>
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="fchip"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'var(--blue-soft)', color: 'var(--blue-d)',
                      border: '1px solid #CBDBFF',
                      borderRadius: '99px', padding: '2px 8px 2px 10px',
                      fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      aria-label={`Remove filter: ${chip.label}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', padding: '0 2px', lineHeight: 1, fontSize: '13px' }}
                    >×</button>
                  </span>
                ))}
              </div>
              <SortSelect sortKey={query.sort} onSort={handleSort} />
            </div>

            {/* Grid — infinite scroll (server first batch + client batches).
                key = canonical query string → ANY filter/sort/category change
                remounts the grid: list, cursor and observer reset to batch 1
                and in-flight requests are aborted. */}
            {total === 0 ? (
              <div className="empty-state" style={{ border: '1.5px dashed var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
                <SearchXIcon size={52} style={{ margin: '0 auto 14px', color: 'var(--muted)', display: 'block', strokeWidth: 1.6 }} />
                <h3 style={{ color: 'var(--ink)', fontWeight: 800, marginBottom: '8px' }}>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <ProductGrid
                key={queryStr}
                initialProducts={initialProducts}
                total={total}
                apiQuery={queryStr}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        query={query}
        facets={facets}
        activeCategory={activeCategory}
        resultCount={total}
        onClearAll={clearAllFilters}
        minDraft={minDraft}
        maxDraft={maxDraft}
        setMinDraft={setMinDraft}
        setMaxDraft={setMaxDraft}
        {...filterControls}
      />
    </div>
  );
}

/* ── Filter groups (sidebar content, shared with the mobile drawer) ── */

interface FilterGroupsProps {
  query:        CatalogQuery;
  facets:       CatalogFacets;
  activeCategory?: string;
  toggleBrand:  (brand: string) => void;
  toggleCat:    (cat: string) => void;
  setStock:     (on: boolean) => void;
  setSale:      (on: boolean) => void;
  minDraft:     string;
  maxDraft:     string;
  setMinDraft:  (v: string) => void;
  setMaxDraft:  (v: string) => void;
}

function FilterGroups({
  query, facets, activeCategory,
  toggleBrand, toggleCat, setStock, setSale,
  minDraft, maxDraft, setMinDraft, setMaxDraft,
}: FilterGroupsProps) {
  return (
    <>
      {!activeCategory && (
        <fieldset className="fgroup">
          <legend>Category</legend>
          {facets.categories.map(cat => (
            <label key={cat.name} className="fopt">
              <input
                type="checkbox"
                checked={query.cats.includes(cat.name)}
                onChange={() => toggleCat(cat.name)}
                style={{ accentColor: 'var(--blue)' }}
              />
              {cat.name}<span className="cnt">{cat.count}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="fgroup">
        <legend>Brand</legend>
        {facets.brands.map(brand => (
          <label key={brand.name} className="fopt">
            <input
              type="checkbox"
              checked={query.brands.includes(brand.name)}
              onChange={() => toggleBrand(brand.name)}
              style={{ accentColor: 'var(--blue)' }}
            />
            {brand.name}<span className="cnt">{brand.count}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="fgroup">
        <legend>Price Range</legend>
        <div className="price-inputs">
          <input
            placeholder="$ Min"
            inputMode="numeric"
            aria-label="Min price"
            value={minDraft}
            onChange={e => setMinDraft(e.target.value)}
          />
          —
          <input
            placeholder="$ Max"
            inputMode="numeric"
            aria-label="Max price"
            value={maxDraft}
            onChange={e => setMaxDraft(e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="fgroup">
        <legend>Availability</legend>
        <label className="fopt">
          <input
            type="checkbox"
            checked={query.inStockOnly}
            onChange={e => setStock(e.target.checked)}
            style={{ accentColor: 'var(--blue)' }}
          />
          In stock only
        </label>
        <label className="fopt">
          <input
            type="checkbox"
            checked={query.onSaleOnly}
            onChange={e => setSale(e.target.checked)}
            style={{ accentColor: 'var(--blue)' }}
          />
          On sale
        </label>
      </fieldset>
    </>
  );
}

/* ── Mobile filter drawer ── */

interface FilterDrawerProps extends FilterGroupsProps {
  resultCount: number;
  onClearAll: () => void;
}

function FilterDrawer({
  query, facets, activeCategory, resultCount, onClearAll,
  toggleBrand, toggleCat, setStock, setSale,
  minDraft, maxDraft, setMinDraft, setMaxDraft,
}: FilterDrawerProps) {
  const { filterDrawerOpen, closeDrawers } = useApp();
  return (
    <>
      <div className={`fd-backdrop${filterDrawerOpen ? ' show' : ''}`} onClick={closeDrawers} aria-hidden="true" />
      <aside
        className={`filter-drawer${filterDrawerOpen ? ' show' : ''}`}
        aria-label="Filters"
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-head">
          <h3 style={{ fontWeight: 800, fontSize: '16px' }}>Filters</h3>
          <button
            className="icon-btn"
            style={{ border: 0, background: 'none' }}
            onClick={closeDrawers}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '16px' }}>
          <FilterGroups
            query={query}
            facets={facets}
            activeCategory={activeCategory}
            toggleBrand={toggleBrand}
            toggleCat={toggleCat}
            setStock={setStock}
            setSale={setSale}
            minDraft={minDraft}
            maxDraft={maxDraft}
            setMinDraft={setMinDraft}
            setMaxDraft={setMaxDraft}
          />
        </div>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onClearAll}>Clear all</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={closeDrawers}>
            Show {resultCount} result{resultCount !== 1 ? 's' : ''}
          </button>
        </div>
      </aside>
    </>
  );
}
