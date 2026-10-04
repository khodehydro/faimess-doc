import type { SceneKey } from "../ui/Scenes";

export type Message =
  | { id: string; kind: "text"; from: "me" | "them"; text: string; at: string }
  | {
      id: string;
      kind: "invite";
      title: string;
      when: string;
      at: string;
      scene: SceneKey;
      status: "pending" | "accepted" | "declined";
    }
  | { id: string; kind: "system"; text: string };

export type Conversation = {
  id: string;
  name: string;
  seed: number;
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
        scene: "coast",
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
      { id: "j1", kind: "text", from: "them", text: "Hey! Are we still on for the trip?", at: "09:12" },
      { id: "j2", kind: "text", from: "me", text: "Yes! I'll lock the dates tonight 🌿", at: "09:20" },
      {
        id: "j3",
        kind: "invite",
        title: "Brunch at Kaum",
        when: "18 Nov · 10:00 hrs",
        at: "09:24",
        scene: "forest",
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
