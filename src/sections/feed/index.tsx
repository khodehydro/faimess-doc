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

/** height of the chip strip — shelf headers stick right under it */
export const CHIP_STRIP_HEIGHT = 48;

export function FeedSection() {
  const t = useT();
  const rootRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState(FEED_SHELVES[0].id);

  /* track which shelf is under the strip, whichever ancestor scrolls */
  useEffect(() => {
    const onScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      const line = root.getBoundingClientRect().top + CHIP_STRIP_HEIGHT + 24;
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
  }, []);

  const jumpTo = (id: string) => {
    const node = sectionRefs.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  const chips = useMemo(() => FEED_SHELVES, []);

  return (
    <section ref={rootRef} className="relative w-full">
      {/* quick-jump strip — sticks to the top of the page scroller */}
      <div className="sticky top-0 z-30 flex items-center gap-1.5 border-b border-line/70 bg-surface/95 px-3.5 py-2.5 backdrop-blur-md">
        {chips.map((shelf) => {
          const isActive = active === shelf.id;
          return (
            <button
              key={shelf.id}
              onClick={() => jumpTo(shelf.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
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
              <span className="relative flex items-center gap-1.5">
                <Icon name={shelf.icon} size={13.5} strokeWidth={isActive ? 2 : 1.7} />
                {t(shelf.label)}
              </span>
            </button>
          );
        })}

        <span className="ms-auto flex items-center gap-1.5 text-[12px] font-medium text-ink-faint">
          <Icon name="waveform" size={14} />
          {t("feed.scrollMore")}
        </span>
      </div>

      {/* the shelves — full height, no inner scroller */}
      <div className="px-3.5 pb-6 pt-1">
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
    </section>
  );
}
