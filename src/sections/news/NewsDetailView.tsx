import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { newsItems, type NewsItem, type NewsComment } from "../../data/feed";
import { usePreferences } from "../../app/PreferencesContext";
import { useApp } from "../../app/AppContext";
import { useAuth } from "../../app/AuthContext";
import { me } from "../../data/account";
import { Photo } from "../../ui/Cover";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
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

export function NewsDetailView({ newsId }: { newsId: string }) {
  const { t, dir, dataLabel, text, locale } = usePreferences();
  const { closeNews, notify } = useApp();
  const { signedIn, openAccount } = useAuth();

  const item = newsItems.find((n) => n.id === newsId) ?? newsItems[0];

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [comments, setComments] = useState<NewsComment[]>(() => item.comments);
  const [commentInput, setCommentInput] = useState("");
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

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
      handle: `@${me.name.toLowerCase().replace(/\s+/g, "")}`,
      avatar: me.photo,
      seed: 0,
      time: "Just now",
      text: trimmed,
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput("");
    notify(t("news.commentPosted"), "mint");
  };

  const handleToggleCommentLike = (commentId: string) => {
    setLikedComments((prev) => {
      const isCurrentlyLiked = !!prev[commentId];
      const next = { ...prev, [commentId]: !isCurrentlyLiked };
      setComments((list) =>
        list.map((c) => (c.id === commentId ? { ...c, likes: c.likes + (isCurrentlyLiked ? -1 : 1) } : c)),
      );
      return next;
    });
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

      {/* Featured hero image */}
      <div className="relative h-[210px] w-full overflow-hidden rounded-[18px] bg-ink shadow-card ring-1 ring-line/50 lg:h-[320px]">
        <Photo src={item.photo} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-3 start-3 text-[12px] font-medium text-white/80 backdrop-blur-sm lg:bottom-4 lg:start-4">
          {dataLabel(item.source)} · {dataLabel(item.ago)}
        </span>
      </div>

      {/* News Headline */}
      <h1 className="font-display mt-5 text-[21px] font-bold leading-tight tracking-[-0.018em] text-ink lg:mt-6 lg:text-[28px]">
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
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-colors",
              liked
                ? "bg-flame-soft text-flame shadow-sm"
                : "border border-line bg-surface text-ink-muted hover:border-flame/30 hover:text-flame",
            )}
          >
            <Icon name="heart" size={14.5} strokeWidth={2.2} className={liked ? "fill-current" : ""} />
            <span>{likesCount.toLocaleString(locale)}</span>
          </motion.button>

          {/* Views count */}
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-muted">
            <Icon name="trend" size={14} strokeWidth={2} />
            <span>{item.views.toLocaleString(locale)}</span>
          </span>

          {/* Comments count */}
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-muted">
            <Icon name="message" size={14} strokeWidth={2} />
            <span>{comments.length.toLocaleString(locale)}</span>
          </span>
        </div>
      </div>

      {/* Lead excerpt */}
      <p className="mt-5 text-[14px] font-semibold leading-relaxed text-ink-body lg:mt-6 lg:text-[16px]">
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
            {comments.length.toLocaleString(locale)}
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

        {/* Comments thread list */}
        <div className="mt-4 space-y-2.5">
          <AnimatePresence initial={false}>
            {comments.map((c) => {
              const isCommentLiked = !!likedComments[c.id];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-line/70 bg-surface/70 p-3 shadow-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={c.avatar} seed={c.seed} size={28} />
                      <div>
                        <span className="text-[13px] font-bold text-ink">{c.author}</span>
                        <span className="ms-1.5 text-[12px] text-ink-faint">{c.handle}</span>
                      </div>
                    </div>
                    <span className="text-[12px] text-ink-faint">{dataLabel(c.time)}</span>
                  </div>

                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-body lg:text-[13px]">{c.text}</p>

                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleToggleCommentLike(c.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold transition-colors",
                        isCommentLiked ? "text-flame" : "text-ink-faint hover:text-ink-muted",
                      )}
                    >
                      <Icon
                        name="heart"
                        size={12}
                        strokeWidth={2}
                        className={isCommentLiked ? "fill-current" : ""}
                      />
                      <span>{c.likes.toLocaleString(locale)}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </motion.article>
  );
}
