'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function Footer() {
  const { setView, showToast } = useApp();

  return (
    <footer className="site">
      <div className="container">
        <div className="foot-grid">
          {/* Brand */}
          <div className="foot-about">
            <span className="logo">
              <span className="logo-mark">V</span>
              <span>VERTEX<small>Computers</small></span>
            </span>
            <p>Premium PC components for builders, gamers, and businesses. Build with confidence.</p>
          </div>

          {/* Shop links */}
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Graphics Cards</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Processors</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Motherboards</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Deals</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping &amp; Returns</a></li>
              <li><a href="#">Warranty</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4>Newsletter</h4>
            <p className="muted" style={{ fontSize: '13.5px' }}>Deals, restocks &amp; build guides. No spam.</p>
            <div className="nl-row">
              <input type="email" placeholder="Email address" aria-label="Email for newsletter" />
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Subscribed! 📬')}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 Vertex Computers. All rights reserved.</span>
          <span>
            <a href="#">Terms</a> · <a href="#">Privacy</a> · <a href="#">Payment Icons: 💳 VISA · MC · AMEX · PayPal</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
