'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function MobileTopBar() {
  const { theme, toggleTheme, toggleMobileDrawer, setSearchOpen, setView } = useApp();

  return (
    <div className="topbar-app" aria-label="Top app bar">
      {/* Hamburger → bottom sheet */}
      <button className="icon-btn" aria-label="Open menu" onClick={toggleMobileDrawer}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Logo */}
      <a className="app-logo" href="#" aria-label="Vertex Computers" onClick={(e) => { e.preventDefault(); setView('home'); }}>
        <span className="logo-mark">V</span>
        <span>VERTEX<small>Computers</small></span>
      </a>

      {/* Search */}
      <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
      </button>

      {/* Theme toggle */}
      <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>
        {theme === 'light' ? (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.5"/>
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
