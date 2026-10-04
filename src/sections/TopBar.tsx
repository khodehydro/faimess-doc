import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { Avatar } from "../ui/Avatar";
import { CircleButton } from "../ui/primitives";
import { useClickOutside } from "../hooks/useClickOutside";
import { useApp } from "../app/AppContext";
import { navItems, notifications } from "../data/navigation";
import { allRoutes } from "../app/router";
import { artists, albums, playlists } from "../data/library";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Top bar — brand, page switcher, search, alerts and profile.
 * ------------------------------------------------------------------ */

export function TopBar() {
  const { route, navigate, notify } = useApp();
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

  const quick = useMemo(
    () =>
      navItems.map((n) => ({ id: n.id, label: n.label, kind: "Page", icon: n.icon })),
    [],
  );

  /** news + any other page that lives outside the nav */
  const extraPages = useMemo(
    () =>
      allRoutes
        .filter((r) => !navItems.some((n) => n.id === r.id))
        .map((r) => ({ id: `page-${r.id}`, label: r.label, kind: "Page", icon: "news" as const, route: r.id })),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [
      ...navItems.map((n) => ({ id: `nav-${n.id}`, label: n.label, kind: "Page", icon: n.icon })),
      ...artists.map((a) => ({ id: a.id, label: a.name, kind: "Artist", icon: "mic" as const })),
      ...albums.map((a) => ({ id: a.id, label: a.title, kind: "Album", icon: "disc" as const })),
      ...playlists.map((p) => ({ id: p.id, label: p.name, kind: "Playlist", icon: "music" as const })),
      ...extraPages.map((p) => ({ id: p.id, label: p.label, kind: "Page", icon: p.icon })),
    ];
    return pool.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 5);
  }, [query, extraPages]);

  return (
    <header className="flex items-center gap-3 px-5 py-3.5">
      {/* brand */}
      <motion.button
        onClick={() => navigate("home")}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex shrink-0 items-center gap-2.5"
        aria-label="FAIMESS home"
      >
        <Logo size={32} />
        <span className="font-display text-[20px] font-extrabold tracking-[-0.04em] text-ink">FAIMESS</span>
      </motion.button>

      {/* page switcher */}
      <nav className="ml-4 flex items-center gap-0.5 rounded-full bg-subtle p-1">
        {navItems.map((item, i) => {
          const isActive = route === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.id)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * i, ease: EASE }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[14.5px] font-semibold transition-colors",
                isActive ? "text-white" : "text-ink-body hover:text-ink",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full bg-primary shadow-primary"
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon name={item.icon} size={16.5} strokeWidth={isActive ? 1.9 : 1.6} />
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        {/* search */}
        <div ref={searchRef} className="relative">
          <motion.div
            animate={{ width: focused || query ? 336 : 276 }}
            transition={spring}
            className={cn(
              "flex items-center gap-2 rounded-full border bg-surface px-3.5 py-2 transition-colors",
              focused || searchOpen ? "border-primary/40 shadow-sm" : "border-line",
            )}
          >
            <Icon name="search" size={16.5} className="text-ink-faint" />
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
              placeholder="Search artists, albums..."
              className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="text-ink-faint transition-colors hover:text-ink">
                <Icon name="close" size={14.5} />
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
                className="absolute right-0 top-[calc(100%+10px)] z-40 w-[336px] overflow-hidden rounded-panel border border-line bg-surface p-1.5 shadow-float"
              >
                <p className="px-2.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">
                  {query ? "Results" : "Quick jump"}
                </p>
                {(query ? results : [...quick, ...extraPages]).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSearchOpen(false);
                      const target = (r as { route?: string }).route;
                      if (target) navigate(target as typeof route);
                      else notify(`Opened ${r.label}`);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-subtle"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-subtle text-ink-body">
                      <Icon name={r.icon} size={15.5} />
                    </span>
                    <span className="text-[14.5px] font-semibold text-ink">{r.label}</span>
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[12.5px] font-semibold text-ink-muted">
                      {r.kind}
                    </span>
                  </button>
                ))}
                {query && results.length === 0 && (
                  <p className="px-2.5 py-4 text-center text-[14px] text-ink-muted">Nothing matches “{query}”.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* alerts */}
        <div ref={bellRef} className="group relative">
          <CircleButton
            icon="bell"
            tone="white"
            label="Notifications"
            iconClassName="anim-bell"
            onClick={() => setBellOpen((v) => !v)}
          />
          <span className="pointer-events-none absolute right-2.5 top-2 size-2 rounded-full bg-primary ring-2 ring-white" />
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute right-0 top-[calc(100%+10px)] z-40 w-[270px] rounded-panel border border-line bg-surface p-2 shadow-float"
              >
                <p className="px-2 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-ink-faint">Notifications</p>
                {notifications.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    onClick={() => {
                      setBellOpen(false);
                      notify(n.title, n.tone);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-subtle"
                  >
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        n.tone === "primary" && "bg-primary",
                        n.tone === "teal" && "bg-teal",
                        n.tone === "mint" && "bg-mint",
                      )}
                    />
                    <span>
                      <span className="block text-[14px] font-semibold leading-snug text-ink">{n.title}</span>
                      <span className="text-[13px] text-ink-muted">{n.at}</span>
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
              <Icon name="check" size={11} strokeWidth={3} className="text-white" />
            </span>
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute right-0 top-[calc(100%+12px)] z-40 w-[198px] rounded-panel border border-line bg-surface p-1.5 shadow-float"
              >
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <Avatar seed={0} size={32} />
                  <span>
                    <span className="block text-[14.5px] font-bold text-ink">Wendy</span>
                    <span className="text-[13px] text-ink-muted">Listener · Premium</span>
                  </span>
                </div>
                <span className="my-1 block h-px w-full bg-line" />
                {[
                  { label: "Your library", icon: "folder" as const },
                  { label: "Liked tracks", icon: "heart" as const },
                  { label: "Sign out", icon: "arrowUpRight" as const },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => {
                      setProfileOpen(false);
                      notify(r.label);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14.5px] font-semibold text-ink-body transition-colors hover:bg-subtle hover:text-ink"
                  >
                    <Icon name={r.icon} size={15.5} />
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
