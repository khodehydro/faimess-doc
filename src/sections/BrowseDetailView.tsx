import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app/AppContext";
import { usePlayer } from "../app/PlayerContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { usePreferences } from "../app/PreferencesContext";
import { albums, artists, playlists } from "../data/library";
import { QUEUE, leadTrackFor, trackById, type PlayerTrack } from "../data/player";
import { coverPhoto } from "../data/playlists";
import { ArtistCover, Cover } from "../ui/Cover";
import { Icon } from "../ui/Icon";
import { CircleButton, PillButton } from "../ui/primitives";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { ShareDialog } from "../ui/ShareDialog";
import { librarySubject, type LibraryKind } from "../data/share";
import { spring } from "../lib/motion";
import { backIcon } from "../lib/rtl";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ *
 *  The detail card — a playlist, an artist or an album, opened *inside*
 *  the content card instead of on a page of its own.
 *
 *  The whole point is that nothing moves: the content card swaps what it
 *  is showing, the player keeps playing on the right, and Back returns to
 *  whatever page was underneath. The list is the demo queue, so the
 *  numbers printed in the header are the numbers that actually play.
 * ------------------------------------------------------------------ */

type Heading = {
  /** which of the three kinds of list this is — the share link and the
      player's run label are both built from it */
  kind: LibraryKind;
  id: string;
  title: string;
  sub: string;
  cover: string;
  seed: number;
  /** circular art for artists, square for records and lists */
  round?: boolean;
  tracks: PlayerTrack[];
  /** only the listener's own playlists can be edited */
  editableId?: string;
};

const minutesOf = (tracks: PlayerTrack[]) =>
  Math.max(1, Math.round(tracks.reduce((sum, track) => sum + track.seconds, 0) / 60));

