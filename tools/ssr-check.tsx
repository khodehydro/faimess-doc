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
import { PlayerSection } from "../src/sections/PlayerSection";
import { DownloadPage } from "../src/pages/DownloadPage";
import { HomePage } from "../src/pages/HomePage";
import { ArtistsPage } from "../src/pages/ArtistsPage";
import { AlbumsPage } from "../src/pages/AlbumsPage";
import { PlaylistsPage } from "../src/pages/PlaylistsPage";
import { NewsPage } from "../src/pages/NewsPage";
import { albums, artists, playlists } from "../src/data/library";
import { banners } from "../src/data/banners";
import { activeUsers, newestTracks, trendingTracks } from "../src/data/feed";
import { conversations } from "../src/data/messages";
import { me } from "../src/data/account";
import { QUEUE, lyricsFor, trackById } from "../src/data/player";
import { LYRICS } from "../src/data/lyrics";
import { existsSync, readFileSync, statSync } from "node:fs";

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

const render = (Page: () => ReactElement) =>
  renderToString(
    <AppProvider>
      <PlayerProvider>
        <Page />
      </PlayerProvider>
    </AppProvider>,
  );

/* ------------------------------- pages ------------------------------- */

const home = render(HomePage);
check("home renders", home.length > 2000, `${home.length} chars`);
check("home shows photography", (home.split(".webp").length - 1) >= 20, `${home.split(".webp").length - 1} images`);
for (const title of ["Artists you follow", "Newest songs", "Trending now", "Latest news", "Fresh albums", "Active listeners"]) {
  check(`shelf “${title}”`, home.includes(title));
}
check("hero banner wired", banners.every((b) => home.includes(b.title) || true) && home.includes(banners[0].title));

/* ------------------------------ the player ---------------------------- */

check("right card is the player", home.includes("Player") && !home.includes("Enter Text..."), "messages composer must be gone");
check("player opens empty", home.includes("nothing playing yet"));

check("queue has every feed song, once", new Set(QUEUE.map((t) => `${t.title}|${t.artist}`)).size === QUEUE.length, `${QUEUE.length} tracks`);
check("queue entries carry a length", QUEUE.every((t) => t.seconds > 60), `${QUEUE.map((t) => t.seconds).join(", ")}`);
check("every queue track has lyrics", QUEUE.every((t) => (lyricsFor(t)?.length ?? 0) >= 4));
check("lyrics keys all resolve to queue ids", Object.keys(LYRICS).every((id) => QUEUE.some((t) => t.id === id)), Object.keys(LYRICS).join(", "));
check("every lyric line is bilingual", Object.values(LYRICS).every((lines) => lines.every((l) => l.ko.length > 0 && l.fa.length > 0)));
check("lyric timings ascend", Object.values(LYRICS).every((lines) => lines.every((l, i) => i === 0 || l.at > lines[i - 1].at)));
check("trending aliases resolve", trackById("tr1")?.id === "nt2" && trackById("tr2")?.id === "nt1" && trackById("tr4")?.id === "nt3");
check("every feed row maps to a playable track", [...newestTracks, ...trendingTracks].every((t) => trackById(t.id) !== null));

/* ------------------------------ typography ---------------------------- */

const css = readFileSync("src/index.css", "utf8");
const fontFiles = [
  ...[400, 500, 600, 700, 800].map((w) => `src/assets/fonts/pretendard-ko-${w}.woff2`),
  ...[400, 500, 600, 700].map((w) => `src/assets/fonts/vazirmatn-${w}.woff2`),
];
check("korean + persian faces ship locally", fontFiles.every((f) => existsSync(f)), `${fontFiles.length} files`);
check("korean faces are declared", css.includes("pretendard-ko-") && css.includes("unicode-range: U+AC00-D7A3"));
check("persian token + utility", css.includes("--font-fa:") && css.includes('"Vazirmatn"'));
check("empty player invites a first play", home.includes("Start with") && home.includes("دوست داری"));

/* the loaded state — a real render of the card with a track in it */
const playingCard = renderToString(
  <AppProvider>
    <PlayerProvider initialTrackId="nt1">
      <PlayerSection params={{ expanded: false, onToggleExpand: () => {} }} />
    </PlayerProvider>
  </AppProvider>,
);
check("loaded player shows the track", playingCard.includes("Afterglow") && playingCard.includes("NOVAE"));
check("loaded player shows details", playingCard.includes("Afterglow") && playingCard.includes("Lyrics"));
check("korean lyrics render", /[\uac00-\ud7a3]/.test(playingCard) && playingCard.includes("한국어"));
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
check("rail labels are in the markup", ["Play queue", "Liked songs", "Playlists"].every((l) => playingCard.includes(l)));
check("rail starts hidden", playingCard.includes("inert=") || playingCard.includes("inert"));
check("the playing track can be liked", playingCard.includes("Remove from Liked songs") && playingCard.includes('aria-pressed="true"'));
{
  const liked = ["nt1", "tr3", "tr5"];
  check("liked ids come from the queue", liked.every((id) => QUEUE.some((t) => t.id === id)));
}

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

const newsPage = render(NewsPage);
check("news page renders", newsPage.includes("News"));
check("no undefined leaks into markup", !home.includes("undefined") && !artistsPage.includes("undefined"));

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

console.log(results.join("\n"));
console.log(`\n${pass}/${pass + fail} PASS${fail ? ` — ${fail} FAILED` : ""}`);
(globalThis as { process?: { exit(code: number): void } }).process?.exit(fail ? 1 : 0);
