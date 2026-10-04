import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { useT } from "../app/PreferencesContext";
import { cn } from "../lib/cn";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Modal — a centred dialog above everything else.
 *
 *  Rendered through a portal so the cards' `overflow-hidden` can never clip
 *  it, and so it lives in real screen pixels instead of the stage scale. Its
 *  layer sits above the full player sheet, so nested dialogs stay on top.
 *  Mounted on the client only: the server render emits nothing.
 * ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  children,
  width = 392,
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** max panel width in px */
  width?: number;
  /** drop the default padding + close button — the caller brings its own chrome */
  bare?: boolean;
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  /* Esc closes, like any dialog */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE }}
            className={cn(
              "relative w-full rounded-card bg-surface shadow-float",
              bare ? "overflow-hidden" : "scroll-slim max-h-[calc(100vh-48px)] overflow-y-auto p-6",
            )}
            style={{ maxWidth: width }}
          >
            {!bare && (
              <button
                onClick={onClose}
                aria-label={t("ui.close")}
                className="absolute end-3.5 top-3.5 flex size-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={15} strokeWidth={2} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
