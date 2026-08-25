'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import { CATS } from '@/lib/data';

export default function Header() {
  const {
    theme, toggleTheme, cartCount,
    setView, toggleMobileDrawer, toggleFilterDrawer,
  } = useApp();

  return (
    <>
      <div className="topbar">
        🚚 <b>Free shipping</b> over $99 &nbsp;•&nbsp; 30-day easy returns &nbsp;•&nbsp; Expert build support 7 days a week
      </div>

      <header className="site-header">
        <div className="container header-main">
          {/* Hamburger */}
          <button
            className="icon-btn hamburger"
            aria-label="Open menu"
            onClick={toggleMobileDrawer}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Logo */}
          <a className="logo" onClick={() => setView('home')} href="#" aria-label="Vertex Computers home">
            <span className="logo-mark">V</span>
            <span>VERTEX<small>Computers</small></span>
          </a>

          {/* Search */}
          <div className="searchbar" role="search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              type="search"
              placeholder="Search GPUs, CPUs, RAM…"
              aria-label="Search products"
              onKeyDown={(e) => e.key === 'Enter' && setView('category')}
            />
          </div>

          {/* Actions */}
          <div className="header-actions">
            {/* Theme toggle */}
            <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4.5"/>
                  <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>
                </svg>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>
                </svg>
              )}
            </button>

            {/* Account */}
            <button className="icon-btn" aria-label="Account" onClick={() => setView('login')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21"/>
              </svg>
            </button>

            {/* Cart */}
            <button className="icon-btn" aria-label="Cart" onClick={() => setView('cart')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.6"/>
                <circle cx="17" cy="20" r="1.6"/>
                <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="cart-count" aria-label={`${cartCount} items in cart`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="catnav container" aria-label="Categories">
          <ul>
            {CATS.map((c, i) => (
              <li key={c.n}>
                <a
                  href="#"
                  className={i === 0 ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setView('category'); }}
                >
                  {c.n}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setView('category'); }}
                style={{ color: 'var(--danger)', fontWeight: 600 }}
              >
                🔥 Deals
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
