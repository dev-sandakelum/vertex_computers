'use client';

/**
 * AdminShell — full admin dashboard UI.
 *
 * Renders sidebar nav + content area. Each admin page simply does:
 *   <AdminShell activeTab="dashboard" />
 *
 * Auth: on mount we call /api/auth/me and redirect to /admin/login
 * if the user is not an admin.
 *
 * Tabs: dashboard | products | orders | users | logs
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ─── Types ──────────────────────────────────────────────────────── */

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'logs';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalLogs: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  orderId: string;
  customer: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: string;
  stockCount?: number;
  slug: string;
  image: string | null;
}

interface AdminOrder {
  orderId: string;
  customer: string;
  email: string;
  total: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  wishlistCount: number;
  addressCount: number;
}

interface AdminLog {
  _id: string;
  level: string;
  category: string;
  message: string;
  timestamp: string;
  meta?: unknown;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PAID:      'badge-success',
    PENDING:   'badge-warning',
    FAILED:    'badge-danger',
    CANCELLED: 'badge-danger',
    REFUNDED:  'badge-warning',
    admin:     'badge-success',
    user:      '',
    in:        'badge-success',
    low:       'badge-warning',
    out:       'badge-danger',
  };
  return map[status] ?? '';
}

function stockLabel(s: string) {
  return s === 'in' ? 'In Stock' : s === 'low' ? 'Low Stock' : 'Out of Stock';
}

/* ─── Nav config ─────────────────────────────────────────────────── */

const NAV: { tab: AdminTab; label: string; icon: string; href: string }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: '▦',  href: '/admin' },
  { tab: 'products',  label: 'Products',  icon: '⊞',  href: '/admin/products' },
  { tab: 'orders',    label: 'Orders',    icon: '◈',  href: '/admin/orders' },
  { tab: 'users',     label: 'Users',     icon: '◉',  href: '/admin/users' },
  { tab: 'logs',      label: 'Logs',      icon: '≡',  href: '/admin/logs' },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */

