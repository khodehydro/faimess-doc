/* ------------------------------------------------------------------ *
 *  SSR smoke check (tooling only, never shipped to the browser bundle).
 *  Renders every page to a string in Node and asserts the structure and
 *  that real photography is wired in. Run with:
 *    npm run check:ssr
 * ------------------------------------------------------------------ */

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { AppProvider } from "../src/app/AppContext";
import { PlayerProvider } from "../src/app/PlayerContext";
import { CommentsProvider } from "../src/app/CommentsContext";
import { ContributionsProvider } from "../src/app/ContributionsContext";
import { PreferencesProvider } from "../src/app/PreferencesContext";
import { AuthProvider } from "../src/app/AuthContext";
import { PlaylistsProvider } from "../src/app/PlaylistsContext";
import { ProfileMenuContent } from "../src/sections/AccountCard";
import { ArtistStories } from "../src/sections/ArtistStories";
import { NavCard } from "../src/sections/NavCard";
import { Stage } from "../src/app/Stage";
import { ToastHost } from "../src/app/ToastHost";
import { Icon } from "../src/ui/Icon";
import { backIcon, dirSign, forwardIcon, trackRatio } from "../src/lib/rtl";
import {
  LANGS,
  STRINGS,
  THEMES,
  fill,
  localizeDigits,
  tData,
  type Lang,
  type Theme,
  type TVars,
} from "../src/data/i18n";
import { PlayerSection } from "../src/sections/PlayerSection";
import { ActiveUsers } from "../src/sections/feed/ActiveUsers";
import { DownloadPage } from "../src/pages/DownloadPage";
import { HomePage } from "../src/pages/HomePage";
import { Gate, Shell } from "../src/app/App";
import type { Detail } from "../src/app/AppContext";
import { ArtistsPage } from "../src/pages/ArtistsPage";
import { AlbumsPage } from "../src/pages/AlbumsPage";
import { PlaylistsPage } from "../src/pages/PlaylistsPage";
import { NewsPage } from "../src/pages/NewsPage";
import { albums, artists, playlists } from "../src/data/library";
import { banners } from "../src/data/banners";
import { DEMO_ACCOUNT, checkCredential } from "../src/data/auth";
import {
  activeUsers,
  followedArtists,
  newsItems,
  newestTracks,
  trendingTracks,
} from "../src/data/feed";
import { conversations } from "../src/data/messages";
import { ME_ACTIVITY, me } from "../src/data/account";
import { QUEUE, lyricsFor, trackById } from "../src/data/player";
import { POINT_RULES, fanLines, fanPoints } from "../src/data/points";
import { compactNumber, withThousands } from "../src/lib/format";
import {
  PLAYLIST_COVERS,
  coverById,
  isCoverId,
  type UserPlaylist,
} from "../src/data/playlists";
import {
  COMMUNITY_LYRICS,
  LYRICS,
  LYRIC_REWARD,
  parseSubmission,
  submissionProblem,
} from "../src/data/lyrics";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/* minimal browser surface for React + framer-motion */
const g = globalThis as unknown as Record<string, unknown>;
if (!g.window) {
  g.window = {
    location: { hash: "#/home", pathname: "/", href: "http://localhost/#/home" },
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false, media: "", addEventListener() {}, removeEventListener() {} }),
    innerWidth: 1580,
    innerHeight: 889,
    devicePixelRatio: 1,
    scrollTo() {},
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (fn: (t: number) => void) => setTimeout(() => fn(0), 16),
    cancelAnimationFrame: (id: number) => clearTimeout(id),
  };
  g.document = {
    addEventListener() {},
    removeEventListener() {},
    documentElement: { style: {}, classList: { add() {}, remove() {} } },
    body: { style: {}, classList: { add() {}, remove() {} } },
    getElementById: () => null,
  };
}

