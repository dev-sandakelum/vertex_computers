'use client';

import { useApp } from '@/app/components/providers/AppProvider';

const ORDERS = [
  { id: '#VX-2026081617', date: 'Aug 16, 2026', items: 3, total: '$1,485.76', badge: 'badge-warning', label: 'In Transit',  view: 'checkout-confirm' as const },
  { id: '#VX-2026070204', date: 'Jul 2, 2026',  items: 1, total: '$449.00',   badge: 'badge-success', label: 'Delivered',  view: null },
  { id: '#VX-2026051411', date: 'May 14, 2026', items: 2, total: '$328.90',   badge: 'badge-success', label: 'Delivered',  view: null },
  { id: '#VX-2026032808', date: 'Mar 28, 2026', items: 1, total: '$179.00',   badge: 'badge-danger',  label: 'Cancelled',  view: null },
];

export default function AccountView() {
  const { setView, showToast } = useApp();

  return (
    <div>
      <div className="container">
        <div className="breadcrumbs">
          <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }}>Home</a> /
          <b style={{ color: 'var(--text-1)' }}>My Account</b>
        </div>
        <div className="account-layout">
          {/* Desktop sidebar */}
          <aside className="card acc-side">
            <div className="acc-user">
              <div className="avatar">JD</div>
              <div>
                <b style={{ fontSize: '15px' }}>John Doe</b>
                <br /><small className="muted">name@example.com</small>
              </div>
            </div>
            <ul className="acc-nav">
              <li><a className="on">👤 Profile</a></li>
              <li><a onClick={() => showToast('Order history is below ↓')}>📦 Order History</a></li>
              <li><a onClick={() => showToast('Saved addresses (demo)')}>🏠 Addresses</a></li>
              <li><a onClick={() => showToast('Wishlist (demo)')}>♡ Wishlist</a></li>
              <li><a onClick={() => showToast('Payment methods (demo)')}>💳 Payment Methods</a></li>
              <li><a onClick={() => setView('login')} style={{ color: 'var(--danger)' }}>↩ Log Out</a></li>
            </ul>
          </aside>

          <div>
            {/* Profile card */}
            <div className="card co-panel" style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '18px' }}>Profile Details</h2>
              <div className="field-row">
                <div className="field"><label htmlFor="pfn">First name</label><input id="pfn" defaultValue="John" /></div>
                <div className="field"><label htmlFor="pln">Last name</label><input id="pln" defaultValue="Doe" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label htmlFor="pem">Email</label><input id="pem" defaultValue="name@example.com" /></div>
                <div className="field"><label htmlFor="pph">Phone</label><input id="pph" defaultValue="+1 (555) 000-0000" /></div>
              </div>
              <button className="btn btn-primary" onClick={() => showToast('Changes saved ✓')}>Save Changes</button>
            </div>

            {/* Order history — desktop rows */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '18px', padding: '20px 20px 6px' }}>Order History</h2>
              {ORDERS.map((o) => (
                <div key={o.id} className="order-row">
                  <div><b>{o.id}</b><small>{o.date} · {o.items} item{o.items !== 1 ? 's' : ''}</small></div>
                  <span className={`badge ${o.badge}`}>{o.label}</span>
                  <b>{o.total}</b>
                  <a className="link" href="#" onClick={(e) => { e.preventDefault(); o.view ? setView(o.view) : showToast('Order details (demo)'); }}>View</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ───────────────────────────── */}
      {/* Mobile profile card */}
      <div className="card px" style={{ margin: '0 16px' }}>
        <div className="acc-user" style={{ padding: '16px', paddingBottom: '18px' }}>
          <div className="avatar">JD</div>
          <div>
            <b style={{ fontSize: '14.5px' }}>John Doe</b>
            <br /><small className="muted">name@example.com</small>
          </div>
        </div>
        <ul className="acc-nav" style={{ padding: '0 10px 10px' }}>
          <li><a className="on">👤 Profile</a></li>
          <li><a onClick={() => showToast('Order history is below ↓')}>📦 Order History</a></li>
          <li><a onClick={() => showToast('Saved addresses (demo)')}>🏠 Addresses</a></li>
          <li><a onClick={() => showToast('Wishlist (demo)')}>♡ Wishlist</a></li>
          <li><a onClick={() => showToast('Payment methods (demo)')}>💳 Payment Methods</a></li>
          <li><a onClick={() => setView('login')} style={{ color: 'var(--danger)' }}>↩ Log Out</a></li>
        </ul>
      </div>

      {/* Mobile profile form */}
      <div className="card co-panel" style={{ margin: '16px 16px 0' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>Profile Details</h2>
        <div className="field-row">
          <div className="field"><label htmlFor="mpfn">First name</label><input id="mpfn" defaultValue="John" /></div>
          <div className="field"><label htmlFor="mpln">Last name</label><input id="mpln" defaultValue="Doe" /></div>
        </div>
        <div className="field"><label htmlFor="mpem">Email</label><input id="mpem" defaultValue="name@example.com" /></div>
        <div className="field"><label htmlFor="mpph">Phone</label><input id="mpph" defaultValue="+1 (555) 000-0000" /></div>
        <button className="btn btn-primary btn-block" onClick={() => showToast('Changes saved ✓')}>Save Changes</button>
      </div>

      {/* Mobile order history */}
      <div className="card px" style={{ margin: '16px 16px 0', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '15px', padding: '16px 4px 4px' }}>Order History</h2>
        {ORDERS.map((o) => (
          <div key={`m-${o.id}`} className="order-row-m">
            <div className="ortop"><b>{o.id}</b><span className={`badge ${o.badge}`}>{o.label}</span></div>
            <small>{o.date} · {o.items} item{o.items !== 1 ? 's' : ''}</small>
            <div className="ortop">
              <b>{o.total}</b>
              <a className="link" href="#" onClick={(e) => { e.preventDefault(); o.view ? setView(o.view) : showToast('Order details (demo)'); }}>
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
