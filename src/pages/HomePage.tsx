import { SectionSlot } from "../sections/registry";

/**
 * Home — the content of the left card: the banner carousel over the feed.
 *
 * The card itself, and the player that sits beside it, belong to the Shell
 * (`app/App.tsx`), so every page gets the same frame and the player never
 * leaves the screen. This file only decides what the content card holds,
 * and it scrolls as one surface: the banner leaves the viewport naturally
 * as you read down the feed.
 */
export function HomePage() {
  return (
    <>
      <div className="shrink-0 p-4 pb-2">
        <div className="h-[300px] sm:h-[330px] lg:h-[340px]">
          <SectionSlot id="hero" params={undefined} />
        </div>
      </div>

      <div className="shrink-0">
        <SectionSlot id="feed" params={undefined} />
      </div>

      {/* keeps the last shelf clear of the card's bottom edge when scrolled */}
      <div className="h-7 shrink-0" />
    </>
  );
}
