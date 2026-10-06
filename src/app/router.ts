import { useCallback, useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 *  Minimal hash router — zero dependencies, back/forward works.
 *  Supports top-level pages as well as deep-linked entity paths:
 *    #/artist/:id   -> opens artist detail
 *    #/album/:id    -> opens album detail
 *    #/playlist/:id -> opens playlist detail
 *    #/track/:id    -> loads/plays track
 *    #/news/:id     -> opens news article
 * ------------------------------------------------------------------ */

export type RouteId =
  | "home"
  | "artists"
  | "albums"
  | "playlists"
  | "shop"
  | "news"
  | "download"
  | "admin";

export type EntityKind = "artist" | "album" | "playlist" | "track" | "news" | "admin";

export type ParsedRoute = {
  route: RouteId;
  entityKind?: EntityKind;
  entityId?: string;
};

type RouteDef = { id: RouteId; label: string; path: string };

/** pages shown in the top-bar navigation */
export const routes: RouteDef[] = [
  { id: "home", label: "Home", path: "#/" },
  { id: "artists", label: "Artists", path: "#/artists" },
  { id: "albums", label: "Albums", path: "#/albums" },
  { id: "playlists", label: "Playlists", path: "#/playlists" },
  { id: "shop", label: "Shop", path: "#/shop" },
];

/** pages reachable from inside the app but not in the nav */
export const contextualRoutes: RouteDef[] = [
  { id: "news", label: "News", path: "#/news" },
  { id: "download", label: "Get the app", path: "#/download" },
  { id: "admin", label: "Admin Console", path: "#/admin" },
];

export const allRoutes: RouteDef[] = [...routes, ...contextualRoutes];

export function parseHash(hashStr: string): ParsedRoute {
  // strip leading #/ or # or leading slashes
  const clean = hashStr.replace(/^[#/]+/, "").split("?")[0].trim();
  if (!clean) {
    return { route: "home" };
  }

  const parts = clean.split("/").filter(Boolean);
  const head = parts[0]?.toLowerCase() ?? "";
  const id = parts[1];

  if (id) {
    if (head === "artist" || head === "artists") {
      return { route: "artists", entityKind: "artist", entityId: id };
    }
    if (head === "album" || head === "albums") {
      return { route: "albums", entityKind: "album", entityId: id };
    }
    if (head === "playlist" || head === "playlists") {
      return { route: "playlists", entityKind: "playlist", entityId: id };
    }
    if (head === "track" || head === "tracks") {
      return { route: "home", entityKind: "track", entityId: id };
    }
    if (head === "news") {
      return { route: "news", entityKind: "news", entityId: id };
    }
    if (head === "admin") {
      return { route: "admin", entityKind: "admin", entityId: id };
    }
  }

  const match = allRoutes.find((r) => r.path.replace(/^#\/?/, "") === head);
  return { route: (match?.id ?? "home") as RouteId };
}

export function useRoute() {
  const [route, setRoute] = useState<RouteId>(() => {
    if (typeof window === "undefined") return "home";
    return parseHash(window.location.hash || window.location.pathname).route;
  });

  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash(window.location.hash);
      setRoute(parsed.route);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((id: RouteId) => {
    const target = allRoutes.find((r) => r.id === id);
    if (!target) return;
    if (typeof window !== "undefined") {
      if (window.location.hash !== target.path) {
        window.location.hash = target.path;
      }
    }
    setRoute(id);
  }, []);

  const current = useMemo(() => allRoutes.find((r) => r.id === route) ?? allRoutes[0], [route]);

  return { route, navigate, current, setRoute };
}
