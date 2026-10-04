/* ------------------------------------------------------------------ *
 *  FAIMESS brand mark — a soft violet tile carrying an abstract “F”
 *  built from two rounded waves. Scales to any size, single colour
 *  pair so it can be dropped on light or dark surfaces.
 * ------------------------------------------------------------------ */

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="fm-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B82F6" />
          <stop offset="55%" stopColor="#8267F0" />
          <stop offset="100%" stopColor="#6B4FDD" />
        </linearGradient>
        <linearGradient id="fm-wave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E7DEFE" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="13" fill="url(#fm-tile)" />

      {/* the “F”: a stem and two arms, drawn as rounded strokes */}
      <g stroke="url(#fm-wave)" strokeWidth="3.6" strokeLinecap="round" fill="none">
        <path d="M15.4 29V13.2c0-.9.7-1.6 1.6-1.6h9.6" />
        <path d="M15.4 20.4h7.4" />
      </g>

      {/* sound waves, the brand's music note */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <path d="M27.6 16.4c1.9 2 1.9 5.2 0 7.2" />
        <path d="M31.4 13.6c3.2 3.5 3.2 9.3 0 12.8" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-extrabold tracking-[-0.04em]">FAIMESS</span>
    </span>
  );
}
