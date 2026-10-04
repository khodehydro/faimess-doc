import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { AvatarStack } from "./Avatar";
import { Meta } from "./ui";
import { Thumb } from "./Scenes";
import {
  featuredEvent,
  hourRows,
  scheduleEvents,
  weekDays,
  type ScheduleEvent,
} from "../lib/data";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

const GRID_COLS = "58px repeat(5, minmax(0, 1fr))";
const ROW = 54;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ------------------------------- chips ------------------------------- */

function EventChip({ event }: { event: ScheduleEvent }) {
  if (event.kind === "locked") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={spring}
        className="flex h-full flex-col justify-center rounded-[10px] bg-teal-soft px-2.5 py-1.5 text-teal-deep"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold leading-tight">
          <Icon name="lock" size={11} strokeWidth={2} />
          {event.title}
        </span>
      </motion.div>
    );
  }

  if (event.kind === "rich") {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={spring}
        className="h-full cursor-pointer rounded-[12px] bg-white p-1.5 shadow-card ring-1 ring-line/70"
      >
        <div className="h-[40px] overflow-hidden rounded-[8px]">
          <Thumb thumb={event.thumb ?? "forest"} className="h-full w-full" />
        </div>
        <p className="mt-1.5 px-0.5 text-[10.5px] font-bold leading-tight text-ink">{event.title}</p>
        <div className="mt-1 flex items-center justify-between px-0.5">
          <Meta icon="clock" iconSize={10} className="text-[9px]">
            {event.meta}
          </Meta>
          <AvatarStack seeds={[2, 4, 5]} more={event.guests ?? 0} size={15} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={spring}
      className="flex h-full cursor-pointer items-center gap-1.5 rounded-[10px] border border-dashed border-line-strong bg-white/70 px-2.5 py-1.5 text-ink-muted backdrop-blur-sm"
    >
      <Icon name="clock" size={11} strokeWidth={2} />
      <span className="text-[11px] font-semibold leading-tight">{event.title}</span>
    </motion.div>
  );
}

/* ------------------------------- panel ------------------------------- */

