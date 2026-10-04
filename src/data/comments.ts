/* ------------------------------------------------------------------ *
 *  Comments — the fan thread under a track.
 *
 *  Seeded by hand so the demo has something to read, reply to and report.
 *  The live state (new comments, replies, fires, reports) lives in
 *  CommentsContext and starts from these lists.
 * ------------------------------------------------------------------ */

import ariPhoto from "../assets/photos/users/ari.webp";
import haruPhoto from "../assets/photos/users/haru.webp";
import jinahPhoto from "../assets/photos/users/jinah.webp";
import junPhoto from "../assets/photos/users/jun.webp";
import jxnniePhoto from "../assets/photos/users/jxnnie.webp";
import minhoPhoto from "../assets/photos/users/minho.webp";
import misoPhoto from "../assets/photos/users/miso.webp";
import seojinPhoto from "../assets/photos/users/seojin.webp";
import soraPhoto from "../assets/photos/users/sora.webp";
import taehyunPhoto from "../assets/photos/users/taehyun.webp";
import yunaPhoto from "../assets/photos/users/yuna.webp";
import yunhaPhoto from "../assets/photos/users/yunha.webp";

import novaePhoto from "../assets/photos/artists/novae.webp";
import seoraPhoto from "../assets/photos/artists/seora.webp";
import prism9Photo from "../assets/photos/artists/prism9.webp";

import { me } from "./account";
import { BADGES, type CommentBadge } from "./badges";

export { BADGES };
export type { BadgeTone, CommentBadge } from "./badges";

/* -------------------------------- types ------------------------------- */

export type Comment = {
  id: string;
  author: string;
  handle: string;
  photo: string;
  time: string;
  text: string;
  fires: number;
  /** the listener has fired it in this session */
  fired?: boolean;
  /** the newest award this fan holds — drawn on the avatar */
  badge?: CommentBadge;
  /** account-level tick (artists, staff) */
  verified?: boolean;
  /** an artist or staff answer — highlighted in the thread */
  fromArtist?: boolean;
  /** written by the signed-in listener, so it can be deleted */
  mine?: boolean;
  replies: Comment[];
};

const fan = (
  id: string,
  author: string,
  handle: string,
  photo: string,
  time: string,
  text: string,
  fires: number,
  badge?: CommentBadge,
  replies: Comment[] = [],
): Comment => ({ id, author, handle, photo, time, text, fires, badge, replies });

/** the signed-in listener, as the composer and new comments use them */
export const ME_AUTHOR = {
  name: me.name,
  handle: me.handle,
  photo: me.photo,
  badge: me.badge,
};

/* ------------------------------- threads ------------------------------ */

const AFTERGLOW: Comment[] = [
  {
    id: "c-af-1",
    author: "NOVAE",
    handle: "@novae",
    photo: novaePhoto,
    time: "1 hr ago",
    text: "We wrote this one at 4am in the tour van. Thank you for every single fire 🔥",
    fires: 4820,
    badge: BADGES.artist,
    verified: true,
    fromArtist: true,
    replies: [
      fan("c-af-1r1", "Yunha", "@yunha", yunhaPhoto, "52 min ago", "we love you so much 🥺 see you in Seoul", 218, BADGES.topListener),
      fan("c-af-1r2", "Miso K.", "@miso.k", misoPhoto, "40 min ago", "4am says everything about this song", 96, BADGES.chart),
    ],
  },
  fan(
    "c-af-2",
    "Yunha",
    "@yunha",
    yunhaPhoto,
    "12 min ago",
    "해가 진 뒤에도 남아 있는 빛 — that line lives in my head rent free",
    842,
    BADGES.topListener,
  ),
  fan(
    "c-af-3",
    "Taehyun",
    "@taehyun",
    taehyunPhoto,
    "26 min ago",
    "The drop at 1:12 is unreal. Headphones only, no exceptions 🎧",
    613,
    BADGES.streak,
  ),
  fan(
    "c-af-4",
    "Sora",
    "@sora",
    soraPhoto,
    "48 min ago",
    "این آهنگ دقیقاً حس ساعت ۲ بامدادِ تو ماشین رو داره 🌙",
    297,
    BADGES.fanOfMonth,
  ),
  fan(
    "c-af-5",
    "Seojin",
    "@seojin",
    seojinPhoto,
    "1 hr ago",
    "Pre-ordered the album the second this preview finished. No regrets.",
    254,
    BADGES.chart,
    [fan("c-af-5r1", "Haru", "@haru", haruPhoto, "55 min ago", "same, my wallet is screaming", 61, BADGES.rookie)],
  ),
  fan("c-af-6", "Jxnnie", "@jxnnie", jxnniePhoto, "2 hrs ago", "The bassline is doing something illegal 🔥🔥", 188, BADGES.streak),
  fan("c-af-7", "Jinah", "@jinah", jinahPhoto, "3 hrs ago", "Who else replaying the bridge on loop?", 121, BADGES.topListener),
  fan("c-af-8", "Minho", "@minho", minhoPhoto, "4 hrs ago", "Saw it live in Tokyo. The crowd went silent for the last chorus.", 96, BADGES.moderator),
  fan("c-af-9", "Ari", "@ari", ariPhoto, "5 hrs ago", "Song of the year and it's only March.", 74, BADGES.rookie),
  fan("c-af-10", "Yuna", "@yuna", yunaPhoto, "6 hrs ago", "the lyric sheet in this player is such a nice touch, thank you", 52, BADGES.fanOfMonth),
  fan("c-af-11", "Jun", "@jun", junPhoto, "8 hrs ago", "Afterglow > everything else on the chart right now, sorry not sorry", 41, BADGES.streak),
  fan("c-af-12", "Haru", "@haru", haruPhoto, "9 hrs ago", "0:38 gave me goosebumps the first time", 33, BADGES.rookie),
];

