/**
 * VERTEX — Icon Library
 * =====================
 * One organized home for every site-wide SVG icon (Task 4).
 *
 * Conventions:
 *  - All UI icons: 24×24 viewBox, stroke-based, strokeWidth 2,
 *    strokeLinecap/join "round", inherit `currentColor` (themeable).
 *  - Brand marks (payment / social): fixed brand colors — they cannot be
 *    currentColor. Sized via width/height props.
 *  - Decorative icons get `aria-hidden="true"` at the USAGE SITE; icons
 *    that carry meaning rely on the parent's aria-label.
 *  - Every icon accepts className + style for color/size overrides.
 */

import type { SVGProps, ReactNode } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

/* ══════════════════════════ UI ICONS ══════════════════════════ */

export function SearchIcon(props: IconProps) {
  return <svg {...base(props)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}

export function SearchXIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      <path d="m9 9 4 4M13 9l-4 4" />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h13v10H3zM16 10h4l1 3v4h-5" />
      <circle cx="6" cy="20" r="1.8" /><circle cx="18" cy="20" r="1.8" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" /></svg>;
}

export function ChatIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M20 6 9 17l-5-5" /></svg>;
}

export function CheckCircleIcon(props: IconProps) {
  return <svg {...base(props)}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.8-4.8" /></svg>;
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2s5 4.5 5 9.5a5 5 0 0 1-10 0c0-1.5.5-2.8 1.3-4C8.5 9 10 10 10 12a2 2 0 0 0 4 0c0-3-2-6-2-10Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return <svg {...base(props)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-5.5 8-5.5S18.5 17 20 21" /></svg>;
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="20" r="1.6" /><circle cx="17" cy="20" r="1.6" />
      <path d="M2 3h3l2.6 12.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  );
}

export function PackageXIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v3" />
      <path d="m17.5 16.5 3 3M20.5 16.5l-3 3" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M18 6 6 18M6 6l12 12" /></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M12 5v14M5 12h14" /></svg>;
}

export function MinusIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M5 12h14" /></svg>;
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M9 7V4.8a1 1 0 0 1 1-.8h4a1 1 0 0 1 1 .8V7m3 0-1 13.2a1.6 1.6 0 0 1-1.6 1.4H8.6A1.6 1.6 0 0 1 7 20.2L6 7M10 11v6M14 11v6" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>;
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function SignOutIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
}

export function OrdersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7V5a2 2 0 0 1 2-2h2M20 7V5a2 2 0 0 0-2-2h-2M4 17v2a2 2 0 0 0 2 2h2M20 17v2a2 2 0 0 1-2 2h-2M4 12h16" />
    </svg>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></svg>;
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v3" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return <svg {...base(props)}><path d="m6 9 6 6 6-6" /></svg>;
}

export function ThumbUpIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 10v11M7 10l4.2-7c.9-.4 2.3.2 2.3 1.6V9h4.6c1.4 0 2.4 1.3 2 2.6l-1.7 7A2.4 2.4 0 0 1 16 20.5H7M7 10H4v11h3" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>;
}

