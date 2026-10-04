import { motion } from "framer-motion";
import { Shelf, Row, PlayDot } from "./Shelf";
import { Cover } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { followedArtists } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { usePlayer } from "../../app/PlayerContext";
import { leadTrackFor } from "../../data/player";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf 1 — artists you follow: circular artwork, name underneath.
 * ------------------------------------------------------------------ */

export function FollowedArtists() {
  const { notify } = useApp();
  const player = usePlayer();

  return (
    <Shelf
      id="feed-artists"
      icon="users"
      title="Artists you follow"
      hint={`${followedArtists.length}`}
      action={
        <PillButton
          tone="soft"
          icon="plus"
          onClick={() => notify("Find more artists to follow")}
        >
          Find artists
        </PillButton>
      }
    >
      <Row>
        {followedArtists.map((artist, i) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            className="group flex w-[96px] shrink-0 snap-start flex-col items-center gap-1.5 pt-0.5"
          >
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              onClick={() => notify(`Opening ${artist.name}`)}
              className="relative"
              aria-label={`Open ${artist.name}`}
            >
              {/* circular cover */}
              <span className="relative block size-[70px] overflow-hidden rounded-full ring-[2.5px] ring-white shadow-card">
                <Cover src={artist.photo} seed={artist.seed} className="h-full w-full" />
              </span>

              {/* brand ring on hover */}
              <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/0 transition-all duration-300 group-hover:ring-primary/60" />

              {artist.newRelease && (
                <span className="absolute -right-0.5 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-white ring-2 ring-white">
                  <Icon name="bolt" size={11} strokeWidth={2.4} />
                </span>
              )}

              <PlayDot
                onClick={(e) => {
                  e.stopPropagation();
                  const lead = leadTrackFor(artist.name);
                  if (!lead) return;
                  player.play(lead);
                  notify(`Playing ${artist.name} — “${lead.title}”`);
                }}
                className="absolute inset-0 m-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </motion.button>

            <span className="flex max-w-full items-center gap-0.5">
              <span className="truncate text-[13px] font-bold leading-tight text-ink">{artist.name}</span>
              {artist.verified && (
                <span className="shrink-0 text-primary" title="Verified artist">
                  <Icon name="verified" size={12} strokeWidth={1.8} />
                </span>
              )}
            </span>
            <span className="text-[12px] font-medium leading-none text-ink-faint">{artist.kind}</span>
          </motion.div>
        ))}
      </Row>
    </Shelf>
  );
}
