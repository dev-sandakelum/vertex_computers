'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/components/providers/AppProvider';

export default function ForgotPasswordForm() {
  const { showToast } = useApp();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [devUrl,  setDevUrl]  = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
      showToast('Reset link sent — check your inbox.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <div className="auth-card-head">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to reset your password.
            The link is valid for 1 hour.
          </p>
        </div>

        {devUrl && (
          <div
            style={{
              background: 'var(--warning-soft, #fff7e6)',
              border: '1px solid #f3d9a4',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13px',
              marginBottom: '16px',
              wordBreak: 'break-all',
            }}
          >
            <strong>Development mode:</strong> no mail server is configured, so here is your reset link:<br />
            <a href={devUrl}>{devUrl}</a>
          </div>
        )}

        <p className="auth-switch" style={{ marginTop: 0 }}>
          Didn&apos;t get it? Check your spam folder, or{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); setDevUrl(''); }}>try again</a>.
        </p>
        <p className="auth-switch">
          <Link href="/account/login">← Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-head">
        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-subtitle">Enter your account email and we&apos;ll send you a link to reset it.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="fp-email">Email address</label>
          <input
            id="fp-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
            autoFocus
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '-4px' }}>
            {error}
          </p>
        )}

        <button type="submit" className={`auth-submit${loading ? ' auth-submit--loading' : ''}`} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : 'Send reset link'}
        </button>
      </form>

      <p className="auth-switch">
        Remembered it?{' '}
        <Link href="/account/login">Back to log in</Link>
      </p>
    </div>
  );
}
