import type { Metadata } from 'next';
import { Suspense } from 'react';
import AccountView from '@/app/components/views/AccountView';
import { Skel } from '@/app/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your profile, orders, addresses, and payment methods.',
};

/** Suspense boundary required by useSearchParams() inside AccountView. */
export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ paddingTop: '40px' }}>
          <Skel w={140} h={13} r={99} style={{ marginBottom: 18 }} />
          <Skel w={220} h={22} style={{ marginBottom: 26 }} />
          <Skel w="100%" h={320} r={16} />
        </div>
      }
    >
      <AccountView />
    </Suspense>
  );
}
