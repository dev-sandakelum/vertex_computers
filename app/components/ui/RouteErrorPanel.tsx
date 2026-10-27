'use client';

/**
 * RouteErrorPanel — shared UI for route `error.tsx` boundaries.
 * Friendly, on-brand error card with retry + fallback navigation.
 * Kept in one place so every route's error state looks identical.
 */

import Link from 'next/link';

interface Props {
  title?: string;
  message?: string;
  detail?: string;
  reset: () => void;
}

export default function RouteErrorPanel({
  title = 'Something went wrong',
  message = 'We hit an unexpected error loading this page.',
  detail,
  reset,
}: Props) {
  return (
    <div className="container" style={{ maxWidth: '560px', paddingTop: '72px', paddingBottom: '72px' }}>
      <div
        role="alert"
        className="card"
        style={{ padding: '40px 32px', textAlign: 'center', borderRadius: 'var(--radius)' }}
      >
        {/* Broken-package glyph, drawn in the house icon style */}
        <svg
          width="56" height="56" viewBox="0 0 56 56" fill="none"
          stroke="var(--red)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" style={{ margin: '0 auto 18px' }}
        >
          <path d="M14 20 28 13l14 7v16l-14 7-14-7V20Z" />
          <path d="M14 20l14 7 14-7M28 27v16" />
          <path d="M22 8l12 6" strokeDasharray="1 6" />
        </svg>

        <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-.01em' }}>{title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '4px' }}>{message}</p>

        {detail && (
          <p
            className="mono"
            style={{
              color: 'var(--muted)', fontSize: '11.5px', margin: '12px auto 0',
              maxWidth: '44ch', overflowWrap: 'break-word',
              background: 'var(--surface-2)', borderRadius: '8px', padding: '8px 12px',
            }}
          >
            {detail}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={reset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>
            Try again
          </button>
          <Link href="/shop" className="btn btn-secondary">Browse Components</Link>
          <Link href="/" className="btn btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
