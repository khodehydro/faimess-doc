/* ------------------------------------------------------------------ *
 *  Icon build — turns the "Lets Icons" pack into src/ui/icons.gen.ts.
 *
 *  The pack is "Lets Icons" / "Free Icon Pack 1800+ icons" by Leonid
 *  Tsvetkov, published on the Figma community and mirrored on Iconify as
 *  the `lets-icons` collection (CC BY 4.0 — see docs/icons.md).
 *
 *  This script is the *only* place that knows which site icon comes from
 *  which pack icon. Everything else (src/ui/Icon.tsx, the sections, the
 *  data files) keeps using the site's own names, so swapping the artwork
 *  never touches a call site.
 *
 *    node tools/icons/build.mjs           # write src/ui/icons.gen.ts
 *    node tools/icons/build.mjs --check   # fail if the file is stale
 *
 *  The collection is read from tools/icons/lets-icons.json when it is
 *  there (it is git-ignored: ~900 kB), otherwise it is downloaded from the
 *  GitHub mirror of the Iconify sets:
 *
 *    curl -L -H "Accept: application/vnd.github.raw" \
 *      https://api.github.com/repos/iconify/icon-sets/contents/json/lets-icons.json \
 *      -o tools/icons/lets-icons.json
 * ------------------------------------------------------------------ */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CACHE = resolve(HERE, "lets-icons.json");
const OUT = resolve(ROOT, "src/ui/icons.gen.ts");
const SOURCE_URL =
  "https://api.github.com/repos/iconify/icon-sets/contents/json/lets-icons.json";

/**
 * site name → pack name. The left side is what the app writes in JSX
 * (`<Icon name="heart" />`); the right side is the name inside the pack.
 *
 * Where the pack has no literal match the nearest icon is used, and why is
 * written down in docs/icons.md — no geometry is drawn by hand here.
 */
const MAP = {
  home: "home",
  calendar: "calendar",
  activity: "chart", // bars in a frame — "how busy it is right now"
  message: "chat", // the pack's `message` is an envelope; `chat` is the bubble
  settings: "setting-alt-line",
  search: "search",
  bell: "bell",
  folder: "folder",
  clock: "clock",
  lock: "lock",
  star: "star",
  send: "send-hor", // the paper plane, and it is drawn as a stroke
  chevronLeft: "expand-left",
  chevronRight: "expand-right",
  grid: "darhboard",
  list: "sort", // three stacked lines
  check: "done",
  plus: "add",
  sparkle: "dimond", // no sparkle in the pack — the gem reads as "shiny"
  pin: "pin",
  users: "group",
  video: "video",
  compass: "compass",
  arrowUpRight: "external", // the box-with-an-arrow-out mark
  arrowLeft: "arrow-left-long",
  arrowRight: "arrow-right-long",
  close: "close-round",
  radio: "target", // concentric circles: "live / on air"
  more: "meatballs-menu",
  trend: "line-up",
  map: "direction", // the pack's `map` is a picture frame; this one has the route
  play: "play",
  pause: "stop", // the pack draws its pause as two rounded bars
  mic: "mic",
  disc: "doughnut-chart", // no vinyl in the pack — the ring reads as a record
  music: "music",
  heart: "favorite",
  /* the same heart, solid. The stroke `favorite` is the un-liked state; the
     filled cut is what a liked song wears, so the shape itself changes and
     not just its colour. */
  heartFill: "favorite-fill",
  shuffle: "sort-random",
  headphones: "headphones-fill-light", // only the `-light` cut is a stroke
  waveform: "stat", // three rounded bars, the "now playing" equaliser
  download: "arhive-load", // the tray the arrow drops into — the pack's own
  // `download` is a cloud with an arrow pointing *up*, which read as an upload
  expand: "full-screen-corner",
  collapse: "collapse",
  flame: "fire",
  crown: "trophy",
  medal: "sertificate",
  verified: "chield-check", // the pack's own spelling
  news: "paper",
  bolt: "lightning",
  share: "group-share", // people + a share mark — the pack has no plain "share"
  edit: "edit", // the pencil behind every "rename / edit this list" affordance
  copy: "copy",
  folderPlus: "folder-add",
  sun: "sun",
  moon: "moon",
  globe: "globe",
  shop: "shop-light", // the storefront, drawn as a stroke like every other menu icon
};

/** Bodies keep the pack's own stroke width; the pack's default (2 on the
 *  24 grid) is dropped so the icon inherits the width of its call site,
 *  exactly like the hand-drawn set it replaces did. */
const PACK_DEFAULT_STROKE = / stroke-width="2"/g;

async function loadCollection() {
  if (existsSync(CACHE)) return JSON.parse(await readFile(CACHE, "utf8"));
  const res = await fetch(SOURCE_URL, {
    headers: {
      Accept: "application/vnd.github.raw",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) {
    throw new Error(
      `could not download lets-icons.json (${res.status}). Fetch it with curl (see the header of this file) into tools/icons/lets-icons.json and run again.`,
    );
  }
  return res.json();
}

function render(collection) {
  const pack = collection.icons;
  const unknown = Object.entries(MAP).filter(([, packName]) => !pack[packName]);
  if (unknown.length) {
    throw new Error(
      `these pack icons do not exist: ${unknown.map(([k, v]) => `${k}→${v}`).join(", ")}`,
    );
  }
  const lines = Object.entries(MAP).map(([siteName, packName]) => {
    const body = pack[packName].body.replace(PACK_DEFAULT_STROKE, "");
    return `  ${siteName}: ${JSON.stringify(body)},`;
  });
  return `/* ------------------------------------------------------------------ *
 *  GENERATED FILE — do not edit. Run \`node tools/icons/build.mjs\`.
 *
 *  Icon artwork: "Lets Icons" / "Free Icon Pack 1800+ icons" by Leonid
 *  Tsvetkov — https://www.figma.com/community/file/886554014393250663
 *  Licensed CC BY 4.0. Mirrored through Iconify (\`lets-icons\`).
 *  The site name → pack name table lives in tools/icons/build.mjs and the
 *  reasoning behind every substitution is in docs/icons.md.
 * ------------------------------------------------------------------ */

export const ICON_BODIES = {
${lines.join("\n")}
} as const;

export type GeneratedIconName = keyof typeof ICON_BODIES;
`;
}

const collection = await loadCollection();
const next = render(collection);

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? await readFile(OUT, "utf8") : "";
  if (current !== next) {
    console.error("src/ui/icons.gen.ts is out of date — run: node tools/icons/build.mjs");
    process.exit(1);
  }
  console.log(`icons.gen.ts is up to date (${Object.keys(MAP).length} icons)`);
} else {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, next);
  console.log(`wrote src/ui/icons.gen.ts — ${Object.keys(MAP).length} icons`);
}
