import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Photo } from "../../ui/Cover";
import { newsItems, type NewsItem } from "../../data/feed";
import { cn } from "../../lib/cn";
import { EASE } from "../../lib/motion";
import { usePreferences } from "../../app/PreferencesContext";
import { dirSign } from "../../lib/rtl";
import { useApp } from "../../app/AppContext";

const AUTOPLAY_MS = 6000;

const TAG_TONE: Record<string, string> = {
  Comeback: "bg-primary-soft text-primary-deep",
  Tour: "bg-teal-soft text-teal-deep",
  Charts: "bg-mint-soft text-teal-deep",
  Editorial: "bg-muted text-ink-body",
  Awards: "bg-flame-soft text-flame-deep",
};

/**
 * Top News Carousel — featured stories rotating with photography and headlines.
 */
export function NewsHeroBanner() {
  const { t, dir: writing, dataLabel, text } = usePreferences();
  const { openNews } = useApp();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Take the top featured stories (e.g. nw1, nw2, nw6)
  const slides = useMemo(() => [newsItems[0], newsItems[1], newsItems[5]], []);
  const current = slides[index] ?? slides[0];

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i + step + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, go]);

  const reduceMotion = useReducedMotion();
  const reach = reduceMotion ? 0 : 8;
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
      className="relative h-[220px] w-full select-none overflow-hidden rounded-[18px] bg-ink shadow-card ring-1 ring-line/60 lg:h-[280px]"
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={current.id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: EASE }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const travel = info.offset.x * dirSign(writing);
            if (travel < -70) go(1);
            else if (travel > 70) go(-1);
          }}
          onClick={() => openNews(current.id)}
          className="absolute inset-0 cursor-pointer"
        >
          <motion.div style={{ x, y }} className="absolute -inset-6 will-change-transform">
            <Photo src={current.photo} className="scale-[1.03]" />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          <div className="absolute start-3 top-3 z-10 flex items-center gap-2 lg:start-4 lg:top-4">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[12px] font-bold tracking-wide backdrop-blur-md",
                TAG_TONE[current.tag] ?? "bg-surface/90 text-ink",
              )}
            >
              {dataLabel(current.tag)}
            </span>
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-bold text-white/90 backdrop-blur-md">
              {t("news.featuredBadge")}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="absolute inset-x-0 bottom-0 p-4 text-start lg:p-6"
          >
            <h3 className="font-display max-w-[620px] text-[17px] font-bold leading-snug tracking-[-0.015em] text-white drop-shadow-sm lg:text-[22px]">
              {text(`news.${current.id}.title`, current.title)}
            </h3>
            <p className="mt-1 line-clamp-2 max-w-[540px] text-[12.5px] text-white/80 lg:text-[13.5px]">
              {text(`news.${current.id}.excerpt`, current.excerpt)}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-20 flex justify-center gap-1.5 lg:bottom-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "pointer-events-auto h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
