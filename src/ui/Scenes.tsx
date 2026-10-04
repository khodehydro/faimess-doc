import { useId } from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ *
 *  Illustrations — flat vector, dusk palette tuned to the violet brand.
 *  Composed on a wide 1200×400 canvas so they fill a panoramic hero
 *  without awkward cropping. Ambient motion is baked in.
 *  Gradient ids are namespaced with useId() so several scenes can live
 *  on the same page without colliding.
 * ------------------------------------------------------------------ */

const useNs = () => useId().replace(/:/g, "");

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
  const ns = useNs();

  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${ns}-sky`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0%" stopColor="#EDE7FA" />
          <stop offset="24%" stopColor="#F6DFEC" />
          <stop offset="52%" stopColor="#FBDAC2" />
          <stop offset="78%" stopColor="#F9C199" />
          <stop offset="100%" stopColor="#F3AE93" />
        </linearGradient>
        <radialGradient id={`${ns}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6EA" stopOpacity="0.95" />
          <stop offset="52%" stopColor="#FDDFC0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FBC79C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${ns}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEB29B" />
          <stop offset="34%" stopColor="#C7A6C6" />
          <stop offset="100%" stopColor="#8CA9C0" />
        </linearGradient>
        <linearGradient id={`${ns}-hill`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#4C4C67" />
          <stop offset="100%" stopColor="#393A4E" />
        </linearGradient>
      </defs>

      <rect width="1200" height="400" fill={`url(#${ns}-sky)`} />

      {/* sun */}
      <g className="anim-glow">
        <circle cx="716" cy="168" r="152" fill={`url(#${ns}-glow)`} />
      </g>
      <circle cx="716" cy="168" r="36" fill="#FFF3E2" opacity="0.95" />

      {/* far ridges */}
      <path
        d="M0 208 L120 168 L232 202 L356 156 L474 206 L584 178 L706 210 L820 166 L936 204 L1046 172 L1200 202 V252 H0Z"
        fill="#D9B6DA"
        opacity="0.85"
      />
      <path
        d="M0 226 L142 200 L266 226 L396 194 L524 230 L656 204 L792 234 L922 202 L1052 230 L1200 210 V258 H0Z"
        fill="#C79BC4"
      />

      {/* drifting horizon mist */}
      <motion.g
        initial={{ x: -34, opacity: 0.45 }}
        animate={{ x: 34, opacity: 0.7 }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <ellipse cx="400" cy="238" rx="252" ry="13" fill="#FFE0CC" opacity="0.35" />
        <ellipse cx="960" cy="246" rx="212" ry="10" fill="#FFE6D2" opacity="0.28" />
      </motion.g>

      {/* water */}
      <rect y="244" width="1200" height="156" fill={`url(#${ns}-water)`} />
      <rect x="668" y="244" width="100" height="156" fill="#FFF1DE" opacity="0.15" />

      <motion.g
        initial={{ x: -16 }}
        animate={{ x: 16 }}
        transition={{ duration: 6.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <rect x="150" y="266" width="140" height="3" rx="1.5" fill="#FFFFFF" opacity="0.3" className="anim-shimmer" />
        <rect x="430" y="286" width="180" height="3" rx="1.5" fill="#FFFFFF" opacity="0.24" className="anim-shimmer" style={{ animationDelay: "0.9s" }} />
        <rect x="742" y="300" width="112" height="3" rx="1.5" fill="#FFFFFF" opacity="0.26" className="anim-shimmer" style={{ animationDelay: "1.7s" }} />
        <rect x="980" y="272" width="126" height="3" rx="1.5" fill="#FFFFFF" opacity="0.22" className="anim-shimmer" style={{ animationDelay: "2.4s" }} />
        <rect x="308" y="330" width="96" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.18" className="anim-shimmer" style={{ animationDelay: "3s" }} />
      </motion.g>

      {/* sailboat riding the swell */}
      <motion.g
        initial={{ y: 0, rotate: -1.5 }}
        animate={{ y: [-2, 3, -2], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
      >
        <path d="M548 240 l0 -26 l16 26z" fill="#FFF5E9" />
        <path d="M544 240 l0 -18 l-13 18z" fill="#FBD9BC" />
        <path d="M528 240 h34 l-5 6 h-24z" fill="#3F3F55" />
      </motion.g>

      {/* distant island */}
      <path d="M884 244 C914 234 956 234 986 246 L986 250 H884Z" fill="#4A4B63" />
      <g className="anim-sway">
        <Pine x={912} y={214} s={0.82} fill="#3E3F57" />
        <Pine x={942} y={220} s={0.66} fill="#474963" />
      </g>

      {/* birds */}
      <motion.g
        initial={{ x: 0, y: 0 }}
        animate={{ x: [0, 96, 196], y: [0, -12, 5] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6B5A70"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0 0c4-4 7-4 11 0M11 0c4-4 7-4 11 0" transform="translate(366 104) scale(0.9)" />
        <path d="M0 0c3-3 5.5-3 8.5 0M8.5 0c3-3 5.5-3 8.5 0" transform="translate(418 82) scale(0.75)" />
        <path d="M0 0c2.5-2.5 4.5-2.5 7 0M7 0c2.5-2.5 4.5-2.5 7 0" transform="translate(462 116) scale(0.6)" />
      </motion.g>

      {/* left hill with pines */}
      <path
        d="M0 400 V248 C62 232 142 234 214 250 C286 266 334 292 364 332 C384 358 396 378 402 400 Z"
        fill={`url(#${ns}-hill)`}
      />
      <g className="anim-sway">
        <Pine x={62} y={196} s={1.6} fill="#3C3D51" />
        <Pine x={126} y={214} s={1.25} fill="#454766" />
        <Pine x={26} y={226} s={1.05} fill="#383949" />
        <Pine x={196} y={244} s={0.88} fill="#454766" />
      </g>

      {/* right bank */}
      <path
        d="M1200 400 V264 C1132 258 1054 268 994 288 C944 304 910 324 892 350 C876 374 868 388 864 400 Z"
        fill="#3F404F"
      />
      <g className="anim-sway" style={{ animationDelay: "1.2s" }}>
        <Pine x={1086} y={226} s={1.5} fill="#3C3D51" />
        <Pine x={1024} y={252} s={1.15} fill="#454766" />
        <Pine x={1148} y={262} s={1.0} fill="#383949" />
      </g>

      {/* foreground */}
      <path d="M0 400 V362 C64 352 138 366 196 378 C232 386 258 394 282 400Z" fill="#32333F" />
      <path d="M1200 400 V368 C1130 358 1062 372 1010 384 C986 390 962 396 946 400Z" fill="#32333F" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 2 — camping under the stars
 * ------------------------------------------------------------------ */

export function CampingScene({ className }: { className?: string }) {
  const ns = useNs();

  const stars = [
    [46, 30, 1.6, 0], [110, 20, 1.2, 0.6], [178, 38, 1.8, 1.2], [246, 22, 1.3, 0.3],
    [312, 44, 1.5, 0.9], [378, 26, 1.2, 1.5], [442, 34, 1.7, 0.4], [508, 20, 1.3, 1.1],
    [574, 46, 1.4, 1.3], [640, 28, 1.2, 0.5], [706, 40, 1.5, 1.7], [772, 22, 1.2, 0.9],
    [836, 48, 1.6, 1.2], [902, 26, 1.1, 0.2], [968, 44, 1.3, 1.9], [1034, 30, 1.5, 1.1],
    [1100, 50, 1.2, 0.7], [1160, 24, 1.6, 1.4], [148, 62, 1.1, 1.8], [268, 66, 1.2, 1.4],
    [86, 70, 1, 2.1], [446, 72, 1.1, 0.8], [662, 64, 1.2, 1.6], [880, 74, 1, 1.0],
    [1042, 68, 1.1, 0.4], [1150, 76, 1.2, 1.3],
  ] as const;

  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${ns}-sky`} x1="0" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#232A46" />
          <stop offset="40%" stopColor="#3F4A6E" />
          <stop offset="72%" stopColor="#7B6A8E" />
          <stop offset="100%" stopColor="#C98F7E" />
        </linearGradient>
        <linearGradient id={`${ns}-lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C99A8E" />
          <stop offset="100%" stopColor="#2F3A55" />
        </linearGradient>
        <radialGradient id={`${ns}-moon`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6E6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF6E6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${ns}-fire`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFD08A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFB36B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="400" fill={`url(#${ns}-sky)`} />

      {stars.map(([x, y, r, d], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#FFF6E2" className="anim-twinkle" style={{ animationDelay: `${d}s` }} />
      ))}

      <circle cx="970" cy="82" r="86" fill={`url(#${ns}-moon)`} />
      <circle cx="970" cy="82" r="20" fill="#FDF3E4" />

      {/* mountain tiers */}
      <path
        d="M0 232 L152 164 L298 216 L448 146 L606 220 L752 172 L908 224 L1052 158 L1200 200 V272 H0Z"
        fill="#3B4460"
      />
      <path
        d="M0 254 L186 208 L348 248 L508 200 L680 250 L846 210 L1010 252 L1150 220 L1200 236 V284 H0Z"
        fill="#4A5474"
        opacity="0.92"
      />

      {/* lake */}
      <rect y="276" width="1200" height="124" fill={`url(#${ns}-lake)`} />
      <rect x="900" y="276" width="146" height="124" fill="#FFE1B8" opacity="0.16" />

      {/* ground */}
      <path d="M0 342 C220 322 430 342 640 330 C850 318 1030 340 1200 324 V400 H0Z" fill="#2A3348" />

      {/* fire glow */}
      <ellipse cx="880" cy="332" rx="132" ry="68" fill={`url(#${ns}-fire)`} />

      {/* tent */}
      <g transform="translate(500 0)" className="anim-float">
        <path d="M0 332 L86 210 L172 332Z" fill="#F6E9DA" />
        <path d="M86 210 L172 332 H122 L86 258Z" fill="#8267F0" />
        <path d="M86 210 L128 332 H44Z" fill="#2F3850" opacity="0.32" />
        <path d="M86 258 L118 332 H54Z" fill="#252D42" />
        <path d="M86 210 L93 182 L100 210Z" fill="#E8CFAF" />
      </g>

      {/* campfire */}
      <g transform="translate(880 322)">
        <path d="M-28 12 h56" stroke="#3A2C22" strokeWidth="6" strokeLinecap="round" />
        <path d="M-18 6 l36 12 M18 6 l-36 12" stroke="#4A3427" strokeWidth="4.6" strokeLinecap="round" />
        <g className="anim-flicker">
          <path d="M0 -38 C12 -23 17 -15 17 -5 C17 6 10 13 0 13 C-10 13 -17 6 -17 -5 C-17 -15 -12 -23 0 -38Z" fill="#F7B26A" />
          <path d="M0 -23 C6 -14 9 -8 9 -3 C9 5 5 9 0 9 C-5 9 -9 5 -9 -3 C-9 -8 -6 -14 0 -23Z" fill="#8267F0" opacity="0.9" />
        </g>
      </g>

      <Pine x={86} y={292} s={1.5} fill="#2C3549" />
      <Pine x={158} y={312} s={1.2} fill="#333D53" />
      <Pine x={1108} y={296} s={1.55} fill="#2C3549" />
      <Pine x={1166} y={314} s={1.1} fill="#333D53" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Hero 3 — coastline at dusk
 * ------------------------------------------------------------------ */

export function CoastScene({ className }: { className?: string }) {
  const ns = useNs();

  return (
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${ns}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCD8FA" />
          <stop offset="30%" stopColor="#F4D9EC" />
          <stop offset="64%" stopColor="#FCD7B6" />
          <stop offset="100%" stopColor="#F5A98C" />
        </linearGradient>
        <linearGradient id={`${ns}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFA98F" />
          <stop offset="38%" stopColor="#B49BC7" />
          <stop offset="100%" stopColor="#7FA6BE" />
        </linearGradient>
      </defs>

      <rect width="1200" height="400" fill={`url(#${ns}-sky)`} />

      <circle cx="430" cy="196" r="48" fill="#FFF4E0" opacity="0.92" />
      <circle cx="430" cy="196" r="112" fill="#FFE7C4" opacity="0.22" />

      <path
        d="M0 238 C140 228 262 244 406 234 C548 225 660 240 800 232 C930 225 1080 240 1200 230 V256 H0Z"
        fill="#C99BC0"
        opacity="0.55"
      />

      {/* sea */}
      <rect y="256" width="1200" height="144" fill={`url(#${ns}-sea)`} />
      <rect x="382" y="256" width="96" height="144" fill="#FFF0DA" opacity="0.2" />

      <motion.g
        initial={{ x: -14 }}
        animate={{ x: 14 }}
        transition={{ duration: 7.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <rect x="150" y="290" width="150" height="3" rx="1.5" fill="#fff" opacity="0.26" className="anim-shimmer" />
        <rect x="520" y="314" width="190" height="3" rx="1.5" fill="#fff" opacity="0.2" className="anim-shimmer" style={{ animationDelay: "1.1s" }} />
        <rect x="880" y="336" width="128" height="3" rx="1.5" fill="#fff" opacity="0.24" className="anim-shimmer" style={{ animationDelay: "2s" }} />
      </motion.g>

      {/* sand banks */}
      <path d="M0 400 V336 C160 322 320 338 468 346 C640 356 820 340 1000 350 C1090 355 1150 358 1200 356 V400Z" fill="#3E3B52" opacity="0.35" />
      <path d="M0 400 V352 C170 342 356 356 524 364 C700 372 880 358 1040 366 C1120 370 1170 372 1200 370 V400Z" fill="#33314A" />

      {/* palms */}
      <g fill="#2F3046">
        <path d="M130 400 c5-32 7-56 5-84 l10 0 c-3 28 -1 52 3 84z" />
        <path d="M138 316 c-26-16 -41-9 -48 5 c18-3 31 0 39 8z" />
        <path d="M138 316 c-16-26 -5-42 9-47 c-4 16 0 29 8 39z" />
        <path d="M138 316 c24-18 39-10 46 3 c-17-3 -30 0 -37 8z" />
        <path d="M138 316 c4-28 22-35 36-32 c-12 9 -20 19 -23 34z" />
        <path d="M1052 400 c4-28 6-50 4-76 l9 0 c-2 26 -1 48 2 76z" />
        <path d="M1058 324 c-23-14 -37-8 -43 4 c16-2 28 0 35 7z" />
        <path d="M1058 324 c21-16 35-9 41 3 c-15-3 -27 0 -33 7z" />
      </g>

      <g className="anim-sway">
        <Pine x={1140} y={306} s={1.35} fill="#2F3046" />
        <Pine x={1180} y={328} s={1.05} fill="#3A3B52" />
      </g>

      {/* birds */}
      <motion.g
        initial={{ x: 0, y: 0, opacity: 0.8 }}
        animate={{ x: [0, 70, 150], y: [0, -8, 6] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        stroke="#6E5A72"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0 0c4-4 7-4 11 0M11 0c4-4 7-4 11 0" transform="translate(720 122) scale(0.9)" />
        <path d="M0 0c3-3 5.5-3 8.5 0M8.5 0c3-3 5.5-3 8.5 0" transform="translate(780 100) scale(0.72)" />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 *  Small art — map card, forest thumb, sprigs
 * ------------------------------------------------------------------ */

export type MapTone = "violet" | "teal" | "amber";

export function MapScene({ tone = "teal", className }: { tone?: MapTone; className?: string }) {
  const ns = useNs();

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
    <svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${ns}-water`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={water[tone][0]} />
          <stop offset="100%" stopColor={water[tone][1]} />
        </linearGradient>
      </defs>
      <rect width="340" height="170" fill="#EEF1F4" />

      <g fill="#E2E6EB">
        <rect x="16" y="14" width="78" height="44" rx="7" />
        <rect x="108" y="10" width="60" height="32" rx="6" />
        <rect x="184" y="18" width="70" height="36" rx="7" />
        <rect x="14" y="76" width="56" height="44" rx="7" />
        <rect x="88" y="74" width="76" height="32" rx="6" />
        <rect x="184" y="72" width="50" height="28" rx="6" />
        <rect x="252" y="78" width="74" height="48" rx="7" />
        <rect x="110" y="120" width="80" height="34" rx="6" />
      </g>

      <path d="M228 118h96v52H228z" fill="#D8EDE6" />

      <path
        d="M-10 66 C56 50 108 86 168 72 C226 58 282 92 350 74 V116 C282 132 226 100 168 112 C108 124 56 88 -10 104Z"
        fill={`url(#${ns}-water)`}
      />

      <g stroke="#FFFFFF" fill="none" strokeLinecap="round">
        <path d="M-8 28 H348" strokeWidth="7" opacity="0.85" />
        <path d="M84 -8 V178" strokeWidth="7" opacity="0.85" />
        <path d="M252 -8 V178" strokeWidth="6" opacity="0.7" />
        <path d="M-8 142 H348" strokeWidth="6" opacity="0.7" />
        <path d="M-8 72 C66 58 130 92 218 76 C268 68 306 80 348 72" strokeWidth="5" opacity="0.55" />
      </g>

      <motion.path
        d="M56 134 C104 122 130 88 166 80 C202 72 226 92 264 106"
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

      <circle cx="56" cy="134" r="5" fill="#FFFFFF" />
      <circle cx="56" cy="134" r="2.6" fill="#3F3F55" />

      <g transform="translate(264 106)">
        <circle r="13" fill={pin[tone]} opacity="0.3" className="anim-pulse-ring" />
        <circle r="13" fill={pin[tone]} opacity="0.26" className="anim-pulse-ring" style={{ animationDelay: "1.2s" }} />
        <path d="M0 -16c-6.6 0-12 5.4-12 12 0 8.4 12 20 12 20s12-11.6 12-20c0-6.6-5.4-12-12-12z" fill={pin[tone]} />
        <circle cy="-4" r="4.6" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function ForestThumb({ className }: { className?: string }) {
  const ns = useNs();

  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${ns}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDF7F2" />
          <stop offset="100%" stopColor="#D5EADF" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill={`url(#${ns}-sky)`} />
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

export function Thumb({ scene, className }: { scene: SceneKey; className?: string }) {
  if (scene === "camping") return <CampingScene className={className} />;
  if (scene === "coast") return <CoastScene className={className} />;
  if (scene === "forest") return <ForestThumb className={className} />;
  return <SunsetScene className={className} />;
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
