import { useCallback, useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 *  Minimal hash router — zero dependencies, back/forward works.
 *  Add a page by extending the route lists and dropping a component
 *  in pages/ (see docs/architecture.md).
 * ------------------------------------------------------------------ */

export type RouteId =
  | "home"
  | "artists"
  | "albums"
  | "playlists"
  | "shop"
  | "news"
  | "download";

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
];

export const allRoutes: RouteDef[] = [...routes, ...contextualRoutes];

const fromHash = (hash: string): RouteId => {
  const clean = hash.replace(/^#\/?/, "").split("?")[0].toLowerCase();
  const match = allRoutes.find((r) => r.path.replace(/^#\/?/, "") === clean);
  return (match?.id ?? "home") as RouteId;
};

export function useRoute() {
  const [route, setRoute] = useState<RouteId>(() =>
    typeof window === "undefined" ? "home" : fromHash(window.location.hash),
  );

  useEffect(() => {
    const onHash = () => setRoute(fromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((id: RouteId) => {
    const target = allRoutes.find((r) => r.id === id);
    if (!target) return;
    if (window.location.hash === target.path) return;
    window.location.hash = target.path;
  }, []);

  const current = useMemo(() => allRoutes.find((r) => r.id === route) ?? allRoutes[0], [route]);

  return { route, navigate, current };
}