export function BrowseDetailView() {
  const { t, dir } = usePreferences();
  const { detail, closeDetail, notify } = useApp();
  const { mine } = usePlaylists();
  const player = usePlayer();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);

  /* ------------------------------- resolve ------------------------------ */
  let heading: Heading | null = null;

  if (detail?.kind === "artist") {
    const artist = artists.find((a) => a.id === detail.id);
    if (artist) {
      const found = QUEUE.filter((track) => track.artist === artist.name);
      const lead = leadTrackFor(artist.name);
      const tracks = found.length ? found : lead ? [lead] : [];
      heading = {
        kind: "artist",
        id: artist.id,
        title: artist.name,
        sub: `${artist.kind} · ${artist.listeners} · ${t("playlist.trackCount", { count: tracks.length })}`,
        cover: artist.photo,
        seed: artist.seed,
        round: true,
        tracks,
      };
    }
  } else if (detail?.kind === "album") {
    const album = albums.find((a) => a.id === detail.id);
    if (album) {
      /* "Velvet Static" and "Velvet Static · single" are the same record */
      const found = QUEUE.filter(
        (track) => track.album === album.title || track.album.startsWith(`${album.title} ·`),
      );
      const lead = leadTrackFor(album.artist);
      const tracks = found.length ? found : lead ? [lead] : [];
      heading = {
        kind: "album",
        id: album.id,
        title: album.title,
        sub: `${album.artist} · ${album.year} · ${t("playlist.trackCount", { count: tracks.length })}`,
        cover: album.photo,
        seed: album.seed,
        tracks,
      };
    }
  } else if (detail?.kind === "playlist") {
    const own = mine.find((list) => list.id === detail.id);
    if (own) {
      const tracks = own.trackIds
        .map((id) => trackById(id))
        .filter((track): track is PlayerTrack => !!track);
      heading = {
        kind: "playlist",
        id: own.id,
        title: own.name,
        sub: `${t("playlist.yours")} · ${t("playlist.trackCount", { count: tracks.length })}`,
        cover: coverPhoto(own.cover),
        seed: 0,
        tracks,
        editableId: own.id,
      };
    } else {
      const curated = playlists.find((list) => list.id === detail.id);
      if (curated) {
        /* the demo queue is what actually plays, so the list is a stable
           slice of it and the header counts exactly those rows */
        const offset = curated.name.length % QUEUE.length;
        const tracks = [...QUEUE.slice(offset), ...QUEUE.slice(0, offset)];
        heading = {
          kind: "playlist",
          id: curated.id,
          title: curated.name,
          sub: `${curated.curator} · ${curated.mood} · ${t("playlist.trackCount", { count: tracks.length })}`,
          cover: curated.photo,
          seed: curated.seed,
          tracks,
        };
      }
    }
  }

  /* a detail that no longer resolves (its playlist was emptied away, say)
     closes itself instead of rendering an empty shell */
  useEffect(() => {
    if (detail && !heading) closeDetail();
  });

  if (!heading) return null;

  /* the player numbers its pill against the list it was handed, so every
     play out of this card passes the run it belongs to */
  const runOf = (trackIds: string[]) => ({
    type: heading!.kind,
    label: heading!.title,
    trackIds,
  });

  const start = (track: PlayerTrack, trackIds: string[]) => {
    player.play(track, runOf(trackIds));
    notify(t("player.playing", { artist: track.artist, title: track.title }));
  };

  const playAll = () => {
    const first = heading!.tracks[0];
    if (!first) return;
    start(first, heading!.tracks.map((track) => track.id));
  };

  const shuffleAll = () => {
    const ids = heading!.tracks.map((track) => track.id);
    /* Fisher–Yates, so a long list does not get a lazy sort() shuffle */
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const first = ids[0] ? trackById(ids[0]) : null;
    if (first) start(first, ids);
  };

  return (
    <section className="flex flex-col gap-5 p-5 pb-8">
      {/* header */}
      <div className="flex items-start gap-4">
        <CircleButton
          icon={backIcon(dir)}
          tone="white"
          size="sm"
          label={t("detail.back")}
          onClick={closeDetail}
        />
        <span
          className={cn(
            "size-[76px] shrink-0 overflow-hidden shadow-card ring-1 ring-line/70",
            heading.round ? "rounded-full" : "rounded-[18px]",
          )}
        >
          {heading.round ? (
            <ArtistCover
              src={heading.cover}
              seed={heading.seed}
              initials={heading.title}
              className="h-full w-full"
            />
          ) : (
            <Cover src={heading.cover} seed={heading.seed} className="h-full w-full" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-[23px] font-bold leading-tight tracking-[-0.016em] text-ink">
            {heading.title}
          </h2>
          <p className="mt-1 truncate text-[13px] font-medium text-ink-muted">{heading.sub}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <PillButton tone="primary" icon="play" onClick={playAll}>
              {t("detail.playAll")}
            </PillButton>
            <PillButton tone="outline" icon="shuffle" onClick={shuffleAll}>
              {t("detail.shuffle")}
            </PillButton>
            <CircleButton
              icon="share"
              size="sm"
              tone="white"
              label={t("detail.share")}
              onClick={() => setSharing(true)}
            />
            {heading.editableId && (
              /* the pencil is the edit door for a list of your own — the card
                 itself opens the songs */
              <CircleButton
                icon="edit"
                size="sm"
                tone="white"
                label={t("detail.edit")}
                onClick={() => setEditing(true)}
              />
            )}
            <span className="text-[12.5px] font-semibold text-ink-faint">
              {t("detail.minutes", { n: minutesOf(heading.tracks) })}
            </span>
          </div>
        </div>
      </div>

      {/* the list */}
      {heading.tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-card bg-subtle/60 px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface text-primary-deep shadow-xs">
            <Icon name="music" size={19} strokeWidth={2} />
          </span>
          <p className="font-display text-[15px] font-bold text-ink">{t("detail.empty")}</p>
          <p className="max-w-[320px] text-[13px] leading-relaxed text-ink-muted">
            {t("detail.emptyBody")}
          </p>
          {heading.editableId && (
            <PillButton tone="primary" icon="plus" onClick={() => setEditing(true)}>
              {t("detail.addSongs")}
            </PillButton>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {heading.tracks.map((track, i) => {
            const playing = player.track?.id === track.id;
            return (
              <motion.li key={`${track.id}-${i}`} whileHover={{ x: 2 }} transition={spring}>
                <button
                  type="button"
                  onClick={() => start(track, heading!.tracks.map((t) => t.id))}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-[16px] border px-3 py-2.5 text-start transition-colors",
                    playing
                      ? "border-primary/35 bg-primary-faint/60"
                      : "border-line/80 bg-surface hover:border-primary/25 hover:bg-primary-faint/50",
                  )}
                >
                  <span className="flex w-4 shrink-0 justify-center text-[12.5px] font-bold tabular-nums text-ink-faint">
                    {playing ? (
                      <span className="text-primary">
                        <Icon name="waveform" size={14} strokeWidth={2.4} />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="size-[44px] shrink-0 overflow-hidden rounded-[12px] shadow-xs">
                    <Cover src={track.photo} seed={i} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink">
                      {track.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-ink-muted">
                      {track.artist} · {track.album}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-ink-faint">
                    {Math.floor(track.seconds / 60)}:{String(track.seconds % 60).padStart(2, "0")}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-primary transition-opacity group-hover:opacity-100">
                    <Icon name="play" size={14} strokeWidth={2} />
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {heading.editableId && (
        <CreatePlaylistDialog
          open={editing}
          playlistId={heading.editableId}
          onClose={() => setEditing(false)}
        />
      )}

      <ShareDialog
        open={sharing}
        onClose={() => setSharing(false)}
        subject={librarySubject(
          heading.kind,
          heading.id,
          heading.title,
          heading.sub,
          heading.cover,
        )}
      />
    </section>
  );
}
