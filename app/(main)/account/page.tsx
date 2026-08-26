import type { Metadata } from 'next';
import AccountView from '@/app/components/views/AccountView';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your profile, orders, addresses, and payment methods.',
};

export default function AccountPage() {
  return <AccountView />;
}
