import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import { useContributions } from "../app/ContributionsContext";
import { LYRIC_REWARD } from "../data/lyrics";
import { cn } from "../lib/cn";
import { spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Your contributions — the fan side of the lyric desk.
 *
 *  Every sheet a listener sends lands here with its review status. The
 *  approve/send-back pair under a pending sheet stands in for the
 *  editorial desk: this build has no admin surface, so tapping it is
 *  what a moderator would otherwise do from their own console.
 * ------------------------------------------------------------------ */

export function ContributionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useApp();
  const { t, locale, dataLabel } = usePreferences();
  const { submissions, points, approve, reject } = useContributions();

  const pending = submissions.filter((s) => s.status === "pending").length;

  return (
    <Modal open={open} onClose={onClose} width={430}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
          <Icon name="medal" size={19} strokeWidth={2.1} />
        </span>
        <span className="min-w-0">
          <h2 className="font-display block truncate text-[17px] font-bold leading-snug text-ink">
            {t("contrib.title")}
          </h2>
          <span className="block text-[12.5px] font-semibold text-ink-muted">
            {pending > 0 ? t("contrib.waiting", { n: pending }) : t("contrib.allReviewed")}
          </span>
        </span>
      </div>

      {/* points */}
      <div className="mt-3.5 flex items-center gap-3.5 rounded-panel bg-primary-faint/70 px-4 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-primary">
          <Icon name="star" size={17} strokeWidth={2.1} />
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-bold uppercase tracking-wider text-ink-faint">
            {t("contrib.points")}
          </span>
          <span className="font-display block text-[19px] font-extrabold tabular-nums leading-tight text-ink">
            {points.toLocaleString(locale)}
          </span>
        </span>
        <span className="ms-auto shrink-0 rounded-full bg-surface px-3 py-1.5 text-[12px] font-bold text-primary-deep ring-1 ring-primary/15">
          {t("contrib.reward", { n: LYRIC_REWARD })}
        </span>
      </div>

      {/* sheets */}
      <div className="scroll-slim mt-3.5 max-h-[264px] overflow-y-auto pe-0.5">
        {submissions.length === 0 ? (
          <p className="rounded-panel bg-subtle px-3.5 py-5 text-center text-[12.5px] leading-relaxed text-ink-muted">
            {t("contrib.empty")}
          </p>
        ) : (
          submissions.map((s) => {
            const tone =
              s.status === "approved"
                ? "bg-mint-soft text-teal-deep"
                : s.status === "pending"
                  ? "bg-primary-soft text-primary-deep"
                  : "bg-subtle text-ink-muted";
            const label = t(
              s.status === "approved"
                ? "contrib.approved"
                : s.status === "pending"
                  ? "contrib.pending"
                  : "contrib.returned",
            );

            return (
              <div key={s.id} className="mb-2 rounded-panel bg-surface px-3.5 py-3 ring-1 ring-line">
                <div className="flex items-center gap-2.5">
                  <span className="min-w-0 truncate text-[13.5px] font-bold text-ink">{s.trackTitle}</span>
                  <span className={cn("ms-auto shrink-0 rounded-full px-2.5 py-1 text-[12px] font-extrabold", tone)}>
                    {label}
                  </span>
                </div>

                {/* one line, always: the middle truncates before the payout
                    or the language chip can ever move */}
                <div className="mt-2 flex items-center gap-2.5 text-[12px] font-semibold text-ink-muted">
                  <span className="shrink-0 rounded-full bg-subtle px-2.5 py-1">{dataLabel(s.language)}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {t("contrib.lines", { n: s.lines })}
                    <span className="text-ink-faint"> · {dataLabel(s.sentAt)}</span>
                  </span>
                  {s.status === "approved" && (
                    <span className="shrink-0 font-extrabold text-teal-deep">
                      {t("contrib.pts", { n: s.points })}
                    </span>
                  )}
                </div>

                {s.status === "pending" && (
                  <div className="mt-2.5 flex items-center gap-2.5 rounded-[14px] border border-dashed border-line-strong px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                      <Icon name="lock" size={11.5} />
                      {t("contrib.moderatorView")}
                    </span>
                    <span className="ms-auto flex shrink-0 items-center gap-2">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        transition={spring}
                        onClick={() => {
                          approve(s.id);
                          notify(t("contrib.approvedToast", { n: LYRIC_REWARD }), "mint");
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-white shadow-primary"
                      >
                        <Icon name="check" size={12} strokeWidth={2.8} />
                        {t("contrib.approve")}
                      </motion.button>
                      <button
                        onClick={() => {
                          reject(s.id);
                          notify(t("contrib.returnedToast"), "teal");
                        }}
                        className="rounded-full px-2.5 py-2 text-[12px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
                      >
                        {t("contrib.sendBack")}
                      </button>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
        {t("contrib.footnote")}
      </p>

      <motion.button
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        onClick={onClose}
        className="mt-3.5 rounded-[14px] bg-primary px-4 py-3 text-[13.5px] font-bold text-white shadow-primary"
      >
        {t("contrib.done")}
      </motion.button>
    </Modal>
  );
}
