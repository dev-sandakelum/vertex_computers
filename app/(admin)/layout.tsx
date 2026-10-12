import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin — Vertex Computers', template: '%s | Vertex Admin' },
  robots: { index: false, follow: false },
};

/**
 * Bare admin layout — no storefront chrome.
 * The full admin shell (sidebar + topbar) is rendered client-side
 * inside AdminShell, keeping the layout simple and SSR-friendly.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F2F5FB' }}>
      {children}
    </div>
  );
}
