'use client';

/**
 * StoreBadge — Google Play / App Store download badge (Issue 3).
 *
 * Design: dark navy pill (~168×52) with a 1px subtle border, inline-SVG
 * brand mark on the left, small kicker above a bold store name. Hover lifts
 * the badge (translateY(-2px)) with a soft shadow and a slightly brighter
 * background (200ms). :focus-visible ring for keyboard users, aria-label
 * for screen readers, target="_blank" + rel="noopener noreferrer".
 *
 * URLs come from lib/siteConfig.ts (single place to swap in the real
 * listing links); the `href` prop overrides when a page needs its own.
 *
 * Responsive behaviour (globals.css `.apps`):
 *   desktop  stacked vertically in the footer column
 *   tablet   side by side
 *   mobile   full-width, stacked
 */

import type { StoreKind } from '@/lib/siteConfig';
import { STORE_LINKS } from '@/lib/siteConfig';
import { GooglePlayMark, AppleMark } from '@/app/components/icons';

interface StoreBadgeProps {
  store: 'google' | 'apple';
  /** Defaults to the URL from lib/siteConfig.ts. */
  href?: string;
}

const STORE_META: Record<StoreKind, {
  kicker: string;
  name: string;
  ariaLabel: string;
  icon: React.ReactNode;
}> = {
  google: {
    kicker: 'GET IT ON',
    name: 'Google Play',
    ariaLabel: 'Get it on Google Play',
    icon: <GooglePlayMark size={22} />,
  },
  apple: {
    kicker: 'Download on the',
    name: 'App Store',
    ariaLabel: 'Download on the App Store',
    icon: <AppleMark size={26} />,
  },
};

export default function StoreBadge({ store, href }: StoreBadgeProps) {
  const meta = STORE_META[store];
  return (
    <a
      className="store-badge"
      href={href ?? STORE_LINKS[store]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={meta.ariaLabel}
    >
      <span className="sb-icon" aria-hidden="true">{meta.icon}</span>
      <span className="sb-text">
        <small>{meta.kicker}</small>
        <b>{meta.name}</b>
      </span>
    </a>
  );
}
