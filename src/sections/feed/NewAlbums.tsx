import { motion } from "framer-motion";
import { Shelf, Row, PlayDot } from "./Shelf";
import { Cover } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { newestAlbums } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf 5 — the freshest albums: square art, title and release age.
 * ------------------------------------------------------------------ */

export function NewAlbums() {
  const { navigate, notify } = useApp();

  return (
    <Shelf
      id="feed-albums"
      icon="disc"
      title="Fresh albums"
      hint="this week"
      action={
        <PillButton tone="soft" icon="arrowRight" onClick={() => navigate("albums")}>
          All albums
        </PillButton>
      }
    >
      <Row>
        {newestAlbums.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.04 } }}
            whileHover={{ y: -4 }}
            transition={spring}
            onClick={() => notify(`Opening “${album.title}”`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                notify(`Opening “${album.title}”`);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={album.title}
            className="group w-[142px] shrink-0 cursor-pointer snap-start"
          >
            <span className="relative block aspect-square overflow-hidden rounded-[16px] shadow-card ring-1 ring-line/70">
              <Cover seed={album.seed} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]" />
              <span className="absolute left-2 top-2 rounded-full bg-white/88 px-1.5 py-[2px] text-[12px] font-bold text-ink backdrop-blur">
                {album.released}
              </span>
              <PlayDot
                onClick={(e) => {
                  e.stopPropagation();
                  notify(`Playing “${album.title}”`);
                }}
                className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </span>
            <span className="mt-2 block truncate text-[14px] font-bold text-ink">{album.title}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
              <span className="truncate font-semibold text-ink-body">{album.artist}</span>
              <span className="text-ink-faint">·</span>
              <span className="flex shrink-0 items-center gap-0.5">
                <Icon name="music" size={12} />
                {album.tracks}
              </span>
            </span>
          </motion.div>
        ))}
      </Row>
    </Shelf>
  );
}
