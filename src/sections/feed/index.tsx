import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "../../ui/Icon";
import { FollowedArtists } from "./FollowedArtists";
import { NewestTracks } from "./NewestTracks";
import { TrendingTracks } from "./TrendingTracks";
import { NewsShelf } from "./NewsShelf";
import { NewAlbums } from "./NewAlbums";
import { ActiveUsers } from "./ActiveUsers";
import { SHELF_STICKY_VAR } from "./Shelf";
import { cn } from "../../lib/cn";
import { useT } from "../../app/PreferencesContext";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  The home feed — a stack of shelves.
 *
 *  The feed itself does NOT scroll: on the home page it lives inside the
 *  left column, which owns a single scrollbar shared with the hero banner
 *  above it. The chip strip and the shelf headers stick to the top of that
 *  scroller while the feed is in view.
 *
 *  Reordering or removing a shelf is a one-line change to FEED_SHELVES;
 *  adding one is: build the component in this folder, add it here, done.
 * ------------------------------------------------------------------ */

type ShelfEntry = {
  id: string;
  /** i18n key — the chip strip reads the label from the table */
  label: string;
  icon: IconName;
  Component: ComponentType;
};

export const FEED_SHELVES: ShelfEntry[] = [
  { id: "feed-artists", label: "feed.followed", icon: "users", Component: FollowedArtists },
  { id: "feed-newest", label: "feed.newSongs", icon: "music", Component: NewestTracks },
  { id: "feed-trending", label: "feed.trending", icon: "flame", Component: TrendingTracks },
  { id: "feed-news", label: "feed.news", icon: "news", Component: NewsShelf },
  { id: "feed-albums", label: "feed.albums", icon: "disc", Component: NewAlbums },
  { id: "feed-users", label: "feed.fans", icon: "activity", Component: ActiveUsers },
];

/**
 * Where the chip strip sits before it has measured itself: shelf headers
 * stick under it. The strip publishes its real height as
 * `SHELF_STICKY_VAR`, so padding, font or chip changes can never leave a
 * seam (or hide the top of a shelf header) behind.
 */
export const CHIP_STRIP_HEIGHT = 48;

export function FeedSection() {
  const t = useT();
  const rootRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState(FEED_SHELVES[0].id);
  const [stripHeight, setStripHeight] = useState(CHIP_STRIP_HEIGHT);
  /**
   * While a chip's smooth scroll is running the scroll listener keeps
   * recomputing which shelf is "at the line" — and until the animation
   * lands, that is still the shelf we just left. The highlight used to
   * snap back and the chip needed a second click. The lock holds the
   * chosen chip for as long as the scroll can plausibly take.
   */
  const jumpLock = useRef(0);

  /* the strip is measured, not guessed: its height is what every shelf
     header sticks under, and the two must agree to the pixel */
  useEffect(() => {
    const node = stripRef.current;
    if (!node) return;
    const measure = () => setStripHeight(Math.round(node.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* track which shelf is under the strip, whichever ancestor scrolls */
  useEffect(() => {
    const onScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      if (Date.now() < jumpLock.current) return;
      /* +1px of slack: a shelf that landed exactly on the line is *at* it,
         and floating-point rounding must not flip the highlight back */
      const line = root.getBoundingClientRect().top + stripHeight + 20 + 1;
      let current = FEED_SHELVES[0].id;
      for (const shelf of FEED_SHELVES) {
        const node = sectionRefs.current[shelf.id];
        if (node && node.getBoundingClientRect().top <= line) current = shelf.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [stripHeight]);

  const jumpTo = (id: string) => {
    const node = sectionRefs.current[id];
    if (!node) return;
    setActive(id);
    jumpLock.current = Date.now() + 900;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chips = useMemo(() => FEED_SHELVES, []);

  return (
    <section
      ref={rootRef}
      className="relative w-full"
      style={{ [SHELF_STICKY_VAR]: `${stripHeight}px` } as CSSProperties}
    >
      {/* quick-jump strip — sticks to the top of the page scroller, and
          hands its measured height to the shelf headers below */}
      <div
        ref={stripRef}
        className="sticky top-0 z-30 flex items-center gap-2 border-b border-line/70 bg-surface/95 px-4 py-3 backdrop-blur-md"
      >
        {/* the chips share the full width of the card between them, each
            centring its own label — the strip reads as one control instead of
            a row that stops halfway. Narrow screens fall back to scrolling. */}
        <div className="scroll-slim -my-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
          {chips.map((shelf) => {
            const isActive = active === shelf.id;
            return (
              <button
                key={shelf.id}
                onClick={() => jumpTo(shelf.id)}
                className={cn(
                  "relative flex min-w-[86px] flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
                  isActive ? "text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="feed-chip"
                    transition={spring}
                    className="absolute inset-0 rounded-full bg-primary shadow-primary"
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon name={shelf.icon} size={13.5} strokeWidth={isActive ? 2 : 1.7} />
                  {t(shelf.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* the shelves — full height, no inner scroller */}
      <div className="px-4 pb-7 pt-1.5">
        {chips.map((shelf, i) => (
          <div
            key={shelf.id}
            ref={(node) => {
              sectionRefs.current[shelf.id] = node;
            }}
          >
            <shelf.Component />
            {i < chips.length - 1 && (
              <span className="mt-1 mb-1.5 block h-px w-full bg-line/80" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
