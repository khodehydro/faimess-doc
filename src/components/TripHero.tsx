import { useRef, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MapScene, SunsetScene } from "./Scenes";
import { AvatarStack } from "./Avatar";
import { CircleButton, Meta } from "./ui";
import { activeTrip } from "../lib/data";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Hero — the active trip. Illustration with a gentle pointer parallax,
 *  a glassy detail card, and the social layer (travellers + alerts).
 * ------------------------------------------------------------------ */

export function TripHero({ onToast }: { onToast: (text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 90, damping: 20 });
  const y = useSpring(useTransform(my, [-1, 1], [-8, 8]), { stiffness: 90, damping: 20 });

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative h-[300px] overflow-hidden rounded-card bg-coral-soft"
    >
      {/* illustration */}
      <motion.div style={{ x, y }} className="absolute -inset-6">
        <SunsetScene className="h-full w-full" />
      </motion.div>

      {/* soft top scrim so the chips stay legible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />

      {/* travellers + alerts */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
        className="absolute right-5 top-5 flex items-center gap-3"
      >
        <div className="flex items-center rounded-full bg-white/70 p-1.5 pl-2 backdrop-blur-md">
          <AvatarStack seeds={[1, 3, 4]} more={activeTrip.guests} size={28} />
        </div>
        <div className="group">
          <CircleButton
            icon="bell"
            tone="white"
            label="Trip alerts"
            iconClassName="anim-bell"
            className="bg-white/85 backdrop-blur-md"
            onClick={() => onToast("Trip alerts are up to date")}
          />
        </div>
      </motion.div>

      {/* floating trip card */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.25, ease: EASE }}
        className="absolute bottom-6 left-5 flex items-end gap-3"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={spring}
          className="w-[262px] rounded-[20px] bg-white/92 p-3 shadow-float backdrop-blur-md"
        >
          <h3 className="px-0.5 text-[15px] font-bold tracking-[-0.02em] text-ink">
            {activeTrip.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 px-0.5 text-[11px] font-medium">
            <Meta icon="calendar">{activeTrip.dateRange}</Meta>
            <Meta icon="clock">{activeTrip.time}</Meta>
          </div>
          <div className="mt-2.5 h-[104px] overflow-hidden rounded-[14px] ring-1 ring-line">
            <MapScene className="h-full w-full" />
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, ...spring }}
          whileHover={{ y: -3, rotate: -4 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onToast(`${activeTrip.folderLabel} · saved`)}
          aria-label={activeTrip.folderLabel}
          title={activeTrip.folderLabel}
          className="mb-7 flex size-11 items-center justify-center rounded-full bg-ink text-white shadow-float"
        >
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.2 7.6A2.6 2.6 0 0 1 5.8 5h2.8a2 2 0 0 1 1.6.82l.9 1.18h6.9a2.6 2.6 0 0 1 2.6 2.6v7.8a2.6 2.6 0 0 1-2.6 2.6H5.8a2.6 2.6 0 0 1-2.6-2.6z" />
            </svg>
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
