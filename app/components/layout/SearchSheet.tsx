'use client';

import { useApp } from '@/app/components/providers/AppProvider';

export default function SearchSheet() {
  const { searchOpen, setSearchOpen, setView } = useApp();

  return (
    <div className={`search-sheet${searchOpen ? ' show' : ''}`} role="search" aria-modal="true" aria-label="Search">
      <div className="search-row">
        <button className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <input
          type="search"
          placeholder="Search GPUs, CPUs, RAM…"
          autoFocus={searchOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchOpen(false);
              setView('category');
            }
            if (e.key === 'Escape') setSearchOpen(false);
          }}
        />
      </div>
      <p className="muted" style={{ fontSize: '12px', marginTop: '14px', padding: '4px' }}>
        Popular: RTX GPUs, DDR5 RAM, NVMe SSD, AIO Coolers
      </p>
    </div>
  );
}
