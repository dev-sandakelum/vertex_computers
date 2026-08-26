import type { Metadata } from 'next';
import { RegisterView } from '@/app/components/views/AuthViews';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Vertex Computers for faster checkout and order tracking.',
};

export default function RegisterPage() {
  return <RegisterView />;
}