export default function AdminShell({ activeTab }: { activeTab: AdminTab }) {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Auth gate ───────────────────────────────────────────────── */
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== 'admin') {
          router.replace('/admin/login');
        } else {
          setAdminName(`${d.user.firstName} ${d.user.lastName}`);
          setAdminEmail(d.user.email);
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <span className="auth-spinner" style={{ width: 32, height: 32, borderWidth: 3, display: 'inline-block' }} />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--fd)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        zIndex: 40,
        // Mobile: overlay sidebar
        ...(sidebarOpen ? {} : {}),
      }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Vertex" width={30} height={30} style={{ borderRadius: 8, objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>VERTEX</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px 0', overflowY: 'auto' }}>
          {NAV.map(({ tab, label, icon, href }) => (
            <Link
              key={tab}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                fontWeight: 600, fontSize: 13.5, textDecoration: 'none',
                background: activeTab === tab ? 'var(--blue-soft)' : 'transparent',
                color: activeTab === tab ? 'var(--blue)' : 'var(--muted)',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--paper)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)';
                }
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </Link>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <Link
              href="/admin/push"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                fontWeight: 600, fontSize: 13.5, textDecoration: 'none',
                color: 'var(--muted)', transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--paper)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)';
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>⬆</span>
              DB Push
            </Link>
            <Link
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                fontWeight: 600, fontSize: 13.5, textDecoration: 'none',
                color: 'var(--muted)', transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--paper)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)';
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>↗</span>
              View Store
            </Link>
          </div>
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)',
              color: '#fff', display: 'grid', placeItems: 'center',
              fontWeight: 800, fontSize: 13, flexShrink: 0,
            }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminEmail}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-block btn-sm"
            style={{ borderRadius: 8, fontSize: 12 }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center',
          padding: '0 28px', borderBottom: '1px solid var(--line)',
          background: '#fff', gap: 12, flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>
            {NAV.find((n) => n.tab === activeTab)?.label ?? 'Admin'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'var(--success-soft)', color: 'var(--green)',
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              borderRadius: 99, fontFamily: 'var(--fm)',
            }}>
              ADMIN
            </span>
          </div>
        </header>

        {/* Tab content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products'  && <ProductsTab />}
          {activeTab === 'orders'    && <OrdersTab />}
          {activeTab === 'users'     && <UsersTab />}
          {activeTab === 'logs'      && <LogsTab />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED UI ATOMS
════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, sub, color = 'var(--blue)' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="card" style={{ padding: '20px 24px', minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--fm)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 16 }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        style={{ borderRadius: 8, padding: '0 12px', height: 32 }}
      >← Prev</button>
      <span style={{ fontSize: 13, color: 'var(--muted)', padding: '0 8px' }}>
        {page} / {pages}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        style={{ borderRadius: 8, padding: '0 12px', height: 32 }}
      >Next →</button>
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          {children}
        </table>
      </div>
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: '10px 16px', fontWeight: 700, fontSize: 12,
  color: 'var(--muted)', textAlign: 'left', background: 'var(--paper)',
  borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};

const TD: React.CSSProperties = {
  padding: '12px 16px', borderBottom: '1px solid var(--line)',
  color: 'var(--ink)', verticalAlign: 'middle',
};

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
      <span className="auth-spinner" style={{ width: 28, height: 28, borderWidth: 3, display: 'inline-block' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD TAB
════════════════════════════════════════════════════════════════════ */

function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <div style={{ color: 'var(--red)' }}>Failed to load stats.</div>;

  return (
    <div>
      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Revenue" value={fmt(stats.totalRevenue)} sub="from paid orders" color="var(--green)" />
        <StatCard label="Total Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending`} />
        <StatCard label="Paid Orders" value={stats.paidOrders} color="var(--green)" />
        <StatCard label="Products" value={stats.totalProducts} />
        <StatCard label="Users" value={stats.totalUsers} />
        <StatCard label="Log Entries" value={stats.totalLogs} color="var(--muted)" />
      </div>

      {/* Recent orders */}
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Recent Orders</div>
      <TableWrap>
        <thead>
          <tr>
            <th style={TH}>Order ID</th>
            <th style={TH}>Customer</th>
            <th style={TH}>Amount</th>
            <th style={TH}>Status</th>
            <th style={TH}>Date</th>
          </tr>
        </thead>
        <tbody>
          {stats.recentOrders.map((o) => (
            <tr key={o.orderId}>
              <td style={TD}><span style={{ fontFamily: 'var(--fm)', fontSize: 12 }}>{o.orderId}</span></td>
              <td style={TD}>{o.customer}</td>
              <td style={TD}><strong>{fmt(o.total)}</strong></td>
              <td style={TD}><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
              <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{o.createdAt?.slice(0, 10)}</td>
            </tr>
          ))}
          {stats.recentOrders.length === 0 && (
            <tr><td colSpan={5} style={{ ...TD, textAlign: 'center', color: 'var(--muted)' }}>No orders yet</td></tr>
          )}
        </tbody>
      </TableWrap>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRODUCTS TAB
════════════════════════════════════════════════════════════════════ */

function ProductsTab() {
  const [data, setData] = useState<Paginated<AdminProduct>>({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{ id: number; stock: string; price: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchData = useCallback(async (p = page, s = search, c = category) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20', search: s, category: c });
    const res = await fetch(`/api/admin/products?${params}`);
    const json = await res.json();
    setData({ data: json.products ?? [], total: json.total ?? 0, page: json.page ?? 1, pages: json.pages ?? 1 });
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => { fetchData(1, search, category); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData(1, search, category);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, stock: editing.stock, price: editing.price }),
    });
    if (res.ok) {
      setSaveMsg('Saved!');
      setEditing(null);
      fetchData(page, search, category);
    } else {
      setSaveMsg('Save failed.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 2500);
  }

  const CATEGORIES = ['GPUs', 'CPUs', 'Motherboards', 'RAM', 'PSUs', 'Storage', 'Cooling', 'Cases', 'Peripherals'];
  const STOCK_OPTS = ['in', 'low', 'out'];

  return (
    <div>
      {/* Toolbar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="field" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{ flex: '1 1 200px', minWidth: 160, marginBottom: 0, padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff' }}
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); fetchData(1, search, e.target.value); }}
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>Search</button>
        {saveMsg && <span style={{ padding: '9px 0', fontSize: 13, color: saveMsg === 'Saved!' ? 'var(--green)' : 'var(--red)' }}>{saveMsg}</span>}
      </form>

      {/* Total */}
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{data.total} products</div>

      {loading ? <Spinner /> : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <th style={TH}>ID</th>
                <th style={TH}>Image</th>
                <th style={TH}>Product</th>
                <th style={TH}>Category</th>
                <th style={TH}>Price</th>
                <th style={TH}>Stock</th>
                <th style={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr key={p.id} style={{ background: editing?.id === p.id ? 'var(--blue-soft)' : undefined }}>
                  <td style={{ ...TD, fontFamily: 'var(--fm)', fontSize: 12 }}>#{p.id}</td>
                  <td style={TD}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: 'var(--paper)' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--paper)', display: 'grid', placeItems: 'center', fontSize: 9, color: 'var(--muted)' }}>IMG</div>
                    }
                  </td>
                  <td style={TD}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.brand}</div>
                  </td>
                  <td style={{ ...TD, color: 'var(--muted)', fontSize: 12 }}>{p.category}</td>
                  <td style={TD}>
                    {editing?.id === p.id
                      ? <input
                          type="number"
                          value={editing.price}
                          onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                          style={{ width: 80, padding: '4px 8px', border: '1px solid var(--blue)', borderRadius: 7, fontSize: 13 }}
                        />
                      : <strong>{fmt(p.price)}</strong>
                    }
                  </td>
                  <td style={TD}>
                    {editing?.id === p.id
                      ? <select
                          value={editing.stock}
                          onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                          style={{ padding: '4px 8px', border: '1px solid var(--blue)', borderRadius: 7, fontSize: 13 }}
                        >
                          {STOCK_OPTS.map((s) => <option key={s} value={s}>{stockLabel(s)}</option>)}
                        </select>
                      : <span className={`badge ${statusBadge(p.stock)}`}>{stockLabel(p.stock)}</span>
                    }
                  </td>
                  <td style={TD}>
                    {editing?.id === p.id
                      ? <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={saveEdit} disabled={saving}>
                            {saving ? '…' : 'Save'}
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ borderRadius: 8 }} onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      : <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 8 }}
                          onClick={() => setEditing({ id: p.id, stock: p.stock, price: p.price })}
                        >
                          Edit
                        </button>
                    }
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: 'var(--muted)' }}>No products found</td></tr>
              )}
            </tbody>
          </TableWrap>
          <Pagination page={page} pages={data.pages} onPage={(p) => { setPage(p); fetchData(p, search, category); }} />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ORDERS TAB
