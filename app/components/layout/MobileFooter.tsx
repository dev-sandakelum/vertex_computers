'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/app/components/providers/AppProvider';
import { categorySlug } from '@/lib/data';
import StoreBadge from '@/app/components/ui/StoreBadge';
import { FlameIcon, ChevronDownIcon, CheckIcon } from '@/app/components/icons';

export default function MobileFooter() {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [done,  setDone]  = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { showToast('Please enter a valid email'); return; }
    setDone(true);
    showToast('Subscribed! 📬');
  }

  return (
    <footer className="footer-m">
      <div className="flogo">
        <img src="/logo.png" alt="Vertex Computers" width={28} height={28} style={{ borderRadius: '7px', objectFit: 'contain' }} />
        <span>VERTEX Computers</span>
      </div>
      <p>Premium PC components for builders, gamers, and businesses.</p>

      <details className="facc">
        <summary>Shop <ChevronDownIcon size={14} style={{ color: 'var(--muted)' }} /></summary>
        <ul>
          <li><Link href={`/shop/${categorySlug('GPUs')}`}>Graphics Cards</Link></li>
          <li><Link href={`/shop/${categorySlug('CPUs')}`}>Processors</Link></li>
          <li><Link href={`/shop/${categorySlug('Motherboards')}`}>Motherboards</Link></li>
          <li>
            <Link href="/shop?tag=deal" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              Deals <FlameIcon size={12} style={{ color: 'var(--red)' }} />
            </Link>
          </li>
        </ul>
      </details>

      <details className="facc">
        <summary>Support <ChevronDownIcon size={14} style={{ color: 'var(--muted)' }} /></summary>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Contact Us (demo)'); }}>Contact Us</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Shipping & Returns (demo)'); }}>Shipping &amp; Returns</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Warranty (demo)'); }}>Warranty</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('FAQ (demo)'); }}>FAQ</a></li>
        </ul>
      </details>

      <details className="facc">
        <summary>Company <ChevronDownIcon size={14} style={{ color: 'var(--muted)' }} /></summary>
        <ul>
          <li><a href="#" onClick={(e) => e.preventDefault()}>About</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Careers</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
        </ul>
      </details>

      <div className="facc" style={{ padding: '14px 0' }}>
        <b style={{ fontSize: '13.5px' }}>Get the app</b>
        <p style={{ margin: '6px 0 10px', color: 'var(--muted)', fontSize: '12.5px' }}>Shop on the go — faster checkout, order tracking and restock alerts.</p>
        {/* Full-width stacked on small mobile (Issue 3 responsive spec). */}
        <div className="apps">
          <StoreBadge store="google" />
          <StoreBadge store="apple" />
        </div>
      </div>

      <div className="facc" style={{ padding: '14px 0' }}>
        <b style={{ fontSize: '13.5px' }}>Newsletter</b>
        <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '12.5px' }}>Deals, restocks &amp; build guides. No spam.</p>
        {!done ? (
          <form onSubmit={handleSubscribe} className="nl-row">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email for newsletter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">Go</button>
          </form>
        ) : (
          <p style={{ marginTop: '10px', color: 'var(--green)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckIcon size={14} /> You&apos;re on the list!
          </p>
        )}
      </div>

      <div className="foot-bottom-m">
        © 2026 Vertex Computers. All rights reserved.<br />
        <a href="#">Terms</a> · <a href="#">Privacy</a>
      </div>
    </footer>
  );
}
