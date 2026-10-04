import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { Thumb } from "./Scenes";
import { cannedReplies, conversations, type Conversation, type Message } from "../lib/data";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

const uid = () => Math.random().toString(36).slice(2, 9);
const clock = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

/* ---------------------------- left column ---------------------------- */

function ConversationRow({
  convo,
  active,
  onSelect,
}: {
  convo: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const last = convo.messages[convo.messages.length - 1];
  const preview =
    last?.kind === "text" ? last.text : last?.kind === "invite" ? `Invite · ${last.title}` : "Shared a plan";

  return (
    <button
      onClick={onSelect}
      className="relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
    >
      {active && (
        <motion.span
          layoutId="convo-active"
          transition={spring}
          className="absolute inset-x-1 inset-y-0.5 rounded-[14px] bg-subtle"
        />
      )}
      <span className="relative">
        <Avatar seed={convo.seed} size={34} />
        {convo.online && (
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-mint ring-2 ring-white" />
        )}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[12px] font-bold text-ink">{convo.name}</span>
          {convo.online && <span className="size-1.5 shrink-0 rounded-full bg-mint" />}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-muted">
          {!convo.online && <Icon name="clock" size={10} />}
          <span className={cn("truncate", convo.online && "text-mint")}>{convo.status}</span>
        </span>
      </span>
      {!!convo.unread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={spring}
          className="relative flex size-[18px] shrink-0 items-center justify-center rounded-full bg-coral text-[9.5px] font-bold text-white"
        >
          {convo.unread}
        </motion.span>
      )}
    </button>
  );
}

/* ---------------------------- chat bubbles --------------------------- */

function InviteCard({
  message,
  onRespond,
}: {
  message: Extract<Message, { kind: "invite" }>;
  onRespond: (status: "accepted" | "declined") => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="w-[194px] rounded-[16px] bg-white p-2.5 shadow-card ring-1 ring-line/70"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-ink">{message.title}</p>
        <span className="text-teal-deep">
          <Icon name="video" size={13} />
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <div className="h-[46px] w-[68px] shrink-0 overflow-hidden rounded-[10px]">
          <Thumb thumb={message.thumb} className="h-full w-full" />
        </div>
        <div className="min-w-0">
          <p className="text-[9.5px] font-semibold leading-snug text-ink-body">{message.when}</p>
          <p className="mt-0.5 text-[9px] text-ink-muted">with 4 explorers</p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {message.status === "pending" ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2.5 flex items-center gap-1.5"
          >
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond("declined")}
              className="flex-1 rounded-full border border-line bg-surface py-1.5 text-[10.5px] font-semibold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              Reject
            </motion.button>
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond("accepted")}
              className="flex-1 rounded-full bg-coral py-1.5 text-[10.5px] font-bold text-white shadow-coral"
            >
              Accept
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-2.5 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[10.5px] font-bold",
              message.status === "accepted"
                ? "bg-mint-soft text-teal-deep"
                : "bg-muted text-ink-muted",
            )}
          >
            <Icon name={message.status === "accepted" ? "check" : "close"} size={12} strokeWidth={2.6} />
            {message.status === "accepted" ? "You're going 🎉" : "Declined"}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Bubble({
  message,
  onRespond,
  index,
}: {
  message: Message;
  onRespond: (status: "accepted" | "declined") => void;
  index: number;
}) {
  const enter = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: EASE },
  };

  if (message.kind === "system") {
    return (
      <motion.p layout {...enter} className="mx-auto rounded-full bg-white/70 px-3 py-1 text-[10px] text-ink-muted">
        {message.text}
      </motion.p>
    );
  }

  if (message.kind === "invite") {
    return (
      <motion.div layout className="flex justify-start">
        <InviteCard message={message} onRespond={onRespond} />
      </motion.div>
    );
  }

  const mine = message.from === "me";
  return (
    <motion.div layout {...enter} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[176px] rounded-[16px] px-3 py-2 text-[11.5px] leading-snug shadow-xs",
          mine
            ? "rounded-br-md bg-coral-soft text-ink"
            : "rounded-bl-md bg-white text-ink-body",
        )}
      >
        {message.text}
      </div>
      <span className="mt-1 px-1 text-[9px] text-ink-faint">{message.at}</span>
    </motion.div>
  );
}

