'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function Toast() {
  const { toast, toastVisible } = useApp();
  return (
    <div className={`toast${toastVisible ? ' show' : ''}`} role="status" aria-live="polite">
      {toast}
    </div>
  );
}
