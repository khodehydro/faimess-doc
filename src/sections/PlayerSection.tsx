import { useEffect, useRef, useState, type ComponentProps, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { usePlayer } from "../app/PlayerContext";
import { useApp } from "../app/AppContext";
import { activeLineIndex, lyricsFor, mmss, QUEUE, type PlayerTrack } from "../data/player";
import { playlists } from "../data/library";
import { me } from "../data/account";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Card 5 (right) — the player.
 *
 *    rail (46px)   the music-management sidebar: queue · liked · playlists,
 *                  and the Android-only download at the foot
 *    card          Player · feed position
 *      top 40%     cover · title/artist/album · seek bar · transport
 *      bottom 60%  bilingual lyrics (original + فارسی), one scroll surface,
 *                  with the line being sung highlighted
 *
 *  Nothing loaded yet? The card becomes a greeting with three quick picks.
 * ------------------------------------------------------------------ */

type PanelId = "queue" | "liked" | "playlists";
type PlayerApi = ReturnType<typeof usePlayer>;
type IconName = ComponentProps<typeof Icon>["name"];

const QUICK_PICKS = QUEUE.slice(0, 3);

const PANEL_TITLE: Record<PanelId, string> = {
  queue: "Up next",
  liked: "Liked songs",
  playlists: "Your playlists",
};

export function PlayerSection() {
  const player = usePlayer();
  const { track } = player;
  const [panel, setPanel] = useState<PanelId | null>(null);
  const lines = lyricsFor(track);

  return (
    <div className="flex min-h-0 flex-1">
      <PlayerRail active={panel} onSelect={(id) => setPanel((p) => (p === id ? null : id))} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 px-3.5 pb-2 pt-3.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <Icon name="waveform" size={15} strokeWidth={2.2} />
          </span>
          <span className="font-display text-[15px] font-bold text-ink">Player</span>
          {track && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-subtle px-2 py-1 text-[12px] font-bold tabular-nums text-ink-muted">
              <Icon name="list" size={12} />
              {QUEUE.findIndex((t) => t.id === track.id) + 1}/{QUEUE.length}
            </span>
          )}
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
              <TrackPanel player={player} />
              <LyricsPanel lines={lines} position={player.position} playing={player.playing} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {panel && <PlayerDrawer panel={panel} onClose={() => setPanel(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --------------------------- management rail --------------------------- */

function PlayerRail({ active, onSelect }: { active: PanelId | null; onSelect: (id: PanelId) => void }) {
  const { notify } = useApp();

  const items: { id: PanelId; icon: IconName; label: string }[] = [
    { id: "queue", icon: "list", label: "Play queue" },
    { id: "liked", icon: "heart", label: "Liked songs" },
    { id: "playlists", icon: "folder", label: "Playlists" },
  ];

  return (
    <nav className="flex w-[46px] shrink-0 flex-col items-center gap-1 border-r border-line py-3">
      {items.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => onSelect(item.id)}
          whileTap={{ scale: 0.92 }}
          transition={spring}
          title={item.label}
          aria-label={item.label}
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

      {/* downloads ship with the Android app — the rail keeps the door shut */}
      <motion.button
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.92 }}
        transition={spring}
        onClick={() => notify("Downloads live in the FAIMESS Android app", "teal")}
        title="Download — FAIMESS Android app only"
        aria-label="Download — FAIMESS Android app only"
        className="mt-auto flex size-9 items-center justify-center rounded-[12px] bg-mint-soft text-teal-deep transition-colors hover:bg-teal-soft"
      >
        <Icon name="download" size={16.5} strokeWidth={2.2} />
      </motion.button>
    </nav>
  );
}

/* ------------------------------- drawers ------------------------------- */

function PlayerDrawer({ panel, onClose }: { panel: PanelId; onClose: () => void }) {
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
        <span className="text-[13.5px] font-bold text-ink">{PANEL_TITLE[panel]}</span>
        <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">
          {panel === "playlists" ? playlists.length : rows.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="ml-auto flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
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
                className="group flex items-center gap-2.5 rounded-[12px] px-1.5 py-1.5 text-left transition-colors hover:bg-primary-faint"
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
              Six editorial lists, curated by FAIMESS.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] leading-relaxed text-ink-faint">
            Nothing here yet — tap the heart while a song plays.
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
                    "group flex items-center gap-2.5 rounded-[12px] px-1.5 py-1.5 text-left transition-colors",
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
                Favourites live in this session only — the demo has no backend yet.
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
          Hey {me.name}, nothing playing yet
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
          Tap play anywhere and the song lands here — cover, seek bar and bilingual lyrics.
        </p>
        <p dir="rtl" lang="fa" className="font-fa mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">
          یه آهنگ که دوست داری رو پخش کن 🎧
        </p>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <span className="text-left text-[12px] font-bold uppercase tracking-wider text-ink-faint">Start with</span>
        {QUICK_PICKS.map((pick) => (
          <motion.button
            key={pick.id}
            onClick={() => onPick(pick)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="group flex items-center gap-2.5 rounded-[14px] border border-line/80 bg-surface p-1.5 pr-3 text-left transition-colors hover:border-primary/25 hover:bg-primary-faint/50"
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

function TrackPanel({ player }: { player: PlayerApi }) {
  const { track, playing, position, duration, progress, toggle, next, prev, seek } = player;
  const barRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  if (!track) return null;

  const seekFromX = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    seek(ratio * duration);
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
        className="relative size-[88px] shrink-0 overflow-hidden rounded-[16px] shadow-float ring-1 ring-black/[0.05]"
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
        <h3 className="font-display truncate text-[16px] font-bold leading-tight text-ink">{track.title}</h3>
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
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${mmss(position)} of ${mmss(duration)}`}
          onPointerDown={onDown}
          onPointerMove={(e) => scrubbing && seekFromX(e.clientX)}
          onPointerUp={() => setScrubbing(false)}
          onPointerCancel={() => setScrubbing(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek(position + 5);
            if (e.key === "ArrowLeft") seek(position - 5);
          }}
          className="group relative flex h-4 cursor-pointer items-center focus:outline-none"
        >
          <span className="relative block h-[6px] w-full overflow-hidden rounded-full bg-subtle">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
          <motion.span
            className="absolute size-[13px] rounded-full bg-primary shadow-primary ring-2 ring-white"
            style={{ left: `calc(${progress * 100}% - 6.5px)` }}
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
            aria-label="Previous track"
            className="flex size-9 items-center justify-center rounded-full text-ink-body transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name="chevronLeft" size={17} strokeWidth={2.2} />
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
            aria-label="Next track"
            className="flex size-9 items-center justify-center rounded-full text-ink-body transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name="chevronRight" size={17} strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* keeps the transport dead-centre against the heart */}
        <span className="size-9 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}

function LikeButton({ player }: { player: PlayerApi }) {
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
        notify(on ? "Removed from Liked songs" : "Saved to Liked songs", on ? "teal" : "primary");
      }}
      aria-pressed={on}
      title={on ? "Remove from Liked songs" : "Save to Liked songs"}
      aria-label={on ? "Remove from Liked songs" : "Save to Liked songs"}
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
  lines,
  position,
  playing,
}: {
  lines: ReturnType<typeof lyricsFor>;
  position: number;
  playing: boolean;
}) {
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
        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Lyrics</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">한국어</span>
          <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold text-ink-muted">EN</span>
          <span className="rounded-full bg-primary-soft px-1.5 py-[1px] text-[11.5px] font-bold text-primary-deep">فارسی</span>
        </span>
      </header>

      <div
        ref={scrollRef}
        onScroll={() => {
          touchedAt.current = Date.now();
        }}
        className="scroll-slim mask-fade-b min-h-0 flex-1 overflow-y-auto px-2.5 pb-7 pt-0.5"
      >
        {!lines ? (
          <p className="px-1 py-6 text-center text-[13px] text-ink-faint">
            Lyrics for this track aren’t in the demo set yet.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {lines.map((line, i) => {
              const isActive = i === active;
              return (
                <div
                  key={`${line.at}-${i}`}
                  ref={isActive ? activeRef : undefined}
                  className={cn(
                    "rounded-[12px] px-2.5 py-2 transition-colors duration-300",
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
