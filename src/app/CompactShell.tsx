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
 *    │ 🔔       FAIMESS          👤  │   alert · centred brand · profile
 *    │ [ search ……………………………… ]      │   full-width card of its own
 *    │ ┌───────────────────────────┐ │
 *    │ │  page or detail, scrolling│ │   translucent white content card
 *    │ └───────────────────────────┘ │
 *    ├───────────────────────────────┤
 *    │ [▶  playing               ⏭] │   purple mini player after a track
 *    │ Home Artists Albums Lists Shop│   white capsule navigation
 *    └───────────────────────────────┘
 *
 *  The mini player stays hidden until a track is selected, then rises from
 *  below the navigation (which paints above it) and opens the full card on tap.
 *  The feed's quick-jump strip is not rendered here at all — on a phone the
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
    <div dir={dir} className="flex min-h-dvh w-full flex-col gap-4 px-4 pt-4 pb-[11rem]">
      {/* physical left-to-right order: notifications / centered brand / profile */}
      <div
        dir="ltr"
        className="relative mx-auto flex w-full max-w-[720px] shrink-0 items-center justify-between"
      >
        <AccountCard part="notification" className="relative z-20" />
        {/* physically centred so equal or unequal controls never shift the wordmark */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <BrandCard compact />
        </div>
        <AccountCard part="profile" className="relative z-20" />
      </div>

      {/* search — its own full-width card, under the top row */}
      <AccountCard part="search" className="mx-auto w-full max-w-[720px]" />

      {/* content — the page, or the detail card, in one scrolling card */}
      <SurfaceCard glass dir={dir} className="mx-auto w-full max-w-[720px] shrink-0">
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
