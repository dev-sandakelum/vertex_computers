'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function MobileFooter() {
  const { setView, showToast } = useApp();

  return (
    <footer className="footer-m">
      <div className="flogo">
        <span className="logo-mark">V</span>
        <span>VERTEX Computers</span>
      </div>
      <p>Premium PC components for builders, gamers, and businesses.</p>

      <details className="facc">
        <summary>Shop <span>▾</span></summary>
        <ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Graphics Cards</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Processors</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Motherboards</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); setView('category'); }}>Deals</a></li>
        </ul>
      </details>

      <details className="facc">
        <summary>Support <span>▾</span></summary>
        <ul>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Shipping &amp; Returns</a></li>
          <li><a href="#">Warranty</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </details>

      <details className="facc">
        <summary>Company <span>▾</span></summary>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </details>

      <div className="facc" style={{ padding: '14px 0' }}>
        <b style={{ fontSize: '13.5px' }}>Newsletter</b>
        <p style={{ margin: '6px 0 0', color: 'var(--text-2)', fontSize: '12.5px' }}>
          Deals, restocks &amp; build guides. No spam.
        </p>
        <div className="nl-row">
          <input type="email" placeholder="Email address" aria-label="Email for newsletter" />
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Subscribed! 📬')}>Go</button>
        </div>
      </div>

      <div className="foot-bottom-m">
        © 2026 Vertex Computers. All rights reserved.<br />
        <a href="#">Terms</a> · <a href="#">Privacy</a>
      </div>
    </footer>
  );
}
