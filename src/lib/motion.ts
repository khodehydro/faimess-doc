import type { Transition, Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };

/** Entrance used across the whole screen: rise + fade. */
export const rise = (delay = 0, distance = 16): Variants => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: EASE } },
});

export const staggerParent: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const popChild: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/** micro-interaction for anything tappable */
export const tap = { whileHover: { y: -2 }, whileTap: { scale: 0.97 } };
