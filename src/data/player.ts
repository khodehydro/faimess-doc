/* ------------------------------------------------------------------ *
 *  Player data — the queue the right-hand card plays from.
 *
 *  Every entry already exists in the feed (newest songs / trending), so a
 *  play button anywhere in the app hands the player the same track object
 *  the shelf is showing. Two songs are listed twice in the feed — once as a
 *  new release and once as a trend — and the queue keeps one of each.
 * ------------------------------------------------------------------ */

import demoAudio from "../assets/audio/faimess-demo.mp3";
import { albums } from "./library";
import longExposurePhoto from "../assets/photos/albums/long-exposure.webp";
import paperBoatsPhoto from "../assets/photos/albums/paper-boats.webp";
import slowMotionPhoto from "../assets/photos/albums/slow-motion.webp";
import { newestTracks, trendingTracks } from "./feed";
import { LYRICS, type LyricLine } from "./lyrics";

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  /** the record it came from ("· single" for one-offs) */
  album: string;
  seconds: number;
  photo: string;
  /** the file the <audio> element plays — one demo master for every track */
  audio: string;
  /** lifetime streams, shown compact in the player header ("2.4M") */
  plays: number;
};

/** "3:12" → 192 */
export function toSeconds(duration: string): number {
  const [m, s] = duration.split(":").map((n) => Number.parseInt(n, 10));
  return (m || 0) * 60 + (s || 0);
}

/** which record each track belongs to — mirrors the shelf artwork */
const ALBUM_OF: Record<string, string> = {
  nt1: "Afterglow",
  nt2: "Midnight Seoul · single",
  nt3: "Paper Heart · single",
  nt4: "Neon Bloom · single",
  nt5: "Velvet Static",
  nt6: "Tokyo Window",
  tr3: "Cherry Static · single",
  tr5: "Nightbloom",
  tr6: "Blue Hour",
};

/** trending rows that repeat a song the newest shelf already has */
const SAME_SONG: Record<string, string> = { tr1: "nt2", tr2: "nt1", tr4: "nt3" };

type FeedTrack = (typeof newestTracks)[number] | (typeof trendingTracks)[number];

/**
 * Lifetime streams per track. Demo figures with the shape of real ones — the
 * leaders are in the millions, album cuts in the tens of thousands. A track
 * that isn't listed still gets a stable number, so a new song can never
 * leave the header blank.
 */
const PLAYS: Record<string, number> = {
  nt1: 2_431_902,
  nt2: 1_876_540,
  nt3: 1_204_318,
  nt4: 942_770,
  nt5: 688_215,
  nt6: 512_406,
  tr3: 734_920,
  tr5: 421_388,
  tr6: 265_140,
  pb1: 96_450,
  le1: 74_220,
  sm1: 58_930,
};

/** a stable fallback so `plays` is never missing (id-sum based, not random) */
const playsFor = (t: FeedTrack): number =>
  PLAYS[t.id] ??
  8_000 + [...t.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 1_211 + t.title.length * 977;

const fromTrack = (t: FeedTrack): PlayerTrack => ({
  id: t.id,
  title: t.title,
  artist: t.artist,
  album: ALBUM_OF[t.id] ?? "FAIMESS",
  seconds: toSeconds(t.duration),
  photo: t.photo,
  /* one synthesised master stands in for the whole queue — docs/audio.md */
  audio: demoAudio,
  plays: playsFor(t),
});

const isSameSong = (a: FeedTrack, b: FeedTrack) => a.title === b.title && a.artist === b.artist;

/** older album cuts — reachable from the rail's "Up next" list */
const DEEP_CUTS: PlayerTrack[] = [
  {
    id: "pb1",
    title: "Paper Boats",
    artist: "SEORA",
    album: "Paper Boats",
    seconds: 224,
    photo: paperBoatsPhoto,
    audio: demoAudio,
    plays: 96_450,
  },
  {
    id: "le1",
    title: "Long Exposure",
    artist: "AXION",
    album: "Long Exposure",
    seconds: 252,
    photo: longExposurePhoto,
    audio: demoAudio,
    plays: 74_220,
  },
  {
    id: "sm1",
    title: "Slow Motion",
    artist: "LUNEX",
    album: "Slow Motion",
    seconds: 202,
    photo: slowMotionPhoto,
    audio: demoAudio,
    plays: 58_930,
  },
];

/** the queue: the newest songs first, then the trends that aren't in it yet */
export const QUEUE: PlayerTrack[] = [
  ...newestTracks.map(fromTrack),
  ...trendingTracks.filter((t) => !newestTracks.some((n) => isSameSong(n, t))).map(fromTrack),
  /* album cuts the shelves don't carry — and the only ones without a lyric
     sheet yet, so "send the lyrics" has somewhere to show up */
  ...DEEP_CUTS,
];

const BY_ID = new Map(QUEUE.map((t) => [t.id, t]));

/** accepts a shelf id too, so every play button in the app resolves */
export const trackById = (id: string): PlayerTrack | null =>
  BY_ID.get(id) ?? BY_ID.get(SAME_SONG[id] ?? "") ?? null;

/** the track an artist's play button should start — one lead single each */
const LEAD_TRACK: Record<string, string> = {
  NOVAE: "nt1",
  SEORA: "nt3",
  AXION: "nt2",
  LUNEX: "nt4",
  PRISM9: "nt5",
  "VELVET MOON": "tr5",
  HANEUL: "nt6",
  KAIROS: "tr6",
};

export const leadTrackFor = (artist: string): PlayerTrack | null => trackById(LEAD_TRACK[artist] ?? "");

/** the record an artist's lead track belongs to, for the "play album" affordance */
export const leadAlbumFor = (artist: string) => {
  const lead = leadTrackFor(artist);
  return (
    albums.find((a) => a.artist === artist && a.title === lead?.album) ??
    albums.find((a) => a.artist === artist) ??
    null
  );
};

/** the editorial lyric sheet — null means nobody has sent one yet */
export function lyricsFor(track: PlayerTrack | null): LyricLine[] | null {
  if (!track) return null;
  return LYRICS[track.id] ?? null;
}

/** "1:04" — the seek bar's clock */
export const mmss = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
};

/** index of the lyric line playing at `position` */
export function activeLineIndex(lines: LyricLine[], position: number): number {
  let index = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (position >= lines[i].at) index = i;
    else break;
  }
  return index;
}
