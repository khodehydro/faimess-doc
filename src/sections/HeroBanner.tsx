import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Photo } from "../ui/Cover";
import { CircleButton, Meta } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import { banners } from "../data/banners";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { withThousands } from "../lib/format";
import { EASE, spring } from "../lib/motion";
import { useT } from "../app/PreferencesContext";

const AUTOPLAY_MS = 7000;

/* ------------------------------------------------------------------ *
 *  Home hero — a banner carousel with previous / next controls.
 *  Each slide is a real photograph (data/banners.ts) with its event
 *  card floating on top. Add an entry there and it becomes a new slide.
 * ------------------------------------------------------------------ */

export function HeroBanner() {
  const t = useT();
  const { notify } = useApp();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const banner = banners[index];

  const go = useCallback((step: number) => {
    setDir(step);
    setIndex((i) => (i + step + banners.length) % banners.length);
  }, []);

  /** autoplay, paused while the pointer is inside or the tab is hidden */
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  /** arrow keys drive the carousel too (ignored while typing) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /input|textarea/i.test(el.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* pointer parallax on the photograph */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 90, damping: 20 });
  const y = useSpring(useTransform(my, [-1, 1], [-8, 8]), { stiffness: 90, damping: 20 });

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d * 64, opacity: 0, scale: 1.02 }),
      center: { x: 0, opacity: 1, scale: 1 },
      exit: (d: number) => ({ x: d * -64, opacity: 0, scale: 1.01 }),
    }),
    [],
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        mx.set(0);
        my.set(0);
      }}
      className="relative h-full w-full select-none overflow-hidden rounded-[18px] bg-ink shadow-card ring-1 ring-line/60"
    >
      {/* slides */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={banner.id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: EASE }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) go(1);
            else if (info.offset.x > 70) go(-1);
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <motion.div style={{ x, y }} className="absolute -inset-6">
            <Photo src={banner.photo} className="scale-[1.03]" />
          </motion.div>

          {/* legibility scrims */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/12 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/28 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/45 to-transparent" />

          {/* fans going + alerts */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="absolute end-5 top-5 flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-surface/85 px-3 py-2 backdrop-blur-md">
              <Icon name="flame" size={14} className="text-flame" />
              <span className="text-[13.5px] font-extrabold tabular-nums text-ink">{withThousands(banner.going)}</span>
              <span className="text-[12.5px] font-semibold text-ink-muted">{t("shelf.going")}</span>
            </div>
            <div className="group">
              <CircleButton
                icon="bell"
                tone="white"
                label={t("hero.showAlerts")}
                iconClassName="anim-bell"
                className="bg-surface/85 backdrop-blur-md"
                onClick={() => notify(t("toast.caughtUp"))}
              />
            </div>
          </motion.div>

          {/* floating event card */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="absolute bottom-6 start-5 flex items-end gap-3"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={spring}
              className="w-[302px] rounded-[20px] bg-surface/94 p-3 shadow-float backdrop-blur-md"
            >
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide text-primary-deep">
                <Icon name="sparkle" size={12} strokeWidth={2.2} />
                {banner.eyebrow}
              </span>
              <h3 className="font-display text-[18px] font-bold leading-tight tracking-[-0.01em] text-ink">{banner.title}</h3>
              <div className="mt-1.5 flex items-center gap-3 text-[13px] font-medium">
                <Meta icon="calendar" iconSize={13}>
                  {banner.dateRange}
                </Meta>
                <Meta icon="pin" iconSize={13} className="max-w-[130px] overflow-hidden whitespace-nowrap">
                  {banner.location}
                </Meta>
              </div>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {banner.stops.map((stop) => (
                  <li
                    key={stop.city}
                    className="flex items-center justify-between rounded-[12px] bg-subtle/75 px-2.5 py-1.5 text-[12.5px] font-semibold text-ink-body"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="compass" size={12} className="text-primary" />
                      {stop.city}
                    </span>
                    <span className="tabular-nums text-ink-muted">{stop.date}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.button
              whileHover={{ y: -3, rotate: -4 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              onClick={() => notify(t("toast.tickets", { title: banner.title }))}
              aria-label={t("hero.openTickets")}
              title={t("hero.openTickets")}
              className="mb-7 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-primary"
            >
              <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
                <Icon name="star" size={18.5} />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* carousel controls */}
      <div className="absolute bottom-5 end-5 z-20 flex items-center gap-2">
        <CircleButton
          icon="chevronLeft"
          tone="white"
          size="md"
          label={t("hero.prev")}
          className="bg-surface/88 backdrop-blur-md"
          onClick={() => go(-1)}
        />
        <div className="flex items-center gap-1.5 rounded-full bg-surface/88 px-2.5 py-2 backdrop-blur-md">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={b.title}
              className="group relative flex h-2 items-center"
            >
              <motion.span
                animate={{ width: i === index ? 20 : 6, opacity: i === index ? 1 : 0.42 }}
                transition={spring}
                className={cn(
                  "block h-2 rounded-full transition-colors",
                  i === index ? "bg-primary" : "bg-ink-faint group-hover:bg-ink-muted",
                )}
              />
            </button>
          ))}
        </div>
        <CircleButton
          icon="chevronRight"
          tone="white"
          size="md"
          label={t("hero.next")}
          className="bg-surface/88 backdrop-blur-md"
          onClick={() => go(1)}
        />
      </div>
    </div>
  );
}
