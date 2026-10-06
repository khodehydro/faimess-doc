import React from "react";
import { cn } from "../lib/cn";
import { Icon } from "./Icon";

export type ClayTone =
  | "gold"
  | "purple"
  | "rose"
  | "mint"
  | "cyan"
  | "amber"
  | "indigo"
  | "flame"
  | "slate";

export type ClayIconGlyph =
  | "star"
  | "diamond"
  | "rabbit"
  | "cat"
  | "bolt"
  | "crown"
  | "disc"
  | "mic"
  | "wings"
  | "trophy"
  | "heart"
  | "planet"
  | "radio"
  | "quill"
  | "cassette"
  | "flame"
  | "rose"
  | "key"
  | "phoenix"
  | "lock"
  | "music"
  | "sparkle"
  | "trend"
  | "shield";

type ClayBadgeProps = {
  glyph: ClayIconGlyph;
  tone?: ClayTone;
  size?: "sm" | "md" | "lg" | "xl";
  locked?: boolean;
  className?: string;
};

const TONE_STYLES: Record<
  ClayTone,
  {
    bg: string;
    border: string;
    innerHighlight: string;
    shadow: string;
    glyphFill: string;
    accent: string;
  }
> = {
  gold: {
    bg: "from-amber-300 via-yellow-400 to-amber-500",
    border: "border-amber-200/80",
    innerHighlight: "rgba(255, 255, 230, 0.8)",
    shadow: "rgba(217, 119, 6, 0.4)",
    glyphFill: "text-amber-950",
    accent: "#FBBF24",
  },
  purple: {
    bg: "from-violet-400 via-purple-500 to-indigo-600",
    border: "border-violet-300/80",
    innerHighlight: "rgba(245, 235, 255, 0.8)",
    shadow: "rgba(124, 58, 237, 0.4)",
    glyphFill: "text-white",
    accent: "#8B5CF6",
  },
  rose: {
    bg: "from-pink-400 via-rose-500 to-red-500",
    border: "border-rose-300/80",
    innerHighlight: "rgba(255, 235, 245, 0.8)",
    shadow: "rgba(225, 29, 72, 0.4)",
    glyphFill: "text-white",
    accent: "#F43F5E",
  },
  mint: {
    bg: "from-emerald-300 via-teal-400 to-teal-600",
    border: "border-emerald-200/80",
    innerHighlight: "rgba(235, 255, 245, 0.8)",
    shadow: "rgba(13, 148, 136, 0.4)",
    glyphFill: "text-teal-950",
    accent: "#10B981",
  },
  cyan: {
    bg: "from-cyan-300 via-sky-400 to-blue-600",
    border: "border-cyan-200/80",
    innerHighlight: "rgba(235, 250, 255, 0.8)",
    shadow: "rgba(2, 132, 199, 0.4)",
    glyphFill: "text-sky-950",
    accent: "#0EA5E9",
  },
  amber: {
    bg: "from-orange-300 via-amber-500 to-orange-600",
    border: "border-orange-200/80",
    innerHighlight: "rgba(255, 245, 230, 0.8)",
    shadow: "rgba(234, 88, 12, 0.4)",
    glyphFill: "text-orange-950",
    accent: "#F97316",
  },
  indigo: {
    bg: "from-indigo-400 via-blue-600 to-slate-800",
    border: "border-indigo-300/80",
    innerHighlight: "rgba(235, 240, 255, 0.8)",
    shadow: "rgba(67, 56, 202, 0.4)",
    glyphFill: "text-white",
    accent: "#6366F1",
  },
  flame: {
    bg: "from-rose-400 via-orange-500 to-amber-500",
    border: "border-orange-300/80",
    innerHighlight: "rgba(255, 240, 230, 0.8)",
    shadow: "rgba(239, 68, 68, 0.4)",
    glyphFill: "text-white",
    accent: "#EF4444",
  },
  slate: {
    bg: "from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900",
    border: "border-slate-300 dark:border-slate-600",
    innerHighlight: "rgba(255, 255, 255, 0.4)",
    shadow: "rgba(100, 116, 139, 0.25)",
    glyphFill: "text-slate-500 dark:text-slate-400",
    accent: "#64748B",
  },
};

