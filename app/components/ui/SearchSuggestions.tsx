'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getSearchSuggestions,
  TRENDING,
  CATEGORY_SHORTCUTS,
  type SearchSuggestion,
} from '@/lib/searchKeywords';

interface SearchSuggestionsProps {
  /** Current input value */
  query: string;
  /** Called when user picks a suggestion */
  onSelect: (label: string) => void;
  /** Called when user submits (Enter or clicks search) */
  onSubmit: (query: string) => void;
  /** Variant: 'dropdown' for desktop header, 'sheet' for mobile full-screen */
  variant?: 'dropdown' | 'sheet';
}

export default function SearchSuggestions({
  query,
  onSelect,
  onSubmit,
  variant = 'dropdown',
}: SearchSuggestionsProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = getSearchSuggestions(query);
  const listRef = useRef<HTMLUListElement>(null);

  /* reset active index whenever suggestions change */
  useEffect(() => { setActiveIndex(-1); }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          onSelect(suggestions[activeIndex].label);
        } else {
          onSubmit(query);
        }
      } else if (e.key === 'Escape') {
        setActiveIndex(-1);
      }
    },
    [activeIndex, suggestions, query, onSelect, onSubmit],
  );

  const isSheet = variant === 'sheet';

  /* ── Empty state: trending + category shortcuts ─────────── */
  if (!query.trim()) {
    return (
      <div className={`srch-panel ${isSheet ? 'srch-panel--sheet' : 'srch-panel--dropdown'}`}>
        {/* Trending */}
        <div className="srch-group">
          <span className="srch-group-label">Trending</span>
          <div className="srch-trending">
            {TRENDING.map((term) => (
              <button
                key={term}
                className="srch-pill"
                onClick={() => onSelect(term)}
                type="button"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Category shortcuts */}
        <div className="srch-group">
          <span className="srch-group-label">Browse by category</span>
          <div className="srch-cats">
            {CATEGORY_SHORTCUTS.map((c) => (
              <button
                key={c.label}
                className="srch-cat-btn"
                onClick={() => onSubmit(c.label)}
                type="button"
              >
                <span className="srch-cat-ic">
                  <svg width="16" height="16"><use href={`#${c.icon}`} /></svg>
                </span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── No results ─────────────────────────────────────────── */
  if (suggestions.length === 0) {
    return (
      <div className={`srch-panel ${isSheet ? 'srch-panel--sheet' : 'srch-panel--dropdown'}`}>
        <div className="srch-empty">
          <span className="srch-empty-icon">🔍</span>
          <p>No results for <b>&quot;{query}&quot;</b></p>
          <p className="srch-empty-hint">Try a product name, category, or spec (e.g. &quot;16GB GDDR7&quot;)</p>
        </div>
      </div>
    );
  }

  /* ── Suggestion list ────────────────────────────────────── */
  return (
    <div className={`srch-panel ${isSheet ? 'srch-panel--sheet' : 'srch-panel--dropdown'}`}>
      <div className="srch-group">
        <span className="srch-group-label">Suggestions</span>
        <ul className="srch-list" ref={listRef} role="listbox" aria-label="Search suggestions">
          {suggestions.map((s, i) => (
            <SuggestionItem
              key={s.label}
              suggestion={s}
              query={query}
              isActive={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => onSelect(s.label)}
            />
          ))}
        </ul>
      </div>
    </div>
  );

  /* expose keyboard handler so parent input can wire it up */
  // (returned separately via the hook below)
}

/* ── Sub-component: single suggestion row ───────────────────────────────── */
function SuggestionItem({
  suggestion,
  query,
  isActive,
  onMouseEnter,
  onClick,
}: {
  suggestion: SearchSuggestion;
  query: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <li
      role="option"
      aria-selected={isActive}
      className={`srch-item${isActive ? ' srch-item--active' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {/* Icon */}
      <span className="srch-item-ic">
        {suggestion.icon ? (
          <svg width="16" height="16"><use href={`#${suggestion.icon}`} /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
        )}
      </span>

      {/* Label with matched query highlighted */}
      <span className="srch-item-label">
        <HighlightMatch text={suggestion.label} query={query} />
      </span>

      {/* Tag */}
      {suggestion.tag && (
        <span className="srch-item-tag">{suggestion.tag}</span>
      )}

      {/* Arrow */}
      <span className="srch-item-arrow" aria-hidden="true">↗</span>
    </li>
  );
}

/* ── Bold-highlight matched substring ───────────────────────────────────── */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="srch-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ── Keyboard navigation hook (used by parent inputs) ───────────────────── */
export function useSearchKeyboard({
  query,
  onSelect,
  onSubmit,
  onClose,
}: {
  query: string;
  onSelect: (label: string) => void;
  onSubmit: (query: string) => void;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = getSearchSuggestions(query);

  useEffect(() => { setActiveIndex(-1); }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          onSelect(suggestions[activeIndex].label);
        } else {
          onSubmit(query);
        }
      } else if (e.key === 'Escape') {
        setActiveIndex(-1);
        onClose();
      }
    },
    [activeIndex, suggestions, query, onSelect, onSubmit, onClose],
  );

  return { handleKeyDown, activeIndex, suggestions };
}
