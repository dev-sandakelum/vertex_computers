'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/app/components/providers/AppProvider';
import { categorySlug } from '@/lib/data';

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
        <summary>Shop <span>▾</span></summary>
        <ul>
          <li><Link href={`/shop/${categorySlug('GPUs')}`}>Graphics Cards</Link></li>
          <li><Link href={`/shop/${categorySlug('CPUs')}`}>Processors</Link></li>
          <li><Link href={`/shop/${categorySlug('Motherboards')}`}>Motherboards</Link></li>
          <li><Link href="/shop?tag=deal">Deals 🔥</Link></li>
        </ul>
      </details>

      <details className="facc">
        <summary>Support <span>▾</span></summary>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Contact Us (demo)'); }}>Contact Us</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Shipping & Returns (demo)'); }}>Shipping &amp; Returns</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Warranty (demo)'); }}>Warranty</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('FAQ (demo)'); }}>FAQ</a></li>
        </ul>
      </details>

      <details className="facc">
        <summary>Company <span>▾</span></summary>
        <ul>
          <li><a href="#" onClick={(e) => e.preventDefault()}>About</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Careers</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
        </ul>
      </details>

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
          <p style={{ marginTop: '10px', color: 'var(--green)', fontSize: '13px', fontWeight: 600 }}>
            ✓ You&apos;re on the list!
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
