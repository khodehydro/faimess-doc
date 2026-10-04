import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { navItems } from "../data/navigation";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";
import { useT } from "../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Card 2 — main menu.
 *  A pill holding the page switcher; the active item is a filled pill
 *  that slides between items.
 * ------------------------------------------------------------------ */

export function NavCard() {
  const t = useT();
  const { route, navigate } = useApp();

  return (
    <nav className="flex h-[62px] shrink-0 items-center gap-0.5 rounded-full bg-surface p-2 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
      {navItems.map((item, i) => {
        const isActive = route === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.id)}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 * i, ease: EASE }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative flex items-center gap-2.5 rounded-full px-4.5 py-2.5 text-[14.5px] font-semibold transition-colors",
              isActive ? "text-white" : "text-ink-body hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                transition={spring}
                className="absolute inset-0 rounded-full bg-primary shadow-primary"
              />
            )}
            <span className="relative flex items-center gap-2.5">
              <Icon name={item.icon} size={16} strokeWidth={isActive ? 1.9 : 1.6} />
              {t(`nav.${item.id}`)}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
