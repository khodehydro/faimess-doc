/* ------------------------------------------------------------------ *
 *  Library data — the FAIMESS roster: Artists / Albums / Playlists.
 *
 *  One roster feeds every surface: the home feed shelves, the Artists /
 *  Albums / Playlists pages and the search in the account card all read
 *  from here, so a name or a cover only ever changes in one place.
 *
 *  Artwork is real photography, self-hosted from src/assets/photos — the
 *  bundled files are optimised WebP crops produced by tools/photos.md.
 *  `seed` stays on every entry as the fallback for the procedural art in
 *  ui/Cover.tsx, used whenever a photo is missing.
 * ------------------------------------------------------------------ */

import novaePhoto from "../assets/photos/artists/novae.webp";
import seoraPhoto from "../assets/photos/artists/seora.webp";
import axionPhoto from "../assets/photos/artists/axion.webp";
import lunexPhoto from "../assets/photos/artists/lunex.webp";
import prism9Photo from "../assets/photos/artists/prism9.webp";
import velvetMoonPhoto from "../assets/photos/artists/velvet-moon.webp";
import haneulPhoto from "../assets/photos/artists/haneul.webp";
import kairosPhoto from "../assets/photos/artists/kairos.webp";

import afterglowPhoto from "../assets/photos/albums/afterglow.webp";
import blueHourPhoto from "../assets/photos/albums/blue-hour.webp";
import velvetStaticPhoto from "../assets/photos/albums/velvet-static.webp";
import nightbloomPhoto from "../assets/photos/albums/nightbloom.webp";
import tokyoWindowPhoto from "../assets/photos/albums/tokyo-window.webp";
import slowMotionPhoto from "../assets/photos/albums/slow-motion.webp";
import paperBoatsPhoto from "../assets/photos/albums/paper-boats.webp";
import longExposurePhoto from "../assets/photos/albums/long-exposure.webp";

import midnightDrivePhoto from "../assets/photos/playlists/midnight-drive.webp";
import comebackPhoto from "../assets/photos/playlists/comeback.webp";
import goldenHourPhoto from "../assets/photos/playlists/golden-hour.webp";
import rainyWindowPhoto from "../assets/photos/playlists/rainy-window.webp";
import deepFocusPhoto from "../assets/photos/playlists/deep-focus.webp";
import weekendResetPhoto from "../assets/photos/playlists/weekend-reset.webp";

export type ArtistKind = "Boy group" | "Girl group" | "Soloist" | "Duo";

export type Artist = {
  id: string;
  name: string;
  initials: string;
  kind: ArtistKind;
  genre: string;
  listeners: string;
  followers: string;
  following: boolean;
  /** a brand-new release → shows the live pulse on the avatar */
  newRelease?: boolean;
  verified?: boolean;
  seed: number;
  photo: string;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  tracks: number;
  released: string;
  seed: number;
  photo: string;
};

export type Playlist = {
  id: string;
  name: string;
  curator: string;
  tracks: number;
  duration: string;
  mood: string;
  seed: number;
  photo: string;
};

export const artists: Artist[] = [
  {
    id: "ar-novae",
    name: "NOVAE",
    initials: "NV",
    kind: "Boy group",
    genre: "Electro pop",
    listeners: "4.8M monthly",
    followers: "2.4M followers",
    following: true,
    newRelease: true,
    verified: true,
    seed: 0,
    photo: novaePhoto,
  },
  {
    id: "ar-seora",
    name: "SEORA",
    initials: "SR",
    kind: "Soloist",
    genre: "Alt R&B",
    listeners: "3.1M monthly",
    followers: "1.8M followers",
    following: true,
    newRelease: true,
    verified: true,
    seed: 2,
    photo: seoraPhoto,
  },
  {
    id: "ar-axion",
    name: "AXION",
    initials: "AX",
    kind: "Boy group",
    genre: "Hip-hop",
    listeners: "5.6M monthly",
    followers: "3.2M followers",
    following: true,
    verified: true,
    seed: 4,
    photo: axionPhoto,
  },
  {
    id: "ar-lunex",
    name: "LUNEX",
    initials: "LX",
    kind: "Boy group",
    genre: "Synth pop",
    listeners: "2.7M monthly",
    followers: "1.5M followers",
    following: true,
    verified: true,
    seed: 1,
    photo: lunexPhoto,
  },
  {
    id: "ar-prism9",
    name: "PRISM9",
    initials: "P9",
    kind: "Girl group",
    genre: "Dance pop",
    listeners: "6.4M monthly",
    followers: "4.1M followers",
    following: true,
    newRelease: true,
    verified: true,
    seed: 3,
    photo: prism9Photo,
  },
  {
    id: "ar-velvet-moon",
    name: "VELVET MOON",
    initials: "VM",
    kind: "Duo",
    genre: "City pop",
    listeners: "1.4M monthly",
    followers: "890K followers",
    following: true,
    seed: 7,
    photo: velvetMoonPhoto,
  },
  {
    id: "ar-haneul",
    name: "HANEUL",
    initials: "HN",
    kind: "Soloist",
    genre: "Ballad",
    listeners: "2.2M monthly",
    followers: "1.2M followers",
    following: true,
    verified: true,
    seed: 6,
    photo: haneulPhoto,
  },
  {
    id: "ar-kairos",
    name: "KAIROS",
    initials: "KR",
    kind: "Boy group",
    genre: "Alt R&B",
    listeners: "3.9M monthly",
    followers: "2.1M followers",
    following: true,
    verified: true,
    seed: 5,
    photo: kairosPhoto,
  },
];

