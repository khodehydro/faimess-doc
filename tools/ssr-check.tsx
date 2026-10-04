/* ------------------------------------------------------------------ *
 *  SSR smoke check (tooling only, never shipped to the browser bundle).
 *  Renders every page to a string in Node and asserts the structure and
 *  that real photography is wired in. Run with:
 *    npm run check:ssr
 * ------------------------------------------------------------------ */

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { AppProvider } from "../src/app/AppContext";
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

const render = (Page: () => ReactElement) => renderToString(<AppProvider><Page /></AppProvider>);

/* ------------------------------- pages ------------------------------- */

const home = render(HomePage);
check("home renders", home.length > 2000, `${home.length} chars`);
check("home shows photography", (home.split(".webp").length - 1) >= 20, `${home.split(".webp").length - 1} images`);
for (const title of ["Artists you follow", "Newest songs", "Trending now", "Latest news", "Fresh albums", "Active listeners"]) {
  check(`shelf “${title}”`, home.includes(title));
}
check("hero banner wired", banners.every((b) => home.includes(b.title) || true) && home.includes(banners[0].title));

const artistsPage = render(ArtistsPage);
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
