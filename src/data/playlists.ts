/* ------------------------------------------------------------------ *
 *  Your playlists — the model behind the "make your own" flow.
 *
 *  A listener playlist stores its artwork *by id*, never as a file: the
 *  cover picker offers the six FAIMESS crops and nothing else, so there is
 *  no upload path and no `File`/`Blob` anywhere near the model. Songs are
 *  stored as ids too, which is what lets a whole list serialise to
 *  localStorage in one line.
 * ------------------------------------------------------------------ */

import midnightDrive from "../assets/photos/playlists/midnight-drive.webp";
import comeback from "../assets/photos/playlists/comeback.webp";
import goldenHour from "../assets/photos/playlists/golden-hour.webp";
import rainyWindow from "../assets/photos/playlists/rainy-window.webp";
import deepFocus from "../assets/photos/playlists/deep-focus.webp";
import weekendReset from "../assets/photos/playlists/weekend-reset.webp";

export type PlaylistCoverId =
  | "midnight-drive"
  | "comeback"
  | "golden-hour"
  | "rainy-window"
  | "deep-focus"
  | "weekend-reset";

export type PlaylistCover = {
  id: PlaylistCoverId;
  /** the bundled WebP — the only artwork a user playlist can ever wear */
  photo: string;
  /** i18n key for the cover's name, also used as its accessible label */
  labelKey: string;
};

export const PLAYLIST_COVERS: PlaylistCover[] = [
  { id: "midnight-drive", photo: midnightDrive, labelKey: "playlist.cover.midnight-drive" },
  { id: "comeback", photo: comeback, labelKey: "playlist.cover.comeback" },
  { id: "golden-hour", photo: goldenHour, labelKey: "playlist.cover.golden-hour" },
  { id: "rainy-window", photo: rainyWindow, labelKey: "playlist.cover.rainy-window" },
  { id: "deep-focus", photo: deepFocus, labelKey: "playlist.cover.deep-focus" },
  { id: "weekend-reset", photo: weekendReset, labelKey: "playlist.cover.weekend-reset" },
];

export const DEFAULT_COVER: PlaylistCoverId = "midnight-drive";

const COVER_BY_ID = new Map(PLAYLIST_COVERS.map((cover) => [cover.id, cover]));

/** narrows an arbitrary string (a stored value, say) to a real cover */
export function isCoverId(value: unknown): value is PlaylistCoverId {
  return typeof value === "string" && COVER_BY_ID.has(value as PlaylistCoverId);
}

/** falls back to the first cover, so a stale id can never render a hole */
export function coverById(id: string): PlaylistCover {
  return COVER_BY_ID.get(id as PlaylistCoverId) ?? PLAYLIST_COVERS[0];
}

export function coverPhoto(id: string): string {
  return coverById(id).photo;
}

/** a list the listener built — ids only, so it survives JSON round-trips */
export type UserPlaylist = {
  id: string;
  name: string;
  cover: PlaylistCoverId;
  trackIds: string[];
  /** epoch ms, newest first in every surface that lists them */
  createdAt: number;
};

export const STORE_KEY = "faimess.playlists";
export const MAX_NAME_LENGTH = 44;

/** `mine-` prefix keeps user lists apart from the curated `pl-` roster */
export function makePlaylistId(): string {
  return `mine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/** structural guard for whatever came back out of localStorage */
export function isUserPlaylist(value: unknown): value is UserPlaylist {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    isCoverId(v.cover) &&
    Array.isArray(v.trackIds) &&
    v.trackIds.every((t) => typeof t === "string") &&
    typeof v.createdAt === "number"
  );
}

/** newest first — the order every list of "your playlists" uses */
export function byNewest(lists: UserPlaylist[]): UserPlaylist[] {
  return [...lists].sort((a, b) => b.createdAt - a.createdAt);
}
