'use client';

/**
 * ProductGrid — infinite-scroll product grid (Issue 1).
 *
 * Receives the FIRST batch from the Server Component (SEO + fast first
 * paint), then loads further batches from GET /api/products as the user
 * approaches the bottom of the list.
 *
 *  Trigger      IntersectionObserver on a sentinel <div> below the grid
 *               (rootMargin 300px → starts loading slightly before the
 *               sentinel is visible). No scroll-event listeners.
 *  Dedupe       one in-flight request at a time (loadingRef) + products
 *               deduped by id on append (Set).
 *  Loading UX   shimmer ProductCardSkeletons inside the grid — same cells,
 *               so the layout never jumps.
 *  End of list  observer disconnected + subtle "You've reached the end".
 *  Errors       "Failed to load. Retry" — retry resumes from the SAME
 *               offset (offsetRef is only advanced on success).
 *  Reset        the parent remounts this component (key = query string)
 *               whenever category/sort/filters change, which resets the
 *               list, cursor and observer, and the unmount cleanup ABORTS
 *               any in-flight request (AbortController).
 *  Back-nav     loaded batches + scroll offset are kept in sessionStorage
 *               (bounded + TTL'd) and restored on popstate navigations —
 *               see the notes around `lastNavWasPop` for why restore is
 *               popstate-only.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/data';
import { BATCH_SIZE } from '@/lib/catalog';
import ProductCard from '@/app/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/app/components/ui/Skeleton';

/* ── Props ─────────────────────────────────────────────────── */

interface ProductGridProps {
  /** First batch (BATCH_SIZE items) — server-rendered for SEO/LCP. */
  initialProducts: Product[];
  /** Total products matching the current query (server-computed). */
  total: number;
  /**
   * Canonical query string for the current filter/sort state (e.g.
   * "category=GPUs&sort=lo") WITHOUT offset/limit. Doubles as the component
   * identity: the parent uses it as `key`, so any change = full reset.
   */
  apiQuery: string;
}

/** Server-rendered above-the-fold images get `priority`; everything else lazy-loads. */
const PRIORITY_COUNT = 4;

/* ── popstate detection (client only) ─────────────────────────── */

/**
 * True for a short window after a browser back/forward navigation.
 * sessionStorage restore is gated on this flag for two reasons:
 *  1. Hydration safety — on a hard load the server HTML contains only the
 *     first batch; restoring more items during the first client render
 *     would be a structural hydration mismatch.
 *  2. Fresh navigations (clicking a category link) intentionally start
 *     from batch 1 — only back/forward should rehydrate scroll context.
 *
 * TWO listeners, because Next.js 16 renders the destination route during
 * the Navigation API's interceptable `navigate` event on Chromium — BEFORE
 * `popstate` is dispatched — so a popstate-only flag would be set too late.
 * The navigate listener covers Chromium; popstate covers the rest.
 */
let lastNavWasPop = false;
if (typeof window !== 'undefined') {
  const markPop = () => {
    lastNavWasPop = true;
    window.setTimeout(() => { lastNavWasPop = false; }, 1000);
  };
  /* Chromium: Navigation API — "traverse" = back/forward (link clicks are "push"). */
  type NavigationLike = { addEventListener(type: 'navigate', listener: (e: { navigationType: string }) => void): void };
  (window as unknown as { navigation?: NavigationLike }).navigation
    ?.addEventListener('navigate', (e) => {
      if (e.navigationType === 'traverse') markPop();
    });
  /* Everyone else: popstate fires before Next's listener renders the route. */
  window.addEventListener('popstate', markPop);
}

/* ── sessionStorage cache (bounded + TTL'd) ─────────────────── */

const ITEMS_KEY_PREFIX = 'vx-cat-items-';
const SCROLL_KEY_PREFIX = 'vx-cat-scroll-';
/** Cache expiry — bounds staleness of restored lists. */
const RESTORE_TTL_MS = 15 * 60 * 1000;
/** Cap cached items (~20 batches) so a giant category can't blow the 5MB quota. */
const MAX_CACHED_ITEMS = 240;

