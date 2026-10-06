import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DB Push Terminal | Vertex Admin',
  robots: { index: false, follow: false },
};

/**
 * Bare admin layout — no header, footer, nav, or providers.
 * Sets the body to dark so the terminal's fixed inset-0 has no flash.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html,body{background:#0c0c10!important;overflow:hidden}`}</style>
      {children}
    </>
  );
}