const SIZE_MAP = {
  sm: {
    box: "size-10",
    iconSize: 20,
    radius: "rounded-[14px]",
    insetSpread: "inset 2px 2px 4px",
    insetDark: "inset -2px -2px 5px",
    drop: "0 6px 14px -3px",
  },
  md: {
    box: "size-[52px]",
    iconSize: 26,
    radius: "rounded-[20px]",
    insetSpread: "inset 3px 3px 6px",
    insetDark: "inset -3px -3px 8px",
    drop: "0 10px 20px -4px",
  },
  lg: {
    box: "size-[72px]",
    iconSize: 36,
    radius: "rounded-[26px]",
    insetSpread: "inset 4px 4px 8px",
    insetDark: "inset -4px -4px 10px",
    drop: "0 14px 26px -5px",
  },
  xl: {
    box: "size-[96px]",
    iconSize: 48,
    radius: "rounded-[32px]",
    insetSpread: "inset 5px 5px 10px",
    insetDark: "inset -5px -5px 14px",
    drop: "0 20px 36px -6px",
  },
};

export function ClayBadgeIcon({
  glyph,
  tone = "gold",
  size = "md",
  locked = false,
  className,
}: ClayBadgeProps) {
  const currentTone = locked ? "slate" : tone;
  const styleConfig = TONE_STYLES[currentTone];
  const sizeConfig = SIZE_MAP[size];

  const clayShadow = locked
    ? `${sizeConfig.insetSpread} ${styleConfig.innerHighlight}, ${sizeConfig.insetDark} rgba(0, 0, 0, 0.25), ${sizeConfig.drop} ${styleConfig.shadow}`
    : `${sizeConfig.insetSpread} ${styleConfig.innerHighlight}, ${sizeConfig.insetDark} rgba(0, 0, 0, 0.22), ${sizeConfig.drop} ${styleConfig.shadow}`;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center border transition-all duration-300 select-none",
        sizeConfig.box,
        sizeConfig.radius,
        styleConfig.border,
        "bg-gradient-to-br",
        styleConfig.bg,
        locked ? "opacity-75 saturate-50" : "hover:scale-105 hover:-translate-y-0.5",
        className,
      )}
      style={{
        boxShadow: clayShadow,
      }}
    >
      {/* 3D Specular Highlight Bulb */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-1.5 h-[35%] rounded-full bg-gradient-to-b from-white/70 to-transparent blur-[1.5px]"
      />

      {/* Center 3D Clay Glyph */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center transition-transform",
          styleConfig.glyphFill,
        )}
      >
        {locked ? (
          <Icon name="lock" size={sizeConfig.iconSize} strokeWidth={2.4} />
        ) : (
          renderClayGlyph(glyph, sizeConfig.iconSize)
        )}
      </div>

      {/* Floating Sparkle for unlocked high-tier badges */}
      {!locked && (tone === "gold" || tone === "purple" || tone === "rose") && size !== "sm" && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -end-1 flex size-3.5 items-center justify-center rounded-full bg-white/90 shadow-xs"
        >
          <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
        </span>
      )}
    </div>
  );
}

