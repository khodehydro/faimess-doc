import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { allRoutes, parseHash, useRoute, type RouteId } from "./router";

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
  viewedProfileUsername: string | null;
  openProfile: (username?: string) => void;
  deepLinkTrackId?: string | null;
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
  const { route, navigate: goToRoute, setRoute } = useRoute();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [detail, setDetail] = useState<Detail | null>(() => {
    if (initialDetail) return initialDetail;
    if (typeof window === "undefined") return null;
    const parsed = parseHash(window.location.hash || window.location.pathname);
    if (parsed.entityKind === "artist" || parsed.entityKind === "album" || parsed.entityKind === "playlist") {
      return { kind: parsed.entityKind as DetailKind, id: parsed.entityId! };
    }
    return null;
  });

  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const parsed = parseHash(window.location.hash || window.location.pathname);
    return parsed.entityKind === "news" ? (parsed.entityId ?? null) : null;
  });

  const [deepLinkTrackId, setDeepLinkTrackId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const parsed = parseHash(window.location.hash || window.location.pathname);
    return parsed.entityKind === "track" ? (parsed.entityId ?? null) : null;
  });

  const [viewedProfileUsername, setViewedProfileUsername] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const parsed = parseHash(window.location.hash || window.location.pathname);
    return parsed.route === "profile" && parsed.entityKind === "profile" ? (parsed.entityId ?? null) : null;
  });

  // Sync with browser back/forward buttons (hashchange)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setRoute(parsed.route);

      if (parsed.entityKind === "artist" || parsed.entityKind === "album" || parsed.entityKind === "playlist") {
        setDetail((prev) => {
          if (prev?.kind === parsed.entityKind && prev?.id === parsed.entityId) return prev;
          return { kind: parsed.entityKind as DetailKind, id: parsed.entityId! };
        });
        setSelectedNewsId(null);
        setViewedProfileUsername(null);
      } else if (parsed.entityKind === "news") {
        setSelectedNewsId(parsed.entityId ?? null);
        setDetail(null);
        setViewedProfileUsername(null);
      } else if (parsed.entityKind === "track") {
        setDeepLinkTrackId(parsed.entityId ?? null);
        setDetail(null);
        setSelectedNewsId(null);
        setViewedProfileUsername(null);
      } else if (parsed.route === "profile") {
        setViewedProfileUsername(parsed.entityId ?? null);
        setDetail(null);
        setSelectedNewsId(null);
      } else {
        setDetail(null);
        setSelectedNewsId(null);
        setViewedProfileUsername(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setRoute]);

  const openDetail = useCallback((next: Detail) => {
    setDetail(next);
    setSelectedNewsId(null);
    if (typeof window !== "undefined") {
      const targetHash = `#/${next.kind}/${next.id}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      if (typeof document !== "undefined" && typeof document.querySelector === "function") {
        document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0 });
      }
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    if (typeof window !== "undefined") {
      const baseRoute = allRoutes.find((r) => r.id === route)?.path ?? "#/";
      if (window.location.hash !== baseRoute) {
        window.location.hash = baseRoute;
      }
    }
  }, [route]);

  const openNews = useCallback(
    (id: string) => {
      setDetail(null);
      setSelectedNewsId(id);
      goToRoute("news");
      if (typeof window !== "undefined") {
        const targetHash = `#/news/${id}`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        if (typeof document !== "undefined" && typeof document.querySelector === "function") {
          document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0 });
        }
      }
    },
    [goToRoute],
  );

  const closeNews = useCallback(() => {
    setSelectedNewsId(null);
    if (typeof window !== "undefined") {
      if (window.location.hash !== "#/news") {
        window.location.hash = "#/news";
      }
    }
  }, []);

  const openProfile = useCallback(
    (username?: string) => {
      setDetail(null);
      setSelectedNewsId(null);
      const cleanUser = username?.trim().replace(/^@/, "");
      setViewedProfileUsername(cleanUser || null);
      goToRoute("profile");
      if (typeof window !== "undefined") {
        const targetHash = cleanUser ? `#/profile/${cleanUser}` : `#/profile`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        if (typeof document !== "undefined" && typeof document.querySelector === "function") {
          document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0 });
        }
      }
    },
    [goToRoute],
  );

  /** the top menu always means "that page", so it drops any open detail */
  const navigate = useCallback(
    (id: RouteId) => {
      setDetail(null);
      if (id !== "news") {
        setSelectedNewsId(null);
      }
      if (id !== "profile") {
        setViewedProfileUsername(null);
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
      viewedProfileUsername,
      openProfile,
      deepLinkTrackId,
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
      viewedProfileUsername,
      openProfile,
      deepLinkTrackId,
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
