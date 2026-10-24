'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // redirect if already admin
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.user?.role === 'admin') router.replace('/admin');
    }).catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Both fields are required.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed.'); return; }
      router.replace('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #040918, #0A1233 60%, #101C4A)',
      fontFamily: 'var(--fd)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#fff', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Vertex" width={40} height={40} style={{ borderRadius: '10px' }} />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>VERTEX</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,.4)',
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: 'var(--ink)' }}>
            Admin Sign In
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
            Restricted to authorized administrators only.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="al-email">Email address</label>
              <input
                id="al-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vertex.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="al-pass">Password</label>
              <input
                id="al-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-soft)', border: '1px solid #f5c2c7',
                borderRadius: '10px', padding: '10px 14px',
                color: 'var(--red)', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: '4px', borderRadius: '12px', height: '48px', fontSize: '15px' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,.35)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.5)' }}>← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
