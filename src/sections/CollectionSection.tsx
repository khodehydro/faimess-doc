import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArtistCover, Cover, Photo } from "../ui/Cover";
import { Icon } from "../ui/Icon";
import { Meta, PillButton, CircleButton } from "../ui/primitives";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { ShareDialog } from "../ui/ShareDialog";
import { librarySubject } from "../data/share";
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
  const { notify, openDetail } = useApp();
  const player = usePlayer();
  const [following, setFollowing] = useState(artist.following);

  return (
    <CardShell
      onClick={() => openDetail({ kind: "artist", id: artist.id })}
      label={t("page.openArtist", { name: artist.name })}
    >
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
        <span className="absolute start-3 top-3 rounded-full bg-surface/85 px-2.5 py-1 text-[12px] font-bold text-ink backdrop-blur">
          {artist.genre}
        </span>
      </div>
      <div className="flex items-center gap-2.5 p-3.5">
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
          className="shrink-0 px-2.5 py-1.5"
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
  const { notify, openDetail } = useApp();
  const player = usePlayer();
  return (
    <CardShell
      onClick={() => openDetail({ kind: "album", id: album.id })}
      label={t("page.openAlbum", { name: album.title })}
    >
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
        <span className="absolute start-3 top-3 rounded-full bg-surface/85 px-2.5 py-1 text-[12px] font-bold text-ink backdrop-blur">
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
  const { openDetail } = useApp();
  return (
    <motion.button
      variants={popChild}
      onClick={() => openDetail({ kind: "playlist", id: playlist.id })}
      whileHover={{ y: -3 }}
      transition={spring}
      className="group flex min-h-0 items-center gap-3.5 overflow-hidden rounded-card bg-surface p-3 text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
    >
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-[16px]">
        <Cover src={playlist.photo} seed={playlist.seed} className="h-full w-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-display block truncate text-[15.5px] font-bold text-ink">{playlist.name}</span>
        <Meta icon="users" iconSize={11} className="text-[12.5px]">
          {playlist.curator}
        </Meta>
        <span className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-primary-faint px-2.5 py-1 text-[12px] font-bold text-primary-deep">{playlist.mood}</span>
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
/**
 * The listener's own playlists, above the curated grid and on their own
 * track, so the editorial six keep the layout they were designed for.
 *
 * The card opens the *songs* — the same detail card the collection grid
 * uses — and keeps the two things a list owner actually reaches for (edit,
 * share) as their own buttons underneath. Their own buttons, not an overlay,
 * because "edit" was previously what a click on the card did, and that is
 * exactly what it must not do.
 */
function MineStrip({ onNew }: { onNew: () => void }) {
  const { t } = usePreferences();
  const { mine } = usePlaylists();
  const { openDetail, notify } = useApp();
  const player = usePlayer();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const sharing = mine.find((list) => list.id === sharingId) ?? null;

  /* the hover play button starts the whole list as its own run, so the
     player's "6 / 9" counts rows of this playlist */
  const playList = (list: UserPlaylist) => {
    const first = list.trackIds[0] ? trackById(list.trackIds[0]) : null;
    if (!first) {
      openDetail({ kind: "playlist", id: list.id });
      return;
    }
    player.play(first, { type: "playlist", label: list.name, trackIds: list.trackIds });
    notify(t("player.playing", { artist: first.artist, title: first.title }));
  };

  return (
    <div className="pb-4">
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          {t("page.filter.madeByYou")}
        </span>
        {mine.length > 0 && (
          <span className="text-[12px] font-semibold text-ink-faint">
            {t("playlist.listCount", { count: mine.length })}
          </span>
        )}
      </div>

      <div className="scroll-slim flex gap-3.5 overflow-x-auto pb-1.5">
        <motion.button
          variants={popChild}
          onClick={onNew}
          whileHover={{ y: -2 }}
          transition={spring}
          className="group flex w-[168px] shrink-0 flex-col rounded-[20px] border border-dashed border-line p-2.5 text-start transition-colors hover:border-primary/40 hover:bg-primary-faint/40"
        >
          <span className="flex h-[96px] w-full items-center justify-center rounded-[14px] bg-subtle text-ink-muted transition-colors group-hover:bg-primary-soft group-hover:text-primary-deep">
            <Icon name="plus" size={20} strokeWidth={2.4} />
          </span>
          <span className="mt-2 block truncate text-[13.5px] font-bold text-ink">{t("playlist.new")}</span>
          <span className="block truncate text-[12px] font-semibold text-ink-faint">{t("playlist.newTip")}</span>
        </motion.button>

        {mine.map((list) => {
          const meta = listMeta(list, t);
          const lead = list.trackIds[0] ? trackById(list.trackIds[0]) : null;
          const running = !!player.playing && !!player.track && list.trackIds.includes(player.track.id);
          return (
            <motion.article
              key={list.id}
              variants={popChild}
              className="group flex w-[168px] shrink-0 flex-col rounded-[20px] bg-surface p-2.5 shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
            >
              {/* the cover opens the list; the play button starts it right
                  here — the standard pair, and neither one hides the other */}
              <span className="relative block h-[96px] w-full overflow-hidden rounded-[14px]">
                <Photo
                  src={coverPhoto(list.cover)}
                  alt=""
                  className="transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <button
                  type="button"
                  onClick={() => openDetail({ kind: "playlist", id: list.id })}
                  aria-label={t("playlist.openMine", { name: list.name })}
                  className="absolute inset-0"
                />
                <span className="absolute inset-0 bg-ink/25 opacity-0 transition-opacity group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={() => (running ? player.toggle() : playList(list))}
                  aria-label={t(running ? "player.pause" : "playlist.playTip")}
                  title={t(running ? "player.pause" : "playlist.playTip")}
                  className="absolute bottom-2 end-2 z-10 flex size-9 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-primary transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Icon name={running ? "pause" : "play"} size={15} strokeWidth={2.2} />
                </button>
                <span className="absolute start-2 top-2 rounded-full bg-surface/92 px-2 py-0.5 text-[12px] font-bold tabular-nums text-ink">
                  {meta.count}
                </span>
              </span>

              <button
                type="button"
                onClick={() => openDetail({ kind: "playlist", id: list.id })}
                aria-label={t("playlist.openMine", { name: list.name })}
                className="mt-2 block w-full truncate text-start text-[13.5px] font-bold text-ink"
              >
                {list.name}
              </button>
              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink-faint">
                <Icon name="clock" size={11.5} strokeWidth={2.2} />
                {meta.minutes}
                {lead && <span className="truncate">· {lead.artist}</span>}
              </span>

              {/* the two things a list owner reaches for, as their own buttons */}
              <div className="mt-2 flex items-center gap-1 border-t border-line/70 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(list.id)}
                  aria-label={t("playlist.editTip")}
                  title={t("playlist.editTip")}
                  className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-primary-deep"
                >
                  <Icon name="edit" size={14} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => setSharingId(list.id)}
                  aria-label={t("playlist.shareTip")}
                  title={t("playlist.shareTip")}
                  className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-primary-deep"
                >
                  <Icon name="share" size={14} strokeWidth={2.2} />
                </button>
                <span className="ms-auto pe-1 text-[12px] font-semibold text-ink-faint">
                  {t("playlist.yours")}
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>

      <CreatePlaylistDialog
        open={!!editingId}
        playlistId={editingId}
        onClose={() => setEditingId(null)}
      />
      <ShareDialog
        open={!!sharing}
        onClose={() => setSharingId(null)}
        subject={
          sharing
            ? librarySubject(
                "playlist",
                sharing.id,
                sharing.name,
                `${t("playlist.yours")} · ${listMeta(sharing, t).count}`,
                coverPhoto(sharing.cover),
              )
            : null
        }
      />
    </div>
  );
}

/* ------------------------------ section ------------------------------- */

export function CollectionSection({ params }: { params: { kind: LibraryKind } }) {
  const { kind } = params;
  const { t } = usePreferences();
  const copy = COPY[kind];
  const [filter, setFilter] = useState(copy.filters[0].key);
  /* your own playlists: one sheet to make one — editing lives on the card */
  const [creating, setCreating] = useState(false);

  const filterLabel = (f: { key: string; text?: string }) => f.text ?? t(f.key);

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      {/* header — on a phone the title takes the whole first line and the
          filters move to a second, horizontally scrolling line; in one row
          they simply ran over the title (there is no width where a 26px
          heading and five pills fit side by side on a handset) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pb-5">
        <div className="min-w-0 basis-full lg:basis-auto">
          <h2 className="font-display text-[22px] font-bold leading-tight tracking-[-0.018em] text-ink lg:text-[26px]">
            {t(copy.titleKey)}
          </h2>
          <p className="mt-1.5 truncate text-[13.5px] text-ink-muted">{t(copy.subtitleKey)}</p>
        </div>
        {/* the chips scroll sideways on a phone; `min-w-0` is what lets a
            flex child actually shrink enough to scroll */}
        <div className="scroll-slim flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 lg:ms-auto lg:flex-none lg:overflow-visible">
          {copy.filters.map((f) => (
            <PillButton
              key={f.key}
              active={filter === f.key}
              className="shrink-0"
              onClick={() => setFilter(f.key)}
            >
              {filterLabel(f)}
            </PillButton>
          ))}
          {kind === "playlists" && (
            <PillButton
              icon="plus"
              tone="primary"
              /* the compact layout has the same door in the "made by you"
                 strip right underneath, so this one is desktop-only */
              className="ms-1 hidden shrink-0 lg:flex"
              onClick={() => setCreating(true)}
            >
              {t("playlist.new")}
            </PillButton>
          )}
        </div>
      </div>

      {kind === "playlists" && <MineStrip onNew={() => setCreating(true)} />}

      {/* grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind + filter}
          variants={staggerParent(0.04)}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
          className={cn(
            "grid min-h-0 flex-1 gap-4",
            kind === "playlists" ? "grid-cols-1 content-start sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-3" : "grid-cols-2 lg:grid-cols-4 lg:grid-rows-2",
          )}
        >
          {kind === "artists" && artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
          {kind === "albums" && albums.map((a) => <AlbumCard key={a.id} album={a} />)}
          {kind === "playlists" && playlists.map((p) => <PlaylistRow key={p.id} playlist={p} />)}
        </motion.div>
      </AnimatePresence>

      {kind === "playlists" && (
        <CreatePlaylistDialog open={creating} onClose={() => setCreating(false)} />
      )}
    </section>
  );
}
