'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';

export default function MobileTopBar() {
  const { toggleMobileDrawer, setSearchOpen, cartCount, toggleCartDrawer } = useApp();

  return (
    <div className="topbar-app" aria-label="Top app bar">
      {/* Menu */}
      <button className="icon-btn" style={{ border: 0, background: 'none', width: 40, height: 40 }} aria-label="Open menu" onClick={toggleMobileDrawer}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Logo */}
      <Link href="/" className="app-logo" aria-label="Vertex Computers">
        <img src="/logo.png" alt="Vertex Computers" width={30} height={30} style={{ borderRadius: '8px', objectFit: 'contain', flexShrink: 0 }} />
        <span>VERTEX<small>Computers</small></span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Search */}
        <button
          className="icon-btn"
          style={{ border: 0, background: 'none', width: 40, height: 40 }}
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        </button>

        {/* Cart — opens side drawer */}
        <button
          onClick={toggleCartDrawer}
          aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          style={{ position: 'relative', width: 40, height: 40, display: 'grid', placeItems: 'center', color: 'var(--ink)', border: 0, background: 'none', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>
            <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
          </svg>
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '2px', background: 'var(--red)', color: '#fff', fontSize: '9px', fontWeight: 700, minWidth: '15px', height: '15px', borderRadius: '99px', display: 'grid', placeItems: 'center', padding: '0 3px' }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
