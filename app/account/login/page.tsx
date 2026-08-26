import type { Metadata } from 'next';
import { LoginView } from '@/app/components/views/AuthViews';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Sign in to your Vertex Computers account.',
};

export default function LoginPage() {
  return <LoginView />;
}
