import { useCallback, useRef, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { STAGE } from "../lib/stage";
import { useStageScale } from "../hooks/useStageScale";

/**
 * Desktop: the app is drawn on one fixed 1680×930 art-board that is
 * uniformly scaled to fit the viewport — so the composition never
 * reflows and the page never scrolls.
 *
 * Below 1024px: no scaling, the page stacks and scrolls normally.
 */
export function Stage({ children }: { children: ReactNode }) {
  const { scale, fixed } = useStageScale({ width: STAGE.width, height: STAGE.height });
  const innerRef = useRef<HTMLDivElement>(null);

  /**
   * Pointer coordinates arrive in page space; framer needs them in the
   * stage's local space so hover/drag stay 1:1 while the stage is scaled.
   */
  const transformPagePoint = useCallback(
    (point: { x: number; y: number }) => {
      const rect = innerRef.current?.getBoundingClientRect();
      if (!rect || !scale) return point;
      return { x: (point.x - rect.left) / scale, y: (point.y - rect.top) / scale };
    },
    [scale],
  );

  if (!fixed) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="studio-backdrop min-h-dvh w-full">{children}</div>
      </MotionConfig>
    );
  }

  return (
    <div className="studio-backdrop flex h-dvh w-full items-center justify-center overflow-hidden">
      <div className="relative" style={{ width: STAGE.width * scale, height: STAGE.height * scale }}>
        <div
          ref={innerRef}
          /* Pinned physically on purpose: the board is scaled about its own
             top-left corner, so a logical `start-0` would drag the whole app
             off-centre (and past the right edge) as soon as the document turns
             RTL. Geometry is never mirrored — only text is. */
          className="absolute left-0 top-0"
          style={{
            width: STAGE.width,
            height: STAGE.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <MotionConfig reducedMotion="user" transformPagePoint={transformPagePoint}>
            {children}
          </MotionConfig>
        </div>
      </div>
    </div>
  );
}
