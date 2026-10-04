import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { TopBar } from "./components/TopBar";
import { TripHero } from "./components/TripHero";
import { SchedulePanel } from "./components/SchedulePanel";
import { GreetingPanel } from "./components/GreetingPanel";
import { ChatPanel } from "./components/ChatPanel";
import { Icon } from "./components/Icon";
import { navItems } from "./lib/data";
import { cn } from "./lib/cn";
import { EASE, spring } from "./lib/motion";

type Tone = "coral" | "teal" | "mint";

export default function App() {
  const [activeNav, setActiveNav] = useState("home");
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; tone: Tone }>>([]);

  const pushToast = useCallback((text: string, tone: Tone = "coral") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2900);
  }, []);

  const activeLabel = navItems.find((n) => n.id === activeNav)?.label ?? "Home";

  return (
    <MotionConfig reducedMotion="user">
      <div className="studio-backdrop min-h-dvh w-full px-3 py-5 sm:px-6 sm:py-8">
        <motion.main
          initial={{ opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="mx-auto w-full max-w-[1336px] overflow-hidden rounded-frame bg-surface shadow-frame ring-1 ring-black/[0.035]"
        >
          <TopBar active={activeNav} onNavigate={setActiveNav} onToast={pushToast} />

          <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1.66fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              >
                <TripHero onToast={(t) => pushToast(t)} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              >
                <SchedulePanel onToast={(t) => pushToast(t)} />
              </motion.div>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              >
                <GreetingPanel onToast={(t) => pushToast(t)} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
                className="flex-1"
              >
                <ChatPanel onToast={pushToast} />
              </motion.div>
            </div>
          </div>

          {/* breadcrumb strip — keeps the frame grounded when navigating */}
          <div className="flex items-center justify-between px-5 pb-4 text-[10.5px] text-ink-faint">
            <span className="flex items-center gap-1.5">
              <Icon name="compass" size={12} />
              Fiplan workspace · {activeLabel}
            </span>
            <span>Warm-minimal travel planner · v0.1</span>
          </div>
        </motion.main>

        {/* toasts */}
        <div className="pointer-events-none fixed left-1/2 top-6 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={spring}
                className={cn(
                  "pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 py-2 pl-3 pr-4 text-[11.5px] font-semibold text-ink shadow-float ring-1 ring-black/[0.04] backdrop-blur",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-white",
                    t.tone === "coral" && "bg-coral",
                    t.tone === "teal" && "bg-teal",
                    t.tone === "mint" && "bg-mint",
                  )}
                >
                  <Icon name="check" size={11} strokeWidth={2.8} />
                </span>
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
