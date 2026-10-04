/* ------------------------------------------------------------------ *
 *  Library data — Artists / Albums / Playlists.
 *  Every entry renders from a seed, so covers are generated, not loaded.
 * ------------------------------------------------------------------ */

export type Artist = {
  id: string;
  name: string;
  initials: string;
  genre: string;
  listeners: string;
  following: boolean;
  seed: number;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  tracks: number;
  seed: number;
};

export type Playlist = {
  id: string;
  name: string;
  curator: string;
  tracks: number;
  duration: string;
  mood: string;
  seed: number;
};

export const artists: Artist[] = [
  { id: "a1", name: "Nova Ånn", initials: "NA", genre: "Dream pop", listeners: "1.2M monthly", following: true, seed: 0 },
  { id: "a2", name: "Kaito Mori", initials: "KM", genre: "Lo-fi jazz", listeners: "864K monthly", following: false, seed: 1 },
  { id: "a3", name: "Lila Verne", initials: "LV", genre: "Neo soul", listeners: "2.4M monthly", following: true, seed: 2 },
  { id: "a4", name: "The Paper Owls", initials: "PO", genre: "Indie folk", listeners: "318K monthly", following: false, seed: 3 },
  { id: "a5", name: "Sable", initials: "SB", genre: "Ambient", listeners: "540K monthly", following: false, seed: 4 },
  { id: "a6", name: "Milo Reyes", initials: "MR", genre: "Alt R&B", listeners: "977K monthly", following: true, seed: 5 },
  { id: "a7", name: "Hana Ito", initials: "HI", genre: "City pop", listeners: "1.8M monthly", following: false, seed: 6 },
  { id: "a8", name: "Rivers & Stone", initials: "RS", genre: "Post-rock", listeners: "402K monthly", following: false, seed: 7 },
];

export const albums: Album[] = [
  { id: "b1", title: "Afterglow", artist: "Nova Ånn", year: 2025, tracks: 11, seed: 0 },
  { id: "b2", title: "Blue Hour", artist: "Kaito Mori", year: 2024, tracks: 9, seed: 1 },
  { id: "b3", title: "Velvet Static", artist: "Lila Verne", year: 2025, tracks: 12, seed: 2 },
  { id: "b4", title: "Paper Boats", artist: "The Paper Owls", year: 2023, tracks: 8, seed: 3 },
  { id: "b5", title: "Nightbloom", artist: "Sable", year: 2025, tracks: 10, seed: 4 },
  { id: "b6", title: "Slow Motion", artist: "Milo Reyes", year: 2024, tracks: 7, seed: 5 },
  { id: "b7", title: "Tokyo Window", artist: "Hana Ito", year: 2025, tracks: 13, seed: 6 },
  { id: "b8", title: "Long Exposure", artist: "Rivers & Stone", year: 2022, tracks: 6, seed: 7 },
];

export const playlists: Playlist[] = [
  { id: "p1", name: "Late Night Drive", curator: "Faimess", tracks: 48, duration: "3h 12m", mood: "Mellow", seed: 0 },
  { id: "p2", name: "Morning Focus", curator: "Faimess", tracks: 62, duration: "4h 05m", mood: "Instrumental", seed: 1 },
  { id: "p3", name: "Golden Coast", curator: "Hana Ito", tracks: 27, duration: "1h 44m", mood: "Sunny", seed: 2 },
  { id: "p4", name: "Rainy Window", curator: "Faimess", tracks: 35, duration: "2h 18m", mood: "Soft", seed: 3 },
  { id: "p5", name: "Deep Work", curator: "Faimess", tracks: 71, duration: "5h 02m", mood: "Ambient", seed: 4 },
  { id: "p6", name: "Weekend Reset", curator: "Milo Reyes", tracks: 40, duration: "2h 36m", mood: "Warm", seed: 5 },
];
