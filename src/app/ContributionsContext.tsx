import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { me } from "../data/account";
import type { FanActivity } from "../data/points";
import {
  COMMUNITY_LYRICS,
  LYRIC_REWARD,
  parseSubmission,
  type LyricLine,
  type LyricSubmission,
  type LyricSubmissionStatus,
} from "../data/lyrics";

/* ------------------------------------------------------------------ *
 *  Fan contributions — lyric sheets sent to the moderators.
 *
 *  Approving is a moderator's job (the site has no admin surface yet), so
 *  the seeded example in data/lyrics.ts stands in for the finished loop:
 *  a submission that came back approved and paid out points. Everything a
 *  listener sends here lands as `pending` and shows up as such.
 * ------------------------------------------------------------------ */

type Draft = {
  trackId: string;
  trackTitle: string;
  language: string;
  original: string;
  translation: string;
  /** the track length, so untimed lines can be spread across it */
  duration: number;
};

type ContributionsValue = {
  /** every sheet this account has sent, newest first */
  submissions: LyricSubmission[];
  pendingFor: (trackId: string) => LyricSubmission | null;
  /** approved community lyrics for a track — the seeded one or a fresh approval */
  approvedFor: (trackId: string) => { lines: LyricLine[]; by: string } | null;
  send: (draft: Draft) => LyricSubmission;
  /** moderator actions — the stand-in for the admin console this build has no */
  approve: (id: string) => void;
  reject: (id: string) => void;
  /** fan points: the account's balance plus what approvals have paid out */
  points: number;
};

const ContributionsContext = createContext<ContributionsValue | null>(null);

/** the seeded approval, as if it had come back from a moderator */
const SEEDED: LyricSubmission[] = Object.entries(COMMUNITY_LYRICS).map(([trackId, entry]) => ({
  id: `seed-${trackId}`,
  trackId,
  trackTitle: "Slow Motion",
  language: "Mixed",
  lines: entry.lines.length,
  points: LYRIC_REWARD,
  status: "approved",
  sentAt: "3 days ago",
  original: entry.lines.map((l) => l.ko).join("\n"),
  translation: entry.lines.map((l) => l.fa).join("\n"),
}));

export function ContributionsProvider({ children }: { children: ReactNode }) {
  const [mine, setMine] = useState<LyricSubmission[]>([]);

  const submissions = useMemo(() => [...mine, ...SEEDED], [mine]);

  const send = useCallback((draft: Draft) => {
    const entry: LyricSubmission = {
      id: `sub-${Date.now()}`,
      trackId: draft.trackId,
      trackTitle: draft.trackTitle,
      language: draft.language,
      lines: parseSubmission(draft.original, draft.translation, draft.duration).length,
      points: LYRIC_REWARD,
      status: "pending",
      sentAt: "just now",
      original: draft.original,
      translation: draft.translation,
    };
    setMine((list) => [entry, ...list]);
    return entry;
  }, []);

  const decide = useCallback((id: string, status: LyricSubmissionStatus) => {
    setMine((list) => list.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  const approve = useCallback((id: string) => decide(id, "approved"), [decide]);
  const reject = useCallback((id: string) => decide(id, "rejected"), [decide]);

  const value = useMemo<ContributionsValue>(() => {
    const pendingFor = (trackId: string) =>
      submissions.find((s) => s.trackId === trackId && s.status === "pending") ?? null;

    const approvedFor = (trackId: string): { lines: LyricLine[]; by: string } | null => {
      const seeded = COMMUNITY_LYRICS[trackId];
      if (seeded) return { lines: seeded.lines, by: seeded.by };
      const approved = submissions.find((s) => s.trackId === trackId && s.status === "approved");
      if (!approved) return null;
      return { lines: parseSubmission(approved.original, approved.translation, 0), by: "you" };
    };

    /* the seeded approval is already part of the account's lifetime record
       (see ME_ACTIVITY in data/points.ts), so only sheets the moderators
       approve *in this session* pay out on top of the balance */
    const earned = submissions
      .filter((s) => s.status === "approved" && !s.id.startsWith("seed-"))
      .reduce((total, s) => total + s.points, 0);

    return {
      submissions,
      pendingFor,
      approvedFor,
      send,
      approve,
      reject,
      points: me.points + earned,
    };
  }, [submissions, send, approve, reject]);

  return <ContributionsContext.Provider value={value}>{children}</ContributionsContext.Provider>;
}

export function useContributions() {
  const ctx = useContext(ContributionsContext);
  if (!ctx) throw new Error("useContributions must be used inside <ContributionsProvider>");
  return ctx;
}

/**
 * The account's lifetime record (data/account.ts) with this session's
 * approvals folded in — the one place the five point rules read the "me"
 * side from, so the breakdown, the leaderboard row and the balance agree.
 */
export function useMyActivity(): FanActivity {
  const { submissions } = useContributions();
  const approvedNow = submissions.filter(
    (sheet) => sheet.status === "approved" && !sheet.id.startsWith("seed-"),
  ).length;
  return { ...me.activity, lyricSheets: me.activity.lyricSheets + approvedNow };
}
