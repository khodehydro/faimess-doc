import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { useApp } from "../../app/AppContext";
import { useTrackComments } from "../../app/CommentsContext";
import { me } from "../../data/account";
import { spring } from "../../lib/motion";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ *
 *  Composers — one for a new comment, one for a reply. Same shape, so the
 *  box at the bottom of the player and the reply row inside the thread
 *  feel like the same control.
 * ------------------------------------------------------------------ */

const LIMIT = 240;

function Input({
  value,
  onChange,
  onSend,
  placeholder,
  autoFocus,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const canSend = value.trim().length > 0;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-subtle py-1 pl-3 pr-1 ring-1 ring-transparent transition-colors focus-within:ring-primary/25">
      <input
        value={value}
        autoFocus={autoFocus}
        maxLength={LIMIT}
        dir="auto"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
          if (e.key === "Escape" && onCancel) onCancel();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      {value.length > LIMIT - 40 && (
        <span className="shrink-0 text-[10.5px] font-bold tabular-nums text-ink-faint">
          {LIMIT - value.length}
        </span>
      )}
      <motion.button
        onClick={onSend}
        disabled={!canSend}
        whileTap={{ scale: 0.92 }}
        transition={spring}
        aria-label="Send"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
          canSend ? "bg-primary text-white shadow-primary" : "text-ink-faint",
        )}
      >
        <Icon name="send" size={13} strokeWidth={2.1} />
      </motion.button>
    </div>
  );
}

/** the box at the bottom of the player card */
export function CommentComposer({
  trackId,
  className,
  onPosted,
}: {
  trackId: string;
  className?: string;
  onPosted?: () => void;
}) {
  const { notify } = useApp();
  const comments = useTrackComments(trackId);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    comments.addComment(text.trim());
    setText("");
    notify("Comment posted — it's at the top of the thread", "primary");
    onPosted?.();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar src={me.photo} size={26} badge={me.badge} />
      <Input value={text} onChange={setText} onSend={send} placeholder="Add a comment…" />
    </div>
  );
}

/** the inline reply box that opens under one comment */
export function ReplyComposer({
  trackId,
  parentId,
  handle,
  onDone,
}: {
  trackId: string;
  parentId: string;
  handle: string;
  onDone: () => void;
}) {
  const { notify } = useApp();
  const comments = useTrackComments(trackId);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    comments.addReply(parentId, text.trim());
    notify(`Replied to ${handle}`, "primary");
    onDone();
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <Avatar src={me.photo} size={24} badge={me.badge} />
      <Input
        value={text}
        onChange={setText}
        onSend={send}
        placeholder={`Reply to ${handle}…`}
        autoFocus
        onCancel={onDone}
      />
      <button
        onClick={onDone}
        className="shrink-0 text-[11.5px] font-bold text-ink-faint transition-colors hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
