import { motion } from "framer-motion";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { useTrackComments } from "../../app/CommentsContext";
import { CommentComposer } from "./CommentComposer";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  The comments strip pinned to the bottom of the player card:
 *  a header with the count, the newest comment as a taster, and the
 *  composer. Everything opens the full thread.
 * ------------------------------------------------------------------ */

export function CommentsBar({ trackId, onOpen }: { trackId: string; onOpen: () => void }) {
  const comments = useTrackComments(trackId);
  const latest = comments.thread[0];
  const second = comments.thread.find((c) => c.replies.length > 0);

  return (
    <section className="min-w-0 shrink-0 overflow-hidden border-t border-line">
      <header className="flex items-center gap-1.5 px-3.5 pt-2">
        <span className="text-ink-faint">
          <Icon name="message" size={13.5} />
        </span>
        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Comments</span>
        <span className="rounded-full bg-subtle px-1.5 py-[1px] text-[11.5px] font-bold tabular-nums text-ink-muted">
          {comments.total}
        </span>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
          onClick={onOpen}
          className="ml-auto flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-[11.5px] font-bold text-primary-deep"
        >
          See all
          <Icon name="arrowRight" size={12} strokeWidth={2.2} />
        </motion.button>
      </header>

      {/* the newest comment, as a taster — tap for the whole discussion.
          The text lives in its own block so a long comment truncates with an
          ellipsis instead of pushing the row (and the card) around. */}
      {latest && (
        <button
          onClick={onOpen}
          className="group mt-1.5 flex w-full min-w-0 items-center gap-2 px-3.5 text-left"
          aria-label="Open the comment thread"
        >
          <Avatar src={latest.photo} size={22} badge={latest.badge} />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-baseline gap-1.5">
              <span className="min-w-0 truncate text-[12.5px] font-bold text-ink-body">{latest.handle}</span>
              <span className="shrink-0 text-[11px] font-semibold text-ink-faint">{latest.time}</span>
            </span>
            <span dir="auto" className="mt-0.5 block truncate text-[12.5px] text-ink-muted">
              {latest.text}
            </span>
          </span>
        </button>
      )}

      {second && (
        <button
          onClick={onOpen}
          className="group mt-1 flex w-full min-w-0 items-center gap-2 px-3.5 text-left"
          aria-label="Open the comment thread"
        >
          <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-subtle text-ink-faint">
            <Icon name="message" size={11} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-faint">
            {second.replies.length} {second.replies.length === 1 ? "reply" : "replies"} from the community
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-ink-faint transition-colors group-hover:text-primary-deep">
            View
          </span>
        </button>
      )}

      <CommentComposer trackId={trackId} className="min-w-0 px-3.5 pb-3 pt-2" />
    </section>
  );
}
