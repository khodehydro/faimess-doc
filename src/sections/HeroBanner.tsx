import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Photo } from "../ui/Cover";
import { banners } from "../data/banners";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";
import { usePreferences } from "../app/PreferencesContext";
import { dirSign } from "../lib/rtl";

const AUTOPLAY_MS = 7000;

/* ------------------------------------------------------------------ *
 *  Home hero — a full-bleed photograph per slide (data/banners.ts) and
 *  nothing on top of it but a small indicator, centred along the bottom
 *  edge. No cards, no badges, no arrow rails: the carousel moves on its
 *  own (7s), on ← / →, on a horizontal drag — and on a tap of the
 *  indicator. Add an entry to the data and it becomes a new slide.
 * ------------------------------------------------------------------ */

export function HeroBanner() {
  const { t, dir: writing, text } = usePreferences();
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
      if (e.key === "ArrowRight") go(dirSign(writing));
      if (e.key === "ArrowLeft") go(-dirSign(writing));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, writing]);

  /* Pointer parallax on the photograph. Over-damped on purpose: a spring
     that overshoots reads as "the banner is shaking", and it is off entirely
     for anyone who asked the system for less motion. */
  const reduceMotion = useReducedMotion();
  const reach = reduceMotion ? 0 : 10;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glide = { stiffness: 70, damping: 24, mass: 0.8 } as const;
  const x = useSpring(useTransform(mx, [-1, 1], [-reach, reach]), glide);
  const y = useSpring(useTransform(my, [-1, 1], [-reach * 0.7, reach * 0.7]), glide);

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  /* slides travel along the physical x-axis, so the offset follows the
     writing direction — a "next" slide comes from the left in RTL */
  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d * 64 * dirSign(writing), opacity: 0, scale: 1.02 }),
      center: { x: 0, opacity: 1, scale: 1 },
      exit: (d: number) => ({ x: d * -64 * dirSign(writing), opacity: 0, scale: 1.01 }),
    }),
    [writing],
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
            /* dragging towards the inline end goes forward, whichever way
               that is on screen */
            const travel = info.offset.x * dirSign(writing);
            if (travel < -70) go(1);
            else if (travel > 70) go(-1);
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* the parallax layer is composited on its own (`will-change`) so the
              moving photo never forces the text above it to re-rasterise —
              that repaint is what made the labels look like they were shaking */}
          <motion.div style={{ x, y }} className="absolute -inset-6 will-change-transform">
            <Photo src={banner.photo} className="scale-[1.03]" />
          </motion.div>

          {/* the only thing on the artwork: a black gradient rising from the
              bottom edge, which is what makes the two lines below legible */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/78 via-black/38 to-transparent" />

          {/* title + subtitle — editorial copy, so it reads in the interface
              language (the English source of truth lives in the data) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            /* `dir="auto"`: the two lines are demo copy and may be English,
               Persian or Korean, so they align by their own first strong
               character instead of inheriting the interface's direction.
               On phones the block sits higher than the centred indicator, so
               the two can never overlap on a narrow banner. */
            dir="auto"
            className="pointer-events-none absolute bottom-[3.6rem] start-4 max-w-[84%] min-[480px]:bottom-14 sm:bottom-7 sm:start-7 sm:max-w-[46%]"
          >
            <h2 className="font-display text-[19px] font-bold leading-[1.2] tracking-[-0.018em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] min-[480px]:text-[22px] sm:text-[24px] lg:text-[27px] lg:leading-[1.15]">
              {text(`banner.${banner.id}.title`, banner.title)}
            </h2>
            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-white/82 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] min-[480px]:text-[13px] lg:mt-2 lg:text-[14px]">
              {text(`banner.${banner.id}.subtitle`, banner.subtitle)}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* the one piece of chrome left: an indicator, centred on the
          bottom edge. Physical centring on purpose — `inset-x-0` + flex
          mirrors cleanly in RTL, while a logical half-offset would not. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center lg:bottom-5">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-surface/92 px-2.5 py-2 shadow-sm lg:gap-2 lg:px-3 lg:py-2.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={text(`banner.${b.id}.title`, b.title)}
              aria-current={i === index}
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
      </div>
    </div>
  );
}
