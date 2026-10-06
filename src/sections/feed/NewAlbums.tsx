import { motion } from "framer-motion";
import { Shelf, Row, PlayDot } from "./Shelf";
import { Cover } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { freshAlbums } from "../../data/library";
import { useApp } from "../../app/AppContext";
import { usePlayer } from "../../app/PlayerContext";
import { forwardIcon } from "../../lib/rtl";
import { leadTrackFor } from "../../data/player";
import { spring } from "../../lib/motion";
import { usePreferences } from "../../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Shelf 5 — the freshest albums: square art, title and release age.
 * ------------------------------------------------------------------ */

export function NewAlbums() {
  const { t, dir, dataLabel, num } = usePreferences();
  const { navigate, notify, openDetail } = useApp();
  const player = usePlayer();

  return (
    <Shelf
      id="feed-albums"
      icon="disc"
      title={t("shelf.freshAlbums")}
      action={
        <PillButton tone="soft" icon={forwardIcon(dir)} onClick={() => navigate("albums")}>
          {t("shelf.allAlbums")}
        </PillButton>
      }
    >
      <Row>
        {freshAlbums.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.04 } }}
            whileHover={{ y: -4 }}
            transition={spring}
            onClick={() => openDetail({ kind: "album", id: album.id })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail({ kind: "album", id: album.id });
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={album.title}
            className="group w-[124px] shrink-0 cursor-pointer snap-start lg:w-[146px]"
          >
            <span className="relative block aspect-square overflow-hidden rounded-[14px] shadow-card ring-1 ring-line/70 lg:rounded-[16px]">
              <Cover src={album.photo} seed={album.seed} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]" />
                <span className="absolute start-2 top-2 rounded-full bg-surface/88 px-2 py-[2px] text-[12px] font-bold text-ink backdrop-blur">
                {dataLabel(album.released)}
              </span>
              <PlayDot
                onClick={(e) => {
                  e.stopPropagation();
                  const lead = leadTrackFor(album.artist);
                  if (!lead) return;
                  player.play(lead);
                  notify(t("toast.playingAlbum", { album: album.title, title: lead.title }));
                }}
                className="absolute bottom-2 end-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </span>
            <span className="mt-2 block truncate text-[13px] font-bold text-ink lg:mt-2.5 lg:text-[14px]">{album.title}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-muted lg:mt-1 lg:text-[12.5px]">
              <span className="truncate font-semibold text-ink-body">{album.artist}</span>
              <span className="text-ink-faint">·</span>
              <span className="flex shrink-0 items-center gap-1">
                <Icon name="music" size={12} />
                {num(album.tracks)}
              </span>
            </span>
          </motion.div>
        ))}
      </Row>
    </Shelf>
  );
}
