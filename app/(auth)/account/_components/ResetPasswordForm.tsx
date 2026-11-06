'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';

type LinkState = 'checking' | 'valid' | 'invalid';

export default function ResetPasswordForm() {
  const { showToast } = useApp();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const token         = searchParams.get('token') ?? '';

  const [linkState, setLinkState] = useState<LinkState>(token ? 'checking' : 'invalid');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  // Verify the token before showing the form so an expired link gets a clear
  // message instead of a failed submit.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setLinkState(d.valid ? 'valid' : 'invalid'); })
      .catch(() => { if (!cancelled) setLinkState('invalid'); });
    return () => { cancelled = true; };
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not reset the password. Please try again.');
        return;
      }
      setDone(true);
      showToast('Password reset! You can now log in.');
      setTimeout(() => router.replace('/account/login'), 2500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (linkState === 'checking') {
    return (
      <div className="auth-card">
        <p className="muted" style={{ textAlign: 'center' }}>Verifying your reset link…</p>
      </div>
    );
  }

  if (linkState === 'invalid') {
    return (
      <div className="auth-card">
        <div className="auth-card-head">
          <h1 className="auth-title">Link invalid or expired</h1>
          <p className="auth-subtitle">
            This password reset link is no longer valid. Reset links expire after 1 hour and can only be used once.
          </p>
        </div>
        <Link href="/account/forgot-password" className="auth-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          Request a new link
        </Link>
        <p className="auth-switch">
          <Link href="/account/login">← Back to log in</Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-card">
        <div className="auth-card-head">
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">Your password has been reset. Redirecting you to log in…</p>
        </div>
        <p className="auth-switch">
          <Link href="/account/login">Go to log in now</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <h1 className="auth-title">Choose a new password</h1>
        <p className="auth-subtitle">Use at least 8 characters. Avoid passwords you use elsewhere.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="rp-password">New password</label>
          <div className="auth-input-wrap">
            <input
              id="rp-password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              autoFocus
            />
            <button type="button" className="auth-eye" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17.9 17.9A10 10 0 0 1 12 20C7 20 2.7 16.4 1 12a10.1 10.1 0 0 1 5.1-5.9M9.9 4.2A9.8 9.8 0 0 1 12 4c5 0 9.3 3.6 11 8a10.1 10.1 0 0 1-4.2 5.1M3 3l18 18"/>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="rp-confirm">Confirm new password</label>
          <input
            id="rp-confirm"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            required
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '-4px' }}>
            {error}
          </p>
        )}

        <button type="submit" className={`auth-submit${loading ? ' auth-submit--loading' : ''}`} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : 'Reset password'}
        </button>
      </form>

      <p className="auth-switch">
        <Link href="/account/login">← Back to log in</Link>
      </p>
    </div>
  );
}
