'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';
import SearchSuggestions, { useSearchKeyboard } from '@/app/components/ui/SearchSuggestions';

export default function Header() {
  const { theme, toggleTheme, cartCount, toggleMobileDrawer } = useApp();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(label: string) {
    setQuery(label);
    setFocused(false);
    router.push(`/shop?q=${encodeURIComponent(label)}`);
    inputRef.current?.blur();
  }

  function handleSubmit(q: string) {
    setFocused(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
    inputRef.current?.blur();
  }

  const { handleKeyDown } = useSearchKeyboard({
    query,
    onSelect: handleSelect,
    onSubmit: handleSubmit,
    onClose: () => setFocused(false),
  });

  return (
    <>
      <div className="topbar">
        🚚 <b>Free shipping</b> over $99 &nbsp;•&nbsp; 30-day easy returns &nbsp;•&nbsp; Expert build support 7 days a week
      </div>

      <header className="site-header">
        <div className="container header-main">
          {/* Hamburger (mobile) */}
          <button className="icon-btn hamburger" aria-label="Open menu" onClick={toggleMobileDrawer}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="logo" aria-label="Vertex Computers home">
            <span className="logo-mark">V</span>
            <span>VERTEX<small>Computers</small></span>
          </Link>

          {/* Search */}
          <div className="searchbar-wrap" ref={wrapRef} role="search">
            <div className="searchbar" style={{ maxWidth: 'none', flex: 1 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
              <input
                ref={inputRef}
                type="search"
                placeholder="Search GPUs, CPUs, RAM…"
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={focused}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
            </div>
            {focused && (
              <SearchSuggestions
                query={query}
                onSelect={handleSelect}
                onSubmit={handleSubmit}
                variant="dropdown"
              />
            )}
          </div>

          {/* Actions */}
          <div className="header-actions">
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
            <Link href="/account/login" className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21"/>
              </svg>
            </Link>
            <Link href="/cart" className="icon-btn" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.6"/>
                <circle cx="17" cy="20" r="1.6"/>
                <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Category nav */}
        <nav className="catnav container" aria-label="Categories">
          <ul>
            {CATS.map((c) => (
              <li key={c.n}>
                <Link href={`/shop/${categorySlug(c.n)}`}>{c.n}</Link>
              </li>
            ))}
            <li>
              <Link href="/shop?tag=deal" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                🔥 Deals
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
