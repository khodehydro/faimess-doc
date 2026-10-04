/* ------------------------------------------------------------------ *
 *  The stage — one fixed art-board the whole desktop UI is drawn on.
 *  Everything inside is authored in these exact pixels; the stage is
 *  then uniformly scaled to fit the viewport, so the composition never
 *  reflows and the page never scrolls on desktop.
 *
 *  The board is deliberately wide (≈16:9): on typical desktop screens the
 *  width is what fills first, which keeps the side gutters tiny while the
 *  right-hand column keeps its own fixed width.
 * ------------------------------------------------------------------ */

export const STAGE = {
  width: 1580,
  height: 889,
  /** outer breathing room kept around the frame (px, viewport space) */
  padding: 20,
  /** never scale above this — keeps the UI at a comfortable size on 4K */
  maxScale: 1.5,
} as const;

/** Vertical rhythm + column widths of the home page (px, stage space). */
export const HOME_METRICS = {
  topBar: 84,
  gutter: 18,
  hero: 356,
  greeting: 344,
  /** home is split 75% left / 25% right (see `home-split-*` in index.css) */
  split: { leftShare: 0.75, rightShare: 0.25, gutter: 14 },
} as const;
