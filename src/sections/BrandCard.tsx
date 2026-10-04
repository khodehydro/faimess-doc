import { motion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { useApp } from "../app/AppContext";
import { EASE } from "../lib/motion";
import { useT } from "../app/PreferencesContext";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ *
 *  Card 1 — brand.
 *  A pill: both ends are perfect semicircles (rounded-full).
 * ------------------------------------------------------------------ */

export function BrandCard({ compact = false }: { compact?: boolean } = {}) {
  const t = useT();
  const { navigate } = useApp();

  return (
    <motion.button
      onClick={() => navigate("home")}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-label={t("brand.home")}
      className={cn(
        "flex shrink-0 items-center rounded-full shadow-card ring-1",
        compact
          ? "bg-white/80 ring-white/70 backdrop-blur-md dark:bg-surface/80 dark:ring-white/[0.06]"
          : "bg-surface ring-black/[0.03] dark:ring-white/[0.05]",
        /* the compact header is a tighter glass pill: it has to sit dead centre
           between the edge of the screen and the controls beside it, and
           the full-size wordmark collides with them under ~400px */
        compact ? "h-[56px] gap-2 px-3" : "h-[62px] gap-3 px-4.5",
      )}
    >
      <Logo size={compact ? 24 : 34} />
      <span
        className={cn(
          "font-display font-extrabold tracking-[-0.022em] text-ink",
          compact
            ? "text-[16px] max-[374px]:hidden"
            : "text-[21px]",
        )}
      >
        FAIMESS
      </span>
    </motion.button>
  );
}
