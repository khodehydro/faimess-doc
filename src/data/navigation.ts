import type { IconName } from "../ui/Icon";
import type { RouteId } from "../app/router";

export type NavItem = {
  id: RouteId;
  label: string;
  icon: IconName;
};

/** Primary navigation — mirrors `routes` in app/router.ts. */
export const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "artists", label: "Artists", icon: "mic" },
  { id: "albums", label: "Albums", icon: "disc" },
  { id: "playlists", label: "Playlists", icon: "music" },
  { id: "shop", label: "Shop", icon: "shop" },
];

/**
 * The notification tray. Each row stores *what kind* of news it is plus the
 * words of the story (an artist, a title, a count), so the sentence is built
 * by i18n and the timestamp by `tData` — never a finished English string.
 */
export type NotificationKind =
  | "song"
  | "news"
  | "playlist"
  | "album"
  | "comment"
  | "lyrics"
  | "points";

export type Notification = {
  id: string;
  kind?: NotificationKind;
  /** i18n key of the sentence */
  textKey: string;
  /** the holes that sentence takes */
  vars?: Record<string, string | number>;
  /** English literal for the relative time — `tData` translates it */
  at: string;
  tone: "primary" | "teal" | "mint" | "flame";
  icon?: IconName;
  unread?: boolean;
  /** optional target action ids */
  newsId?: string;
  trackId?: string;
  albumId?: string;
  playlistId?: string;
  points?: boolean;
};

export const notifications: Notification[] = [
  {
    id: "notif-song-1",
    kind: "song",
    textKey: "notif.newSong",
    vars: { artist: "NOVAE", title: "Afterglow" },
    at: "2 min ago",
    tone: "primary",
    icon: "music",
    unread: true,
    trackId: "tr1",
  },
  {
    id: "notif-comment-1",
    kind: "comment",
    textKey: "notif.commentReply",
    vars: { user: "Yuna", title: "Afterglow" },
    at: "18 min ago",
    tone: "flame",
    icon: "message",
    unread: true,
    trackId: "tr1",
  },
  {
    id: "notif-news-1",
    kind: "news",
    textKey: "notif.newsPublished",
    vars: { title: "NOVAE announce first world tour “Afterglow”" },
    at: "2 hrs ago",
    tone: "primary",
    icon: "news",
    unread: true,
    newsId: "nw1",
  },
  {
    id: "notif-playlist-1",
    kind: "playlist",
    textKey: "notif.newPlaylist",
    vars: { name: "Late Night Drive" },
    at: "4 hrs ago",
    tone: "teal",
    icon: "disc",
    unread: true,
    playlistId: "p1",
  },
  {
    id: "notif-album-1",
    kind: "album",
    textKey: "notif.newAlbum",
    vars: { artist: "AXION", title: "Midnight Seoul" },
    at: "6 hrs ago",
    tone: "teal",
    icon: "disc",
    unread: false,
    albumId: "al2",
  },
  {
    id: "notif-lyrics-1",
    kind: "lyrics",
    textKey: "notif.lyricsApproved",
    vars: { title: "Cherry Static" },
    at: "1 day ago",
    tone: "mint",
    icon: "check",
    unread: false,
    trackId: "tr3",
  },
  {
    id: "notif-points-1",
    kind: "points",
    textKey: "notif.pointsEarned",
    vars: { points: 50, reason: "Lyric sheet approved" },
    at: "1 day ago",
    tone: "mint",
    icon: "medal",
    unread: false,
    points: true,
  },
  {
    id: "notif-news-2",
    kind: "news",
    textKey: "notif.newsTrending",
    vars: { title: "AXION’s “Midnight Seoul” tops global chart" },
    at: "2 days ago",
    tone: "teal",
    icon: "trend",
    unread: false,
    newsId: "nw2",
  },
];
