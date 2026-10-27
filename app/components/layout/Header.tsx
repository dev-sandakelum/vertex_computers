'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';
import SearchSuggestions, { useSearchKeyboard } from '@/app/components/ui/SearchSuggestions';
import {
  TruckIcon, FlameIcon, UserIcon, ChevronDownIcon,
  SettingsIcon, SignOutIcon, OrdersIcon, SearchIcon,
} from '@/app/components/icons';

/* Scroll threshold (px) before the header may compact */
const COMPACT_AFTER = 140;

export default function Header() {
  const {
    cartCount, toggleMobileDrawer, toggleCartDrawer, accountHref,
    authUser, signOut, showToast,
  } = useApp();
  const router   = useRouter();
  const pathname = usePathname();

  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const acctRef  = useRef<HTMLDivElement>(null);

  /* ── Account dropdown ── */
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Compact navbar on scroll (Task 5b) ── */
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > COMPACT_AFTER && y > lastY.current + 4) setCompact(true);
      else if (y < lastY.current - 4 || y <= COMPACT_AFTER) setCompact(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const expandHeader = useCallback(() => {
    setCompact(false);
    // Wait for the expand transition before focusing the input
    setTimeout(() => inputRef.current?.focus(), 280);
  }, []);

  /* Close search suggestions on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Close the account menu with Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Close menu on route change — "adjust state during render" pattern
     (setState during render is the sanctioned way to sync to prop changes) */
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

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

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    showToast('Signed out. See you soon!');
    router.push('/');
  }

  return (
    <>
      {/* Promo top bar */}
      <div className="topbar">
        <TruckIcon size={14} style={{ display: 'inline-block', verticalAlign: '-2px', color: 'var(--blue)' }} />
        {' '}<b>Free shipping</b> over $99 &nbsp;·&nbsp; 30-day easy returns &nbsp;·&nbsp; Expert build support 7 days a week
      </div>

      <header className={`site-header${compact ? ' compact' : ''}`}>
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

          {/* Search — collapses smoothly when the header is compact */}
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
            {/* Expand-search button — only visible while compact */}
            {compact && (
              <button className="hact hact-search" onClick={expandHeader} aria-label="Expand search">
                <SearchIcon size={22} />
              </button>
            )}

            {/* Account: avatar (picture → initials → icon) + dropdown when signed in */}
            {authUser ? (
              <div className="acct-wrap" ref={acctRef}>
                <button
                  className="hact"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={`Account menu for ${authUser.fullName}`}
                  onClick={() => setMenuOpen(o => !o)}
                >
                  <span className="avatar-sm">
                    {initials ?? <UserIcon size={15} />}
                    {authUser.picture && (
                      <img
                        src={authUser.picture}
                        alt=""
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </span>
                  <span>
                    <small>Hello</small>
                    <b>{authUser.firstName}</b>
                  </span>
                  <ChevronDownIcon size={13} className={`acct-chev${menuOpen ? ' open' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="acct-menu" role="menu" aria-label="Account menu">
                    <div className="acct-menu-head">
                      <span className="avatar-sm">
                        {initials}
                        {authUser.picture && (
                          <img src={authUser.picture} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        )}
                      </span>
                      <span className="acct-menu-user">
                        <b>{authUser.fullName}</b>
                        <small>{authUser.email}</small>
                      </span>
                    </div>
                    <Link role="menuitem" href="/account?tab=profile" className="acct-menu-item">
                      <UserIcon size={15} /> Profile
                    </Link>
                    <Link role="menuitem" href="/account?tab=orders" className="acct-menu-item">
                      <OrdersIcon size={15} /> Orders
                    </Link>
                    <Link role="menuitem" href="/account?tab=settings" className="acct-menu-item">
                      <SettingsIcon size={15} /> Settings
                    </Link>
                    <button role="menuitem" className="acct-menu-item acct-signout" onClick={handleSignOut}>
                      <SignOutIcon size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={accountHref} className="hact" aria-label="Sign in to your account">
                <span className="avatar-sm avatar-ghost">
                  <UserIcon size={15} />
                </span>
                <span>
                  <small>Sign in</small>
                  <b>Account</b>
                </span>
              </Link>
            )}

            {/* Cart */}
            <button
              className="hact"
              onClick={toggleCartDrawer}
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              style={{ border: 0, background: 'none', cursor: 'pointer' }}
            >
              <span className="cart-icon-wrap">
                <svg className="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2H3a1 1 0 0 0-.98.8L1 6h22l-1.8 9.4A2 2 0 0 1 19.24 17H8.76a2 2 0 0 1-1.96-1.6L5.12 6"/>
                  <circle cx="9" cy="21" r="1.4"/>
                  <circle cx="17" cy="21" r="1.4"/>
                </svg>
                {cartCount > 0 && <span className="cart-count" key={cartCount}>{cartCount}</span>}
              </span>
              <span>
                <small>{cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? 's' : ''}` : 'Your'}</small>
                <b>Cart</b>
              </span>
            </button>
          </div>
        </div>

        {/* ── Category bar (hides when compact) ── */}
        <nav className="catnav" aria-label="Categories">
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
              <FlameIcon size={13} style={{ display: 'inline-block', verticalAlign: '-2px' }} aria-hidden="true" />
              Deals
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