const MIDNIGHT_SEOUL: Comment[] = [
  {
    id: "c-ms-1",
    author: "SEORA",
    handle: "@seora",
    photo: seoraPhoto,
    time: "2 hrs ago",
    text: "I asked for a city at night and the producers simply handed me one.",
    fires: 2310,
    badge: BADGES.artist,
    verified: true,
    fromArtist: true,
    replies: [fan("c-ms-1r1", "Yuna", "@yuna", yunaPhoto, "1 hr ago", "you can hear the traffic in the intro, I'm obsessed", 143, BADGES.fanOfMonth)],
  },
  fan("c-ms-2", "Miso K.", "@miso.k", misoPhoto, "9 min ago", "서울의 밤이 이렇게 들린다니 🌃", 512, BADGES.chart),
  fan("c-ms-3", "Minho", "@minho", minhoPhoto, "33 min ago", "The chorus hits harder every replay. How is that possible?", 388, BADGES.moderator),
  fan("c-ms-4", "Ari", "@ari", ariPhoto, "1 hr ago", "played this while driving through the tunnel, 10/10 experience", 276, BADGES.rookie),
  fan("c-ms-5", "Jxnnie", "@jxnnie", jxnniePhoto, "2 hrs ago", "the instrumental break is criminally short", 199, BADGES.streak),
  fan("c-ms-6", "Sora", "@sora", soraPhoto, "3 hrs ago", "اواخر این آهنگ عالیه 🔥", 151, BADGES.fanOfMonth),
  fan("c-ms-7", "Seojin", "@seojin", seojinPhoto, "4 hrs ago", "Chart #1 and it deserves every point", 122, BADGES.chart),
  fan("c-ms-8", "Jun", "@jun", junPhoto, "7 hrs ago", "who else is here from the Trending shelf 👀", 88, BADGES.streak),
  fan("c-ms-9", "Haru", "@haru", haruPhoto, "10 hrs ago", "the whisper at 2:40. that's it. that's the comment.", 64, BADGES.rookie),
];

const PAPER_HEART: Comment[] = [
  fan(
    "c-ph-1",
    "Jinah",
    "@jinah",
    jinahPhoto,
    "6 min ago",
    "Paper Heart is the quietest song she has ever released and it's my favourite 🌸",
    402,
    BADGES.topListener,
    [
      fan("c-ph-1r1", "Ari", "@ari", ariPhoto, "3 min ago", "the strings at the end. I'm not okay.", 77, BADGES.rookie),
      fan("c-ph-1r2", "Miso K.", "@miso.k", misoPhoto, "2 min ago", "same, cried on the bus like a normal person", 44, BADGES.chart),
    ],
  ),
  fan("c-ph-2", "Yunha", "@yunha", yunhaPhoto, "20 min ago", "종이로 만든 심장이 이렇게 따뜻할 줄 알았어", 318, BADGES.topListener),
  fan("c-ph-3", "Minho", "@minho", minhoPhoto, "44 min ago", "Three minutes and it says everything about a first love.", 240, BADGES.moderator),
  fan("c-ph-4", "Taehyun", "@taehyun", taehyunPhoto, "2 hrs ago", "this is a 2am song and I will not be taking questions", 176, BADGES.streak),
  fan("c-ph-5", "Sora", "@sora", soraPhoto, "3 hrs ago", "کیفیت صدای این نسخه واقعاً بالاست 🎧", 141, BADGES.fanOfMonth),
  fan("c-ph-6", "Seojin", "@seojin", seojinPhoto, "5 hrs ago", "the lyric translation here made me understand it twice over", 118, BADGES.chart),
  fan("c-ph-7", "Haru", "@haru", haruPhoto, "8 hrs ago", "underrated in the discography, I said what I said", 72, BADGES.rookie),
  fan("c-ph-8", "Jun", "@jun", junPhoto, "11 hrs ago", "first 10 seconds and I already added it to my playlist", 58, BADGES.streak),
];

