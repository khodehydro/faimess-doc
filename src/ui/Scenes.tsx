import { motion } from "framer-motion";

/* ------------------------------------------------------------------ *
 *  Illustrations — flat vector, dusk palette tuned to the violet brand.
 *  All hand-built: no external assets, ambient motion baked in.
 * ------------------------------------------------------------------ */

/** three-tier pine silhouette, apex at (0,0), 40 units tall */
const PINE =
  "M0 0 L-6 12 L-3 12 L-9 24 L-5 24 L-13 40 L13 40 L5 24 L9 24 L3 12 L6 12 Z";

function Pine({
  x,
  y,
  s = 1,
  fill,
  className,
}: {
  x: number;
  y: number;
  s?: number;
  fill: string;
  className?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={className}>
      <path d={PINE} fill={fill} />
    </g>
  );
}

export type SceneKey = "sunset" | "camping" | "coast" | "forest";

/* ------------------------------------------------------------------ *
 *  Hero 1 — sunset over the lake
 * ------------------------------------------------------------------ */

export function SunsetScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 760 384" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#EDE7FA" />
          <stop offset="24%" stopColor="#F6DFEC" />
          <stop offset="50%" stopColor="#FBDAC2" />
          <stop offset="76%" stopColor="#F9C199" />
          <stop offset="100%" stopColor="#F3AE93" />
        </linearGradient>
        <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6EA" stopOpacity="0.95" />
          <stop offset="52%" stopColor="#FDDFC0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FBC79C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEB29B" />
          <stop offset="32%" stopColor="#C7A6C6" />
          <stop offset="100%" stopColor="#8CA9C0" />
        </linearGradient>
        <linearGradient id="ss-hill" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#4C4C67" />
          <stop offset="100%" stopColor="#393A4E" />
        </linearGradient>
      </defs>

      <rect width="760" height="384" fill="url(#ss-sky)" />

      {/* sun */}
      <g className="anim-glow">
        <circle cx="470" cy="176" r="126" fill="url(#ss-glow)" />
      </g>
      <circle cx="470" cy="176" r="32" fill="#FFF3E2" opacity="0.95" />

      {/* far ridges */}
      <path d="M0 214 L92 176 L172 202 L262 158 L348 206 L438 180 L526 210 L618 172 L704 206 L760 186 V242 H0Z" fill="#D9B6DA" opacity="0.85" />
      <path d="M0 228 L86 202 L168 226 L252 194 L340 230 L432 206 L522 234 L606 204 L692 230 L760 212 V254 H0Z" fill="#C79BC4" />

      {/* drifting horizon mist */}
      <motion.g
        initial={{ x: -30, opacity: 0.45 }}
        animate={{ x: 30, opacity: 0.7 }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <ellipse cx="250" cy="232" rx="196" ry="12" fill="#FFE0CC" opacity="0.35" />
        <ellipse cx="590" cy="240" rx="154" ry="9" fill="#FFE6D2" opacity="0.28" />
      </motion.g>

      {/* water */}
      <rect y="236" width="760" height="148" fill="url(#ss-water)" />
      <rect x="424" y="236" width="94" height="148" fill="#FFF1DE" opacity="0.15" />
      <motion.g
        initial={{ x: -14 }}
        animate={{ x: 14 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <rect x="126" y="258" width="106" height="3" rx="1.5" fill="#FFFFFF" opacity="0.32" className="anim-shimmer" />
        <rect x="312" y="276" width="134" height="3" rx="1.5" fill="#FFFFFF" opacity="0.24" className="anim-shimmer" style={{ animationDelay: "0.9s" }} />
        <rect x="486" y="296" width="88" height="3" rx="1.5" fill="#FFFFFF" opacity="0.28" className="anim-shimmer" style={{ animationDelay: "1.7s" }} />
        <rect x="196" y="312" width="68" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.2" className="anim-shimmer" style={{ animationDelay: "2.4s" }} />
      </motion.g>

      {/* sailboat */}
      <motion.g
        initial={{ y: 0, rotate: -1.5 }}
        animate={{ y: [-2, 3, -2], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
      >
        <path d="M368 230 l0 -24 l15 24z" fill="#FFF5E9" />
        <path d="M364 230 l0 -17 l-12 17z" fill="#FBD9BC" />
        <path d="M349 230 h32 l-5 6 h-22z" fill="#3F3F55" />
      </motion.g>

      {/* birds */}
      <motion.g
        initial={{ x: 0, y: 0 }}
        animate={{ x: [0, 90, 190], y: [0, -12, 4] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6B5A70"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0 0c4-4 7-4 11 0M11 0c4-4 7-4 11 0" transform="translate(300 100) scale(0.9)" />
        <path d="M0 0c3-3 5.5-3 8.5 0M8.5 0c3-3 5.5-3 8.5 0" transform="translate(346 78) scale(0.75)" />
        <path d="M0 0c2.5-2.5 4.5-2.5 7 0M7 0c2.5-2.5 4.5-2.5 7 0" transform="translate(384 112) scale(0.6)" />
      </motion.g>

      {/* left hill with pines */}
      <path d="M0 384 V232 C34 216 74 214 110 226 C152 240 186 264 214 292 C236 314 250 336 258 384 Z" fill="url(#ss-hill)" />
      <g className="anim-sway">
        <Pine x={56} y={196} s={1.55} fill="#3C3D51" />
        <Pine x={100} y={212} s={1.25} fill="#454766" />
        <Pine x={28} y={222} s={1.05} fill="#383949" />
        <Pine x={140} y={240} s={0.85} fill="#454766" />
      </g>

      {/* right bank */}
      <path d="M760 384 V252 C716 246 668 258 626 276 C598 288 578 300 566 314 C556 326 552 348 552 384 Z" fill="#3F404F" />
      <g className="anim-sway" style={{ animationDelay: "1.2s" }}>
        <Pine x={690} y={222} s={1.5} fill="#3C3D51" />
        <Pine x={648} y={248} s={1.15} fill="#454766" />
        <Pine x={722} y={258} s={1.0} fill="#383949" />
      </g>

      {/* foreground */}
      <path d="M0 384 V352 C52 342 104 356 152 368 C186 376 214 380 240 384Z" fill="#32333F" />
      <path d="M760 384 V358 C700 350 656 362 616 374 C596 380 578 382 566 384Z" fill="#32333F" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 2 — camping under the stars
 * ------------------------------------------------------------------ */

export function CampingScene({ className }: { className?: string }) {
  const stars = [
    [34, 28, 1.6, 0], [78, 18, 1.2, 0.6], [126, 34, 1.8, 1.2], [178, 20, 1.3, 0.3],
    [222, 40, 1.5, 0.9], [268, 24, 1.2, 1.5], [316, 30, 1.7, 0.4], [352, 18, 1.3, 1.1],
    [104, 54, 1.1, 1.8], [198, 60, 1.2, 1.4], [58, 62, 1, 2.1], [296, 58, 1.1, 0.8],
    [420, 26, 1.4, 1.3], [470, 44, 1.2, 0.5], [540, 22, 1.5, 1.7], [612, 40, 1.2, 0.9],
    [676, 30, 1.6, 1.2], [724, 52, 1.1, 0.2], [556, 66, 1, 1.9], [658, 70, 1.2, 1.1],
  ] as const;

  return (
    <svg viewBox="0 0 760 384" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cp-sky" x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#232A46" />
          <stop offset="40%" stopColor="#3F4A6E" />
          <stop offset="72%" stopColor="#7B6A8E" />
          <stop offset="100%" stopColor="#C98F7E" />
        </linearGradient>
        <linearGradient id="cp-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C99A8E" />
          <stop offset="100%" stopColor="#2F3A55" />
        </linearGradient>
        <radialGradient id="cp-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6E6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF6E6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cp-fire" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFD08A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFB36B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="760" height="384" fill="url(#cp-sky)" />

      {stars.map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#FFF6E2" className="anim-twinkle" style={{ animationDelay: `${d}s` }} />
      ))}

      <circle cx="626" cy="72" r="70" fill="url(#cp-moon)" />
      <circle cx="626" cy="72" r="17" fill="#FDF3E4" />

      {/* mountain tiers */}
      <path d="M0 226 L104 168 L186 214 L272 148 L372 218 L470 174 L578 222 L682 162 L760 200 V268 H0Z" fill="#3B4460" />
      <path d="M0 248 L128 208 L232 244 L344 200 L458 246 L576 210 L688 250 L760 226 V278 H0Z" fill="#4A5474" opacity="0.92" />

      {/* lake */}
      <rect y="272" width="760" height="112" fill="url(#cp-lake)" />
      <rect x="528" y="272" width="118" height="112" fill="#FFE1B8" opacity="0.16" />

      {/* ground */}
      <path d="M0 336 C140 318 260 336 392 326 C520 316 640 336 760 322 V384 H0Z" fill="#2A3348" />

      {/* fire glow */}
      <ellipse cx="520" cy="326" rx="110" ry="60" fill="url(#cp-fire)" />

      {/* tent */}
      <g transform="translate(232 0)" className="anim-float">
        <path d="M0 328 L86 208 L172 328Z" fill="#F6E9DA" />
        <path d="M86 208 L172 328 H122 L86 256Z" fill="#8267F0" />
        <path d="M86 208 L128 328 H44Z" fill="#2F3850" opacity="0.32" />
        <path d="M86 256 L118 328 H54Z" fill="#252D42" />
        <path d="M86 208 L93 180 L100 208Z" fill="#E8CFAF" />
      </g>

      {/* campfire */}
      <g transform="translate(520 316)">
        <path d="M-26 10 h52" stroke="#3A2C22" strokeWidth="6" strokeLinecap="round" />
        <path d="M-17 5 l34 11 M17 5 l-34 11" stroke="#4A3427" strokeWidth="4.6" strokeLinecap="round" />
        <g className="anim-flicker">
          <path d="M0 -36 C11 -22 16 -14 16 -5 C16 5 9 12 0 12 C-9 12 -16 5 -16 -5 C-16 -14 -11 -22 0 -36Z" fill="#F7B26A" />
          <path d="M0 -22 C6 -13 9 -8 9 -3 C9 4 5 8 0 8 C-5 8 -9 4 -9 -3 C-9 -8 -6 -13 0 -22Z" fill="#8267F0" opacity="0.9" />
        </g>
      </g>

      <Pine x={72} y={288} s={1.5} fill="#2C3549" />
      <Pine x={124} y={306} s={1.2} fill="#333D53" />
      <Pine x={692} y={292} s={1.55} fill="#2C3549" />
      <Pine x={740} y={310} s={1.1} fill="#333D53" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 3 — coastline at dusk
 * ------------------------------------------------------------------ */

export function CoastScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 760 384" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="co-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCD8FA" />
          <stop offset="30%" stopColor="#F4D9EC" />
          <stop offset="62%" stopColor="#FCD7B6" />
          <stop offset="100%" stopColor="#F5A98C" />
        </linearGradient>
        <linearGradient id="co-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFA98F" />
          <stop offset="38%" stopColor="#B49BC7" />
          <stop offset="100%" stopColor="#7FA6BE" />
        </linearGradient>
      </defs>

      <rect width="760" height="384" fill="url(#co-sky)" />
      <circle cx="256" cy="196" r="44" fill="#FFF4E0" opacity="0.9" />
      <circle cx="256" cy="196" r="96" fill="#FFE7C4" opacity="0.22" />

      <path d="M0 236 C86 226 160 240 244 232 C320 225 380 238 452 232 C540 224 640 240 760 228 V252 H0Z" fill="#C99BC0" opacity="0.55" />

      {/* sea */}
      <rect y="252" width="760" height="132" fill="url(#co-sea)" />
      <rect x="212" y="252" width="88" height="132" fill="#FFF0DA" opacity="0.2" />
      <motion.g
        initial={{ x: -12 }}
        animate={{ x: 12 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <rect x="86" y="286" width="120" height="3" rx="1.5" fill="#fff" opacity="0.28" className="anim-shimmer" />
        <rect x="330" y="308" width="150" height="3" rx="1.5" fill="#fff" opacity="0.22" className="anim-shimmer" style={{ animationDelay: "1.1s" }} />
        <rect x="520" y="330" width="96" height="3" rx="1.5" fill="#fff" opacity="0.25" className="anim-shimmer" style={{ animationDelay: "2s" }} />
      </motion.g>

      {/* sand bank */}
      <path d="M0 384 V330 C120 318 240 332 350 340 C480 350 610 336 760 346 V384Z" fill="#3E3B52" opacity="0.35" />
      <path d="M0 384 V348 C132 338 268 350 392 358 C520 366 648 354 760 362 V384Z" fill="#33314A" />

      {/* palms */}
      <g fill="#2F3046">
        <path d="M118 384 c4-30 6-52 4-78 l9 0 c-3 26 -1 48 3 78z" />
        <path d="M126 306 c-24-15 -38-8 -45 5 c17-3 29 0 36 8z" />
        <path d="M126 306 c-15-24 -5-39 8-44 c-3 15 0 27 7 36z" />
        <path d="M126 306 c22-17 36-10 43 3 c-16-3 -28 0 -34 8z" />
        <path d="M126 306 c4-26 20-33 33-30 c-11 8 -18 18 -21 32z" />
        <path d="M636 384 c3-26 5-46 3-70 l8 0 c-2 24 -1 44 2 70z" />
        <path d="M642 314 c-21-13 -34-7 -40 4 c15-2 26 0 32 7z" />
        <path d="M642 314 c19-15 32-9 38 3 c-14-3 -25 0 -30 7z" />
      </g>
      <g className="anim-sway">
        <Pine x={704} y={300} s={1.3} fill="#2F3046" />
        <Pine x={738} y={320} s={1} fill="#3A3B52" />
      </g>

      {/* birds */}
      <motion.g
        initial={{ x: 0, y: 0, opacity: 0.8 }}
        animate={{ x: [0, 60, 130], y: [0, -8, 6] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6E5A72"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0 0c4-4 7-4 11 0M11 0c4-4 7-4 11 0" transform="translate(420 120) scale(0.9)" />
        <path d="M0 0c3-3 5.5-3 8.5 0M8.5 0c3-3 5.5-3 8.5 0" transform="translate(470 100) scale(0.7)" />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Small art — map card, forest thumb, coast thumb, sprigs
 * ------------------------------------------------------------------ */

export type MapTone = "violet" | "teal" | "amber";

export function MapScene({ tone = "teal", className }: { tone?: MapTone; className?: string }) {
  const water: Record<MapTone, [string, string]> = {
    teal: ["#B7DCD6", "#8FC5BD"],
    violet: ["#CFC6F7", "#A99BEF"],
    amber: ["#FBD9B8", "#F4BE8E"],
  };
  const pin: Record<MapTone, string> = {
    teal: "#8267F0",
    violet: "#8267F0",
    amber: "#E3873F",
  };

  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`mp-water-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={water[tone][0]} />
          <stop offset="100%" stopColor={water[tone][1]} />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill="#EEF1F4" />

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

      <path d="M196 106h58v40a6 6 0 0 1-6 6h-46a6 6 0 0 1-6-6z" fill="#D8EDE6" />

      <path d="M-10 60 C50 46 96 78 152 66 C206 54 254 84 312 68 V104 C254 118 206 88 152 100 C96 112 50 80 -10 94Z" fill={`url(#mp-water-${tone})`} />

      <g stroke="#FFFFFF" fill="none" strokeLinecap="round">
        <path d="M-8 26 H308" strokeWidth="7" opacity="0.85" />
        <path d="M78 -8 V158" strokeWidth="7" opacity="0.85" />
        <path d="M228 -8 V158" strokeWidth="6" opacity="0.7" />
        <path d="M-8 128 H308" strokeWidth="6" opacity="0.7" />
        <path d="M-8 66 C60 54 120 84 200 70 C246 62 280 72 308 66" strokeWidth="5" opacity="0.55" />
      </g>

      <motion.path
        d="M52 120 C96 108 118 78 150 72 C182 66 202 84 236 96"
        stroke="#8267F0"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="7 9"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -128 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        opacity="0.85"
      />

      <circle cx="52" cy="120" r="5" fill="#FFFFFF" />
      <circle cx="52" cy="120" r="2.6" fill="#3F3F55" />

      <g transform="translate(236 96)">
        <circle r="13" fill={pin[tone]} opacity="0.3" className="anim-pulse-ring" />
        <circle r="13" fill={pin[tone]} opacity="0.26" className="anim-pulse-ring" style={{ animationDelay: "1.2s" }} />
        <path d="M0 -16c-6.6 0-12 5.4-12 12 0 8.4 12 20 12 20s12-11.6 12-20c0-6.6-5.4-12-12-12z" fill={pin[tone]} />
        <circle cy="-4" r="4.6" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function Thumb({ scene, className }: { scene: SceneKey; className?: string }) {
  if (scene === "camping") return <CampingScene className={className} />;
  if (scene === "coast") return <CoastScene className={className} />;
  if (scene === "forest") return <ForestThumb className={className} />;
  return <SunsetScene className={className} />;
}

function ForestThumb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ft-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDF7F2" />
          <stop offset="100%" stopColor="#D5EADF" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#ft-sky)" />
      <circle cx="126" cy="24" r="13" fill="#EFEBFE" />
      <circle cx="126" cy="24" r="8" fill="#9B82F6" opacity="0.5" />
      <path d="M-4 62 L38 38 L74 62 L112 36 L164 64 V92 H-4Z" fill="#79BFB3" opacity="0.7" />
      <path d="M-4 74 L46 54 L96 76 L134 58 L164 72 V92 H-4Z" fill="#4E8E86" opacity="0.85" />
      <Pine x={30} y={44} s={0.85} fill="#3B5A54" />
      <Pine x={52} y={52} s={0.66} fill="#44645C" />
      <Pine x={112} y={46} s={0.78} fill="#3B5A54" />
      <path d="M-4 92 C40 84 78 94 118 88 C138 85 150 88 164 86 V92Z" fill="#2F4A46" />
    </svg>
  );
}

/** Decorative sprig used around the greeting. */
export function Sprig({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 60 96" className={className} aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <g className="anim-sway" stroke="#BFC5D6" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M44 94 C40 70 36 48 24 26 C20 18 14 10 6 4" />
        <path d="M40 78 C32 76 26 70 24 62 C33 63 39 69 40 78Z" fill="#E4E5F3" />
        <path d="M34 56 C26 54 20 48 18 40 C27 41 33 47 34 56Z" fill="#E4E5F3" />
        <path d="M27 34 C20 32 15 26 14 19 C22 20 27 26 27 34Z" fill="#E4E5F3" />
        <path d="M20 16 C14 13 11 7 11 1 C18 3 21 9 20 16Z" fill="#E4E5F3" />
        <path d="M46 86 C54 82 58 75 58 68 C50 71 45 78 46 86Z" fill="#E4E5F3" />
        <path d="M38 60 C46 56 50 49 50 42 C42 45 37 52 38 60Z" fill="#E4E5F3" />
        <path d="M30 36 C38 32 42 26 42 19 C34 22 29 28 30 36Z" fill="#E4E5F3" />
      </g>
    </svg>
  );
}
