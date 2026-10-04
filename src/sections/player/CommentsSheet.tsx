import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { Modal } from "../../ui/Modal";
import { useApp } from "../../app/AppContext";
import { useTrackComments } from "../../app/CommentsContext";
import { REPORT_LABEL, REPORT_REASONS, type Comment } from "../../data/comments";
import { useClickOutside } from "../../hooks/useClickOutside";
import { CommentComposer, ReplyComposer } from "./CommentComposer";
import { EASE, spring } from "../../lib/motion";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ *
 *  The full thread, in a modal above the app: sorting, replies, fires,
 *  reporting and the composer. Reporting happens in place — the sheet
 *  swaps to the reason list instead of stacking another dialog.
 * ------------------------------------------------------------------ */

type Sort = "top" | "newest";
type Target = { id: string; replyId?: string; handle: string; text: string };

export function CommentsSheet({
  trackId,
  trackTitle,
  open,
  onClose,
}: {
  trackId: string;
  trackTitle: string;
  open: boolean;
  onClose: () => void;
}) {
  const comments = useTrackComments(trackId);
  const [sort, setSort] = useState<Sort>("newest");
  const [reportTarget, setReportTarget] = useState<Target | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  /* a fresh track starts a fresh thread view */
  useEffect(() => {
    setReportTarget(null);
    setReason(null);
    setSort("newest");
  }, [trackId]);

  /* no pinning: an artist would have to be signed in to pin, and they aren't */
  const list = useMemo(() => {
    const ordered = sort === "top" ? [...comments.visibleThread].sort((a, b) => b.fires - a.fires) : comments.visibleThread;
    return ordered;
  }, [comments.visibleThread, sort]);

  return (
    <Modal open={open} onClose={onClose} width={470} bare>
      <div className="flex max-h-[min(660px,84vh)] flex-col">
        {/* header */}
        <header className="flex shrink-0 items-start gap-2 border-b border-line px-4 py-3">
          {reportTarget ? (
            <button
              onClick={() => {
                setReportTarget(null);
                setReason(null);
              }}
              className="mt-0.5 flex items-center gap-1 rounded-full bg-subtle px-2 py-1 text-[12px] font-bold text-ink-body transition-colors hover:bg-muted"
            >
              <Icon name="chevronLeft" size={13} strokeWidth={2.2} />
              Back
            </button>
          ) : (
            <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <Icon name="message" size={15} strokeWidth={2.1} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="font-display truncate text-[15.5px] font-bold text-ink">
              {reportTarget ? "Report this comment" : "Comments"}
            </h2>
            <p className="truncate text-[12.5px] text-ink-muted">
              {reportTarget
                ? `${reportTarget.handle} · “${reportTarget.text.slice(0, 46)}${
                    reportTarget.text.length > 46 ? "…" : ""
                  }”`
                : `${comments.total} ${comments.total === 1 ? "comment" : "comments"} on “${trackTitle}”`}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close comments"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
          >
            <Icon name="close" size={15} strokeWidth={2} />
          </button>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {reportTarget ? (
            <ReportBody
              key="report"
              reason={reason}
              onPick={setReason}
              onSubmit={() => {
                comments.report(reportTarget.id, reason ?? "other", reportTarget.replyId);
                setReportTarget(null);
                setReason(null);
              }}
              onCancel={() => {
                setReportTarget(null);
                setReason(null);
              }}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* sorting */}
              <div className="flex shrink-0 items-center gap-1.5 px-4 py-2.5">
                {(["newest", "top"] as Sort[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors",
                      sort === s ? "bg-primary text-white shadow-primary" : "bg-subtle text-ink-muted hover:text-ink",
                    )}
                  >
                    {s === "newest" ? "Newest" : "Top fired"}
                  </button>
                ))}
                <span className="ml-auto text-[11.5px] font-semibold text-ink-faint">
                  {comments.total > 0 && `${list.length} shown`}
                </span>
              </div>

              <div className="scroll-slim mask-fade-b min-h-0 flex-1 overflow-y-auto px-4 pb-3">
                {comments.total === 0 && (
                  <p className="py-10 text-center text-[13px] text-ink-faint">
                    No comments yet — be the first one.
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  {list.map((comment) => (
                    <CommentRow
                      key={comment.id}
                      trackId={trackId}
                      comment={comment}
                      onReport={(target) => {
                        setReason(null);
                        setReportTarget(target);
                      }}
                    />
                  ))}
                </div>

                {/* load more */}
                {comments.total > 0 && (
                  <div className="mt-4 flex justify-center">
                    {comments.hidden > 0 ? (
                      <motion.button
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={comments.loadMore}
                        className="flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 py-2 text-[12.5px] font-bold text-ink-body transition-colors hover:border-primary/30 hover:text-primary-deep"
                      >
                        <Icon name="plus" size={14} strokeWidth={2.2} />
                        Load {Math.min(comments.hidden, 6)} more comments
                      </motion.button>
                    ) : (
                      <p className="py-1 text-[12px] font-semibold text-ink-faint">
                        That's every comment in this demo build 🎉
                      </p>
                    )}
                  </div>
                )}
              </div>

              <footer className="shrink-0 border-t border-line px-4 py-2.5">
                <CommentComposer trackId={trackId} />
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

/* ------------------------------- one comment ---------------------------- */

function CommentRow({
  trackId,
  comment,
  onReport,
}: {
  trackId: string;
  comment: Comment;
  onReport: (target: Target) => void;
}) {
  const { notify } = useApp();
  const comments = useTrackComments(trackId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef], () => setMenuOpen(false), menuOpen);

  const reported = comments.reportOf(comment.id);

  if (reported) {
    return (
      <div className="flex items-center gap-2 rounded-panel border border-dashed border-line-strong bg-subtle/60 px-3 py-2.5">
        <span className="text-ink-faint">
          <Icon name="lock" size={14} />
        </span>
        <span className="min-w-0 flex-1 text-[12.5px] text-ink-muted">
          Hidden — you reported this as <span className="font-bold">{REPORT_LABEL[reported]}</span>.
        </span>
        <button
          onClick={() => {
            comments.undoReport(comment.id);
            notify("Report withdrawn", "teal");
          }}
          className="shrink-0 text-[11.5px] font-bold text-primary-deep"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "relative min-w-0",
        comment.fromArtist && "rounded-panel bg-primary-faint/50 p-2.5",
      )}
    >
      <header className="flex min-w-0 items-start gap-2.5">
        <Avatar src={comment.photo} size={34} badge={comment.badge} ring={comment.fromArtist} />

        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="min-w-0 truncate text-[13px] font-bold text-ink">{comment.author}</span>
            {comment.verified && (
              <span className="text-primary" title="Verified account">
                <Icon name="verified" size={13} strokeWidth={2.2} />
              </span>
            )}
            {comment.fromArtist && (
              <span className="rounded-full bg-primary px-1.5 py-[1px] text-[10.5px] font-extrabold uppercase tracking-wide text-white">
                Artist
              </span>
            )}
            <span className="text-[11.5px] font-semibold text-ink-faint">{comment.handle}</span>
            <span className="text-[11.5px] text-ink-faint">·</span>
            <span className="text-[11.5px] font-semibold text-ink-faint">{comment.time}</span>
            {comment.badge && (
              <span className="max-w-[150px] truncate rounded-full bg-subtle px-1.5 py-[1px] text-[10.5px] font-bold text-ink-muted">
                {comment.badge.label}
              </span>
            )}
          </p>

          <p dir="auto" className="mt-1 text-[13px] leading-relaxed text-ink-body [overflow-wrap:anywhere]">
            {comment.text}
          </p>

          {/* actions */}
          <div className="mt-1.5 flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={spring}
              onClick={() => comments.toggleFire(comment.id)}
              aria-pressed={!!comment.fired}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-bold tabular-nums transition-colors",
                comment.fired ? "bg-flame-soft text-flame-deep" : "text-ink-faint hover:bg-subtle hover:text-flame-deep",
              )}
            >
              <Icon name="flame" size={13} strokeWidth={2.2} fill={comment.fired ? "currentColor" : "none"} />
              {comment.fires}
            </motion.button>

            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="rounded-full px-2 py-1 text-[11.5px] font-bold text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
            >
              Reply
            </button>

            <div className="relative ml-auto" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More actions"
                aria-expanded={menuOpen}
                className="flex size-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
              >
                <Icon name="more" size={15} strokeWidth={2.2} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: EASE }}
                    className="absolute right-0 top-8 z-10 w-[178px] overflow-hidden rounded-panel border border-line bg-surface p-1 shadow-float"
                  >
                    <MenuItem
                      icon="send"
                      label="Reply"
                      onClick={() => {
                        setMenuOpen(false);
                        setReplyOpen(true);
                      }}
                    />
                    <MenuItem
                      icon="arrowUpRight"
                      label="Copy link"
                      onClick={() => {
                        setMenuOpen(false);
                        notify("Comment link copied", "teal");
                      }}
                    />
                    <MenuItem
                      icon="lock"
                      label="Report comment"
                      tone="flame"
                      onClick={() => {
                        setMenuOpen(false);
                        onReport({ id: comment.id, handle: comment.handle, text: comment.text });
                      }}
                    />
                    {comment.mine && (
                      <MenuItem
                        icon="close"
                        label="Delete"
                        tone="flame"
                        onClick={() => {
                          setMenuOpen(false);
                          comments.remove(comment.id);
                          notify("Comment deleted", "teal");
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {replyOpen && (
            <ReplyComposer
              trackId={trackId}
              parentId={comment.id}
              handle={comment.handle}
              onDone={() => {
                setReplyOpen(false);
                setShowReplies(true);
              }}
            />
          )}

          {/* replies */}
          {comment.replies.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="text-[11.5px] font-bold text-primary-deep"
              >
                {showReplies ? "Hide" : "View"} {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            </div>
          )}

          <AnimatePresence initial={false}>
            {showReplies && comment.replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-col gap-2.5 border-l-2 border-line pl-3">
                  {comment.replies.map((reply) => (
                    <ReplyRow
                      key={reply.id}
                      trackId={trackId}
                      reply={reply}
                      onReport={onReport}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </article>
  );
}

function ReplyRow({
  trackId,
  reply,
  onReport,
}: {
  trackId: string;
  reply: Comment;
  onReport: (target: Target) => void;
}) {
  const { notify } = useApp();
  const comments = useTrackComments(trackId);
  const reported = comments.reportOf(reply.id, reply.id);

  if (reported) {
    return (
      <p className="text-[12px] text-ink-faint">
        Hidden — you reported this reply.{" "}
        <button onClick={() => comments.undoReport(reply.id, reply.id)} className="font-bold text-primary-deep">
          Undo
        </button>
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar src={reply.photo} size={26} badge={reply.badge} ring={reply.fromArtist} />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="min-w-0 truncate text-[12.5px] font-bold text-ink">{reply.author}</span>
          {reply.verified && (
            <span className="text-primary">
              <Icon name="verified" size={12} strokeWidth={2.2} />
            </span>
          )}
          <span className="text-[11px] font-semibold text-ink-faint">{reply.handle}</span>
          <span className="text-[11px] text-ink-faint">·</span>
          <span className="text-[11px] font-semibold text-ink-faint">{reply.time}</span>
        </p>
        <p dir="auto" className="mt-0.5 text-[12.5px] leading-relaxed text-ink-body [overflow-wrap:anywhere]">
          {reply.text}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <button
            onClick={() => comments.toggleFire(reply.id, reply.id)}
            aria-pressed={!!reply.fired}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums transition-colors",
              reply.fired ? "bg-flame-soft text-flame-deep" : "text-ink-faint hover:text-flame-deep",
            )}
          >
            <Icon name="flame" size={12} strokeWidth={2.2} fill={reply.fired ? "currentColor" : "none"} />
            {reply.fires}
          </button>
          <button
            onClick={() => onReport({ id: reply.id, replyId: reply.id, handle: reply.handle, text: reply.text })}
            className="rounded-full px-2 py-0.5 text-[11px] font-bold text-ink-faint transition-colors hover:text-flame-deep"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  tone?: "flame";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-[12.5px] font-bold transition-colors",
        tone === "flame" ? "text-flame-deep hover:bg-flame-soft" : "text-ink-body hover:bg-subtle",
      )}
    >
      <Icon name={icon} size={14} strokeWidth={2.1} />
      {label}
    </button>
  );
}

/* ------------------------------ report body ----------------------------- */

function ReportBody({
  reason,
  onPick,
  onSubmit,
  onCancel,
}: {
  reason: string | null;
  onPick: (id: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Reports are anonymous. The fan won’t know — moderators review it and decide.
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r.id)}
              className={cn(
                "flex items-start gap-2.5 rounded-panel border p-2.5 text-left transition-colors",
                reason === r.id
                  ? "border-primary/40 bg-primary-faint"
                  : "border-line hover:border-primary/25 hover:bg-subtle",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  reason === r.id ? "border-primary bg-primary text-white" : "border-line-strong text-transparent",
                )}
              >
                <Icon name="check" size={10} strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-ink">{r.label}</span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted">{r.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3">
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={onSubmit}
          disabled={!reason}
          className={cn(
            "flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[13px] font-bold transition-colors",
            reason ? "bg-primary text-white shadow-primary" : "bg-muted text-ink-faint",
          )}
        >
          <Icon name="lock" size={14} strokeWidth={2.1} />
          Submit report
        </motion.button>
        <button
          onClick={onCancel}
          className="rounded-[14px] px-3 py-2.5 text-[13px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          Cancel
        </button>
      </footer>
    </motion.div>
  );
}
