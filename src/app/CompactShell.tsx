import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./AppContext";
import { usePreferences } from "./PreferencesContext";
import { PAGES } from "./pages";
import { BrandCard } from "../sections/BrandCard";
import { AccountCard } from "../sections/AccountCard";
import { ArtistStories } from "../sections/ArtistStories";
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
 *    │ ( search …………………… )      │   full-width capsule of its own
 *    │ (◕) (◕) (◕) (◕) (◕) (◕) →     │   followed artists, story-rail style
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
 *  shelves are meant to be scrolled, not jumped between. The artists you
 *  follow are not a shelf here either: they live in the story rail above the
 *  content card (`ArtistStories`), so the feed skips that shelf below 1024px.
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
    <div dir={dir} className="flex min-h-dvh w-full flex-col gap-3 px-4 pt-3.5 pb-[10rem] lg:gap-4 lg:pt-4 lg:pb-[11rem]">
      {/* physical left-to-right order: notifications / centred brand / profile.
          A three-column grid — `1fr auto 1fr` — is what actually centres the
          middle column: an absolutely-positioned pill was centred on the
          *row*, and the two controls do not have equal widths, so the
          wordmark sat off-centre by half their difference and the controls
          themselves were pushed off by the same amount. */}
      <div
        dir="ltr"
        className="relative mx-auto grid w-full max-w-[720px] shrink-0 grid-cols-[1fr_auto_1fr] items-center"
      >
        <AccountCard part="notification" className="relative z-20 justify-self-start" />
        <BrandCard compact />
        <AccountCard part="profile" className="relative z-20 justify-self-end" />
      </div>

      {/* search — its own full-width capsule, under the top row */}
      <AccountCard part="search" className="mx-auto w-full max-w-[720px]" />

      {/* the artists you follow — a story rail of their own, between the
          search field and the banner. Home is where the banner is, so the
          rail rides along with it and not with every other page. */}
      {route === "home" && <ArtistStories />}

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
