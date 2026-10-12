import type { Metadata } from 'next';
import AdminShell from '../../AdminShell';
export const metadata: Metadata = { title: 'Products' };
export default function AdminProductsPage() {
  return <AdminShell activeTab="products" />;
}
