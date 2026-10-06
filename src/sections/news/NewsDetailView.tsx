import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { newsItems, type NewsItem, type NewsComment } from "../../data/feed";
import { usePreferences } from "../../app/PreferencesContext";
import { useApp } from "../../app/AppContext";
import { useAuth } from "../../app/AuthContext";
import { me } from "../../data/account";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { Modal } from "../../ui/Modal";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { REPORT_REASONS } from "../../data/comments";
import { backIcon } from "../../lib/rtl";
import { cn } from "../../lib/cn";
import { spring, popChild, staggerParent } from "../../lib/motion";

const LIMIT = 240;

const TAG_TONE: Record<string, string> = {
  Comeback: "bg-primary-soft text-primary-deep",
  Tour: "bg-teal-soft text-teal-deep",
  Charts: "bg-mint-soft text-teal-deep",
  Editorial: "bg-muted text-ink-body",
  Awards: "bg-flame-soft text-flame-deep",
};

// Count total comments including all nested replies
function countAllComments(list: NewsComment[]): number {
  return list.reduce((acc, c) => acc + 1 + (c.replies ? countAllComments(c.replies) : 0), 0);
}

// Recursively update a comment in the tree
function updateCommentInTree(
  list: NewsComment[],
  targetId: string,
  updater: (c: NewsComment) => NewsComment,
): NewsComment[] {
  return list.map((c) => {
    if (c.id === targetId) {
      return updater(c);
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: updateCommentInTree(c.replies, targetId, updater) };
    }
    return c;
  });
}

// Recursively add a reply to target comment in the tree
function addReplyToTree(
  list: NewsComment[],
  targetId: string,
  newReply: NewsComment,
): NewsComment[] {
  return list.map((c) => {
    if (c.id === targetId) {
      return {
        ...c,
        replies: [newReply, ...(c.replies ?? [])],
      };
    }
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: addReplyToTree(c.replies, targetId, newReply),
      };
    }
    return c;
  });
}

