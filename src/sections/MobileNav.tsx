import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { navItems } from "../data/navigation";
import { useApp } from "../app/AppContext";
import { useT } from "../app/PreferencesContext";
import { cn } from "../lib/cn";
import { spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The main menu, phone edition.
 *
 *  Same five destinations as the desktop pill, moved to the bottom of the
 *  screen where a thumb can reach them. The active tab wears the same mark
 *  it does everywhere: purple icon + label, no background — plus the rule
 *  underneath, because this menu *is* the bottom bar (see the note in
 *  NavCard.tsx about which menu gets the line).
 * ------------------------------------------------------------------ */

export function MobileNav() {
  const t = useT();
  const { route, navigate } = useApp();

  return (
    <nav
      aria-label={t("nav.primary")}
      className="pointer-events-auto w-full rounded-[24px] bg-surface/95 p-1.5 shadow-float ring-1 ring-black/[0.04] backdrop-blur-md dark:ring-white/[0.06]"
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = route === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.id)}
              whileTap={{ scale: 0.94 }}
              transition={spring}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-[18px] px-1 pb-1.5 pt-2 text-[12px] font-semibold transition-colors",
                isActive ? "text-primary-deep" : "text-ink-muted",
              )}
            >
              <Icon name={item.icon} size={19} strokeWidth={isActive ? 2 : 1.7} />
              <span className="max-w-full truncate">{t(`nav.${item.id}`)}</span>
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-rule"
                  transition={spring}
                  className="absolute bottom-0 h-[2.5px] w-7 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
