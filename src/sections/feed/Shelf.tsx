import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";
import { useT } from "../../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Shelf — the building block of the feed.
 *  A sticky title bar plus whatever content the shelf needs, so shelves
 *  can be reordered, added or removed without touching one another.
 * ------------------------------------------------------------------ */

/**
 * The chip strip writes its measured height into this custom property on
 * the feed's root element; a shelf header reads it back so the two stick
 * as one block. The fallback is only used before the first measurement
 * (and on the server, where nothing is sticky anyway).
 */
export const SHELF_STICKY_VAR = "--chip-strip-top";
export const SHELF_STICKY_FALLBACK = "48px";
const STICKY_TOP = `var(${SHELF_STICKY_VAR}, ${SHELF_STICKY_FALLBACK})`;

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
    <section
      id={id}
      className={cn("relative", className)}
      style={{ scrollMarginTop: STICKY_TOP }}
    >
      <header
        className="sticky z-20 -mx-4 flex items-center gap-3 bg-surface/94 px-4 py-3 backdrop-blur-md"
        style={{ top: STICKY_TOP }}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-faint text-primary-deep">
          <Icon name={icon} size={16} strokeWidth={1.9} />
        </span>
        <h3 className="font-display text-[18px] font-bold tracking-[-0.012em] text-ink">{title}</h3>
        {hint && <span className="text-[13px] font-medium text-ink-muted">{hint}</span>}
        {action && <span className="ms-auto">{action}</span>}
      </header>

      <div className="pb-6">{children}</div>
    </section>
  );
}

/** horizontal, snapping row used by the artists / albums / fans shelves */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scroll-slim flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2", className)}>
      {children}
    </div>
  );
}

/** circular “Play” affordance that appears on hover of any cover */
export function PlayDot({ onClick, className }: { onClick: (e: React.MouseEvent) => void; className?: string }) {
  const t = useT();

  return (
    <motion.span
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      role="button"
      aria-label={t("shelf.play")}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-primary",
        className,
      )}
    >
      <Icon name="play" size={14.5} strokeWidth={2} />
    </motion.span>
  );
}
