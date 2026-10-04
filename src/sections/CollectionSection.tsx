import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArtistCover, Cover, Photo } from "../ui/Cover";
import { Icon } from "../ui/Icon";
import { Meta, PillButton, CircleButton } from "../ui/primitives";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { albums, artists, playlists } from "../data/library";
import { coverPhoto, type UserPlaylist } from "../data/playlists";
import { useApp } from "../app/AppContext";
import { usePreferences, useT } from "../app/PreferencesContext";
import { usePlayer } from "../app/PlayerContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { leadTrackFor, trackById } from "../data/player";
import { cn } from "../lib/cn";
import { EASE, spring, staggerParent, popChild } from "../lib/motion";

export type LibraryKind = "artists" | "albums" | "playlists";

/* ------------------------------------------------------------------ *
 *  Collection — one section that renders the Artists / Albums /
 *  Playlists pages. Switch `kind` from the page and it re-skins itself.
 * ------------------------------------------------------------------ */

const COPY: Record<LibraryKind, { titleKey: string; subtitleKey: string; filters: { key: string; text?: string }[] }> = {
  artists: {
    titleKey: "nav.artists",
    subtitleKey: "page.artists.subtitle",
    filters: [
      { key: "page.filter.all" },
      { key: "page.filter.following" },
      { key: "page.filter.topPlayed" },
      { key: "page.filter.new" },
    ],
  },
  albums: {
    titleKey: "nav.albums",
    subtitleKey: "page.albums.subtitle",
    filters: [
      { key: "page.filter.all" },
      { key: "page.filter.recent" },
      { key: "page.filter.saved" },
      { key: "page.filter.2025", text: "2025" },
    ],
  },
  playlists: {
    titleKey: "nav.playlists",
    subtitleKey: "page.playlists.subtitle",
    filters: [
      { key: "page.filter.all" },
      { key: "page.filter.madeByYou" },
      { key: "page.filter.liked" },
      { key: "page.filter.moods" },
    ],
  },
};

/** hover-revealed play control shared by every card */
function PlayFab({ onClick, className }: { onClick: () => void; className?: string }) {
  const t = useT();

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      aria-label={t("shelf.play")}
      className={cn(
        "absolute flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-primary",
        className,
      )}
    >
      <Icon name="play" size={16.5} strokeWidth={2} />
    </motion.button>
  );
}

/**
 * Card container. Deliberately a div with a button role (not <button>) so
 * inner controls — play, follow, save — stay valid, focusable HTML.
 */
