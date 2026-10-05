/* ------------------------------------------------------------------ *
 *  Feed data — the home feed (K-pop streaming dashboard).
 *  Every shelf on the home feed reads from here; artists and albums come
 *  straight from data/library.ts so the whole app shares one roster.
 * ------------------------------------------------------------------ */

import type { SceneKey } from "../ui/Scenes";
import type { FanActivity } from "./points";
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
import afterimagePhoto from "../assets/photos/albums/afterimage.webp";

import yunhaPhoto from "../assets/photos/users/yunha.webp";
import misoPhoto from "../assets/photos/users/miso.webp";
import taehyunPhoto from "../assets/photos/users/taehyun.webp";
import seojinPhoto from "../assets/photos/users/seojin.webp";
import haruPhoto from "../assets/photos/users/haru.webp";
import jxnniePhoto from "../assets/photos/users/jxnnie.webp";
import minhoPhoto from "../assets/photos/users/minho.webp";
import ariPhoto from "../assets/photos/users/ari.webp";
import soraPhoto from "../assets/photos/users/sora.webp";
import jinahPhoto from "../assets/photos/users/jinah.webp";
import yunaPhoto from "../assets/photos/users/yuna.webp";

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
  /* the release that has just landed — and the one song in the feed nobody
     has sent a lyric sheet for yet, so the player's empty sheet is one
     click from home (see lyricsFor in data/player.ts) */
  { id: "nt7", title: "Afterimage", artist: "NOVAE", duration: "3:24", ago: "6 min ago", seed: 7, photo: afterimagePhoto, isNew: true },
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

export type NewsAuthor = {
  name: string;
  role: string;
  avatar: string;
  seed: number;
};

export type NewsComment = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  seed: number;
  time: string;
  text: string;
  likes: number;
};

export type NewsItem = {
  id: string;
  title: string;
  tag: "Comeback" | "Tour" | "Charts" | "Editorial" | "Awards";
  source: string;
  ago: string;
  scene: SceneKey;
  seed: number;
  excerpt: string;
  photo: string;
  author: NewsAuthor;
  likes: number;
  views: number;
  commentsCount: number;
  bodyKeys: string[];
  comments: NewsComment[];
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
    photo: afterglowPhoto,
    author: { name: "Mina Park", role: "Tour Reporter", avatar: soraPhoto, seed: 1 },
    likes: 3420,
    views: 28400,
    commentsCount: 142,
    bodyKeys: ["news.nw1.p1", "news.nw1.p2", "news.nw1.p3"],
    comments: [
      { id: "c1", author: "Minho", handle: "@minho_k", avatar: minhoPhoto, seed: 3, time: "1 hr ago", text: "Finally KSPO Dome! Getting tickets is going to be a warzone but I will be there.", likes: 38 },
      { id: "c2", author: "Yuna", handle: "@yuna_music", avatar: yunaPhoto, seed: 5, time: "45 min ago", text: "Streaming the opener live in 4K on FAIMESS? Absolutely legendary.", likes: 24 },
      { id: "c3", author: "Seojin", handle: "@seojin99", avatar: seojinPhoto, seed: 4, time: "20 min ago", text: "Milan and Tokyo on the same run! This staging is going to be massive.", likes: 15 },
    ],
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
    photo: midnightSeoulPhoto,
    author: { name: "Daniel Kim", role: "Charts Analyst", avatar: seojinPhoto, seed: 4 },
    likes: 4180,
    views: 34100,
    commentsCount: 189,
    bodyKeys: ["news.nw2.p1", "news.nw2.p2", "news.nw2.p3"],
    comments: [
      { id: "c4", author: "Miso", handle: "@miso_vibes", avatar: misoPhoto, seed: 2, time: "3 hrs ago", text: "Midnight Seoul on repeat all day! The synth bass in the second chorus is unreal.", likes: 52 },
      { id: "c5", author: "Haru", handle: "@haru_beats", avatar: haruPhoto, seed: 7, time: "2 hrs ago", text: "#1 in nine markets is huge. AXION truly broke through globally this comeback.", likes: 41 },
    ],
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
    photo: paperHeartPhoto,
    author: { name: "Ha-neul Lee", role: "Comeback Desk", avatar: yunhaPhoto, seed: 2 },
    likes: 2890,
    views: 22600,
    commentsCount: 97,
    bodyKeys: ["news.nw3.p1", "news.nw3.p2", "news.nw3.p3"],
    comments: [
      { id: "c6", author: "Ari", handle: "@ari_sound", avatar: ariPhoto, seed: 6, time: "5 hrs ago", text: "SEORA's vocals with LUNEX's producer? This is going to be the EP of the year.", likes: 33 },
      { id: "c7", author: "Jinah", handle: "@jinah_p", avatar: jinahPhoto, seed: 1, time: "4 hrs ago", text: "That 20 second clip had better production than most full music videos. Pre-saving right away!", likes: 19 },
    ],
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
    photo: tokyoWindowPhoto,
    author: { name: "Kenji Sato", role: "Tour Correspondent", avatar: minhoPhoto, seed: 3 },
    likes: 2150,
    views: 18900,
    commentsCount: 68,
    bodyKeys: ["news.nw4.p1", "news.nw4.p2", "news.nw4.p3"],
    comments: [
      { id: "c8", author: "Taehyun", handle: "@taehyun_t", avatar: taehyunPhoto, seed: 0, time: "18 hrs ago", text: "Manila fans have been waiting for two years! The hype is through the roof.", likes: 27 },
      { id: "c9", author: "Jxnnie", handle: "@jxnnie", avatar: jxnniePhoto, seed: 5, time: "12 hrs ago", text: "Need the Bangkok tickets so badly. Saitama Arena was already peak energy.", likes: 14 },
    ],
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
    photo: neonBloomPhoto,
    author: { name: "Soo-jin Cho", role: "Editorial Writer", avatar: misoPhoto, seed: 6 },
    likes: 1720,
    views: 14300,
    commentsCount: 52,
    bodyKeys: ["news.nw5.p1", "news.nw5.p2", "news.nw5.p3"],
    comments: [
      { id: "c10", author: "Haru", handle: "@haru_beats", avatar: haruPhoto, seed: 7, time: "20 hrs ago", text: "The rookie roster this year is so versatile. Fresh sounds everywhere.", likes: 18 },
    ],
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
    photo: velvetStaticPhoto,
    author: { name: "Yuna Song", role: "Awards Desk", avatar: taehyunPhoto, seed: 5 },
    likes: 3890,
    views: 31200,
    commentsCount: 215,
    bodyKeys: ["news.nw6.p1", "news.nw6.p2", "news.nw6.p3"],
    comments: [
      { id: "c11", author: "Minho", handle: "@minho_k", avatar: minhoPhoto, seed: 3, time: "1 day ago", text: "Cast my votes for Artist of the Year and Viral Stage! Make sure everyone votes daily.", likes: 64 },
      { id: "c12", author: "Miso", handle: "@miso_vibes", avatar: misoPhoto, seed: 2, time: "1 day ago", text: "The collaborative stage announcement has me so excited. Let's get our faves that trophy!", likes: 45 },
    ],
  },
];