export const albums: Album[] = [
  { id: "al-afterglow", title: "Afterglow", artist: "NOVAE", year: 2025, tracks: 11, released: "Today", seed: 0, photo: afterglowPhoto },
  { id: "al-blue-hour", title: "Blue Hour", artist: "KAIROS", year: 2025, tracks: 9, released: "Yesterday", seed: 1, photo: blueHourPhoto },
  { id: "al-velvet-static", title: "Velvet Static", artist: "PRISM9", year: 2025, tracks: 12, released: "2 days ago", seed: 2, photo: velvetStaticPhoto },
  { id: "al-nightbloom", title: "Nightbloom", artist: "VELVET MOON", year: 2025, tracks: 8, released: "4 days ago", seed: 4, photo: nightbloomPhoto },
  { id: "al-tokyo-window", title: "Tokyo Window", artist: "HANEUL", year: 2025, tracks: 13, released: "6 days ago", seed: 6, photo: tokyoWindowPhoto },
  { id: "al-slow-motion", title: "Slow Motion", artist: "LUNEX", year: 2025, tracks: 7, released: "1 week ago", seed: 5, photo: slowMotionPhoto },
  { id: "al-paper-boats", title: "Paper Boats", artist: "SEORA", year: 2024, tracks: 8, released: "3 weeks ago", seed: 3, photo: paperBoatsPhoto },
  { id: "al-long-exposure", title: "Long Exposure", artist: "AXION", year: 2024, tracks: 6, released: "2 months ago", seed: 7, photo: longExposurePhoto },
];

/** the six freshest records — the home feed shelf reads this */
export const freshAlbums = albums.slice(0, 6);

export const playlists: Playlist[] = [
  {
    id: "pl-midnight-drive",
    name: "Midnight Seoul Drive",
    curator: "Faimess",
    tracks: 48,
    duration: "3h 12m",
    mood: "Mellow",
    seed: 0,
    photo: midnightDrivePhoto,
  },
  {
    id: "pl-comeback",
    name: "Comeback Countdown",
    curator: "Faimess",
    tracks: 62,
    duration: "4h 05m",
    mood: "Hype",
    seed: 1,
    photo: comebackPhoto,
  },
  {
    id: "pl-golden-hour",
    name: "Golden Hour City Pop",
    curator: "HANEUL",
    tracks: 27,
    duration: "1h 44m",
    mood: "Sunny",
    seed: 2,
    photo: goldenHourPhoto,
  },
  {
    id: "pl-rainy-window",
    name: "Rainy Window",
    curator: "Faimess",
    tracks: 35,
    duration: "2h 18m",
    mood: "Soft",
    seed: 3,
    photo: rainyWindowPhoto,
  },
  {
    id: "pl-deep-focus",
    name: "Deep Focus",
    curator: "Faimess",
    tracks: 71,
    duration: "5h 02m",
    mood: "Ambient",
    seed: 4,
    photo: deepFocusPhoto,
  },
  {
    id: "pl-weekend-reset",
    name: "Weekend Reset",
    curator: "PRISM9",
    tracks: 40,
    duration: "2h 36m",
    mood: "Warm",
    seed: 5,
    photo: weekendResetPhoto,
  },
];
