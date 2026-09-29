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

export default function RegisterForm() {
  const { authUser, authReady, register, showToast } = useApp();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authReady && authUser) {
      router.replace('/account');
    }
  }, [authReady, authUser, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      const message = 'Complete every field before creating your account.';
      setError(message);
      showToast(message);
      return;
    }

    if (password.length < 8) {
      const message = 'Password must be at least 8 characters long.';
      setError(message);
      showToast(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.';
      setError(message);
      showToast(message);
      return;
    }

    if (!agreed) {
      const message = 'Please agree to the Terms & Privacy Policy.';
      setError(message);
      showToast(message);
      return;
    }

    setLoading(true);
    const result = register({
      firstName,
      lastName,
      email,
      phone,
      password,
      rememberMe: true,
      acceptedTerms: agreed,
    });
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
      <div className="auth-card-head">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Vertex Computers — it&apos;s free</p>
      </div>

      <div className="auth-socials">
        <button type="button" className="auth-social-btn" onClick={() => showToast('Google sign-up (demo)')}>
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className="auth-divider"><span>or register with email</span></div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor="rfn">First name</label>
            <input id="rfn" type="text" placeholder="John" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label htmlFor="rln">Last name</label>
            <input id="rln" type="text" placeholder="Doe" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="remail">Email address</label>
          <input id="remail" type="email" placeholder="name@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="auth-field">
          <label htmlFor="rphone">Phone number</label>
          <input id="rphone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div className="auth-field">
          <label htmlFor="rpassword">Password</label>
          <div className="auth-input-wrap">
            <input
              id="rpassword"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
          <label htmlFor="rpassword2">Confirm password</label>
          <input
            id="rpassword2"
            type={showPass ? 'text' : 'password'}
            placeholder="Repeat password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <label className="auth-remember auth-terms">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            I agree to the{' '}
            <Link href="#" onClick={(e) => { e.preventDefault(); showToast('Terms of Service (demo)'); }}>Terms of Service</Link>
            {' '}&amp;{' '}
            <Link href="#" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy (demo)'); }}>Privacy Policy</Link>
          </span>
        </label>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '-4px' }}>
            {error}
          </p>
        )}

        <button type="submit" className={`auth-submit${loading ? ' auth-submit--loading' : ''}`} disabled={loading}>
          {loading ? <span className="auth-spinner" /> : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--text-2)' }}>
        Your account is stored in this browser for the demo experience.
      </p>

      <p className="auth-switch">
        Already have an account?{' '}
        <Link href="/account/login">Sign in</Link>
      </p>
    </div>
  );
}
