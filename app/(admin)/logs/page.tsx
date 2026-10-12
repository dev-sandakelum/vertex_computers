import type { Metadata } from 'next';
import AdminShell from '../AdminShell';
export const metadata: Metadata = { title: 'Logs' };
export default function AdminLogsPage() {
  return <AdminShell activeTab="logs" />;
}
