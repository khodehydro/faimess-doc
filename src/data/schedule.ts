import type { SceneKey } from "../ui/Scenes";

export type WeekDay = { short: string; date: number; dimmed?: boolean };

export const weekDays: WeekDay[] = [
  { short: "Sun", date: 10, dimmed: true },
  { short: "Mon", date: 11 },
  { short: "Tue", date: 12 },
  { short: "Wed", date: 13 },
  { short: "Thu", date: 14 },
];

/** Time gutter of the day grid — five rows fit the frame without scrolling. */
export const hourRows = ["10 AM", "11 AM", "12 PM", "01 PM", "02 PM"];

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
