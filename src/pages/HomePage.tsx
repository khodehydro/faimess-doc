import { SurfaceCard } from "../ui/primitives";
import { SectionSlot } from "../sections/registry";

/**
 * Home — two of the five cards.
 *
 * Left card:  ONE scroll surface. Hero carousel + music feed scroll together,
 *             so the banner leaves the viewport naturally as you read down.
 * Right card: greeting + messages, fixed 520px, its own inner layout.
 *
 * Heights are authored for the 1580×889 stage. Below `lg` the two cards stack
 * and the document scrolls instead.
 */
export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5 lg:flex-row">
      {/* ── left content card ───────────────────────────────────────── */}
      <SurfaceCard className="lg:min-h-0 lg:flex-1">
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
      <SurfaceCard className="lg:w-[520px] lg:min-h-0 lg:shrink-0">
        <div className="h-[320px] shrink-0">
          <SectionSlot id="greeting" params={undefined} />
        </div>

        <span className="mx-5 block h-px shrink-0 bg-line" />

        <div className="flex min-h-0 flex-1 flex-col">
          <SectionSlot id="messages" params={undefined} />
        </div>
      </SurfaceCard>
    </div>
  );
}
