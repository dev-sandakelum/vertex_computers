import type { Metadata } from 'next';
import ForgotPasswordForm from '../_components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your Vertex Computers account.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
