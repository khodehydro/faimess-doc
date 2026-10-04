/* ------------------------------------------------------------------ *
 *  The stage — one fixed art-board the whole desktop UI is drawn on.
 *  Everything inside is authored in these exact pixels; the stage is
 *  then uniformly scaled to fit the viewport, so the composition never
 *  reflows and the page never scrolls on desktop.
 * ------------------------------------------------------------------ */

export const STAGE = {
  width: 1320,
  height: 930,
  /** outer breathing room kept around the frame (px, viewport space) */
  padding: 36,
  /** never scale above this — keeps the UI at a comfortable size on 4K */
  maxScale: 1.4,
} as const;

/** Vertical rhythm of the home page (px, stage space). */
export const HOME_METRICS = {
  topBar: 84,
  gutter: 18,
  hero: 372,
  greeting: 330,
} as const;