// Find comment by ID anywhere in the tree
function findCommentInTree(list: NewsComment[], targetId: string): NewsComment | null {
  for (const c of list) {
    if (c.id === targetId) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findCommentInTree(c.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}

// Recursively delete comment and all its replies from the tree
function deleteCommentFromTree(list: NewsComment[], targetId: string): NewsComment[] {
  return list
    .filter((c) => c.id !== targetId)
    .map((c) => ({
      ...c,
      replies: c.replies && c.replies.length > 0 ? deleteCommentFromTree(c.replies, targetId) : [],
    }));
}

export function NewsDetailView({ newsId }: { newsId: string }) {
  const { t, dir, dataLabel, text, locale } = usePreferences();
  const { closeNews, notify } = useApp();
  const { signedIn, openAccount, isAdmin } = useAuth();

  const item = newsItems.find((n) => n.id === newsId) ?? newsItems[0];

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [comments, setComments] = useState<NewsComment[]>(() => item.comments);
  const [commentInput, setCommentInput] = useState("");

  // Reply state
  const [replyTarget, setReplyTarget] = useState<{ id: string; handle: string; author: string } | null>(null);
  const [replyInput, setReplyInput] = useState("");

  // Report modal state
  const [reportTarget, setReportTarget] = useState<NewsComment | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("spam");

  // Delete confirm state for comments with replies
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; replyCount: number } | null>(null);

  const totalComments = useMemo(() => countAllComments(comments), [comments]);

  const handleRequestDeleteComment = (c: NewsComment) => {
    const replyCount = c.replies ? countAllComments(c.replies) : 0;
    if (replyCount > 0) {
      setDeleteTarget({ id: c.id, replyCount });
    } else {
      setComments((prev) => deleteCommentFromTree(prev, c.id));
      notify(t("comments.deletedToast"), "teal");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setComments((prev) => deleteCommentFromTree(prev, deleteTarget.id));
    setDeleteTarget(null);
    notify(t("comments.deletedWithRepliesToast"), "teal");
  };

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
      notify(t("news.unlikedToast"), "primary");
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
      notify(t("news.likedToast"), "mint");
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notify(t("share.copied"), "mint");
    }
  };

  const handleSendComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    if (!signedIn) {
      openAccount("comment");
      return;
    }

    const newComment: NewsComment = {
      id: `nc-${Date.now()}`,
      author: me.name,
      handle: me.handle,
      avatar: me.photo,
      seed: 0,
      time: "Just now",
      text: trimmed,
      likes: 0,
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput("");
    notify(t("news.commentPosted"), "mint");
  };

  const handleSendReply = (targetId: string, targetHandle: string) => {
    const trimmed = replyInput.trim();
    if (!trimmed) return;
    if (!signedIn) {
      openAccount("comment");
      return;
    }

    const newReply: NewsComment = {
      id: `nr-${Date.now()}`,
      author: me.name,
      handle: me.handle,
      avatar: me.photo,
      seed: 0,
      time: "Just now",
      text: trimmed,
      likes: 0,
      replies: [],
    };

    setComments((prev) => addReplyToTree(prev, targetId, newReply));
    setReplyInput("");
    setReplyTarget(null);
    notify(t("comments.repliedToast", { handle: targetHandle }), "mint");
  };

  const handleToggleCommentLike = (commentId: string) => {
    setComments((prev) =>
      updateCommentInTree(prev, commentId, (c) => ({
        ...c,
        liked: !c.liked,
        likes: c.likes + (c.liked ? -1 : 1),
      })),
    );
  };

  const handleConfirmReport = () => {
    if (!reportTarget) return;
    const reasonLabel = t(`report.label.${selectedReason}`);
    setComments((prev) =>
      updateCommentInTree(prev, reportTarget.id, (c) => ({
        ...c,
        reported: true,
        reportReason: reasonLabel,
      })),
    );
    notify(t("comments.reportedToast"), "mint");
    setReportTarget(null);
  };

  const handleUndoReport = (commentId: string) => {
    setComments((prev) =>
      updateCommentInTree(prev, commentId, (c) => ({
        ...c,
        reported: false,
        reportReason: undefined,
      })),
    );
    notify(t("comments.reportWithdrawn"), "primary");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex min-h-0 flex-1 flex-col p-4 lg:p-7"
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 pb-4 lg:pb-5">
        <PillButton tone="soft" icon={backIcon(dir)} onClick={closeNews}>
          {t("news.backToNews")}
        </PillButton>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-bold tracking-wide backdrop-blur-sm",
              TAG_TONE[item.tag] ?? "bg-muted text-ink",
            )}
          >
            {dataLabel(item.tag)}
          </span>
          <button
            onClick={handleShare}
            aria-label={t("news.shareTitle")}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:text-ink hover:shadow-card"
          >
            <Icon name="share" size={15} strokeWidth={2.1} />
          </button>
        </div>
      </div>

      {/* Featured hero image — prominent, responsive, with fallback */}
      <div className="relative mb-6 w-full overflow-hidden rounded-[20px] bg-ink/5 shadow-float ring-1 ring-black/5 dark:ring-white/10">
        <img
          src={item.photo}
          alt={text(`news.${item.id}.title`, item.title)}
          draggable={false}
          className="h-[240px] w-full object-cover select-none pointer-events-none sm:h-[320px] lg:h-[400px]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute bottom-3.5 start-4 z-10 flex flex-wrap items-center gap-2 text-white/90 lg:bottom-5 lg:start-5">
          <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-bold backdrop-blur-md", TAG_TONE[item.tag])}>
            {dataLabel(item.tag)}
          </span>
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[12px] font-bold text-white backdrop-blur-md">
            {dataLabel(item.source)}
          </span>
          <span className="text-[12px] text-white/80">·</span>
          <span className="text-[12px] text-white/80">{dataLabel(item.ago)}</span>
        </div>
      </div>

      {/* News Headline */}
      <h1 className="font-display text-[22px] font-bold leading-tight tracking-[-0.018em] text-ink lg:text-[28px]">
        {text(`news.${item.id}.title`, item.title)}
      </h1>

      {/* Author & metadata strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3 lg:mt-5">
        <div className="flex items-center gap-3">
          <Avatar src={item.author.avatar} seed={item.author.seed} size={40} />
          <div>
            <p className="font-display text-[14px] font-bold text-ink">{item.author.name}</p>
            <p className="text-[12px] text-ink-muted">{item.author.role}</p>
          </div>
        </div>

        {/* Engagement metrics */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Like button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            onClick={handleToggleLike}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
              liked
                ? "bg-flame-soft text-flame shadow-sm"
                : "border border-line bg-surface text-ink-muted hover:border-flame/30 hover:text-flame",
            )}
          >
            <Icon name="heart" size={14.5} strokeWidth={2.2} className={liked ? "fill-current" : ""} />
            <span>{likesCount.toLocaleString(locale)}</span>
          </motion.button>

          {/* Views count */}
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-muted">
            <Icon name="trend" size={14} strokeWidth={2} />
            <span>{item.views.toLocaleString(locale)}</span>
          </span>

          {/* Comments count */}
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-muted">
            <Icon name="message" size={14} strokeWidth={2} />
            <span>{totalComments.toLocaleString(locale)}</span>
          </span>
        </div>
      </div>

      {/* Lead excerpt */}
      <p className="mt-5 text-[14.5px] font-semibold leading-relaxed text-ink-body lg:mt-6 lg:text-[16px]">
        {text(`news.${item.id}.excerpt`, item.excerpt)}
      </p>

      {/* Body paragraphs */}
      <div className="mt-4 space-y-3.5 text-[13.5px] leading-relaxed text-ink-body/90 lg:mt-5 lg:space-y-4 lg:text-[15px]">
        {item.bodyKeys.map((key) => (
          <p key={key}>{text(key, "")}</p>
        ))}
      </div>

      {/* ----------------- Comments / Chat box section ----------------- */}
      <section className="mt-8 border-t border-line pt-6 lg:mt-10 lg:pt-7">
        <div className="flex items-center justify-between pb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <Icon name="message" size={14} strokeWidth={2.1} />
            </span>
            <h2 className="font-display text-[16px] font-bold text-ink lg:text-[18px]">
              {t("news.commentsTitle")}
            </h2>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
            {totalComments.toLocaleString(locale)}
          </span>
        </div>

        {/* Comment Composer matching player's chat composer */}
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
          <Avatar src={me.photo} seed={0} size={34} />
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-subtle py-1.5 pe-1.5 ps-3 ring-1 ring-transparent transition-colors focus-within:ring-primary/25">
            <input
              value={commentInput}
              maxLength={LIMIT}
              dir="auto"
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
              placeholder={t("news.commentPlaceholder")}
              aria-label={t("news.commentPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            {commentInput.length > LIMIT - 40 && (
              <span className="shrink-0 text-[12px] font-bold tabular-nums text-ink-faint">
                {LIMIT - commentInput.length}
              </span>
            )}
            <motion.button
              onClick={handleSendComment}
              disabled={!commentInput.trim()}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              aria-label={t("news.commentSend")}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                commentInput.trim() ? "bg-primary text-white shadow-primary" : "text-ink-faint",
              )}
            >
              <Icon name="send" size={13} strokeWidth={2.1} />
            </motion.button>
          </div>
        </div>

        {/* Comments thread list with nested replies */}
        <div className="mt-5 space-y-3.5">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                locale={locale}
                isAdmin={isAdmin}
                replyTarget={replyTarget}
                replyInput={replyInput}
                onReplyInputChange={setReplyInput}
                onStartReply={(c) => {
                  setReplyTarget({ id: c.id, handle: c.handle, author: c.author });
                  setReplyInput("");
                }}
                onCancelReply={() => {
                  setReplyTarget(null);
                  setReplyInput("");
                }}
                onSendReply={handleSendReply}
                onLikeComment={handleToggleCommentLike}
                onReportComment={(c) => setReportTarget(c)}
                onUndoReport={handleUndoReport}
                onDeleteComment={handleRequestDeleteComment}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Report Modal */}
      {reportTarget && (
        <Modal open={true} onClose={() => setReportTarget(null)} width={420} bare>
          <div className="flex flex-col p-4.5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-display text-[15.5px] font-bold text-ink">
                {t("comments.reportTitle")}
              </h3>
              <button
                onClick={() => setReportTarget(null)}
                aria-label={t("comments.cancel")}
                className="flex size-7 items-center justify-center rounded-full text-ink-faint hover:text-ink hover:bg-subtle"
              >
                <Icon name="close" size={14} />
              </button>
            </div>

            <p className="mt-3 text-[12px] text-ink-muted leading-relaxed">
              {t("report.note")}
            </p>

            <div className="mt-3.5 space-y-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-2.5 text-start transition-colors",
                    selectedReason === r.id
                      ? "border-primary/40 bg-primary-faint"
                      : "border-line hover:border-primary/25 hover:bg-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      selectedReason === r.id ? "border-primary bg-primary text-white" : "border-line-strong text-transparent",
                    )}
                  >
                    <Icon name="check" size={10} strokeWidth={3} />
                  </span>
                  <div>
                    <span className="block text-[13px] font-bold text-ink">{t(`report.label.${r.id}`)}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">{t(`report.hint.${r.id}`)}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={() => setReportTarget(null)}
                className="rounded-full px-3.5 py-1.5 text-[12px] font-bold text-ink-muted hover:text-ink"
              >
                {t("comments.cancel")}
              </button>
              <button
                onClick={handleConfirmReport}
                className="rounded-full bg-flame px-4 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-flame-deep"
              >
                {t("comments.submitReport")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal for comments with replies */}
      {deleteTarget && (
        <ConfirmDialog
          open={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title={t("comments.deleteConfirmTitle")}
          body={t("comments.deleteConfirmDesc", { n: deleteTarget.replyCount })}
          confirmKey="comments.delete"
          cancelKey="comments.cancel"
          icon="close"
          tone="flame"
        />
      )}
    </motion.article>
  );
}

