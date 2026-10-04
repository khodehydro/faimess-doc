import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./AppContext";
import { Stage } from "./Stage";
import { ToastHost } from "./ToastHost";
import { SectionSlot } from "../sections/registry";
import { HomePage } from "../pages/HomePage";
import { ArtistsPage } from "../pages/ArtistsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { PlaylistsPage } from "../pages/PlaylistsPage";
import { EASE } from "../lib/motion";

const PAGES = {
  home: HomePage,
  artists: ArtistsPage,
  albums: AlbumsPage,
  playlists: PlaylistsPage,
} as const;

/**
 * The frame: top bar + the active page.
 * Layout that must never scroll lives here (fixed stage height on desktop).
 */
function Shell() {
  const { route } = useApp();
  const Page = PAGES[route];

  return (
    <div className="mx-3 my-3 overflow-visible rounded-[26px] bg-surface shadow-card lg:mx-0 lg:my-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden lg:rounded-frame lg:shadow-frame lg:ring-1 lg:ring-black/[0.04]">
      <SectionSlot id="topbar" params={undefined} />

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
