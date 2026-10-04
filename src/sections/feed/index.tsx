import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "../../ui/Icon";
import { FollowedArtists } from "./FollowedArtists";
import { NewestTracks } from "./NewestTracks";
import { TrendingTracks } from "./TrendingTracks";
import { NewsShelf } from "./NewsShelf";
import { NewAlbums } from "./NewAlbums";
import { ActiveUsers } from "./ActiveUsers";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  The home feed — a vertically scrollable column of shelves.
 *
 *  Reordering or removing a shelf is a one-line change to FEED_SHELVES;
 *  adding one is: build the component in this folder, add it here, done.
 * ------------------------------------------------------------------ */

type ShelfEntry = {
  id: string;
  label: string;
  icon: IconName;
  Component: ComponentType;
};

export const FEED_SHELVES: ShelfEntry[] = [
  { id: "feed-artists", label: "Followed", icon: "users", Component: FollowedArtists },
  { id: "feed-newest", label: "New songs", icon: "music", Component: NewestTracks },
  { id: "feed-trending", label: "Trending", icon: "flame", Component: TrendingTracks },
  { id: "feed-news", label: "News", icon: "news", Component: NewsShelf },
  { id: "feed-albums", label: "Albums", icon: "disc", Component: NewAlbums },
  { id: "feed-users", label: "Fans", icon: "activity", Component: ActiveUsers },
];

export function FeedSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState(FEED_SHELVES[0].id);

  /* highlight the chip of the shelf currently under the strip */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.getBoundingClientRect().top + 60;
      let current = FEED_SHELVES[0].id;
      for (const shelf of FEED_SHELVES) {
        const node = sectionRefs.current[shelf.id];
        if (node && node.getBoundingClientRect().top <= top) current = shelf.id;
      }
      setActive(current);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jumpTo = (id: string) => {
    const node = sectionRefs.current[id];
    const el = scrollerRef.current;
    if (!node || !el) return;
    el.scrollTo({ top: node.offsetTop - 44, behavior: "smooth" });
    setActive(id);
  };

  const chips = useMemo(() => FEED_SHELVES, []);

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden rounded-card bg-surface shadow-card">
      {/* quick-jump strip */}
      <div className="relative z-30 flex shrink-0 items-center gap-1.5 border-b border-line/70 bg-surface px-5 py-2.5">
        {chips.map((shelf) => {
          const isActive = active === shelf.id;
          return (
            <button
              key={shelf.id}
              onClick={() => jumpTo(shelf.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13.5px] font-semibold transition-colors",
                isActive ? "text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {isActive && <motion.span layoutId="feed-chip" transition={spring} className="absolute inset-0 rounded-full bg-primary shadow-primary" />}
              <span className="relative flex items-center gap-1.5">
                <Icon name={shelf.icon} size={12.5} strokeWidth={isActive ? 2 : 1.7} />
                {shelf.label}
              </span>
            </button>
          );
        })}

        <span className="ml-auto flex items-center gap-1.5 text-[13px] font-medium text-ink-faint">
          <Icon name="waveform" size={14.5} />
          scroll for more
        </span>
      </div>

      {/* the shelves */}
      <div ref={scrollerRef} className="scroll-slim relative min-h-0 flex-1 overflow-y-auto px-5 pb-10">
        {chips.map((shelf, i) => (
          <div
            key={shelf.id}
            ref={(node) => {
              sectionRefs.current[shelf.id] = node;
            }}
          >
            <shelf.Component />
            {i < chips.length - 1 && <span className="mb-1 block h-px w-full bg-line/80" />}
          </div>
        ))}
      </div>

      {/* scroll hint — fades the last visible row into the card edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-card bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
