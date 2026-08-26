'use client';

import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';
import { categorySlug } from '@/lib/data';

export default function Footer() {
  const { showToast } = useApp();

  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-about">
            <Link href="/" className="logo">
              <span className="logo-mark">V</span>
              <span>VERTEX<small>Computers</small></span>
            </Link>
            <p>Premium PC components for builders, gamers, and businesses. Build with confidence.</p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href={`/shop/${categorySlug('GPUs')}`}>Graphics Cards</Link></li>
              <li><Link href={`/shop/${categorySlug('CPUs')}`}>Processors</Link></li>
              <li><Link href={`/shop/${categorySlug('Motherboards')}`}>Motherboards</Link></li>
              <li><Link href="/shop?tag=deal">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping &amp; Returns</a></li>
              <li><a href="#">Warranty</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          <div>
            <h4>Newsletter</h4>
            <p className="muted" style={{ fontSize: '13.5px' }}>Deals, restocks &amp; build guides. No spam.</p>
            <div className="nl-row">
              <input type="email" placeholder="Email address" aria-label="Email for newsletter" />
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Subscribed! 📬')}>Subscribe</button>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 Vertex Computers. All rights reserved.</span>
          <span>
            <a href="#">Terms</a> · <a href="#">Privacy</a> · <span>💳 VISA · MC · AMEX · PayPal</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
