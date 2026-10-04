import { useState } from "react";
import { SurfaceCard } from "../ui/primitives";
import { SectionSlot } from "../sections/registry";
import { cn } from "../lib/cn";
import { usePreferences } from "../app/PreferencesContext";

/**
 * Home — two of the five cards, split 75 / 25.
 *
 * Left card (75%):  ONE scroll surface — the hero carousel and the music feed
 *                   scroll together, so the banner leaves the viewport naturally
 *                   as you read down the feed.
 * Right card (25%): the player — cover + seek bar on top (40%), bilingual
 *                   lyrics with their own scroll below (60%). Deliberately
 *                   narrower than the left card so the feed keeps the weight.
 *                   Its expand button widens it to 55% (and back) — the class
 *                   `home-split-wide` on the row does the animating.
 *
 * The split lives in `home-split-left` / `home-split-right` (src/index.css) so it
 * also cancels the base `flex-1` that SurfaceCard carries; below `lg` the two
 * cards stack full-width and the document scrolls instead.
 */
export function HomePage() {
  const { dir } = usePreferences();
  /* the player's expand / collapse button */
  const [wide, setWide] = useState(false);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3.5 lg:flex-row",
        wide && "home-split-wide",
      )}
    >
      {/* ── left content card ───────────────────────────────────────── */}
      <SurfaceCard dir={dir} className="home-split-left lg:min-h-0">
        <div className="scroll-slim flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
          <div className="shrink-0 p-3.5">
            <div className="h-[300px] sm:h-[330px] lg:h-[340px]">
              <SectionSlot id="hero" params={undefined} />
            </div>
          </div>

          <div className="shrink-0">
            <SectionSlot id="feed" params={undefined} />
          </div>

          {/* keeps the last shelf clear of the card's bottom edge when scrolled */}
          <div className="h-5 shrink-0" />
        </div>
      </SurfaceCard>

      {/* ── right content card ──────────────────────────────────────── */}
      <SurfaceCard dir={dir} className="home-split-right lg:min-h-0">
        <SectionSlot
          id="player"
          params={{ expanded: wide, onToggleExpand: () => setWide((w) => !w) }}
        />
      </SurfaceCard>
    </div>
  );
}
