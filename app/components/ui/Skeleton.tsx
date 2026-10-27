'use client';

/**
 * Skeleton loading system
 * -----------------------
 * Every skeleton mirrors the exact DOM structure + CSS classes of the real
 * component it stands in for (ProductCard, Category page, Product page), so
 * the browser reserves identical space — zero layout shift when content
 * swaps in.
 *
 * Shimmer is driven by the `.skel` class + `@keyframes shimmer` in
 * globals.css. It animates ONLY transform (a translating gradient overlay),
 * keeping it compositor-friendly, and is disabled under
 * `prefers-reduced-motion`.
 */

/* ── Base shimmer block ─────────────────────────────────────── */
export function Skel({ w, h, r = 6, style }: { w?: number | string; h?: number | string; r?: number | string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className="skel"
      style={{
        display: 'block',
        width: w ?? '100%',
        height: h ?? 12,
        borderRadius: r,
        ...style,
      }}
    />
  );
}

/* Visually hidden live region so screen readers know items are loading */
function LoadAnnouncement({ label = 'Loading products…' }: { label?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute', width: 1, height: 1,
        margin: -1, padding: 0, overflow: 'hidden',
        clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
      }}
    >
      {label}
    </span>
  );
}

/* ── Product card skeleton ──────────────────────────────────── */
/**
 * Mirrors ProductCard: .pcard > .pcard-img (160px / 130px mobile via CSS)
 * + .pcard-body (brand, name, stars, spec chips, stock badge, foot with
 * price + add button). Mobile rules in globals.css apply automatically
 * (pcard-specs hidden ≤640px, etc.), so the skeleton matches at every
 * breakpoint.
 */
export function ProductCardSkeleton() {
  return (
    <div className="pcard" aria-hidden="true">
      <div className="pcard-img">
        <span className="skel" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      </div>
      <div className="pcard-body">
        <Skel w="38%" h={8} />
        <Skel w="92%" h={12} />
        <Skel w="68%" h={12} />
        <Skel w="55%" h={10} />
        <div className="pcard-specs">
          <Skel w={64} h={17} r={7} />
          <Skel w={52} h={17} r={7} />
        </div>
        <Skel w={78} h={18} r={99} style={{ alignSelf: 'flex-start' }} />
        <div className="pcard-foot">
          <Skel w={62} h={18} />
          <Skel w={36} h={36} r={10} />
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton grid (matches .product-grid) ──────────────────── */
export function SkeletonGrid({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div className={`product-grid${className ? ` ${className}` : ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

/* ── Full category page skeleton ────────────────────────────── */
/**
 * Mirrors CategoryView layout: breadcrumbs → shop-layout (sticky filter
 * sidebar on desktop + toolbar + results grid). The mobile sticky toolbar
 * and desktop toolbar are both represented by the same classes so the
 * correct one appears per breakpoint.
 */
export function CategoryPageSkeleton() {
  return (
    <div>
      <LoadAnnouncement />
      <div className="container">
        {/* Breadcrumb line */}
        <Skel w={180} h={13} r={99} style={{ margin: '28px 0 14px' }} />

        <div className="shop-layout">
          {/* Sidebar (desktop only — CSS hides it ≤1024px) */}
          <aside className="filters" aria-hidden="true">
            <div className="side-card">
              <div className="side-top">
                <Skel w={64} h={15} />
              </div>
              <div className="side-scroll">
                {[0, 1, 2].map(g => (
                  <fieldset className="fgroup" key={g}>
                    <legend><Skel w={72} h={11} /></legend>
                    {[0, 1, 2, 3, 4].map(r => (
                      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0' }}>
                        <Skel w={15} h={15} r={4} />
                        <Skel w={`${52 - (r % 3) * 8}%`} h={12} />
                      </div>
                    ))}
                  </fieldset>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="shop-toolbar">
              <Skel w={110} h={14} />
              <Skel w={160} h={38} r={10} />
            </div>
            {/* First batch of the infinite-scroll grid (no pagination UI anymore) */}
            <SkeletonGrid count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Product preview (PDP) skeleton ─────────────────────────── */
/**
 * Mirrors ProductView: desktop pdp grid (thumb rail + square main image +
 * info column) and the mobile gallery block — both share the real classes
 * so the right one renders per breakpoint with identical geometry.
 */
export function ProductViewSkeleton() {
  return (
    <div className="pdp-page">
      <LoadAnnouncement label="Loading product…" />
      <nav className="breadcrumbs container" aria-hidden="true">
        <Skel w={44} h={13} />
        <span className="bc-sep">/</span>
        <Skel w={56} h={13} />
        <span className="bc-sep">/</span>
        <Skel w={120} h={13} />
      </nav>

      {/* Desktop */}
      <div className="container pdp-desktop">
        <div className="pdp">
          <div className="pdp-gallery">
            <div className="pdp-thumbs-v">
              {[0, 1, 2, 3].map(i => <Skel key={i} w={72} h={72} r={10} />)}
            </div>
            <div className="pdp-main-img">
              <span className="skel" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
            </div>
          </div>

          <div className="pdp-info">
            <div className="pdp-topline">
              <Skel w={70} h={12} />
              <Skel w={86} h={18} r={6} />
            </div>
            <Skel w="80%" h={26} style={{ marginBottom: 14 }} />
            <Skel w="45%" h={14} style={{ marginBottom: 18 }} />

            <div className="pdp-price-box">
              <Skel w={54} h={12} style={{ marginBottom: 8 }} />
              <Skel w={130} h={34} />
            </div>

            <Skel w="100%" h={13} style={{ marginBottom: 7 }} />
            <Skel w="94%" h={13} style={{ marginBottom: 7 }} />
            <Skel w="66%" h={13} style={{ marginBottom: 20 }} />

            <div className="pdp-spec-chips">
              {[0, 1, 2, 3].map(i => (
                <div className="pdp-chip" key={i}>
                  <Skel w={44} h={9} style={{ marginBottom: 4 }} />
                  <Skel w={68} h={12} />
                </div>
              ))}
            </div>

            <hr className="pdp-divider" />

            <div className="pdp-actions">
              <div className="pdp-qty-row">
                <Skel w={30} h={13} />
                <Skel w={126} h={48} r={10} />
              </div>
              <div className="pdp-btn-row">
                <Skel w="100%" h={52} r={99} />
                <Skel w={52} h={52} r={10} />
              </div>
            </div>

            <div className="pdp-delivery-strip">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Skel w={16} h={16} />
                <Skel w="70%" h={12} />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Skel w={16} h={16} />
                <Skel w="60%" h={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="pdp-mob-gallery" aria-hidden="true">
        <div className="pdp-mob-img">
          <span className="skel" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        </div>
      </div>
      <div className="pdp-mob-info px">
        <Skel w={70} h={12} style={{ margin: '16px 0 10px' }} />
        <Skel w="85%" h={20} style={{ marginBottom: 10 }} />
        <Skel w="50%" h={13} style={{ marginBottom: 14 }} />
        <Skel w={110} h={30} />
      </div>
    </div>
  );
}

/* ── Default export: card skeleton (most common use) ────────── */
export default ProductCardSkeleton;
