import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ME_AUTHOR,
  PAGE_SIZE,
  threadFor,
  type Comment,
} from "../data/comments";

/* ------------------------------------------------------------------ *
 *  Comment threads, keyed by track.
 *
 *  The seeded threads in src/data/comments.ts are the starting point; every
 *  write (post, reply, fire, report, delete) lands here so the composer at
 *  the bottom of the player and the comments sheet always agree.
 * ------------------------------------------------------------------ */

type TrackState = {
  list: Comment[];
  /** how many top-level comments the list currently shows */
  visible: number;
  /** `${commentId}:${replyId}` → reason */
  reported: Record<string, string>;
};

type CommentsValue = {
  thread: Comment[];
  total: number;
  visibleThread: Comment[];
  hidden: number;
  loadMore: () => void;
  addComment: (text: string) => void;
  addReply: (parentId: string, text: string) => void;
  toggleFire: (id: string, replyId?: string) => void;
  report: (id: string, reason: string, replyId?: string) => void;
  undoReport: (id: string, replyId?: string) => void;
  remove: (id: string, replyId?: string) => void;
  reportOf: (id: string, replyId?: string) => string | null;
};

const CommentsContext = createContext<{
  stateFor: (trackId: string) => TrackState;
  update: (trackId: string, fn: (state: TrackState) => TrackState) => void;
} | null>(null);

const fresh = (trackId: string): TrackState => ({
  list: threadFor(trackId).map((c) => ({ ...c, replies: [...c.replies] })),
  visible: PAGE_SIZE,
  reported: {},
});

const key = (id: string, replyId?: string) => `${id}:${replyId ?? ""}`;

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Record<string, TrackState>>({});

  const stateFor = useCallback(
    (trackId: string): TrackState => store[trackId] ?? fresh(trackId),
    [store],
  );

  const update = useCallback(
    (trackId: string, fn: (state: TrackState) => TrackState) => {
      setStore((s) => ({ ...s, [trackId]: fn(s[trackId] ?? fresh(trackId)) }));
    },
    [],
  );

  const value = useMemo(() => ({ stateFor, update }), [stateFor, update]);

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}

/** the thread of one track, with every action bound to it */
export function useTrackComments(trackId: string): CommentsValue {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error("useTrackComments must be used inside <CommentsProvider>");

  const { stateFor, update } = ctx;
  const state = stateFor(trackId);

  const mapList = useCallback(
    (fn: (list: Comment[]) => Comment[]) => update(trackId, (s) => ({ ...s, list: fn(s.list) })),
    [trackId, update],
  );

  const mapOne = useCallback(
    (id: string, replyId: string | undefined, fn: (c: Comment) => Comment) =>
      mapList((list) =>
        list.map((c) => {
          if (replyId) {
            if (c.id !== id) return c;
            return { ...c, replies: c.replies.map((r) => (r.id === replyId ? fn(r) : r)) };
          }
          return c.id === id ? fn(c) : c;
        }),
      ),
    [mapList],
  );

  const value = useMemo<CommentsValue>(
    () => ({
      thread: state.list,
      total: state.list.length,
      visibleThread: state.list.slice(0, state.visible),
      hidden: Math.max(0, state.list.length - state.visible),
      loadMore: () =>
        update(trackId, (s) => ({ ...s, visible: Math.min(s.visible + PAGE_SIZE, s.list.length) })),

      addComment: (text: string) =>
        update(trackId, (s) => ({
          ...s,
          list: [
            {
              id: `me-${Date.now()}`,
              author: ME_AUTHOR.name,
              handle: ME_AUTHOR.handle,
              photo: ME_AUTHOR.photo,
              time: "just now",
              text,
              fires: 0,
              badge: ME_AUTHOR.badge,
              mine: true,
              replies: [],
            },
            ...s.list,
          ],
        })),

      addReply: (parentId: string, text: string) =>
        mapOne(parentId, undefined, (c) => ({
          ...c,
          replies: [
            ...c.replies,
            {
              id: `me-${Date.now()}`,
              author: ME_AUTHOR.name,
              handle: ME_AUTHOR.handle,
              photo: ME_AUTHOR.photo,
              time: "just now",
              text,
              fires: 0,
              badge: ME_AUTHOR.badge,
              mine: true,
              replies: [],
            },
          ],
        })),

      toggleFire: (id: string, replyId?: string) =>
        mapOne(id, replyId, (c) => ({
          ...c,
          fires: c.fires + (c.fired ? -1 : 1),
          fired: !c.fired,
        })),

      report: (id: string, reason: string, replyId?: string) =>
        update(trackId, (s) => ({ ...s, reported: { ...s.reported, [key(id, replyId)]: reason } })),

      undoReport: (id: string, replyId?: string) =>
        update(trackId, (s) => {
          const next = { ...s.reported };
          delete next[key(id, replyId)];
          return { ...s, reported: next };
        }),

      remove: (id: string, replyId?: string) =>
        mapList((list) =>
          replyId
            ? list.map((c) => (c.id === id ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) } : c))
            : list.filter((c) => c.id !== id),
        ),

      reportOf: (id: string, replyId?: string) => state.reported[key(id, replyId)] ?? null,
    }),
    [state, trackId, update, mapList, mapOne],
  );

  return value;
}
