import type { Metadata } from 'next';
import AdminShell from '../AdminShell';
export const metadata: Metadata = { title: 'Orders' };
export default function AdminOrdersPage() {
  return <AdminShell activeTab="orders" />;
}
