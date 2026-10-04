import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { QUEUE, trackById, type PlayerTrack } from "../data/player";

/* ------------------------------------------------------------------ *
 *  Playback state for the right-hand player card.
 *
 *  The demo has no audio engine yet, so the clock is simulated: while
 *  `playing` is true a light interval advances `position`, which drives the
 *  seek bar and the highlighted lyric line. Swapping in a real <audio>
 *  element later means replacing that one effect — nothing else moves.
 * ------------------------------------------------------------------ */

type PlayerValue = {
  track: PlayerTrack | null;
  playing: boolean;
  /** seconds into the current track */
  position: number;
  duration: number;
  /** 0 → 1, for the seek bar */
  progress: number;
  queue: PlayerTrack[];
  /** ids the listener hearted — the rail's "Liked songs" panel reads this */
  liked: string[];
  play: (track: PlayerTrack) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
  toggleLike: (id: string) => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

/** a demo starts with a couple of favourites so the panel isn't empty */
const SEED_LIKES = ["nt1", "tr3", "tr5"];

/**
 * `initialTrackId` preloads the card (paused) — used by the SSR smoke check
 * today, and the hook a deep link like `#/home?track=nt1` would use later.
 */
export function PlayerProvider({
  children,
  initialTrackId,
}: {
  children: ReactNode;
  initialTrackId?: string;
}) {
  const initial = initialTrackId ? trackById(initialTrackId) : null;
  const [track, setTrack] = useState<PlayerTrack | null>(initial);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [liked, setLiked] = useState<string[]>(SEED_LIKES);

  /* the current track, readable from callbacks without re-creating them */
  const current = useRef<PlayerTrack | null>(initial);
  /* guards auto-advance so a finished track only rolls over once */
  const rolled = useRef(false);

  const duration = track?.seconds ?? 0;

  const load = useCallback((next: PlayerTrack) => {
    if (current.current?.id === next.id) return;
    current.current = next;
    rolled.current = false;
    setTrack(next);
    setPosition(0);
  }, []);

  const play = useCallback(
    (next: PlayerTrack) => {
      load(next);
      setPlaying(true);
    },
    [load],
  );

  const toggle = useCallback(() => {
    if (!current.current) {
      const first = QUEUE[0];
      if (!first) return;
      load(first);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }, [load]);

  const stop = useCallback(() => {
    setPlaying(false);
    setPosition(0);
  }, []);

  const step = useCallback(
    (delta: number) => {
      const from = current.current;
      const index = from ? QUEUE.findIndex((t) => t.id === from.id) : -1;
      const next = QUEUE[(index + delta + QUEUE.length) % QUEUE.length];
      if (!next) return;
      load(next);
      setPlaying(true);
    },
    [load],
  );

  const next = useCallback(() => step(1), [step]);

  const prev = useCallback(() => {
    /* the usual player courtesy: restart the song before stepping back */
    if (position > 4) {
      rolled.current = false;
      setPosition(0);
      return;
    }
    step(-1);
  }, [position, step]);

  const seek = useCallback((seconds: number) => {
    rolled.current = false;
    setPosition(Math.min(Math.max(0, seconds), current.current?.seconds ?? 0));
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }, []);

  /* the simulated clock */
  useEffect(() => {
    if (!playing || !track) return;
    const id = window.setInterval(() => {
      setPosition((p) => Math.min(p + 0.25, track.seconds));
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, track]);

  /* the track ran out → roll on */
  useEffect(() => {
    if (!playing || !track || position < track.seconds || rolled.current) return;
    rolled.current = true;
    step(1);
  }, [position, playing, track, step]);

  const value = useMemo<PlayerValue>(
    () => ({
      track,
      playing,
      position,
      duration,
      progress: duration ? Math.min(position / duration, 1) : 0,
      queue: QUEUE,
      liked,
      play,
      toggle,
      next,
      prev,
      seek,
      stop,
      toggleLike,
    }),
    [track, playing, position, duration, liked, play, toggle, next, prev, seek, stop, toggleLike],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
