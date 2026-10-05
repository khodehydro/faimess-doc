import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRoute, type RouteId } from "./router";

/* ------------------------------------------------------------------ *
 *  App-wide context: navigation + notifications.
 *  Sections only need `useApp()` — they stay decoupled from each other.
 * ------------------------------------------------------------------ */

export type Tone = "primary" | "teal" | "mint";

/**
 * What the main content card is showing on top of the page beneath it.
 *
 * Opening a playlist, an artist or an album never leaves the home layout:
 * the detail card replaces the page *inside* the content card, so the player
 * stays exactly where it is. `navigate()` closes it, which is how the top
 * menu gets back to a plain page.
 */
export type DetailKind = "artist" | "album" | "playlist";
export type Detail = { kind: DetailKind; id: string };

export type Toast = { id: number; text: string; tone: Tone };

type AppValue = {
  route: RouteId;
  navigate: (id: RouteId) => void;
  /** the entity the content card is showing, if any */
  detail: Detail | null;
  openDetail: (detail: Detail) => void;
  closeDetail: () => void;
  selectedNewsId: string | null;
  openNews: (id: string) => void;
  closeNews: () => void;
  notify: (text: string, tone?: Tone) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
};

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({
  children,
  /** open the frame with a detail already showing — deep links and tests */
  initialDetail = null,
}: {
  children: ReactNode;
  initialDetail?: Detail | null;
}) {
  const { route, navigate: goToRoute } = useRoute();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [detail, setDetail] = useState<Detail | null>(initialDetail);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  const openDetail = useCallback((next: Detail) => {
    setDetail(next);
    /* a detail is always opened at the top of the card, not halfway down
       whichever page happened to be scrolled behind it */
    if (typeof document !== "undefined") {
      document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0 });
    }
  }, []);

  const closeDetail = useCallback(() => setDetail(null), []);

  const openNews = useCallback(
    (id: string) => {
      setDetail(null);
      setSelectedNewsId(id);
      goToRoute("news");
      if (typeof document !== "undefined") {
        document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0 });
      }
    },
    [goToRoute],
  );

  const closeNews = useCallback(() => {
    setSelectedNewsId(null);
  }, []);

  /** the top menu always means "that page", so it drops any open detail */
  const navigate = useCallback(
    (id: RouteId) => {
      setDetail(null);
      if (id !== "news") {
        setSelectedNewsId(null);
      }
      goToRoute(id);
    },
    [goToRoute],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (text: string, tone: Tone = "primary") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-2), { id, text, tone }]);
      window.setTimeout(() => dismiss(id), 2800);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      route,
      navigate,
      detail,
      openDetail,
      closeDetail,
      selectedNewsId,
      openNews,
      closeNews,
      notify,
      toasts,
      dismiss,
    }),
    [
      route,
      navigate,
      detail,
      openDetail,
      closeDetail,
      selectedNewsId,
      openNews,
      closeNews,
      notify,
      toasts,
      dismiss,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
