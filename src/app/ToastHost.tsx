import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { cn } from "../lib/cn";
import { spring } from "../lib/motion";
import { useApp } from "./AppContext";

/** Transient confirmations. Rendered outside the scaled stage, in viewport space. */
export function ToastHost() {
  const { toasts } = useApp();

  return (
    /* physical centring on purpose: a logical half-offset plus the negative
       translate would push the whole stack a toast-width off-centre in RTL */
    <div className="pointer-events-none fixed left-1/2 top-5 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={spring}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-surface/95 py-2 ps-3 pe-4 text-[13.5px] font-semibold text-ink shadow-float ring-1 ring-black/[0.04] dark:ring-white/[0.06] backdrop-blur"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-white",
                t.tone === "primary" && "bg-primary",
                t.tone === "teal" && "bg-teal",
                t.tone === "mint" && "bg-mint",
              )}
            >
              <Icon name="check" size={12.5} strokeWidth={2.8} />
            </span>
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