/* ------------------------------- panel ------------------------------- */

export function ChatPanel({
  onToast,
}: {
  onToast: (text: string, tone?: "coral" | "teal" | "mint") => void;
}) {
  const [convos, setConvos] = useState<Conversation[]>(conversations);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) ?? convos[0],
    [convos, activeId],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active.messages.length, activeId, typing]);

  const patch = (id: string, fn: (c: Conversation) => Conversation) =>
    setConvos((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  const openConversation = (id: string) => {
    setActiveId(id);
    patch(id, (c) => ({ ...c, unread: 0 }));
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const id = activeId;
    patch(id, (c) => ({
      ...c,
      messages: [...c.messages, { id: uid(), kind: "text", from: "me", text, at: clock() }],
    }));
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      patch(id, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: uid(),
            kind: "text",
            from: "them",
            text: cannedReplies[Math.floor(Math.random() * cannedReplies.length)],
            at: clock(),
          },
        ],
      }));
    }, 1500);
  };

  const respond = (messageId: string, status: "accepted" | "declined") => {
    const name = active.name.split(" ")[0];
    patch(activeId, (c) => ({
      ...c,
      messages: [
        ...c.messages.map((m) => (m.id === messageId && m.kind === "invite" ? { ...m, status } : m)),
        {
          id: uid(),
          kind: "system",
          text: status === "accepted" ? `You joined ${name}'s plan` : `You passed on ${name}'s plan`,
        },
      ],
    }));
    onToast(
      status === "accepted" ? `Invite accepted · ${name} was notified` : `Invite declined`,
      status === "accepted" ? "mint" : "coral",
    );
  };

  return (
    <section className="grid h-[398px] grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] overflow-hidden rounded-card bg-surface shadow-card">
      {/* conversation list */}
      <div className="flex min-w-0 flex-col border-r border-line">
        <div className="flex items-center gap-2 px-3.5 pb-1 pt-3.5">
          <h3 className="text-[13px] font-bold tracking-[-0.01em] text-ink">Messages</h3>
          <span className="rounded-full bg-coral-soft px-1.5 py-0.5 text-[9.5px] font-bold text-coral-deep">
            {convos.reduce((n, c) => n + (c.unread ?? 0), 0)}
          </span>
          <button
            aria-label="Search messages"
            className="ml-auto text-ink-faint transition-colors hover:text-ink"
          >
            <Icon name="search" size={14} />
          </button>
        </div>
        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto pb-2 pt-1">
          {convos.map((c) => (
            <ConversationRow
              key={c.id}
              convo={c}
              active={c.id === activeId}
              onSelect={() => openConversation(c.id)}
            />
          ))}
        </div>
      </div>

      {/* thread */}
      <div className="flex min-w-0 flex-col bg-subtle">
        <div className="flex items-center gap-2 border-b border-line/70 px-3.5 py-2.5">
          <Avatar seed={active.seed} size={28} />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-ink">{active.name}</p>
            <p className={cn("text-[9.5px]", active.online ? "text-mint" : "text-ink-muted")}>
              {active.online ? "Online" : active.status}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-ink-muted">
            {(["video", "users", "more"] as const).map((i) => (
              <motion.button
                key={i}
                whileHover={{ y: -2, color: "#22252e" }}
                whileTap={{ scale: 0.9 }}
                aria-label={i}
                className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-white"
              >
                <Icon name={i} size={14} />
              </motion.button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="scroll-slim min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
          <AnimatePresence initial={false} mode="popLayout">
            {active.messages.map((m, i) => (
              <Bubble
                key={m.id}
                message={m}
                index={i}
                onRespond={(status) => respond(m.id, status)}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1 rounded-[14px] rounded-bl-md bg-white px-3 py-2.5 shadow-xs w-fit"
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    className="block size-1.5 rounded-full bg-ink-faint"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-line/70 px-3 py-2.5"
        >
          <div className="flex flex-1 items-center rounded-full border border-line bg-white px-3.5 py-1.5 transition-colors focus-within:border-coral/40">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter Text..."
              className="w-full bg-transparent text-[11.5px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            transition={spring}
            aria-label="Send message"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-coral text-white shadow-coral"
          >
            <Icon name="send" size={15} strokeWidth={1.9} />
          </motion.button>
        </form>
      </div>
    </section>
  );
}
