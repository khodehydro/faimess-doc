import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./AppContext";
import { PlayerProvider } from "./PlayerContext";
import { PlaylistsProvider } from "./PlaylistsContext";
import { CommentsProvider } from "./CommentsContext";
import { ContributionsProvider } from "./ContributionsContext";
import { PreferencesProvider, usePreferences } from "./PreferencesContext";
import { Stage } from "./Stage";
import { ToastHost } from "./ToastHost";
import { SectionSlot } from "../sections/registry";
import { SurfaceCard } from "../ui/primitives";
import { BrowseDetailView } from "../sections/BrowseDetailView";
import { cn } from "../lib/cn";
import { EASE } from "../lib/motion";
import { PAGES } from "./pages";
import { CompactShell } from "./CompactShell";
import { useCompact } from "../hooks/useCompact";
import { AuthProvider } from "./AuthContext";
import { AccountDoor } from "../sections/AccountDoor";
import { Splash } from "../ui/Splash";
import { SeoHead } from "../sections/SeoHead";
import { AdminTopNav } from "../sections/admin/AdminTopNav";

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

/**
 * The dashboard — the art-board, both shells, the player and the shelves.
 *
 * Nothing here depends on who is looking: the app is open to read. The
 * account door is a separate layer (`<AccountDoor />`) that opens on top
 * of this only when an action actually needs an account.
 */
export function Screen() {
  return (
    <Stage>
      <Shell />
    </Stage>
  );
}

export function Shell() {
  const { route, detail } = useApp();
  const { dir } = usePreferences();
  /** the player card's expand button — its width is shared by every route */
  const [wide, setWide] = useState(false);
  const Page = PAGES[route];
  /* under 1024px the art-board is gone and the same app is arranged for a
     hand: bottom menu, mini player, search in its own card (CompactShell) */
  const compact = useCompact();

  if (compact) return <CompactShell />;

  return (
    <div
      dir={dir}
      className="flex h-full w-full min-h-0 flex-col gap-5 rounded-[24px] bg-shell p-4 shadow-frame ring-1 ring-black/[0.035] lg:gap-5 lg:rounded-shell dark:ring-white/[0.05]"
    >
      {/* top row — three separate pills */}
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
        <SectionSlot id="brand" params={undefined} />
        {route === "admin" ? (
          <AdminTopNav />
        ) : (
          <SectionSlot id="nav" params={undefined} />
        )}
        <div className="ms-auto flex items-center">
          <SectionSlot id="account" params={undefined} />
        </div>
      </div>

      {/* Content row — the content card on one side, the player on the other,
          on *every* route. Opening a playlist, an artist or an album swaps
          what the content card shows; it never takes the player away, which
          is the whole point of the layout. The row follows the interface
          direction, so in Persian the content card takes the right-hand
          column and the player the left one. Each card re-declares `dir` for
          its own text, so nothing inside depends on where it landed. */}
      {route === "admin" ? (
        <SurfaceCard dir={dir} className="w-full flex-1 min-h-0">
          <div
            data-content-scroll
            className="scroll-slim flex min-h-0 flex-1 flex-col lg:overflow-y-auto"
          >
            <Page />
          </div>
        </SurfaceCard>
      ) : (
        <div
          dir={dir}
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-4 lg:flex-row",
            wide && "home-split-wide",
          )}
        >
          <SurfaceCard dir={dir} className="home-split-left lg:min-h-0">
            <div
              data-content-scroll
              className="scroll-slim flex min-h-0 flex-1 flex-col lg:overflow-y-auto"
            >
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
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <Page />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SurfaceCard>

          <SurfaceCard dir={dir} className="home-split-right lg:min-h-0">
            <SectionSlot
              id="player"
              params={{ expanded: wide, onToggleExpand: () => setWide((w) => !w) }}
            />
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}

function InnerApp() {
  const { deepLinkTrackId } = useApp();
  return (
    <PlayerProvider initialTrackId={deepLinkTrackId ?? undefined}>
      <SeoHead />
      <CommentsProvider>
        <ContributionsProvider>
          <Splash />
          <Screen />
          <AccountDoor />
          <ToastHost />
        </ContributionsProvider>
      </CommentsProvider>
    </PlayerProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PreferencesProvider>
        <AuthProvider>
          <PlaylistsProvider>
            <InnerApp />
          </PlaylistsProvider>
        </AuthProvider>
      </PreferencesProvider>
    </AppProvider>
  );
}
