import type { SceneKey } from "../ui/Scenes";
import type { MapTone } from "../ui/Scenes";

/* ------------------------------------------------------------------ *
 *  Home banners — the hero rotates through these.
 *  Add an object here and it appears as the next slide, no code change.
 * ------------------------------------------------------------------ */

export type Banner = {
  id: string;
  /** eyebrow shown above the card title */
  eyebrow: string;
  title: string;
  dateRange: string;
  time: string;
  location: string;
  guests: number;
  scene: SceneKey;
  mapTone: MapTone;
  /** travellers shown in the stacked avatars */
  travellers: number[];
};

export const banners: Banner[] = [
  {
    id: "switzerland",
    eyebrow: "Active trip",
    title: "Traveling to Switzerland",
    dateRange: "11 Nov - 16 Nov",
    time: "11:00 AM",
    location: "Lauterbrunnen Valley",
    guests: 2,
    scene: "sunset",
    mapTone: "teal",
    travellers: [1, 3, 4],
  },
  {
    id: "ranca-upas",
    eyebrow: "Next up",
    title: "Camping at Ranca Upas",
    dateRange: "11 Dec - 12 Dec",
    time: "06:30 PM",
    location: "Ranca Upas Highland",
    guests: 3,
    scene: "camping",
    mapTone: "violet",
    travellers: [0, 2, 5],
  },
  {
    id: "jimbaron",
    eyebrow: "Saved idea",
    title: "Sunset at Jimbaron",
    dateRange: "16 Nov - 18 Nov",
    time: "04:30 PM",
    location: "Jimbaron Coast",
    guests: 4,
    scene: "coast",
    mapTone: "amber",
    travellers: [4, 1, 0],
  },
];
