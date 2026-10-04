import { motion } from "framer-motion";
import type { ThumbKey } from "../lib/data";

/* ------------------------------------------------------------------ *
 *  Illustrations — flat vector, warm sunset palette, all hand-built.
 *  Ambient loops (birds, shimmer, twinkle, fire flicker) live inside.
 * ------------------------------------------------------------------ */

/** three-tier pine silhouette, apex at (0,0), base 40 units tall */
const PINE =
  "M0 0 L-6 12 L-3 12 L-9 24 L-5 24 L-13 40 L13 40 L5 24 L9 24 L3 12 L6 12 Z";

function Pine({ x, y, s = 1, fill, className }: { x: number; y: number; s?: number; fill: string; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      <path d={PINE} fill={fill} />
    </g>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero — sunset over the lake
 * ------------------------------------------------------------------ */

export function SunsetScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 760 380"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#FDF1DE" />
          <stop offset="34%" stopColor="#FBDCB4" />
          <stop offset="66%" stopColor="#F7B48A" />
          <stop offset="100%" stopColor="#EF9077" />
        </linearGradient>
        <radialGradient id="ss-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6E8" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FCD9A9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FBC38B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0A67C" />
          <stop offset="34%" stopColor="#D9A38C" />
          <stop offset="100%" stopColor="#7FB6AE" />
        </linearGradient>
        <linearGradient id="ss-shore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#495A5B" />
          <stop offset="100%" stopColor="#3B4A55" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect width="760" height="380" fill="url(#ss-sky)" />

      {/* sun + glow */}
      <g className="anim-glow">
        <circle cx="452" cy="168" r="118" fill="url(#ss-sun)" />
      </g>
      <circle cx="452" cy="168" r="30" fill="#FFF0D9" opacity="0.92" />

      {/* far ridge */}
      <path d="M0 208 L96 168 L172 196 L262 150 L344 200 L430 176 L520 206 L614 168 L700 202 L760 182 V236 H0Z" fill="#EFB79C" opacity="0.85" />
      {/* mid ridge */}
      <path d="M0 224 L84 196 L168 222 L250 188 L338 226 L430 200 L520 230 L604 200 L690 228 L760 208 V250 H0Z" fill="#E79C82" />

      {/* mist drifting at the horizon */}
      <motion.g
        initial={{ x: -30, opacity: 0.5 }}
        animate={{ x: 30, opacity: 0.75 }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <ellipse cx="240" cy="228" rx="190" ry="12" fill="#FFDCC0" opacity="0.35" />
        <ellipse cx="580" cy="236" rx="150" ry="9" fill="#FFE3CB" opacity="0.3" />
      </motion.g>

      {/* lake */}
      <rect y="232" width="760" height="148" fill="url(#ss-water)" />
      <rect x="404" y="232" width="96" height="148" fill="#FFF0DC" opacity="0.16" />
      <motion.g
        initial={{ x: -14 }}
        animate={{ x: 14 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <rect x="120" y="256" width="104" height="3" rx="1.5" fill="#FFFFFF" opacity="0.34" className="anim-shimmer" />
        <rect x="300" y="272" width="132" height="3" rx="1.5" fill="#FFFFFF" opacity="0.26" className="anim-shimmer" style={{ animationDelay: "0.9s" }} />
        <rect x="470" y="292" width="86" height="3" rx="1.5" fill="#FFFFFF" opacity="0.3" className="anim-shimmer" style={{ animationDelay: "1.7s" }} />
        <rect x="186" y="308" width="66" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.22" className="anim-shimmer" style={{ animationDelay: "2.4s" }} />
      </motion.g>

      {/* sailboat, riding the swell */}
      <motion.g
        initial={{ y: 0, rotate: -1.5 }}
        animate={{ y: [-2, 3, -2], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
      >
        <path d="M348 226 l0 -22 l14 22z" fill="#FFF3E4" />
        <path d="M344 226 l0 -16 l-11 16z" fill="#FBD6B0" />
        <path d="M330 226 h30 l-5 6 h-20z" fill="#3F4B51" />
      </motion.g>

      {/* birds */}
      <motion.g
        initial={{ x: 0, y: 0 }}
        animate={{ x: [0, 90, 190], y: [0, -12, 4] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6B5A54"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0 0c4-4 7-4 11 0M11 0c4-4 7-4 11 0" transform="translate(276 96) scale(0.9)" />
        <path d="M0 0c3-3 5.5-3 8.5 0M8.5 0c3-3 5.5-3 8.5 0" transform="translate(320 74) scale(0.75)" />
        <path d="M0 0c2.5-2.5 4.5-2.5 7 0M7 0c2.5-2.5 4.5-2.5 7 0" transform="translate(360 108) scale(0.6)" />
      </motion.g>

      {/* near shore + tree line */}
      <path d="M0 316 C120 300 210 312 320 306 C430 300 560 314 760 300 V380 H0Z" fill="url(#ss-shore)" />
      <g className="anim-sway">
        <Pine x={52} y={252} s={1.5} fill="#3E4B4A" />
        <Pine x={96} y={266} s={1.2} fill="#46554F" />
        <Pine x={26} y={276} s={1.05} fill="#3A4644" />
      </g>
      <g className="anim-sway" style={{ animationDelay: "1.2s" }}>
        <Pine x={688} y={250} s={1.55} fill="#3E4B4A" />
        <Pine x={646} y={268} s={1.15} fill="#46554F" />
        <Pine x={718} y={282} s={1} fill="#3A4644" />
      </g>
      {/* foreground rocks */}
      <path d="M0 380 V340 C46 330 92 344 138 356 C176 366 208 372 236 380Z" fill="#33403F" />
      <path d="M760 380 V346 C704 338 660 350 620 362 C596 370 578 375 566 380Z" fill="#33403F" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Mini map — the “location” half of the floating trip card
 * ------------------------------------------------------------------ */

export function MapScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mp-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B7DCD6" />
          <stop offset="100%" stopColor="#8FC5BD" />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill="#EEF1F4" />

      {/* blocks */}
      <g fill="#E2E6EB">
        <rect x="16" y="14" width="74" height="42" rx="7" />
        <rect x="104" y="10" width="56" height="30" rx="6" />
        <rect x="176" y="18" width="66" height="34" rx="7" />
        <rect x="14" y="74" width="52" height="40" rx="7" />
        <rect x="86" y="72" width="70" height="30" rx="6" />
        <rect x="176" y="70" width="46" height="26" rx="6" />
        <rect x="236" y="76" width="52" height="44" rx="7" />
        <rect x="104" y="112" width="76" height="30" rx="6" />
      </g>

      {/* park */}
      <path d="M196 106h58v40a6 6 0 0 1-6 6h-46a6 6 0 0 1-6-6z" fill="#D8EDE6" />

      {/* water */}
      <path d="M-10 60 C50 46 96 78 152 66 C206 54 254 84 312 68 V104 C254 118 206 88 152 100 C96 112 50 80 -10 94Z" fill="url(#mp-water)" />

      {/* roads */}
      <g stroke="#FFFFFF" fill="none" strokeLinecap="round">
        <path d="M-8 26 H308" strokeWidth="7" opacity="0.85" />
        <path d="M78 -8 V158" strokeWidth="7" opacity="0.85" />
        <path d="M228 -8 V158" strokeWidth="6" opacity="0.7" />
        <path d="M-8 128 H308" strokeWidth="6" opacity="0.7" />
        <path d="M-8 66 C60 54 120 84 200 70 C246 62 280 72 308 66" strokeWidth="5" opacity="0.55" />
      </g>

      {/* animated route */}
      <motion.path
        d="M52 120 C96 108 118 78 150 72 C182 66 202 84 236 96"
        stroke="#F18069"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="7 9"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -128 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        opacity="0.85"
      />

      {/* start + destination */}
      <circle cx="52" cy="120" r="5" fill="#FFFFFF" />
      <circle cx="52" cy="120" r="2.6" fill="#43514B" />

      <g transform="translate(236 96)">
        <circle r="13" fill="#F18069" opacity="0.35" className="anim-pulse-ring" />
        <circle r="13" fill="#F18069" opacity="0.3" className="anim-pulse-ring" style={{ animationDelay: "1.2s" }} />
        <path d="M0 -16c-6.6 0-12 5.4-12 12 0 8.4 12 20 12 20s12-11.6 12-20c0-6.6-5.4-12-12-12z" fill="#F18069" />
        <circle cy="-4" r="4.6" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Camping at night — the floating schedule card
 * ------------------------------------------------------------------ */

export function CampingScene({ className }: { className?: string }) {
  const stars = [
    [34, 28, 1.6, 0], [78, 18, 1.2, 0.6], [126, 34, 1.8, 1.2], [178, 20, 1.3, 0.3],
    [222, 40, 1.5, 0.9], [268, 24, 1.2, 1.5], [312, 36, 1.7, 0.4], [344, 16, 1.3, 1.1],
    [102, 52, 1.1, 1.8], [196, 58, 1.2, 1.4], [58, 60, 1, 2.1], [290, 62, 1.1, 0.8],
  ] as const;

  return (
    <svg viewBox="0 0 380 210" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243949" />
          <stop offset="42%" stopColor="#4A6379" />
          <stop offset="76%" stopColor="#A97C6F" />
          <stop offset="100%" stopColor="#E79B62" />
        </linearGradient>
        <linearGradient id="cp-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDA173" />
          <stop offset="100%" stopColor="#33505C" />
        </linearGradient>
        <radialGradient id="cp-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6E2" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF6E2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cp-fire" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFD08A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFB36B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="380" height="210" fill="url(#cp-sky)" />

      {/* stars */}
      {stars.map(([x, y, r, d], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="#FFF6E2"
          className="anim-twinkle"
          style={{ animationDelay: `${d}s` }}
        />
      ))}

      {/* moon */}
      <circle cx="316" cy="46" r="44" fill="url(#cp-moon)" />
      <circle cx="316" cy="46" r="11" fill="#FDF3E1" />

      {/* mountains */}
      <path d="M0 132 L58 96 L102 124 L156 84 L214 128 L268 100 L330 130 L380 108 V168 H0Z" fill="#3B4A55" />
      <path d="M0 148 L74 118 L132 146 L198 116 L262 148 L330 122 L380 144 V172 H0Z" fill="#4A5B66" opacity="0.9" />

      {/* lake */}
      <rect y="164" width="380" height="46" fill="url(#cp-lake)" />
      <rect x="286" y="164" width="62" height="46" fill="#FFE1B8" opacity="0.18" />

      {/* ground */}
      <path d="M0 190 C70 178 130 190 196 184 C260 178 320 190 380 182 V210 H0Z" fill="#2C3B45" />

      {/* campfire glow */}
      <ellipse cx="246" cy="182" rx="54" ry="30" fill="url(#cp-fire)" />

      {/* tent */}
      <g transform="translate(120 0)" className="anim-float">
        <path d="M0 182 L44 116 L88 182Z" fill="#F6E6D2" />
        <path d="M44 116 L88 182 H62 L44 140Z" fill="#F18069" />
        <path d="M44 116 L66 182 H22Z" fill="#3B4A55" opacity="0.35" />
        <path d="M44 140 L60 182 H28Z" fill="#2E3D48" />
        <path d="M44 116 L48 100 L52 116Z" fill="#E8CFAF" />
      </g>

      {/* campfire */}
      <g transform="translate(246 176)">
        <path d="M-14 6 h28" stroke="#3A2C22" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M-9 3 l18 6 M9 3 l-18 6" stroke="#4A3427" strokeWidth="2.6" strokeLinecap="round" />
        <g className="anim-flicker">
          <path d="M0 -20 C6 -12 9 -8 9 -3 C9 3 5 7 0 7 C-5 7 -9 3 -9 -3 C-9 -8 -6 -12 0 -20Z" fill="#F7B26A" />
          <path d="M0 -12 C3.4 -7 5 -4.4 5 -1.6 C5 2 2.8 4.4 0 4.4 C-2.8 4.4 -5 2 -5 -1.6 C-5 -4.4 -3.4 -7 0 -12Z" fill="#F18069" />
        </g>
      </g>

      {/* small pines */}
      <Pine x={36} y={158} s={0.85} fill="#2F3E48" />
      <Pine x={62} y={166} s={0.68} fill="#35454F" />
      <Pine x={344} y={160} s={0.9} fill="#2F3E48" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Thumbnails used by event chips, invites and the chat
 * ------------------------------------------------------------------ */

function ForestThumb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ft-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAF7F1" />
          <stop offset="100%" stopColor="#CFE9E0" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#ft-sky)" />
      <circle cx="126" cy="24" r="13" fill="#FBE6CE" />
      <circle cx="126" cy="24" r="8" fill="#F7B26A" opacity="0.55" />
      <path d="M-4 62 L38 38 L74 62 L112 36 L164 64 V92 H-4Z" fill="#79BFB3" opacity="0.7" />
      <path d="M-4 74 L46 54 L96 76 L134 58 L164 72 V92 H-4Z" fill="#4E8E86" opacity="0.85" />
      <Pine x={30} y={44} s={0.85} fill="#3B5A54" />
      <Pine x={52} y={52} s={0.66} fill="#44645C" />
      <Pine x={112} y={46} s={0.78} fill="#3B5A54" />
      <path d="M-4 92 C40 84 78 94 118 88 C138 85 150 88 164 86 V92Z" fill="#2F4A46" />
    </svg>
  );
}

function JimbaronThumb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="jt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBE6CE" />
          <stop offset="52%" stopColor="#F7B26A" />
          <stop offset="100%" stopColor="#EE8C70" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#jt-sky)" />
      <circle cx="58" cy="52" r="16" fill="#FFF2DC" opacity="0.95" />
      <path d="M-4 62 C30 56 62 64 96 60 C124 57 144 62 164 58 V92 H-4Z" fill="#E79C82" opacity="0.7" />
      <rect y="62" width="160" height="28" fill="#8FC5BD" />
      <rect x="46" y="62" width="26" height="28" fill="#FFE7C4" opacity="0.5" />
      {/* palms */}
      <g fill="#3B4A55">
        <path d="M24 90 c2-12 3-20 2-30 l4 0 c-1 10 0 18 2 30z" />
        <path d="M28 60 c-10-6 -16-3 -19 2 c7-1 12 0 15 3z" />
        <path d="M28 60 c-6-10 -2-16 3-18 c-1 6 0 11 3 15z" />
        <path d="M28 60 c9-7 15-4 18 1 c-7-1 -12 0 -15 3z" />
        <path d="M138 90 c-1-12 -2-20 -1-28 l4 0 c1 8 1 16 0 28z" />
        <path d="M140 62 c-9-6 -15-3 -18 2 c7-1 12 0 15 3z" />
        <path d="M140 62 c8-7 14-4 17 1 c-7-1 -12 0 -14 3z" />
      </g>
    </svg>
  );
}

export function Thumb({ thumb, className }: { thumb: ThumbKey; className?: string }) {
  if (thumb === "camping") return <CampingScene className={className} />;
  if (thumb === "jimbaron") return <JimbaronThumb className={className} />;
  return <ForestThumb className={className} />;
}

/* ------------------------------------------------------------------ *
 *  Decorative sprigs around the greeting
 * ------------------------------------------------------------------ */

export function Sprig({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 96"
      className={className}
      aria-hidden="true"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <g
        className="anim-sway"
        stroke="#B9C6BE"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M44 94 C40 70 36 48 24 26 C20 18 14 10 6 4" />
        <path d="M40 78 C32 76 26 70 24 62 C33 63 39 69 40 78Z" fill="#DFE8E2" />
        <path d="M34 56 C26 54 20 48 18 40 C27 41 33 47 34 56Z" fill="#DFE8E2" />
        <path d="M27 34 C20 32 15 26 14 19 C22 20 27 26 27 34Z" fill="#DFE8E2" />
        <path d="M20 16 C14 13 11 7 11 1 C18 3 21 9 20 16Z" fill="#DFE8E2" />
        <path d="M46 86 C54 82 58 75 58 68 C50 71 45 78 46 86Z" fill="#DFE8E2" />
        <path d="M38 60 C46 56 50 49 50 42 C42 45 37 52 38 60Z" fill="#DFE8E2" />
        <path d="M30 36 C38 32 42 26 42 19 C34 22 29 28 30 36Z" fill="#DFE8E2" />
      </g>
    </svg>
  );
}
