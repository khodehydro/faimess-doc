import { motion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { useApp } from "../app/AppContext";
import { EASE } from "../lib/motion";
import { useT } from "../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Card 1 — brand.
 *  A pill: both ends are perfect semicircles (rounded-full).
 * ------------------------------------------------------------------ */

export function BrandCard() {
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
      className="flex h-[62px] shrink-0 items-center gap-2.5 rounded-full bg-surface px-4 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
    >
      <Logo size={34} />
      <span className="font-display text-[21px] font-extrabold tracking-[-0.022em] text-ink">FAIMESS</span>
    </motion.button>
  );
}
