'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/app/components/providers/AppProvider';
import { categorySlug } from '@/lib/data';

export default function Footer() {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { showToast('Please enter a valid email address'); return; }
    setDone(true);
    showToast('You\'re on the list — the first build guide lands Friday 📬');
  }

  return (
    <footer className="site">
      <div className="container">
        <div className="ft2">
          {/* Brand */}
          <div>
            <Link href="/" className="logo" aria-label="Vertex Computers home">
            <img src="/logo.png" alt="Vertex Computers" width={34} height={34} style={{ borderRadius: '9px', objectFit: 'contain', flexShrink: 0 }} />
            <span>VERTEX<small>Computers</small></span>
          </Link>
            <p>Independent component specialists. Every part benched, every build compatibility-checked.</p>
            <div className="ft-soc" aria-label="Social links">
              <span aria-label="Facebook">f</span>
              <span aria-label="Instagram">ig</span>
              <span aria-label="YouTube">▶</span>
              <span aria-label="Twitter/X">𝕏</span>
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop links">
            <h4>Shop</h4>
            <ul>
              <li><Link href="/shop">All Products</Link></li>
              <li><Link href={`/shop/${categorySlug('GPUs')}`}>Graphics Cards</Link></li>
              <li><Link href={`/shop/${categorySlug('CPUs')}`}>Processors</Link></li>
              <li><Link href={`/shop/${categorySlug('Storage')}`}>Storage</Link></li>
              <li><Link href="/shop?tag=deal">Deals 🔥</Link></li>
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <h4>Support</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Track your order (demo)'); }}>Track Order</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Returns & Refunds (demo)'); }}>Returns &amp; Refunds</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Shipping info (demo)'); }}>Shipping</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Warranty info (demo)'); }}>Warranty</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showToast('Contact support (demo)'); }}>Contact Us</a></li>
            </ul>
          </nav>

          {/* About */}
          <nav aria-label="About links">
            <h4>About</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Our Story</a></li>
              <li><Link href="/account">My Account</Link></li>
              <li><Link href="/cart">Cart &amp; Checkout</Link></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
            </ul>
          </nav>

          {/* App / Newsletter */}
          <div>
            <h4>Download Our App</h4>
            <p>Shop on the go</p>
            <div className="apps">
              <a href="#" onClick={(e) => { e.preventDefault(); showToast('Google Play (demo)'); }}>
                <small>GET IT ON</small>
                <b>Google Play</b>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast('App Store (demo)'); }}>
                <small>Download on the</small>
                <b>App Store</b>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft3">
          <span>© 2026 Vertex Computers. All rights reserved.</span>
          <span className="pay">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
            </svg>
            Secure Shopping
            <i style={{ color: '#1A3FA0' }}>VISA</i>
            <i style={{ color: '#EB5A28' }}>Mastercard</i>
            <i style={{ color: '#1E4DB7' }}>PayPal</i>
          </span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
        </div>
      </div>
    </footer>
  );
}