export function SchedulePanel({ onToast }: { onToast: (text: string) => void }) {
  const [activeDay, setActiveDay] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [monthOffset, setMonthOffset] = useState(0);

  const monthLabel = useMemo(() => {
    const base = new Date(2023, 11, 1);
    base.setMonth(base.getMonth() + monthOffset);
    return `${MONTHS[base.getMonth()]} ${base.getFullYear()}`;
  }, [monthOffset]);

  return (
    <section className="relative overflow-hidden rounded-card bg-surface p-5 shadow-card">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.025em] text-ink">Upcoming Schedule</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {scheduleEvents.length} plans this week · {weekDays[activeDay].short} {weekDays[activeDay].date}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* month stepper */}
          <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMonthOffset((m) => m - 1)}
              aria-label="Previous month"
              className="flex size-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <Icon name="chevronLeft" size={13} strokeWidth={2.1} />
            </motion.button>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={monthLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 px-1.5 text-[11.5px] font-semibold text-ink-body"
              >
                <Icon name="calendar" size={13} />
                {monthLabel}
              </motion.span>
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMonthOffset((m) => m + 1)}
              aria-label="Next month"
              className="flex size-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <Icon name="chevronRight" size={13} strokeWidth={2.1} />
            </motion.button>
          </div>

          {/* view switch */}
          <div className="flex items-center gap-0.5 rounded-full bg-subtle p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === "grid" ? "Time grid" : "List"}
                className={cn(
                  "relative flex size-6 items-center justify-center rounded-full transition-colors",
                  view === v ? "text-ink" : "text-ink-faint hover:text-ink-muted",
                )}
              >
                {view === v && (
                  <motion.span layoutId="view-pill" transition={spring} className="absolute inset-0 rounded-full bg-white shadow-xs" />
                )}
                <span className="relative">
                  <Icon name={v} size={13} strokeWidth={1.9} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* day headers */}
      <div className="mt-4 grid" style={{ gridTemplateColumns: GRID_COLS }}>
        <span />
        {weekDays.map((d, i) => {
          const isActive = i === activeDay;
          return (
            <button
              key={d.short}
              onClick={() => setActiveDay(i)}
              className="group flex flex-col items-center gap-0.5 pb-2"
            >
              <span className={cn("text-[10.5px] font-medium", d.dimmed && !isActive ? "text-ink-faint" : "text-ink-muted")}>
                {d.short}
              </span>
              <span
                className={cn(
                  "text-[12.5px] font-bold transition-colors",
                  isActive ? "text-coral" : d.dimmed ? "text-ink-faint" : "text-ink-body group-hover:text-ink",
                )}
              >
                {d.date}
              </span>
              <motion.span
                animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                transition={spring}
                className="mt-0.5 block h-0.5 w-5 rounded-full bg-coral"
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {/* scrollable day grid */}
            <div className="scroll-slim relative max-h-[240px] min-h-[240px] overflow-y-auto pr-1">
              <div className="relative">
                {/* active column tint */}
                <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: GRID_COLS }}>
                  <motion.div
                    layoutId="day-tint"
                    transition={spring}
                    style={{ gridColumn: activeDay + 2, gridRow: 1 }}
                    className="rounded-[16px] bg-coral-faint"
                  />
                </div>

                {hourRows.map((hour, r) => (
                  <div
                    key={hour}
                    className="relative grid border-t border-line/80"
                    style={{ gridTemplateColumns: GRID_COLS, height: ROW }}
                  >
                    <span className="pt-2 text-[10px] font-medium text-ink-faint">{hour}</span>
                    {weekDays.map((d, i) => (
                      <span key={d.short} className={cn("h-full border-l border-line/60", i === 3 && "border-l-line/80")} />
                    ))}
                  </div>
                ))}

                {/* event chips, pinned to the same grid */}
                <div
                  className="pointer-events-none absolute inset-0 grid"
                  style={{
                    gridTemplateColumns: GRID_COLS,
                    gridTemplateRows: `repeat(${hourRows.length}, ${ROW}px)`,
                  }}
                >
                  {scheduleEvents.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: EASE }}
                      style={{ gridColumn: ev.dayIndex + 2, gridRow: ev.row + 1 }}
                      className="pointer-events-auto m-1"
                    >
                      <EventChip event={ev} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none -mt-6 h-6 rounded-b-[16px] bg-gradient-to-t from-white to-transparent" />
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-2 min-h-[236px] space-y-1.5"
          >
            {scheduleEvents.map((ev, i) => (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="flex items-center gap-3 rounded-[14px] border border-line bg-subtle px-3 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="flex size-9 items-center justify-center rounded-[11px] bg-white text-teal-deep shadow-xs">
                  <Icon name={ev.kind === "locked" ? "lock" : ev.kind === "rich" ? "compass" : "clock"} size={15} />
                </span>
                <span className="flex-1">
                  <span className="block text-[12.5px] font-bold text-ink">{ev.title}</span>
                  <Meta icon="calendar" iconSize={11} className="text-[10.5px]">
                    {`${weekDays[ev.dayIndex].short} ${weekDays[ev.dayIndex].date} Dec${
                      ev.meta?.includes("·") ? ` · ${ev.meta.split("·")[1]!.trim()}` : ""
                    }`}
                  </Meta>
                </span>
                <AvatarStack seeds={[1, 3]} more={ev.guests ?? 1} size={20} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* floating featured event — draggable */}
      <motion.div
        drag
        dragConstraints={{ left: -14, right: 240, top: -190, bottom: 18 }}
        dragElastic={0.14}
        dragMomentum={false}
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
        whileDrag={{ scale: 1.03, boxShadow: "0 32px 60px -16px rgba(24,28,40,.32)", cursor: "grabbing" }}
        whileHover={{ y: -4 }}
        className="absolute bottom-7 left-6 z-20 w-[240px] cursor-grab touch-none rounded-[18px] bg-white p-2 shadow-float ring-1 ring-line/60"
      >
        <div className="h-[86px] overflow-hidden rounded-[12px]">
          <Thumb thumb={featuredEvent.thumb} className="h-full w-full" />
        </div>
        <div className="px-1 pb-0.5 pt-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13px] font-bold leading-tight tracking-[-0.01em] text-ink">
              {featuredEvent.title}
            </h4>
            <span className="mt-0.5 text-ink-faint">
              <Icon name="more" size={13} strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <Meta icon="calendar" iconSize={11} className="text-[9.5px]">
              {featuredEvent.dateRange}
            </Meta>
            <Meta icon="clock" iconSize={11} className="text-[9.5px]">
              {featuredEvent.time}
            </Meta>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <AvatarStack seeds={[0, 2]} more={featuredEvent.guests} size={20} />
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onToast(`Opening “${featuredEvent.title}”`)}
              aria-label="Open event"
              className="flex size-7 items-center justify-center rounded-full bg-coral-faint text-coral-deep"
            >
              <Icon name="arrowUpRight" size={13} strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