const CHERRY_STATIC: Comment[] = [
  {
    id: "c-cs-1",
    author: "PRISM9",
    handle: "@prism9",
    photo: prism9Photo,
    time: "4 hrs ago",
    text: "Cherry Static was recorded in one take. You can hear us laughing at the end.",
    fires: 1640,
    badge: BADGES.artist,
    verified: true,
    fromArtist: true,
    replies: [fan("c-cs-1r1", "Jxnnie", "@jxnnie", jxnniePhoto, "3 hrs ago", "leave it in the mix, it's perfect", 88, BADGES.streak)],
  },
  fan("c-cs-2", "Taehyun", "@taehyun", taehyunPhoto, "15 min ago", "that guitar tone is pure static and I mean it as a compliment", 296, BADGES.streak),
  fan("c-cs-3", "Sora", "@sora", soraPhoto, "1 hr ago", "چری استاتیک رو ده بار پشت سر هم گوش دادم 😅", 213, BADGES.fanOfMonth),
  fan("c-cs-4", "Yunha", "@yunha", yunhaPhoto, "2 hrs ago", "three songs in and PRISM9 already owns my spring", 188, BADGES.topListener),
  fan("c-cs-5", "Jun", "@jun", junPhoto, "6 hrs ago", "the tempo change at 1:55 is the best thing on this shelf", 104, BADGES.streak),
  fan("c-cs-6", "Ari", "@ari", ariPhoto, "9 hrs ago", "queueing the whole album after this", 66, BADGES.rookie),
  fan("c-cs-7", "Minho", "@minho", minhoPhoto, "12 hrs ago", "not a single skip in this one", 49, BADGES.moderator),
];

/** everything else gets the same friendly thread so no track looks abandoned */
const GENERIC: Comment[] = [
  fan("c-g-1", "Yunha", "@yunha", yunhaPhoto, "22 min ago", "adding this to the top of my queue right now 🔥", 246, BADGES.topListener),
  fan("c-g-2", "Miso K.", "@miso.k", misoPhoto, "1 hr ago", "the mix on this is so clean, headphones please", 180, BADGES.chart),
  fan("c-g-3", "Sora", "@sora", soraPhoto, "2 hrs ago", "وای این چقدر خوبه 🎶", 132, BADGES.fanOfMonth),
  fan("c-g-4", "Jxnnie", "@jxnnie", jxnniePhoto, "4 hrs ago", "who else found this from the Trending shelf?", 97, BADGES.streak),
  fan("c-g-5", "Ari", "@ari", ariPhoto, "6 hrs ago", "the second verse deserves its own award", 61, BADGES.rookie),
  fan("c-g-6", "Jun", "@jun", junPhoto, "9 hrs ago", "played it twice before the app even finished loading", 38, BADGES.streak),
];

export const commentThreads: Record<string, Comment[]> = {
  nt1: AFTERGLOW,
  nt2: MIDNIGHT_SEOUL,
  nt3: PAPER_HEART,
  tr3: CHERRY_STATIC,
};

export const fallbackThread: Comment[] = GENERIC;

export const threadFor = (trackId: string): Comment[] => commentThreads[trackId] ?? fallbackThread;

/** how many comments show before “load more” */
export const PAGE_SIZE = 6;

/** quick lookup for “reported as …” copy */
export const REPORT_LABEL: Record<string, string> = {
  spam: "spam",
  harassment: "harassment",
  spoiler: "a spoiler",
  misinfo: "misinformation",
  other: "something else",
};

/** reasons the report sheet offers */
export const REPORT_REASONS = [
  { id: "spam", label: "Spam or advertising", hint: "Repeated promos, links or scams" },
  { id: "harassment", label: "Harassment or hate", hint: "Targeting a fan, an artist or a group" },
  { id: "spoiler", label: "Spoiler", hint: "Leaks or unreleased material" },
  { id: "misinfo", label: "Misinformation", hint: "Fake charts, fake tour dates" },
  { id: "other", label: "Something else", hint: "Our moderators will take a look" },
] as const;
