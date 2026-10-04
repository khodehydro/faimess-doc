import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import { SHARE_TARGETS, type ShareSubject } from "../data/share";
import { cn } from "../lib/cn";
import { spring } from "../lib/motion";
import { Photo } from "./Cover";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

/* ------------------------------------------------------------------ *
 *  Share one thing — a track, a playlist, an album or an artist.
 *
 *  Copy-to-clipboard first — that is what most people actually want — and
 *  the web intents underneath it. The canonical URL is shown as text as
 *  well, so a refused clipboard (http, or a locked-down browser) is never
 *  a dead end.
 * ------------------------------------------------------------------ */

export function ShareDialog({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  /** build it with `trackSubject()` or `librarySubject()` */
  subject: ShareSubject | null;
}) {
  const { t, dir } = usePreferences();
  const { notify } = useApp();
  const [copied, setCopied] = useState(false);

  /* a fresh sheet, not a fresh "copied ✓" from last time */
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!subject) return null;

  const { url, blurb } = subject;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify(t("share.copied"), "primary");
    } catch {
      /* clipboard blocked — the link in the sheet stays selectable */
      notify(t("share.copyNote"), "primary");
    }
  };

  const send = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
        <Icon name="share" size={19} strokeWidth={2} />
      </span>

      <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
        {t("share.title", { title: subject.title })}
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{t("share.body")}</p>

      <div className="mt-3.5 flex items-center gap-3.5 rounded-[16px] bg-subtle p-3">
        <span className="size-[46px] shrink-0 overflow-hidden rounded-[13px] shadow-xs">
          <Photo src={subject.photo} alt="" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold text-ink">{subject.title}</span>
          <span className="block truncate text-[12.5px] font-semibold text-ink-muted">
            {subject.subtitle}
          </span>
        </span>
      </div>

      {/* the link itself — always readable, always selectable */}
      <p
        dir="ltr"
        className="mt-3 truncate rounded-[12px] bg-subtle px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-muted"
      >
        {subject.urlLabel}
      </p>

      <motion.button
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        onClick={copy}
        className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-primary px-4 py-3 text-[13.5px] font-bold text-white shadow-primary"
      >
        <Icon name={copied ? "check" : "copy"} size={15} strokeWidth={2.2} />
        {copied ? t("share.copied") : t("share.copyLink")}
      </motion.button>

      <p className="mt-4 text-[12px] font-bold uppercase tracking-wider text-ink-faint">{t("share.via")}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SHARE_TARGETS.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => send(target.href(url, blurb))}
            className="flex items-center gap-2 rounded-full border border-line/80 px-3.5 py-2.5 text-[12.5px] font-bold text-ink-body transition-colors hover:border-primary/30 hover:bg-primary-faint hover:text-primary-deep"
          >
            {t(target.labelKey)}
            {/* the "opens elsewhere" arrow mirrors itself in RTL — see Icon */}
            <Icon name="arrowUpRight" size={12.5} strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </Modal>
  );
}
