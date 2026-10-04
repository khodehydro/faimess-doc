import type { SceneKey } from "../ui/Scenes";

/** `date` is a day of the fixed demo month (December 2023); the day name is
 *  rendered from it with Intl, so it follows the interface language. */
export type WeekDay = { date: number; dimmed?: boolean };

export const weekDays: WeekDay[] = [
  { date: 10, dimmed: true },
  { date: 11 },
  { date: 12 },
  { date: 13 },
  { date: 14 },
];

/** the demo month the grid is pinned to */
export const GRID_MONTH = { year: 2023, month: 11 };

/** Time gutter of the day grid — five rows fit the frame without scrolling.
 *  Stored as hours so the label can be formatted per language. */
export const hourRows = [10, 11, 12, 13, 14];

export type ScheduleEvent = {
  id: string;
  title: string;
  dayIndex: number;
  row: number;
  kind: "locked" | "rich" | "suggested";
  meta?: string;
  guests?: number;
  scene?: SceneKey;
};

export const scheduleEvents: ScheduleEvent[] = [
  { id: "ev-dinsum", title: "Imperial Dinsum", dayIndex: 0, row: 0, kind: "locked" },
  {
    id: "ev-forest",
    title: "Explore Forest Park",
    dayIndex: 3,
    row: 1,
    kind: "rich",
    meta: "13 Dec · 11:00 AM",
    guests: 3,
    scene: "forest",
  },
  {
    id: "ev-soccer",
    title: "Mini Soccer",
    dayIndex: 4,
    row: 3,
    kind: "suggested",
    meta: "14 Dec",
  },
];

export const featuredEvent = {
  title: "Camping at Ranca Upas",
  dateRange: "11 Dec - 12 Dec",
  time: "11:00 AM",
  guests: 2,
  scene: "camping" as SceneKey,
};
