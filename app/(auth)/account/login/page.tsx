import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '../_components/LoginForm';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Sign in to your Vertex Computers account to track orders and check out faster.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p className="muted" style={{ textAlign: 'center' }}>Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
