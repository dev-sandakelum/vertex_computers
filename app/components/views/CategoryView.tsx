'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { PRODUCTS, categorySlug, type Product } from '@/lib/data';
import ProductCard from '@/app/components/ui/ProductCard';

type SortKey = 'pop' | 'lo' | 'hi' | 'new' | 'rating';

const PAGE_SIZE = 12;

const ALL_BRANDS     = Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();
const ALL_CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();

export interface FilterState {
  brands:      Set<string>;
  categories:  Set<string>;
  minPrice:    string;
  maxPrice:    string;
  inStockOnly: boolean;
  onSaleOnly:  boolean;
}

const DEFAULT_FILTERS: FilterState = {
  brands: new Set(), categories: new Set(),
  minPrice: '', maxPrice: '',
  inStockOnly: false, onSaleOnly: false,
};

function applyFilters(
  products: Product[],
  filters: FilterState,
  activeCategory: string | undefined,
  query: string,
  tag: string,
): Product[] {
  let r = products;
  if (activeCategory)          r = r.filter(p => p.category === activeCategory);
  if (!activeCategory && filters.categories.size > 0) r = r.filter(p => filters.categories.has(p.category));
  if (filters.brands.size > 0) r = r.filter(p => filters.brands.has(p.brand));
  const min = parseFloat(filters.minPrice), max = parseFloat(filters.maxPrice);
  if (!isNaN(min)) r = r.filter(p => p.price >= min);
  if (!isNaN(max)) r = r.filter(p => p.price <= max);
  if (filters.inStockOnly) r = r.filter(p => p.stock !== 'out');
  if (filters.onSaleOnly)  r = r.filter(p => p.oldPrice !== null && p.oldPrice > p.price);
  if (tag)   r = r.filter(p => p.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase())));
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    r = r.filter(p => {
      const sv = Object.values(p.specs ?? {}).join(' ').toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) || sv.includes(q) ||
        p.shortDescription?.toLowerCase().includes(q);
    });
  }
  return r;
}

