import { useEffect, useRef, useState, type ComponentProps, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { Modal } from "../ui/Modal";
import { usePlayer } from "../app/PlayerContext";
import { useContributions } from "../app/ContributionsContext";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import { activeLineIndex, lyricsFor, mmss, QUEUE, type PlayerTrack } from "../data/player";
import { playlists } from "../data/library";
import { CommentsBar } from "./player/CommentsBar";
import { CommentsSheet } from "./player/CommentsSheet";
import { SubmitLyrics } from "./player/SubmitLyrics";
import { LYRIC_REWARD } from "../data/lyrics";
import { me } from "../data/account";
import { cn } from "../lib/cn";
import { backIcon, dirSign, forwardIcon, trackRatio } from "../lib/rtl";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Card 5 (right) — the player.
 *
 *    more (⋯)      reveals the music-management rail on demand:
 *                  queue · liked songs · playlists
 *    card          Player · feed position · expand/collapse
 *      top 40%     cover · title/artist/album · seek bar · transport
 *      bottom 60%  bilingual lyrics (original + فارسی), one scroll surface,
 *                  with the line being sung highlighted … and the comments
 *                  strip (count · newest · composer) pinned underneath
 *
 *  Nothing loaded yet? The card becomes a greeting with three quick picks.
 * ------------------------------------------------------------------ */

type PanelId = "queue" | "liked" | "playlists";
type PlayerApi = ReturnType<typeof usePlayer>;
type IconName = ComponentProps<typeof Icon>["name"];

const QUICK_PICKS = QUEUE.slice(0, 3);

/** i18n keys — the drawer translates them on the way out */
const PANEL_TITLE: Record<PanelId, string> = {
  queue: "player.upNext",
  liked: "player.likedSongs",
  playlists: "player.yourPlaylists",
};

export function PlayerSection({
  params,
}: {
  params: { expanded: boolean; onToggleExpand: () => void };
}) {
  const { t } = usePreferences();
  const player = usePlayer();
  const { track } = player;
  const [panel, setPanel] = useState<PanelId | null>(null);
  /* the management rail is a drawer now — hidden until "more" asks for it */
  const [railOpen, setRailOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const { approvedFor } = useContributions();
  /* the editorial sheet wins; a fan sheet the mods approved fills the gap */
  const sheet = lyricsFor(track);
  const community = track && !sheet ? approvedFor(track.id) : null;
  const lines = sheet ?? community?.lines ?? null;
  const { expanded, onToggleExpand } = params;

  const toggleRail = () => {
    const next = !railOpen;
    setRailOpen(next);
    if (!next) setPanel(null);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <PlayerRail
        open={railOpen}
        active={panel}
        onSelect={(id) => setPanel((p) => (p === id ? null : id))}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 px-3.5 pb-2 pt-3.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <Icon name="waveform" size={15} strokeWidth={2.2} />
          </span>
          <span className="font-display text-[15px] font-bold text-ink">{t("player.title")}</span>
          <span className="ms-auto flex items-center gap-1.5">
            {track && (
              <span className="flex items-center gap-1.5 rounded-full bg-subtle px-2 py-1 text-[12px] font-bold tabular-nums text-ink-muted">
                <Icon name="list" size={12} />
                {QUEUE.findIndex((t) => t.id === track.id) + 1}/{QUEUE.length}
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={spring}
              onClick={toggleRail}
              aria-expanded={railOpen}
              title={t(railOpen ? "player.railHide" : "player.railShow")}
              aria-label={t(railOpen ? "player.railHide" : "player.railShow")}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                railOpen ? "bg-primary text-white shadow-primary" : "text-ink-muted hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon name="more" size={15} strokeWidth={2.2} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={spring}
              onClick={onToggleExpand}
              aria-pressed={expanded}
              title={t(expanded ? "player.collapse" : "player.expand")}
              aria-label={t(expanded ? "player.collapse" : "player.expand")}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                expanded ? "bg-primary text-white shadow-primary" : "text-ink-muted hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon name={expanded ? "collapse" : "expand"} size={14} strokeWidth={2.1} />
            </motion.button>
          </span>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {!track ? (
            <EmptyState key="empty" onPick={player.play} />
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TrackPanel
                player={player}
                expanded={expanded}
                onDownload={() => setDownloadOpen(true)}
              />
              <LyricsPanel
                track={track}
                lines={lines}
                by={community?.by ?? null}
                position={player.position}
                playing={player.playing}
                onSend={() => setLyricsOpen(true)}
              />
              <CommentsBar trackId={track.id} onOpen={() => setCommentsOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {panel && <PlayerDrawer panel={panel} onClose={() => setPanel(null)} />}
        </AnimatePresence>
      </div>

      <DownloadDialog open={downloadOpen} onClose={() => setDownloadOpen(false)} />

      {track && <SubmitLyrics track={track} open={lyricsOpen} onClose={() => setLyricsOpen(false)} />}

      {track && (
        <CommentsSheet
          trackId={track.id}
          trackTitle={track.title}
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      )}
    </div>
  );
}

/* --------------------------- management rail --------------------------- */

function PlayerRail({
  open,
  active,
  onSelect,
}: {
  open: boolean;
  active: PanelId | null;
  onSelect: (id: PanelId) => void;
}) {
  const { t } = usePreferences();
  const items: { id: PanelId; icon: IconName; label: string }[] = [
    { id: "queue", icon: "list", label: "player.playQueue" },
    { id: "liked", icon: "heart", label: "player.likedSongs" },
    { id: "playlists", icon: "folder", label: "player.yourPlaylists" },
  ];

  return (
    <motion.nav
      initial={false}
      animate={{ width: open ? 46 : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      inert={!open}
      aria-label={t("player.musicManagement")}
      className={cn("shrink-0 overflow-hidden", open && "border-e border-line")}
    >
      <div className="flex h-full w-[46px] flex-col items-center gap-1 py-3">
      {items.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => onSelect(item.id)}
          whileTap={{ scale: 0.92 }}
          transition={spring}
          title={t(item.label)}
          aria-label={t(item.label)}
          aria-pressed={active === item.id}
          className={cn(
            "flex size-9 items-center justify-center rounded-[12px] transition-colors",
            active === item.id
              ? "bg-primary text-white shadow-primary"
              : "text-ink-muted hover:bg-subtle hover:text-ink",
          )}
        >
          <Icon name={item.icon} size={16.5} strokeWidth={2} />
        </motion.button>
      ))}
      </div>
    </motion.nav>
  );
}

/* ------------------------------- drawers ------------------------------- */

function PlayerDrawer({ panel, onClose }: { panel: PanelId; onClose: () => void }) {
  const { t } = usePreferences();
  const player = usePlayer();
  const { navigate, notify } = useApp();

  const rows: PlayerTrack[] =
    panel === "liked" ? QUEUE.filter((t) => player.liked.includes(t.id)) : QUEUE;

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -16, opacity: 0 }}
      transition={{ duration: 0.24, ease: EASE }}
      className="absolute inset-0 z-20 flex flex-col bg-surface"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="text-[13.5px] font-bold text-ink">{t(PANEL_TITLE[panel])}</span>
        <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">
          {panel === "playlists" ? playlists.length : rows.length}
        </span>
        <button
          onClick={onClose}
          aria-label={t("player.closePanel")}
          className="ms-auto flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          <Icon name="close" size={15} strokeWidth={2} />
        </button>
      </header>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {panel === "playlists" ? (
          <div className="flex flex-col gap-1">
            {playlists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  navigate("playlists");
                  onClose();
                  notify(`Opening “${list.name}”`);
                }}
                className="group flex items-center gap-2.5 rounded-[12px] px-1.5 py-1.5 text-start transition-colors hover:bg-primary-faint"
              >
                <span className="size-[34px] shrink-0 overflow-hidden rounded-[10px] shadow-xs">
                  <Photo src={list.photo} alt="" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-ink">{list.name}</span>
                  <span className="block truncate text-[12px] font-semibold text-ink-muted">
                    {list.tracks} tracks · {list.duration}
                  </span>
                </span>
                <span className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                  <Icon name="arrowRight" size={14} strokeWidth={2} />
                </span>
              </button>
            ))}
            <p className="px-1.5 pt-1 text-[12px] leading-relaxed text-ink-faint">
              {t("player.ownsPlaylists")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] leading-relaxed text-ink-faint">
            {t("player.likedEmpty")}
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {rows.map((row, i) => {
              const mine = player.track?.id === row.id;
              return (
                <button
                  key={row.id}
                  onClick={() => player.play(row)}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-[12px] px-1.5 py-1.5 text-start transition-colors",
                    mine ? "bg-primary-faint" : "hover:bg-subtle",
                  )}
                >
                  <span className="flex w-4 shrink-0 justify-center text-[12px] font-bold tabular-nums text-ink-faint">
                    {mine && player.playing ? (
                      <span className="text-primary">
                        <Icon name="waveform" size={13} strokeWidth={2.4} />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="size-[34px] shrink-0 overflow-hidden rounded-[10px] shadow-xs">
                    <Photo src={row.photo} alt="" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[13px] font-bold", mine ? "text-primary-deep" : "text-ink")}>
                      {row.title}
                    </span>
                    <span className="block truncate text-[12px] font-semibold text-ink-muted">{row.artist}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink-faint">
                    {mmss(row.seconds)}
                  </span>
                </button>
              );
            })}
            {panel === "liked" && (
              <p className="px-1.5 pt-1 text-[12px] leading-relaxed text-ink-faint">
                {t("player.sessionOnly")}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

/* ------------------------------ empty state ----------------------------- */

function EmptyState({ onPick }: { onPick: (track: PlayerTrack) => void }) {
  const { t } = usePreferences();
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-5 text-center"
    >
      <motion.span
        animate={{ rotate: [0, 16, -8, 14, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
        className="flex size-14 items-center justify-center rounded-full bg-primary-faint text-[26px] shadow-card"
      >
        👋
      </motion.span>

      <div>
        <h3 className="font-display text-[16px] font-bold leading-snug text-ink">
          {t("player.hey", { name: me.name })} {t("player.nothingPlaying")}
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
          {t("player.pickOne")}
        </p>
        <p dir="rtl" lang="fa" className="font-fa mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">
          یه آهنگ که دوست داری رو پخش کن 🎧
        </p>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <span className="text-start text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          {t("player.startWith")}
        </span>
        {QUICK_PICKS.map((pick) => (
          <motion.button
            key={pick.id}
            onClick={() => onPick(pick)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="group flex items-center gap-2.5 rounded-[14px] border border-line/80 bg-surface p-1.5 pe-3 text-start transition-colors hover:border-primary/25 hover:bg-primary-faint/50"
          >
            <span className="size-[36px] shrink-0 overflow-hidden rounded-[11px] shadow-xs">
              <Photo src={pick.photo} alt="" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-ink">{pick.title}</span>
              <span className="block truncate text-[12px] font-semibold text-ink-muted">{pick.artist}</span>
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-primary opacity-0 transition-opacity group-hover:opacity-100">
              <Icon name="play" size={14} strokeWidth={2.2} />
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------ track panel ----------------------------- */

function TrackPanel({
  player,
  expanded,
  onDownload,
}: {
  player: PlayerApi;
  expanded: boolean;
  onDownload: () => void;
}) {
  const { t, dir } = usePreferences();
  const { track, playing, position, duration, progress, toggle, next, prev, seek } = player;
  const barRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  if (!track) return null;

  const seekFromX = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    seek(trackRatio(clientX, rect, dir) * duration);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setScrubbing(true);
    seekFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <section className="relative flex shrink-0 flex-col items-center justify-center gap-1.5 px-3.5 py-3 lg:h-[40%] lg:min-h-0 lg:py-1">
      {/* cover */}
      <motion.div
        animate={{ scale: playing ? 1 : 0.97, opacity: playing ? 1 : 0.86 }}
        transition={spring}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[16px] shadow-float ring-1 ring-black/[0.05] dark:ring-white/[0.06]",
          expanded ? "size-[118px]" : "size-[88px]",
        )}
      >
        <Photo src={track.photo} alt="" />
        {!playing && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-white backdrop-blur-[1px]">
            <Icon name="pause" size={20} strokeWidth={2.2} />
          </span>
        )}
      </motion.div>

      {/* title + details */}
      <div className="w-full text-center">
        <h3
          className={cn(
            "font-display truncate font-bold leading-tight text-ink",
            expanded ? "text-[18px]" : "text-[16px]",
          )}
        >
          {track.title}
        </h3>
        <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink-muted">
          {track.artist}
          <span className="px-1.5 text-ink-faint">·</span>
          {track.album}
        </p>
      </div>

      {/* seek bar */}
      <div className="w-full">
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label={t("player.seek")}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${mmss(position)} of ${mmss(duration)}`}
          onPointerDown={onDown}
          onPointerMove={(e) => scrubbing && seekFromX(e.clientX)}
          onPointerUp={() => setScrubbing(false)}
          onPointerCancel={() => setScrubbing(false)}
          onKeyDown={(e) => {
            /* in RTL the arrow that points "forward" is the left one */
            const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
            if (step) seek(position + step * dirSign(dir));
          }}
          className="group relative flex h-4 cursor-pointer items-center focus:outline-none"
        >
          <span className="relative block h-[6px] w-full overflow-hidden rounded-full bg-subtle">
            <span
              className="absolute inset-y-0 start-0 rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
          <motion.span
            className="absolute size-[13px] rounded-full bg-primary shadow-primary ring-2 ring-surface"
            /* the fill starts at the card's inline start, so the knob must
               travel along the same axis — `left` would mirror against it */
            style={{ insetInlineStart: `calc(${progress * 100}% - 6.5px)` }}
            animate={{ scale: scrubbing ? 1.15 : 1 }}
            transition={spring}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[12px] font-semibold tabular-nums text-ink-faint">
          <span>{mmss(position)}</span>
          <span>-{mmss(Math.max(0, duration - position))}</span>
        </div>
      </div>

      {/* transport */}
      <div className="flex w-full items-center">
        <LikeButton player={player} />

        <div className="flex flex-1 items-center justify-center gap-3">
          <motion.button
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            onClick={prev}
            aria-label={t("player.prevTrack")}
            className="flex size-9 items-center justify-center rounded-full text-ink-body transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name={backIcon(dir)} size={17} strokeWidth={2.2} />
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-[44px] items-center justify-center rounded-full bg-primary text-white shadow-primary"
          >
            <Icon name={playing ? "pause" : "play"} size={19} strokeWidth={2.2} />
          </motion.button>

          <motion.button
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            onClick={next}
            aria-label={t("player.nextTrack")}
            className="flex size-9 items-center justify-center rounded-full text-ink-body transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name={forwardIcon(dir)} size={17} strokeWidth={2.2} />
          </motion.button>
        </div>

        <DownloadButton onOpen={onDownload} />
      </div>
    </section>
  );
}

/* -------------------------------- download ------------------------------ */

/**
 * Downloads are an Android feature — the web build streams. So this button is
 * a twin of the heart (same size, same single tone) and opening it explains
 * where to get the app instead of pretending to save a file.
 */
function DownloadButton({ onOpen }: { onOpen: () => void }) {
  const { t } = usePreferences();
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.9 }}
      transition={spring}
      onClick={onOpen}
      title={t("player.downloadTip")}
      aria-label={t("player.downloadTip")}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
    >
      <Icon name="download" size={17} strokeWidth={2.1} />
    </motion.button>
  );
}

/* ------------------------------ download note --------------------------- */

function DownloadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = usePreferences();
  const { navigate } = useApp();

  return (
    <Modal open={open} onClose={onClose}>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
        <Icon name="download" size={20} strokeWidth={2.1} />
      </span>

      <h2 className="font-display mt-3 text-[17.5px] font-bold leading-snug text-ink">
        {t("player.downloadTitle")}
      </h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
        Songs stream free in the browser — saving a track for offline listening, and the
        full-quality files, are Android-only.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => {
            onClose();
            navigate("download");
          }}
          className="flex items-center gap-2 rounded-[14px] bg-primary px-3.5 py-2.5 text-[13.5px] font-bold text-white shadow-primary"
        >
          {t("player.androidPage")}
          <Icon name="arrowRight" size={15} strokeWidth={2.2} />
        </motion.button>

        <button
          onClick={onClose}
          className="rounded-[14px] px-3 py-2.5 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          {t("player.notNow")}
        </button>
      </div>
    </Modal>
  );
}

function LikeButton({ player }: { player: PlayerApi }) {
  const { t } = usePreferences();
  const { notify } = useApp();
  const id = player.track?.id;
  const on = !!id && player.liked.includes(id);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={spring}
      onClick={() => {
        if (!id) return;
        player.toggleLike(id);
        notify(t(on ? "player.unlikedToast" : "player.likedToast"), on ? "teal" : "primary");
      }}
      aria-pressed={on}
      title={t(on ? "player.likeOn" : "player.likeOff")}
      aria-label={t(on ? "player.likeOn" : "player.likeOff")}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
        on ? "bg-primary-soft text-primary-deep" : "text-ink-muted hover:bg-subtle hover:text-ink",
      )}
    >
      <Icon name="heart" size={17} strokeWidth={2} fill={on ? "currentColor" : "none"} />
    </motion.button>
  );
}

/* ----------------------------- lyrics panel ---------------------------- */

function LyricsPanel({
  track,
  lines,
  by,
  position,
  playing,
  onSend,
}: {
  track: PlayerTrack;
  lines: ReturnType<typeof lyricsFor>;
  /** set when the sheet came from a fan whose submission the mods approved */
  by: string | null;
  position: number;
  playing: boolean;
  onSend: () => void;
}) {
  const { t } = usePreferences();
  const { pendingFor } = useContributions();
  const pending = pendingFor(track.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const touchedAt = useRef(0);
  const active = lines ? activeLineIndex(lines, position) : -1;

  /* a new song starts its lyrics at the top */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [lines]);

  /* keep the current line centred — unless the listener is reading ahead */
  useEffect(() => {
    if (!playing || active < 0) return;
    if (Date.now() - touchedAt.current < 5000) return;
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active, playing]);

  return (
    <section className="flex min-h-0 flex-1 flex-col border-t border-line">
      <header className="flex shrink-0 items-center gap-1.5 px-3.5 py-2">
        <span className="text-ink-faint">
          <Icon name="mic" size={13.5} />
        </span>
        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">{t("lyrics.title")}</span>
        <span className="ms-auto flex items-center gap-1">
          <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">한국어</span>
          <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">EN</span>
          <span className="rounded-full bg-primary-soft px-1.5 py-[1px] text-[11.5px] font-bold text-primary-deep">فارسی</span>
        </span>
      </header>

      {by && (
        <p className="mx-2.5 mb-1.5 flex items-center gap-1.5 rounded-panel bg-mint-soft/70 px-2.5 py-1.5 text-[12px] font-semibold text-teal-deep">
          <Icon name="check" size={13} strokeWidth={2.6} />
          {t("lyrics.credit", {
            who: by === "you" ? t("lyrics.creditYou") : `@${by}`,
            n: LYRIC_REWARD,
          })}
        </p>
      )}

      <div
        ref={scrollRef}
        onScroll={() => {
          touchedAt.current = Date.now();
        }}
        className="scroll-slim mask-fade-b min-h-0 flex-1 overflow-y-auto px-2.5 pb-7 pt-0.5"
      >
        {!lines ? (
          <div className="flex flex-col items-center px-3 py-6 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <Icon name="mic" size={18} strokeWidth={2.1} />
            </span>
            <p className="font-display mt-2.5 text-[14px] font-bold text-ink">
              {t("lyrics.emptyTitle")}
            </p>
            <p className="mt-1 max-w-[290px] text-[12.5px] leading-relaxed text-ink-muted">
              {pending
                ? t("lyrics.emptyBodyPending")
                : t("lyrics.emptyBody")}
            </p>
            {pending ? (
              <span className="mt-2.5 flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-[12px] font-bold text-ink-muted">
                <Icon name="clock" size={13} />
                {t("lyrics.pending")}
              </span>
            ) : (
              <motion.button
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={onSend}
                className="mt-2.5 flex items-center gap-2 rounded-[14px] bg-primary px-3.5 py-2.5 text-[13.5px] font-bold text-white shadow-primary"
              >
                <Icon name="send" size={15} strokeWidth={2.1} />
                {t("lyrics.send")}
              </motion.button>
            )}
            <span className="mt-2 text-[12px] font-semibold text-ink-faint">
              {pending
                ? t("lyrics.wait")
                : t("lyrics.pay", { n: LYRIC_REWARD })}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {lines.map((line, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`${line.at}-${i}`}
                  ref={isActive ? activeRef : undefined}
                  /* centred like a lyric sheet: the original line and its
                     translation both hang off the middle of the panel */
                  className={cn(
                    "rounded-[12px] px-2.5 py-2 text-center transition-colors duration-300",
                    isActive ? "bg-primary-faint" : "bg-transparent",
                  )}
                >
                  <p
                    className={cn(
                      "text-[13.5px] leading-snug transition-colors duration-300",
                      isActive ? "font-bold text-ink" : "font-medium text-ink-muted/75",
                    )}
                  >
                    {line.ko}
                  </p>
                  <p
                    dir="rtl"
                    lang="fa"
                    className={cn(
                      "font-fa mt-0.5 text-[12.5px] leading-relaxed transition-colors duration-300",
                      isActive ? "font-semibold text-primary-deep" : "text-ink-faint",
                    )}
                  >
                    {line.fa}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
