import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./AppContext";
import { Stage } from "./Stage";
import { ToastHost } from "./ToastHost";
import { SectionSlot } from "../sections/registry";
import { HomePage } from "../pages/HomePage";
import { ArtistsPage } from "../pages/ArtistsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { NewsPage } from "../pages/NewsPage";
import { EASE } from "../lib/motion";

const PAGES = {
  home: HomePage,
  artists: ArtistsPage,
  albums: AlbumsPage,
  playlists: PlaylistsPage,
  news: NewsPage,
} as const;

/* ------------------------------------------------------------------ *
 *  Shell — the five-card composition.
 *
 *    ┌────────┐ ┌──────────────┐            ┌──────────────────┐
 *    │ brand  │ │  main menu   │            │ search · bell · 👤│
 *    └────────┘ └──────────────┘            └──────────────────┘
 *    ┌───────────────────────────┐  ┌──────────────────────────┐
 *    │      left content card    │  │    right content card    │
 *    └───────────────────────────┘  └──────────────────────────┘
 *
 *  The three top cards are pills (semicircular ends); the two content
 *  cards keep the normal card radius. No wrapping frame — the cards
 *  float directly on the studio backdrop.
 * ------------------------------------------------------------------ */

function Shell() {
  const { route } = useApp();
  const Page = PAGES[route];

  return (
    <div className="flex h-full w-full flex-col gap-3.5 p-3 lg:p-0">
      {/* top row — three separate pills */}
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <SectionSlot id="brand" params={undefined} />
        <SectionSlot id="nav" params={undefined} />
        <div className="ml-auto flex items-center">
          <SectionSlot id="account" params={undefined} />
        </div>
      </div>

      {/* content row — pages own their cards */}
      <div className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.34, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Stage>
        <Shell />
      </Stage>
      <ToastHost />
    </AppProvider>
  );
}