function CardShell({
  children,
  onClick,
  label,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={popChild}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // let inner controls handle their own keys
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      whileHover={{ y: -5 }}
      transition={spring}
      className={cn(
        "group relative flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------- cards -------------------------------- */

function ArtistCard({ artist }: { artist: (typeof artists)[number] }) {
  const t = useT();
  const { notify } = useApp();
  const player = usePlayer();
  const [following, setFollowing] = useState(artist.following);

  return (
    <CardShell onClick={() => notify(t("toast.opening", { name: artist.name }))} label={t("page.openArtist", { name: artist.name })}>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ArtistCover src={artist.photo} seed={artist.seed} initials={artist.initials} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]" />
        <PlayFab
          onClick={() => {
            const lead = leadTrackFor(artist.name);
            if (!lead) return;
            player.play(lead);
            notify(t("player.playing", { artist: artist.name, title: lead.title }));
          }}
          className="bottom-3 end-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="absolute start-3 top-3 rounded-full bg-surface/85 px-2 py-0.5 text-[12px] font-bold text-ink backdrop-blur">
          {artist.genre}
        </span>
      </div>
      <div className="flex items-center gap-2 p-3">
        <span className="min-w-0 flex-1">
          <span className="font-display block truncate text-[15.5px] font-bold text-ink">{artist.name}</span>
          <Meta icon="headphones" iconSize={11} className="text-[12.5px]">
            {artist.listeners}
          </Meta>
        </span>
        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
        <PillButton
          tone={following ? "primary" : "outline"}
          icon={following ? "check" : "plus"}
          onClick={() => {
            setFollowing((v) => !v);
            notify(
              t(following ? "toast.unfollowed" : "toast.following", { name: artist.name }),
              following ? "primary" : "mint",
            );
          }}
          className="shrink-0 px-2.5 py-1"
        >
          {following ? "Following" : "Follow"}
        </PillButton>
        </span>
      </div>
    </CardShell>
  );
}

function AlbumCard({ album }: { album: (typeof albums)[number] }) {
  const t = useT();
  const { notify } = useApp();
  const player = usePlayer();
  return (
    <CardShell onClick={() => notify(t("toast.openingName", { name: album.title }))} label={t("page.openAlbum", { name: album.title })}>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Cover src={album.photo} seed={album.seed} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]" />
        <PlayFab
          onClick={() => {
            const lead = leadTrackFor(album.artist);
            if (!lead) return;
            player.play(lead);
            notify(t("toast.playingAlbum", { album: album.title, title: lead.title }));
          }}
          className="bottom-3 end-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span className="absolute start-3 top-3 rounded-full bg-surface/85 px-2 py-0.5 text-[12px] font-bold text-ink backdrop-blur">
          {album.year}
        </span>
      </div>
      <div className="flex items-center gap-2 p-3">
        <span className="min-w-0 flex-1">
          <span className="font-display block truncate text-[15.5px] font-bold text-ink">{album.title}</span>
          <Meta icon="mic" iconSize={11} className="text-[12.5px]">
            {album.artist} · {album.tracks} tracks
          </Meta>
        </span>
        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
          <CircleButton icon="heart" size="sm" tone="ghost" label={t("page.saveAlbum")} onClick={() => notify(t("toast.saved", { name: album.title }), "mint")} />
        </span>
      </div>
    </CardShell>
  );
}

function PlaylistRow({ playlist }: { playlist: (typeof playlists)[number] }) {
  const t = useT();
  const { notify } = useApp();
  return (
    <motion.button
      variants={popChild}
      onClick={() => notify(t("toast.openingName", { name: playlist.name }))}
      whileHover={{ y: -3 }}
      transition={spring}
      className="group flex min-h-0 items-center gap-3 overflow-hidden rounded-card bg-surface p-2.5 text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
    >
      <span className="relative size-[68px] shrink-0 overflow-hidden rounded-[16px]">
        <Cover src={playlist.photo} seed={playlist.seed} className="h-full w-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-display block truncate text-[15.5px] font-bold text-ink">{playlist.name}</span>
        <Meta icon="users" iconSize={11} className="text-[12.5px]">
          {playlist.curator}
        </Meta>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="rounded-full bg-primary-faint px-2 py-0.5 text-[12px] font-bold text-primary-deep">{playlist.mood}</span>
          <Meta icon="music" iconSize={10} className="text-[12px]">
            {playlist.tracks} tracks · {playlist.duration}
          </Meta>
        </span>
      </span>
      <span className="me-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-primary">
          <Icon name="play" size={15.5} strokeWidth={2} />
        </span>
      </span>
    </motion.button>
  );
}

/* --------------------------- your own lists ---------------------------- */

/** "4 tracks" / "—" — derived from the ids a user playlist stores */
function listMeta(list: UserPlaylist, t: (key: string, vars?: Record<string, string | number>) => string) {
  const tracks = list.trackIds.map((id) => trackById(id)).filter((track) => !!track);
  const seconds = tracks.reduce((sum, track) => sum + (track?.seconds ?? 0), 0);
  return {
    count: t("playlist.trackCount", { count: tracks.length }),
    minutes: seconds ? `${Math.max(1, Math.round(seconds / 60))} min` : "—",
  };
}

/**
 * The listener's own playlists, above the curated grid and on their own
 * track, so the editorial six keep the layout they were designed for.
 */
function MineStrip({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const { t } = usePreferences();
  const { mine } = usePlaylists();

  return (
    <div className="pb-3">
      <div className="flex items-baseline justify-between gap-2 pb-1.5">
        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          {t("page.filter.madeByYou")}
        </span>
        {mine.length > 0 && (
          <span className="text-[12px] font-semibold text-ink-faint">
            {t("playlist.listCount", { count: mine.length })}
          </span>
        )}
      </div>

      <div className="scroll-slim flex gap-2.5 overflow-x-auto pb-1">
        <motion.button
          variants={popChild}
          onClick={onNew}
          whileHover={{ y: -2 }}
          transition={spring}
          className="group flex w-[124px] shrink-0 flex-col rounded-[16px] border border-dashed border-line p-2 text-start transition-colors hover:border-primary/40 hover:bg-primary-faint/40"
        >
          <span className="flex h-[64px] w-full items-center justify-center rounded-[12px] bg-subtle text-ink-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary-deep">
            <Icon name="plus" size={18} strokeWidth={2.4} />
          </span>
          <span className="mt-1.5 block truncate text-[13px] font-bold text-ink">{t("playlist.new")}</span>
          <span className="block truncate text-[12px] font-semibold text-ink-faint">{t("playlist.newTip")}</span>
        </motion.button>

        {mine.map((list) => {
          const meta = listMeta(list, t);
          return (
            <motion.button
              key={list.id}
              variants={popChild}
              onClick={() => onOpen(list.id)}
              whileHover={{ y: -2 }}
              transition={spring}
              className="group flex w-[124px] shrink-0 flex-col rounded-[16px] bg-surface p-2 text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
            >
              <span className="relative block h-[64px] w-full overflow-hidden rounded-[12px]">
                <Photo src={coverPhoto(list.cover)} alt="" />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/35 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Icon name="folderPlus" size={17} strokeWidth={2.2} />
                </span>
              </span>
              <span className="mt-1.5 block truncate text-[13px] font-bold text-ink">{list.name}</span>
              <span className="block truncate text-[12px] font-semibold text-ink-faint">
                {meta.count} · {meta.minutes}
              </span>
              <span className="sr-only">{t("playlist.openMine", { name: list.name })}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ section ------------------------------- */

export function CollectionSection({ params }: { params: { kind: LibraryKind } }) {
  const { kind } = params;
  const { t } = usePreferences();
  const copy = COPY[kind];
  const [filter, setFilter] = useState(copy.filters[0].key);
  /* your own playlists: one sheet to make one, one to edit one */
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  /* kept while the sheet animates out, so its title doesn't flicker back */
  const [editId, setEditId] = useState<string | null>(null);

  const filterLabel = (f: { key: string; text?: string }) => f.text ?? t(f.key);

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      {/* header */}
      <div className="flex items-center gap-3 pb-3.5">
        <div className="min-w-0">
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.018em] text-ink">
            {t(copy.titleKey)}
          </h2>
          <p className="mt-0.5 truncate text-[13.5px] text-ink-muted">{t(copy.subtitleKey)}</p>
        </div>
        <div className="ms-auto flex items-center gap-1.5">
          {copy.filters.map((f) => (
            <PillButton key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {filterLabel(f)}
            </PillButton>
          ))}
          <CircleButton
            icon="shuffle"
            size="sm"
            tone="white"
            label={t("page.shuffleAll")}
            onClick={() => setFilter(copy.filters[0].key)}
          />
          {kind === "playlists" && (
            <PillButton
              icon="plus"
              tone="primary"
              className="ms-1"
              onClick={() => setCreating(true)}
            >
              {t("playlist.new")}
            </PillButton>
          )}
        </div>
      </div>

      {kind === "playlists" && (
        <MineStrip
          onOpen={(id) => {
            setEditId(id);
            setEditOpen(true);
          }}
          onNew={() => setCreating(true)}
        />
      )}

      {/* grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind + filter}
          variants={staggerParent(0.04)}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
          className={cn(
            "grid min-h-0 flex-1 gap-3.5",
            kind === "playlists" ? "grid-cols-1 content-start sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-3" : "grid-cols-2 lg:grid-cols-4 lg:grid-rows-2",
          )}
        >
          {kind === "artists" && artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
          {kind === "albums" && albums.map((a) => <AlbumCard key={a.id} album={a} />)}
          {kind === "playlists" && playlists.map((p) => <PlaylistRow key={p.id} playlist={p} />)}
        </motion.div>
      </AnimatePresence>

      {kind === "playlists" && (
        <>
          <CreatePlaylistDialog open={creating} onClose={() => setCreating(false)} />
          <CreatePlaylistDialog
            open={editOpen}
            playlistId={editId}
            onClose={() => setEditOpen(false)}
          />
        </>
      )}
    </section>
  );
}