/* --------------------------- active users --------------------------- */

export type FeedUser = {
  id: string;
  name: string;
  handle: string;
  /** what earns this fan their points — the totals are derived from it */
  activity: FanActivity;
  level: number;
  streak: number;
  online?: boolean;
  seed: number;
  photo: string;
};

export const activeUsers: FeedUser[] = [
  {
    id: "au1",
    name: "Yunha",
    handle: "@yunha",
    activity: { listeningMinutes: 40_150, comments: 1_356, invites: 145, days: 242, lyricSheets: 6 },
    level: 42,
    streak: 128,
    online: true,
    seed: 0,
    photo: yunhaPhoto,
  },
  {
    id: "au2",
    name: "Miso K.",
    handle: "@miso.k",
    activity: { listeningMinutes: 38_150, comments: 1_212, invites: 130, days: 216, lyricSheets: 5 },
    level: 39,
    streak: 96,
    online: true,
    seed: 1,
    photo: misoPhoto,
  },
  {
    id: "au3",
    name: "Taehyun",
    handle: "@taehyun",
    activity: { listeningMinutes: 32_800, comments: 1_116, invites: 120, days: 200, lyricSheets: 5 },
    level: 37,
    streak: 74,
    online: true,
    seed: 2,
    photo: taehyunPhoto,
  },
  {
    id: "au4",
    name: "Seojin",
    handle: "@seojin",
    activity: { listeningMinutes: 27_700, comments: 1_024, invites: 110, days: 184, lyricSheets: 5 },
    level: 34,
    streak: 61,
    seed: 3,
    photo: seojinPhoto,
  },
  {
    id: "au5",
    name: "Haru",
    handle: "@haru",
    activity: { listeningMinutes: 28_800, comments: 940, invites: 101, days: 168, lyricSheets: 4 },
    level: 31,
    streak: 48,
    online: true,
    seed: 4,
    photo: haruPhoto,
  },
  {
    id: "au6",
    name: "Jxnnie",
    handle: "@jxnnie",
    activity: { listeningMinutes: 24_600, comments: 864, invites: 92, days: 154, lyricSheets: 4 },
    level: 29,
    streak: 33,
    seed: 5,
    photo: jxnniePhoto,
  },
  {
    id: "au7",
    name: "Minho",
    handle: "@minho",
    activity: { listeningMinutes: 20_400, comments: 792, invites: 85, days: 142, lyricSheets: 4 },
    level: 27,
    streak: 25,
    seed: 6,
    photo: minhoPhoto,
  },
  {
    id: "au8",
    name: "Ari",
    handle: "@ari",
    activity: { listeningMinutes: 22_850, comments: 728, invites: 78, days: 130, lyricSheets: 3 },
    level: 24,
    streak: 19,
    seed: 7,
    photo: ariPhoto,
  },
];
