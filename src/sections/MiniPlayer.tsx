import { AnimatePresence, motion } from "framer-motion";
import { usePlayer } from "../app/PlayerContext";
import { usePreferences } from "../app/PreferencesContext";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { cn } from "../lib/cn";
import { forwardIcon } from "../lib/rtl";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The player, reduced to one bar.
 *
 *  It only appears after a track has been selected. The entrance rises from
 *  below the navigation capsule; the nav paints above it while it settles.
 *  The purple bar carries no progress/status strip — cover art, scrubber,
 *  bilingual lyrics and comments wait behind a tap, in the full player sheet.
 *
 *  Markup note: the bar is not one big <button>. A covering button does the
 *  "open the player" job and the two transport buttons sit above it on
 *  `z-10`, because nested buttons are invalid HTML (the lesson from the
 *  playlist cards).
 * ------------------------------------------------------------------ */

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { t, dir, dataLabel } = usePreferences();
  const { track, playing, toggle, next } = usePlayer();

  return (
    <AnimatePresence initial={false}>
      {track && (
        <motion.div
          key="mini-player"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 36 }}
          transition={{ duration: 0.34, ease: EASE }}
          className="pointer-events-auto relative z-0 w-full overflow-hidden rounded-[22px] bg-primary shadow-[0_18px_36px_-14px_rgba(107,79,221,0.68)] ring-1 ring-white/20"
        >
          <button
            type="button"
            onClick={onOpen}
            aria-label={t("player.openFull")}
            className="absolute inset-0 z-0"
          />

          <div className="pointer-events-none relative z-10 flex items-center gap-2.5 p-1.5 pe-1 lg:gap-3 lg:p-2 lg:pe-1.5">
            <span className="size-[42px] shrink-0 overflow-hidden rounded-[13px] shadow-xs lg:size-[46px] lg:rounded-[14px]">
              <Photo src={track.photo} alt="" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-white lg:text-[13.5px]">
                {track.title}
              </span>
                <span className="mt-0.5 block truncate text-[12px] font-semibold text-white/75">
                {track.artist} · {dataLabel(track.album)}
              </span>
            </span>

            <span className="pointer-events-auto flex shrink-0 items-center">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                transition={spring}
                onClick={toggle}
                aria-label={t(playing ? "player.pause" : "player.play")}
                title={t(playing ? "player.pause" : "player.play")}
                className="flex size-9 items-center justify-center rounded-full bg-white text-primary-deep shadow-sm transition-colors lg:size-10"
              >
                <Icon name={playing ? "pause" : "play"} size={17} strokeWidth={2.1} />
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                transition={spring}
                onClick={() => next()}
                aria-label={t("player.nextTrack")}
                title={t("player.nextTrack")}
                className="flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white lg:size-9"
              >
                <Icon name={forwardIcon(dir)} size={17} strokeWidth={2.2} />
              </motion.button>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
