'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/app/components/providers/AppProvider';
import { categorySlug } from '@/lib/data';
import StoreBadge from '@/app/components/ui/StoreBadge';
import {
  FacebookIcon, InstagramIcon, YoutubeIcon, XIcon,
  VisaMark, MastercardMark, PayPalMark, LockIcon, ArrowUpIcon, FlameIcon,
} from '@/app/components/icons';

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
              <span aria-label="Facebook"><FacebookIcon size={17} /></span>
              <span aria-label="Instagram"><InstagramIcon size={17} /></span>
              <span aria-label="YouTube"><YoutubeIcon size={17} /></span>
              <span aria-label="Twitter/X"><XIcon size={15} /></span>
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
              <li><Link href="/shop?tag=deal" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>Deals <FlameIcon size={13} style={{ color: 'var(--red)' }} /></Link></li>
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
            {/* Store URLs live in lib/siteConfig.ts — swap them there. */}
            <div className="apps">
              <StoreBadge store="google" />
              <StoreBadge store="apple" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft3">
          <span>© 2026 Vertex Computers. All rights reserved.</span>
          <span className="pay">
            <LockIcon size={14} style={{ color: 'var(--green)' }} />
            Secure Shopping
            <VisaMark size={30} />
            <MastercardMark size={24} />
            <PayPalMark size={30} />
          </span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>Back to top <ArrowUpIcon size={12} /></span>
          </button>
        </div>
      </div>
    </footer>
  );
}
