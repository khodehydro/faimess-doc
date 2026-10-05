import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app/AppContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { usePreferences, useT } from "../app/PreferencesContext";
import { QUEUE, trackById, type PlayerTrack } from "../data/player";
import {
  DEFAULT_COVER,
  MAX_NAME_LENGTH,
  PLAYLIST_COVERS,
  coverPhoto,
  type PlaylistCoverId,
} from "../data/playlists";
import { cn } from "../lib/cn";
import { spring } from "../lib/motion";
import { Photo } from "./Cover";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

/* ------------------------------------------------------------------ *
 *  Making a playlist, and putting a song in one.
 *
 *  Two sheets, one model: `CreatePlaylistDialog` is the form (name, one of
 *  the FAIMESS covers, songs found by search) and `AddToPlaylistDialog` is
 *  the picker the player opens with a track in hand. Both write through
 *  PlaylistsContext, so a list made here is immediately on the Playlists
 *  page and in the player's panel.
 * ------------------------------------------------------------------ */

/** how many search hits are worth showing at once */
const HITS = 6;

/** title / artist / album, case-insensitive — the catalogue is small enough */
function search(query: string): PlayerTrack[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return QUEUE.filter((track) =>
    `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(q),
  ).slice(0, HITS);
}

/* ------------------------------- pieces -------------------------------- */

function FieldLabel({ children, trailing }: { children: string; trailing?: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-baseline justify-between gap-2.5">
      <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">{children}</span>
      {trailing}
    </div>
  );
}

function HitRow({
  track,
  picked,
  onToggle,
}: {
  track: PlayerTrack;
  picked: boolean;
  onToggle: () => void;
}) {
  const { t, dataLabel } = usePreferences();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={picked}
      aria-label={`${picked ? t("playlist.picked") : t("playlist.pick")} — ${track.title}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-[13px] p-2 pe-2.5 text-start transition-colors",
        picked ? "bg-primary-faint" : "hover:bg-subtle",
      )}
    >
      <span className="size-[34px] shrink-0 overflow-hidden rounded-[10px] shadow-xs">
        <Photo src={track.photo} alt="" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13px] font-bold", picked ? "text-primary-deep" : "text-ink")}>
          {track.title}
        </span>
        <span className="block truncate text-[12px] font-semibold text-ink-muted">
          {track.artist} · {dataLabel(track.album)}
        </span>
      </span>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
          picked ? "bg-primary text-white" : "bg-subtle text-ink-muted",
        )}
      >
        <Icon name={picked ? "check" : "plus"} size={13.5} strokeWidth={2.6} />
      </span>
    </button>
  );
}

/* --------------------------- create / edit ----------------------------- */

