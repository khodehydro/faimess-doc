/* ------------------------------------------------------------------ *
 *  The signed-in listener — used by the account pill and its popovers.
 * ------------------------------------------------------------------ */

import mePhoto from "../assets/photos/users/me.webp";
import { BADGES } from "./badges";
import { fanPoints, type FanActivity } from "./points";

/**
 * What this account has done: every number is chosen so the five rules in
 * data/points.ts add up to exactly the 1,840 balance the profile shows.
 */
export const ME_ACTIVITY: FanActivity = {
  listeningMinutes: 32_800,
  comments: 216,
  invites: 12,
  days: 268,
  lyricSheets: 8,
};

export const me = {
  name: "Sori",
  handle: "@sori",
  tier: "Listener · Premium",
  photo: mePhoto,
  /** the last award this account picked up — shown on the avatar crest */
  badge: BADGES.topListener,
  /** what earns this account its points — see data/points.ts */
  activity: ME_ACTIVITY,
  /** the balance those five rules add up to (approved sheets come on top) */
  points: fanPoints(ME_ACTIVITY),
};
