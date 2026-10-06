/* ------------------------------------------------------------------ *
 *  FAIMESS brand mark — the cat.
 *
 *  The mark is a single raster artwork (src/assets/brand/faimess-logo.png):
 *  a white cat on the brand purple — the very same two colours the app
 *  draws with `--color-primary`. Every surface shows that one picture:
 *  the site header, the account door, the download page, the mobile
 *  splash, and — cut from the same file by tools/appicons.py — the
 *  browser tab, the home-screen icon and the installed PWA.
 * ------------------------------------------------------------------ */

import logoUrl from "../assets/brand/faimess-logo.png";

/** the corner the launcher icons wear (13/40 in tools/appicons.py) */
const CORNER = "32.5%";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      width={size}
      height={size}
      className="select-none pointer-events-none"
      style={{ borderRadius: CORNER }}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-extrabold tracking-[-0.02em]">FAIMESS</span>
    </span>
  );
}
