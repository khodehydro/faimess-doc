import React from "react";

export interface FandomInsigniaProps {
  artistId?: string;
  size?: number;
  className?: string;
}

export function FandomInsignia({
  artistId = "",
  size = 20,
  className = "",
}: FandomInsigniaProps) {
  const id = artistId.toLowerCase().trim();

  // 1. BTS (방탄소년단) — The iconic inward-leaning dual doors
  if (id === "bts" || id.includes("bts") || id.includes("bangtan")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="BTS Insignia"
      >
        {/* Left Door */}
        <path d="M5.5 5.5 L14.5 7.6 L14.5 24.4 L5.5 26.5 Z" />
        {/* Right Door */}
        <path d="M17.5 7.6 L26.5 5.5 L26.5 26.5 L17.5 24.4 Z" />
      </svg>
    );
  }

  // 2. BLACKPINK (블랙핑크) — Iconic split heart & crown emblem
  if (id === "blackpink" || id.includes("blackpink")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="BLACKPINK Insignia"
      >
        <path d="M16 26.5 C15.4 26 6 18 6 12 A5.5 5.5 0 0 1 16 8 A5.5 5.5 0 0 1 26 12 C26 18 16.6 26 16 26.5 Z" />
        <path d="M16 8.5 L16 25" stroke="var(--color-surface, #ffffff)" strokeWidth="1.8" />
        <circle cx="16" cy="15" r="2.2" fill="var(--color-surface, #ffffff)" />
      </svg>
    );
  }

  // 3. Stray Kids (스트레이 키즈) — Iconic SKZ Compass Star
  if (id === "stray-kids" || id.includes("stray") || id.includes("skz")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="Stray Kids Insignia"
      >
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 4.5 L18.8 13.2 L27.5 16 L18.8 18.8 L16 27.5 L13.2 18.8 L4.5 16 L13.2 13.2 Z" />
      </svg>
    );
  }

  // 4. NewJeans (뉴진س) — Iconic Tokki (Bunny) Silhouette
  if (id === "newjeans" || id.includes("newjeans")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="NewJeans Insignia"
      >
        {/* Bunny ears */}
        <ellipse cx="12" cy="9" rx="3" ry="6.5" transform="rotate(-8 12 9)" />
        <ellipse cx="20" cy="9" rx="3" ry="6.5" transform="rotate(8 20 9)" />
        {/* Bunny head */}
        <circle cx="16" cy="19.5" r="7.5" />
        {/* Eye dots */}
        <circle cx="13.5" cy="19" r="1.1" fill="var(--color-surface, #ffffff)" />
        <circle cx="18.5" cy="19" r="1.1" fill="var(--color-surface, #ffffff)" />
        {/* Nose */}
        <ellipse cx="16" cy="22" rx="1.2" ry="0.8" fill="var(--color-surface, #ffffff)" />
      </svg>
    );
  }

  // 5. TWICE (트와이스) — Interconnected Candy Bong T
  if (id === "twice" || id.includes("twice")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="TWICE Insignia"
      >
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M9.5 10.5 H22.5 V14 H17.8 V23.5 H14.2 V14 H9.5 Z" />
      </svg>
    );
  }

  // 6. Aespa (에스파) — Ae Cyber Dimension Sigil
  if (id === "aespa" || id.includes("aespa")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="Aespa Insignia"
      >
        <path d="M7 23 L13.5 9 H15.5 L22 23 H19.2 L17.5 19.5 H11.5 L9.8 23 Z M12.5 17 H16.5 L14.5 12 Z" />
        <path d="M21.5 17.5 C21.5 14.5 23.5 13 25.8 13 C28 13 29.5 14.5 29.5 17.5 V23 H27 V17.8 C27 16 26.2 15 25.5 15 C24.5 15 24 16 24 17.8 V23 H21.5 Z" />
      </svg>
    );
  }

  // 7. SEVENTEEN (세븐틴) — Faceted CARAT Diamond
  if (id === "seventeen" || id.includes("seventeen") || id.includes("svt")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className={className}
        aria-label="SEVENTEEN Insignia"
      >
        <path d="M16 4.5 L26.5 12.5 L16 28 L5.5 12.5 Z" />
        <path d="M5.5 12.5 H26.5" />
        <path d="M11.5 4.5 L10 12.5 L16 28 L22 12.5 L20.5 4.5" />
      </svg>
    );
  }

  // 8. TXT (투모로우바이투게더) — Plus-X-Plus Monogram
  if (id === "txt" || id.includes("txt") || id.includes("tomorrow")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="TXT Insignia"
      >
        {/* Left Plus */}
        <path d="M6 14.5 H8 V12 H10.5 V14.5 H13 V16.5 H10.5 V19 H8 V16.5 H6 Z" />
        {/* Center Cross / X */}
        <path d="M16 13.5 L18 15.5 L19.5 14 L17.5 12 L19.5 10 L18 8.5 L16 10.5 L14 8.5 L12.5 10 L14.5 12 L12.5 14 L14 15.5 Z" transform="translate(0, 4)" />
        {/* Right Plus */}
        <path d="M19 14.5 H21 V12 H23.5 V14.5 H26 V16.5 H23.5 V19 H21 V16.5 H19 Z" />
      </svg>
    );
  }

  // 9. ENHYPEN (엔하이픈) — Iconic Connect-Hyphen Bars
  if (id === "enhypen" || id.includes("enhypen")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="ENHYPEN Insignia"
      >
        <rect x="5" y="8" width="6.5" height="16" rx="2" />
        <rect x="13.5" y="13.5" width="5" height="5" rx="1.5" />
        <rect x="20.5" y="8" width="6.5" height="16" rx="2" />
      </svg>
    );
  }

  // 10. LE SSERAFIM (르세라핌) — Im-Fearless Angled Slashes
  if (id === "le-sserafim" || id.includes("sserafim")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="LE SSERAFIM Insignia"
      >
        <path d="M6 10 L11 7.5 L26 7.5 L21 10 Z" />
        <path d="M6 15 L11 12.5 L26 12.5 L21 15 Z" />
        <path d="M6 20 L11 17.5 L26 17.5 L21 20 Z" />
        <path d="M6 25 L11 22.5 L26 22.5 L21 25 Z" />
      </svg>
    );
  }

  // 11. IVE (아이브) — Sleek Crown & I=VE Monogram
  if (id === "ive" || id.includes("ive")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="IVE Insignia"
      >
        <rect x="6" y="9" width="4" height="14" rx="1" />
        <path d="M13 9 L17 23 H19.5 L24.5 9 H21 L18.5 18 L16 9 Z" />
        <circle cx="27" cy="11" r="2.2" />
      </svg>
    );
  }

  // 12. EXO (엑소) — Hexagonal Prism
  if (id === "exo" || id.includes("exo")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className={className}
        aria-label="EXO Insignia"
      >
        <path d="M16 4 L26 9.8 V21.2 L16 27 L6 21.2 V9.8 Z" />
        <path d="M6 9.8 L26 21.2" />
        <path d="M26 9.8 L6 21.2" />
      </svg>
    );
  }

  // Platform Artists:
  // KAIROS — Orbit Star
  if (id.includes("kairos")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-label="KAIROS Insignia"
      >
        <ellipse cx="16" cy="16" rx="13" ry="5.5" transform="rotate(-30 16 16)" />
        <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      </svg>
    );
  }

  // PRISM9 — 9-Faceted Crystal
  if (id.includes("prism9")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-label="PRISM9 Insignia"
      >
        <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" />
        <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      </svg>
    );
  }

  // NOVAE — Four-Pointed Starburst
  if (id.includes("novae")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-label="NOVAE Insignia"
      >
        <path d="M16 3 C16 10 10 16 3 16 C10 16 16 22 16 29 C16 22 22 16 29 16 C22 16 16 10 16 3 Z" />
      </svg>
    );
  }

  // Generic K-Pop Fandom Star Shield for others
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Fandom Insignia"
    >
      <path d="M16 4 L26 8 V16 C26 22.5 16 27.5 16 27.5 C16 27.5 6 22.5 6 16 V8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="16,10 17.8,14.5 22.5,14.8 19,18 20.2,22.5 16,20 11.8,22.5 13,18 9.5,14.8 14.2,14.5" />
    </svg>
  );
}
