import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Modal } from "./Modal";
import { Icon, type IconName } from "./Icon";
import { useT } from "../app/PreferencesContext";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ *
 *  ConfirmDialog — the shape of "are you sure?".
 *
 *  One dialog for every destructive row in the app (`Sign out` today, any
 *  future "delete playlist"): a tone-marked icon, the question, a line that
 *  says what survives, and the two answers with the safe one first. It is
 *  *not* an inline rewrite of Modal — it is a Modal, so it inherits the
 *  portal, the Escape key, the backdrop click and the layer above the
 *  player sheet.
 * ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmKey,
  cancelKey,
  icon = "lock",
  tone = "flame",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body?: string;
  /** the confirm button's label */
  confirmKey: string;
  /** the way out */
  cancelKey: string;
  icon?: IconName;
  tone?: "flame" | "primary";
}) {
  const t = useT();

  return (
    <Modal open={open} onClose={onClose} width={364}>
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            tone === "flame" ? "bg-flame-soft text-flame-deep" : "bg-primary-soft text-primary-deep",
          )}
        >
          <Icon name={icon} size={19} strokeWidth={2.1} />
        </span>

        <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">{title}</h2>
        {body && (
          <p className="mt-2 max-w-[290px] text-[12.5px] leading-relaxed text-ink-muted">{body}</p>
        )}

        <div className="mt-5 flex w-full flex-col gap-2">
          <motion.button
            type="button"
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex h-[44px] items-center justify-center gap-2 rounded-[13px] text-[13.5px] font-bold text-white",
              tone === "flame" ? "bg-flame shadow-primary" : "bg-primary shadow-primary",
            )}
          >
            {t(confirmKey)}
          </motion.button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[44px] items-center justify-center rounded-[13px] bg-subtle text-[13.5px] font-bold text-ink-body transition-colors hover:bg-muted hover:text-ink"
          >
            {t(cancelKey)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** the same look, for callers that want to place their own body under it */
export function ConfirmBody({ children }: { children: ReactNode }) {
  return <div className="mt-2 max-w-[290px] text-[12.5px] leading-relaxed text-ink-muted">{children}</div>;
}