function sortProducts(products: Product[], key: SortKey): Product[] {
  const a = [...products];
  switch (key) {
    case 'lo':     return a.sort((a, b) => a.price - b.price);
    case 'hi':     return a.sort((a, b) => b.price - a.price);
    case 'new':    return a.sort((a, b) => b.id - a.id);
    case 'rating': return a.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    default:       return a.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

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

interface Props { activeCategory?: string; }

export default function CategoryView({ activeCategory }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const urlQuery     = searchParams.get('q') ?? '';
  const urlTag       = searchParams.get('tag') ?? '';

  const { toggleFilterDrawer } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('pop');
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const title = activeCategory ?? (urlTag === 'deal' ? 'Hot Deals 🔥' : 'All Components');

  const resetPage = useCallback(() => setPage(1), []);

  function clearUrlQuery() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('q');
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    resetPage();
  }

  function clearAllFilters() {
    setFilters(DEFAULT_FILTERS);
    router.push(pathname);
    resetPage();
  }

  const filtered = useMemo(
    () => applyFilters(PRODUCTS, filters, activeCategory, urlQuery, urlTag),
    [filters, activeCategory, urlQuery, urlTag],
  );
  const sorted     = useMemo(() => sortProducts(filtered, sortKey), [filtered, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilterCount =
    (urlQuery ? 1 : 0) + (urlTag ? 1 : 0) +
    filters.brands.size + filters.categories.size +
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0);

  function handleSort(key: SortKey) { setSortKey(key); resetPage(); }

  /* chips */
  const chips: { label: string; onRemove: () => void }[] = [];
  if (urlQuery) chips.push({ label: `"${urlQuery}"`, onRemove: clearUrlQuery });
  if (urlTag)   chips.push({
    label: `Tag: ${urlTag}`,
    onRemove: () => {
      const p = new URLSearchParams(searchParams.toString());
      p.delete('tag');
      const qs = p.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
      resetPage();
    },
  });
  filters.brands.forEach(b => chips.push({ label: b, onRemove: () => { setFilters(f => { const s = new Set(f.brands); s.delete(b); return { ...f, brands: s }; }); resetPage(); } }));
  filters.categories.forEach(c => chips.push({ label: c, onRemove: () => { setFilters(f => { const s = new Set(f.categories); s.delete(c); return { ...f, categories: s }; }); resetPage(); } }));
  if (filters.inStockOnly) chips.push({ label: 'In Stock', onRemove: () => { setFilters(f => ({ ...f, inStockOnly: false })); resetPage(); } });
  if (filters.onSaleOnly)  chips.push({ label: 'On Sale',  onRemove: () => { setFilters(f => ({ ...f, onSaleOnly: false }));  resetPage(); } });
  if (filters.minPrice || filters.maxPrice) chips.push({ label: `$${filters.minPrice || '0'}–$${filters.maxPrice || '∞'}`, onRemove: () => { setFilters(f => ({ ...f, minPrice: '', maxPrice: '' })); resetPage(); } });

  return (
    <div>
      {/* ── Mobile sticky toolbar ── */}
      <div className="shop-toolbar-sticky">
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          <b style={{ color: 'var(--ink)' }}>{sorted.length}</b> result{sorted.length !== 1 ? 's' : ''}
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
            sortKey={sortKey}
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
                  {sorted.length} results
                </span>
                {activeFilterCount > 0 && (
                  <button className="clear-btn" onClick={clearAllFilters}>Clear all</button>
                )}
              </div>
              <div className="side-scroll">
                <FilterGroups
                  filters={filters}
                  setFilters={setFilters}
                  resetPage={resetPage}
                  activeCategory={activeCategory}
                />
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div>
            {/* Desktop toolbar */}
            <div className="shop-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                  <b style={{ color: 'var(--ink)' }}>{sorted.length}</b> result{sorted.length !== 1 ? 's' : ''}
                </span>
                {chips.map((chip) => (
                  <span
                    key={chip.label}
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
              <SortSelect sortKey={sortKey} onSort={handleSort} />
            </div>

            {/* Grid */}
            {pageItems.length === 0 ? (
              <div className="empty-state" style={{ border: '1.5px dashed var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}>
                <div className="big">🔍</div>
                <h3 style={{ color: 'var(--ink)', fontWeight: 800, marginBottom: '8px' }}>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  aria-label="Previous"
                  disabled={safePage === 1}
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={n === safePage ? 'on' : ''}
                    aria-label={`Page ${n}`}
                    aria-current={n === safePage ? 'page' : undefined}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >{n}</button>
                ))}
                <button
                  aria-label="Next"
                  disabled={safePage === totalPages}
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >›</button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        filters={filters}
        setFilters={setFilters}
        resetPage={resetPage}
        activeCategory={activeCategory}
        resultCount={sorted.length}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}

/* ── Filter groups ── */
interface FilterGroupsProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetPage: () => void;
  activeCategory?: string;
}

function FilterGroups({ filters, setFilters, resetPage, activeCategory }: FilterGroupsProps) {
  function toggleBrand(brand: string) {
    setFilters(f => { const s = new Set(f.brands); s.has(brand) ? s.delete(brand) : s.add(brand); return { ...f, brands: s }; });
    resetPage();
  }
  function toggleCategory(cat: string) {
    setFilters(f => { const s = new Set(f.categories); s.has(cat) ? s.delete(cat) : s.add(cat); return { ...f, categories: s }; });
    resetPage();
  }

  const scopedProducts = useMemo(
    () => activeCategory ? PRODUCTS.filter(p => p.category === activeCategory) : PRODUCTS,
    [activeCategory],
  );
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_BRANDS.forEach(b => { counts[b] = scopedProducts.filter(p => p.brand === b).length; });
    return counts;
  }, [scopedProducts]);
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach(c => { counts[c] = PRODUCTS.filter(p => p.category === c).length; });
    return counts;
  }, []);

  return (
    <>
      {!activeCategory && (
        <fieldset className="fgroup">
          <legend>Category</legend>
          {ALL_CATEGORIES.map(cat => (
            <label key={cat} className="fopt">
              <input type="checkbox" checked={filters.categories.has(cat)} onChange={() => toggleCategory(cat)} style={{ accentColor: 'var(--blue)' }} />
              {cat}<span className="cnt">{catCounts[cat]}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="fgroup">
        <legend>Brand</legend>
        {ALL_BRANDS.filter(b => (brandCounts[b] ?? 0) > 0).map(brand => (
          <label key={brand} className="fopt">
            <input type="checkbox" checked={filters.brands.has(brand)} onChange={() => toggleBrand(brand)} style={{ accentColor: 'var(--blue)' }} />
            {brand}<span className="cnt">{brandCounts[brand]}</span>
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
            value={filters.minPrice}
            onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); resetPage(); }}
          />
          —
          <input
            placeholder="$ Max"
            inputMode="numeric"
            aria-label="Max price"
            value={filters.maxPrice}
            onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); resetPage(); }}
          />
        </div>
      </fieldset>

      <fieldset className="fgroup">
        <legend>Availability</legend>
        <label className="fopt">
          <input type="checkbox" checked={filters.inStockOnly} onChange={e => { setFilters(f => ({ ...f, inStockOnly: e.target.checked })); resetPage(); }} style={{ accentColor: 'var(--blue)' }} />
          In stock only
        </label>
        <label className="fopt">
          <input type="checkbox" checked={filters.onSaleOnly} onChange={e => { setFilters(f => ({ ...f, onSaleOnly: e.target.checked })); resetPage(); }} style={{ accentColor: 'var(--blue)' }} />
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

function FilterDrawer({ filters, setFilters, resetPage, activeCategory, resultCount, onClearAll }: FilterDrawerProps) {
  const { filterDrawerOpen, closeDrawers } = useApp();
  return (
    <>
      <div className={`drawer-backdrop${filterDrawerOpen ? ' show' : ''}`} onClick={closeDrawers} aria-hidden="true" />
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
          <FilterGroups filters={filters} setFilters={setFilters} resetPage={resetPage} activeCategory={activeCategory} />
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
