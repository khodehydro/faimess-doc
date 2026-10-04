import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf — the building block of the feed.
 *  A sticky title bar plus whatever content the shelf needs, so shelves
 *  can be reordered, added or removed without touching one another.
 * ------------------------------------------------------------------ */

/** shelf headers stick to the top edge of the scroll port */
export const SHELF_STICKY_TOP = 0;

export function Shelf({
  id,
  icon,
  title,
  hint,
  action,
  children,
  className,
}: {
  id: string;
  icon: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative", className)}>
      <header
        className="sticky z-20 -mx-5 flex items-center gap-2.5 bg-surface/94 px-5 py-2.5 backdrop-blur-md"
        style={{ top: SHELF_STICKY_TOP }}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-faint text-primary-deep">
          <Icon name={icon} size={14} strokeWidth={1.9} />
        </span>
        <h3 className="font-display text-[15px] font-bold tracking-[-0.025em] text-ink">{title}</h3>
        {hint && <span className="text-[10.5px] font-medium text-ink-muted">{hint}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </header>

      <div className="pb-5">{children}</div>
    </section>
  );
}

/** horizontal, snapping row used by the artists / albums / fans shelves */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scroll-slim flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1", className)}>
      {children}
    </div>
  );
}

/** circular “Play” affordance that appears on hover of any cover */
export function PlayDot({ onClick, className }: { onClick: (e: React.MouseEvent) => void; className?: string }) {
  return (
    <motion.span
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      role="button"
      aria-label="Play"
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-primary",
        className,
      )}
    >
      <Icon name="play" size={13} strokeWidth={2} />
    </motion.span>
  );
}
