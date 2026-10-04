import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./AppContext";
import { usePreferences } from "./PreferencesContext";
import { PAGES } from "./pages";
import { BrandCard } from "../sections/BrandCard";
import { AccountCard } from "../sections/AccountCard";
import { BrowseDetailView } from "../sections/BrowseDetailView";
import { MobileNav } from "../sections/MobileNav";
import { MiniPlayer } from "../sections/MiniPlayer";
import { PlayerSheet } from "../sections/PlayerSheet";
import { SurfaceCard } from "../ui/primitives";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Compact shell — phones and tablets.
 *
 *  Same five pieces as the desktop shell, arranged the way a hand holds
 *  them:
 *
 *    ┌───────────────────────────────┐
 *    │ (spacer)   FAIMESS   🔔  👤   │   brand centred, controls at the end
 *    │ [ search ……………………………… ]      │   full-width card of its own
 *    │ ┌───────────────────────────┐ │
 *    │ │  page or detail, scrolling│ │   one content card, no side column
 *    │ └───────────────────────────┘ │
 *    ├───────────────────────────────┤
 *    │ ▶  playing ············  ⏭   │   mini player (fixed)
 *    │ Home Artists Albums Lists Shop│   bottom navigation (fixed)
 *    └───────────────────────────────┘
 *
 *  The player never leaves: it is a bar above the menu until you tap it,
 *  then the full card (PlayerSection itself) slides over the screen. The
 *  feed's quick-jump strip is not rendered here at all — on a phone the
 *  shelves are meant to be scrolled, not jumped between.
 *
 *  Both fixed bars share one centred, width-capped column so a tablet does
 *  not get a bottom bar stretched across the whole screen.
 * ------------------------------------------------------------------ */

export function CompactShell() {
  const { route, detail } = useApp();
  const { dir } = usePreferences();
  const [playerOpen, setPlayerOpen] = useState(false);
  const Page = PAGES[route];

  return (
    <div dir={dir} className="flex min-h-dvh w-full flex-col gap-3 px-3 pt-3 pb-[11rem]">
      {/* top row — brand in the middle, search controls at the end */}
      <div className="relative mx-auto flex w-full max-w-[720px] shrink-0 items-center justify-end">
        {/* physically centred: `justify-center` would only centre it between
            two unequal neighbours (the controls pill is wider than nothing) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <BrandCard compact />
        </div>
        <AccountCard part="controls" />
      </div>

      {/* search — its own full-width card, under the top row */}
      <AccountCard part="search" className="mx-auto w-full max-w-[720px]" />

      {/* content — the page, or the detail card, in one scrolling card */}
      <SurfaceCard dir={dir} className="mx-auto w-full max-w-[720px] shrink-0">
        <div data-content-scroll className="flex min-h-0 flex-1 flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {detail ? (
              <motion.div
                key={`detail:${detail.kind}:${detail.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex min-h-0 flex-col"
              >
                <BrowseDetailView />
              </motion.div>
            ) : (
              <motion.div
                key={route}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.34, ease: EASE }}
                className="flex min-h-0 flex-col"
              >
                <Page />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SurfaceCard>

      {/* the bottom stack — mini player over the menu, both pinned */}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-50">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-2">
          <MiniPlayer onOpen={() => setPlayerOpen(true)} />
          <MobileNav />
        </div>
      </div>

      <PlayerSheet open={playerOpen} onClose={() => setPlayerOpen(false)} />
    </div>
  );
}
