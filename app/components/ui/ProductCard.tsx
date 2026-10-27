'use client';

/**
 * ProductCard — one catalog card (Issue 2: image optimization).
 *
 *  next/image      fill + sizes → AVIF/WebP, DPR-aware srcset, lazy by
 *                  default. The parent `.pcard-img` box is position:relative
 *                  with a fixed 160px height (130px mobile), so the image
 *                  area is fully reserved before load → zero CLS.
 *  quality 75      grid thumbnails only — the PDP keeps full-size images.
 *  priority        ONLY for the first 4 above-the-fold cards of the initial
 *                  server batch (prop set by ProductGrid). Batch-loaded and
 *                  home-page cards are always lazy.
 *  placeholder     shared neutral blurDataURL — per-image blur hashes aren't
 *                  available at build time for 723 remote CDN images, so a
 *                  tiny gradient data URL fades smoothly into the real photo.
 *  onError         swaps to the local /placeholder-product.png fallback.
 *  React.memo      appending a new batch re-renders the grid container but
 *                  skips re-rendering every existing card (same product
 *                  object references + stable context selectors).
 */

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/app/components/providers/AppProvider';
import {
  STOCK_MAP, fmt, productPath, productImg, productIc,
  productSpecList, productTag, type Product, type StockLevel,
} from '@/lib/data';

interface ProductCardProps {
  product: Product;
  /** Eager-load above-the-fold images (first 4 of the initial batch only). */
  priority?: boolean;
}

/** Local fallback for failed CDN images (see onError). */
const PLACEHOLDER_IMG = '/placeholder-product.png';

/**
 * Tiny (40×32) neutral gradient PNG as a data URL — shared blur placeholder
 * for every card. Generated once, ~200 bytes, stretches via object-fit.
 */
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAgCAIAAADvz61XAAAATElEQVR42u2WwQkAMAgDk9L9l+uz/87hFCWglwXk1BN97lMiS6FsO1RY8izi5IxTrU4RayBxarnwuLvHXC48bkmMxxB3+6vxmC/zVwqiGAMyCr3h3AAAAABJRU5ErkJggg==';

/**
 * Grid cell width estimate for the srcset:
 * mobile 2-up (≈50vw), tablet 3-up (≈33vw), desktop 4-up beside the filter
 * sidebar (≈25vw) — lets the optimizer send the smallest useful file.
 */
const GRID_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

function ProductCard({ product: p, priority = false }: ProductCardProps) {
  const { addToCart, showToast } = useApp();
  const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];
  const href = productPath(p.id);
  const img = productImg(p);
  const ic = productIc(p);
  const specs = productSpecList(p);
  const tag = productTag(p);

  /* One-way trip: a failed CDN image swaps to the local placeholder and
     never retries (guard avoids an infinite onError loop). */
  const [imgFailed, setImgFailed] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock === 'out') return;
    addToCart(p.id, 1);
    showToast(`Added to cart — ${p.name.split(' ').slice(0, 3).join(' ')} ✓`);
  }

  return (
    <Link href={href} className="pcard" aria-label={`${p.name} — ${fmt(p.price)}`}>
      {/* Image — .pcard-img is position:relative with a fixed height, so
          `fill` reserves the exact box (no layout shift) */}
      <div className="pcard-img">
        {img && !imgFailed ? (
          <Image
            src={img}
            alt={p.name}
            fill
            sizes={GRID_SIZES}
            quality={75}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
            onError={() => setImgFailed(true)}
          />
        ) : imgFailed ? (
          <Image
            src={PLACEHOLDER_IMG}
            alt={p.name}
            fill
            sizes={GRID_SIZES}
            quality={75}
          />
        ) : (
          <svg width="44%" height="44%" style={{ opacity: .5 }}>
            <use href={`#${ic}`} />
          </svg>
        )}
        {tag && (
          <span
            className="pcard-tag"
            style={{
              background: /sale/i.test(tag) ? 'var(--red)' : 'var(--blue)',
              color: '#fff', fontSize: '11px', fontWeight: 700,
              padding: '3px 9px', borderRadius: '99px', letterSpacing: '.02em',
            }}
          >
            {tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="pcard-body">
        <span className="pcard-brand">{p.brand}</span>
        <span className="pcard-name">{p.name}</span>

        {/* Rating */}
        <span className="stars">
          {'★'.repeat(Math.floor(parseFloat(p.rating)))}{'☆'.repeat(5 - Math.floor(parseFloat(p.rating)))}
          {' '}<small>{p.rating} ({p.reviewCount.toLocaleString()})</small>
        </span>

        {/* Spec chips */}
        <div className="pcard-specs">
          {specs.slice(0, 2).map((s) => (
            <span key={s} className="badge-spec">{s}</span>
          ))}
        </div>

        {/* Stock */}
        <span className={`badge ${badgeClass}`} style={{ alignSelf: 'flex-start' }}>
          {stockLabel}
        </span>

        {/* Price + CTA */}
        <div className="pcard-foot">
          <span className="price">
            {p.oldPrice && <s>{fmt(p.oldPrice)}</s>}
            {fmt(p.price)}
          </span>
          <button
            className="add-btn"
            aria-label={`Add ${p.name} to cart`}
            disabled={p.stock === 'out'}
            style={p.stock === 'out' ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
            onClick={handleAddToCart}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

/* Memoized: batch appends (new array in the grid) keep existing product
   object references → these cards skip re-rendering entirely. */
export default memo(ProductCard);
