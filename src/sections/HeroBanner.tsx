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
import { Icon, type IconName } from "../ui/Icon";
import { banners } from "../data/banners";
import { cn } from "../lib/cn";
import { EASE } from "../lib/motion";
import { usePreferences } from "../app/PreferencesContext";
import { backIcon, dirSign, forwardIcon } from "../lib/rtl";

const AUTOPLAY_MS = 7000;

/* ------------------------------------------------------------------ *
 *  Home hero — a full-bleed photograph per slide (data/banners.ts) with
 *  exactly two controls: a frosted rail down each side of the banner,
 *  previous on the inline start, next on the inline end. No cards, no
 *  badges, no dots — the artwork and the two arrows are the whole banner.
 *  Add an entry to the data and it becomes a new slide.
 * ------------------------------------------------------------------ */

export function HeroBanner() {
  const { t, dir: writing } = usePreferences();
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

          {/* the artwork is the whole slide; only its accessible name is left */}
          <span className="sr-only">{banner.title}</span>
        </motion.div>
      </AnimatePresence>

      {/* The banner's only chrome: one rail per side, as tall as the banner
          itself. The arrow rides on its own chip above the glass, so the
          parallax moving the photo behind it can't drag the glyph around. */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-stretch justify-between">
        <GlassStep
          side="start"
          icon={backIcon(writing)}
          label={t("hero.prev")}
          onClick={() => go(-1)}
        />
        <GlassStep
          side="end"
          icon={forwardIcon(writing)}
          label={t("hero.next")}
          onClick={() => go(1)}
        />
      </div>
    </div>
  );
}

/* -------------------------------- the rails ----------------------------- */

/**
 * A full-height frosted rail. `side` is the *inline* side it hugs, so the two
 * swap places with the writing direction while previous / next keep meaning.
 */
function GlassStep({
  side,
  icon,
  label,
  onClick,
}: {
  side: "start" | "end";
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group pointer-events-auto flex w-[50px] self-stretch items-center justify-center bg-white/10 backdrop-blur-xl transition-colors duration-300 hover:bg-white/20 lg:w-[70px]",
        side === "start" ? "border-e border-white/15" : "border-s border-white/15",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:bg-white/30 group-hover:ring-white/45 lg:size-11">
        <Icon name={icon} size={19} strokeWidth={2.2} />
      </span>
    </motion.button>
  );
}
