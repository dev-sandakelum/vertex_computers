import Link from 'next/link';
import { SearchXIcon } from '@/app/components/icons';

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      <div
        className="empty-state"
        style={{
          border: '1.5px dashed var(--line)',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <SearchXIcon size={56} style={{ margin: '0 auto 14px', color: 'var(--muted)', display: 'block', strokeWidth: 1.6 }} />
        <h1 style={{ color: 'var(--ink)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
          Page not found
        </h1>
        <p style={{ marginBottom: '24px' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/"    className="btn btn-primary">Go Home</Link>
          <Link href="/shop" className="btn btn-secondary">Browse Components</Link>
        </div>
      </div>
    </div>
  );
}
