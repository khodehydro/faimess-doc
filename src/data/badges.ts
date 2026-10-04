/* ------------------------------------------------------------------ *
 *  Awards — the crest a fan (or an artist) wears on their avatar.
 *  “The last badge you earned” is the one that shows, so the catalog is
 *  ordered from the rarest down.
 * ------------------------------------------------------------------ */

export type BadgeTone = "primary" | "mint" | "flame" | "teal";

export type CommentBadge = {
  icon: string;
  label: string;
  tone: BadgeTone;
};

export const BADGES = {
  topListener: { icon: "crown", label: "Top listener · Season 12", tone: "flame" },
  chart: { icon: "trend", label: "Weekly chart #1", tone: "primary" },
  fanOfMonth: { icon: "star", label: "Fan of the month", tone: "mint" },
  streak: { icon: "bolt", label: "30-day comeback streak", tone: "teal" },
  artist: { icon: "verified", label: "Verified artist", tone: "primary" },
  moderator: { icon: "medal", label: "Community moderator", tone: "teal" },
  rookie: { icon: "sparkle", label: "Rookie of the week", tone: "mint" },
} as const satisfies Record<string, CommentBadge>;