export function ArrowRightIcon(props: IconProps) {
  return <svg {...base(props)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
}

/** Celebration burst — used on the payment receipt */
export function CelebrationIcon({ size = 64, ...rest }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      {/* party horn */}
      <path d="M14 50 34 16l2 16 16-2-34 20Z" />
      {/* confetti */}
      <path d="M22 12v3M16 22l-2-2M30 8l-2 2M50 34l3 3M38 6h4M8 44l3 2" />
      <circle cx="46" cy="10" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="54" cy="22" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="34" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ══════════════════════════ SOCIAL ══════════════════════════ */

type BrandProps = SVGProps<SVGSVGElement> & { size?: number };

function social({ size = 18, ...rest }: BrandProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

export function FacebookIcon(props: BrandProps) {
  return (
    <svg {...social(props)}>
      <path d="M14 8.5V6.8c0-.8.5-1.3 1.4-1.3H17V2.6h-2.6C11.6 2.6 10.4 4.5 10.4 7v1.5H8v3h2.4V21h3.6v-9.5h2.7l.4-3H14Z" />
    </svg>
  );
}

export function InstagramIcon(props: BrandProps) {
  return (
    <svg {...social(props)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: BrandProps) {
  return (
    <svg {...social(props)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.3v5.4l4.8-2.7-4.8-2.7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: BrandProps) {
  return (
    <svg {...social(props)}>
      <path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.7l-5.3-6.4L4.3 21H1l7.8-8.9L1.8 3h6.9l4.8 5.8L17.7 3Zm-1.2 16h1.9L6.9 4.9H4.9L16.5 19Z" />
    </svg>
  );
}

/* ══════════════════════════ PAYMENT MARKS ══════════════════════════ */
/* Fixed brand colors — payment marks must be recognizable, not themed.  */

export function VisaMark({ size = 38, ...rest }: BrandProps) {
  return (
    <svg width={size} height={size * 0.33} viewBox="0 0 48 16" aria-hidden="true" focusable="false" {...rest}>
      <path fill="#1A1F71" d="M18.7 15.6h-3.9L17.2.5h3.9l-2.4 15.1ZM34.4.8A9.7 9.7 0 0 0 30.9.4c-3.8 0-6.5 2-6.5 4.9 0 2.1 2 3.3 3.4 4 1.5.7 2 1.2 2 1.9 0 1-1.2 1.5-2.4 1.5-1.6 0-2.8-.4-3.8-.9l-.5-.2-.6 3.5c1 .4 2.7.8 4.5.8 4.1 0 6.7-2 6.7-5.2 0-1.7-1-3-3.4-4.1-1.4-.7-2.2-1.2-2.2-1.8 0-.6.7-1.2 2.3-1.2 1.3 0 2.3.3 3 .5l.4.2.5-3.3Z" />
      <path fill="#1A1F71" d="M41.6.5h-3c-.9 0-1.6.3-2 1.3l-5.8 13.8h4.1l.8-2.3h5l.5 2.3h3.5L41.6.5Zm-4.8 9.7 1.5-4.4.9 4.4h-2.4ZM11.9.5 8 10.9 7.6 8.7C6.8 6.1 4.4 3.9 1.6 3.3l3.7 12.3h4.1L16.1.5h-4.2Z" />
      <path fill="#F5A623" d="M5 .5H.1L0 .8c3.4.9 5.9 3.2 6.8 6L5.7 1.9C5.5.9 4.8.6 4.3.5H5Z" />
    </svg>
  );
}

export function MastercardMark({ size = 32, ...rest }: BrandProps) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 32 20" aria-hidden="true" focusable="false" {...rest}>
      <circle cx="12" cy="10" r="9" fill="#EB001B" />
      <circle cx="20" cy="10" r="9" fill="#F79E1B" />
      <path d="M16 3a9 9 0 0 0 0 14 9 9 0 0 0 0-14Z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexMark({ size = 38, ...rest }: BrandProps) {
  return (
    <svg width={size} height={size * 0.31} viewBox="0 0 48 15" aria-hidden="true" focusable="false" {...rest}>
      <rect width="48" height="15" fill="#2E77BC" />
      <path fill="#fff" d="M9 11.5 6.8 6.7H4.5l2.2 4.8H9ZM13.2 11.5V6.7h-1.9v.6l.5.5v3.7h1.4ZM13.2 6.2v-.9h-1.9v.9h1.9ZM17 9.9l-1-3.2h-1.8l1.8 4.8h2l1.8-4.8h-1.8l-1 3.2Z" />
      <path fill="#fff" d="M26 9.6V8.9c0-.9-.6-1.4-1.7-1.4-.9 0-1.5.4-1.5 1.1 0 .2 0 .3.1.5h1.2c0-.3.1-.4.3-.4.2 0 .3.1.3.4v.3l-1.6.3c-.7.1-1.1.5-1.1 1.2 0 .9.6 1.4 1.5 1.4.6 0 1-.2 1.3-.6v.5H26v-1.1Zm-1.3-.7c-.2 0-.4-.1-.4-.3 0-.2.1-.3.4-.4l.6-.2v.5c-.1.3-.3.4-.6.4Z" />
      <path fill="#fff" d="M30.4 7.6c-.5 0-.9.2-1.1.5v-.4H28v4.3h1.3V9.4c0-.5.3-.9.8-.9.1 0 .2 0 .3.1V7.6ZM20.8 11.9c.7 0 1.3-.3 1.6-.8v.4h1.2V6.7H22v2.4c0 .5-.3.9-.8.9-.4 0-.7-.3-.7-.8V6.7h-1.3v2.9c0 1.1.6 1.8 1.6 1.8Z" />
      <path fill="#fff" d="M6.8 3.8h34.9v.5H6.8zM11.5 5.7h1.4v-.4h-.9v-.4h.8v-.4h-.8v-.3h.9v-.4h-1.4v1.9ZM9.2 3.8H7.8v.4h.9v.4h-.8v.4h.8v.3h-.9v.4h1.4V3.8Z" />
    </svg>
  );
}

export function PayPalMark({ size = 38, ...rest }: BrandProps) {
  return (
    <svg width={size} height={size * 0.33} viewBox="0 0 48 16" aria-hidden="true" focusable="false" {...rest}>
      <path fill="#253B80" d="M17.9 2.1h-4c-.3 0-.5.2-.6.5l-1.6 10.2c0 .2.1.4.4.4h2c.3 0 .5-.2.6-.5l.4-2.7c0-.3.3-.5.6-.5h1.3c2.6 0 4.1-1.3 4.5-3.8.2-1.1 0-1.9-.6-2.5-.6-.7-1.7-1.1-3-1.1Zm.5 3.7c-.2 1.4-1.3 1.4-2.3 1.4h-.6l.4-2.6c0-.2.2-.3.4-.3h.3c.7 0 1.4 0 1.7.4.2.3.2.7.1 1.1Z" />
      <path fill="#179BD7" d="M31.5 5.7h-2c-.2 0-.4.1-.4.3l-.1.6-.2-.2c-.5-.7-1.5-1-2.6-1-2.4 0-4.5 1.8-4.9 4.4-.2 1.3.1 2.5.8 3.3.7.8 1.7 1.1 2.9 1.1 2 0 3.1-1.3 3.1-1.3l-.1.6c0 .2.1.4.4.4h1.8c.3 0 .5-.2.6-.5l1.1-6.8c0-.2-.1-.4-.4-.4Zm-3.1 4.2c-.2 1.2-1.2 2.1-2.4 2.1-.6 0-1.1-.2-1.4-.6-.3-.4-.4-1-.3-1.6.2-1.2 1.2-2.1 2.4-2.1.6 0 1.1.2 1.4.6.3.5.4 1 .3 1.6Z" />
      <path fill="#253B80" d="M41.9 5.7h-2c-.2 0-.4.1-.4.3l-.1.6-.2-.2c-.5-.7-1.5-1-2.6-1-2.4 0-4.5 1.8-4.9 4.4-.2 1.3.1 2.5.8 3.3.7.8 1.7 1.1 2.9 1.1 2 0 3.1-1.3 3.1-1.3l-.1.6c0 .2.1.4.4.4h1.8c.3 0 .5-.2.6-.5l1.1-6.8c0-.2-.1-.4-.4-.4Zm-3.1 4.2c-.2 1.2-1.2 2.1-2.4 2.1-.6 0-1.1-.2-1.4-.6-.3-.4-.4-1-.3-1.6.2-1.2 1.2-2.1 2.4-2.1.6 0 1.1.2 1.4.6.3.5.4 1 .3 1.6Z" />
      <path fill="#179BD7" d="M44.4 2.4 42.8 12.8c0 .2.1.4.4.4h1.7c.3 0 .5-.2.6-.5l1.6-10.1c0-.2-.1-.4-.4-.4h-1.9c-.2 0-.4.1-.4.2Z" />
    </svg>
  );
}

/* ══════════════════════ APP STORE MARKS ══════════════════════ */
/* Fixed brand colors — store logos must be recognizable, not themed.   */

/**
 * Google Play mark — the classic four-color play triangle (blue left arm,
 * green top sweep, yellow right point, red bottom sweep) built as four flat
 * wedges meeting at an interior hub, so it stays crisp at 22px badge size.
 */
export function GooglePlayMark({ size = 22, ...rest }: BrandProps) {
  return (
    <svg width={size} height={size * 1.04} viewBox="0 0 24 25" aria-hidden="true" focusable="false" {...rest}>
      {/* blue — left arm, rounded outer corners like the real mark */}
      <path fill="#00A0FF" d="M3.4 1.4C3 1.6 2.7 2.2 2.7 2.9v18.3c0 .7.3 1.3.7 1.5l6.9-10.9L3.4 1.4Z" />
      {/* green — top sweep */}
      <path fill="#00D66B" d="M3.9 1.1c.4-.1.9 0 1.3.2l10 5.8-4.9 5.1L3.4 1.4c.1-.1.3-.2.5-.3Z" />
      {/* red — bottom sweep */}
      <path fill="#FF4B4B" d="M5.2 23.4l10-5.8-4.9-5.1L3.4 23.2c.1.1.3.2.5.3.4.1.9 0 1.3-.1Z" />
      {/* yellow — right point */}
      <path fill="#FFD200" d="M15.2 7.1l4.9 4.5c.8.7.8 1.6 0 2.2l-4.9 4.5-4.9-5.3 4.9-5.9Z" />
    </svg>
  );
}

/** Apple mark — white silhouette (sits on the dark badge background). */
export function AppleMark({ size = 24, ...rest }: BrandProps) {
  return (
    <svg width={size * 0.82} height={size} viewBox="0 0 20 24" aria-hidden="true" focusable="false" {...rest}>
      <path fill="#F5F5F7" d="M16.4 12.7c0-2 1.1-3.3 2.9-4.3-.9-1.3-2.2-2-3.9-2.1-1.6-.1-3 1-4 1-1 0-2.4-1-3.8-1-2.1.1-4.1 1.2-5.2 3.1-2.2 3.8-.6 9.5 1.6 12.6 1.1 1.5 2.3 3.2 4 3.1 1.6-.1 2.2-1 4.1-1s2.4 1 4.1 1c1.7-.1 2.8-1.6 3.8-3.1.7-1 1.1-2 1.4-3.1-2.5-.9-4-3-4-5.3Z" />
      <path fill="#F5F5F7" d="M13.7 4.1c.8-1 1.3-2.3 1.2-3.6-1.2.1-2.6.8-3.4 1.7-.7.8-1.3 2.1-1.1 3.4 1.3.1 2.6-.6 3.3-1.5Z" />
    </svg>
  );
}

/** Generic chip-card mark for any other method */
export function CardMark({ size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size} height={size * 0.75} viewBox="0 0 24 18" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      <rect x="1.5" y="1.5" width="21" height="15" rx="2.5" />
      <path d="M1.5 6.5h21M5 10h4M5 12.5h6" />
    </svg>
  );
}

/** Map a PayHere `method` string to a card brand mark */
export function paymentBrandMark(method: string | undefined): ReactNode {
  const m = (method ?? '').toUpperCase();
  if (m.includes('VISA')) return <VisaMark size={40} />;
  if (m.includes('MASTER')) return <MastercardMark size={30} />;
  if (m.includes('AMEX') || m.includes('AMERICAN')) return <AmexMark size={40} />;
  if (m.includes('PAYPAL')) return <PayPalMark size={40} />;
  return <CardMark size={24} />;
}

/** Human label for a PayHere method string */
export function paymentBrandLabel(method: string | undefined): string {
  const m = (method ?? '').toUpperCase();
  if (m.includes('VISA')) return 'Visa';
  if (m.includes('MASTER')) return 'Mastercard';
  if (m.includes('AMEX') || m.includes('AMERICAN')) return 'American Express';
  if (m.includes('PAYPAL')) return 'PayPal';
  if (m.includes('PAYHERE')) return 'PayHere';
  return method ?? 'Card';
}
