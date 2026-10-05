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
import { usePreferences } from "../../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Shelf 2 — the newest songs, as a two-column list so the shelf stays
 *  short while showing six tracks.
 *
 *  A row is a target in its own right: tapping it plays the song (there is
 *  no hover on a phone, so a play button that only appears on hover would
 *  simply not exist there). Everything is a step smaller under 1024px —
 *  the row, the cover, the type — and the “add” button, which needs a
 *  pointer to be reachable at all, is desktop-only.
 * ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
}: {
  track: (typeof newestTracks)[number];
  index: number;
}) {
  const { t, dataLabel } = usePreferences();
  const { notify } = useApp();
  const player = usePlayer();
  /* this row is the one the player card is holding */
  const playable = trackById(track.id);
  const mine = !!playable && playable.id === player.track?.id;
  const playing = mine && player.playing;

  /** play it, or pause it when it is already the song in the player */
  const start = () => {
    if (!playable) return;
    if (mine) {
      player.toggle();
      notify(
        playing
          ? t("toast.paused", { title: track.title })
          : t("toast.playingCard", { title: track.title }),
      );
      return;
    }
    player.play(playable);
    notify(t("toast.playingCard", { title: track.title }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      onClick={start}
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 rounded-[14px] border bg-surface px-2.5 py-2 transition-colors lg:gap-3 lg:rounded-[16px] lg:px-3 lg:py-2.5",
        mine ? "border-primary/35 bg-primary-faint/60" : "border-line/80 hover:border-primary/25 hover:bg-primary-faint/60",
      )}
    >
      <span className="relative size-[40px] shrink-0 overflow-hidden rounded-[12px] shadow-xs lg:size-[44px] lg:rounded-[13px]">
        <Cover src={track.photo} seed={track.seed} className="h-full w-full" />
        {/* the same door as tapping the row, spelled out on the cover */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
          className={cn(
            "absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/45 text-white transition-opacity duration-300",
            mine ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Icon name={playing ? "pause" : "play"} size={17} strokeWidth={2} />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-bold text-ink lg:text-[14.5px]">{track.title}</span>
          {track.isNew && (
              <span className="shrink-0 rounded-full bg-primary px-1.5 py-[1px] text-[12px] font-bold uppercase tracking-wide text-white lg:px-2">
              {t("shelf.new")}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-muted lg:mt-1 lg:text-[12.5px]">
          <span className="truncate font-semibold text-ink-body">{track.artist}</span>
          <span className="text-ink-faint">·</span>
          <span className="shrink-0">{dataLabel(track.ago)}</span>
        </span>
      </span>

      <span className="shrink-0 text-[12px] font-medium tabular-nums text-ink-faint lg:text-[13px]">
        {track.duration}
      </span>

      {/* desktop only: nothing on a touch screen can reveal a hover button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={spring}
        onClick={(e) => {
          e.stopPropagation();
          notify(t("toast.queued", { title: track.title }), "mint");
        }}
        aria-label={t("shelf.addToLibrary", { title: track.title })}
        className="hidden size-7 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 transition-all duration-300 hover:bg-surface hover:text-primary group-hover:opacity-100 lg:flex"
      >
        <Icon name="plus" size={15.5} strokeWidth={2} />
      </motion.button>
    </motion.div>
  );
}

export function NewestTracks() {
  const { t } = usePreferences();
  const { notify } = useApp();

  return (
    <Shelf
      id="feed-newest"
      icon="music"
      title={t("shelf.newestSongs")}
      hint={t("shelf.hintHourly")}
      action={
        <PillButton tone="soft" icon="play" onClick={() => notify(t("toast.mix"))}>
          {t("shelf.playAll")}
        </PillButton>
      }
    >
      <div className={cn("grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-2.5")}>
        {newestTracks.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} />
        ))}
      </div>
    </Shelf>
  );
}