interface StoredState { t: number; items: Product[]; }

function readStoredItems(key: string, total: number): Product[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredState;
    if (Date.now() - data.t > RESTORE_TTL_MS) { sessionStorage.removeItem(key); return null; }
    if (!Array.isArray(data.items) || data.items.length === 0) return null;
    const looksValid = data.items.every(p =>
      p && typeof p.id === 'number' && typeof p.name === 'string' && typeof p.price === 'number');
    if (!looksValid) return null;
    return data.items.slice(0, Math.min(total, MAX_CACHED_ITEMS));
  } catch {
    return null;
  }
}

/** Server batch wins on id collisions (fresher data), stored extras append. */
function mergeBatches(server: Product[], stored: Product[]): Product[] {
  const seen = new Set(server.map(p => p.id));
  const out = [...server];
  for (const p of stored) {
    if (!seen.has(p.id)) { out.push(p); seen.add(p.id); }
  }
  return out;
}

/** Keep only the current category's cache entries (storage stays bounded). */
function pruneOtherKeys(keepItems: string, keepScroll: string): void {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k) continue;
      if ((k.startsWith(ITEMS_KEY_PREFIX) && k !== keepItems) ||
          (k.startsWith(SCROLL_KEY_PREFIX) && k !== keepScroll)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach(k => sessionStorage.removeItem(k));
  } catch { /* storage unavailable — ignore */ }
}

/* ── Component ─────────────────────────────────────────────── */