let pass = 0;
let fail = 0;
const results: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass += 1;
    results.push(`  PASS  ${name}`);
  } else {
    fail += 1;
    results.push(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** SSR drops `<!-- -->` between adjacent text nodes — strip them before matching prose */
const plain = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "");

type RenderOpts = {
  /** force the interface language instead of reading localStorage */
  lang?: Lang;
  /** `null` renders the door; a name renders the signed-in app */
  user?: string | null;
  /** force the appearance */
  theme?: Theme;
  /** load the player with this track — omit for the empty state */
  trackId?: string;
  /** playlists the listener already built */
  playlists?: UserPlaylist[];
  /** open the frame with this detail card already showing */
  detail?: Detail;
};

const render = (Page: () => ReactElement, opts: RenderOpts = {}) =>
  renderToString(
    <AppProvider initialDetail={opts.detail ?? null}>
      <PlayerProvider initialTrackId={opts.trackId}>
        <CommentsProvider>
          <ContributionsProvider>
            <PreferencesProvider initialLang={opts.lang} initialTheme={opts.theme}>
              {/* `user: null` is a real value — the door — so only an
                  *absent* option falls back to a session */}
              <AuthProvider initialUser={opts.user === undefined ? "admin" : opts.user}>
                <PlaylistsProvider initial={opts.playlists}>
                  <Page />
                </PlaylistsProvider>
              </AuthProvider>
            </PreferencesProvider>
          </ContributionsProvider>
        </CommentsProvider>
      </PlayerProvider>
    </AppProvider>,
  );

/** the right-hand card, rendered on its own */
const PlayerCard = () => <PlayerSection params={{ expanded: false, onToggleExpand: () => {} }} />;
const ProfileMenu = () => (
  <ProfileMenuContent
    onClose={() => {}}
    onContributions={() => {}}
    onPoints={() => {}}
    onSignOut={() => {}}
  />
);

/* ------------------------------- pages ------------------------------- */

const home = render(HomePage);
/** the whole frame: content card + the player, which now lives on every route */
const shell = render(Shell);
check("home renders", home.length > 2000, `${home.length} chars`);
check("home shows photography", (home.split(".webp").length - 1) >= 20, `${home.split(".webp").length - 1} images`);
for (const title of ["Artists you follow", "Newest songs", "Trending now", "Latest news", "Fresh albums", "Active listeners"]) {
  check(`shelf “${title}”`, home.includes(title));
}
/* the banner is artwork + two glass rails, and nothing else (v17) */
/* ------------------------------- density (v21) ------------------------ */

const cssSrc = readFileSync("src/index.css", "utf8");
/* the static shell: the meta the browser reads before any React runs */
const indexHtml = readFileSync("index.html", "utf8");
const feedSrc = readFileSync("src/sections/feed/index.tsx", "utf8");
const shelfSrc = readFileSync("src/sections/feed/Shelf.tsx", "utf8");
check(
  "one density token drives every padding and gap",
  cssSrc.includes("--spacing: 0.28rem"),
  "raised from Tailwind's 0.25rem default — see docs §15",
);
check(
  "shelf headers stick to a measured strip, not to a guess",
  feedSrc.includes("SHELF_STICKY_VAR") &&
    feedSrc.includes("ResizeObserver") &&
    shelfSrc.includes("SHELF_STICKY_VAR") &&
    shelfSrc.includes("scrollMarginTop"),
  "the strip publishes its height; the header and the scroll offset read it",
);
/** every .tsx under a folder, so the sweep can't miss a surface */
function sweep(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) sweep(path, out);
    else if (entry.name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

const TYPE_FLOOR = /text-\[(\d+(?:\.\d+)?)px\]/g;
check(
  "nothing under 12px is left in the interface",
  sweep("src").every((file) =>
    [...readFileSync(file, "utf8").matchAll(TYPE_FLOOR)].every((m) => Number(m[1]) >= 12),
  ),
  "12px is the floor the type scale settled on (docs §8)",
);

const heroSrc = readFileSync("src/sections/HeroBanner.tsx", "utf8");
const newsPageSrc = readFileSync("src/pages/NewsPage.tsx", "utf8");
check(
  "hero banner shows its art and its two lines",
  home.includes(banners[0].photo) &&
    home.includes(banners[0].title) &&
    home.includes(banners[0].subtitle),
  `${banners.length} slides, the live one on screen`,
);
check(
  "every slide carries a title and a subtitle",
  banners.every((b) => b.title.trim().length > 0 && b.subtitle.trim().length > 0),
  "the English source of truth stays in the data file",
);
check(
  "the hero and the K-pop desk read in the reader's language",
  banners.every((b) => STRINGS[`banner.${b.id}.title`] && STRINGS[`banner.${b.id}.subtitle`]) &&
    newsItems.every((n) => STRINGS[`news.${n.id}.title`] && STRINGS[`news.${n.id}.excerpt`]) &&
    heroSrc.includes("text(`banner.${banner.id}.title`, banner.title)") &&
    newsPageSrc.includes("text(`news.${item.id}.title`, item.title)"),
  "editorial copy is translated; a track title or a fan's comment stays as written",
);
check(
  "a black gradient rises from the banner's bottom edge",
  heroSrc.includes("bg-gradient-to-t") &&
    /from-black\/[6-9][0-9]/.test(heroSrc) &&
    heroSrc.includes("banner.title") &&
    heroSrc.includes("banner.subtitle"),
  "the scrim is what the title and subtitle sit on",
);
check(
  "the banner's only chrome is an indicator, centred on the bottom edge",
  heroSrc.includes("bottom-5") &&
    heroSrc.includes("justify-center") &&
    heroSrc.includes("aria-current") &&
    heroSrc.includes("banners.map((b, i)"),
  "dots, one per slide, tappable",
);
check(
  "no card, badge, bell, arrow or glass rail is left on the banner",
  !heroSrc.includes("bell") &&
    !heroSrc.includes("openTickets") &&
    !heroSrc.includes("stops.map") &&
    !heroSrc.includes("withThousands") &&
    !heroSrc.includes("CircleButton") &&
    !heroSrc.includes("GlassStep") &&
    !heroSrc.includes("backIcon") &&
    !heroSrc.includes("forwardIcon") &&
    !heroSrc.includes("backdrop-blur"),
);

/* ------------------------------ the player ---------------------------- */

check(
  "right card is the player",
  shell.includes('aria-label="Music management"') && !shell.includes("Enter Text..."),
  "the rail's label is the player's own — messages composer must be gone",
);
check("player opens empty", shell.includes("nothing playing yet"));
check(
  "the player header shows the play count, not the word “Player”",
  readFileSync("src/sections/PlayerSection.tsx", "utf8").includes('t("player.plays"') &&
    QUEUE.every((t) => t.plays > 0),
  `top track: ${compactNumber(QUEUE[0].plays)}`,
);
check(
  "compact play counts read the way people write them",
  compactNumber(2_000) === "2K" && compactNumber(2_431_902) === "2.4M",
  "2,000 → 2K · 2,431,902 → 2.4M",
);

check("queue has every feed song, once", new Set(QUEUE.map((t) => `${t.title}|${t.artist}`)).size === QUEUE.length, `${QUEUE.length} tracks`);
check("queue entries carry a length", QUEUE.every((t) => t.seconds > 60), `${QUEUE.map((t) => t.seconds).join(", ")}`);
check(
  "every feed song has an editorial sheet — bar the fresh release",
  QUEUE.filter((t) => (t.id.startsWith("nt") || t.id.startsWith("tr")) && t.id !== "nt7").every(
    (t) => (lyricsFor(t)?.length ?? 0) >= 4,
  ) &&
    /* nt7 is the deliberate no-sheet case: a song that landed minutes ago,
       first on the Newest shelf, so the player's empty sheet is one click
       from home and the "send the lyrics" door has a real reason to exist */
    lyricsFor(trackById("nt7")) === null &&
    newestTracks[0].id === "nt7",
  "Afterimage (nt7) is the newest row and the one with no sheet",
);
check("three album cuts ship with no sheet", QUEUE.filter((t) => lyricsFor(t) === null).length >= 3, "so fans can send one");
check("a fan sheet already covers one of them", (COMMUNITY_LYRICS.sm1?.lines.length ?? 0) >= 4);
check("a sheet under two lines is refused", submissionProblem("한 줄만") !== null && submissionProblem("") !== null);
check("a real sheet passes review", submissionProblem("해가 진 뒤에도\n노을이 번져\n우리는 천천히 걸어") === null);
check("lyrics keys all resolve to queue ids", Object.keys(LYRICS).every((id) => QUEUE.some((t) => t.id === id)), Object.keys(LYRICS).join(", "));
check("every lyric line is bilingual", Object.values(LYRICS).every((lines) => lines.every((l) => l.ko.length > 0 && l.fa.length > 0)));
check("lyric timings ascend", Object.values(LYRICS).every((lines) => lines.every((l, i) => i === 0 || l.at > lines[i - 1].at)));
check("trending aliases resolve", trackById("tr1")?.id === "nt2" && trackById("tr2")?.id === "nt1" && trackById("tr4")?.id === "nt3");
check("every feed row maps to a playable track", [...newestTracks, ...trendingTracks].every((t) => trackById(t.id) !== null));

/* ------------------------------ typography ---------------------------- */

const css = readFileSync("src/index.css", "utf8");
const fontFiles = [
  ...[400, 500, 600, 700, 800].map((w) => `src/assets/fonts/pretendard-ko-${w}.woff2`),
  ...[400, 500, 600, 700, 800].map((w) => `src/assets/fonts/vazirmatn-${w}.woff2`),
  ...[400, 500, 600, 700, 800].map((w) => `src/assets/fonts/vazirmatn-latin-${w}.woff2`),
];
check("Korean + Latin/Persian faces ship locally", fontFiles.every((f) => existsSync(f)), `${fontFiles.length} files`);
check("Korean faces are declared", css.includes("pretendard-ko-") && css.includes("unicode-range: U+AC00-D7A3"));
check("Vazirmatn is the global English/Persian face", css.includes("--font-fa:") && css.includes('--font-sans: "Vazirmatn"') && css.includes('--font-display: "Vazirmatn"'));
check("empty player invites a first play", shell.includes("Start with") && shell.includes("دوست داری"));

/* ---------------------------- preferences ---------------------------- */
/* language + appearance live on <html>; the SSR pass checks the tables and
   the profile menu that drives them */
check(
  "three languages ship, Persian right-to-left",
  LANGS.length === 3 &&
    LANGS.some((l) => l.id === "fa" && l.dir === "rtl") &&
    LANGS.some((l) => l.id === "ko") &&
    LANGS.some((l) => l.id === "en"),
  LANGS.map((l) => `${l.id}:${l.dir}`).join(" "),
);
check(
  "every string is translated three ways",
  Object.values(STRINGS).every((e) => e.en.length > 0 && e.fa.length > 0 && e.ko.length > 0),
  `${Object.keys(STRINGS).length} keys`,
);
check("persian copy is real persian", /[\u0600-\u06FF]/.test(STRINGS["player.plays"].fa));
check("korean copy is real hangul", /[\uac00-\ud7a3]/.test(STRINGS["nav.home"].ko));
check("placeholders survive filling", fill("Hey {name}", { name: "Seora" }) === "Hey Seora");
check("two appearance options", THEMES.length === 2 && THEMES.map((t) => t.id).join() === "light,dark");
check(
  "dark tokens + variant are declared",
  css.includes('@custom-variant dark') &&
    css.includes('[data-theme="dark"]') &&
    /\[data-theme="dark"\][\s\S]{0,400}--color-surface:/.test(css),
);

/* the loaded state — a real render of the card with a track in it */
const playingCard = render(PlayerCard, { trackId: "nt1" });
check("loaded player shows the track", playingCard.includes("Afterglow") && playingCard.includes("NOVAE"));
check(
  "loaded player shows details",
  playingCard.includes("Afterglow") && playingCard.includes("2.4M plays"),
  "artist and album, and the play count where the title used to be",
);
check(
  "korean lyrics render",
  /[\uac00-\ud7a3]{2,}/.test(plain(playingCard)),
  "the sheet itself is Korean — no language chip needed",
);
check("persian translation renders", playingCard.includes("نور"));
check("seek bar is a slider", playingCard.includes('role="slider"') && playingCard.includes("aria-valuetext"));
check("download button ships", playingCard.includes("Download — Android app only"));
check(
  "download is a single-tone twin of the heart",
  !playingCard.includes("bg-mint-soft") && !playingCard.includes("bg-teal-soft"),
);
check("expand button ships", playingCard.includes("Expand the player"));
check("every track carries the demo audio", QUEUE.every((t) => typeof t.audio === "string" && t.audio.length > 0));
{
  const size = existsSync("src/assets/audio/faimess-demo.mp3")
    ? statSync("src/assets/audio/faimess-demo.mp3").size
    : 0;
  check("demo master is on disk", size > 500_000, `${(size / 1048576).toFixed(2)}MB`);
}
check("expanded player has a layout rule", readFileSync("src/index.css", "utf8").includes("home-split-wide"));
check("rail ships behind more", playingCard.includes("More — queue, liked songs, playlists"));
check("rail labels are in the markup", ["Play queue", "Liked songs", "Your playlists"].every((l) => playingCard.includes(l)));
check("rail starts hidden", playingCard.includes("inert=") || playingCard.includes("inert"));
{
  /* the lyric sheet is centred: find the first line and look back for the class */
  const plainCard = plain(playingCard);
  const firstLine = plainCard.indexOf(LYRICS["nt1"][0].ko);
  const before = firstLine > 0 ? plainCard.slice(Math.max(0, firstLine - 400), firstLine) : "";
  check(
    "lyric lines are centred",
    firstLine > 0 && before.includes("text-center"),
    firstLine > 0 ? "class not on the line wrapper" : "first lyric line missing",
  );
}
check("the playing track can be liked", playingCard.includes("Remove from Liked songs") && playingCard.includes('aria-pressed="true"'));

/* a track with no editorial sheet — the fan submission loop */
const noSheet = render(PlayerCard, { trackId: "pb1" });
check("a sheetless track invites the fans", noSheet.includes("No lyrics for this one yet"));
check("the empty panel carries the send button", noSheet.includes("Send the lyrics"));
check("the panel says what approval pays", noSheet.includes(`+${LYRIC_REWARD} fan points`));
check("no editorial lines leak into the empty sheet", !noSheet.includes("Paper Boats · SEORA") || noSheet.includes("No lyrics"));

const fanSheet = render(PlayerCard, { trackId: "sm1" });
check("an approved fan sheet renders as the lyrics", fanSheet.includes("Slow motion, we don’t have to run"));
check(
  "the fan gets the credit line",
  plain(fanSheet).includes("Fan sheet by you") && plain(fanSheet).includes("approved by the mods"),
);
check("the account carries a points balance", me.points > 0 && plain(fanSheet).includes(`+${LYRIC_REWARD} pts`));
check("moderator actions exist in the provider", ["approve", "reject"].every((k) => readFileSync("src/app/ContributionsContext.tsx", "utf8").includes(k)));
check(
  "submission parsing keeps the stamps",
  parseSubmission("[00:30] line one\n[00:12] line two", "", 200).map((l) => l.at).join(",") === "12,30",
);

/* ------------------------------- comments ----------------------------- */

check("composer sits at the bottom of the card", playingCard.includes("Add a comment…"));
check("comments show a count and a see-all", playingCard.includes("See all") && playingCard.includes("Comments"));
check("the newest comment previews", playingCard.includes("the fan thread" ) || playingCard.includes("4am in the tour van"));
check("avatars carry their latest award", playingCard.includes("Top listener · Season 12"));
{
  const liked = ["nt1", "tr3", "tr5"];
  check("liked ids come from the queue", liked.every((id) => QUEUE.some((t) => t.id === id)));
}

/* ------------------- your playlists: share, add, cover ---------------- */

const mineSeed: UserPlaylist[] = [
  {
    id: "mine-check-1",
    name: "Rainy commute",
    cover: "rainy-window",
    trackIds: ["nt1", "tr3"],
    createdAt: 1_700_000_000_000,
  },
];

/* ------------------- the detail card (playlists / artists / albums) --- */

const detailAlbum = render(Shell, { detail: { kind: "album", id: "al-afterglow" } });
const detailArtist = render(Shell, { detail: { kind: "artist", id: "ar-novae" } });
const detailMine = render(Shell, { detail: { kind: "playlist", id: mineSeed[0].id }, playlists: mineSeed });
check(
  "an album opens inside the content card, next to the player",
  plain(detailAlbum).includes("Afterglow") &&
    plain(detailAlbum).includes("Play all") &&
    !plain(detailAlbum).includes(STRINGS["detail.edit"].en) &&
    detailAlbum.includes('aria-label="Music management"'),
  "the detail card and the player are on screen at the same time",
);
check(
  "an artist opens the same way",
  plain(detailArtist).includes("NOVAE") && detailArtist.includes('aria-label="Music management"'),
);
check(
  "a saved playlist opens with its own tracks and an edit affordance",
  plain(detailMine).includes(mineSeed[0].name) &&
    plain(detailMine).includes("Afterglow") &&
    plain(detailMine).includes(STRINGS["detail.edit"].en),
  "the list plays; editing is a button inside it, not a page",
);
check(
  "the player card is the shell's, so it survives every route",
  readFileSync("src/app/App.tsx", "utf8").includes('id="player"') &&
    ["ArtistsPage", "AlbumsPage", "PlaylistsPage", "NewsPage", "DownloadPage", "ShopPage"].every(
      (page) =>
        !readFileSync(`src/pages/${page}.tsx`, "utf8").includes("SurfaceCard") &&
        !readFileSync(`src/pages/${page}.tsx`, "utf8").includes("SectionSlot id=\"player\""),
    ),
  "pages render content only; the frame owns the cards",
);
check(
  "clicking a card opens a detail instead of leaving the layout",
  ["src/sections/CollectionSection.tsx", "src/sections/feed/FollowedArtists.tsx", "src/sections/feed/NewAlbums.tsx"].every(
    (file) => readFileSync(file, "utf8").includes("openDetail("),
  ) &&
    !readFileSync("src/sections/CollectionSection.tsx", "utf8").includes('navigate("playlists")'),
);
check(
  "a chip holds its highlight while its own scroll is running",
  readFileSync("src/sections/feed/index.tsx", "utf8").includes("jumpLock"),
  "one click moves the strip; the scroll listener can't win the race",
);


/* ------------------------ fan points (five rules) -------------------- */

check(
  "points come from exactly five rules, each with a label, a rate and a unit",
  POINT_RULES.length === 5 &&
    POINT_RULES.every((r) => r.value > 0 && STRINGS[r.labelKey] && STRINGS[r.rateKey] && STRINGS[r.countKey]),
  POINT_RULES.map((r) => `${r.id} ${r.value}`).join(" · "),
);
check(
  "a comment is worth a quarter and a joined invite three",
  POINT_RULES.find((r) => r.id === "comments")!.value === 0.25 &&
    POINT_RULES.find((r) => r.id === "invites")!.value === 3,
);
check(
  "the account's balance is exactly what its activity adds up to",
  fanPoints(ME_ACTIVITY) === me.points,
  `${fanPoints(ME_ACTIVITY)} points from ${fanLines(ME_ACTIVITY).length} lines`,
);
check(
  "the rules actually move the total",
  fanPoints({ ...ME_ACTIVITY, comments: ME_ACTIVITY.comments + 4 }) - fanPoints(ME_ACTIVITY) === 1 &&
    fanPoints({ ...ME_ACTIVITY, invites: ME_ACTIVITY.invites + 1 }) - fanPoints(ME_ACTIVITY) === 3 &&
    fanPoints({ ...ME_ACTIVITY, lyricSheets: ME_ACTIVITY.lyricSheets + 1 }) - fanPoints(ME_ACTIVITY) === 120,
  "4 comments = 1 point · 1 invite = 3 · 1 sheet = 120",
);
check(
  "every leaderboard balance is derived from an activity record",
  activeUsers.every((u) => fanPoints(u.activity) > 0 && u.activity.days > 0) &&
    activeUsers.every((u, i) => i === 0 || fanPoints(activeUsers[i - 1].activity) > fanPoints(u.activity)),
  "and the ladder still runs top to bottom",
);

/* the numbers themselves — the shelf sends you to the table, and the table
   reads the same five rules the cards do */
const leaderSrc = readFileSync("src/ui/LeaderboardDialog.tsx", "utf8");
const pointsDialogSrc = readFileSync("src/ui/PointsDialog.tsx", "utf8");
const activeUsersSrc = readFileSync("src/sections/feed/ActiveUsers.tsx", "utf8");
check(
  "the leaderboard table is built from the rules, not a second copy of them",
  leaderSrc.includes("POINT_RULES.map") &&
    leaderSrc.includes("Record<PointRuleId, string>") &&
    leaderSrc.includes("countFor(") &&
    leaderSrc.includes("fanPoints("),
  "one column per rule · widths keyed by rule id · totals derived",
);
check(
  "the shelf card opens that table",
  activeUsersSrc.includes("LeaderboardDialog") && activeUsersSrc.includes("fanPoints(user.activity)"),
);
const feedIndexSrc = readFileSync("src/sections/feed/index.tsx", "utf8");
const navCardSrc = readFileSync("src/sections/NavCard.tsx", "utf8");
const appSrc = readFileSync("src/app/App.tsx", "utf8");
const brandSrc = readFileSync("src/sections/BrandCard.tsx", "utf8");
const accountSrc = readFileSync("src/sections/AccountCard.tsx", "utf8");
const playerSrc = readFileSync("src/sections/PlayerSection.tsx", "utf8");
check(
  /* an empty sheet is centred in the whole slot and still fits: the CTA and
     its reward line must never slide under the comments strip */
  "the empty sheet centres itself in the slot",
  playerSrc.includes("m-auto flex flex-col items-center") &&
    playerSrc.includes("flex min-h-0 flex-1 flex-col overflow-y-auto") &&
    playerSrc.includes('lines ? "pb-8" : "pt-2 pb-2"') &&
    playerSrc.includes("t(\"lyrics.pay\""),
  "m-auto, no min-h-full guesswork",
);
check(
  "the lyrics sheet has no header of its own",
  !playerSrc.includes("lyrics.title") && !playerSrc.includes("한국어"),
  "the lines start straight under the player; only a credit line can sit above them",
);
/* ------------------- compact shell: phones + tablets ------------------ */

const compactSrc = readFileSync("src/app/CompactShell.tsx", "utf8");
const storiesSrc = readFileSync("src/sections/ArtistStories.tsx", "utf8");
const mobileNavSrc = readFileSync("src/sections/MobileNav.tsx", "utf8");
const miniSrc = readFileSync("src/sections/MiniPlayer.tsx", "utf8");
const trendingTracksSrc = readFileSync("src/sections/feed/TrendingTracks.tsx", "utf8");
const sheetSrc = readFileSync("src/sections/PlayerSheet.tsx", "utf8");
const compactHookSrc = readFileSync("src/hooks/useCompact.ts", "utf8");
/* also read further down (shop section) — declared once, here, because the
   compact guards above need it */
const collectionSrc = readFileSync("src/sections/CollectionSection.tsx", "utf8");

check(
  "under 1024px the app is the compact shell",
  compactHookSrc.includes('"(max-width: 1023px)"') &&
    appSrc.includes("if (compact) return <CompactShell />") &&
    appSrc.includes('from "./CompactShell"') &&
    /* one breakpoint for both worlds: the hook is built on matchMedia, the
       art-board on `innerWidth >= 1024`, and they must stay the same line —
       so the shell is *not* done with Tailwind `max-lg:` variants, which
       would be a second, silently divergent copy of the number */
    compactHookSrc.includes("window.matchMedia") &&
    !compactSrc.includes("max-lg:") &&
    !compactSrc.includes("lg:hidden"),
  "same 1024 line as the stage — below it, bottom nav and mini player",
);
check(
  "a collection header stacks on a phone instead of running under its chips",
  /* one row cannot hold a 26px title and five pills on a handset: the title
     takes the first line, the chips scroll on the second */
  collectionSrc.includes("min-w-0 basis-full lg:basis-auto") &&
    collectionSrc.includes("flex-1 items-center gap-2 overflow-x-auto py-1 lg:ms-auto") &&
    /* `max-lg:hidden`, not `hidden`: the pill sets its own `inline-flex` and
       the cascade emits `.hidden` first, so a bare `hidden` never hides it */
    collectionSrc.includes('className="ms-1 shrink-0 max-lg:hidden"') &&
    /* the chips must stay on the title's row (far end) on desktop */
    collectionSrc.includes("lg:flex-none lg:overflow-visible"),
  "basis-full under 1024px, ms-auto above it",
);
/* ------------------------ the door (login / logout) -------------------- *
 *  The demo credential is admin/admin, and the dashboard is only mounted
 *  once there is a session — the gate is the difference between the two
 *  renders below, not a hidden div.                                    */

const door = render(Gate, { user: null });
const inside = render(Gate, { user: "admin" });
check(
  "with no session the app renders the door, not the dashboard",
  plain(door).includes("Sign in") &&
    plain(door).includes("Demo account") &&
    /* the dashboard's own chrome must not be behind it */
    !door.includes("feed-newest") &&
    !door.includes("data-content-scroll") &&
    /* and the door shows the menu in the room the room speaks */
    plain(door).includes("Username") &&
    plain(door).includes("Password"),
  "the dashboard is not mounted behind the sign-in screen",
);
check(
  "the door reads in the reader's language",
  (() => {
    const doorFa = render(Gate, { user: null, lang: "fa" });
    const doorKo = render(Gate, { user: null, lang: "ko" });
    return (
      plain(doorFa).includes("ورود") &&
      plain(doorFa).includes("نام کاربری") &&
      plain(doorFa).includes("گذرواژه") &&
      plain(doorFa).includes("حساب دمو") &&
      doorFa.includes('dir="rtl"') &&
      plain(doorKo).includes("로그인") &&
      plain(doorKo).includes("데모 계정")
    );
  })(),
  "username, password, the demo hint and the footnote, in fa and ko",
);
check(
  "the demo credential on the screen is the one the check reads",
  (() => {
    /* printing a password the code no longer accepts is worse than printing
       none — the hint and the rule read the same record */
    const authSrc = readFileSync("src/data/auth.ts", "utf8");
    return (
      authSrc.includes('user: "admin"') &&
      authSrc.includes('password: "admin"') &&
      door.includes(DEMO_ACCOUNT.user) &&
      door.includes(DEMO_ACCOUNT.password) &&
      readFileSync("src/sections/SignInPage.tsx", "utf8").includes("{demo.user} / {demo.password}") &&
      readFileSync("src/sections/SignInPage.tsx", "utf8").includes("const demo = useMemo(() => DEMO_ACCOUNT, [])")
    );
  })(),
  "one source for the demo account: data/auth.ts",
);
check(
  "the credential rule is the one the door enforces",
  checkCredential("admin", "admin") === "ok" &&
    /* nobody types the name twice the same way */
    checkCredential("Admin", "admin") === "ok" &&
    checkCredential("  ADMIN  ", "admin") === "ok" &&
    /* the password is exact, and both refusals are distinct */
    checkCredential("admin", "admin ") === "bad-password" &&
    checkCredential("admin", "ADMIN") === "bad-password" &&
    checkCredential("sori", "admin") === "unknown-user" &&
    checkCredential("", "") === "unknown-user",
  "admin/admin signs in; a wrong name and a wrong password are not the same answer",
);
check(
  "a session outlives a reload",
  readFileSync("src/app/AuthContext.tsx", "utf8").includes('const USER_KEY = "faimess.user"') &&
    readFileSync("src/app/AuthContext.tsx", "utf8").includes("window.localStorage.getItem(USER_KEY)") &&
    readFileSync("src/app/AuthContext.tsx", "utf8").includes("window.localStorage.setItem(USER_KEY, signedIn)") &&
    readFileSync("src/app/AuthContext.tsx", "utf8").includes("window.localStorage.removeItem(USER_KEY)"),
  "kept in localStorage, cleared on the way out, no backend involved",
);
check(
  "the gate mounts the dashboard only when somebody is in",
  (() => {
    const appSrc = readFileSync("src/app/App.tsx", "utf8");
    /* whitespace-insensitive: the shape of the branch matters, not its layout */
    const flat = appSrc.replace(/\s+/g, " ");
    return (
      appSrc.includes("const { signedIn } = useAuth()") &&
      flat.includes("if (!signedIn) { return <SignInPage ") &&
      appSrc.includes("<AuthProvider>") &&
      /* the toast host stays outside the gate: the welcome toast fires as
         the door closes, and a toast must survive the swap */
      appSrc.includes("<Gate />") &&
      appSrc.includes("<ToastHost />")
    );
  })(),
  "no dashboard, no player, no shelves while nobody is signed in",
);
check(
  "signing out asks first, and answers in the language of the menu",
  (() => {
    const src = readFileSync("src/sections/AccountCard.tsx", "utf8");
    const confirm = readFileSync("src/ui/ConfirmDialog.tsx", "utf8");
    return (
      src.includes('body={t("account.signOutBody")}') &&
      src.includes('confirmKey="account.signOutConfirm"') &&
      src.includes('cancelKey="account.signOutCancel"') &&
      src.includes("onSignOut={() => setSignOutOpen(true)}") &&
      src.includes("signOut();") &&
      src.includes('notify(t("account.signedOut")') &&
      /* the dialog is the shared one, so Escape / backdrop / the layer above
         the player sheet all come for free */
      confirm.includes("<Modal open={open} onClose={onClose}") &&
      confirm.includes("onConfirm();")
    );
  })(),
  "the safe answer is the plain one, the destructive one is tinted",
);
check(
  "the compact header is notification · centred brand · profile",
  compactSrc.includes('part="notification"') &&
    compactSrc.includes('part="profile"') &&
    compactSrc.includes('dir="ltr"') &&
    compactSrc.includes('part="search"') &&
    /* three columns — `1fr auto 1fr` — are what centre the brand on the
       row: an absolutely-positioned pill was centred on the box, and the
       two controls are not the same width, so the wordmark and the two
       controls drifted off the middle by half their difference */
    compactSrc.includes("grid-cols-[1fr_auto_1fr]") &&
    compactSrc.includes("justify-self-start") &&
    compactSrc.includes("justify-self-end") &&
    brandSrc.includes("compact ? \"h-[56px] gap-2 px-3\"") &&
    brandSrc.includes("max-[374px]:hidden"),
  "notifications on the start edge, wordmark on the true centre, profile on the end edge",
);
check(
  "the bell swings on its own axis, not on the corner of its viewBox",
  cssSrc.includes(".anim-bell {") &&
    /\.anim-bell\s*\{[^}]*transform-box:\s*fill-box[^}]*transform-origin:\s*top center/.test(cssSrc) &&
    cssSrc.includes("@keyframes fi-bell-shake"),
  "without `fill-box` the rotate() pivot is the svg's top-left corner",
);
check(
  "the search panel sits in a layer above the glass cards under it",
  compactSrc.includes('className="relative z-30 mx-auto w-full max-w-[720px]"') &&
    compactSrc.includes("relative z-40 mx-auto grid w-full max-w-[720px]") &&
    accountSrc.includes("absolute top-[calc(100%+12px)] z-40") &&
    /* the rail and the content card are glass surfaces: `backdrop-blur` gives
       each its own stacking context, and both come later in the DOM, so a
       `z-40` *inside* the search capsule could never beat them */
    readFileSync("src/sections/ArtistStories.tsx", "utf8").includes("backdrop-blur-md") &&
    readFileSync("src/ui/primitives.tsx", "utf8").includes("backdrop-blur-md"),
  "a z-index cannot escape its own stacking context — the capsule's has to win",
);
check(
  "the app ships its own icon and manifest",
  (() => {
    /* without these the browser has nothing to paint a tab, a home-screen
       shortcut or an installed app's header with — the purple theme-color
       only colours the address bar of a page that already has a favicon */
    const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8")) as {
      name: string;
      start_url: string;
      display: string;
      theme_color: string;
      background_color: string;
      icons: { src: string; sizes: string; type: string; purpose?: string }[];
    };
    const brand = (cssSrc.match(/--color-primary:\s*(#[0-9a-fA-F]{6})/) ?? [])[1]?.toLowerCase();
    const filesExist = manifest.icons.every((icon) =>
      existsSync(join("public", icon.src.replace(/^\.\//, ""))),
    );
    const purposes = manifest.icons.map((icon) => icon.purpose ?? "any");
    const sizes = manifest.icons.map((icon) => icon.sizes);
    return (
      manifest.display === "standalone" &&
      manifest.theme_color.toLowerCase() === brand &&
      manifest.background_color === "#eaeaec" &&
      filesExist &&
      purposes.includes("maskable") &&
      sizes.includes("192x192") &&
      sizes.includes("512x512") &&
      /* every icon the head promises is really on disk */
      ["favicon-32.png", "apple-touch-icon.png", "icon.svg"].every((file) =>
        existsSync(join("public", file)),
      ) &&
      indexHtml.includes('href="/manifest.webmanifest"') &&
      indexHtml.includes('rel="apple-touch-icon"') &&
      indexHtml.includes('sizes="32x32"')
    );
  })(),
  "a tab, a home-screen icon and a launcher entry, all in brand purple",
);
check(
  "the browser's own chrome wears the brand colour",
  (() => {
    /* One source for the hexes: `--color-primary` in the light and dark
       theme blocks of src/index.css. `index.html` carries three metas — a
       media-qualified pair (the form Safari on iOS reads in dark mode) and
       a plain fallback — and the provider rewrites *all* of them from the
       token when the appearance flips. */
    const token = (block: string) =>
      (block.match(/--color-primary:\s*(#[0-9a-fA-F]{6})/) ?? [])[1]?.toLowerCase();
    const light = token(cssSrc);
    /* the dark block is the `[data-theme="dark"] { … }` rule itself — search
       from its brace so the light token above it can't be picked up */
    const darkBlock = cssSrc.slice(cssSrc.indexOf('[data-theme="dark"] {'));
    const dark = token(darkBlock.slice(0, darkBlock.indexOf("}")));
    const metas = [...indexHtml.matchAll(/<meta name="theme-color"([^>]*)>/g)].map((m) => m[1]);
    const contentOf = (attrs: string) =>
      (attrs.match(/content="(#[0-9a-fA-F]{6})"/) ?? [])[1]?.toLowerCase();
    const prefs = readFileSync("src/app/PreferencesContext.tsx", "utf8");
    return (
      !!light &&
      !!dark &&
      metas.length === 3 &&
      metas.some((a) => a.includes('media="(prefers-color-scheme: light)"') && contentOf(a) === light) &&
      metas.some((a) => a.includes('media="(prefers-color-scheme: dark)"') && contentOf(a) === dark) &&
      metas.some((a) => !a.includes("media=") && contentOf(a) === light) &&
      prefs.includes('querySelectorAll(\'meta[name="theme-color"]\')') &&
      prefs.includes('metas.forEach((meta) => meta.setAttribute("content", brand))') &&
      prefs.includes('"--color-primary"')
    );
  })(),
  "the address bar follows `--color-primary`, light and dark, however it is declared",
);
check(
  "search is its own full-width capsule on the compact shell",
  accountSrc.includes('"inset-x-0"') &&
    /* a capsule, not a card: `rounded-full` on a box with no fixed height
       leaves both ends true semicircles, the shape the desktop pill has */
    accountSrc.includes('"rounded-full p-2"') &&
    !accountSrc.includes('"rounded-card p-2"') &&
    accountSrc.includes('part === "search" ? "100%"'),
  "the same search field, re-homed — not a second implementation",
);
check(
  "the artists you follow sit between the search capsule and the banner",
  compactSrc.includes('route === "home" && <ArtistStories />') &&
    compactSrc.includes('from "../sections/ArtistStories"') &&
    /* top-to-bottom order in the source is the order on screen: search,
       rail, content card */
    compactSrc.indexOf('part="search"') < compactSrc.indexOf("<ArtistStories />") &&
    compactSrc.indexOf("<ArtistStories />") < compactSrc.indexOf("<SurfaceCard"),
  "outside the content card, on the page that has the banner",
);
check(
  "the rail is a face and a name — no heading, no badge, no button",
  storiesSrc.includes("followedArtists.map") &&
    storiesSrc.includes("artist.name") &&
    storiesSrc.includes("<Cover") &&
    !storiesSrc.includes("artist.kind") &&
    /* aimed at what it renders, not at the prose in its own comment */
    !storiesSrc.includes("artist.verified") &&
    !storiesSrc.includes('name="verified"') &&
    !storiesSrc.includes("PlayDot") &&
    !storiesSrc.includes("PillButton") &&
    !storiesSrc.includes("<h2") &&
    !storiesSrc.includes("<h3") &&
    !storiesSrc.includes('name="bolt"') &&
    storiesSrc.includes("overflow-x-auto"),
  "story-rail grammar: ring, photo, name, sideways scroll",
);
check(
  "the rail still opens the artist, and the new release lives in the ring",
  storiesSrc.includes('openDetail({ kind: "artist", id: artist.id })') &&
    storiesSrc.includes("artist.newRelease") &&
    storiesSrc.includes("bg-gradient-to-tr"),
  "one tap target per face; the ring carries the only state",
);
check(
  "below 1024px the feed skips the artists shelf, so the roster isn't shown twice",
  feedSrc.includes("compactHidden: true") &&
    feedSrc.includes("useCompact") &&
    feedSrc.includes("!shelf.compactHidden || !compact") &&
    /* chips, scroll-spy and the stack all read the one filtered list */
    !feedSrc.includes("FEED_SHELVES.map") &&
    feedSrc.includes("shelves.map"),
  "one table of shelves, filtered by the same compact line",
);
const storiesHtml = render(ArtistStories);
check(
  "the rail renders every followed artist as a photo and a name, and says nothing else",
  followedArtists.length > 0 &&
    followedArtists.every((a) => storiesHtml.includes(a.photo) && storiesHtml.includes(a.name)) &&
    /* the section names itself for a screen reader instead of printing a heading */
    storiesHtml.includes(`aria-label="${STRINGS["shelf.followedArtists"].en}"`) &&
    !plain(storiesHtml).includes(STRINGS["shelf.findArtists"].en) &&
    !plain(storiesHtml).includes(followedArtists[0].kind),
  `${followedArtists.length} faces`,
);

/* ---------------- horizontal rails: no scrollbar on a phone ------------- */

/** the `scroll-rail` utility only, sliced out of index.css */
const railCss = (() => {
  const start = cssSrc.indexOf("@utility scroll-rail");
  if (start < 0) return "";
  const next = cssSrc.indexOf("@utility", start + 1);
  return cssSrc.slice(start, next < 0 ? undefined : next);
})();
check(
  "a horizontal rail keeps its slim bar on desktop and loses it on a phone",
  railCss.includes("height: 6px") &&
    /* touch, or the compact shell's own line — the same 1023px */
    railCss.includes("@media (pointer: coarse), (max-width: 1023px)") &&
    railCss.includes("scrollbar-width: none") &&
    railCss.includes("display: none"),
  "flick, don't drag: Android paints its bar over the artwork otherwise",
);
const badRails: string[] = [];
for (const file of sweep("src")) {
  for (const m of readFileSync(file, "utf8").matchAll(/"([^"]*overflow-x-auto[^"]*)"/g)) {
    /* every sideways row wears the rail utility — and not the vertical one,
       whose bar is exactly what a thumb does not need */
    if (!m[1].includes("scroll-rail") || m[1].includes("scroll-slim")) badRails.push(`${file}: ${m[1]}`);
  }
}
check(
  "every sideways row in the app is a scroll-rail, never a scroll-slim",
  badRails.length === 0,
  badRails.join(" · "),
);
check(
  "vertical scrollers still keep their bar",
  cssSrc.includes("@utility scroll-slim") &&
    !railCss.includes("@utility scroll-slim") &&
    readFileSync("src/app/App.tsx", "utf8").includes("scroll-slim flex min-h-0 flex-1 flex-col lg:overflow-y-auto"),
  "the bar that says \"there is more underneath\" is not a rail's job",
);
check(
  "the main menu moves to the bottom, purple tab + rule in a glass capsule",
  mobileNavSrc.includes('layoutId="mobile-nav-rule"') &&
    mobileNavSrc.includes("h-[2.5px]") &&
    mobileNavSrc.includes("text-primary-deep") &&
    mobileNavSrc.includes("rounded-full bg-white/80") &&
    !mobileNavSrc.includes("bg-primary text-white") &&
    compactSrc.includes("<MobileNav />"),
  "same five destinations, thumb-reachable, translucent capsule and active mark",
);
check(
  "the player collapses to a bar that opens the full card",
  miniSrc.includes("absolute inset-0 z-0") &&
    miniSrc.includes('onOpen') &&
    !miniSrc.includes("<button") === false &&
    compactSrc.includes("<MiniPlayer") &&
    sheetSrc.includes("PlayerSection"),
  "the sheet renders PlayerSection itself — the desktop card, not a copy",
);
check(
  "the mini player appears only for a selected track and rises from below the nav",
  miniSrc.includes("{track && (") &&
    miniSrc.includes('key="mini-player"') &&
    miniSrc.includes("initial={{ opacity: 0, y: 36 }}") &&
    mobileNavSrc.includes("relative z-10") &&
    miniSrc.includes("bg-primary shadow-[0_18px_36px_-14px"),
  "hidden when idle; animated upward behind the navigation capsule",
);
check(
  "the mini player has no status/progress strip",
  !miniSrc.includes("absolute inset-x-4 bottom-1.5") && !miniSrc.includes("progress : 0"),
  "a clean violet bar with no progress indicator",
);
check(
  "a shelf header keeps one row on a phone",
  shelfSrc.includes("flex flex-nowrap items-center") &&
    shelfSrc.includes("ms-auto flex shrink-0 items-center") &&
    shelfSrc.includes("truncate whitespace-nowrap") &&
    shelfSrc.includes("text-[15.5px]") &&
    trendingTracksSrc.includes("shrink-0 whitespace-nowrap") &&
    trendingTracksSrc.includes("min-w-[44px]"),
  "the action stays beside the title — “Play all” may not drop to a line of its own",
);
check(
  "comments and nested dialogs sit above the full player sheet",
  readFileSync("src/ui/Modal.tsx", "utf8").includes("z-[70]") &&
    sheetSrc.includes("z-[60]"),
  "modal layer above the compact player sheet",
);
check(
  "compact page views use a translucent white surface",
  compactSrc.includes("<SurfaceCard glass") &&
    readFileSync("src/ui/primitives.tsx", "utf8").includes("bg-white/80 ring-1"),
  "light glass surface, with a dark-theme surface counterpart",
);
check(
  "the newest-tracks shelf is a three-column card grid on a phone",
  (() => {
    const newestSrc = readFileSync("src/sections/feed/NewestTracks.tsx", "utf8");
    return (
      newestSrc.includes("grid grid-cols-3 gap-2") &&
      newestSrc.includes("lg:grid-cols-2") &&
      newestSrc.includes("aspect-square w-full shrink-0 overflow-hidden lg:aspect-auto lg:size-[44px]") &&
      newestSrc.includes("group flex cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-surface text-start transition-colors lg:flex-row lg:items-center") &&
      /* a card has room for the title and the artist only — the “new” flag
         rides on the cover, the runtime and the timestamp are desktop-only */
      newestSrc.includes("absolute start-1.5 top-1.5 rounded-full bg-primary px-1.5 py-[1px] text-[12px] font-bold leading-normal text-white lg:hidden") &&
      newestSrc.includes("hidden shrink-0 lg:inline")
    );
  })(),
  "three square covers per row on a handset, the wide list rows on desktop",
);
check(
  "a user card has clear air above its rank ribbon",
  (() => {
    const usersSrc = readFileSync("src/sections/feed/ActiveUsers.tsx", "utf8");
    return (
      /* the rail reserves the top of the card: a tap on a touch screen fires
         whileHover too, and a 4px lift inside an exact-height rail sliced the
         ribbon off the top */
      shelfSrc.includes("overflow-x-auto pb-2 pt-2 lg:gap-3.5") &&
      shelfSrc.includes("whileHover={{ y: -4 }}") &&
      usersSrc.includes("<Row>") &&
      usersSrc.includes("relative mt-5") &&
      usersSrc.includes("leading-normal lg:start-2.5 lg:top-2.5")
    );
  })(),
  "the ribbon never sits against the scroll edge, and the avatar clears it",
);
check(
  "one avatar per listener card",
  (() => {
    /* rendered, not read: the card used to render two avatars — one per
       breakpoint — and `hidden` lost the display fight against Avatar's own
       `inline-flex`, so both painted and the face came out doubled */
    const usersSrc = readFileSync("src/sections/feed/ActiveUsers.tsx", "utf8");
    const shelf = render(ActiveUsers, { lang: "fa" });
    const avatars = (
      shelf.match(/inline-flex shrink-0 items-center justify-center rounded-full bg-surface/g) ?? []
    ).length;
    return usersSrc.match(/<Avatar\b/g)?.length === 1 && avatars === activeUsers.length;
  })(),
  "the face is drawn once per card at every width",
);
check(
  "the feed strip is not shown on phones and tablets",
  feedIndexSrc.includes("hidden items-center gap-2") &&
    feedIndexSrc.includes("lg:flex") &&
    !compactSrc.includes("sticky top-0 z-30"),
  "the shelves simply scroll; the strip measures 0 and headers stick to the card",
);

check(
  "the top menu paints its tab purple, with nothing behind it and no rule",
  navCardSrc.includes('isActive\n                ? "text-primary-deep"') &&
    !navCardSrc.includes("layoutId=\"nav-pill\"") &&
    !navCardSrc.includes("bg-primary") &&
    /* the underline belongs to the menu that sits under what it switches */
    !navCardSrc.includes("h-[2.5px]") &&
    !navCardSrc.includes("shadow-primary"),
  "colour is the whole mark up here — this bar has nothing below it",
);
check(
  "the lower menu marks its tab with a purple rule",
  feedIndexSrc.includes('layoutId="feed-chip-underline"') &&
    feedIndexSrc.includes("h-[2.5px] rounded-full bg-primary") &&
    feedIndexSrc.includes('isActive ? "text-primary-deep"') &&
    !feedIndexSrc.includes('layoutId="feed-chip"') &&
    !feedIndexSrc.includes('text-white'),
  "the strip sits under the shelves, so its tab gets the line",
);
check(
  "the quick-jump chips share the card's width",
  feedIndexSrc.includes("min-w-[86px] flex-1") &&
    feedIndexSrc.includes("justify-center") &&
    !feedIndexSrc.includes("feed.scrollMore"),
  "no “scroll for more” hint — the strip is one full-width control",
);
check(
  "the banner caption declares its own direction",
  heroSrc.includes('dir="auto"') &&
    heroSrc.includes("sm:bottom-7") &&
    heroSrc.includes("sm:max-w-[46%]"),
  "demo copy aligns by its own script; on phones the block clears the indicator",
);
check(
  "the breakdown panel shows a line per rule",
  pointsDialogSrc.includes("fanLines(") && pointsDialogSrc.includes("rule.rateKey"),
);
check(
  "a points row is always the same two lines",
  !pointsDialogSrc.includes("flex-wrap") &&
    pointsDialogSrc.includes("shortRateKey") &&
    pointsDialogSrc.includes("title={rate}") &&
    pointsDialogSrc.includes("title={count}"),
  "the rule and its rate on one line, the fan's own count underneath",
);
check(
  "a comment header keeps its timestamp in the same corner",
  !readFileSync("src/sections/player/CommentsSheet.tsx", "utf8").includes("flex-wrap"),
  "name · badge · time on one line, the handle underneath",
);
check(
  "a contribution row keeps its payout in the same corner",
  !readFileSync("src/sections/ContributionsModal.tsx", "utf8").includes("flex-wrap"),
  "language · lines · sent-at truncate before the points chip moves",
);
check(
  "no balance is written down by hand any more",
  !/points:\s*\d/.test(readFileSync("src/data/feed.ts", "utf8")) &&
    !/points:\s*\d/.test(readFileSync("src/data/account.ts", "utf8")),
  "feed.ts and account.ts keep activity records only",
);

const artistsPage = render(ArtistsPage);
const downloadPage = render(DownloadPage);
check("download page renders", downloadPage.includes("Get the FAIMESS app") && downloadPage.includes("Google Play"));
check("download page is honest about the web build", downloadPage.includes("Android feature"));

check("artists page renders", artistsPage.includes("Artists"));
check("every roster artist on the page", artists.every((a) => artistsPage.includes(a.name)), `${artists.length} artists`);

const albumsPage = render(AlbumsPage);
check("albums page renders", albumsPage.includes("Albums"));
check("every album on the page", albums.every((a) => albumsPage.includes(a.title)), `${albums.length} albums`);

const playlistsPage = render(PlaylistsPage);
check("playlists page renders", playlistsPage.includes("Playlists"));
check("every playlist on the page", playlists.every((p) => playlistsPage.includes(p.name)), `${playlists.length} playlists`);

/* the "make your own" flow — v17 */
const playlistsMine = render(PlaylistsPage, { playlists: mineSeed });
check(
  "the playlists page offers a new playlist",
  playlistsPage.includes("New playlist") && playlistsPage.includes("Made by you"),
);
check(
  "your lists sit above the curated grid",
  playlistsMine.includes("Rainy commute") &&
    playlistsMine.includes("Made by you") &&
    playlistsMine.includes("2 tracks"),
  "made-by-you strip, with the track count read off the ids",
);
check(
  "the curated six survive alongside them",
  playlists.every((p) => playlistsMine.includes(p.name)),
);
check(
  "covers only ever come from the bundled set",
  PLAYLIST_COVERS.length === 6 &&
    PLAYLIST_COVERS.every((c) => !!c.photo && !!STRINGS[c.labelKey]) &&
    !isCoverId("../../etc/passwd") &&
    coverById("nope").id === "midnight-drive",
  "an unknown id falls back to the first cover",
);


const newsPage = render(NewsPage);
check("news page renders", newsPage.includes("News"));
check("no undefined leaks into markup", !home.includes("undefined") && !artistsPage.includes("undefined"));
check(
  "the leaderboard prints the derived total",
  home.includes(withThousands(fanPoints(activeUsers[0].activity))),
  `${withThousands(fanPoints(activeUsers[0].activity))} on the top card`,
);
check(
  "the player can share a song or keep it",
  playingCard.includes("Share this song") && playingCard.includes("Add to one of your playlists"),
  "both actions are labelled under the title",
);

const profileMenu = render(ProfileMenu);
check(
  "the profile balance opens the breakdown",
  profileMenu.includes(STRINGS["points.open"].en) && profileMenu.includes(withThousands(me.points)),
  "the chip is a button, the numbers come from the rules",
);
check(
  "the profile menu carries the preferences",
  profileMenu.includes("Language") &&
    profileMenu.includes("Appearance") &&
    profileMenu.includes("فارسی") &&
    profileMenu.includes("한국어"),
);
check("the theme switch is in the menu", profileMenu.includes("Light") && profileMenu.includes("Dark"));
check("the menu keeps the points + contributions rows", profileMenu.includes("fan points") && profileMenu.includes("Your contributions"));

/* --------------------- the same app, other languages ------------------ */

/** is this exact button (pressed state + label) in the markup? */
const pressed = (html: string, label: string) =>
  new RegExp(
    `<button\\b[^>]*aria-pressed="true"[^>]*>(?:(?!</button>)[\\s\\S])*?${label}</button>`,
  ).test(html);

const homeFa = render(HomePage, { lang: "fa" });
const homeKo = render(HomePage, { lang: "ko" });
const shellFa = render(Shell, { lang: "fa" });
const shellKo = render(Shell, { lang: "ko" });
check(
  "persian frame is right-to-left",
  shellFa.includes('dir="rtl"') && shellKo.includes('dir="ltr"'),
  "the whole shell mirrors, not just the text inside the cards",
);
const faWords = ["آهنگ‌های تازه", "هنوز چیزی پخش نمی‌شود", "جدیدترین آهنگ‌ها", "الان پرطرفدار"];
check(
  "persian chrome is translated",
  faWords.every((word) => plain(shellFa).includes(word)),
  `missing: ${faWords.filter((word) => !plain(shellFa).includes(word)).join(" ")}`,
);
const koWords = ["신곡", "아직 재생 중인 곡이 없어요", "최신 곡", "지금 인기"];
check(
  "korean chrome is translated",
  koWords.every((word) => plain(shellKo).includes(word)),
  `missing: ${koWords.filter((word) => !plain(shellKo).includes(word)).join(" ")}`,
);
check("the shelves keep their photography in persian", plain(homeFa).split(".webp").length - 1 >= 20);
check(
  "no raw key leaks into the markup",
  [shellFa, shellKo].every(
    (html) => !/(player|comments|submit|contrib|pref|shelf|lyrics)\.[a-z][A-Za-z]+/.test(plain(html)),
  ),
);

const cardFa = render(PlayerCard, { lang: "fa", trackId: "nt1" });
check(
  "persian player is translated",
  plain(cardFa).includes("کامنت‌ها") && plain(cardFa).includes("دیدن همه"),
);
check("the persian card keeps its own direction", cardFa.includes('dir="rtl"'));

/* the top pills live in the shell, so they get their own probe */
const navFa = render(NavCard, { lang: "fa" });
const navKo = render(NavCard, { lang: "ko" });
check(
  "the menu pill is translated",
  ["خانه", "هنرمندان", "آلبوم‌ها", "پلی‌لیست‌ها"].every((word) => plain(navFa).includes(word)),
  plain(navFa).slice(0, 0),
);
check("the korean menu pill is translated", plain(navKo).includes("홈") && plain(navKo).includes("아티스트"));

const menuFa = render(ProfileMenu, { lang: "fa" });
const menuDark = render(ProfileMenu, { theme: "dark" });
const menuLight = render(ProfileMenu, { theme: "light" });
check("the language switcher marks persian", pressed(menuFa, "فارسی") && !pressed(menuFa, "한국어"));
check("the appearance switcher follows the theme", pressed(menuDark, "Dark") && pressed(menuLight, "Light"));
check("light and dark really render differently", menuDark !== menuLight);

/* --------------------------- physical geometry ------------------------ */
/* The one class of RTL bug that mangles the whole screen: a *logical* inset
   combined with a *physical* transform. Both are asserted here. */

const stageSrc = readFileSync("src/app/Stage.tsx", "utf8");
check(
  "the scaled art-board is pinned physically",
  stageSrc.includes('className="absolute left-0 top-0"') && !/absolute start-0/.test(stageSrc),
  "a logical anchor would slide the board off-centre once scale ≠ 1",
);
const stageHtml = renderToString(
  <Stage>
    <span />
  </Stage>,
);
check(
  "the stage renders its physical anchor",
  stageHtml.includes("left-0") && stageHtml.includes("transform-origin"),
);
const toastHtml = render(
  () => (
    <AppProvider>
      <ToastHost />
    </AppProvider>
  ),
);
check(
  "toasts are centred physically",
  toastHtml.includes("left-1/2") && !toastHtml.includes("start-1/2"),
);
check(
  "pointer → progress is mirrored in RTL",
  trackRatio(0, { left: 0, width: 100 }, "ltr") === 0 &&
    trackRatio(100, { left: 0, width: 100 }, "ltr") === 1 &&
    trackRatio(0, { left: 0, width: 100 }, "rtl") === 1 &&
    trackRatio(100, { left: 0, width: 100 }, "rtl") === 0,
);
check(
  "offsets and arrows flip with the direction",
  dirSign("rtl") === -1 &&
    dirSign("ltr") === 1 &&
    backIcon("rtl") === "chevronRight" &&
    forwardIcon("ltr") === "chevronRight" &&
    forwardIcon("rtl") === "chevronLeft",
);

/* ------------------------------- data -------------------------------- */

const photos = [
  ...artists.map((a) => a.photo),
  ...albums.map((a) => a.photo),
  ...playlists.map((p) => p.photo),
  ...banners.map((b) => b.photo),
  ...newestTracks.map((t) => t.photo),
  ...trendingTracks.map((t) => t.photo),
  ...activeUsers.map((u) => u.photo),
  ...conversations.map((c) => c.photo),
  me.photo,
];
check("every photo resolves to a non-empty url", photos.every((p) => typeof p === "string" && p.length > 0), `${photos.length} photos`);
const bad = photos.filter((p) => !p.includes(".webp"));
check("photos point at webp assets", photos.every((p) => p.includes(".webp") || p.startsWith("data:image/webp")), `sample: ${photos[0]}`);
check("roster art is unique per entity", new Set(artists.map((a) => a.photo)).size === artists.length);
check("listener art is unique per fan", new Set(activeUsers.map((u) => u.photo)).size === activeUsers.length);

/* --------------------------- the key table --------------------------- */

const sources: string[] = [];
const walk = (dir: string) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry.name)) sources.push(full);
  }
};
walk("src");

const groups = new Set(Object.keys(STRINGS).map((key) => key.split(".")[0]));
const staticKeys = new Set<string>();
const families = new Set<string>();
const shaped: string[] = [];
for (const file of sources) {
  const code = readFileSync(file, "utf8");
  for (const m of code.matchAll(/\bt\(\s*"([^"]+)"/g)) staticKeys.add(m[1]);
  for (const m of code.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) families.add(m[1]);
  for (const m of code.matchAll(/"([a-z][a-zA-Z]*\.[A-Za-z][A-Za-z0-9.]*)"/g)) {
    if (groups.has(m[1].split(".")[0])) shaped.push(m[1]);
  }
}
const missing = [...staticKeys].filter((key) => !STRINGS[key]);
check("every t(\"key\") is in the table", missing.length === 0, missing.join(", "));
const orphanFamilies = [...families].filter(
  (prefix) => !Object.keys(STRINGS).some((key) => key.startsWith(prefix)),
);
check("every dynamic key family resolves", orphanFamilies.length === 0, orphanFamilies.join(", "));
const missingShaped = [...new Set(shaped.filter((key) => !STRINGS[key]))];
check("every key-shaped literal is in the table", missingShaped.length === 0, missingShaped.join(", "));

/* a class of RTL bug rather than a key one: `end-1/2`-style logical insets
   paired with `-translate-x-1/2` end up half a box off-target */
const mixed = sources.filter((file) => {
  const code = readFileSync(file, "utf8");
  return /(start|end)-1\/2/.test(code) && /-translate-x-1\/2/.test(code);
});
check("no logical inset is centred with a physical translate", mixed.length === 0, mixed.join(", "));

/* ------------------------- right-to-left layout (v22) -----------------
   Two families of RTL bug the app can't afford: a physical direction
   utility (it simply never mirrors), and an arrow that was chosen once for
   a left-to-right world. Both are scanned for across every source file. */
const PHYSICAL = /^-?(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|text-left|text-right|origin-left|origin-right)(-|$)/;
/** the only two files allowed to place something physically, on purpose */
const PHYSICAL_OK = new Set([
  "src/app/Stage.tsx",
  "src/app/ToastHost.tsx",
  /* the compact header centres the brand on the true axis of the screen:
     `left-1/2` is a *viewfinder* fact, not a text-direction one */
  "src/app/CompactShell.tsx",
]);
const physicalHits: string[] = [];
for (const file of sources) {
  const classes = [...readFileSync(file, "utf8").matchAll(/className="([^"]*)"/g)].flatMap((m) =>
    m[1].split(/\s+/),
  );
  for (const cls of classes) {
    const base = cls.split(":").pop() ?? "";
    if (PHYSICAL.test(base) && !PHYSICAL_OK.has(file)) physicalHits.push(`${file}: ${cls}`);
  }
}
check(
  "no physical direction utility, anywhere but the two documented ones",
  physicalHits.length === 0,
  physicalHits.join(", "),
);

/** arrows whose whole shape flips must be picked per direction, not hard-coded */
const LITERAL_ARROWS = /(?:name|icon)=["'](?:arrowRight|arrowLeft|chevronRight|chevronLeft)["']/;
const literalArrows = sources.filter((file) => LITERAL_ARROWS.test(readFileSync(file, "utf8")));
check(
  "every back/next arrow comes from backIcon() or forwardIcon()",
  literalArrows.length === 0,
  literalArrows.join(", "),
);

const iconSrc = readFileSync("src/ui/Icon.tsx", "utf8");
check(
  "the up-and-away glyphs mirror themselves in RTL",
  cssSrc.includes('[dir="rtl"] .dir-flip') &&
    iconSrc.includes("MIRRORED_IN_RTL") &&
    iconSrc.includes('"arrowUpRight"') &&
    iconSrc.includes('"send"'),
  "one rule in index.css, one list in Icon.tsx",
);

check(
  "the page row follows the interface direction",
  !readFileSync("src/app/App.tsx", "utf8").includes('dir="ltr"'),
  "so the feed takes the right-hand column in Persian and the player the left",
);

check(
  "the ambient glow follows the writing direction too",
  cssSrc.includes("--glow-x") && cssSrc.includes('[dir="rtl"] .studio-backdrop'),
);

/* v17 keeps artwork inside the FAIMESS set: no file input, no object URLs */
const uploads = sources.filter((file) =>
  /type="file"|createObjectURL|FileReader|new Blob\(/.test(readFileSync(file, "utf8")),
);
check("a playlist can never take an uploaded image", uploads.length === 0, uploads.join(", "));
check(
  "no language is missing a string",
  Object.values(STRINGS).every((entry) => entry.en.trim() && entry.fa.trim() && entry.ko.trim()),
  `${Object.keys(STRINGS).length} keys`,
);

/* -------- the words the data files carry (v31) ------------------------- *
 *  A Persian page used to read “4.8M monthly · ۱۲ آهنگ”: the label around
 *  the numbers came straight out of the data in English. Every one of them
 *  now goes through `tData`, and nothing prints a raw data label again.
 * ---------------------------------------------------------------------- */
const i18nSrc = readFileSync("src/data/i18n.ts", "utf8");
const RAW_LABELS =
  /\{(?:artist\.(?:kind|genre|listeners)|album\.released|playlist\.(?:mood|duration)|item\.(?:tag|source|ago)|(?:track|row|comment|reply)\.(?:ago|time)|n\.at|s\.sentAt|me\.tier)\}/;
const rawLabels = sources.filter((file) => RAW_LABELS.test(readFileSync(file, "utf8")));
check(
  "no page prints a data label in English mid-Persian",
  i18nSrc.includes("export function tData") &&
    i18nSrc.includes("const LISTENERS") &&
    i18nSrc.includes("const AGO") &&
    i18nSrc.includes("const HOURS_MINUTES") &&
    i18nSrc.includes("AGO_UNITS") &&
    rawLabels.length === 0,
  rawLabels.length ? rawLabels.join(", ") : "kinds, genres, moods, listeners, runtimes and “2 hrs ago”",
);
check(
  "the same labels reach every surface that shows them",
  readFileSync("src/sections/CollectionSection.tsx", "utf8").includes("dataLabel(artist.listeners)") &&
    readFileSync("src/sections/BrowseDetailView.tsx", "utf8").includes("dataLabel(artist.listeners)") &&
    readFileSync("src/sections/BrowseDetailView.tsx", "utf8").includes("dataLabel(artist.kind)") &&
    readFileSync("src/sections/feed/NewsShelf.tsx", "utf8").includes("dataLabel(item.tag)") &&
    readFileSync("src/sections/feed/NewAlbums.tsx", "utf8").includes("dataLabel(album.released)") &&
    readFileSync("src/sections/player/CommentsSheet.tsx", "utf8").includes("dataLabel(comment.time)") &&
    readFileSync("src/sections/player/CommentsBar.tsx", "utf8").includes("dataLabel(latest.time)") &&
    readFileSync("src/sections/AccountCard.tsx", "utf8").includes("dataLabel(n.at)"),
  "artist cards, the detail header, both news lists, comments and the bell",
);
check(
  "a number handed to a translated line is written in that language's digits",
  readFileSync("src/app/PreferencesContext.tsx", "utf8").includes("localizeDigits(String(v), lang)") &&
    i18nSrc.includes('"۰۱۲۳۴۵۶۷۸۹"'),
  "12 tracks reads ۱۲ آهنگ in Persian, 12 in English",
);

check(
  "the hero and the K-pop desk read in the reader's language",
  banners.every((b) => STRINGS[`banner.${b.id}.title`] && STRINGS[`banner.${b.id}.subtitle`]) &&
    newsItems.every((n) => STRINGS[`news.${n.id}.title`] && STRINGS[`news.${n.id}.excerpt`]) &&
    heroSrc.includes("text(`banner.${banner.id}.title`, banner.title)") &&
    newsPageSrc.includes("text(`news.${item.id}.title`, item.title)") &&
    readFileSync("src/sections/feed/NewsShelf.tsx", "utf8").includes(
      "text(`news.${item.id}.title`, item.title)",
    ),
  "editorial copy is translated; a track title or a fan's comment is left as written",
);
/* the data-label layer, exercised on its own — the one place that decides
   what a Persian page says for “4.8M monthly” or “2 hrs ago” */
const faT = (key: string, vars?: TVars) => {
  const entry = STRINGS[key];
  if (!entry) return key;
  const filled = vars
    ? Object.fromEntries(
        Object.entries(vars).map(([name, v]) => [
          name,
          typeof v === "number" ? localizeDigits(String(v), "fa") : v,
        ]),
      )
    : undefined;
  return fill(entry.fa, filled);
};
const labelCases: [string, string][] = [
  ["4.8M monthly", "۴٫۸ میلیون شنوندهٔ ماهانه"],
  ["2 hrs ago", "۲ ساعت پیش"],
  ["18.4K", "۱۸٫۴ هزار"],
  ["Afterimage · single", "Afterimage · تک‌آهنگ"],
  ["11 Nov · 20:00 hrs", "۱۱ نوامبر · ۲۰:۰۰"],
  ["14 Dec", "۱۴ دسامبر"],
  ["Sunday", "یکشنبه"],
  ["Online", "آنلاین"],
  ["3h 12m", "۳ ساعت و ۱۲ دقیقه"],
  ["Mixed", "ترکیبی"],
  ["Boy group", "گروه پسرانه"],
  ["PRISM9", "PRISM9"],
];
const wrongLabels = labelCases.filter(([input, expected]) => tData(faT, input, "fa") !== expected);
check(
  "every shape of data label comes out persian",
  wrongLabels.length === 0,
  wrongLabels.map(([input, expected]) => `${input} → ${tData(faT, input, "fa")} (want ${expected})`).join("; "),
);

check(
  "release types, short counts and chat stamps follow the language too",
  i18nSrc.includes("const SINGLE_FROM") &&
    i18nSrc.includes("const STAMP") &&
    i18nSrc.includes('"num.million"') &&
    miniSrc.includes("dataLabel(track.album)") &&
    playerSrc.includes("dataLabel(track.album)") &&
    readFileSync("src/sections/BrowseDetailView.tsx", "utf8").includes("dataLabel(track.album)") &&
    readFileSync("src/ui/PlaylistDialogs.tsx", "utf8").includes("dataLabel(track.album)") &&
    readFileSync("src/sections/MessagesSection.tsx", "utf8").includes("dataLabel(convo.status)") &&
    readFileSync("src/sections/MessagesSection.tsx", "utf8").includes("dataLabel(message.when)") &&
    readFileSync("src/sections/player/CommentsSheet.tsx", "utf8").includes('t("comments.shown"') &&
    readFileSync("src/sections/ContributionsModal.tsx", "utf8").includes('t("contrib.pts", { n: s.points })') &&
    readFileSync("src/sections/ContributionsModal.tsx", "utf8").includes("dataLabel(s.language)"),
  "“Afterimage · single”, “۱۸٫۴ هزار”, “Online” and “۱۱ نوامبر · ۲۰:۰۰”",
);

/* -------- shop + shuffle (v28) ---------------------------------------- */

const shopSrc = readFileSync("src/pages/ShopPage.tsx", "utf8");
const shopData = readFileSync("src/data/shop.ts", "utf8");
const routerSrc = readFileSync("src/app/router.ts", "utf8");
const navSrc = readFileSync("src/data/navigation.ts", "utf8");

check(
  "shuffle lives only where a list of songs is open",
  !collectionSrc.includes('icon="shuffle"') &&
    !collectionSrc.includes("page.shuffleAll") &&
    readFileSync("src/sections/BrowseDetailView.tsx", "utf8").includes('icon="shuffle"'),
  "the collection pages shuffle nothing; the detail card shuffles its own list",
);
check(
  "the shop is a route of its own in the main menu",
  routerSrc.includes('{ id: "shop", label: "Shop", path: "#/shop" }') &&
    navSrc.includes('{ id: "shop", label: "Shop", icon: "shop" }') &&
    /* the page table moved out of App.tsx when the compact shell landed —
       both shells read src/app/pages.ts now */
    readFileSync("src/app/pages.ts", "utf8").includes("shop: ShopPage") &&
    routerSrc.includes('"shop"'),
);
check(
  "the shop is a long shelf of products with prices in Toman",
  (shopData.match(/^    id: "/gm) ?? []).length >= 12 &&
    shopData.includes("SHOP_CATEGORIES") &&
    shopData.includes("export const toman") &&
    shopData.includes("STORE_HOST") &&
    shopSrc.includes("shopProducts") &&
    shopSrc.includes("toman(product.price, locale)") &&
    /* no currency symbol anywhere: the store prices in Toman */
    !/[$€£]\d/.test(shopData) &&
    !/[$€£]\d/.test(shopSrc),
);
check(
  "a product card is a link to the store, not a cart button",
  shopSrc.includes("href={productUrl(product.id)}") &&
    shopSrc.includes('target="_blank"') &&
    shopSrc.includes('rel="noopener noreferrer"') &&
    shopSrc.includes("<Photo") &&
    !shopSrc.includes("setBag") &&
    !shopSrc.includes('t("shop.add")') &&
    !shopSrc.includes('t("shop.checkout")'),
  "no bag, no payment — the purchase happens on the store site",
);
check(
  "the shop says out loud that a tap leaves for the store",
  shopSrc.includes('t("shop.redirectNote")') &&
    shopSrc.includes('t("shop.onStore")') &&
    !shopSrc.includes('t("shop.demoNote")'),
  "the note is about the redirect, not about being a demo",
);

/* -------- the details the last pass fixed (v27) ----------------------- */

const iconBodySrc = readFileSync("src/ui/icons.gen.ts", "utf8");
const generatorSrc = readFileSync("tools/icons/build.mjs", "utf8");
const playerCtxSrc = readFileSync("src/app/PlayerContext.tsx", "utf8");
const detailSrc = readFileSync("src/sections/BrowseDetailView.tsx", "utf8");
const mineSrc = readFileSync("src/sections/CollectionSection.tsx", "utf8");
const shareSrc = readFileSync("src/data/share.ts", "utf8");

/* -------- the detail header, minimal (v29) ---------------------------- */

const primitivesSrc = readFileSync("src/ui/primitives.tsx", "utf8");

check(
  "the detail controls are icons that unfold their word on hover",
  primitivesSrc.includes("export function ExpandPill") &&
    primitivesSrc.includes("max-w-0") &&
    primitivesSrc.includes("group-hover:max-w-[12rem]") &&
    primitivesSrc.includes("group-focus-visible:max-w-[12rem]") &&
    primitivesSrc.includes("max-lg:max-w-[12rem]"),
  "the row never jumps: the hidden word is width-animated, and shows on touch",
);
check(
  "every detail control is one of those pills",
  (detailSrc.match(/<ExpandPill/g) ?? []).length === 4 &&
    detailSrc.includes('icon="shuffle"') &&
    detailSrc.includes('icon="share"') &&
    detailSrc.includes('icon="edit"') &&
    /* the only fixed-label button left belongs to the empty state */
    (detailSrc.match(/<PillButton/g) ?? []).length === 1 &&
    detailSrc.includes('t("detail.addSongs")'),
  "play all · shuffle · share · edit, nothing with a fixed label",
);
check(
  "the details sit under the name, the duration next to the count",
  detailSrc.includes("byline:") &&
    detailSrc.includes("facts:") &&
    detailSrc.includes("countOf(tracks, t)") &&
    detailSrc.includes("t(\"detail.minutes\"") &&
    !detailSrc.includes("heading.sub") &&
    /* the two lines are stacked inside the info block, not pushed aside */
    detailSrc.includes('className="min-w-0 flex-1"') &&
    !detailSrc.includes("text-end"),
  "name, then who it is by, then year · tracks · minutes",
);
check(
  "the controls sit opposite those details, not under the name",
  /lg:ms-auto lg:w-auto lg:flex-nowrap[\s\S]{0,200}<ExpandPill/.test(detailSrc) &&
    detailSrc.includes('tone="primary" icon="play"'),
  "the four pills are a sibling of the info block, pushed to the far end",
);
check(
  "on a phone the same header stacks instead of squeezing the title away",
  detailSrc.includes("flex flex-wrap items-start gap-x-3 gap-y-2.5 lg:gap-x-4 lg:gap-y-3") &&
    detailSrc.includes("lg:size-[76px]") &&
    detailSrc.includes("lg:truncate") &&
    /* the pill row takes its own full-width line, and may use two of them
       when a playlist of your own adds the edit pencil */
    detailSrc.includes("flex w-full shrink-0 flex-wrap items-center gap-2") &&
    !detailSrc.includes('className="ms-auto flex shrink-0 items-center gap-2"'),
  "measured 390px: title 0px → 187px, zero pills past the card edge",
);
check(
  "an artist opens as singles and albums",
  detailSrc.includes('t("detail.singles")') &&
    detailSrc.includes('t("detail.artistAlbums")') &&
    detailSrc.includes("albums.filter((album) => album.artist === artist.name)") &&
    detailSrc.includes('openDetail({ kind: "album", id: album.id })') &&
    detailSrc.includes("tracksForAlbum"),
  "and each album row opens the album card, right here",
);


check(
  "the download arrow points down and share is the share mark",
  generatorSrc.includes('download: "arhive-load"') &&
    generatorSrc.includes('share: "group-share"') &&
    /** the pack's own download is a cloud with an arrow pointing *up* */
    !generatorSrc.includes('download: "download"'),
  "both were unreadable as themselves before",
);
check(
  "the player numbers the row inside the run it was handed",
  playerCtxSrc.includes("export type QueueSource") &&
    playerCtxSrc.includes("queueIndex") &&
    playerCtxSrc.includes("setSource((prev)") &&
    playerSrc.includes("player.queueIndex") &&
    playerSrc.includes("player.queue.length"),
  "a playlist play reads 6/9, not 6/12",
);
check(
  "every play out of the detail card carries its list",
  detailSrc.includes("runOf(") &&
    (detailSrc.match(/player\.play\(/g) ?? []).length === 1 &&
    (detailSrc.match(/start\(track, heading!\.tracks\.map/g) ?? []).length === 1 &&
    detailSrc.includes("if (first) start(first, ids)"),
  "the rows, play-all and shuffle all pass their track ids through one door",
);
check(
  "a saved-playlist card opens the songs, not the editor",
  mineSrc.includes('openDetail({ kind: "playlist", id: list.id })') &&
    mineSrc.includes("setEditingId(list.id)") &&
    !mineSrc.includes("setEditOpen(true)"),
  "edit and share are buttons of their own under the card",
);
check(
  "the playlist card offers edit and share",
  mineSrc.includes('t("playlist.editTip")') &&
    mineSrc.includes('t("playlist.shareTip")') &&
    mineSrc.includes('icon="edit"') === false &&
    mineSrc.includes('name="edit"') &&
    mineSrc.includes('name="share"'),
);
check(
  "the detail card can be shared and edited too",
  detailSrc.includes("<ShareDialog") &&
    detailSrc.includes("librarySubject(") &&
    detailSrc.includes('icon="share"') &&
    detailSrc.includes('icon="edit"'),
);
check(
  "one share sheet, whichever thing is being shared",
  shareSrc.includes("export type ShareSubject") &&
    shareSrc.includes("export function trackSubject") &&
    shareSrc.includes("export function librarySubject") &&
    readFileSync("src/ui/ShareDialog.tsx", "utf8").includes("subject: ShareSubject | null"),
);

/* ------------- icons: one pack, one mapping table (v27) --------------- */


/** the generated file: one `siteName: "body"` row per icon */
const generated = [...iconBodySrc.matchAll(/^ {2}([A-Za-z][\w]*): (".*"),$/gm)].map((m) => ({
  name: m[1],
  body: JSON.parse(m[2]) as string,
}));
/** the generator's table: `siteName: "pack-name",` */
const mapped = [...generatorSrc.matchAll(/^ {2}([A-Za-z][\w]*): "([\w-]+)",/gm)].map(
  (m) => [m[1], m[2]] as const,
);

check(
  "every icon in the app is a pack icon",
  iconSrc.includes('from "./icons.gen"') &&
    !iconSrc.includes("const paths") &&
    iconBodySrc.includes("Lets Icons") &&
    iconBodySrc.includes("CC BY 4.0"),
  "Icon.tsx draws nothing of its own; the artwork is generated from the pack",
);
check(
  "the mapping table and the generated file agree",
  generated.length > 0 &&
    generated.length === mapped.length &&
    mapped.every(([site], i) => generated[i].name === site),
  `${mapped.length} rows, ${generated.length} icons`,
);
check(
  "every icon named in the app exists in the pack file",
  (() => {
    const used = new Set<string>();
    for (const file of sources) {
      const code = readFileSync(file, "utf8");
      for (const m of code.matchAll(/(?:name|icon)=["']([A-Za-z][\w]*)["']/g)) used.add(m[1]);
      for (const m of code.matchAll(/icon: ["']([A-Za-z][\w]*)["']/g)) used.add(m[1]);
    }
    const known = new Set(generated.map((g) => g.name));
    const missing = [...used].filter((n) => !known.has(n));
    return missing.length === 0;
  })(),
);
check(
  "icon artwork carries no colour and no baked-in weight",
  generated.every((g) => {
    /* mask references keep their id on purpose — only real colours matter */
    const withoutMasks = g.body.replace(/<mask[\s\S]*?<\/mask>/g, "").replace(/url\(#\w+\)/g, "");
    return (
      g.body.includes("currentColor") &&
      !withoutMasks.includes("#") &&
      !withoutMasks.includes("stroke-width=\"2\"")
    );
  }),
  "the skeleton comes from the pack, the paint comes from the call site",
);
check(
  "a liked song wears the solid heart, not just a tinted outline",
  (() => {
    const stroke = generated.find((g) => g.name === "heart")?.body ?? "";
    const solid = generated.find((g) => g.name === "heartFill")?.body ?? "";
    return (
      /* the pair must really be a pair: same outline, one of them inked */
      stroke.includes('fill="none"') &&
        solid.includes('fill="currentColor"') &&
        !solid.includes('fill="none"') &&
        /* ink the stroke heart and you get the solid one, byte for byte */
        solid.replace('fill="currentColor"', 'fill="none"') === stroke &&
        /* and the button has to switch artwork — a `fill` prop on the stroke
           icon is dead weight: the generated path carries its own fill */
        playerSrc.includes('name={on ? "heartFill" : "heart"}') &&
        !playerSrc.includes('fill={on ?')
    );
  })(),
  "the pack's `favorite-fill` next to `favorite`, swapped on `aria-pressed`",
);
check(
  "nothing asks a component to hide with a class the cascade overrides",
  (() => {
    /* A component that sets its own `display` — Avatar and the pills are
       `inline-flex`, the cards are `flex` — cannot be hidden with a bare
       `hidden`: Tailwind emits `.hidden` before `.inline-flex`, so the base
       class wins and the element stays on screen. `max-lg:hidden` (a media
       query, emitted last) or a wrapper that is hidden instead. */
    const OWN_DISPLAY = [
      "Avatar",
      "AvatarStack",
      "Card",
      "SurfaceCard",
      "CircleButton",
      "PillButton",
      "ExpandPill",
      "PlayDot",
      "PlayFab",
    ];
    const fights: string[] = [];
    for (const file of sources) {
      const src = readFileSync(file, "utf8");
      for (const comp of OWN_DISPLAY) {
        for (const tag of src.match(new RegExp(`<${comp}\\b(?:(?:=>|[^>])*?)>`, "g")) ?? []) {
          const value = tag.match(/className=(?:"([^"]*)"|\{[^}]*?"([^"]*)")/);
          const cls = value?.[1] ?? value?.[2] ?? "";
          if (cls.split(/\s+/).includes("hidden")) fights.push(`${file}: <${comp} className="${cls}">`);
        }
      }
    }
    return fights.length === 0;
  })(),
  "a bare `hidden` on a component with its own display is a no-op",
);
check(
  "the shop icon is an outline, like the rest of the menu",
  (() => {
    const body = generated.find((g) => g.name === "shop")?.body ?? "";
    return body.includes('stroke="currentColor"') && !body.includes('fill="currentColor"');
  })(),
  "the pack's own `shop` is filled; the menu uses its stroke cut",
);

check(
  "two copies of a masked icon don't fight over one id",
  (() => {
    const html = renderToString(
      <div>
        <Icon name="verified" size={14} />
        <Icon name="verified" size={14} />
      </div>,
    );
    const ids = [...html.matchAll(/id="(SVG[^"]*)"/g)].map((m) => m[1]);
    return ids.length === 2 && ids[0] !== ids[1] && html.includes(`url(#${ids[1]})`);
  })(),
  "useId() gives each render its own mask",
);

console.log(results.join("\n"));
console.log(`\n${pass}/${pass + fail} PASS${fail ? ` — ${fail} FAILED` : ""}`);
(globalThis as { process?: { exit(code: number): void } }).process?.exit(fail ? 1 : 0);
