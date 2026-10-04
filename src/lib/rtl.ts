/* ------------------------------------------------------------------ *
 *  Direction helpers.
 *
 *  A few things stay physical no matter what the document says: pointer
 *  coordinates, transform origins, drag offsets and the art-board's scale
 *  anchor. Those places go through here instead of ad-hoc `dir === "rtl"`
 *  checks, so RTL behaviour stays greppable — and testable in `check:ssr`.
 * ------------------------------------------------------------------ */

export type Direction = "ltr" | "rtl";

/** +1 in LTR, −1 in RTL — multiply a physical x offset by this */
export const dirSign = (dir: Direction) => (dir === "rtl" ? -1 : 1);

/**
 * Where a pointer sits along a track, measured in the direction the track
 * fills: 0 at the inline start, 1 at the inline end. `clientX` and `rect`
 * are physical, so an RTL bar that fills from the right still seeks to the
 * position the pointer is actually over.
 */
export const trackRatio = (
  clientX: number,
  rect: { left: number; width: number },
  dir: Direction,
) => {
  const raw = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
  const clamped = Math.min(Math.max(raw, 0), 1);
  return dir === "rtl" ? 1 - clamped : clamped;
};

/** the arrow a "previous" control points at in this direction */
export const backIcon = (dir: Direction) => (dir === "rtl" ? "chevronRight" : "chevronLeft");

/** the arrow a "next" control points at in this direction */
export const forwardIcon = (dir: Direction) => (dir === "rtl" ? "chevronLeft" : "chevronRight");
