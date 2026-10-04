import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { useApp } from "../app/AppContext";
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
  const { submissions, points, approve, reject } = useContributions();

  const pending = submissions.filter((s) => s.status === "pending").length;

  return (
    <Modal open={open} onClose={onClose} width={430}>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
          <Icon name="medal" size={19} strokeWidth={2.1} />
        </span>
        <span className="min-w-0">
          <h2 className="font-display block truncate text-[17px] font-bold leading-snug text-ink">
            Your contributions
          </h2>
          <span className="block text-[12.5px] font-semibold text-ink-muted">
            {pending > 0 ? `${pending} sheet${pending > 1 ? "s" : ""} waiting on a moderator` : "All sheets reviewed"}
          </span>
        </span>
      </div>

      {/* points */}
      <div className="mt-3 flex items-center gap-3 rounded-panel bg-primary-faint/70 px-3.5 py-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-primary">
          <Icon name="star" size={17} strokeWidth={2.1} />
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-bold uppercase tracking-wider text-ink-faint">Fan points</span>
          <span className="font-display block text-[19px] font-extrabold tabular-nums leading-tight text-ink">
            {points.toLocaleString("en-US")}
          </span>
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-surface px-2.5 py-1 text-[12px] font-bold text-primary-deep ring-1 ring-primary/15">
          +{LYRIC_REWARD} per approved sheet
        </span>
      </div>

      {/* sheets */}
      <div className="scroll-slim mt-3 max-h-[264px] overflow-y-auto pr-0.5">
        {submissions.length === 0 ? (
          <p className="rounded-panel bg-subtle px-3 py-5 text-center text-[12.5px] leading-relaxed text-ink-muted">
            Nothing sent yet. Open a track that has no lyrics, hit{" "}
            <span className="font-bold text-ink-body">Send the lyrics</span>, and it shows up here.
          </p>
        ) : (
          submissions.map((s) => {
            const tone =
              s.status === "approved"
                ? "bg-mint-soft text-teal-deep"
                : s.status === "pending"
                  ? "bg-primary-soft text-primary-deep"
                  : "bg-subtle text-ink-muted";
            const label =
              s.status === "approved" ? "Approved" : s.status === "pending" ? "Pending review" : "Sent back";

            return (
              <div key={s.id} className="mb-1.5 rounded-panel bg-surface px-3 py-2.5 ring-1 ring-line">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-[13.5px] font-bold text-ink">{s.trackTitle}</span>
                  <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-extrabold", tone)}>
                    {label}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-ink-muted">
                  <span className="rounded-full bg-subtle px-2 py-0.5">{s.language}</span>
                  <span>{s.lines} lines</span>
                  <span className="text-ink-faint">· {s.sentAt}</span>
                  {s.status === "approved" && (
                    <span className="ml-auto font-extrabold text-teal-deep">+{s.points} pts</span>
                  )}
                </div>

                {s.status === "pending" && (
                  <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-dashed border-line-strong px-2.5 py-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-ink-faint">
                      <Icon name="lock" size={11.5} />
                      Moderator view
                    </span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        transition={spring}
                        onClick={() => {
                          approve(s.id);
                          notify(`Sheet approved — +${LYRIC_REWARD} points`, "mint");
                        }}
                        className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[12px] font-bold text-white shadow-primary"
                      >
                        <Icon name="check" size={12} strokeWidth={2.8} />
                        Approve
                      </motion.button>
                      <button
                        onClick={() => {
                          reject(s.id);
                          notify("Sheet sent back for a fix", "teal");
                        }}
                        className="rounded-full px-2 py-1.5 text-[12px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
                      >
                        Send back
                      </button>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-faint">
        Approving a sheet puts the fan's words under the track and pays the points out. This build has no
        admin console, so the approve button above stands in for the editorial desk.
      </p>

      <motion.button
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        onClick={onClose}
        className="mt-3 rounded-[14px] bg-primary px-3.5 py-2.5 text-[13.5px] font-bold text-white shadow-primary"
      >
        Done
      </motion.button>
    </Modal>
  );
}
