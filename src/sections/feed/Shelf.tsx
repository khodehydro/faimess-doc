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
        /* Phones and tablets keep this on one row: the title (and its hint)
           are the flexible part and truncate, the action is fixed on the
           inline end. It used to let the action fall onto a line of its own
           — “Play all” ended up under the title on every narrow screen. The
           type is a step smaller under 1024px for the same reason. */
        className="sticky z-20 -mx-4 flex flex-nowrap items-center gap-x-2 bg-surface/94 px-4 py-2.5 backdrop-blur-md min-[420px]:gap-x-2.5 lg:flex-wrap lg:gap-x-3 lg:py-3"
        style={{ top: STICKY_TOP }}
      >
        <span className="hidden size-7 shrink-0 items-center justify-center rounded-full bg-primary-faint text-primary-deep min-[420px]:flex lg:size-8">
          <Icon name={icon} size={15} strokeWidth={1.9} className="lg:hidden" />
          <Icon name={icon} size={16} strokeWidth={1.9} className="hidden lg:block" />
        </span>
        <div className={cn("min-w-0 flex-1", hint && "sm:flex sm:items-center sm:gap-3")}>
          <h3 className="min-w-0 truncate whitespace-nowrap font-display text-[15.5px] font-bold tracking-[-0.012em] text-ink lg:text-lg">
            {title}
          </h3>
          {hint && (
            <span className="mt-0.5 hidden min-w-0 truncate whitespace-nowrap text-[12px] font-medium text-ink-muted min-[420px]:block sm:mt-0 sm:text-sm">
              {hint}
            </span>
          )}
        </div>
        {action && (
          <span className="ms-auto flex shrink-0 items-center">{action}</span>
        )}
      </header>

      <div className="pb-5 lg:pb-6">{children}</div>
    </section>
  );
}

/** horizontal, snapping row used by the artists / albums / fans shelves */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scroll-rail flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:gap-3.5", className)}>
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
