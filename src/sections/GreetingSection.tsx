import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Sprig } from "../ui/Scenes";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Greeting — the emotional anchor of the page: a warm hello, a
 *  “what do you feel like?” prompt and quick time filters.
 * ------------------------------------------------------------------ */

const GREETING = {
  line1: "Have a Good day,",
  name: "Wendy",
  subtitle: "Fuel your days with the boundless enthusiasm of a fellow explorer.",
};

const FILTERS = [
  { id: "now", label: "Now" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "next-week", label: "Next week" },
  { id: "custom", label: "Custom" },
];

export function GreetingSection() {
  const { notify } = useApp();
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("now");
  const [plan, setPlan] = useState<string | null>(null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const label = FILTERS.find((f) => f.id === filter)?.label ?? "Now";
    setPlan(text);
    setDraft("");
    notify(`Planning “${text}” · ${label}`);
  };

  return (
    <section className="relative flex h-full w-full flex-col justify-between overflow-hidden px-5 py-4">
      {/* decorative sprigs */}
      <motion.div
        initial={{ opacity: 0, x: -12, rotate: -6 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        className="pointer-events-none absolute left-0 top-[48%] h-[74px] opacity-90"
      >
        <Sprig />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12, rotate: 6 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.38, ease: EASE }}
        className="pointer-events-none absolute right-0 top-[28%] h-[64px] opacity-90"
      >
        <Sprig flip />
      </motion.div>

      <div className="relative text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          className="font-display text-[29px] font-bold leading-[1.16] tracking-[-0.015em] text-ink"
        >
          {GREETING.line1}
          <br />
          <span className="inline-flex items-center gap-1.5">
            {GREETING.name}
            <motion.span
              animate={{ rotate: [0, 16, -8, 14, 0] }}
              transition={{ duration: 1.8, delay: 0.9, repeat: Infinity, repeatDelay: 3.4 }}
              style={{ transformOrigin: "70% 80%", display: "inline-block" }}
              className="text-[26px]"
            >
              👋
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
          className="mx-auto mt-2.5 max-w-[300px] text-[13px] leading-relaxed text-ink-muted"
        >
          {GREETING.subtitle}
        </motion.p>
      </div>

      {/* intent composer */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.36, ease: EASE }}
        className="relative flex items-center gap-2.5"
      >
        <div className="flex flex-1 items-center gap-1 rounded-full border border-line bg-subtle py-1.5 pl-3.5 pr-1.5 transition-colors focus-within:border-primary/40 focus-within:bg-surface">
          <label htmlFor="intent" className="whitespace-nowrap text-[13.5px] font-semibold text-ink">
            I want to...
          </label>
          <input
            id="intent"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="start a late-night mix"
            className="min-w-0 flex-1 bg-transparent px-1 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Pick a date"
            className="flex size-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <Icon name="calendar" size={15.5} />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Save idea"
            className="flex size-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <Icon name="star" size={15.5} />
          </motion.button>
        </div>
        <motion.button
          type="submit"
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={spring}
          aria-label="Start planning"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-primary"
        >
          <Icon name="send" size={18.5} strokeWidth={1.8} />
        </motion.button>
      </motion.form>

      {/* quick filters */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.44 } } }}
        className="relative grid grid-cols-2 gap-1.5"
      >
        {FILTERS.map((f) => {
          const isActive = filter === f.id;
          return (
            <motion.button
              key={f.id}
              variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
              onClick={() => setFilter(f.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-full border py-1.5 text-[13.5px] font-semibold transition-colors",
                isActive
                  ? "border-primary/35 bg-primary-faint text-primary-deep"
                  : "border-line bg-surface text-ink-body hover:border-line-strong",
              )}
            >
              <span className={cn("flex size-3 items-center justify-center rounded-full border", isActive ? "border-primary" : "border-ink-faint")}>
                <motion.span animate={{ scale: isActive ? 1 : 0 }} transition={spring} className="block size-1.5 rounded-full bg-primary" />
              </span>
              {f.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* confirmation of the drafted plan */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-primary-faint px-3 py-2">
              <motion.span
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2 }}
                className="text-primary"
              >
                <Icon name="sparkle" size={16.5} />
              </motion.span>
              <p className="flex-1 text-[13.5px] font-semibold text-ink">
                Drafting a plan for <span className="text-primary-deep">“{plan}”</span>
              </p>
              <button onClick={() => setPlan(null)} aria-label="Dismiss" className="text-ink-faint transition-colors hover:text-ink">
                <Icon name="close" size={14.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
