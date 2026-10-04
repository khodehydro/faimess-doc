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
 * True on phones and tablets. Starts `false` (desktop) so the first paint
 * — and any render without a `window`, like the SSR checks — matches the
 * art-board, then corrects itself on mount.
 */
export function useCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return compact;
}
