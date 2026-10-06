import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app/AppContext";
import { usePlayer } from "../app/PlayerContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { useAuth } from "../app/AuthContext";
import { usePreferences } from "../app/PreferencesContext";
import { albums, artists, playlists, type Album } from "../data/library";
import { QUEUE, leadTrackFor, trackById, type PlayerTrack } from "../data/player";
import { coverPhoto } from "../data/playlists";
import { ArtistCover, Cover } from "../ui/Cover";
import { Icon } from "../ui/Icon";
import { CircleButton, ExpandPill, PillButton } from "../ui/primitives";
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
 *
 *  The header reads left-to-right like a record sleeve: the name, and the
 *  facts about it, on the start side; the controls that act on it opposite
 *  them, so the eye never has to pick them out of the words.
 * ------------------------------------------------------------------ */

type Heading = {
  /** which of the three kinds of list this is — the share link and the
      player's run label are both built from it */
  kind: LibraryKind;
  id: string;
  title: string;
  /** who it is by — the first line under the name */
  byline: string;
  /** year · tracks · minutes — the second line under the name */
  facts: string;
  cover: string;
  seed: number;
  /** circular art for artists, square for records and lists */
  round?: boolean;
  tracks: PlayerTrack[];
  /** an artist's own records, shown as a second section */
  albums?: Album[];
  /** only the listener's own playlists can be edited */
  editableId?: string;
};

const minutesOf = (tracks: PlayerTrack[]) =>
  Math.max(1, Math.round(tracks.reduce((sum, track) => sum + track.seconds, 0) / 60));

/** "12 tracks" / "1 track" — the count line never says "1 tracks" */
const countOf = (
  tracks: PlayerTrack[],
  t: (key: string, vars?: Record<string, string | number>) => string,
) =>
  tracks.length === 1
    ? t("playlist.trackOne")
    : t("playlist.trackCount", { count: tracks.length });

/** "Velvet Static" and "Velvet Static · single" are the same record */
const tracksForAlbum = (album: Album): PlayerTrack[] => {
  const found = QUEUE.filter(
    (track) => track.album === album.title || track.album.startsWith(`${album.title} ·`),
  );
  const lead = leadTrackFor(album.artist);
  return found.length ? found : lead ? [lead] : [];
};

