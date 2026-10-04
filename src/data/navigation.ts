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

export const notifications = [
  { id: "n1", title: "Nova Ånn released “Afterglow”", at: "2 min ago", tone: "primary" as const },
  { id: "n2", title: "Your mix of the week is ready", at: "1 hr ago", tone: "teal" as const },
  { id: "n3", title: "3 tracks added to Late Night Drive", at: "Today", tone: "mint" as const },
];
