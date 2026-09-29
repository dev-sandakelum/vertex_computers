'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.3-4.9 3.3-8.2Z"/>
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.6l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23Z"/>
    <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9l3.7-2.8Z"/>
    <path fill="#EA4335" d="M12 6.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9c.9-2.7 3.3-4.6 6.2-4.6Z"/>
  </svg>
);

export default function LoginForm() {
  const { authUser, authReady, signIn, showToast } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authReady && authUser) {
      router.replace('/account');
    }
  }, [authReady, authUser, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = signIn({ email, password, rememberMe });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      showToast(result.message);
      return;
    }

    showToast(result.message);
    router.replace('/account');
  }

  return (
    <div className="auth-card">
      {/* Heading */}
      <div className="auth-card-head">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>
      </div>

      {/* Social */}
      <div className="auth-socials">
        <button
          type="button"
          className="auth-social-btn"
          onClick={() => showToast('Google sign-in (demo)')}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="auth-divider">
        <span>or sign in with email</span>
      </div>

      {/* Form */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-header">
            <label htmlFor="password">Password</label>
            <a
              href="#"
              className="auth-forgot"
              onClick={(e) => { e.preventDefault(); showToast('Password reset link sent (demo)'); }}
            >
              Forgot password?
            </a>
          </div>
          <div className="auth-input-wrap">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
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

        <label className="auth-remember">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <span>Keep me signed in</span>
        </label>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '-4px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className={`auth-submit${loading ? ' auth-submit--loading' : ''}`}
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--text-2)' }}>
        Demo account: <b>name@example.com</b> / <b>Demo1234!</b>
      </p>

      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <Link href="/account/register">Create one free</Link>
      </p>
    </div>
  );
}
