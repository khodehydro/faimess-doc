/* ------------------------------------------------------------------ *
 *  Feed data — the home feed (K-pop streaming dashboard).
 *  Every shelf on the home feed reads from here; artists and albums come
 *  straight from data/library.ts so the whole app shares one roster.
 * ------------------------------------------------------------------ */

import type { SceneKey } from "../ui/Scenes";
import { artists } from "./library";

import afterglowPhoto from "../assets/photos/albums/afterglow.webp";
import midnightSeoulPhoto from "../assets/photos/albums/midnight-seoul.webp";
import paperHeartPhoto from "../assets/photos/albums/paper-heart.webp";
import neonBloomPhoto from "../assets/photos/albums/neon-bloom.webp";
import cherryStaticPhoto from "../assets/photos/albums/cherry-static.webp";
import velvetStaticPhoto from "../assets/photos/albums/velvet-static.webp";
import tokyoWindowPhoto from "../assets/photos/albums/tokyo-window.webp";
import nightbloomPhoto from "../assets/photos/albums/nightbloom.webp";
import blueHourPhoto from "../assets/photos/albums/blue-hour.webp";

import yunhaPhoto from "../assets/photos/users/yunha.webp";
import misoPhoto from "../assets/photos/users/miso.webp";
import taehyunPhoto from "../assets/photos/users/taehyun.webp";
import seojinPhoto from "../assets/photos/users/seojin.webp";
import haruPhoto from "../assets/photos/users/haru.webp";
import jxnniePhoto from "../assets/photos/users/jxnnie.webp";
import minhoPhoto from "../assets/photos/users/minho.webp";
import ariPhoto from "../assets/photos/users/ari.webp";

/* ------------------------- followed artists ------------------------- */

/** Shelf 1 — every artist in the roster the listener follows. */
export const followedArtists = artists.filter((a) => a.following);

/* --------------------------- newest songs --------------------------- */

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  ago: string;
  seed: number;
  photo: string;
  isNew?: boolean;
};

export const newestTracks: Track[] = [
  { id: "nt1", title: "Afterglow", artist: "NOVAE", duration: "3:12", ago: "12 min ago", seed: 0, photo: afterglowPhoto, isNew: true },
  { id: "nt2", title: "Midnight Seoul", artist: "AXION", duration: "3:28", ago: "40 min ago", seed: 4, photo: midnightSeoulPhoto, isNew: true },
  { id: "nt3", title: "Paper Heart", artist: "SEORA", duration: "2:58", ago: "1 hr ago", seed: 2, photo: paperHeartPhoto },
  { id: "nt4", title: "Neon Bloom", artist: "LUNEX", duration: "3:05", ago: "2 hrs ago", seed: 1, photo: neonBloomPhoto },
  { id: "nt5", title: "Halo Drive", artist: "PRISM9", duration: "3:41", ago: "3 hrs ago", seed: 3, photo: velvetStaticPhoto },
  { id: "nt6", title: "Silver Hour", artist: "HANEUL", duration: "4:02", ago: "5 hrs ago", seed: 6, photo: tokyoWindowPhoto },
];

/* -------------------------- trending songs -------------------------- */

export type TrendingTrack = Track & {
  /** number of users who hit the fire button */
  fires: number;
  /** change versus yesterday, in percent */
  delta: number;
};

export const trendingTracks: TrendingTrack[] = [
  { id: "tr1", title: "Midnight Seoul", artist: "AXION", duration: "3:28", ago: "today", seed: 4, photo: midnightSeoulPhoto, fires: 18420, delta: 128 },
  { id: "tr2", title: "Afterglow", artist: "NOVAE", duration: "3:12", ago: "today", seed: 0, photo: afterglowPhoto, fires: 15260, delta: 96 },
  { id: "tr3", title: "Cherry Static", artist: "PRISM9", duration: "3:19", ago: "today", seed: 3, photo: cherryStaticPhoto, fires: 12840, delta: 64 },
  { id: "tr4", title: "Paper Heart", artist: "SEORA", duration: "2:58", ago: "yesterday", seed: 2, photo: paperHeartPhoto, fires: 9740, delta: 41 },
  { id: "tr5", title: "Gravity", artist: "VELVET MOON", duration: "3:36", ago: "yesterday", seed: 7, photo: nightbloomPhoto, fires: 7310, delta: 18 },
  { id: "tr6", title: "Blue Signal", artist: "KAIROS", duration: "3:02", ago: "2 days ago", seed: 5, photo: blueHourPhoto, fires: 5120, delta: 9 },
];

