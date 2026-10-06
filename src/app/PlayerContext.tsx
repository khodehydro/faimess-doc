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

/**
 * Where a run of playback came from.
 *
 * The player numbers what is playing against this, so "6 / 9" in the header
 * means the sixth row of the list the listener clicked — a playlist, an
 * album or an artist — instead of the sixth row of the whole demo queue.
 * The page itself is just another source (the full queue), which is why the
 * old 12 / 12 behaviour still shows up when playback starts from the feed.
 */
export type QueueSource = {
  type: "page" | "album" | "artist" | "playlist";
  /** what the run is called, for the queue panel later on */
  label: string;
  trackIds: string[];
};

export type RepeatMode = "off" | "all" | "one";

type PlayerValue = {
  track: PlayerTrack | null;
  playing: boolean;
  /** seconds into the current track */
  position: number;
  duration: number;
  /** 0 → 1, for the seek bar */
  progress: number;
  queue: PlayerTrack[];
  /** the current track's row inside `queue`, or -1 if it is not in it */
  queueIndex: number;
  /** ids the listener hearted — the rail's "Liked songs" panel reads this */
  liked: string[];
  likedAlbums: string[];
  likedPlaylists: string[];
  /** true once a real <audio> element is driving the card */
  realAudio: boolean;
  repeat: RepeatMode;
  play: (track: PlayerTrack, from?: QueueSource) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  stop: () => void;
  toggleLike: (id: string) => void;
  toggleLikeAlbum: (id: string) => void;
  toggleLikePlaylist: (id: string) => void;
  isAlbumLiked: (id: string) => boolean;
  isPlaylistLiked: (id: string) => boolean;
  isTrackLiked: (id: string) => boolean;
  toggleRepeat: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

/** the whole demo queue — what plays when nothing more specific was clicked */
const PAGE_SOURCE: QueueSource = {
  type: "page",
  label: "",
  trackIds: QUEUE.map((track) => track.id),
};

/** a demo starts with a couple of favourites so the panel isn't empty */
const SEED_LIKES = ["nt1", "tr3", "tr5"];
const SEED_LIKED_ALBUMS = ["al-afterglow", "al-cherry-static", "al-blue-hour"];
const SEED_LIKED_PLAYLISTS = ["pl-midnight-drive", "p1"];

function readLikedStorage(key: string, fallback: string[]): string[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

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
  const [liked, setLiked] = useState<string[]>(() => readLikedStorage("faimess.liked_tracks", SEED_LIKES));
  const [likedAlbums, setLikedAlbums] = useState<string[]>(() => readLikedStorage("faimess.liked_albums", SEED_LIKED_ALBUMS));
  const [likedPlaylists, setLikedPlaylists] = useState<string[]>(() => readLikedStorage("faimess.liked_playlists", SEED_LIKED_PLAYLISTS));
  /* which list the current run belongs to — see QueueSource above */
  const [source, setSource] = useState<QueueSource>(PAGE_SOURCE);
  const [realAudio, setRealAudio] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  /* the element's own duration, once metadata is in */
  const [mediaDuration, setMediaDuration] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("faimess.liked_tracks", JSON.stringify(liked));
      } catch {}
    }
  }, [liked]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("faimess.liked_albums", JSON.stringify(likedAlbums));
      } catch {}
    }
  }, [likedAlbums]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("faimess.liked_playlists", JSON.stringify(likedPlaylists));
      } catch {}
    }
  }, [likedPlaylists]);

  const repeatRef = useRef<RepeatMode>("off");
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const toggleRepeat = useCallback(() => {
    setRepeat((curr) => {
      if (curr === "off") return "all";
      if (curr === "all") return "one";
      return "off";
    });
  }, []);

  /* the queue the player owns right now, in the order it will play */
  const queue = useMemo<PlayerTrack[]>(() => {
    const list = source.trackIds
      .map((id) => trackById(id))
      .filter((track): track is PlayerTrack => !!track);
    return list.length ? list : QUEUE;
  }, [source]);

  /* the current track, readable from callbacks without re-creating them */
  const current = useRef<PlayerTrack | null>(initial);
  /* …and the same trick for the queue: `step` is called from the audio
     element's own `ended` event, so it cannot wait for a re-render */
  const activeQueue = useRef<PlayerTrack[]>(QUEUE);
  /* guards the simulated roll-over so a finished track only advances once */
  const rolled = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  /* lets the element's `ended` event call the newest `step` */
  const advance = useRef<(delta: number) => void>(() => {});

  const step = useCallback((delta: number) => {
    const list = activeQueue.current;
    const from = current.current;
    const found = from ? list.findIndex((t) => t.id === from.id) : -1;
    /* a track that is not in this run starts it from the top */
    const index = found < 0 ? 0 : found;
    const next = list[(index + delta + list.length) % list.length] ?? list[0];
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

  const handleEnded = useCallback(() => {
    if (repeatRef.current === "one") {
      const element = audio.current;
      if (element) {
        try {
          element.currentTime = 0;
        } catch {
          // ignore
        }
        void element.play().catch(() => setPlaying(false));
      }
      setPosition(0);
      setPlaying(true);
      return;
    }
    const list = activeQueue.current;
    const from = current.current;
    const found = from ? list.findIndex((t) => t.id === from.id) : -1;
    const index = found < 0 ? 0 : found;
    const isLast = index >= list.length - 1;

    if (repeatRef.current === "off" && isLast) {
      setPlaying(false);
      return;
    }
    step(1);
  }, [step]);

  advance.current = handleEnded;

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

  useEffect(() => {
    activeQueue.current = queue;
  }, [queue]);

  const duration = mediaDuration || track?.seconds || 0;

  const play = useCallback((next: PlayerTrack, from?: QueueSource) => {
    const element = audio.current;
    const changed = current.current?.id !== next.id;

    /* an explicit source wins; a loose play (a feed row, say) keeps the
       current run if the song is in it and falls back to the page queue */
    setSource((prev) =>
      from ?? (prev.trackIds.includes(next.id) ? prev : PAGE_SOURCE),
    );

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
      const first = activeQueue.current[0] ?? QUEUE[0];
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

  const toggleLikeAlbum = useCallback((id: string) => {
    setLikedAlbums((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }, []);

  const toggleLikePlaylist = useCallback((id: string) => {
    setLikedPlaylists((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }, []);

  const isAlbumLiked = useCallback((id: string) => likedAlbums.includes(id), [likedAlbums]);
  const isPlaylistLiked = useCallback((id: string) => likedPlaylists.includes(id), [likedPlaylists]);
  const isTrackLiked = useCallback((id: string) => liked.includes(id), [liked]);

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
    handleEnded();
  }, [realAudio, position, playing, track, handleEnded]);

  const queueIndex = track ? queue.findIndex((t) => t.id === track.id) : -1;

  const value = useMemo<PlayerValue>(
    () => ({
      track,
      playing,
      position,
      duration,
      progress: duration ? Math.min(position / duration, 1) : 0,
      queue,
      queueIndex,
      liked,
      likedAlbums,
      likedPlaylists,
      realAudio,
      repeat,
      play,
      toggle,
      next,
      prev,
      seek,
      stop,
      toggleLike,
      toggleLikeAlbum,
      toggleLikePlaylist,
      isAlbumLiked,
      isPlaylistLiked,
      isTrackLiked,
      toggleRepeat,
    }),
    [
      track,
      playing,
      position,
      duration,
      queue,
      queueIndex,
      liked,
      likedAlbums,
      likedPlaylists,
      realAudio,
      repeat,
      play,
      toggle,
      next,
      prev,
      seek,
      stop,
      toggleLike,
      toggleLikeAlbum,
      toggleLikePlaylist,
      isAlbumLiked,
      isPlaylistLiked,
      isTrackLiked,
      toggleRepeat,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