function renderClayGlyph(glyph: ClayIconGlyph, size: number) {
  switch (glyph) {
    case "star":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <path
            d="M18 2.5L22.5 12L33 13.5L25 21L27 31.5L18 26.5L9 31.5L11 21L3 13.5L13.5 12L18 2.5Z"
            fill="url(#clay-star-grad)"
            stroke="#FFF5C2"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M18 6L21 13L28 14L22.5 19L24 26L18 22.5V6Z"
            fill="white"
            fillOpacity="0.4"
          />
          <defs>
            <linearGradient id="clay-star-grad" x1="18" y1="2.5" x2="18" y2="31.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF8D6" />
              <stop offset="0.5" stopColor="#FFDE59" />
              <stop offset="1" stopColor="#FFAE00" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "diamond":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.25)]"
        >
          <path
            d="M18 3L30 13L18 33L6 13L18 3Z"
            fill="url(#clay-diam-grad)"
            stroke="#E0F2FE"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M6 13H30L18 33L6 13Z" fill="white" fillOpacity="0.25" />
          <path d="M18 3L13 13L18 33L23 13L18 3Z" fill="white" fillOpacity="0.45" />
          <defs>
            <linearGradient id="clay-diam-grad" x1="18" y1="3" x2="18" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0F9FF" />
              <stop offset="0.5" stopColor="#BAE6FD" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "rabbit":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          {/* Bunny Ears */}
          <path
            d="M12 4C10.5 4 9 7 10 13C11 19 14 18 14 14C14 10 13.5 4 12 4Z"
            fill="#FFF"
            stroke="#FDE68A"
            strokeWidth="1.2"
          />
          <path d="M11 7C10.5 7 10 9 10.5 12C11 15 12.5 15 12.5 13C12.5 11 12 7 11 7Z" fill="#F472B6" />
          <path
            d="M24 4C25.5 4 27 7 26 13C25 19 22 18 22 14C22 10 22.5 4 24 4Z"
            fill="#FFF"
            stroke="#FDE68A"
            strokeWidth="1.2"
          />
          <path d="M25 7C25.5 7 26 9 25.5 12C25 15 23.5 15 23.5 13C23.5 11 24 7 25 7Z" fill="#F472B6" />
          {/* Bunny Head */}
          <circle cx="18" cy="22" r="10" fill="#FFF" stroke="#FDE68A" strokeWidth="1.2" />
          {/* Golden Cheeks / Feet */}
          <circle cx="13" cy="24" r="2.2" fill="#FBBF24" />
          <circle cx="23" cy="24" r="2.2" fill="#FBBF24" />
          {/* Eyes */}
          <circle cx="14" cy="20" r="1.5" fill="#1E293B" />
          <circle cx="22" cy="20" r="1.5" fill="#1E293B" />
          {/* Nose */}
          <path d="M17 22H19L18 23.5L17 22Z" fill="#F43F5E" />
        </svg>
      );

    case "cat":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          {/* Cat Ears */}
          <path d="M8 8L15 16H8V8Z" fill="#C084FC" stroke="#E9D5FF" strokeWidth="1.2" />
          <path d="M28 8L21 16H28V8Z" fill="#C084FC" stroke="#E9D5FF" strokeWidth="1.2" />
          {/* Cat Face */}
          <circle cx="18" cy="20" r="11" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1.2" />
          {/* Eyes */}
          <circle cx="14" cy="18" r="2" fill="#7E22CE" />
          <circle cx="14.5" cy="17.5" r="0.8" fill="#FFF" />
          <circle cx="22" cy="18" r="2" fill="#7E22CE" />
          <circle cx="22.5" cy="17.5" r="0.8" fill="#FFF" />
          {/* Nose */}
          <circle cx="18" cy="22" r="1.2" fill="#EC4899" />
          {/* Whiskers */}
          <line x1="9" y1="21" x2="13" y2="21.5" stroke="#9333EA" strokeWidth="1" />
          <line x1="9" y1="23" x2="13" y2="23" stroke="#9333EA" strokeWidth="1" />
          <line x1="23" y1="21.5" x2="27" y2="21" stroke="#9333EA" strokeWidth="1" />
          <line x1="23" y1="23" x2="27" y2="23" stroke="#9333EA" strokeWidth="1" />
        </svg>
      );

    case "crown":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <path
            d="M6 26L8 12L14 18L18 8L22 18L28 12L30 26H6Z"
            fill="url(#clay-crown-grad)"
            stroke="#FFF5C2"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="11" r="2" fill="#EF4444" />
          <circle cx="18" cy="7" r="2.5" fill="#3B82F6" />
          <circle cx="28" cy="11" r="2" fill="#10B981" />
          <rect x="8" y="23" width="20" height="3" rx="1.5" fill="#F59E0B" />
          <defs>
            <linearGradient id="clay-crown-grad" x1="18" y1="8" x2="18" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="0.4" stopColor="#FDE047" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "bolt":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          <path
            d="M20 3L7 19H17L14 33L29 15H19L20 3Z"
            fill="url(#clay-bolt-grad)"
            stroke="#FFFBEB"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="clay-bolt-grad" x1="18" y1="3" x2="18" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A" />
              <stop offset="0.6" stopColor="#FACC15" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "disc":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <circle cx="18" cy="18" r="14" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="10" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx="18" cy="18" r="7" stroke="#475569" strokeWidth="1" />
          <circle cx="18" cy="18" r="5" fill="#F43F5E" />
          <circle cx="18" cy="18" r="1.5" fill="#FFF" />
        </svg>
      );

    case "wings":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
        >
          <path
            d="M4 18C4 11 11 8 18 16C11 16 7 24 4 18Z"
            fill="url(#clay-wing-left)"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />
          <path
            d="M32 18C32 11 25 8 18 16C25 16 29 24 32 18Z"
            fill="url(#clay-wing-right)"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />
          <circle cx="18" cy="16" r="3" fill="#A855F7" stroke="#FFF" strokeWidth="1" />
          <defs>
            <linearGradient id="clay-wing-left" x1="4" y1="8" x2="18" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDF4FF" />
              <stop offset="1" stopColor="#D946EF" />
            </linearGradient>
            <linearGradient id="clay-wing-right" x1="32" y1="8" x2="18" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDF4FF" />
              <stop offset="1" stopColor="#D946EF" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "mic":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          <rect x="13" y="5" width="10" height="16" rx="5" fill="url(#clay-mic-grad)" stroke="#FFF" strokeWidth="1.2" />
          <line x1="13" y1="10" x2="23" y2="10" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          <line x1="13" y1="14" x2="23" y2="14" stroke="#FFF" strokeWidth="1" opacity="0.5" />
          <path d="M9 16C9 21.5 13 25 18 25C23 25 27 21.5 27 16" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 25V31M13 31H23" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" />
          <defs>
            <linearGradient id="clay-mic-grad" x1="13" y1="5" x2="23" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0E7FF" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "heart":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_3px_5px_rgba(244,63,94,0.35)]"
        >
          <path
            d="M18 31C18 31 5 21.5 5 13C5 8 9 5 13.5 5C16 5 17.5 6.5 18 7.5C18.5 6.5 20 5 22.5 5C27 5 31 8 31 13C31 21.5 18 31 18 31Z"
            fill="url(#clay-heart-grad)"
            stroke="#FFE4E6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 9C8 11 8 14 9 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <defs>
            <linearGradient id="clay-heart-grad" x1="18" y1="5" x2="18" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDA4AF" />
              <stop offset="0.5" stopColor="#F43F5E" />
              <stop offset="1" stopColor="#BE123C" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "trophy":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
        >
          <path d="M10 6H26V16C26 20.4 22.4 24 18 24C13.6 24 10 20.4 10 16V6Z" fill="url(#clay-cup-grad)" stroke="#FFFBEB" strokeWidth="1.4" />
          <path d="M10 9H6C4.9 9 4 9.9 4 11C4 14.5 7 16.5 10 17" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M26 9H30C31.1 9 32 9.9 32 11C32 14.5 29 16.5 26 17" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M18 24V28M12 31H24M14 28H22" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="clay-cup-grad" x1="18" y1="6" x2="18" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A" />
              <stop offset="0.6" stopColor="#EAB308" />
              <stop offset="1" stopColor="#A16207" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "planet":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          <circle cx="18" cy="18" r="9" fill="url(#clay-planet-grad)" stroke="#DDD6FE" strokeWidth="1.2" />
          <ellipse cx="18" cy="18" rx="15" ry="4.5" transform="rotate(-25 18 18)" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeDasharray="30 8" />
          <defs>
            <linearGradient id="clay-planet-grad" x1="18" y1="9" x2="18" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A78BFA" />
              <stop offset="1" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "rose":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        >
          <path d="M18 7C14 7 11 10 11 14C11 19 18 25 18 25C18 25 25 19 25 14C25 10 22 7 18 7Z" fill="#E11D48" stroke="#FFE4E6" strokeWidth="1.2" />
          <circle cx="18" cy="13" r="3.5" fill="#FDA4AF" />
          <path d="M18 25V31M18 28L14 26M18 29L22 27" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case "key":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
        >
          <circle cx="13" cy="14" r="7" stroke="#FFFBEB" strokeWidth="2.5" fill="none" />
          <path d="M18 18L29 29M25 25L28 22M27 27L30 24" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "phoenix":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_3px_5px_rgba(249,115,22,0.4)]"
        >
          <path d="M18 4C18 4 12 12 12 18C12 24 18 29 18 29C18 29 24 24 24 18C24 12 18 4 18 4Z" fill="url(#clay-phx-grad)" stroke="#FEF08A" strokeWidth="1.2" />
          <path d="M6 14C10 17 14 16 14 16C12 21 8 23 6 14Z" fill="#F97316" stroke="#FEF08A" strokeWidth="1" />
          <path d="M30 14C26 17 22 16 22 16C24 21 28 23 30 14Z" fill="#F97316" stroke="#FEF08A" strokeWidth="1" />
          <defs>
            <linearGradient id="clay-phx-grad" x1="18" y1="4" x2="18" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A" />
              <stop offset="0.5" stopColor="#F97316" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return (
        <Icon name="medal" size={size} strokeWidth={2.2} />
      );
  }
}