/* ------------------------------- news ------------------------------- */

export type NewsItem = {
  id: string;
  title: string;
  tag: "Comeback" | "Tour" | "Charts" | "Editorial" | "Awards";
  source: string;
  ago: string;
  scene: SceneKey;
  seed: number;
  excerpt: string;
};

/** Editorial cards stay illustrated on purpose — a drawn desk, not a photo feed. */
export const newsItems: NewsItem[] = [
  {
    id: "nw1",
    title: "NOVAE announce first world tour “Afterglow”",
    tag: "Tour",
    source: "FAIMESS Desk",
    ago: "2 hrs ago",
    scene: "sunset",
    seed: 0,
    excerpt: "Twelve cities across Asia, Europe and North America, with the Seoul opener streaming live.",
  },
  {
    id: "nw2",
    title: "AXION’s “Midnight Seoul” tops the global chart",
    tag: "Charts",
    source: "Chart Watch",
    ago: "5 hrs ago",
    scene: "camping",
    seed: 4,
    excerpt: "The lead single climbs to #1 in nine markets and breaks the group’s first-week record.",
  },
  {
    id: "nw3",
    title: "SEORA teases her mini-album with a 20-second clip",
    tag: "Comeback",
    source: "FAIMESS Desk",
    ago: "8 hrs ago",
    scene: "coast",
    seed: 2,
    excerpt: "A midnight teaser confirms the six-track EP and a title song written with LUNEX’s producer.",
  },
  {
    id: "nw4",
    title: "PRISM9 add three dates to the Asia leg",
    tag: "Tour",
    source: "Live Wire",
    ago: "1 day ago",
    scene: "forest",
    seed: 3,
    excerpt: "Manila, Bangkok and Jakarta join the run after two sold-out nights in Tokyo.",
  },
  {
    id: "nw5",
    title: "FAIMESS Weekly: the 10 fastest-rising debuts",
    tag: "Editorial",
    source: "FAIMESS Weekly",
    ago: "1 day ago",
    scene: "sunset",
    seed: 6,
    excerpt: "Our editors rank the rookies whose first week lit up the fire counter.",
  },
  {
    id: "nw6",
    title: "Fan-voted awards: voting opens tonight",
    tag: "Awards",
    source: "FAIMESS Desk",
    ago: "2 days ago",
    scene: "camping",
    seed: 1,
    excerpt: "Six categories, seven days of voting, and a live stage for the winners.",
  },
];

/* --------------------------- active users --------------------------- */

export type FeedUser = {
  id: string;
  name: string;
  handle: string;
  points: number;
  level: number;
  streak: number;
  online?: boolean;
  seed: number;
  photo: string;
};

export const activeUsers: FeedUser[] = [
  { id: "au1", name: "Yunha", handle: "@yunha", points: 24180, level: 42, streak: 128, online: true, seed: 0, photo: yunhaPhoto },
  { id: "au2", name: "Miso K.", handle: "@miso.k", points: 21640, level: 39, streak: 96, online: true, seed: 1, photo: misoPhoto },
  { id: "au3", name: "Taehyun", handle: "@taehyun", points: 19950, level: 37, streak: 74, online: true, seed: 2, photo: taehyunPhoto },
  { id: "au4", name: "Seojin", handle: "@seojin", points: 18320, level: 34, streak: 61, seed: 3, photo: seojinPhoto },
  { id: "au5", name: "Haru", handle: "@haru", points: 16780, level: 31, streak: 48, online: true, seed: 4, photo: haruPhoto },
  { id: "au6", name: "Jxnnie", handle: "@jxnnie", points: 15410, level: 29, streak: 33, seed: 5, photo: jxnniePhoto },
  { id: "au7", name: "Minho", handle: "@minho", points: 14120, level: 27, streak: 25, seed: 6, photo: minhoPhoto },
  { id: "au8", name: "Ari", handle: "@ari", points: 12980, level: 24, streak: 19, seed: 7, photo: ariPhoto },
];
