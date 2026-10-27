'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { CATS, categorySlug } from '@/lib/data';
import { HomeIcon, UserIcon, CartIcon, FlameIcon, CloseIcon } from '@/app/components/icons';

export default function Drawers() {
  const { mobileDrawerOpen, closeDrawers, accountHref } = useApp();

  return (
    <>
      <div
        className={`drawer-backdrop${mobileDrawerOpen ? ' show' : ''}`}
        onClick={closeDrawers}
        aria-hidden="true"
      />

      {/* Mobile nav drawer */}
      <aside className={`mobile-drawer${mobileDrawerOpen ? ' show' : ''}`} aria-label="Mobile navigation">
        <div className="drawer-head">
          <Link href="/" className="logo" onClick={closeDrawers}>
            <img src="/logo.png" alt="Vertex Computers" height={30} width={30} style={{ borderRadius: '8px', objectFit: 'contain' }} />
            <span>VERTEX</span>
          </Link>
          <button className="icon-btn" onClick={closeDrawers} aria-label="Close"><CloseIcon size={17} /></button>
        </div>
        <ul>
          <li><Link href="/" onClick={closeDrawers}><HomeIcon size={16} style={{ marginRight: 8, verticalAlign: -3 }} /> Home</Link></li>
          {CATS.map((c) => (
            <li key={c.n}>
              <Link href={`/shop/${categorySlug(c.n)}`} onClick={closeDrawers}>{c.n}</Link>
            </li>
          ))}
          <li>
            <Link href="/shop?tag=deal" onClick={closeDrawers} style={{ color: 'var(--danger)', fontWeight: 600 }}>
              <FlameIcon size={15} style={{ marginRight: 8, verticalAlign: -3 }} /> Deals
            </Link>
          </li>
          <li><Link href={accountHref} onClick={closeDrawers}><UserIcon size={16} style={{ marginRight: 8, verticalAlign: -3 }} /> Account</Link></li>
          <li><Link href="/cart" onClick={closeDrawers}><CartIcon size={16} style={{ marginRight: 8, verticalAlign: -3 }} /> Cart</Link></li>
        </ul>
      </aside>
    </>
  );
}
