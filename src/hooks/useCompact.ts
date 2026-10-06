import { useEffect, useState } from "react";

/**
 * The breakpoint where the app stops being a scaled art-board and becomes a
 * phone layout — the same 1024px line `useStageScale` uses, so the two can
 * never disagree about which world we are in. Tablets sit on the compact
 * side of it on purpose: the bottom navigation and mini player are what the
 * design asks for there too.
 */
export const COMPACT_QUERY = "(max-width: 1023px)";

/**
 * True on phones and tablets. Evaluated synchronously so the first paint
 * matches the device's actual viewport immediately — eliminating any
 * flash of desktop layout or shift on mobile/tablet load.
 * Falls back to `false` (desktop) during SSR where `window` is absent.
 */
export function useCompact() {
  const [compact, setCompact] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(mql.matches);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return compact;
}
