import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logoUrl from "../assets/brand/faimess-logo.png";
import { COMPACT_QUERY } from "../hooks/useCompact";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Splash — the mobile boot screen.
 *
 *  On a phone the app opens the way a native one would: a full-screen
 *  sheet in the brand purple (`--color-primary`, #8267f0 — the exact
 *  field colour of the mark itself), the cat centred, the team name
 *  under it and the app's name against the bottom edge. After a beat
 *  the sheet fades out and the dashboard is already underneath.
 *
 *  It is a *simulator*, exactly as asked: the compact layout only. The
 *  desktop art-board boots straight into the app, and the sheet never
 *  renders on the server.
 * ------------------------------------------------------------------ */

const HOLD_MS = 1500; // how long the sheet stays up once the app is live
const FAILSAFE_MS = 5000; // hard unmount if anything else misbehaves

export function Splash() {
  /* decided synchronously so a phone never paints a frame without the
     sheet; `window` is absent on the server, where it simply stays off */
  const [visible, setVisible] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches,
  );
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const hold = window.setTimeout(() => setLeaving(true), HOLD_MS);
    const failsafe = window.setTimeout(() => setVisible(false), FAILSAFE_MS);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(failsafe);
    };
  }, [visible]);

  return (
    <AnimatePresence onExitComplete={() => setVisible(false)}>
      {/* the child leaves the tree when `leaving` flips; AnimatePresence then
          plays the fade and reports back through onExitComplete */}
      {visible && !leaving && (
        <motion.div
          key="splash"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-primary"
          aria-hidden="true"
        >
          <motion.img
            src={logoUrl}
            alt=""
            draggable={false}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="size-[104px] select-none rounded-[34px] shadow-float"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
            className="mt-6 font-display text-[15px] font-extrabold uppercase tracking-[0.34em] text-white"
          >
            HYDRO team
          </motion.p>

          {/* the app's own name rests on the very bottom edge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="absolute inset-x-0 bottom-0 pb-[calc(12px+env(safe-area-inset-bottom))] text-center font-display text-[12px] font-bold tracking-[0.3em] text-white/70"
          >
            FAIMESS
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
