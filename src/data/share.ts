/* ------------------------------------------------------------------ *
 *  Sharing — where a track goes when the listener taps "Share".
 *
 *  The link is the product's own canonical URL (a demo host), and every
 *  target is a plain web-intent endpoint: no SDKs, no keys, nothing that
 *  needs a backend. `href` returns a ready-to-open URL, which keeps the
 *  dialog itself free of per-network branching.
 * ------------------------------------------------------------------ */

import type { PlayerTrack } from "./player";

export const SHARE_HOST = "faimess.app";

/** the canonical link for a track — what "Copy link" puts on the clipboard */
export function trackUrl(id: string): string {
  return `https://${SHARE_HOST}/track/${id}`;
}

export function trackUrlLabel(id: string): string {
  return `${SHARE_HOST}/track/${id}`;
}

/** the line that travels with the link into a chat or a post */
export function trackBlurb(title: string, artist: string): string {
  return `${artist} — “${title}” on FAIMESS`;
}

export type ShareTargetId = "x" | "whatsapp" | "telegram" | "facebook" | "kakao";

export type ShareTarget = {
  id: ShareTargetId;
  labelKey: string;
  href: (url: string, text: string) => string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "whatsapp",
    labelKey: "share.whatsapp",
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "telegram",
    labelKey: "share.telegram",
    href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "x",
    labelKey: "share.x",
    href: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    labelKey: "share.facebook",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "kakao",
    labelKey: "share.kakao",
    href: (url) => `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}`,
  },
];

/* ------------------------------------------------------------------ *
 *  What a share sheet actually needs, whichever thing is being shared.
 *
 *  A track and a playlist differ only in the words and the link, so both
 *  build the same shape here and `ShareDialog` never branches on the kind.
 * ------------------------------------------------------------------ */

export type ShareSubject = {
  /** the sheet's title — "Share “Afterglow”" */
  title: string;
  /** the second line on the preview row */
  subtitle: string;
  photo: string;
  /** what goes on the clipboard */
  url: string;
  /** the same link, shown as text */
  urlLabel: string;
  /** the line that travels with the link */
  blurb: string;
};

export function trackSubject(track: PlayerTrack): ShareSubject {
  return {
    title: track.title,
    subtitle: `${track.artist} · ${track.album}`,
    photo: track.photo,
    url: trackUrl(track.id),
    urlLabel: trackUrlLabel(track.id),
    blurb: trackBlurb(track.title, track.artist),
  };
}

export type LibraryKind = "playlist" | "album" | "artist";

const LIBRARY_PATH: Record<LibraryKind, string> = {
  playlist: "playlist",
  album: "album",
  artist: "artist",
};

/**
 * A playlist, an album or an artist — the things the detail card shows.
 * `subtitle` is the line the card itself prints under the title.
 */
export function librarySubject(
  kind: LibraryKind,
  id: string,
  name: string,
  subtitle: string,
  photo: string,
): ShareSubject {
  const path = `${LIBRARY_PATH[kind]}/${id}`;
  return {
    title: name,
    subtitle,
    photo,
    url: `https://${SHARE_HOST}/${path}`,
    urlLabel: `${SHARE_HOST}/${path}`,
    blurb: `${name} — ${subtitle} · FAIMESS`,
  };
}
