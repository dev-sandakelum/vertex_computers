import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from '../_components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your Vertex Computers account.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p className="muted" style={{ textAlign: 'center' }}>Loading…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
