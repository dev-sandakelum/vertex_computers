'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.3-4.9 3.3-8.2Z"/>
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.6l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23Z"/>
    <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9l3.7-2.8Z"/>
    <path fill="#EA4335" d="M12 6.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9c.9-2.7 3.3-4.6 6.2-4.6Z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z"/>
  </svg>
);

export function LoginView() {
  const { showToast } = useApp();
  const router = useRouter();
  return (
    <div className="container">
      <div className="card auth-wrap">
        <h1>Welcome back 👋</h1>
        <p>Log in to track orders, save builds, and check out faster.</p>
        <div className="field"><label htmlFor="lemail">Email</label><input id="lemail" type="email" placeholder="name@example.com" autoComplete="email" /></div>
        <div className="field"><label htmlFor="lpass">Password</label><input id="lpass" type="password" placeholder="••••••••" autoComplete="current-password" /></div>
        <div className="remember-row">
          <label><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> Remember me</label>
          <a className="link" href="#" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent (demo)'); }}>Forgot password?</a>
        </div>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => router.push('/account')}>Log In</button>
        <div className="or-sep">or continue with</div>
        <div className="social-btns">
          <button className="btn btn-secondary btn-block" onClick={() => showToast('Google sign-in (demo)')}><GoogleIcon /> Continue with Google</button>
          <button className="btn btn-secondary btn-block" onClick={() => showToast('Facebook sign-in (demo)')}><FacebookIcon /> Continue with Facebook</button>
        </div>
        <p className="auth-foot">
          Don&apos;t have an account?{' '}
          <Link href="/account/register" className="link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterView() {
  const { showToast } = useApp();
  const router = useRouter();
  return (
    <div className="container">
      <div className="card auth-wrap">
        <h1>Create Account</h1>
        <p>Join Vertex Computers for faster checkout and order tracking.</p>
        <div className="field-row">
          <div className="field"><label htmlFor="rfn">First name</label><input id="rfn" placeholder="John" /></div>
          <div className="field"><label htmlFor="rln">Last name</label><input id="rln" placeholder="Doe" /></div>
        </div>
        <div className="field"><label htmlFor="remail">Email</label><input id="remail" type="email" placeholder="name@example.com" /></div>
        <div className="field"><label htmlFor="rpass">Password</label><input id="rpass" type="password" placeholder="Min. 8 characters" /></div>
        <div className="field"><label htmlFor="rpass2">Confirm password</label><input id="rpass2" type="password" placeholder="Repeat password" /></div>
        <label className="fopt" style={{ marginBottom: '16px' }}>
          <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
          I agree to the <Link href="#" className="link">Terms</Link> &amp; <Link href="#" className="link">Privacy Policy</Link>
        </label>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => router.push('/account')}>Create Account</button>
        <div className="or-sep">or sign up with</div>
        <div className="social-btns">
          <button className="btn btn-secondary btn-block" onClick={() => showToast('Google sign-up (demo)')}><GoogleIcon /> Sign up with Google</button>
          <button className="btn btn-secondary btn-block" onClick={() => showToast('Facebook sign-up (demo)')}><FacebookIcon /> Sign up with Facebook</button>
        </div>
        <p className="auth-foot">
          Already have an account?{' '}
          <Link href="/account/login" className="link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
