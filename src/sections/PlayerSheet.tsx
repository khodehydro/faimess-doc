import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayerSection } from "./PlayerSection";
import { useT } from "../app/PreferencesContext";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The full player, as a sheet over the whole screen.
 *
 *  On desktop the player is a card that never leaves the layout. On a
 *  phone there is no room for that, so the same card (PlayerSection, not a
 *  copy of it) slides up over everything and goes back down when asked —
 *  including with the Escape key, because a sheet you can only close with
 *  one finger is a trap on a desktop browser sized to a phone.
 *
 *  The card's own collapse button doubles as the sheet's close button:
 *  `onToggleExpand` is wired to close, which is exactly what "collapse"
 *  means when the player is already big.
 * ------------------------------------------------------------------ */

export function PlayerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock underlying background and content container from scrolling while player sheet is open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const contentScroll = document.querySelector("[data-content-scroll]") as HTMLElement | null;
    const origContentOverflow = contentScroll ? contentScroll.style.overflow : undefined;
    if (contentScroll) {
      contentScroll.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      if (contentScroll && origContentOverflow !== undefined) {
        contentScroll.style.overflow = origContentOverflow;
      }
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="studio-backdrop fixed inset-0 z-[60] flex flex-col p-2.5 overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label={t("player.openFull")}
        >
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="mx-auto flex min-h-0 w-full max-w-[620px] flex-1 flex-col overflow-hidden rounded-card bg-surface shadow-float"
          >
            <PlayerSection params={{ expanded: true, onToggleExpand: onClose }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
