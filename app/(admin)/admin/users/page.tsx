import type { Metadata } from 'next';
import AdminShell from '../../AdminShell';
export const metadata: Metadata = { title: 'Users' };
export default function AdminUsersPage() {
  return <AdminShell activeTab="users" />;
}
