export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <symbol id="i-gpu" viewBox="0 0 64 40">
          <rect x="2" y="6" width="54" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="20" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="40" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M8 30v6M16 30v6M56 12h6M56 22h6" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-cpu" viewBox="0 0 48 48">
          <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <rect x="19" y="19" width="10" height="10" fill="currentColor"/>
          <path d="M17 10V3M24 10V3M31 10V3M17 45v-7M24 45v-7M31 45v-7M10 17H3M10 24H3M10 31H3M45 17h-7M45 24h-7M45 31h-7" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-mobo" viewBox="0 0 48 48">
          <rect x="4" y="4" width="40" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <rect x="11" y="11" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M30 11h8M30 17h8M30 23h8M11 31h26M11 37h18" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-ram" viewBox="0 0 56 32">
          <rect x="3" y="6" width="50" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M10 22v6M20 22v6M30 22v6M40 22v6M48 22v6M11 10v8M20 10v8M29 10v8M38 10v8M46 10v8" stroke="currentColor" strokeWidth="2"/>
        </symbol>
        <symbol id="i-psu" viewBox="0 0 48 40">
          <rect x="3" y="5" width="42" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="18" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M18 14v6l4 3M32 12h8M32 19h8M32 26h8" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-ssd" viewBox="0 0 48 40">
          <rect x="4" y="8" width="40" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <rect x="10" y="14" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M32 14v12M38 14v12" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-fan" viewBox="0 0 48 48">
          <rect x="4" y="4" width="40" height="40" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="24" cy="24" r="3.5" fill="currentColor"/>
          <path d="M24 20c-1-6 2-11 8-11-1 6-4 9-8 11ZM28 24c6-1 11 2 11 8-6-1-9-4-11-8ZM24 28c1 6-2 11-8 11 1-6 4-9 8-11ZM20 24c-6 1-11-2-11-8 6 1 9 4 11 8Z" fill="currentColor"/>
        </symbol>
        <symbol id="i-case" viewBox="0 0 36 48">
          <rect x="5" y="3" width="26" height="42" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="18" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="18" cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
        <symbol id="i-periph" viewBox="0 0 48 40">
          <rect x="4" y="10" width="40" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M12 17h4M20 17h4M28 17h4M12 24h24" stroke="currentColor" strokeWidth="2.5"/>
        </symbol>
      </defs>
    </svg>
  );
}
