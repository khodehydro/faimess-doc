/* ------------------------------------------------------------------ *
 *  The signed-in listener — used by the account pill and its popovers.
 * ------------------------------------------------------------------ */

import mePhoto from "../assets/photos/users/me.webp";
import { BADGES } from "./badges";

export const me = {
  name: "Sori",
  handle: "@sori",
  tier: "Listener · Premium",
  photo: mePhoto,
  /** the last award this account picked up — shown on the avatar crest */
  badge: BADGES.topListener,
  /** fan points balance — approved contributions add to it */
  points: 1840,
};
