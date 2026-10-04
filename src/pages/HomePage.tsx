import { SectionSlot } from "../sections/registry";

/**
 * Home — the two-column dashboard.
 * Left: hero carousel + schedule.  Right: greeting + messages.
 * Heights are authored for the 1320×930 stage; below `lg` the page stacks.
 */
export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 lg:flex-row lg:gap-[18px] lg:px-5 lg:pb-5 lg:pt-0">
      <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-[1.38] lg:gap-[18px]">
        <div className="h-[300px] shrink-0 sm:h-[330px] lg:h-[372px]">
          <SectionSlot id="hero" params={undefined} />
        </div>
        <div className="h-[430px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <SectionSlot id="schedule" params={undefined} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1 lg:gap-[18px]">
        <div className="h-[330px] shrink-0">
          <SectionSlot id="greeting" params={undefined} />
        </div>
        <div className="h-[470px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
          <SectionSlot id="messages" params={undefined} />
        </div>
      </div>
    </div>
  );
}
