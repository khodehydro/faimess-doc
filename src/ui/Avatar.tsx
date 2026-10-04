import type { BadgeTone, CommentBadge } from "../data/badges";
import { Icon } from "./Icon";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ *
 *  Avatars — a real profile photo when the data carries `src`, and the
 *  flat vector person generated from the seed as the fallback. Both are
 *  round and fill the box, so callers only ever set the size.
 * ------------------------------------------------------------------ */

const PALETTE = [
  { bg: "#EFEBFE", skin: "#F0C29B", hair: "#382A22", shirt: "#8267F0" },
  { bg: "#E4F2EF", skin: "#E8B48C", hair: "#5B3A22", shirt: "#79BFB3" },
  { bg: "#EEF0FB", skin: "#C98A5E", hair: "#241E1B", shirt: "#8AA9E0" },
  { bg: "#FDF0E4", skin: "#F5D2B4", hair: "#7A4B2A", shirt: "#E3A46A" },
  { bg: "#F5EAFB", skin: "#8D5A3B", hair: "#1F1B18", shirt: "#C99BE0" },
  { bg: "#E9F6EE", skin: "#DE9E73", hair: "#2F2A26", shirt: "#58B879" },
];

type AvatarProps = {
  /** a real profile photo — takes precedence over the drawn person */
  src?: string;
  seed?: number;
  size?: number;
  className?: string;
  /** violet ring, like the top-bar profile chip */
  ring?: boolean;
  /** the last award this account won — drawn as a crest on the corner */
  badge?: CommentBadge;
};

/** crest tones — one solid colour each, never a gradient */
const BADGE_TONE: Record<BadgeTone, string> = {
  primary: "bg-primary text-white",
  mint: "bg-mint text-white",
  flame: "bg-flame text-white",
  teal: "bg-teal text-white",
};

export function Avatar({ src, seed = 0, size = 36, className, ring, badge }: AvatarProps) {
  const p = PALETTE[Math.abs(seed) % PALETTE.length];
  const variant = Math.abs(seed) % 3;
  const id = `av-${seed}`;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-white",
        ring && "ring-2 ring-primary ring-offset-2 ring-offset-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <PhotoSvg size={size} p={p} variant={variant} id={id} />
      )}

      {badge && (
        <span
          title={badge.label}
          aria-label={badge.label}
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full ring-2 ring-white",
            BADGE_TONE[badge.tone],
          )}
          style={{ width: Math.max(14, size * 0.42), height: Math.max(14, size * 0.42) }}
        >
          <Icon name={badge.icon} size={Math.max(8, size * 0.26)} strokeWidth={2.4} />
        </span>
      )}
    </span>
  );
}

function PhotoSvg({
  size,
  p,
  variant,
  id,
}: {
  size: number;
  p: (typeof PALETTE)[number];
  variant: number;
  id: string;
}) {
  return (
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle cx="20" cy="20" r="20" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <rect width="40" height="40" fill={p.bg} />
          <path d="M4.5 40c1-8 7.4-12.6 15.5-12.6S34.5 32 35.5 40z" fill={p.shirt} />
          <path d="M17.4 22.4h5.2v6h-5.2z" fill={p.skin} />
          <ellipse cx="20" cy="17.2" rx="8.1" ry="8.9" fill={p.skin} />
          <circle cx="11.9" cy="18" r="1.5" fill={p.skin} />
          <circle cx="28.1" cy="18" r="1.5" fill={p.skin} />

          {variant === 0 && (
            <path
              d="M11.6 18.4c-.9-6 2.4-10.7 8.4-10.7s9.3 4.7 8.4 10.7c-1.3-2.6-2.9-4-4.8-4.4-2.9-.6-6.4.2-8.4 1.7-1.4 1-2.5 1.7-3.6 2.7z"
              fill={p.hair}
            />
          )}
          {variant === 1 && (
            <>
              <path
                d="M11.9 16.2c0-5.2 3.4-8.6 8.1-8.6s8.1 3.4 8.1 8.6c0 3.6 1.2 8.4 1.9 11.2h-4.4c.6-4 .8-8-1.4-9.4-2.4 1.5-6.3 1.7-8.9.2-1.5-.9-1.9-1.2-2.6-2z"
                fill={p.hair}
              />
              <path d="M12.1 24.4c-.7 2.7-.9 6.6-.6 9.1h3.6c-.7-3.3-.4-6.7.4-9.6z" fill={p.hair} />
              <path d="M28.4 24.4c.7 2.7.9 6.6.6 9.1h-3.6c.7-3.3.4-6.7-.4-9.6z" fill={p.hair} />
            </>
          )}
          {variant === 2 && (
            <>
              <path
                d="M11.8 17.6c-.7-5.6 2.6-10 8.2-10s8.9 4.4 8.2 10c-1-2.4-2.4-3.6-4.2-4-2.7-.5-5.9.2-7.8 1.5-1.3.9-3.4 1.6-4.4 2.5z"
                fill={p.hair}
              />
              <circle cx="27.6" cy="6.9" r="2.7" fill={p.hair} />
            </>
          )}

          <ellipse cx="17.2" cy="17.6" rx="0.95" ry="1.15" fill="#2B2B2B" />
          <ellipse cx="22.8" cy="17.6" rx="0.95" ry="1.15" fill="#2B2B2B" />
          <path
            d="M17.5 20.9c.6.85 1.5 1.3 2.5 1.3s1.9-.45 2.5-1.3"
            stroke="#2B2B2B"
            strokeWidth="1.05"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="15.1" cy="19.9" r="1.15" fill="#8267F0" opacity="0.28" />
          <circle cx="24.9" cy="19.9" r="1.15" fill="#8267F0" opacity="0.28" />
        </g>
      </svg>
  );
}

type StackProps = {
  seeds: number[];
  size?: number;
  more?: number;
  className?: string;
};

/** Overlapping avatar row with a green “+N” bubble — the social-presence motif. */
export function AvatarStack({ seeds, size = 26, more = 0, className }: StackProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {seeds.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="rounded-full ring-2 ring-white transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            <Avatar seed={s} size={size} />
          </span>
        ))}
      </div>
      {more > 0 && (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-full bg-primary-soft font-bold text-primary-deep ring-2 ring-white"
          style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
        >
          +{more}
        </span>
      )}
    </div>
  );
}
