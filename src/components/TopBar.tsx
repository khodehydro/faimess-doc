import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Logo } from "./Icon";
import { Avatar } from "./Avatar";
import { CircleButton } from "./ui";
import { useClickOutside } from "../hooks/useClickOutside";
import { conversations, navItems, notifications, scheduleEvents } from "../lib/data";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

type Props = {
  active: string;
  onNavigate: (id: string) => void;
  onToast: (text: string, tone?: "coral" | "teal" | "mint") => void;
};

export function TopBar({ active, onNavigate, onToast }: Props) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside([searchRef], () => setSearchOpen(false), searchOpen);
  useClickOutside([bellRef], () => setBellOpen(false), bellOpen);
  useClickOutside([profileRef], () => setProfileOpen(false), profileOpen);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [
      ...navItems.map((n) => ({ id: `nav-${n.id}`, label: n.label, kind: "Page", icon: n.icon })),
      ...scheduleEvents.map((e) => ({ id: e.id, label: e.title, kind: "Event", icon: "calendar" as const })),
      ...conversations.map((c) => ({ id: c.id, label: c.name, kind: "Chat", icon: "message" as const })),
    ];
    return pool.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  return (
    <header className="flex flex-wrap items-center gap-3 px-5 py-3">
      {/* brand */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex shrink-0 items-center gap-2.5"
      >
        <Logo size={30} />
        <span className="text-[19px] font-extrabold tracking-[-0.03em] text-ink">Fiplan</span>
      </motion.div>

      {/* segmented navigation */}
      <nav className="ml-0 flex items-center gap-0.5 rounded-full bg-subtle p-1 lg:ml-4">
        {navItems.map((item, i) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 * i, ease: EASE }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                isActive ? "text-white" : "text-ink-body hover:text-ink",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-coral shadow-coral"
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon name={item.icon} size={16} strokeWidth={isActive ? 1.9 : 1.6} />
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        {/* search */}
        <div ref={searchRef} className="relative hidden md:block">
          <motion.div
            animate={{ width: focused || query ? 300 : 250 }}
            transition={spring}
            className={cn(
              "flex items-center gap-2 rounded-full border bg-surface px-3.5 py-2 transition-colors",
              focused || searchOpen ? "border-coral/40 shadow-sm" : "border-line",
            )}
          >
            <Icon name="search" size={15} className="text-ink-faint" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                setFocused(true);
                setSearchOpen(true);
              }}
              onBlur={() => setFocused(false)}
              placeholder="Search here..."
              className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </motion.div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute right-0 top-[calc(100%+10px)] z-40 w-[300px] overflow-hidden rounded-panel border border-line bg-surface p-1.5 shadow-float"
              >
                <p className="px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                  {query ? "Results" : "Quick jump"}
                </p>
                {(query ? results : navItems.slice(0, 4).map((n) => ({ id: n.id, label: n.label, kind: "Page", icon: n.icon }))).map(
                  (r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSearchOpen(false);
                        onToast(`Opened ${r.label}`);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-subtle"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-subtle text-ink-body">
                        <Icon name={r.icon} size={14} />
                      </span>
                      <span className="text-[12.5px] font-semibold text-ink">{r.label}</span>
                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                        {r.kind}
                      </span>
                    </button>
                  ),
                )}
                {query && results.length === 0 && (
                  <p className="px-2.5 py-4 text-center text-[12px] text-ink-muted">
                    Nothing matches “{query}”.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* notifications */}
        <div ref={bellRef} className="relative">
          <CircleButton
            icon="bell"
            tone="white"
            label="Notifications"
            iconClassName="anim-bell"
            onClick={() => setBellOpen((v) => !v)}
          />
          <span className="pointer-events-none absolute right-2.5 top-2 size-2 rounded-full bg-coral ring-2 ring-white" />
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute right-0 top-[calc(100%+10px)] z-40 w-[268px] rounded-panel border border-line bg-surface p-2 shadow-float"
              >
                <p className="px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                  Notifications
                </p>
                {notifications.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    onClick={() => {
                      setBellOpen(false);
                      onToast(n.title, n.tone);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-subtle"
                  >
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        n.tone === "coral" && "bg-coral",
                        n.tone === "teal" && "bg-teal",
                        n.tone === "mint" && "bg-mint",
                      )}
                    />
                    <span>
                      <span className="block text-[12px] font-semibold leading-snug text-ink">{n.title}</span>
                      <span className="text-[10.5px] text-ink-muted">{n.at}</span>
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* profile */}
        <div ref={profileRef} className="relative">
          <motion.button
            onClick={() => setProfileOpen((v) => !v)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="relative"
            aria-label="Account"
          >
            <Avatar seed={0} size={38} ring />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-mint ring-2 ring-white">
              <Icon name="check" size={9} strokeWidth={3} className="text-white" />
            </span>
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute right-0 top-[calc(100%+12px)] z-40 w-[196px] rounded-panel border border-line bg-surface p-1.5 shadow-float"
              >
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <Avatar seed={0} size={32} />
                  <span>
                    <span className="block text-[12.5px] font-bold text-ink">Wendy</span>
                    <span className="text-[10.5px] text-ink-muted">Explorer · Pro</span>
                  </span>
                </div>
                <span className="my-1 block h-px w-full bg-line" />
                {[
                  { label: "My trips", icon: "map" as const },
                  { label: "Saved places", icon: "star" as const },
                  { label: "Sign out", icon: "arrowUpRight" as const },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => {
                      setProfileOpen(false);
                      onToast(r.label);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12.5px] font-semibold text-ink-body transition-colors hover:bg-subtle hover:text-ink"
                  >
                    <Icon name={r.icon} size={14} />
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