/**
 * Threaded Comment Card component supporting nested replies, likes, replies, and reporting.
 */
function CommentCard({
  comment,
  depth = 0,
  locale,
  isAdmin,
  replyTarget,
  replyInput,
  onReplyInputChange,
  onStartReply,
  onCancelReply,
  onSendReply,
  onLikeComment,
  onReportComment,
  onUndoReport,
  onDeleteComment,
}: {
  comment: NewsComment;
  depth: number;
  locale: string;
  isAdmin: boolean;
  replyTarget: { id: string; handle: string; author: string } | null;
  replyInput: string;
  onReplyInputChange: (v: string) => void;
  onStartReply: (c: NewsComment) => void;
  onCancelReply: () => void;
  onSendReply: (targetId: string, targetHandle: string) => void;
  onLikeComment: (id: string) => void;
  onReportComment: (c: NewsComment) => void;
  onUndoReport: (id: string) => void;
  onDeleteComment: (c: NewsComment) => void;
}) {
  const { t, dataLabel } = usePreferences();
  const isReplyingThis = replyTarget?.id === comment.id;
  const canDelete = isAdmin || comment.author === me.name || comment.handle === me.handle;

  if (comment.reported) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/60 p-3 text-[12px] text-ink-muted">
        <span>
          {t("comments.hidden")}: <strong className="font-bold text-ink">{comment.reportReason}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUndoReport(comment.id)}
            className="font-bold text-primary-deep hover:underline"
          >
            {t("comments.undo")}
          </button>
          {canDelete && (
            <button
              onClick={() => onDeleteComment(comment)}
              className="ms-2 font-bold text-flame transition-colors hover:underline"
            >
              {t("comments.delete")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-xl border border-line/80 bg-surface/85 p-3.5 shadow-card"
    >
      {/* Comment Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar src={comment.avatar} seed={comment.seed} size={28} />
          <div>
            <span className="text-[13px] font-bold text-ink">{comment.author}</span>
            <span className="ms-1.5 text-[12px] text-ink-faint">{comment.handle}</span>
          </div>
        </div>
        <span className="text-[12px] text-ink-faint">{dataLabel(comment.time)}</span>
      </div>

      {/* Comment text */}
      <p className="mt-2 text-[13px] leading-relaxed text-ink-body">{comment.text}</p>

      {/* Action buttons (Like, Reply, Report, Delete) */}
      <div className="mt-2.5 flex items-center gap-3 text-[12px] text-ink-faint">
        <button
          onClick={() => onLikeComment(comment.id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold transition-colors",
            comment.liked ? "text-flame font-bold" : "hover:text-ink",
          )}
        >
          <Icon name="heart" size={12.5} strokeWidth={2} className={comment.liked ? "fill-current" : ""} />
          <span>{comment.likes.toLocaleString(locale)}</span>
        </button>

        <button
          onClick={() => onStartReply(comment)}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold hover:text-ink transition-colors"
        >
          <Icon name="message" size={12} strokeWidth={2} />
          <span>{t("comments.reply")}</span>
        </button>

        {canDelete && (
          <button
            onClick={() => onDeleteComment(comment)}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-ink-faint transition-colors hover:text-flame"
            title={t(isAdmin ? "comments.deleteAsAdmin" : "comments.delete")}
          >
            <Icon name="close" size={12} strokeWidth={2.2} />
            <span>{t("comments.delete")}</span>
          </button>
        )}

        <button
          onClick={() => onReportComment(comment)}
          className="ms-auto flex items-center gap-1 rounded-full px-2 py-0.5 hover:text-flame transition-colors"
          title={t("comments.report")}
        >
          <Icon name="more" size={13} strokeWidth={2} />
          <span className="hidden sm:inline">{t("comments.report")}</span>
        </button>
      </div>

      {/* Inline Reply Composer */}
      {isReplyingThis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 border-t border-line pt-2.5"
        >
          <div className="flex items-center gap-2">
            <Avatar src={me.photo} seed={0} size={26} />
            <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-subtle py-1 pe-1 ps-2.5 ring-1 ring-transparent focus-within:ring-primary/25">
              <input
                autoFocus
                value={replyInput}
                maxLength={LIMIT}
                dir="auto"
                onChange={(e) => onReplyInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSendReply(comment.id, comment.handle);
                  }
                  if (e.key === "Escape") onCancelReply();
                }}
                placeholder={t("comments.replyTo", { handle: comment.handle })}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                onClick={() => onSendReply(comment.id, comment.handle)}
                disabled={!replyInput.trim()}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                  replyInput.trim() ? "bg-primary text-white" : "text-ink-faint",
                )}
              >
                <Icon name="send" size={11} strokeWidth={2.2} />
              </button>
            </div>
            <button
              onClick={onCancelReply}
              className="text-[12px] font-semibold text-ink-muted hover:text-ink"
            >
              {t("comments.cancel")}
            </button>
          </div>
        </motion.div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3.5 space-y-2.5 border-s-2 border-line-strong ps-3 lg:ps-4 ms-2 lg:ms-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              locale={locale}
              isAdmin={isAdmin}
              replyTarget={replyTarget}
              replyInput={replyInput}
              onReplyInputChange={onReplyInputChange}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onSendReply={onSendReply}
              onLikeComment={onLikeComment}
              onReportComment={onReportComment}
              onUndoReport={onUndoReport}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
