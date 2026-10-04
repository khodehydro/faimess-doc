/* ------------------------------------------------------------------ *
 *  Home banners — the hero rotates through these.
 *  Add an object here and it becomes the next slide, no code change.
 *  Each slide is a real photograph with a tour / release story on top.
 * ------------------------------------------------------------------ */

import afterglowTourPhoto from "../assets/photos/banners/tour-afterglow.webp";
import asiaLegPhoto from "../assets/photos/banners/asia-leg.webp";
import midnightSeoulPhoto from "../assets/photos/banners/midnight-seoul.webp";

export type Banner = {
  id: string;
  /** eyebrow shown above the card title */
  eyebrow: string;
  title: string;
  dateRange: string;
  location: string;
  /** fans who hit “going” on this event */
  going: number;
  photo: string;
  /** the three stops listed inside the detail card */
  stops: { city: string; date: string }[];
};

export const banners: Banner[] = [
  {
    id: "afterglow-tour",
    eyebrow: "World tour",
    title: "NOVAE — Afterglow World Tour",
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
    eyebrow: "New dates",
    title: "PRISM9 — Velvet Static Asia leg",
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
    eyebrow: "Out now",
    title: "AXION — “Midnight Seoul”",
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
];
