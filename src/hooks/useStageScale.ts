import { useEffect, useState } from "react";
import { STAGE } from "../lib/stage";

type Options = {
  width: number;
  height: number;
  padding?: number;
  maxScale?: number;
  /** below this viewport width we stop scaling and let the page flow */
  breakpoint?: number;
};

function computeStageScale(
  width: number,
  height: number,
  padding: number,
  maxScale: number,
  breakpoint: number,
) {
  if (typeof window === "undefined") {
    return { scale: 1, fixed: true };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fixed = vw >= breakpoint;
  if (!fixed) {
    return { scale: 1, fixed: false };
  }
  const scale = Math.min((vw - padding * 2) / width, (vh - padding * 2) / height, maxScale);
  return { scale, fixed: true };
}

/**
 * Fits a fixed art-board into the viewport.
 * Returns `scale` (uniform) and `isFixed` (false on small screens, where the
 * layout stacks and scrolls instead of being scaled).
 */
export function useStageScale({
  width,
  height,
  padding = STAGE.padding,
  maxScale = STAGE.maxScale,
  breakpoint = 1024,
}: Options) {
  const [state, setState] = useState(() =>
    computeStageScale(width, height, padding, maxScale, breakpoint),
  );

  useEffect(() => {
    const compute = () => {
      const next = computeStageScale(width, height, padding, maxScale, breakpoint);
      setState((prev) => (prev.scale === next.scale && prev.fixed === next.fixed ? prev : next));
    };

    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [width, height, padding, maxScale, breakpoint]);

  return state;
}
