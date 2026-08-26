import Link from 'next/link';
import { AppProvider } from '@/app/components/providers/AppProvider';
import SvgDefs from '@/app/components/ui/SvgDefs';
import Toast from '@/app/components/ui/Toast';

/** Minimal auth layout — logo only, no nav chrome */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SvgDefs />
      <div className="auth-shell">
        <header className="auth-header">
          <Link href="/" className="auth-logo" aria-label="Vertex Computers home">
            <span className="logo-mark">V</span>
            <span className="auth-logo-text">
              VERTEX
              <small>Computers</small>
            </span>
          </Link>
        </header>

        <main className="auth-main">{children}</main>

        <footer className="auth-footer">
          <span>© 2026 Vertex Computers</span>
          <span className="auth-footer-sep">·</span>
          <Link href="#">Terms</Link>
          <span className="auth-footer-sep">·</span>
          <Link href="#">Privacy</Link>
          <span className="auth-footer-sep">·</span>
          <Link href="#">Help</Link>
        </footer>
      </div>
      <Toast />
    </AppProvider>
  );
}
