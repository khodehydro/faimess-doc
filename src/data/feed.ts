/* ------------------------------------------------------------------ *
 *  Feed data — K-pop streaming dashboard.
 *  Every shelf on the home feed reads from here; add an object and it
 *  appears in the UI with no component changes.
 * ------------------------------------------------------------------ */

import type { SceneKey } from "../ui/Scenes";

/* ------------------------- followed artists ------------------------- */

export type FeedArtist = {
  id: string;
  name: string;
  initials: string;
  kind: "Group" | "Soloist" | "Duo";
  /** a brand-new release → shows the live pulse on the avatar */
  newRelease?: boolean;
  verified?: boolean;
  seed: number;
};

export const followedArtists: FeedArtist[] = [
  { id: "fa1", name: "NOVAE", initials: "NV", kind: "Group", newRelease: true, verified: true, seed: 0 },
  { id: "fa2", name: "SEORA", initials: "SR", kind: "Soloist", newRelease: true, verified: true, seed: 2 },
  { id: "fa3", name: "AXION", initials: "AX", kind: "Group", verified: true, seed: 4 },
  { id: "fa4", name: "LUNEX", initials: "LX", kind: "Group", seed: 1 },
  { id: "fa5", name: "HANEUL", initials: "HN", kind: "Soloist", seed: 6 },
  { id: "fa6", name: "PRISM9", initials: "P9", kind: "Group", newRelease: true, verified: true, seed: 3 },
  { id: "fa7", name: "VELVET MOON", initials: "VM", kind: "Duo", seed: 7 },
  { id: "fa8", name: "KAIROS", initials: "KR", kind: "Group", seed: 5 },
  { id: "fa9", name: "AERI", initials: "AE", kind: "Soloist", seed: 1 },
  { id: "fa10", name: "ORBIT9", initials: "O9", kind: "Group", seed: 4 },
];

/* --------------------------- newest songs --------------------------- */

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  ago: string;
  seed: number;
  isNew?: boolean;
};

export const newestTracks: Track[] = [
  { id: "nt1", title: "Afterglow", artist: "NOVAE", duration: "3:12", ago: "12 min ago", seed: 0, isNew: true },
  { id: "nt2", title: "Midnight Seoul", artist: "AXION", duration: "3:28", ago: "40 min ago", seed: 4, isNew: true },
  { id: "nt3", title: "Paper Heart", artist: "SEORA", duration: "2:58", ago: "1 hr ago", seed: 2 },
  { id: "nt4", title: "Neon Bloom", artist: "LUNEX", duration: "3:05", ago: "2 hrs ago", seed: 1 },
  { id: "nt5", title: "Halo Drive", artist: "PRISM9", duration: "3:41", ago: "3 hrs ago", seed: 3 },
  { id: "nt6", title: "Silver Hour", artist: "HANEUL", duration: "4:02", ago: "5 hrs ago", seed: 6 },
];

/* -------------------------- trending songs -------------------------- */

export type TrendingTrack = Track & {
  /** number of users who hit the fire button */
  fires: number;
  /** change versus yesterday, in percent */
  delta: number;
};

export const trendingTracks: TrendingTrack[] = [
  { id: "tr1", title: "Midnight Seoul", artist: "AXION", duration: "3:28", ago: "today", seed: 4, fires: 18420, delta: 128 },
  { id: "tr2", title: "Afterglow", artist: "NOVAE", duration: "3:12", ago: "today", seed: 0, fires: 15260, delta: 96 },
  { id: "tr3", title: "Cherry Static", artist: "PRISM9", duration: "3:19", ago: "today", seed: 3, fires: 12840, delta: 64 },
  { id: "tr4", title: "Paper Heart", artist: "SEORA", duration: "2:58", ago: "yesterday", seed: 2, fires: 9740, delta: 41 },
  { id: "tr5", title: "Gravity", artist: "VELVET MOON", duration: "3:36", ago: "yesterday", seed: 7, fires: 7310, delta: 18 },
  { id: "tr6", title: "Blue Signal", artist: "KAIROS", duration: "3:02", ago: "2 days ago", seed: 5, fires: 5120, delta: 9 },
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

/* --------------------------- newest albums -------------------------- */

export type FeedAlbum = {
  id: string;
  title: string;
  artist: string;
  tracks: number;
  released: string;
  seed: number;
};

export const newestAlbums: FeedAlbum[] = [
  { id: "na1", title: "Afterglow", artist: "NOVAE", tracks: 11, released: "Today", seed: 0 },
  { id: "na2", title: "Blue Hour", artist: "KAIROS", tracks: 9, released: "Yesterday", seed: 1 },
  { id: "na3", title: "Velvet Static", artist: "PRISM9", tracks: 12, released: "2 days ago", seed: 2 },
  { id: "na4", title: "Nightbloom", artist: "VELVET MOON", tracks: 8, released: "4 days ago", seed: 4 },
  { id: "na5", title: "Tokyo Window", artist: "HANEUL", tracks: 13, released: "6 days ago", seed: 6 },
  { id: "na6", title: "Slow Motion", artist: "LUNEX", tracks: 7, released: "1 week ago", seed: 5 },
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
};

export const activeUsers: FeedUser[] = [
  { id: "au1", name: "Yunha", handle: "@yunha", points: 24180, level: 42, streak: 128, online: true, seed: 0 },
  { id: "au2", name: "Miso K.", handle: "@miso.k", points: 21640, level: 39, streak: 96, online: true, seed: 1 },
  { id: "au3", name: "Taehyun", handle: "@taehyun", points: 19950, level: 37, streak: 74, online: true, seed: 2 },
  { id: "au4", name: "Seojin", handle: "@seojin", points: 18320, level: 34, streak: 61, seed: 3 },
  { id: "au5", name: "Haru", handle: "@haru", points: 16780, level: 31, streak: 48, online: true, seed: 4 },
  { id: "au6", name: "Jxnnie", handle: "@jxnnie", points: 15410, level: 29, streak: 33, seed: 5 },
  { id: "au7", name: "Minho", handle: "@minho", points: 14120, level: 27, streak: 25, seed: 6 },
  { id: "au8", name: "Ari", handle: "@ari", points: 12980, level: 24, streak: 19, seed: 7 },
];
