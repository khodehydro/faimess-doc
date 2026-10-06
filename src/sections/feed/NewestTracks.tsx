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
 *  Shelf 2 — the newest songs: six of them, in two shapes.
 *
 *  Desktop keeps the list — two columns of wide rows, where a row can hold
 *  the title, the artist, when it landed and how long it runs. A handset
 *  cannot hold that: a one-column list of six rows is a long scroll of
 *  half-empty bars, so under 1024px the same tracks become a **three-column
 *  grid of square covers** — the shape a listener already reads a shelf in,
 *  four times more of it on one screen.
 *
 *  A card (and a row) is a target in its own right: tapping it plays the
 *  song, because there is no hover on a phone for a play button to appear
 *  from. The “add” button, which needs a pointer at all, is desktop-only.
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
        /* phone/tablet: a card — square cover on top, two lines under it.
           desktop: the same element as a wide row (see `lg:`) */
        "group flex cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-surface text-start transition-colors lg:flex-row lg:items-center lg:gap-3 lg:rounded-[16px] lg:px-3 lg:py-2.5",
        mine ? "border-primary/35 bg-primary-faint/60" : "border-line/80 hover:border-primary/25 hover:bg-primary-faint/60",
      )}
    >
      <span className="relative aspect-square w-full shrink-0 overflow-hidden lg:aspect-auto lg:size-[44px] lg:rounded-[13px] lg:shadow-xs">
        <Cover src={track.photo} seed={track.seed} className="h-full w-full" />
        {/* the “new” flag rides on the cover on a phone — there is no room
            for it beside a two-word title in a 110px card */}
        {track.isNew && (
          <span className="absolute start-1.5 top-1.5 rounded-full bg-primary px-1.5 py-[1px] text-[12px] font-bold leading-normal text-white lg:hidden">
            {t("shelf.new")}
          </span>
        )}
        {/* the same door as tapping the card, spelled out on the cover */}
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

      <span className="min-w-0 w-full flex-1 px-2 pb-1.5 pt-1.5 lg:px-0 lg:pb-0 lg:pt-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-bold text-ink lg:text-[14.5px]">{track.title}</span>
          {track.isNew && (
            <span className="hidden shrink-0 rounded-full bg-primary px-1.5 py-[1px] text-[12px] font-bold uppercase tracking-wide text-white lg:inline-flex lg:px-2">
              {t("shelf.new")}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-muted lg:mt-1 lg:text-[12.5px]">
          <span className="truncate font-semibold text-ink-body">{track.artist}</span>
          {/* when it landed and how long it runs are row luxuries */}
          <span className="hidden text-ink-faint lg:inline">·</span>
          <span className="hidden shrink-0 lg:inline">{dataLabel(track.ago)}</span>
        </span>
      </span>

      <span className="hidden shrink-0 text-[12px] font-medium tabular-nums text-ink-faint lg:inline lg:text-[13px]">
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
      action={
        <PillButton tone="soft" icon="play" onClick={() => notify(t("toast.mix"))}>
          {t("shelf.playAll")}
        </PillButton>
      }
    >
      {/* three square cards in a row on a phone, two wide rows on desktop */}
      <div className="grid grid-cols-3 gap-2 min-[480px]:gap-2.5 lg:grid-cols-2">
        {newestTracks.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} />
        ))}
      </div>
    </Shelf>
  );
}
