/* ------------------------------------------------------------------ *
 *  Fan points — the five things that earn them, and what each is worth.
 *
 *  One table, one rule per line, and every balance in the app is *derived*
 *  from a listener's activity through `fanPoints()`: the leaderboard, the
 *  account pill and the breakdown panel can never drift apart. A comment is
 *  worth 0.25 and a friend who actually joined is worth 3; the rest are
 *  tuned so a heavy listener lands in the low thousands rather than the
 *  tens of thousands.
 *
 *  `days` is the membership length as the demo snapshots it — a fixed count
 *  rather than a live date diff, so every total stays reproducible.
 *
 *  This file is the economy only: the account's own record lives in
 *  data/account.ts and the listeners' records in data/feed.ts, so nothing
 *  here has to know who earns the points.
 * ------------------------------------------------------------------ */

import type { IconName } from "../ui/Icon";
import { LYRIC_REWARD } from "./lyrics";

export type PointRuleId = "listening" | "comments" | "invites" | "tenure" | "lyrics";

export type PointRule = {
  id: PointRuleId;
  icon: IconName;
  /** what earns the points */
  labelKey: string;
  /** the same thing, short enough to head a column */
  headKey: string;
  /** the rate, as a line the fan can read: “{n} per comment” */
  rateKey: string;
  /** the raw count, in its own unit */
  countKey: string;
  /** how the count prints in a table cell */
  short: "hours" | "days" | "count";
  /** points for a single unit */
  value: number;
};

/**
 * Ordered the way the panel lists them: the everyday habit first, the
 * hardest contribution last.
 *   · 1 point per 50 minutes of listening (0.02 a minute)
 *   · 0.25 a comment
 *   · 3 per friend who joined after the invite
 *   · 0.5 for every day of membership
 *   · 120 per lyric sheet the moderators approved (= LYRIC_REWARD)
 */
export const POINT_RULES: PointRule[] = [
  {
    id: "listening",
    icon: "headphones",
    labelKey: "points.listening",
    headKey: "points.head.listening",
    short: "hours",
    rateKey: "points.ratePerMinute",
    countKey: "points.countHours",
    value: 0.02,
  },
  {
    id: "comments",
    icon: "message",
    labelKey: "points.comments",
    headKey: "points.head.comments",
    short: "count",
    rateKey: "points.ratePerComment",
    countKey: "points.countComments",
    value: 0.25,
  },
  {
    id: "invites",
    icon: "users",
    labelKey: "points.invites",
    headKey: "points.head.invites",
    short: "count",
    rateKey: "points.ratePerInvite",
    countKey: "points.countInvites",
    value: 3,
  },
  {
    id: "tenure",
    icon: "calendar",
    labelKey: "points.tenure",
    headKey: "points.head.days",
    short: "days",
    rateKey: "points.ratePerDay",
    countKey: "points.countDays",
    value: 0.5,
  },
  {
    id: "lyrics",
    icon: "mic",
    labelKey: "points.lyrics",
    headKey: "points.head.lyrics",
    short: "count",
    rateKey: "points.ratePerSheet",
    countKey: "points.countSheets",
    value: LYRIC_REWARD,
  },
];

export type FanActivity = {
  /** lifetime minutes on the player */
  listeningMinutes: number;
  /** comments this account has posted */
  comments: number;
  /** friends who signed up from this fan's invite — not just clicks */
  invites: number;
  /** membership length, in days */
  days: number;
  /** lyric sheets the moderators approved */
  lyricSheets: number;
};

export const EMPTY_ACTIVITY: FanActivity = {
  listeningMinutes: 0,
  comments: 0,
  invites: 0,
  days: 0,
  lyricSheets: 0,
};

/** the count a rule reads from an activity record */
export function countFor(rule: PointRule, activity: FanActivity): number {
  switch (rule.id) {
    case "listening":
      return activity.listeningMinutes;
    case "comments":
      return activity.comments;
    case "invites":
      return activity.invites;
    case "tenure":
      return activity.days;
    case "lyrics":
      return activity.lyricSheets;
  }
}

/** two decimals, so quarter-point rules never leave float dust behind */
export function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

export type PointLine = {
  rule: PointRule;
  count: number;
  /** count × rate */
  subtotal: number;
};

export function fanLines(activity: FanActivity): PointLine[] {
  return POINT_RULES.map((rule) => {
    const count = countFor(rule, activity);
    return { rule, count, subtotal: roundPoints(count * rule.value) };
  });
}

export function fanPoints(activity: FanActivity): number {
  return roundPoints(fanLines(activity).reduce((sum, line) => sum + line.subtotal, 0));
}

/** the membership length in the unit the panel prints */
export function listenedHours(minutes: number): number {
  return Math.round(minutes / 60);
}
