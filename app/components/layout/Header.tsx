'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';
import SearchSuggestions, { useSearchKeyboard } from '@/app/components/ui/SearchSuggestions';

export default function Header() {
  const { cartCount, toggleMobileDrawer, toggleCartDrawer, accountHref, authUser } = useApp();
  const router   = useRouter();
  const pathname = usePathname();

  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

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

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const initials = authUser
    ? `${authUser.firstName.slice(0,1)}${authUser.lastName.slice(0,1)}`.toUpperCase()
    : null;

  return (
    <>
      {/* Promo top bar */}
      <div className="topbar">
        🚚 <b>Free shipping</b> over $99 &nbsp;·&nbsp; 30-day easy returns &nbsp;·&nbsp; Expert build support 7 days a week
      </div>

      <header className="site-header">
        {/* ── Main row ── */}
        <div className="container header-main">
          {/* Hamburger (mobile) */}
          <button className="icon-btn hamburger" style={{ display: 'none' }} aria-label="Open menu" onClick={toggleMobileDrawer}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="logo" aria-label="Vertex Computers home">
            <img src="/logo.png" alt="Vertex Computers" width={34} height={34} style={{ borderRadius: '9px', objectFit: 'contain', flexShrink: 0 }} />
            <span>VERTEX<small>SMARTER BUILDS.</small></span>
          </Link>

          {/* Search */}
          <div className="searchbar-wrap" ref={wrapRef} role="search">
            <div className="searchbar">
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
              <button className="hgo" type="button" aria-label="Search" onClick={() => handleSubmit(query)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
              </button>
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
            <Link href={accountHref} className="hact" aria-label="Account">
              {initials ? (
                <span className="avatar-sm">{initials}</span>
              ) : (
                <svg className="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21"/>
                </svg>
              )}
              <span>
                <small>{authUser ? 'Hello' : 'Sign in'}</small>
                <b>{authUser ? authUser.firstName : 'Account'}</b>
              </span>
            </Link>

            <button
              className="hact"
              onClick={toggleCartDrawer}
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              style={{ border: 0, background: 'none', cursor: 'pointer' }}
            >
              <span className="cart-icon-wrap">
                <svg className="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* cart body */}
                  <path d="M6 2H3a1 1 0 0 0-.98.8L1 6h22l-1.8 9.4A2 2 0 0 1 19.24 17H8.76a2 2 0 0 1-1.96-1.6L5.12 6"/>
                  {/* wheels */}
                  <circle cx="9" cy="21" r="1.4"/>
                  <circle cx="17" cy="21" r="1.4"/>
                </svg>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </span>
              <span>
                <small>&nbsp;</small>
                <b>Cart</b>
              </span>
            </button>
          </div>
        </div>

        {/* ── Category bar ── */}
        <nav aria-label="Categories">
          <div className="container catnav-inner">
            <button className="cb-all" onClick={toggleMobileDrawer}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              All
            </button>
            {CATS.map((c) => (
              <Link
                key={c.n}
                href={`/shop/${categorySlug(c.n)}`}
                className={isActive(`/shop/${categorySlug(c.n)}`) ? 'active' : ''}
              >
                {c.n}
              </Link>
            ))}
            <Link href="/shop?tag=deal" className="deal">
              🔥 Deals
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
