import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>Page Not Found</h1>
      <p className="muted" style={{ marginBottom: '28px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">Go Home</Link>
        <Link href="/shop" className="btn btn-secondary">Browse Shop</Link>
      </div>
    </div>
  );
}