export function CreatePlaylistDialog({
  open,
  onClose,
  seed = null,
  playlistId = null,
}: {
  open: boolean;
  onClose: () => void;
  /** a song the list starts with — the "new playlist" path out of the player */
  seed?: PlayerTrack | null;
  /** edit this list instead of creating one */
  playlistId?: string | null;
}) {
  const { t } = usePreferences();
  const { notify } = useApp();
  const { mine, create, update, remove } = usePlaylists();

  const [name, setName] = useState("");
  const [cover, setCover] = useState<PlaylistCoverId>(DEFAULT_COVER);
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  /* read the stored list without re-running the reset effect on every edit */
  const lists = useRef(mine);
  lists.current = mine;

  const editing = playlistId ? mine.find((list) => list.id === playlistId) ?? null : null;

  /* the sheet is a form: every open starts from the stored list, or empty */
  useEffect(() => {
    if (!open) return;
    const list = playlistId ? lists.current.find((l) => l.id === playlistId) ?? null : null;
    setName(list?.name ?? "");
    setCover(list?.cover ?? DEFAULT_COVER);
    setPicked(list ? [...list.trackIds] : seed ? [seed.id] : []);
    setQuery("");
  }, [open, playlistId, seed]);

  const hits = useMemo(() => search(query), [query]);
  const chosen = picked.map((id) => trackById(id)).filter((track): track is PlayerTrack => !!track);
  const ready = name.trim().length > 0;

  const toggle = (id: string) =>
    setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = () => {
    if (!ready) return;
    if (editing) {
      update(editing.id, { name, cover, trackIds: picked });
      notify(t("playlist.saved", { name: name.trim() }), "primary");
    } else {
      const list = create(name, cover, picked);
      notify(t("playlist.created", { name: list.name }), "primary");
    }
    onClose();
  };

  const discard = () => {
    if (!editing) return;
    remove(editing.id);
    notify(t("playlist.deleted", { name: editing.name }), "mint");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={440}>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
        <Icon name={editing ? "folder" : "folderPlus"} size={20} strokeWidth={2} />
      </span>

      <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
        {editing ? t("playlist.editTitle", { name: editing.name }) : t("playlist.createTitle")}
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
        {editing ? t("playlist.editBody") : t("playlist.createBody")}
      </p>

      {/* name */}
      <FieldLabel>{t("playlist.nameLabel")}</FieldLabel>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        maxLength={MAX_NAME_LENGTH}
        placeholder={t("playlist.namePlaceholder")}
        aria-label={t("playlist.nameLabel")}
        className="mt-2 w-full rounded-[14px] border border-line bg-subtle/60 px-4 py-3 text-[13.5px] font-semibold text-ink transition-colors placeholder:text-ink-faint focus:border-primary/45 focus:outline-none"
      />

      {/* cover — the six bundled crops, and only those */}
      <FieldLabel>{t("playlist.coverLabel")}</FieldLabel>
      <div className="mt-2 grid grid-cols-6 gap-2.5">
        {PLAYLIST_COVERS.map((option) => {
          const on = option.id === cover;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setCover(option.id)}
              aria-pressed={on}
              aria-label={t(option.labelKey)}
              title={t(option.labelKey)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[12px] shadow-xs ring-2 transition-transform duration-200",
                on ? "ring-primary" : "ring-transparent hover:-translate-y-0.5",
              )}
            >
              <Photo src={option.photo} alt="" />
              {on && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/35 text-white">
                  <Icon name="check" size={15} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">{t("playlist.coverNote")}</p>

      {/* songs */}
      <FieldLabel trailing={<span className="text-[12px] font-semibold text-ink-faint">{t("playlist.selected", { count: picked.length })}</span>}>
        {t("playlist.songsLabel")}
      </FieldLabel>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-faint">
          <Icon name="search" size={15} strokeWidth={2} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("playlist.searchPlaceholder")}
          aria-label={t("playlist.searchPlaceholder")}
          className="w-full rounded-[14px] border border-line bg-subtle/60 py-3 pe-3.5 ps-9 text-[13.5px] font-semibold text-ink transition-colors placeholder:text-ink-faint focus:border-primary/45 focus:outline-none"
        />
      </div>

      {query.trim() ? (
        hits.length ? (
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {hits.map((track) => (
              <li key={track.id}>
                <HitRow track={track} picked={picked.includes(track.id)} onToggle={() => toggle(track.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2.5 rounded-[12px] bg-subtle px-3.5 py-3 text-[12.5px] text-ink-muted">
            {t("playlist.noResults", { query: query.trim() })}
          </p>
        )
      ) : (
        <p className="mt-2 text-[12px] text-ink-faint">{t("playlist.searchHint", { count: QUEUE.length })}</p>
      )}

      {chosen.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chosen.map((track) => (
            <span key={track.id} className="flex items-center gap-2 rounded-full bg-subtle py-1.5 pe-2 ps-1.5">
              <span className="size-[22px] shrink-0 overflow-hidden rounded-full">
                <Photo src={track.photo} alt="" />
              </span>
              <span className="max-w-[128px] truncate text-[12px] font-bold text-ink">{track.title}</span>
              <button
                type="button"
                onClick={() => toggle(track.id)}
                aria-label={`${t("playlist.removeSong")} — ${track.title}`}
                className="flex size-4 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-primary-deep"
              >
                <Icon name="close" size={11} strokeWidth={2.8} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-[12px] border border-dashed border-line px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-faint">
          {t("playlist.empty")}
        </p>
      )}

      {/* actions */}
      <div className="mt-4 flex items-center gap-2.5">
        <motion.button
          whileHover={ready ? { y: -1.5 } : undefined}
          whileTap={ready ? { scale: 0.97 } : undefined}
          transition={spring}
          onClick={submit}
          disabled={!ready}
          className={cn(
            "flex items-center gap-2.5 rounded-[14px] bg-primary px-4 py-3 text-[13.5px] font-bold text-white shadow-primary",
            !ready && "cursor-not-allowed opacity-45",
          )}
        >
          <Icon name={editing ? "check" : "plus"} size={15} strokeWidth={2.5} />
          {editing ? t("playlist.save") : t("playlist.create")}
        </motion.button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          {t("ui.cancel")}
        </button>

        {editing && (
          <button
            type="button"
            onClick={discard}
            className="ms-auto flex items-center gap-2 rounded-[14px] px-3 py-3 text-[13.5px] font-bold text-ink-faint transition-colors hover:bg-subtle hover:text-primary-deep"
          >
            <Icon name="close" size={14} strokeWidth={2.2} />
            {t("playlist.delete")}
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ---------------------------- add a track ------------------------------ */

export function AddToPlaylistDialog({
  open,
  onClose,
  track,
  onNewPlaylist,
}: {
  open: boolean;
  onClose: () => void;
  track: PlayerTrack | null;
  /** head off to the create sheet, carrying this track along */
  onNewPlaylist: () => void;
}) {
  const { t } = usePreferences();
  const { notify } = useApp();
  const { mine, addTrack, contains } = usePlaylists();

  return (
    <Modal open={open} onClose={onClose}>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
        <Icon name="folderPlus" size={20} strokeWidth={2} />
      </span>

      <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
        {track ? t("playlist.addTitle", { title: track.title }) : t("playlist.add")}
      </h2>

      {mine.length ? (
        <div className="scroll-slim mt-3.5 flex max-h-[300px] flex-col gap-1.5 overflow-y-auto pe-0.5">
          {mine.map((list) => {
            const has = !!track && contains(list.id, track.id);
            return (
              <button
                key={list.id}
                type="button"
                onClick={() => {
                  if (!track) return;
                  const added = addTrack(list.id, track.id);
                  notify(added ? t("playlist.added", { name: list.name }) : t("playlist.already", { name: list.name }), added ? "primary" : "mint");
                  onClose();
                }}
                className="flex items-center gap-3 rounded-[14px] p-2 pe-2.5 text-start transition-colors hover:bg-subtle"
              >
                <span className="size-[40px] shrink-0 overflow-hidden rounded-[12px] shadow-xs">
                  <Photo src={coverPhoto(list.cover)} alt="" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-ink">{list.name}</span>
                  <span className="block truncate text-[12px] font-semibold text-ink-muted">
                    {t("playlist.trackCount", { count: list.trackIds.length })}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    has ? "bg-subtle text-ink-muted" : "bg-primary text-white shadow-primary",
                  )}
                >
                  <Icon name={has ? "check" : "plus"} size={14.5} strokeWidth={2.6} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3.5 rounded-[16px] bg-subtle px-4 py-3.5">
          <p className="text-[13.5px] font-bold text-ink">{t("playlist.noLists")}</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{t("playlist.noListsBody")}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2.5">
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={onNewPlaylist}
          className="flex items-center gap-2.5 rounded-[14px] bg-primary px-4 py-3 text-[13.5px] font-bold text-white shadow-primary"
        >
          <Icon name="plus" size={15} strokeWidth={2.5} />
          {t("playlist.new")}
        </motion.button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          {t("ui.close")}
        </button>
      </div>
    </Modal>
  );
}
