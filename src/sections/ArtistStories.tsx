import { motion } from "framer-motion";
import { Cover } from "../ui/Cover";
import { followedArtists } from "../data/feed";
import { useApp } from "../app/AppContext";
import { useT } from "../app/PreferencesContext";
import { cn } from "../lib/cn";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Artist stories — the compact shell's rail of followed artists.
 *
 *  On phones and tablets the artists you follow leave the feed card and
 *  sit between the search capsule and the banner, in a section of their
 *  own: a round face, a ring around it, the name underneath — nothing
 *  else. No title, no count, no "find artists" button, no verified mark,
 *  no play dot. It reads exactly like a story rail, and scrolls sideways.
 *
 *  The ring carries the only state the rail is allowed to show: a brand
 *  gradient while the artist has a fresh release, a neutral one when they
 *  do not — the same "unseen / seen" split a story rail uses, so no bolt
 *  or badge has to sit on top of the face.
 *
 *  Desktop keeps the shelf inside the feed (see feed/FollowedArtists);
 *  the feed skips it below 1024px so the roster is never on screen twice.
 * ------------------------------------------------------------------ */

export function ArtistStories() {
  const t = useT();
  const { openDetail } = useApp();

  if (followedArtists.length === 0) return null;

  return (
    <section
      /* the tray has no heading of its own — the accessible name is the
         one place the section says what it is */
      aria-label={t("shelf.followedArtists")}
      className="mx-auto w-full max-w-[720px] shrink-0 rounded-card bg-white/80 px-3 py-2.5 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-surface/80 dark:ring-white/[0.06]"
    >
      <div className="scroll-rail flex snap-x snap-mandatory gap-3 overflow-x-auto">
        {followedArtists.map((artist, i) => (
          <motion.button
            key={artist.id}
            type="button"
            onClick={() => openDetail({ kind: "artist", id: artist.id })}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.04 * i, ease: EASE }}
            whileTap={{ scale: 0.94 }}
            className="flex w-[66px] shrink-0 snap-start flex-col items-center gap-1.5"
          >
            {/* ring → gap → face, three concentric circles */}
            <span
              className={cn(
                "block rounded-full p-[2.5px]",
                artist.newRelease
                  ? "bg-gradient-to-tr from-primary-deep via-primary to-teal"
                  : "bg-line-strong",
              )}
            >
              <span className="block rounded-full bg-surface p-[2px]">
                <span className="block size-[54px] overflow-hidden rounded-full">
                  <Cover src={artist.photo} seed={artist.seed} className="h-full w-full" />
                </span>
              </span>
            </span>

            <span className="w-full truncate text-center text-[12px] font-semibold leading-tight text-ink-body">
              {artist.name}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
