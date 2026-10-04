import type { Transition, Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.8,
};

/** Entrance used across the whole screen: rise + fade. */
export const rise = (delay = 0, distance = 16): Variants => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: EASE } },
});

export const staggerParent = (delay = 0.1): Variants => ({
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: delay } },
});

export const popChild: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/** micro-interaction for anything tappable */
export const tap = { whileHover: { y: -2 }, whileTap: { scale: 0.97 } };