════════════════════════════════════════════════════════════════════ */

function OrdersTab() {
  const [data, setData] = useState<Paginated<AdminOrder>>({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [patching, setPatching] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async (p = page, s = search, st = status) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20', search: s, status: st });
    const res = await fetch(`/api/admin/orders?${params}`);
    const json = await res.json();
    setData({ data: json.orders ?? [], total: json.total ?? 0, page: json.page ?? 1, pages: json.pages ?? 1 });
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchData(1, '', ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData(1, search, status);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setPatching(orderId);
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    if (res.ok) {
      setMsg('Status updated');
      fetchData(page, search, status);
    } else {
      setMsg('Update failed');
    }
    setPatching(null);
    setTimeout(() => setMsg(''), 2500);
  }

  const STATUS_OPTS = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order ID, customer, email…"
          style={{ flex: '1 1 200px', minWidth: 160, padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); fetchData(1, search, e.target.value); }}
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>Search</button>
        {msg && <span style={{ padding: '9px 0', fontSize: 13, color: 'var(--muted)' }}>{msg}</span>}
      </form>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{data.total} orders</div>

      {loading ? <Spinner /> : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <th style={TH}>Order ID</th>
                <th style={TH}>Customer</th>
                <th style={TH}>Email</th>
                <th style={TH}>Items</th>
                <th style={TH}>Amount</th>
                <th style={TH}>Method</th>
                <th style={TH}>Status</th>
                <th style={TH}>Date</th>
                <th style={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.orderId}>
                  <td style={{ ...TD, fontFamily: 'var(--fm)', fontSize: 11 }}>{o.orderId}</td>
                  <td style={TD}><strong>{o.customer}</strong></td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--muted)' }}>{o.email}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>{o.itemCount}</td>
                  <td style={TD}><strong>{fmt(o.total)}</strong></td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--muted)' }}>{o.paymentMethod ?? '—'}</td>
                  <td style={TD}><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--muted)' }}>{o.createdAt?.slice(0, 10)}</td>
                  <td style={TD}>
                    <select
                      defaultValue={o.status}
                      disabled={patching === o.orderId}
                      onChange={(e) => updateStatus(o.orderId, e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 12, background: '#fff' }}
                    >
                      {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr><td colSpan={9} style={{ ...TD, textAlign: 'center', color: 'var(--muted)' }}>No orders found</td></tr>
              )}
            </tbody>
          </TableWrap>
          <Pagination page={page} pages={data.pages} onPage={(p) => { setPage(p); fetchData(p, search, status); }} />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   USERS TAB
════════════════════════════════════════════════════════════════════ */

