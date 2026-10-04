/* ------------------------------------------------------------------ *
 *  Cover art — procedural artwork for albums / playlists / artists.
 *  Deterministic from a seed, so the library needs no image assets.
 * ------------------------------------------------------------------ */

const TONES = [
  { a: "#A78BFA", b: "#6B4FDD", ink: "#FFFFFF" },
  { a: "#79BFB3", b: "#3E7C74", ink: "#FFFFFF" },
  { a: "#F7B26A", b: "#DD7A4E", ink: "#3A2A1E" },
  { a: "#F0A6C8", b: "#C2649B", ink: "#3D1F33" },
  { a: "#8AA9E0", b: "#4F6BB0", ink: "#FFFFFF" },
  { a: "#58B879", b: "#2F7A50", ink: "#FFFFFF" },
  { a: "#C99BE0", b: "#8853B0", ink: "#FFFFFF" },
  { a: "#E7C08A", b: "#B98A4E", ink: "#3A2A1E" },
];

type CoverProps = {
  seed?: number;
  variant?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  /** draws a soft glass highlight, like a vinyl sleeve */
  sheen?: boolean;
};

export function Cover({ seed = 0, variant, className, sheen = true }: CoverProps) {
  const tone = TONES[Math.abs(seed) % TONES.length];
  const v = (variant ?? Math.abs(seed * 7 + 3) % 6) as 0 | 1 | 2 | 3 | 4 | 5;
  const id = `cv-${seed}-${v}`;

  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={tone.a} />
          <stop offset="100%" stopColor={tone.b} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="200" height="200" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="200" height="200" fill={`url(#${id}-bg)`} />

        {v === 0 && (
          <>
            <circle cx="100" cy="86" r="46" fill="#FFFFFF" opacity="0.9" />
            <path d="M0 132 C46 118 88 140 132 128 C162 120 182 128 200 122 V200 H0Z" fill="#000000" opacity="0.18" />
            <path d="M0 152 C50 140 92 160 138 148 C166 140 184 148 200 144 V200 H0Z" fill="#FFFFFF" opacity="0.22" />
          </>
        )}

        {v === 1 && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx="42"
                cy="158"
                r={22 * i}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={i === 1 ? 14 : 9}
                opacity={0.5 - i * 0.06}
              />
            ))}
            <circle cx="42" cy="158" r="14" fill="#FFFFFF" opacity="0.95" />
          </>
        )}

        {v === 2 && (
          <>
            <path d="M-10 62 C40 40 80 84 130 62 C164 48 186 60 210 52 V120 H-10Z" fill="#FFFFFF" opacity="0.28" />
            <path d="M-10 96 C40 74 82 118 132 96 C166 82 188 94 210 86 V150 H-10Z" fill="#FFFFFF" opacity="0.2" />
            <path d="M-10 132 C44 110 84 152 136 132 C168 120 190 130 210 124 V200 H-10Z" fill="#000000" opacity="0.2" />
            <circle cx="150" cy="46" r="18" fill="#FFFFFF" opacity="0.85" />
          </>
        )}

        {v === 3 && (
          <>
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={30 + c * 28}
                  cy={34 + r * 28}
                  r={r === c ? 7 : 3.4}
                  fill="#FFFFFF"
                  opacity={r === c ? 0.9 : 0.4}
                />
              )),
            )}
            <path d="M-20 200 L200 -20" stroke="#000000" strokeWidth="16" opacity="0.12" />
          </>
        )}

        {v === 4 && (
          <g>
            {[26, 52, 38, 74, 96, 62, 44, 30].map((h, i) => (
              <rect
                key={i}
                x={16 + i * 22}
                y={168 - h}
                width="13"
                height={h}
                rx="6.5"
                fill="#FFFFFF"
                opacity={0.72}
                className="anim-equalize"
                style={{ animationDelay: `${i * 0.12}s`, animationDuration: "1.6s" }}
              />
            ))}
            <rect y="168" width="200" height="32" fill="#000000" opacity="0.14" />
          </g>
        )}

        {v === 5 && (
          <>
            <rect x="-10" y="30" width="120" height="120" rx="30" fill="#FFFFFF" opacity="0.28" transform="rotate(-14 50 90)" />
            <rect x="80" y="60" width="118" height="118" rx="30" fill="#000000" opacity="0.16" transform="rotate(12 140 120)" />
            <circle cx="112" cy="82" r="30" fill="#FFFFFF" opacity="0.9" />
            <circle cx="112" cy="82" r="11" fill={tone.b} />
          </>
        )}

        {sheen && <rect width="200" height="200" fill={`url(#${id}-sheen)`} />}
      </g>
    </svg>
  );
}

/** Artist portrait — a soft cover with a big monogram, used in artist cards. */
export function ArtistCover({ seed = 0, initials, className }: { seed?: number; initials: string; className?: string }) {
  const tone = TONES[Math.abs(seed) % TONES.length];
  const id = `ar-${seed}`;
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone.a} />
          <stop offset="100%" stopColor={tone.b} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="200" height="200" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="200" height="200" fill={`url(#${id}-bg)`} />
        <circle cx="100" cy="200" r="86" fill="#FFFFFF" opacity="0.18" />
        <circle cx="100" cy="200" r="58" fill="#FFFFFF" opacity="0.16" />
        <ellipse cx="100" cy="118" rx="46" ry="50" fill="#241F33" opacity="0.22" />
        <circle cx="100" cy="86" r="34" fill="#2A2338" opacity="0.32" />
        <text
          x="100"
          y="176"
          textAnchor="middle"
          fontFamily="Plus Jakarta Sans Variable, sans-serif"
          fontWeight="800"
          fontSize="54"
          fill="#FFFFFF"
          opacity="0.95"
          letterSpacing="1"
        >
          {initials}
        </text>
      </g>
    </svg>
  );
}
