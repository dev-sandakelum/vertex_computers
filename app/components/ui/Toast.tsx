'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function Toast() {
  const { toast, toastVisible } = useApp();
  return (
    <div
      className={`toast${toastVisible ? ' show' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: '26px',
        left: '50%',
        transform: toastVisible ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
        background: 'var(--ink)',
        color: '#EAF0FF',
        padding: '12px 22px',
        borderRadius: '99px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: 'var(--shadow-lg)',
        opacity: toastVisible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all .3s',
        zIndex: 150,
        maxWidth: '88%',
        textAlign: 'center',
        fontFamily: 'var(--fd)',
        border: '1px solid rgba(122,155,255,.2)',
        whiteSpace: 'nowrap',
      }}
    >
      {toast}
    </div>
  );
}
