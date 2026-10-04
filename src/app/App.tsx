import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./AppContext";
import { PlayerProvider } from "./PlayerContext";
import { CommentsProvider } from "./CommentsContext";
import { ContributionsProvider } from "./ContributionsContext";
import { Stage } from "./Stage";
import { ToastHost } from "./ToastHost";
import { SectionSlot } from "../sections/registry";
import { HomePage } from "../pages/HomePage";
import { ArtistsPage } from "../pages/ArtistsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { NewsPage } from "../pages/NewsPage";
import { DownloadPage } from "../pages/DownloadPage";
import { EASE } from "../lib/motion";

const PAGES = {
  home: HomePage,
  artists: ArtistsPage,
  albums: AlbumsPage,
  playlists: PlaylistsPage,
  news: NewsPage,
  download: DownloadPage,
} as const;

/* ------------------------------------------------------------------ *
 *  Shell — the parent card and the five cards inside it.
 *
 *    ┌─────────────────────── parent card (#F1F2F5) ───────────────────────┐
 *    │ ┌────────┐ ┌──────────────┐            ┌──────────────────┐         │
 *    │ │ brand  │ │  main menu   │            │ search · bell · 👤│         │
 *    │ └────────┘ └──────────────┘            └──────────────────┘         │
 *    │ ┌───────────────────────────┐  ┌──────────────────────────┐         │
 *    │ │      left content card    │  │    right content card    │         │
 *    │ └───────────────────────────┘  └──────────────────────────┘         │
 *    └─────────────────────────────────────────────────────────────────────┘
 *
 *  Colour ladder: canvas #EAEAEC  →  parent #F1F2F5  →  cards #FFFFFF.
 *  The three top cards are pills (semicircular ends); the two content
 *  cards keep the normal card radius.
 * ------------------------------------------------------------------ */

function Shell() {
  const { route } = useApp();
  const Page = PAGES[route];

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3.5 rounded-[24px] bg-shell p-3 shadow-frame ring-1 ring-black/[0.035] lg:gap-3.5 lg:rounded-shell lg:p-3.5">
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
      <PlayerProvider>
        <CommentsProvider>
          <ContributionsProvider>
            <Stage>
              <Shell />
            </Stage>
            <ToastHost />
          </ContributionsProvider>
        </CommentsProvider>
      </PlayerProvider>
    </AppProvider>
  );
}
