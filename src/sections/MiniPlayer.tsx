import { motion } from "framer-motion";
import { usePlayer } from "../app/PlayerContext";
import { usePreferences } from "../app/PreferencesContext";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { cn } from "../lib/cn";
import { forwardIcon } from "../lib/rtl";
import { spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The player, reduced to one bar.
 *
 *  It floats above the bottom navigation and carries exactly what a
 *  listener needs without looking: what is playing, whether it is playing,
 *  a way to skip, and how far in we are. Everything else — cover art,
 *  scrubber, bilingual lyrics, comments — waits behind a tap, in the full
 *  player sheet (PlayerSheet.tsx).
 *
 *  Markup note: the bar is not one big <button>. A covering button does the
 *  "open the player" job and the two transport buttons sit above it on
 *  `z-10`, because nested buttons are invalid HTML (the lesson from the
 *  playlist cards).
 * ------------------------------------------------------------------ */

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { t, dir } = usePreferences();
  const player = usePlayer();
  const { track, playing, progress, toggle, next } = player;

  return (
    <div className="pointer-events-auto relative w-full overflow-hidden rounded-[22px] bg-surface/95 shadow-float ring-1 ring-black/[0.04] backdrop-blur-md dark:ring-white/[0.06]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("player.openFull")}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative z-10 flex items-center gap-3 p-2 pe-1.5">
        <span className="size-[46px] shrink-0 overflow-hidden rounded-[14px] shadow-xs">
          {track ? (
            <Photo src={track.photo} alt="" />
          ) : (
            <span className="flex h-full items-center justify-center bg-subtle text-ink-faint">
              <Icon name="music" size={18} />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold text-ink">
            {track ? track.title : t("player.miniPick")}
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-semibold text-ink-muted">
            {track ? `${track.artist} · ${track.album}` : t("player.nothingPlaying")}
          </span>
        </span>

        <span className="pointer-events-auto flex shrink-0 items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={spring}
            disabled={!track}
            onClick={() => (track ? toggle() : onOpen())}
            aria-label={t(track && playing ? "player.pause" : "player.play")}
            title={t(track && playing ? "player.pause" : "player.play")}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              track
                ? "bg-primary text-white shadow-primary"
                : "bg-subtle text-ink-muted",
            )}
          >
            <Icon name={track && playing ? "pause" : "play"} size={17} strokeWidth={2.1} />
          </motion.button>

          {track && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              transition={spring}
              onClick={() => next()}
              aria-label={t("player.nextTrack")}
              title={t("player.nextTrack")}
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
            >
              <Icon name={forwardIcon(dir)} size={17} strokeWidth={2.2} />
            </motion.button>
          )}
        </span>
      </div>

      {/* how far in we are, without a full scrubber in the bar */}
      <span className="absolute inset-x-4 bottom-1.5 h-[2px] overflow-hidden rounded-full bg-line/80">
        <span
          className="block h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${Math.round((track ? progress : 0) * 100)}%` }}
        />
      </span>
    </div>
  );
}