export function BrowseDetailView() {
  const { t, dir, dataLabel, num } = usePreferences();
  const { detail, closeDetail, notify, openDetail } = useApp();
  const { mine } = usePlaylists();
  const { requireAccount } = useAuth();
  const player = usePlayer();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const currentArtist = detail?.kind === "artist" ? artists.find((a) => a.id === detail.id) : null;
  const [following, setFollowing] = useState(() => currentArtist?.following ?? false);

  useEffect(() => {
    if (currentArtist) {
      setFollowing(currentArtist.following);
    }
  }, [currentArtist?.id, currentArtist?.following]);

  const toggleFollow = () => {
    if (!currentArtist) return;
    requireAccount(following ? "gate.unfollow" : "gate.follow", () => {
      const next = !following;
      currentArtist.following = next;
      setFollowing(next);
      notify(
        t(next ? "toast.following" : "toast.unfollowed", { name: currentArtist.name }),
        next ? "mint" : "primary",
      );
    });
  };

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
        byline: dataLabel(artist.kind),
        /* every part of this line is chrome: how big the artist is, how many
           songs they have, how long they run — so all three follow the
           interface language, listeners included */
        facts: `${dataLabel(artist.followers)} · ${dataLabel(artist.listeners)} · ${countOf(tracks, t)} · ${t("detail.minutes", { n: minutesOf(tracks) })}`,
        cover: artist.photo,
        seed: artist.seed,
        round: true,
        tracks,
        albums: albums.filter((album) => album.artist === artist.name),
      };
    }
  } else if (detail?.kind === "album") {
    const album = albums.find((a) => a.id === detail.id);
    if (album) {
      const tracks = tracksForAlbum(album);
      heading = {
        kind: "album",
        id: album.id,
        title: album.title,
        byline: album.artist,
        facts: `${num(album.year)} · ${countOf(tracks, t)} · ${t("detail.minutes", { n: minutesOf(tracks) })}`,
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
        byline: t("playlist.yours"),
        facts: `${countOf(tracks, t)} · ${t("detail.minutes", { n: minutesOf(tracks) })}`,
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
          byline: `${curated.curator} · ${curated.mood}`,
          facts: `${countOf(tracks, t)} · ${t("detail.minutes", { n: minutesOf(tracks) })}`,
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

  /* ------------------------------- pieces ------------------------------- */

  const trackRows =
    heading.tracks.length === 0 ? (
      <div className="flex flex-col items-center gap-2.5 rounded-card bg-subtle/60 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-surface text-primary-deep shadow-xs">
          <Icon name="music" size={19} strokeWidth={2} />
        </span>
        <p className="font-display text-[15px] font-bold text-ink">{t("detail.empty")}</p>
        <p className="max-w-[320px] text-[13px] leading-relaxed text-ink-muted">
          {t("detail.emptyBody")}
        </p>
        {heading.editableId && (
          <PillButton
            tone="primary"
            icon="plus"
            onClick={() => requireAccount("gate.playlist", () => setEditing(true))}
          >
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
                  "group flex w-full items-center gap-2.5 rounded-[14px] border px-2.5 py-2 text-start transition-colors lg:gap-3.5 lg:rounded-[16px] lg:px-3 lg:py-2.5",
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
                <span className="size-[40px] shrink-0 overflow-hidden rounded-[11px] shadow-xs lg:size-[44px] lg:rounded-[12px]">
                  <Cover src={track.photo} seed={i} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-ink lg:text-[14px]">
                    {track.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] font-semibold text-ink-muted lg:text-[12.5px]">
                    {track.artist} · {dataLabel(track.album)}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink-faint lg:text-[12.5px]">
                  {Math.floor(track.seconds / 60)}:{String(track.seconds % 60).padStart(2, "0")}
                </span>
                {/* a hover-only button has no way to appear on a touch screen */}
                <span className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-primary transition-opacity group-hover:opacity-100 lg:flex">
                  <Icon name="play" size={14} strokeWidth={2} />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    );

  const albumRows = (heading.albums ?? []).length > 0 && (
    <ul className="flex flex-col gap-1.5">
      {(heading.albums ?? []).map((album) => {
        const list = tracksForAlbum(album);
        return (
          <motion.li key={album.id} whileHover={{ x: 2 }} transition={spring}>
            <button
              type="button"
              onClick={() => openDetail({ kind: "album", id: album.id })}
              aria-label={t("detail.openAlbum", { name: album.title })}
              className="group flex w-full items-center gap-2.5 rounded-[14px] border border-line/80 bg-surface px-2.5 py-2 text-start transition-colors hover:border-primary/25 hover:bg-primary-faint/50 lg:gap-3.5 lg:rounded-[16px] lg:px-3 lg:py-2.5"
            >
              <span className="size-[40px] shrink-0 overflow-hidden rounded-[11px] shadow-xs lg:size-[44px] lg:rounded-[12px]">
                <Cover src={album.photo} seed={album.seed} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold text-ink lg:text-[14px]">{album.title}</span>
                <span className="mt-0.5 block truncate text-[12px] font-semibold text-ink-muted lg:text-[12.5px]">
                  {num(album.year)} · {t("playlist.trackCount", { count: album.tracks })}
                </span>
              </span>
              <span
                onClick={(event) => {
                  /* the play button inside the row must not also open it */
                  event.stopPropagation();
                  if (list[0]) start(list[0], list.map((track) => track.id));
                }}
                className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-primary transition-opacity group-hover:opacity-100 lg:flex"
              >
                <Icon name="play" size={14} strokeWidth={2} />
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );

  return (
    <section className="flex flex-col gap-4 p-4 pb-7 lg:gap-5 lg:p-5 lg:pb-8">
      {/* header — the name and its facts on the start side, the controls
          that act on them opposite, on the same line */}
      {/* three blocks on desktop, two rows on a phone: the cover and the
          facts share the first row, the controls take the second. In one row
          the pills ate the title's width (it collapsed to zero) and then ran
          off the card, clipped by `overflow-hidden`. */}
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2.5 lg:gap-x-4 lg:gap-y-3">
        <CircleButton
          icon={backIcon(dir)}
          tone="white"
          size="sm"
          label={t("detail.back")}
          onClick={closeDetail}
        />
        <span
          className={cn(
            "size-[56px] shrink-0 overflow-hidden shadow-card ring-1 ring-line/70 lg:size-[76px]",
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

        {/* the name, and the details straight under it */}
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-[19px] font-bold leading-tight tracking-[-0.016em] text-ink lg:text-[23px]">
            {heading.title}
          </h2>
          {/* `truncate` is a desktop luxury: on a phone both lines are
              allowed to wrap rather than end in an ellipsis */}
          <p className="mt-0.5 text-[12.5px] font-bold text-ink-muted lg:mt-1 lg:text-[13.5px] lg:truncate">{heading.byline}</p>
          <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-ink-faint lg:text-[12.5px] lg:truncate">
            {heading.facts}
          </p>
        </div>

        {/* the controls, opposite those details; each one unfolds its word
            on hover, so the row stays a row of glyphs until asked */}
        {/* four controls (a playlist of your own has an edit pencil too) must be
            allowed to become two short rows rather than run off the card */}
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 pt-1 sm:ms-auto sm:w-auto sm:pt-0 lg:ms-auto lg:w-auto lg:flex-nowrap">
          <ExpandPill tone="primary" icon="play" onClick={playAll}>
            {t("detail.playAll")}
          </ExpandPill>
          {heading.kind === "artist" && (
            <ExpandPill
              tone={following ? "soft" : "outline"}
              icon={following ? "check" : "plus"}
              onClick={toggleFollow}
            >
              {t(following ? "page.following" : "page.follow")}
            </ExpandPill>
          )}
          <ExpandPill icon="shuffle" onClick={shuffleAll}>
            {t("detail.shuffle")}
          </ExpandPill>
          <ExpandPill icon="share" onClick={() => setSharing(true)}>
            {t("detail.share")}
          </ExpandPill>
          {heading.editableId && (
            /* the pencil is the edit door for a list of your own — the card
               itself opens the songs */
            <ExpandPill
              icon="edit"
              onClick={() => requireAccount("gate.playlist", () => setEditing(true))}
            >
              {t("detail.edit")}
            </ExpandPill>
          )}
        </div>
      </div>

      {/* an artist splits in two: the singles, then the records */}
      {heading.kind === "artist" ? (
        <>
          <div className="flex flex-col gap-2.5">
            <SectionLabel label={t("detail.singles")} count={heading.tracks.length} />
            {trackRows}
          </div>
          {(heading.albums ?? []).length > 0 && (
            <div className="flex flex-col gap-2.5">
              <SectionLabel label={t("detail.artistAlbums")} count={(heading.albums ?? []).length} />
              {albumRows}
            </div>
          )}
        </>
      ) : (
        trackRows
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
          `${heading.byline} · ${heading.facts}`,
          heading.cover,
        )}
      />
    </section>
  );
}

/** the small heading that opens a section of the detail card */
function SectionLabel({ label, count }: { label: string; count: number }) {
  const { num } = usePreferences();
  return (
    <div className="flex items-baseline gap-2 px-0.5">
      <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span className="rounded-full bg-subtle px-2 py-[1px] text-[12px] font-bold tabular-nums text-ink-muted">
        {num(count)}
      </span>
    </div>
  );
}
