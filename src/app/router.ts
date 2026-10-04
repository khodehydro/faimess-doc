import { useCallback, useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 *  Minimal hash router — zero dependencies, back/forward works.
 *  Add a page by extending `routes` and dropping a component in pages/.
 * ------------------------------------------------------------------ */

export type RouteId = "home" | "artists" | "albums" | "playlists";

export const routes: Array<{ id: RouteId; label: string; path: string }> = [
  { id: "home", label: "Home", path: "#/" },
  { id: "artists", label: "Artists", path: "#/artists" },
  { id: "albums", label: "Albums", path: "#/albums" },
  { id: "playlists", label: "Playlists", path: "#/playlists" },
];

const fromHash = (hash: string): RouteId => {
  const clean = hash.replace(/^#\/?/, "").split("?")[0].toLowerCase();
  const match = routes.find((r) => r.path.replace(/^#\/?/, "") === clean);
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
    const target = routes.find((r) => r.id === id);
    if (!target) return;
    if (window.location.hash === target.path) return;
    window.location.hash = target.path;
  }, []);

  const current = useMemo(() => routes.find((r) => r.id === route) ?? routes[0], [route]);

  return { route, navigate, current };
}
