'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { STOCK_MAP, fmt, productPath, productImg, productIc, productSpecList, productTag, type Product, type StockLevel } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product: p }: ProductCardProps) {
  const { addToCart, showToast } = useApp();
  const [badgeClass, stockLabel] = STOCK_MAP[p.stock as StockLevel];
  const href = productPath(p.id);
  const img = productImg(p);
  const ic = productIc(p);
  const specs = productSpecList(p);
  const tag = productTag(p);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p.id, 1);
    showToast(`Added to cart — ${p.name.split(' ').slice(0, 3).join(' ')} ✓`);
  }

  return (
    <Link href={href} className="pcard" aria-label={`${p.name} — ${fmt(p.price)}`}>
      <div className="pcard-img">
        {img
          ? <img src={img} alt={p.name} />
          : <svg width="44" height="44"><use href={`#${ic}`} /></svg>
        }
        {tag && (
          <span className="pcard-tag" style={{
            position: 'absolute', top: 8, left: 8,
            background: 'var(--danger)', color: '#fff',
            fontSize: '11px', fontWeight: 700,
            padding: '3px 9px', borderRadius: '99px',
            letterSpacing: '.02em',
          }}>
            {tag}
          </span>
        )}
      </div>
      <div className="pcard-body">
        <span className="pcard-brand">{p.brand}</span>
        <span className="pcard-name">{p.name}</span>
        <span className="stars">★★★★★ <small>{p.rating}</small></span>
        <div className="pcard-specs">
          {specs.slice(0, 2).map((s) => (
            <span key={s} className="badge-spec">{s}</span>
          ))}
        </div>
        <span className={`badge ${badgeClass}`} style={{ alignSelf: 'flex-start' }}>
          {stockLabel}
        </span>
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
