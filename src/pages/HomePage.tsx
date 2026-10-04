import { SectionSlot } from "../sections/registry";

/**
 * Home — the two-column dashboard.
 *
 * Left: ONE scroll surface — the hero carousel and the music feed scroll
 *       together, so the banner leaves the viewport naturally as you read
 *       down the feed (the column, not the feed box, owns the scrollbar).
 * Right: greeting + messages (fixed 520px, never scrolls as a whole).
 * Heights are authored for the 1580×889 stage; below `lg` the page stacks
 * and scrolling is handled by the document instead.
 */
export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 lg:flex-row lg:gap-[18px] lg:px-5 lg:pb-5">
      {/* left column — shared scroll container for banner + feed */}
      <div className="relative flex min-w-0 flex-col lg:min-h-0 lg:flex-1">
        <div className="scroll-slim flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-6 lg:pr-1.5">
          <div className="h-[300px] shrink-0 sm:h-[330px] lg:h-[356px]">
            <SectionSlot id="hero" params={undefined} />
          </div>

          <div className="shrink-0">
            <SectionSlot id="feed" params={undefined} />
          </div>
        </div>

        {/* soft hint that more content sits below the fold */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-12 bg-gradient-to-t from-surface via-surface/80 to-transparent lg:block" />
      </div>

      {/* right column — fixed width (HOME_METRICS.rightColumn = 520) */}
      <div className="flex min-w-0 flex-col gap-4 lg:w-[520px] lg:min-h-0 lg:shrink-0 lg:gap-[18px]">
        <div className="h-[344px] shrink-0">
          <SectionSlot id="greeting" params={undefined} />
        </div>
        <div className="h-[470px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <SectionSlot id="messages" params={undefined} />
        </div>
      </div>
    </div>
  );
}
