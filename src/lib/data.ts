/* ------------------------------------------------------------------ *
 *  Mock data — Fiplan
 *  Everything the UI renders lives here, so the whole screen can be
 *  re-skinned / re-labelled without touching component code.
 * ------------------------------------------------------------------ */

export type ThumbKey = "forest" | "jimbaron" | "camping";

/* ----------------------------- navigation ----------------------------- */

export type NavItem = {
  id: string;
  label: string;
  icon: "home" | "calendar" | "activity" | "message" | "settings";
};

export const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "calendar", label: "Calendar", icon: "calendar" },
  { id: "activity", label: "Activity", icon: "activity" },
  { id: "messages", label: "Messages", icon: "message" },
  { id: "settings", label: "Settings", icon: "settings" },
];

/* -------------------------------- trip -------------------------------- */

export const activeTrip = {
  title: "Traveling to Switzerland",
  dateRange: "11 Nov - 16 Nov",
  time: "11:00 AM",
  location: "Lauterbrunnen Valley",
  guests: 2,
  folderLabel: "Trip folder",
};

/* ------------------------------ schedule ------------------------------ */

export type WeekDay = {
  short: string;
  date: number;
  dimmed?: boolean;
};

export const weekDays: WeekDay[] = [
  { short: "Sun", date: 10, dimmed: true },
  { short: "Mon", date: 11 },
  { short: "Tue", date: 12 },
  { short: "Wed", date: 13 },
  { short: "Thu", date: 14 },
];

/** Time gutter of the day grid. */
export const hourRows = ["09 AM", "10 AM", "11 AM", "12 PM", "01 PM", "02 PM"];

export type ScheduleEvent = {
  id: string;
  title: string;
  dayIndex: number;
  row: number;
  kind: "locked" | "rich" | "suggested";
  meta?: string;
  guests?: number;
  thumb?: ThumbKey;
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
    thumb: "forest",
  },
  {
    id: "ev-soccer",
    title: "Mini Soccer",
    dayIndex: 4,
    row: 4,
    kind: "suggested",
    meta: "14 Dec",
  },
];

export const featuredEvent = {
  title: "Camping at Ranca Upas",
  dateRange: "11 Dec - 12 Dec",
  time: "11:00 AM",
  guests: 2,
  thumb: "camping" as ThumbKey,
};

export const calendarShortcuts = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

/* ------------------------------ greeting ------------------------------ */

export const greeting = {
  line1: "Have a Good day,",
  name: "Wendy",
  subtitle:
    "Fuel your days with the boundless enthusiasm of a fellow explorer.",
};

export const intentFilters = [
  { id: "now", label: "Now" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "next-week", label: "Next week" },
  { id: "custom", label: "Custom" },
];

/* -------------------------------- chat -------------------------------- */

export type Message =
  | { id: string; kind: "text"; from: "me" | "them"; text: string; at: string }
  | {
      id: string;
      kind: "invite";
      title: string;
      when: string;
      at: string;
      thumb: ThumbKey;
      status: "pending" | "accepted" | "declined";
    }
  | { id: string; kind: "system"; text: string };

export type Conversation = {
  id: string;
  name: string;
  seed: number;
  /** short status line under the name in the list */
  status: string;
  online?: boolean;
  unread?: number;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "jane",
    name: "Jane Cooper",
    seed: 0,
    status: "Online",
    online: true,
    unread: 1,
    messages: [
      { id: "m1", kind: "text", from: "them", text: "Morning", at: "12:41" },
      { id: "m2", kind: "text", from: "them", text: "Let's join us Wendy!", at: "12:30" },
      { id: "m3", kind: "text", from: "me", text: "Sure Jenny :)", at: "12:35" },
      {
        id: "m4",
        kind: "invite",
        title: "Sunset at Jimbaron",
        when: "16 Nov · 16:30 hrs",
        at: "13:05",
        thumb: "jimbaron",
        status: "pending",
      },
      { id: "m5", kind: "text", from: "them", text: "That's cool, see you soon!", at: "13:20" },
    ],
  },
  {
    id: "jenny",
    name: "Jenny Wilson",
    seed: 1,
    status: "5 minutes ago",
    unread: 2,
    messages: [
      { id: "j1", kind: "text", from: "them", text: "Hey Wendy! Are we still on for the trip?", at: "09:12" },
      { id: "j2", kind: "text", from: "me", text: "Yes! I'll lock the dates tonight 🌿", at: "09:20" },
      {
        id: "j3",
        kind: "invite",
        title: "Brunch at Kaum",
        when: "18 Nov · 10:00 hrs",
        at: "09:24",
        thumb: "forest",
        status: "pending",
      },
    ],
  },
  {
    id: "broklyn",
    name: "Broklyn Simon",
    seed: 2,
    status: "10 minutes ago",
    unread: 3,
    messages: [
      { id: "b1", kind: "text", from: "them", text: "Sent you the sunrise route 🗺️", at: "08:02" },
      { id: "b2", kind: "text", from: "me", text: "Perfect, adding it to the schedule", at: "08:15" },
    ],
  },
  {
    id: "theresa",
    name: "Theresa Angel",
    seed: 3,
    status: "56 minutes ago",
    messages: [
      { id: "t1", kind: "text", from: "them", text: "The cabin photos look unreal!", at: "07:41" },
      { id: "t2", kind: "text", from: "me", text: "Wait until you see the lake at dawn", at: "07:55" },
    ],
  },
  {
    id: "minji",
    name: "Kim Minji",
    seed: 4,
    status: "8 minutes ago",
    messages: [
      { id: "k1", kind: "text", from: "them", text: "Packing list is ready ✅", at: "11:30" },
      { id: "k2", kind: "text", from: "me", text: "Send it over, I'll merge with mine", at: "11:36" },
    ],
  },
  {
    id: "brian",
    name: "Brian Tracy",
    seed: 5,
    status: "Sunday",
    messages: [
      { id: "r1", kind: "text", from: "them", text: "Sunday hike still on?", at: "Sun" },
      { id: "r2", kind: "text", from: "me", text: "Count me in 🥾", at: "Sun" },
    ],
  },
];

export const cannedReplies = [
  "Noted! I'll add it to our plan 🌿",
  "Sounds good — putting it on the schedule.",
  "Nice one! Let's confirm tomorrow morning 🙂",
  "On it. Anything else you want to fit in?",
];

export const notifications = [
  { id: "n1", title: "Jane accepted your invite", at: "2 min ago", tone: "coral" as const },
  { id: "n2", title: "Forecast: light rain in Interlaken", at: "1 hr ago", tone: "teal" as const },
  { id: "n3", title: "Trip folder synced", at: "Today", tone: "mint" as const },
];