export default function ProductGrid({ initialProducts, total, apiQuery }: ProductGridProps) {
  const itemsKey = ITEMS_KEY_PREFIX + apiQuery;
  const scrollKey = SCROLL_KEY_PREFIX + apiQuery;

  /* items: first batch, or first batch + sessionStorage extras on back-nav */
  const [items, setItems] = useState<Product[]>(() => {
    if (!lastNavWasPop) return initialProducts;
    const stored = readStoredItems(itemsKey, total);
    return stored ? mergeBatches(initialProducts, stored) : initialProducts;
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  /* End-of-list flag: state for rendering (never read refs during render),
     mirrored into a ref for the loadMore guard (callback scope). */
  const [done, setDone] = useState(items.length >= total);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const endRef = useRef(items.length >= total);
  const abortRef = useRef<AbortController | null>(null);

  /* Mirror of `items` for callback scopes (fetch continuation). Kept in sync
     by the effect below AND directly in loadMore — the only mutation path —
     so it can never drift within a mount (filter changes remount instead). */
  const itemsRef = useRef(items);

  /** Derived: all matching products have been rendered. */
  const finished = done || items.length >= total;

  useEffect(() => { itemsRef.current = items; }, [items]);

  /* Abort any in-flight batch request when the grid resets (filter/sort/
     category change remounts this component) or the route is left. */
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  /* Persist loaded batches (bounded) so back-navigation can restore them. */
  useEffect(() => {
    if (items.length <= initialProducts.length) return; // nothing extra yet
    try {
      const payload: StoredState = { t: Date.now(), items: items.slice(0, MAX_CACHED_ITEMS) };
      sessionStorage.setItem(itemsKey, JSON.stringify(payload));
      pruneOtherKeys(itemsKey, scrollKey);
    } catch { /* quota exceeded / disabled storage — caching is best-effort */ }
  }, [items, itemsKey, scrollKey, initialProducts.length]);

  /* Track scroll offset (throttled to one write per animation frame). */
  useEffect(() => {
    let scheduled = false;
    const save = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        try { sessionStorage.setItem(scrollKey, String(Math.round(window.scrollY))); } catch { /* ignore */ }
      });
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [scrollKey]);

  /* After a popstate restore (initial list longer than the server batch),
     re-apply the saved scroll offset once the full-height list has painted.
     Belt-and-braces on top of the router's own scroll restoration. */
  useEffect(() => {
    if (items.length <= initialProducts.length) return; // nothing was restored
    let savedY = 0;
    try { savedY = Number.parseInt(sessionStorage.getItem(scrollKey) ?? '0', 10) || 0; } catch { /* ignore */ }
    if (savedY <= 0) return;
    const raf = requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - savedY) > 8) window.scrollTo({ top: savedY, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore-once on mount; items/initialProducts are first-render constants for this mount
  }, [scrollKey]);

  /* ── Batch loading ───────────────────────────────────────── */

  const loadMore = useCallback(() => {
    const offset = itemsRef.current.length;                 // fetch cursor = loaded count
    if (loadingRef.current || endRef.current || offset >= total) return;
    loadingRef.current = true;
    setStatus('loading');

    const limit = Math.max(1, Math.min(BATCH_SIZE, total - offset));
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    fetch(`/api/products?${apiQuery}&offset=${offset}&limit=${limit}`, { signal: ctrl.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<{ products: Product[]; total: number }>;
      })
      .then(data => {
        /* Dedupe by id — offsets can shift if the catalog changed since the
           last batch; duplicates are always dropped. */
        const prev = itemsRef.current;
        const seen = new Set(prev.map(p => p.id));
        const fresh = data.products.filter(p => !seen.has(p.id));
        if (fresh.length > 0) {
          const next = [...prev, ...fresh];
          itemsRef.current = next;
          setItems(next);
        }
        /* End conditions: empty/duplicate-only batch, short batch, or the
           server's total says we've seen everything. The cursor is NOT
           advanced on the error path, so Retry resumes from the same offset. */
        if (fresh.length === 0 || data.products.length < limit || data.total <= offset + fresh.length) {
          endRef.current = true;
          setDone(true);
        }
        setStatus('idle');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return; // superseded by a filter change
        setStatus('error');
      })
      .finally(() => { loadingRef.current = false; });
  }, [apiQuery, total]);

  /* ── IntersectionObserver (rootMargin 300px = pre-fetch) ──── */

  useEffect(() => {
    if (finished || status === 'error') return;  // stop observing at the end / while showing retry
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) loadMore(); },
      { rootMargin: '300px 0px 0px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [finished, status, loadMore, items.length]); // re-arm after each batch / status change

  /* ── Render ──────────────────────────────────────────────── */

  if (total === 0) return null; // parent renders the empty state

  const skeletonCount = Math.max(1, Math.min(BATCH_SIZE, total - items.length));

  return (
    <>
      <div className="product-grid">
        {items.map((p, i) => (
          /* priority: first 4 of the initial batch only — on a hard load the
             restored list is gated off, and on popstate restores the images
             are already in cache, so this stays LCP-correct in every case. */
          <ProductCard key={p.id} product={p} priority={i < PRIORITY_COUNT} />
        ))}
        {/* Batch skeletons occupy real grid cells → zero layout jump */}
        {status === 'loading' && (
          Array.from({ length: skeletonCount }, (_, i) => <ProductCardSkeleton key={`skel-${i}`} />)
        )}
      </div>

      {/* Screen-reader progress / completion announcements */}
      <span className="sr-only" role="status" aria-live="polite">
        {status === 'loading' ? 'Loading more products…' : finished ? `All ${total} products loaded` : ''}
      </span>

      {/* Error → retry resumes from the same cursor (offsetRef untouched) */}
      {status === 'error' && (
        <div className="grid-more-error" role="alert">
          <span>Failed to load more products.</span>
          <button className="btn btn-secondary btn-sm" onClick={() => { setStatus('idle'); loadMore(); }}>
            Retry
          </button>
        </div>
      )}

      {/* Sentinel — observed with 300px rootMargin; unmounted once done */}
      {!finished && status !== 'error' && <div ref={sentinelRef} className="io-sentinel" aria-hidden="true" />}

      {finished && items.length > 0 && (
        <p className="grid-end" role="status">
          You&apos;ve reached the end — {items.length} of {total} product{total !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
