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
 *  and a way to skip. The purple bar deliberately has no progress/status
 *  strip; cover art, scrubber, bilingual lyrics and comments wait behind a
 *  tap, in the full player sheet (PlayerSheet.tsx).
 *
 *  Markup note: the bar is not one big <button>. A covering button does the
 *  "open the player" job and the two transport buttons sit above it on
 *  `z-10`, because nested buttons are invalid HTML (the lesson from the
 *  playlist cards).
 * ------------------------------------------------------------------ */

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { t, dir } = usePreferences();
  const player = usePlayer();
  const { track, playing, toggle, next } = player;

  return (
    <div className="pointer-events-auto relative w-full overflow-hidden rounded-[22px] bg-primary shadow-[0_18px_36px_-14px_rgba(107,79,221,0.68)] ring-1 ring-white/20">
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
            <span className="flex h-full items-center justify-center bg-white/15 text-white/75">
              <Icon name="music" size={18} />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold text-white">
            {track ? track.title : t("player.miniPick")}
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-semibold text-white/75">
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
                ? "bg-white text-primary-deep shadow-sm"
                : "bg-white/20 text-white/70",
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
              className="flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Icon name={forwardIcon(dir)} size={17} strokeWidth={2.2} />
            </motion.button>
          )}
        </span>
      </div>

    </div>
  );
}
