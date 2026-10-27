'use client';

/**
 * Reveal — scroll-reveal wrapper (Task 6)
 * ---------------------------------------
 * Fades + slides content in when it enters the viewport (once).
 *
 * - Uses IntersectionObserver (no scroll listeners, no re-renders — the
 *   `in` class is toggled directly on the DOM node)
 * - Animates ONLY opacity + transform
 * - If the user prefers reduced motion, content is shown immediately
 *   (also enforced in CSS as a belt-and-braces fallback)
 */

import { useEffect, useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Extra transition delay in ms once visible */
  delay?: number;
  className?: string;
  as?: 'div' | 'section';
}

export default function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion → show instantly, no observer needed
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
