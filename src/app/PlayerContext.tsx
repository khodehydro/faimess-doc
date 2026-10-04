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
 *  Real audio: a single <audio> element plays the demo master that ships in
 *  src/assets/audio/ (every track points at it for now — see docs/audio.md).
 *  `position` follows the element's clock, `duration` comes from its
 *  metadata, and the element's own `ended` event rolls to the next track.
 *  Where no Audio constructor exists (SSR, exotic environments) the same
 *  controls fall back to a simulated 250ms clock, so the UI never breaks.
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
  /** true once a real <audio> element is driving the card */
  realAudio: boolean;
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

const clamp = (value: number, max: number) => Math.min(Math.max(0, value), Math.max(0, max));

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
  const [realAudio, setRealAudio] = useState(false);
  /* the element's own duration, once metadata is in */
  const [mediaDuration, setMediaDuration] = useState(0);

  /* the current track, readable from callbacks without re-creating them */
  const current = useRef<PlayerTrack | null>(initial);
  /* guards the simulated roll-over so a finished track only advances once */
  const rolled = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  /* lets the element's `ended` event call the newest `step` */
  const advance = useRef<(delta: number) => void>(() => {});

  const step = useCallback((delta: number) => {
    const from = current.current;
    const index = from ? QUEUE.findIndex((t) => t.id === from.id) : -1;
    const next = QUEUE[(index + delta + QUEUE.length) % QUEUE.length];
    if (!next) return;

    const element = audio.current;
    if (element) {
      if (element.getAttribute("src") !== next.audio) {
        element.src = next.audio;
        element.load();
        setMediaDuration(0);
      }
      try {
        element.currentTime = 0;
      } catch {
        /* metadata not in yet — the element starts at 0 anyway */
      }
      void element.play().catch(() => setPlaying(false));
    }

    current.current = next;
    rolled.current = false;
    setTrack(next);
    setPosition(0);
    setPlaying(true);
  }, []);

  advance.current = step;

  /* build the audio element once we are in a browser */
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.Audio === "undefined") return;
    if (!audio.current) {
      const element = new window.Audio();
      element.preload = "auto";
      element.src = current.current?.audio ?? QUEUE[0]?.audio ?? "";
      element.addEventListener("timeupdate", () => setPosition(element.currentTime));
      element.addEventListener("durationchange", () =>
        setMediaDuration(Number.isFinite(element.duration) ? element.duration : 0),
      );
      element.addEventListener("play", () => setPlaying(true));
      element.addEventListener("pause", () => setPlaying(false));
      element.addEventListener("ended", () => advance.current(1));
      audio.current = element;
    }
    setRealAudio(true);
  }, []);

  const duration = mediaDuration || track?.seconds || 0;

  const play = useCallback((next: PlayerTrack) => {
    const element = audio.current;
    const changed = current.current?.id !== next.id;

    if (element) {
      if (changed && element.getAttribute("src") !== next.audio) {
        element.src = next.audio;
        element.load();
        setMediaDuration(0);
      }
      if (changed) {
        try {
          element.currentTime = 0;
        } catch {
          /* ignore — playback starts from the top regardless */
        }
      }
      void element.play().catch(() => setPlaying(false));
    }

    current.current = next;
    rolled.current = false;
    setTrack(next);
    if (changed) setPosition(0);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    const element = audio.current;
    if (!current.current) {
      const first = QUEUE[0];
      if (!first) return;
      if (element) {
        element.src = first.audio;
        void element.play().catch(() => setPlaying(false));
      }
      current.current = first;
      setTrack(first);
      setPosition(0);
      setPlaying(true);
      return;
    }
    if (element) {
      if (element.paused) void element.play().catch(() => setPlaying(false));
      else element.pause();
      return;
    }
    setPlaying((p) => !p);
  }, []);

  const stop = useCallback(() => {
    const element = audio.current;
    if (element) {
      element.pause();
      try {
        element.currentTime = 0;
      } catch {
        /* nothing loaded yet */
      }
    }
    setPlaying(false);
    setPosition(0);
  }, []);

  const next = useCallback(() => step(1), [step]);

  const prev = useCallback(() => {
    /* the usual player courtesy: restart the song before stepping back */
    if (position > 4) {
      const element = audio.current;
      if (element) {
        try {
          element.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
      rolled.current = false;
      setPosition(0);
      return;
    }
    step(-1);
  }, [position, step]);

  const seek = useCallback(
    (seconds: number) => {
      const element = audio.current;
      const value = clamp(seconds, mediaDuration || current.current?.seconds || 0);
      if (element) {
        try {
          element.currentTime = value;
        } catch {
          /* metadata not in yet */
        }
      }
      rolled.current = false;
      setPosition(value);
    },
    [mediaDuration],
  );

  const toggleLike = useCallback((id: string) => {
    setLiked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }, []);

  /* the fallback clock — only when there is no audio element to follow */
  useEffect(() => {
    if (realAudio || !playing || !track) return;
    const id = window.setInterval(() => {
      setPosition((p) => Math.min(p + 0.25, track.seconds));
    }, 250);
    return () => window.clearInterval(id);
  }, [realAudio, playing, track]);

  /* …and the matching roll-over (the element fires `ended` for us) */
  useEffect(() => {
    if (realAudio || !playing || !track || position < track.seconds || rolled.current) return;
    rolled.current = true;
    step(1);
  }, [realAudio, position, playing, track, step]);

  const value = useMemo<PlayerValue>(
    () => ({
      track,
      playing,
      position,
      duration,
      progress: duration ? Math.min(position / duration, 1) : 0,
      queue: QUEUE,
      liked,
      realAudio,
      play,
      toggle,
      next,
      prev,
      seek,
      stop,
      toggleLike,
    }),
    [
      track,
      playing,
      position,
      duration,
      liked,
      realAudio,
      play,
      toggle,
      next,
      prev,
      seek,
      stop,
      toggleLike,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
