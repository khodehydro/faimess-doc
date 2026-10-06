/* ------------------------------------------------------------------ *
 *  Home banners — the hero rotates through these.
 *  Add an object here and it becomes the next slide, no code change.
 *  Each slide is a real photograph with a tour / release story on top.
 * ------------------------------------------------------------------ */

import afterglowTourPhoto from "../assets/photos/banners/tour-afterglow.webp";
import asiaLegPhoto from "../assets/photos/banners/asia-leg.webp";
import midnightSeoulPhoto from "../assets/photos/banners/midnight-seoul.webp";
import hoodiePhoto from "../assets/photos/shop/hoodie.webp";
import midnightDrivePhoto from "../assets/photos/playlists/midnight-drive.webp";
import tokyoWindowPhoto from "../assets/photos/albums/tokyo-window.webp";

export type BannerKind = "tour" | "song" | "news" | "album" | "artist" | "playlist" | "shop";

export type Banner = {
  id: string;
  kind?: BannerKind;
  /** eyebrow shown above the card title */
  eyebrow: string;
  title: string;
  /** the one line under the title, over the banner's bottom scrim */
  subtitle: string;
  dateRange: string;
  location: string;
  /** fans who hit “going” on this event */
  going: number;
  photo: string;
  /** the stops listed inside the detail card */
  stops: { city: string; date: string }[];
  trackId?: string;
  newsId?: string;
  albumId?: string;
  artistId?: string;
  playlistId?: string;
  productId?: string;
};

export const banners: Banner[] = [
  {
    id: "afterglow-tour",
    kind: "song",
    trackId: "tr1",
    eyebrow: "World tour",
    title: "NOVAE — Afterglow World Tour",
    subtitle: "Three nights at KSPO Dome, then Tokyo and Milan.",
    dateRange: "11 Nov – 16 Nov",
    location: "Seoul · KSPO Dome",
    going: 12480,
    photo: afterglowTourPhoto,
    stops: [
      { city: "Seoul", date: "11 Nov" },
      { city: "Tokyo", date: "13 Nov" },
      { city: "Milan", date: "16 Nov" },
    ],
  },
  {
    id: "prism9-asia",
    kind: "news",
    newsId: "nw1",
    eyebrow: "New dates",
    title: "PRISM9 — Velvet Static Asia leg",
    subtitle: "Velvet Static lands in Tokyo, Manila and Bangkok this December.",
    dateRange: "11 Dec – 14 Dec",
    location: "Tokyo · Saitama Arena",
    going: 8920,
    photo: asiaLegPhoto,
    stops: [
      { city: "Tokyo", date: "11 Dec" },
      { city: "Manila", date: "13 Dec" },
      { city: "Bangkok", date: "14 Dec" },
    ],
  },
  {
    id: "midnight-seoul",
    kind: "album",
    albumId: "al2",
    eyebrow: "Out now",
    title: "AXION — “Midnight Seoul”",
    subtitle: "The new single is out everywhere — listening party tonight, 20:00 KST.",
    dateRange: "Listening party tonight",
    location: "Seoul · FAIMESS Live Room",
    going: 15260,
    photo: midnightSeoulPhoto,
    stops: [
      { city: "Seoul", date: "20:00" },
      { city: "Tokyo", date: "21:00" },
      { city: "Milan", date: "22:00" },
    ],
  },
  {
    id: "banner-shop-hoodie",
    kind: "shop",
    productId: "hoodie-onstage",
    eyebrow: "Official Merch",
    title: "On Stage Tour Hoodie",
    subtitle: "Heavyweight oversized fleece with tour embroidery — limited stock.",
    dateRange: "Available now",
    location: "FAIMESS Store",
    going: 3400,
    photo: hoodiePhoto,
    stops: [],
  },
  {
    id: "banner-playlist-drive",
    kind: "playlist",
    playlistId: "p1",
    eyebrow: "Curated Playlist",
    title: "Late Night Drive",
    subtitle: "Neon-lit city beats, smooth synth-wave and midnight vocals.",
    dateRange: "Updated weekly",
    location: "FAIMESS Originals",
    going: 24500,
    photo: midnightDrivePhoto,
    stops: [],
  },
  {
    id: "banner-artist-prism9",
    kind: "artist",
    artistId: "ar3",
    eyebrow: "Featured Artist",
    title: "PRISM9 — Velvet Static",
    subtitle: "Explore the full discography, singles, and member stories.",
    dateRange: "Active roster",
    location: "Seoul · Tokyo",
    going: 19800,
    photo: tokyoWindowPhoto,
    stops: [],
  },
];
