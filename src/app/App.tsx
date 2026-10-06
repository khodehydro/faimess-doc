import { useState, useEffect } from "react";
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
import { AdminSidebar } from "../sections/admin/AdminSidebar";

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
  const { route, detail, viewedProfileUsername } = useApp();
  const { dir } = usePreferences();
  /** the player card's expand button — its width is shared by every route */
  const [wide, setWide] = useState(false);
  const Page = PAGES[route];
  /* under 1024px the art-board is gone and the same app is arranged for a
     hand: bottom menu, mini player, search in its own card (CompactShell) */
  const compact = useCompact();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (typeof document !== "undefined") {
      document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [route, detail, viewedProfileUsername]);

  if (compact) return <CompactShell />;

  return (
    <div
      dir={dir}
      className="flex h-full w-full min-h-0 flex-col gap-5 rounded-[24px] bg-shell p-4 shadow-frame ring-1 ring-black/[0.035] lg:gap-5 lg:rounded-shell dark:ring-white/[0.05]"
    >
      {/* top row — three separate pills */}
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
        <SectionSlot id="brand" params={undefined} />
        {route !== "admin" && (
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
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-5">
          <AdminSidebar />
          <SurfaceCard dir={dir} className="flex-1 min-w-0 min-h-0">
            <div
              data-content-scroll
              className="scroll-slim flex min-h-0 flex-1 flex-col lg:overflow-y-auto"
            >
              <Page />
            </div>
          </SurfaceCard>
        </div>
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
                    key={route === "profile" ? `profile:${viewedProfileUsername ?? "me"}` : route}
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isEditable = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || target.isContentEditable;
    };

    // 1. Block right-click context menu (Save image as..., Copy image, Copy text, etc.)
    const handleContextMenu = (e: MouseEvent) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    };

    // 2. Block clipboard copy & cut operations for site content and lyrics
    const handleCopy = (e: ClipboardEvent) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    // 3. Block dragging images or text to desktop or other tabs
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. Block selection start event
    const handleSelectStart = (e: Event) => {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    };

    // 5. Block save and copy shortcuts (Ctrl+S, Ctrl+C outside input, Ctrl+P, Ctrl+U, Ctrl+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Ctrl+S / Cmd+S (Save page/assets)
      if (isCtrl && key === "s") {
        e.preventDefault();
        return;
      }
      // Block Ctrl+P / Cmd+P (Print / Save as PDF)
      if (isCtrl && key === "p") {
        e.preventDefault();
        return;
      }
      // Block Ctrl+U / Cmd+U (View Source)
      if (isCtrl && key === "u") {
        e.preventDefault();
        return;
      }
      // Block Ctrl+C / Cmd+C outside input
      if (isCtrl && key === "c" && !isEditable(e.target)) {
        e.preventDefault();
        return;
      }
      // Block Ctrl+A / Cmd+A outside input
      if (isCtrl && key === "a" && !isEditable(e.target)) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("cut", handleCut, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("selectstart", handleSelectStart, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("cut", handleCut, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("selectstart", handleSelectStart, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

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
