'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';

const ORDERS = [
  { id: '#VX-2026081617', date: 'Aug 16, 2026', items: 3, total: '$1,485.76', badge: 'badge-warning', label: 'In Transit',  href: '/checkout/confirm' },
  { id: '#VX-2026070204', date: 'Jul 2, 2026',  items: 1, total: '$449.00',   badge: 'badge-success', label: 'Delivered',  href: null },
  { id: '#VX-2026051411', date: 'May 14, 2026', items: 2, total: '$328.90',   badge: 'badge-success', label: 'Delivered',  href: null },
  { id: '#VX-2026032808', date: 'Mar 28, 2026', items: 1, total: '$179.00',   badge: 'badge-danger',  label: 'Cancelled',  href: null },
];

export default function AccountView() {
  const { authUser, authReady, signOut, updateProfile, showToast } = useApp();
  const router = useRouter();
  const [firstName, setFirstName] = useState(() => authUser?.firstName ?? '');
  const [lastName, setLastName] = useState(() => authUser?.lastName ?? '');
  const [email, setEmail] = useState(() => authUser?.email ?? '');
  const [phone, setPhone] = useState(() => authUser?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [prevAuthUser, setPrevAuthUser] = useState(authUser);

  // Sync form fields when authUser changes identity (e.g. after profile save or sign-in)
  if (authUser !== prevAuthUser) {
    setPrevAuthUser(authUser);
    if (authUser) {
      setFirstName(authUser.firstName);
      setLastName(authUser.lastName);
      setEmail(authUser.email);
      setPhone(authUser.phone);
    }
  }

  function handleLogout() {
    signOut();
    showToast('Signed out');
    router.replace('/account/login');
  }

  function handleSave() {
    setSaving(true);
    const result = updateProfile({ firstName, lastName, email, phone });
    setSaving(false);

    if (!result.ok) {
      showToast(result.message);
      return;
    }

    showToast(result.message);
  }

  if (!authReady) {
    return (
      <div className="container">
        <div className="card co-panel" style={{ marginTop: '18px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Loading account</h2>
          <p className="muted">Checking your sign-in state…</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> /
          <b style={{ color: 'var(--text-1)' }}>My Account</b>
        </div>

        <div className="card co-panel" style={{ maxWidth: '760px', margin: '18px auto 0' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Sign in to manage your account</h2>
          <p className="muted" style={{ marginBottom: '22px' }}>
            Track orders, save addresses, and update your profile from one place.
          </p>
          <div className="field-row">
            <Link href="/account/login" className="btn btn-primary btn-block">Log In</Link>
            <Link href="/account/register" className="btn btn-secondary btn-block">Create Account</Link>
          </div>
          <div className="trust">
            <div>
              <span>🔒</span>
              <span>Secure local demo account state in this browser.</span>
            </div>
            <div>
              <span>🚚</span>
              <span>Checkout faster once your profile is saved.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(authUser.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      {/* ── Desktop layout (hidden on mobile via CSS) ── */}
      <div className="acc-desktop">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link> /
            <b style={{ color: 'var(--text-1)' }}>My Account</b>
          </div>
          <div className="account-layout">
            {/* Sidebar */}
            <aside className="card acc-side">
              <div className="acc-user">
                <div className="avatar">{authUser.initials}</div>
                <div>
                  <b style={{ fontSize: '15px' }}>{authUser.fullName}</b>
                  <br />
                  <small className="muted">{authUser.email}</small>
                </div>
              </div>
              <ul className="acc-nav">
                <li><a className="on">👤 Profile</a></li>
                <li><a onClick={() => showToast('Order history is below ↓')}>📦 Order History</a></li>
                <li><a onClick={() => showToast('Saved addresses (demo)')}>🏠 Addresses</a></li>
                <li><a onClick={() => showToast('Wishlist (demo)')}>♡ Wishlist</a></li>
                <li><a onClick={() => showToast('Payment methods (demo)')}>💳 Payment Methods</a></li>
                <li><a onClick={handleLogout} style={{ color: 'var(--danger)' }}>↩ Log Out</a></li>
              </ul>
            </aside>

            <div>
              <div className="card co-panel" style={{ marginBottom: '22px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Profile Details</h2>
                <p className="muted" style={{ marginBottom: '18px' }}>Member since {joinDate}</p>
                <div className="field-row">
                  <div className="field"><label htmlFor="pfn">First name</label><input id="pfn" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                  <div className="field"><label htmlFor="pln">Last name</label><input id="pln" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label htmlFor="pem">Email</label><input id="pem" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="field"><label htmlFor="pph">Phone</label><input id="pph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>

              <div className="card" style={{ overflow: 'hidden' }}>
                <h2 style={{ fontSize: '18px', padding: '20px 20px 6px' }}>Order History</h2>
                {ORDERS.map((o) => (
                  <div key={o.id} className="order-row">
                    <div><b>{o.id}</b><small>{o.date} · {o.items} item{o.items !== 1 ? 's' : ''}</small></div>
                    <span className={`badge ${o.badge}`}>{o.label}</span>
                    <b>{o.total}</b>
                    {o.href
                      ? <Link href={o.href} className="link">View</Link>
                      : <a className="link" href="#" onClick={(e) => { e.preventDefault(); showToast('Order details (demo)'); }}>View</a>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout (hidden on desktop via CSS) ── */}
      <div className="acc-mobile">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link> /
          <b style={{ color: 'var(--text-1)' }}>My Account</b>
        </div>

        {/* User header card */}
        <div className="card px" style={{ margin: '0 16px' }}>
          <div className="acc-user" style={{ padding: '16px', paddingBottom: '18px' }}>
            <div className="avatar">{authUser.initials}</div>
            <div>
              <b style={{ fontSize: '14.5px' }}>{authUser.fullName}</b>
              <br />
              <small className="muted">{authUser.email}</small>
            </div>
          </div>
          <ul className="acc-nav" style={{ padding: '0 10px 10px' }}>
            <li><a className="on">👤 Profile</a></li>
            <li><a onClick={() => showToast('Order history is below ↓')}>📦 Order History</a></li>
            <li><a onClick={() => showToast('Saved addresses (demo)')}>🏠 Addresses</a></li>
            <li><a onClick={() => showToast('Wishlist (demo)')}>♡ Wishlist</a></li>
            <li><a onClick={() => showToast('Payment methods (demo)')}>💳 Payment Methods</a></li>
            <li><a onClick={handleLogout} style={{ color: 'var(--danger)' }}>↩ Log Out</a></li>
          </ul>
        </div>

        {/* Profile form */}
        <div className="card co-panel" style={{ margin: '16px 16px 0' }}>
          <h2 style={{ fontSize: '15px', marginBottom: '8px' }}>Profile Details</h2>
          <p className="muted" style={{ marginBottom: '16px' }}>Member since {joinDate}</p>
          <div className="field-row">
            <div className="field"><label htmlFor="mpfn">First name</label><input id="mpfn" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="field"><label htmlFor="mpln">Last name</label><input id="mpln" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div className="field"><label htmlFor="mpem">Email</label><input id="mpem" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label htmlFor="mpph">Phone</label><input id="mpph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>

        {/* Order history */}
        <div className="card px" style={{ margin: '16px 16px 0', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '15px', padding: '16px 4px 4px' }}>Order History</h2>
          {ORDERS.map((o) => (
            <div key={`m-${o.id}`} className="order-row-m">
              <div className="ortop"><b>{o.id}</b><span className={`badge ${o.badge}`}>{o.label}</span></div>
              <small>{o.date} · {o.items} item{o.items !== 1 ? 's' : ''}</small>
              <div className="ortop">
                <b>{o.total}</b>
                {o.href
                  ? <Link href={o.href} className="link">View →</Link>
                  : <a className="link" href="#" onClick={(e) => { e.preventDefault(); showToast('Order details (demo)'); }}>View →</a>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
