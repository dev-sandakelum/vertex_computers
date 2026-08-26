import type { Metadata } from 'next';
import RegisterForm from '../_components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Vertex Computers for faster checkout and order tracking.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
