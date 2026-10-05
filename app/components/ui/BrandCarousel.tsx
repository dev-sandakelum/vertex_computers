'use client';

import { useRef } from 'react';
import brandsData from '@/lib/brands.json';

export interface Brand {
  id:       string;
  name:     string;
  logo:     string;
  tagline:  string;
  category: string;
  website:  string;
  featured: boolean;
}

const BRANDS: Brand[] = brandsData as Brand[];

export default function BrandCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    if (!trackRef.current || !trackRef.current.firstElementChild) return;
    const step = (trackRef.current.firstElementChild as HTMLElement).offsetWidth + 14;
    trackRef.current.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  }

  /* ── Brand card carousel (TechNova style) ── */
  return (
    <section className="brand-carousel-section" aria-label="Our partner brands">
      <div className="brand-carousel-header">
        <span className="brand-carousel-label">Trusted Brands</span>
      </div>

      <div className="bcar" role="region" aria-label="Brands">
        <button className="bc-btn prev" onClick={() => scroll(-1)} aria-label="Previous brands">‹</button>

        <div className="bc-track" ref={trackRef}>
          {BRANDS.slice(0, 16).map((b) => (
            <a
              key={b.id}
              href={b.website}
              className="bcard"
              title={`${b.name} — ${b.tagline}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={b.name}
            >
              <span className="bm">{b.name.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase()}</span>
              <span>
                <b>{b.name}</b>
                <small>{b.tagline}</small>
              </span>
            </a>
          ))}
        </div>

        <button className="bc-btn next" onClick={() => scroll(1)} aria-label="Next brands">›</button>
      </div>

      {/* Legacy auto-scroll strip (desktop wide view) */}
      <div className="brand-track-mask" style={{ marginTop: '18px' }}>
        <div className="brand-track">
          {/* First copy */}
          {BRANDS.map((b) => (
            <a
              key={`a-${b.id}`}
              href={b.website}
              className="brand-tile"
              title={`${b.name} — ${b.tagline}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const txt = el.parentElement;
                  if (txt) {
                    txt.textContent = b.name;
                    Object.assign(txt.style, {
                      fontWeight: '700', fontSize: '13px',
                      color: 'var(--muted)', letterSpacing: '.04em',
                    });
                  }
                }}
              />
            </a>
          ))}
          {/* Duplicate for seamless loop */}
          {BRANDS.map((b) => (
            <a
              key={`b-${b.id}`}
              href={b.website}
              className="brand-tile"
              title={`${b.name} — ${b.tagline}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden="true"
              tabIndex={-1}
            >
              <img
                src={b.logo}
                alt=""
                loading="lazy"
                draggable={false}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
