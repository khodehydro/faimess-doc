import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MapScene, SunsetScene, CampingScene, CoastScene } from "../ui/Scenes";
import { AvatarStack } from "../ui/Avatar";
import { CircleButton, Meta } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import { banners, type Banner } from "../data/banners";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

const AUTOPLAY_MS = 7000;

const SCENES = {
  sunset: SunsetScene,
  camping: CampingScene,
  coast: CoastScene,
  forest: SunsetScene,
} as const;

/* ------------------------------------------------------------------ *
 *  Home hero — a banner carousel with previous / next controls.
 *  Add another entry to data/banners.ts and it becomes a new slide.
 * ------------------------------------------------------------------ */

export function HeroBanner() {
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

  /* pointer parallax on the illustration */
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

  const Scene = SCENES[banner.scene];

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
      className="relative h-full w-full overflow-hidden rounded-card bg-primary-faint select-none"
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
            <Scene className="h-full w-full" />
          </motion.div>

          {/* legibility scrims */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/12 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/18 to-transparent" />

          {/* travellers + alerts */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="absolute right-5 top-5 flex items-center gap-3"
          >
            <div className="flex items-center rounded-full bg-white/72 p-1.5 pl-2 backdrop-blur-md">
              <AvatarStack seeds={banner.travellers} more={banner.guests} size={28} />
            </div>
            <div className="group">
              <CircleButton
                icon="bell"
                tone="white"
                label="Trip alerts"
                iconClassName="anim-bell"
                className="bg-white/85 backdrop-blur-md"
                onClick={() => notify("Trip alerts are up to date")}
              />
            </div>
          </motion.div>

          {/* floating detail card */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="absolute bottom-6 left-5 flex items-end gap-3"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={spring}
              className="w-[296px] rounded-[20px] bg-white/93 p-3 shadow-float backdrop-blur-md"
            >
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary-deep">
                <Icon name="sparkle" size={10} strokeWidth={2.2} />
                {banner.eyebrow}
              </span>
              <h3 className="font-display text-[16px] font-bold leading-tight tracking-[-0.02em] text-ink">{banner.title}</h3>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium">
                <Meta icon="calendar">{banner.dateRange}</Meta>
                <Meta icon="clock">{banner.time}</Meta>
              </div>
              <div className="mt-2.5 h-[108px] overflow-hidden rounded-[14px] ring-1 ring-line">
                <MapScene tone={banner.mapTone} className="h-full w-full" />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ y: -3, rotate: -4 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              onClick={() => notify(`${banner.title} · folder`)}
              aria-label="Open trip folder"
              title="Open trip folder"
              className="mb-7 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-primary"
            >
              <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
                <Icon name="folder" size={17} />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* carousel controls */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
        <CircleButton
          icon="chevronLeft"
          tone="white"
          size="md"
          label="Previous banner"
          className="bg-white/88 backdrop-blur-md"
          onClick={() => go(-1)}
        />
        <div className="flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-2 backdrop-blur-md">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Go to ${b.title}`}
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
          label="Next banner"
          className="bg-white/88 backdrop-blur-md"
          onClick={() => go(1)}
        />
      </div>
    </div>
  );
}
