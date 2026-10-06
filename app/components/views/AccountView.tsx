'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import { fmt, productImg, slugify } from '@/lib/data';

/* ── Types ── */
interface Order {
  orderId: string;
  status:  string;
  total:   number;
  currency: string;
  createdAt: string;
  items:   { name: string; quantity: number; lineTotal: number }[];
}

interface Address {
  _id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist';

/* ── Status badge helper ── */
function statusBadge(status: string) {
  const map: Record<string, string> = {
    PAID:      'badge-success',
    PENDING:   'badge-warning',
    FAILED:    'badge-danger',
    CANCELLED: 'badge-danger',
    REFUNDED:  'badge-warning',
  };
  return map[status] ?? 'badge-warning';
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export default function AccountView() {
  const { authUser, authReady, signOut, showToast } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  async function handleLogout() {
    await signOut();
    showToast('Signed out successfully.');
    router.replace('/account/login');
  }

  if (!authReady) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <p className="muted">Loading your account…</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <b className="bc-cur">My Account</b>
        </div>
        <div className="card co-panel" style={{ maxWidth: '480px', margin: '32px auto' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Sign in to your account</h2>
          <p className="muted" style={{ marginBottom: '22px' }}>
            Track orders, manage addresses, and update your profile.
          </p>
          <div className="field-row">
            <Link href="/account/login" className="btn btn-primary btn-block">Log In</Link>
            <Link href="/account/register" className="btn btn-secondary btn-block">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const joinDate = new Date(authUser.createdAt).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const NAV: { key: Tab; icon: string; label: string }[] = [
    { key: 'profile',   icon: '👤', label: 'Profile'       },
    { key: 'orders',    icon: '📦', label: 'Orders'        },
    { key: 'addresses', icon: '🏠', label: 'Addresses'     },
    { key: 'wishlist',  icon: '♡',  label: 'Wishlist'      },
  ];

  return (
    <div>
      {/* ── Desktop ── */}
      <div className="acc-desktop">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span className="bc-sep">/</span>
            <b className="bc-cur">My Account</b>
          </div>
          <div className="account-layout">
            <aside className="card acc-side">
              <div className="acc-user">
                <div className="avatar">{authUser.initials}</div>
                <div>
                  <b style={{ fontSize: '15px' }}>{authUser.fullName}</b>
                  <br />
                  <small className="muted">{authUser.email}</small>
                  <br />
                  <small className="muted">Member since {joinDate}</small>
                </div>
              </div>
              <ul className="acc-nav">
                {NAV.map((n) => (
                  <li key={n.key}>
                    <a
                      className={activeTab === n.key ? 'on' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveTab(n.key)}
                    >
                      {n.icon} {n.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a onClick={handleLogout} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                    ↩ Log Out
                  </a>
                </li>
              </ul>
            </aside>

            <div>
              {activeTab === 'profile'   && <ProfileTab />}
              {activeTab === 'orders'    && <OrdersTab />}
              {activeTab === 'addresses' && <AddressesTab />}
              {activeTab === 'wishlist'  && <WishlistTab />}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="acc-mobile">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span className="bc-sep">/</span>
          <b className="bc-cur">My Account</b>
        </div>

        <div className="card px" style={{ margin: '0 16px' }}>
          <div className="acc-user" style={{ padding: '16px 0 12px' }}>
            <div className="avatar">{authUser.initials}</div>
            <div>
              <b style={{ fontSize: '14.5px' }}>{authUser.fullName}</b>
              <br />
              <small className="muted">{authUser.email}</small>
            </div>
          </div>
          {/* Mobile tab strip */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px' }}>
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setActiveTab(n.key)}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: '99px',
                  border: '1.5px solid',
                  borderColor: activeTab === n.key ? 'var(--blue)' : 'var(--line)',
                  background: activeTab === n.key ? 'var(--blue-soft)' : 'var(--surface)',
                  color: activeTab === n.key ? 'var(--blue-d)' : 'var(--ink)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ margin: '12px 16px 0' }}>
          {activeTab === 'profile'   && <ProfileTab mobile />}
          {activeTab === 'orders'    && <OrdersTab />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'wishlist'  && <WishlistTab />}
        </div>

        <div style={{ margin: '16px 16px 80px' }}>
          <button className="btn btn-secondary btn-block" onClick={handleLogout} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            ↩ Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFILE TAB
   ══════════════════════════════════════════════════════════ */
function ProfileTab({ mobile = false }: { mobile?: boolean }) {
  const { authUser, updateProfile, showToast } = useApp();
  const [firstName, setFirstName] = useState(authUser?.firstName ?? '');
  const [lastName,  setLastName]  = useState(authUser?.lastName  ?? '');
  const [phone,     setPhone]     = useState(authUser?.phone     ?? '');
  const [saving,    setSaving]    = useState(false);
  const [curPass,   setCurPass]   = useState('');
  const [newPass,   setNewPass]   = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  // Sync if authUser changes
  useEffect(() => {
    if (authUser) {
      setFirstName(authUser.firstName);
      setLastName(authUser.lastName);
      setPhone(authUser.phone);
    }
  }, [authUser]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      showToast('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const result = await updateProfile({ firstName, lastName, phone });
    setSaving(false);
    showToast(result.message);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!curPass || !newPass || !confirmPass) {
      showToast('Please fill in all password fields.');
      return;
    }
    if (newPass.length < 8) {
      showToast('New password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.');
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const data = await res.json();
      showToast(res.ok ? 'Password changed successfully.' : (data.error ?? 'Failed to change password.'));
      if (res.ok) { setCurPass(''); setNewPass(''); setConfirmPass(''); }
    } catch {
      showToast('Network error. Please try again.');
    } finally {
      setChangingPw(false);
    }
  }

  const joinDate = authUser ? new Date(authUser.createdAt).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  }) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Profile details */}
      <form className="card co-panel" onSubmit={handleSave}>
        <h2 style={{ fontSize: mobile ? '15px' : '18px', marginBottom: '4px' }}>Profile Details</h2>
        <p className="muted" style={{ marginBottom: '18px', fontSize: '13px' }}>Member since {joinDate}</p>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pfn">First name</label>
            <input id="pfn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="pln">Last name</label>
            <input id="pln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div className="field">
          <label>Email address</label>
          <input value={authUser?.email ?? ''} disabled style={{ background: 'var(--surface-2)', color: 'var(--muted)' }} />
          <small className="muted" style={{ fontSize: '11.5px' }}>Email cannot be changed.</small>
        </div>
        <div className="field">
          <label htmlFor="pph">Phone</label>
          <input id="pph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '4px' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Change password */}
      <form className="card co-panel" onSubmit={handlePasswordChange}>
        <h2 style={{ fontSize: mobile ? '15px' : '18px', marginBottom: '16px' }}>Change Password</h2>
        <div className="field">
          <label htmlFor="cpp">Current password</label>
          <input id="cpp" type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="field">
          <label htmlFor="npp">New password</label>
          <input id="npp" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" placeholder="Min. 8 characters" />
        </div>
        <div className="field">
          <label htmlFor="cpp2">Confirm new password</label>
          <input id="cpp2" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-secondary" disabled={changingPw}>
          {changingPw ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ORDERS TAB
   ══════════════════════════════════════════════════════════ */
function OrdersTab() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => showToast('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <div className="card co-panel"><p className="muted">Loading orders…</p></div>;

  if (orders.length === 0) {
    return (
      <div className="card co-panel" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No orders yet</h3>
        <p className="muted" style={{ marginBottom: '18px' }}>When you place an order, it will appear here.</p>
        <Link href="/shop" className="btn btn-primary" style={{ borderRadius: '10px' }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <h2 style={{ fontSize: '18px', padding: '20px 20px 8px' }}>Order History</h2>
      {orders.map((o) => {
        const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
        return (
          <div key={o.orderId} className="order-row">
            <div>
              <b style={{ fontSize: '13px' }}>{o.orderId}</b>
              <small style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>
                {date} · {itemCount} item{itemCount !== 1 ? 's' : ''}
              </small>
              <small style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                {o.items.slice(0, 2).map((i) => i.name).join(', ')}
                {o.items.length > 2 ? ` +${o.items.length - 2} more` : ''}
              </small>
            </div>
            <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
            <b style={{ fontFamily: 'var(--fm)' }}>{fmt(o.total)}</b>
            <Link href={`/payment/success?orderId=${o.orderId}`} className="link">
              View →
            </Link>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADDRESSES TAB
   ══════════════════════════════════════════════════════════ */
function AddressesTab() {
  const { showToast } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Address, '_id'>>({
    label: 'Home', firstName: '', lastName: '', address: '', apt: '',
    city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false,
  });

  const load = useCallback(() => {
    fetch('/api/account/addresses')
      .then((r) => r.json())
      .then((d) => setAddresses(d.addresses ?? []))
      .catch(() => showToast('Failed to load addresses.'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({ label: 'Home', firstName: '', lastName: '', address: '', apt: '', city: '', state: '', zip: '', country: 'United States', phone: '', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(a: Address) {
    const { _id, ...rest } = a;
    setForm(rest);
    setEditingId(_id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.country.trim()) {
      showToast('Address, city, and country are required.');
      return;
    }
    const id = editingId ?? crypto.randomUUID();
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/account/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? 'Failed to save address.'); return; }
      setAddresses(data.addresses);
      showToast(editingId ? 'Address updated.' : 'Address added.');
      resetForm();
    } catch {
      showToast('Network error. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return;
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? 'Failed to delete.'); return; }
      setAddresses(data.addresses);
      showToast('Address deleted.');
    } catch {
      showToast('Network error. Please try again.');
    }
  }

  if (loading) return <div className="card co-panel"><p className="muted">Loading addresses…</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <div className="card co-panel" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏠</div>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No saved addresses</h3>
          <p className="muted" style={{ marginBottom: '16px' }}>Add an address to check out faster.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Address</button>
        </div>
      )}

      {addresses.map((a) => (
        <div key={a._id} className="card co-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <b style={{ fontSize: '14px' }}>{a.label}</b>
              {a.isDefault && <span className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>Default</span>}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
              {a.firstName} {a.lastName}<br />
              {a.address}{a.apt ? `, ${a.apt}` : ''}<br />
              {a.city}{a.state ? `, ${a.state}` : ''} {a.zip}<br />
              {a.country}
              {a.phone && <><br />{a.phone}</>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(a)}>Edit</button>
            <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'none' }} onClick={() => handleDelete(a._id)}>Delete</button>
          </div>
        </div>
      ))}

      {/* Add / Edit form */}
      {showForm && (
        <form className="card co-panel" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{editingId ? 'Edit Address' : 'New Address'}</h3>
          <div className="field-row">
            <div className="field">
              <label>Label</label>
              <select value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}>
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))} style={{ marginRight: '6px', accentColor: 'var(--blue)' }} />
                Set as default
              </label>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label>First name</label><input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div className="field"><label>Last name</label><input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Street address *</label><input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} required /></div>
          <div className="field"><label>Apt / suite</label><input value={form.apt} onChange={(e) => setForm(f => ({ ...f, apt: e.target.value }))} placeholder="Optional" /></div>
          <div className="field-row">
            <div className="field"><label>City *</label><input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} required /></div>
            <div className="field"><label>State</label><input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>ZIP</label><input value={form.zip} onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))} /></div>
            <div className="field">
              <label>Country *</label>
              <select value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}>
                <option>United States</option><option>Canada</option><option>United Kingdom</option>
                <option>Sri Lanka</option><option>Australia</option><option>India</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Address'}</button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {!showForm && addresses.length > 0 && (
        <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => setShowForm(true)}>
          + Add New Address
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   WISHLIST TAB
   ══════════════════════════════════════════════════════════ */
function WishlistTab() {
  const { showToast, products, addToCart } = useApp();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const PENDING_IMG = '/pending.png';

  useEffect(() => {
    fetch('/api/account/wishlist')
      .then((r) => r.json())
      .then((d) => setWishlist(d.wishlist ?? []))
      .catch(() => showToast('Failed to load wishlist.'))
      .finally(() => setLoading(false));
  }, [showToast]);

  async function handleRemove(productId: number) {
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist);
        showToast('Removed from wishlist.');
      }
    } catch {
      showToast('Failed to remove. Try again.');
    }
  }

  if (loading) return <div className="card co-panel"><p className="muted">Loading wishlist…</p></div>;

  const wishlistProducts = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  if (wishlistProducts.length === 0) {
    return (
      <div className="card co-panel" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>♡</div>
        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Your wishlist is empty</h3>
        <p className="muted" style={{ marginBottom: '18px' }}>Save products you love and come back to them anytime.</p>
        <Link href="/shop" className="btn btn-primary" style={{ borderRadius: '10px' }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <h2 style={{ fontSize: '18px', padding: '20px 20px 8px' }}>
        Saved Items <span className="muted" style={{ fontWeight: 400, fontSize: '14px' }}>({wishlistProducts.length})</span>
      </h2>
      <div className="product-grid" style={{ padding: '0 20px 20px' }}>
        {wishlistProducts.map((p) => {
          if (!p) return null;
          const img = productImg(p);
          return (
            <div key={p.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
              <button
                onClick={() => handleRemove(p.id)}
                aria-label="Remove from wishlist"
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '16px' }}
              >✕</button>
              <Link href={`/product/${p.id}/${p.slug ?? slugify(p.name)}`}>
                <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: '8px' }}>
                  <img src={img || PENDING_IMG} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = PENDING_IMG; }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>{p.brand}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.35 }}>{p.name}</p>
                  <p style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--fm)', marginTop: '6px', color: 'var(--blue)' }}>{fmt(p.price)}</p>
                </div>
              </Link>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: 'auto' }}
                disabled={p.stock === 'out'}
                onClick={() => { addToCart(p.id, 1); showToast(`Added ${p.name.split(' ').slice(0, 3).join(' ')} to cart ✓`); }}
              >
                {p.stock === 'out' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