function UsersTab() {
  const [data, setData] = useState<Paginated<AdminUser>>({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [patching, setPatching] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async (p = page, s = search) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20', search: s });
    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setData({ data: json.users ?? [], total: json.total ?? 0, page: json.page ?? 1, pages: json.pages ?? 1 });
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(1, ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData(1, search);
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setPatching(userId);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole }),
    });
    const json = await res.json();
    if (res.ok) {
      setMsg(`Role updated to ${newRole}`);
      fetchData(page, search);
    } else {
      setMsg(json.error ?? 'Update failed');
    }
    setPatching(null);
    setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ flex: '1 1 200px', minWidth: 160, padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        />
        <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>Search</button>
        {msg && <span style={{ padding: '9px 0', fontSize: 13, color: 'var(--muted)' }}>{msg}</span>}
      </form>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{data.total} users</div>

      {loading ? <Spinner /> : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <th style={TH}>Name</th>
                <th style={TH}>Email</th>
                <th style={TH}>Phone</th>
                <th style={TH}>Role</th>
                <th style={TH}>Joined</th>
                <th style={TH}>Wishlist</th>
                <th style={TH}>Addresses</th>
                <th style={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u.id}>
                  <td style={TD}><strong>{u.name}</strong></td>
                  <td style={{ ...TD, fontSize: 12 }}>{u.email}</td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--muted)' }}>{u.phone || '—'}</td>
                  <td style={TD}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-success' : ''}`}
                      style={u.role !== 'admin' ? { background: 'var(--paper)', color: 'var(--muted)' } : undefined}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ ...TD, fontSize: 12, color: 'var(--muted)' }}>{u.createdAt?.slice(0, 10)}</td>
                  <td style={{ ...TD, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 12 }}>{u.wishlistCount}</td>
                  <td style={{ ...TD, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: 12 }}>{u.addressCount}</td>
                  <td style={TD}>
                    <button
                      className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ borderRadius: 8, fontSize: 12 }}
                      disabled={patching === u.id}
                      onClick={() => toggleRole(u.id, u.role)}
                    >
                      {patching === u.id ? '…' : u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr><td colSpan={8} style={{ ...TD, textAlign: 'center', color: 'var(--muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </TableWrap>
          <Pagination page={page} pages={data.pages} onPage={(p) => { setPage(p); fetchData(p, search); }} />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGS TAB
════════════════════════════════════════════════════════════════════ */

function LogsTab() {
  const [data, setData] = useState<Paginated<AdminLog>>({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async (p = page, l = level, c = category) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '50', level: l, category: c });
    const res = await fetch(`/api/admin/logs?${params}`);
    const json = await res.json();
    setData({ data: json.logs ?? [], total: json.total ?? 0, page: json.page ?? 1, pages: json.pages ?? 1 });
    setLoading(false);
  }, [page, level, category]);

  useEffect(() => { fetchData(1, '', ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function clearLogs() {
    if (!confirm('Delete all logs? This cannot be undone.')) return;
    setClearing(true);
    const res = await fetch('/api/admin/logs', { method: 'DELETE' });
    const json = await res.json();
    if (res.ok) {
      setMsg(`Deleted ${json.deleted} logs`);
      fetchData(1, level, category);
      setPage(1);
    } else {
      setMsg('Delete failed');
    }
    setClearing(false);
    setTimeout(() => setMsg(''), 3000);
  }

  const LEVELS = ['info', 'warn', 'error', 'success'];
  const CATS   = ['auth', 'payment', 'push', 'admin', 'system'];

  const levelColor: Record<string, string> = {
    info:    'var(--blue)',
    warn:    'var(--warning)',
    error:   'var(--red)',
    success: 'var(--green)',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1); fetchData(1, e.target.value, category); }}
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        >
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); fetchData(1, level, e.target.value); }}
          style={{ padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--ink)' }}
        >
          <option value="">All Categories</option>
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 10 }}
          onClick={() => { setLevel(''); setCategory(''); setPage(1); fetchData(1, '', ''); }}
        >
          Reset
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{msg}</span>}
          <button
            className="btn btn-danger btn-sm"
            style={{ borderRadius: 10 }}
            onClick={clearLogs}
            disabled={clearing}
          >
            {clearing ? 'Clearing…' : 'Clear All Logs'}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{data.total} entries</div>

      {loading ? <Spinner /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, fontFamily: 'var(--fm)' }}>
              <thead>
                <tr>
                  <th style={TH}>Level</th>
                  <th style={TH}>Category</th>
                  <th style={TH}>Message</th>
                  <th style={TH}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((log) => (
                  <tr key={log._id} style={{ background: log.level === 'error' ? 'var(--danger-soft)' : undefined }}>
                    <td style={{ ...TD, fontFamily: 'var(--fm)' }}>
                      <span style={{
                        fontWeight: 700, fontSize: 11,
                        color: levelColor[log.level] ?? 'var(--muted)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {log.level}
                      </span>
                    </td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{log.category}</td>
                    <td style={{ ...TD, maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.message}
                    </td>
                    <td style={{ ...TD, color: 'var(--muted)', whiteSpace: 'nowrap', fontSize: 11 }}>
                      {log.timestamp?.slice(0, 19).replace('T', ' ')}
                    </td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr><td colSpan={4} style={{ ...TD, textAlign: 'center', color: 'var(--muted)' }}>No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={data.pages} onPage={(p) => { setPage(p); fetchData(p, level, category); }} />
        </>
      )}
    </div>
  );
}
