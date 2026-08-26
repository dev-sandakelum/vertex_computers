'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/components/providers/AppProvider';
import SearchSuggestions, { useSearchKeyboard } from '@/app/components/ui/SearchSuggestions';

export default function SearchSheet() {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSelect(label: string) {
    setQuery(label);
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(label)}`);
  }

  function handleSubmit(q: string) {
    setSearchOpen(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  }

  function handleClose() {
    setSearchOpen(false);
    setQuery('');
  }

  const { handleKeyDown } = useSearchKeyboard({
    query,
    onSelect: handleSelect,
    onSubmit: handleSubmit,
    onClose: handleClose,
  });

  return (
    <div
      className={`search-sheet${searchOpen ? ' show' : ''}`}
      role="search"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="search-row">
        <button className="icon-btn" onClick={handleClose} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <input
          type="search"
          placeholder="Search GPUs, CPUs, RAM…"
          aria-label="Search products"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          ref={(el) => { if (el && searchOpen) setTimeout(() => el.focus(), 60); }}
        />
        {query && (
          <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search" style={{ flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
      <SearchSuggestions query={query} onSelect={handleSelect} onSubmit={handleSubmit} variant="sheet" />
    </div>
  );
}
