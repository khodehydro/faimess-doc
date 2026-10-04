import { SectionSlot } from "../sections/registry";

/**
 * Home — the two-column dashboard.
 * Left: hero carousel + the scrolling music feed (stretches with the frame).
 * Right: greeting + messages (fixed 520px, per the reference).
 * Heights are authored for the 1680×930 stage; below `lg` the page stacks.
 */
export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 lg:flex-row lg:gap-[18px] lg:px-5 lg:pb-5">
      {/* left column — grows to fill the frame */}
      <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:gap-[18px]">
        <div className="h-[300px] shrink-0 sm:h-[330px] lg:h-[356px]">
          <SectionSlot id="hero" params={undefined} />
        </div>
        {/* the feed is the tall, scrollable box of the home screen */}
        <div className="h-[560px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <SectionSlot id="feed" params={undefined} />
        </div>
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
