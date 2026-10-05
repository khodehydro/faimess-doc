/* ------------------------------------------------------------------ *
 *  Awards — the crest a fan (or an artist) wears on their avatar.
 *  “The last badge you earned” is the one that shows, so the catalog is
 *  ordered from the rarest down.
 * ------------------------------------------------------------------ */

import type { IconName } from "../ui/Icon";

export type BadgeTone = "primary" | "mint" | "flame" | "teal";

export type CommentBadge = {
  icon: IconName;
  /** the English label — the source of truth, as in data/i18n.ts */
  label: string;
  /** the same label, translated by the interface language */
  labelKey: string;
  tone: BadgeTone;
};

export const BADGES = {
  topListener: {
    icon: "crown",
    label: "Top listener · Season 12",
    labelKey: "badge.topListener",
    tone: "flame",
  },
  chart: { icon: "trend", label: "Weekly chart #1", labelKey: "badge.chart", tone: "primary" },
  fanOfMonth: { icon: "star", label: "Fan of the month", labelKey: "badge.fanOfMonth", tone: "mint" },
  streak: { icon: "bolt", label: "30-day comeback streak", labelKey: "badge.streak", tone: "teal" },
  artist: { icon: "verified", label: "Verified artist", labelKey: "badge.artist", tone: "primary" },
  moderator: {
    icon: "medal",
    label: "Community moderator",
    labelKey: "badge.moderator",
    tone: "teal",
  },
  rookie: { icon: "sparkle", label: "Rookie of the week", labelKey: "badge.rookie", tone: "mint" },
} as const satisfies Record<string, CommentBadge>;
