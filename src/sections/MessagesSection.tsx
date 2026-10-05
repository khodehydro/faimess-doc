import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Avatar } from "../ui/Avatar";
import { Thumb } from "../ui/Scenes";
import { cannedReplies, conversations, type Conversation, type Message } from "../data/messages";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

const uid = () => Math.random().toString(36).slice(2, 9);
/** the stamp reads in the interface language, not the browser's */
const clock = (locale: string) =>
  new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });

/* ---------------------------- list column ---------------------------- */

function ConversationRow({ convo, active, onSelect }: { convo: Conversation; active: boolean; onSelect: () => void }) {
  /* “Online”, “5 minutes ago”, “Sunday” — the row's status is chrome */
  const { dataLabel } = usePreferences();

  return (
    <button onClick={onSelect} className="relative flex w-full items-center gap-2.5 px-2.5 py-2.5 text-start">
      {active && (
        <motion.span layoutId="convo-active" transition={spring} className="absolute inset-x-1 inset-y-0.5 rounded-[14px] bg-subtle" />
      )}
      <span className="relative">
        <Avatar src={convo.photo} seed={convo.seed} size={34} />
        {convo.online && <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full bg-mint ring-2 ring-surface" />}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-bold text-ink">{convo.name}</span>
          {convo.online && <span className="size-1.5 shrink-0 rounded-full bg-mint" />}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-ink-muted">
          {!convo.online && <Icon name="clock" size={12} />}
          <span className={cn("truncate", convo.online && "text-mint")}>{dataLabel(convo.status)}</span>
        </span>
      </span>
      {!!convo.unread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={spring}
          className="relative flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white"
        >
          {convo.unread}
        </motion.span>
      )}
    </button>
  );
}

/* ----------------------------- invite card ---------------------------- */

function InviteCard({
  message,
  onRespond,
}: {
  message: Extract<Message, { kind: "invite" }>;
  onRespond: (status: "accepted" | "declined") => void;
}) {
  const { t, dataLabel } = usePreferences();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="w-full max-w-[212px] rounded-[16px] bg-surface p-2.5 shadow-card ring-1 ring-line/70"
    >
      <div className="flex items-center justify-between">
        <p className="text-[13.5px] font-bold text-ink">{message.title}</p>
        <span className="text-teal-deep">
          <Icon name="video" size={14.5} />
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <div className="h-[46px] w-[70px] shrink-0 overflow-hidden rounded-[10px]">
          <Thumb scene={message.scene} className="h-full w-full" />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-snug text-ink-body">{dataLabel(message.when)}</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">{t("msg.friendsGoing", { n: 4 })}</p>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {message.status === "pending" ? (
          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }} className="mt-2.5 flex items-center gap-1.5">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond("declined")}
              className="flex-1 rounded-full border border-line bg-surface py-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              {t("msg.reject")}
            </motion.button>
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRespond("accepted")}
              className="flex-1 rounded-full bg-primary py-1.5 text-[13px] font-bold text-white shadow-primary"
            >
              {t("msg.accept")}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-2.5 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[13px] font-bold",
              message.status === "accepted" ? "bg-mint-soft text-teal-deep" : "bg-muted text-ink-muted",
            )}
          >
            <Icon name={message.status === "accepted" ? "check" : "close"} size={13.5} strokeWidth={2.6} />
            {message.status === "accepted" ? t("msg.going") : t("msg.declined")}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------- bubbles ------------------------------ */

function Bubble({
  message,
  index,
  onRespond,
}: {
  message: Message;
  index: number;
  onRespond: (status: "accepted" | "declined") => void;
}) {
  const { dataLabel } = usePreferences();
  const enter = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: EASE },
  };

  if (message.kind === "system") {
    return (
      <motion.p layout {...enter} className="mx-auto w-fit rounded-full bg-surface/75 px-3 py-1 text-[12.5px] text-ink-muted">
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
          "max-w-[178px] rounded-[16px] px-3 py-2 text-[13.5px] leading-snug shadow-xs",
          mine ? "rounded-ee-md bg-primary-soft text-ink" : "rounded-es-md bg-surface text-ink-body",
        )}
      >
        {message.text}
      </div>
      <span className="mt-1 px-1 text-[12px] text-ink-faint">{dataLabel(message.at)}</span>
    </motion.div>
  );
}

/* ------------------------------- section ------------------------------ */

export function MessagesSection() {
  const { notify } = useApp();
  const { t, locale, dir } = usePreferences();
  const [convos, setConvos] = useState<Conversation[]>(conversations);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => convos.find((c) => c.id === activeId) ?? convos[0], [convos, activeId]);

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
    patch(id, (c) => ({ ...c, messages: [...c.messages, { id: uid(), kind: "text", from: "me", text, at: clock(locale) }] }));
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      patch(id, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: uid(), kind: "text", from: "them", text: cannedReplies[Math.floor(Math.random() * cannedReplies.length)], at: clock(locale) },
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
          text: t(status === "accepted" ? "msg.joined" : "msg.passed", { name }),
        },
      ],
    }));
    notify(
      t(status === "accepted" ? "msg.acceptedToast" : "msg.declinedToast", { name }),
      status === "accepted" ? "mint" : "primary",
    );
  };

  return (
    <div
      dir={dir}
      className="grid h-[480px] w-full min-h-0 grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)] lg:h-auto lg:flex-1"
    >
      {/* conversation list */}
      <div className="flex min-w-0 flex-col border-e border-line">
        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto pb-2 pt-2">
          {convos.map((c) => (
            <ConversationRow key={c.id} convo={c} active={c.id === activeId} onSelect={() => openConversation(c.id)} />
          ))}
        </div>
      </div>

      {/* thread */}
      <div className="flex min-w-0 flex-col bg-subtle">
        <div ref={scrollRef} className="scroll-slim min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
          <AnimatePresence initial={false} mode="popLayout">
            {active.messages.map((m, i) => (
              <Bubble key={m.id} message={m} index={i} onRespond={(status) => respond(m.id, status)} />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex w-fit items-center gap-1 rounded-[14px] rounded-es-md bg-surface px-3 py-2.5 shadow-xs"
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
          className="flex items-center gap-2 border-t border-line/70 px-2.5 py-2.5"
        >
          <div className="flex flex-1 items-center rounded-full border border-line bg-surface px-3.5 py-1.5 transition-colors focus-within:border-primary/40">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("msg.enterText")}
              className="w-full bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            transition={spring}
            aria-label={t("msg.send")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-primary"
          >
            <Icon name="send" size={16.5} strokeWidth={1.9} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}