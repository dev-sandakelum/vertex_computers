import type { Metadata } from 'next';
import AdminShell from '../AdminShell';

export const metadata: Metadata = { title: 'Dashboard' };

export default function AdminPage() {
  return <AdminShell activeTab="dashboard" />;
}
