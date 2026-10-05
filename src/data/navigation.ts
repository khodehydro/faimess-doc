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
export type Notification = {
  id: string;
  /** i18n key of the sentence */
  textKey: string;
  /** the holes that sentence takes */
  vars?: Record<string, string | number>;
  /** English literal for the relative time — `tData` translates it */
  at: string;
  tone: "primary" | "teal" | "mint";
};

export const notifications: Notification[] = [
  {
    id: "n1",
    textKey: "notif.release",
    vars: { artist: "Nova Ånn", title: "Afterglow" },
    at: "2 min ago",
    tone: "primary",
  },
  { id: "n2", textKey: "notif.mixReady", at: "1 hr ago", tone: "teal" },
  {
    id: "n3",
    textKey: "notif.tracksAdded",
    vars: { n: 3, name: "Late Night Drive" },
    at: "Today",
    tone: "mint",
  },
];
