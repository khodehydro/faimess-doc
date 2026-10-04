import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { Sprig } from "./Scenes";
import { greeting, intentFilters } from "../lib/data";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Greeting — the emotional anchor of the screen: a warm hello, a
 *  “what do you want to do?” prompt and quick time filters.
 * ------------------------------------------------------------------ */

export function GreetingPanel({ onToast }: { onToast: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("now");
  const [plan, setPlan] = useState<string | null>(null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const label = intentFilters.find((f) => f.id === filter)?.label ?? "Now";
    setPlan(text);
    setDraft("");
    onToast(`Planning “${text}” · ${label}`);
  };

  return (
    <section className="relative overflow-hidden rounded-card bg-surface px-6 pb-6 pt-7 shadow-card">
      {/* decorative sprigs */}
      <motion.div
        initial={{ opacity: 0, x: -12, rotate: -6 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        className="pointer-events-none absolute -left-1 top-[42%] h-24 text-teal/40"
      >
        <Sprig />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12, rotate: 6 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.38, ease: EASE }}
        className="pointer-events-none absolute -right-2 top-[30%] h-20"
      >
        <Sprig flip />
      </motion.div>

      <div className="relative text-center">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="text-[33px] font-extrabold leading-[1.14] tracking-[-0.035em] text-ink"
        >
          {greeting.line1}
          <br />
          <span className="inline-flex items-center gap-1.5">
            {greeting.name}
            <motion.span
              animate={{ rotate: [0, 16, -8, 14, 0] }}
              transition={{ duration: 1.8, delay: 0.9, repeat: Infinity, repeatDelay: 3.4 }}
              style={{ transformOrigin: "70% 80%", display: "inline-block" }}
              className="text-[28px]"
            >
              👋
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="mx-auto mt-2.5 max-w-[290px] text-[11.5px] leading-relaxed text-ink-muted"
        >
          {greeting.subtitle}
        </motion.p>
      </div>

      {/* intent composer */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.42, ease: EASE }}
        className="relative mt-5 flex items-center gap-2"
      >
        <div className="flex flex-1 items-center gap-1.5 rounded-full border border-line bg-subtle py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-coral/40 focus-within:bg-surface">
          <label htmlFor="intent" className="whitespace-nowrap text-[12px] font-semibold text-ink">
            I want to...
          </label>
          <input
            id="intent"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="plan a sunrise hike"
            className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Pick a date"
            className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <Icon name="calendar" size={14} />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Save idea"
            className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-ink"
          >
            <Icon name="star" size={14} />
          </motion.button>
        </div>
        <motion.button
          type="submit"
          whileHover={{ y: -2, scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={spring}
          aria-label="Start planning"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-coral text-white shadow-coral"
        >
          <Icon name="send" size={17} strokeWidth={1.8} />
        </motion.button>
      </motion.form>

      {/* quick filters */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
        className="relative mt-3 flex items-center justify-between gap-2"
      >
        {intentFilters.map((f) => {
          const isActive = filter === f.id;
          return (
            <motion.button
              key={f.id}
              variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
              onClick={() => setFilter(f.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-full border py-1.5 text-[11px] font-semibold transition-colors",
                isActive
                  ? "border-coral/35 bg-coral-faint text-coral-deep"
                  : "border-line bg-surface text-ink-body hover:border-line-strong",
              )}
            >
              <span
                className={cn(
                  "flex size-3 items-center justify-center rounded-full border",
                  isActive ? "border-coral" : "border-ink-faint",
                )}
              >
                <motion.span
                  animate={{ scale: isActive ? 1 : 0 }}
                  transition={spring}
                  className="block size-1.5 rounded-full bg-coral"
                />
              </span>
              {f.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* the plan the user just asked for */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative overflow-hidden"
          >
            <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-coral-faint px-3 py-2">
              <motion.span
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2 }}
                className="text-coral"
              >
                <Icon name="sparkle" size={15} />
              </motion.span>
              <p className="flex-1 text-[11.5px] font-semibold text-ink">
                Drafting a plan for <span className="text-coral-deep">“{plan}”</span>
              </p>
              <button
                onClick={() => setPlan(null)}
                aria-label="Dismiss"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
