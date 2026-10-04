import { useState } from "react";
import { motion } from "framer-motion";
import { Shelf } from "./Shelf";
import { Cover } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { newestTracks } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { usePlayer } from "../../app/PlayerContext";
import { trackById } from "../../data/player";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf 2 — the newest songs, as a two-column list so the shelf stays
 *  short while showing six tracks.
 * ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
}: {
  track: (typeof newestTracks)[number];
  index: number;
}) {
  const { notify } = useApp();
  const player = usePlayer();
  /* this row is the one the player card is holding */
  const playable = trackById(track.id);
  const mine = !!playable && playable.id === player.track?.id;
  const playing = mine && player.playing;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={cn(
        "group flex items-center gap-3 rounded-[14px] border bg-surface px-2.5 py-2 transition-colors",
        mine ? "border-primary/35 bg-primary-faint/60" : "border-line/80 hover:border-primary/25 hover:bg-primary-faint/60",
      )}
    >
      <span className="relative size-[42px] shrink-0 overflow-hidden rounded-[12px] shadow-xs">
        <Cover src={track.photo} seed={track.seed} className="h-full w-full" />
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (!playable) return;
            if (mine) {
              player.toggle();
              notify(playing ? `Paused “${track.title}”` : `Playing “${track.title}”`);
            } else {
              player.play(playable);
              notify(`Playing “${track.title}” — it's in the player card`);
            }
          }}
          className={cn(
            "absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/45 text-white transition-opacity duration-300",
            mine ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Icon name={playing ? "pause" : "play"} size={17.5} strokeWidth={2} />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[14.5px] font-bold text-ink">{track.title}</span>
          {track.isNew && (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-[1px] text-[12px] font-bold uppercase tracking-wide text-white">
              New
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
          <span className="font-semibold text-ink-body">{track.artist}</span>
          <span className="text-ink-faint">·</span>
          <span>{track.ago}</span>
        </span>
      </span>

      <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink-faint">{track.duration}</span>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={spring}
        onClick={() => notify(`Added “${track.title}” to your queue`, "mint")}
        aria-label={`Add ${track.title} to library`}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 transition-all duration-300 hover:bg-white hover:text-primary group-hover:opacity-100"
      >
        <Icon name="plus" size={15.5} strokeWidth={2} />
      </motion.button>
    </motion.div>
  );
}

export function NewestTracks() {
  const { notify } = useApp();

  return (
    <Shelf
      id="feed-newest"
      icon="music"
      title="Newest songs"
      hint="updated hourly"
      action={
        <PillButton tone="soft" icon="play" onClick={() => notify("Playing the new-release mix")}>
          Play all
        </PillButton>
      }
    >
      <div className={cn("grid grid-cols-1 gap-2 xl:grid-cols-2")}>
        {newestTracks.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} />
        ))}
      </div>
    </Shelf>
  );
}
