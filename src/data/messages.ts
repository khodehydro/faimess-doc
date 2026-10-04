import type { SceneKey } from "../ui/Scenes";

import jinahPhoto from "../assets/photos/users/jinah.webp";
import soraPhoto from "../assets/photos/users/sora.webp";
import junPhoto from "../assets/photos/users/jun.webp";
import yunaPhoto from "../assets/photos/users/yuna.webp";

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
  photo: string;
  messages: Message[];
};

/** Fan-to-fan messages, so the right column reads like a real community. */
export const conversations: Conversation[] = [
  {
    id: "jinah",
    name: "Jinah",
    seed: 0,
    status: "Online",
    online: true,
    unread: 1,
    photo: jinahPhoto,
    messages: [
      { id: "m1", kind: "text", from: "them", text: "Did you see the Afterglow teaser? 👀", at: "12:41" },
      { id: "m2", kind: "text", from: "them", text: "Forty seconds and I've replayed it twenty times", at: "12:42" },
      { id: "m3", kind: "text", from: "me", text: "Same. Pre-ordered the album already 🎧", at: "12:44" },
      {
        id: "m4",
        kind: "invite",
        title: "NOVAE — Afterglow Tour · Seoul",
        when: "11 Nov · 20:00 hrs",
        at: "12:46",
        scene: "sunset",
        status: "pending",
      },
      { id: "m5", kind: "text", from: "them", text: "That's the one. See you at the barrier!", at: "12:52" },
    ],
  },
  {
    id: "sora",
    name: "Sora",
    seed: 1,
    status: "5 minutes ago",
    unread: 2,
    photo: soraPhoto,
    messages: [
      { id: "s1", kind: "text", from: "them", text: "Midnight Seoul is on repeat 🔁", at: "09:12" },
      { id: "s2", kind: "text", from: "them", text: "The bridge at 2:10 is unreal, right?", at: "09:13" },
      { id: "s3", kind: "text", from: "me", text: "I've had it on all morning", at: "09:20" },
    ],
  },
  {
    id: "jun",
    name: "Jun",
    seed: 2,
    status: "10 minutes ago",
    unread: 3,
    photo: junPhoto,
    messages: [
      { id: "j1", kind: "text", from: "them", text: "Fire counter just passed 18K 🔥", at: "08:02" },
      { id: "j2", kind: "text", from: "me", text: "Pushing it to 20K tonight, we can take #1", at: "08:15" },
    ],
  },
  {
    id: "yuna",
    name: "Yuna",
    seed: 3,
    status: "Sunday",
    photo: yunaPhoto,
    messages: [
      { id: "y1", kind: "text", from: "them", text: "Fan meeting tickets drop at 8 PM 🎟️", at: "Sun" },
      { id: "y2", kind: "text", from: "me", text: "Alarm set, card ready", at: "Sun" },
    ],
  },
];

export const cannedReplies = [
  "Noted! Queueing it up now 🎧",
  "Sounds good — adding it to the playlist.",
  "Yes! Let's lock the tickets tonight.",
  "On it. Anything else from the comeback?",
];
