import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shelf } from "./Shelf";
import { Cover } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { trendingTracks } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { compactNumber } from "../../lib/format";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf 3 — trending songs ranked by how many users hit the fire
 *  button. Tapping the flame adds your own vote (optimistic).
 * ------------------------------------------------------------------ */

type Row = (typeof trendingTracks)[number] & { fired: boolean; fires: number };

function TrendingRow({ row, rank, index }: { row: Row; rank: number; index: number }) {
  const { notify } = useApp();
  const [fired, setFired] = useState(row.fired);
  const [fires, setFires] = useState(row.fires);
  const [pop, setPop] = useState(0);

  const fire = () => {
    const next = !fired;
    setFired(next);
    setFires((n) => n + (next ? 1 : -1));
    setPop((p) => p + 1);
    notify(next ? `You fired “${row.title}” 🔥` : `Removed your fire from “${row.title}”`, next ? "primary" : "teal");
  };

  const medal = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group flex items-center gap-2.5 rounded-[14px] border border-line/80 bg-surface px-2.5 py-2 transition-colors hover:border-primary/25 hover:bg-primary-faint/50"
    >
      {/* rank */}
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-extrabold tabular-nums",
          medal ? "bg-primary text-white shadow-primary" : "bg-subtle text-ink-muted",
        )}
      >
        {rank}
      </span>

      <span className="relative size-[38px] shrink-0 overflow-hidden rounded-[11px] shadow-xs">
        <Cover seed={row.seed} className="h-full w-full" />
        <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Icon name="play" size={14} strokeWidth={2} />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-bold text-ink">{row.title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-muted">
          <span className="font-semibold text-ink-body">{row.artist}</span>
          <span className="text-ink-faint">·</span>
          <span className="flex items-center gap-0.5 text-teal-deep">
            <Icon name="trend" size={11} strokeWidth={2} />+{row.delta}%
          </span>
        </span>
      </span>

      {/* fire counter */}
      <motion.button
        onClick={fire}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.95 }}
        transition={spring}
        aria-pressed={fired}
        aria-label={`Fire ${row.title}`}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-colors",
          fired
            ? "border-transparent bg-flame-soft text-flame-deep"
            : "border-line bg-surface text-ink-muted hover:border-flame/40 hover:text-flame-deep",
        )}
      >
        <motion.span
          key={pop}
          initial={{ scale: 1 }}
          animate={fired ? { scale: [1, 1.35, 1], rotate: [0, -8, 6, 0] } : { scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={cn("block", fired ? "text-flame" : "text-flame/70 group-hover:text-flame")}
        >
          <Icon name="flame" size={14} strokeWidth={1.9} fill={fired ? "currentColor" : "none"} />
        </motion.span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={fires}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] font-extrabold tabular-nums"
          >
            {compactNumber(fires)}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export function TrendingTracks() {
  const { notify } = useApp();
  const [range, setRange] = useState<"day" | "week">("day");

  const rows = useMemo<Row[]>(
    () => trendingTracks.map((t) => ({ ...t, fired: false, fires: t.fires })),
    [],
  );

  return (
    <Shelf
      id="feed-trending"
      icon="flame"
      title="Trending now"
      hint="ranked by fan fires"
      action={
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-full bg-subtle p-0.5">
            {([
              { id: "day", label: "24h" },
              { id: "week", label: "Week" },
            ] as const).map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "relative rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                  range === r.id ? "text-ink" : "text-ink-faint hover:text-ink-muted",
                )}
              >
                {range === r.id && (
                  <motion.span layoutId="trend-range" transition={spring} className="absolute inset-0 rounded-full bg-white shadow-xs" />
                )}
                <span className="relative">{r.label}</span>
              </button>
            ))}
          </div>
          <PillButton tone="soft" onClick={() => notify("Showing every trending track")}>
            See all
          </PillButton>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {rows.map((row, i) => (
          <TrendingRow key={row.id} row={row} rank={i + 1} index={i} />
        ))}
      </div>
    </Shelf>
  );
}
