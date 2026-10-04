import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Avatar } from "../ui/Avatar";
import { CircleButton } from "../ui/primitives";
import { useClickOutside } from "../hooks/useClickOutside";
import { useApp } from "../app/AppContext";
import { navItems, notifications } from "../data/navigation";
import { allRoutes } from "../app/router";
import { artists, albums, playlists } from "../data/library";
import { me } from "../data/account";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Card 3 — search + alerts + profile.
 *  One pill: search field, bell and avatar live inside it, so the whole
 *  card is a pill with semicircular ends. Popovers open below it.
 * ------------------------------------------------------------------ */

export function AccountCard() {
  const { route, navigate, notify } = useApp();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside([searchRef], () => setSearchOpen(false), searchOpen);
  useClickOutside([bellRef], () => setBellOpen(false), bellOpen);
  useClickOutside([profileRef], () => setProfileOpen(false), profileOpen);

  const extraPages = useMemo(
    () =>
      allRoutes
        .filter((r) => !navItems.some((n) => n.id === r.id))
        .map((r) => ({ id: `page-${r.id}`, label: r.label, kind: "Page", icon: "news" as const, route: r.id })),
    [],
  );

  const quick = useMemo(
    () => [
      ...navItems.map((n) => ({ id: n.id, label: n.label, kind: "Page", icon: n.icon, route: n.id as string })),
      ...extraPages,
    ],
    [extraPages],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [
      ...quick,
      ...artists.map((a) => ({ id: a.id, label: a.name, kind: "Artist", icon: "mic" as const, route: undefined })),
      ...albums.map((a) => ({ id: a.id, label: a.title, kind: "Album", icon: "disc" as const, route: undefined })),
      ...playlists.map((p) => ({ id: p.id, label: p.name, kind: "Playlist", icon: "music" as const, route: undefined })),
    ];
    return pool.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 5);
  }, [query, quick]);

  const go = (r: { label: string; route?: string }) => {
    setSearchOpen(false);
    if (r.route) {
      if (route !== r.route) navigate(r.route as typeof route);
    } else {
      notify(`Opened ${r.label}`);
    }
  };

  return (
    <div ref={rootRef} className="flex h-[62px] shrink-0 items-center gap-2 rounded-full bg-surface p-2 shadow-card ring-1 ring-black/[0.03]">
      {/* search */}
      <div ref={searchRef} className="relative">
        <motion.div
          animate={{ width: focused || query ? 330 : 268 }}
          transition={spring}
          className={cn(
            "flex items-center gap-2 rounded-full bg-subtle px-3.5 py-2.5 transition-colors",
            focused || searchOpen ? "bg-primary-faint ring-1 ring-primary/25" : "ring-1 ring-transparent hover:ring-line",
          )}
        >
          <Icon name="search" size={16} className="text-ink-faint" />
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
              <Icon name="close" size={14} />
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
              className="absolute left-0 top-[calc(100%+12px)] z-40 w-[336px] overflow-hidden rounded-panel border border-line bg-surface p-1.5 shadow-float"
            >
              <p className="px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                {query ? "Results" : "Quick jump"}
              </p>
              {(query ? results : quick).map((r) => (
                <button
                  key={r.id}
                  onClick={() => go(r)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-subtle"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-subtle text-ink-body">
                    <Icon name={r.icon} size={15} />
                  </span>
                  <span className="text-[14px] font-semibold text-ink">{r.label}</span>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[12px] font-semibold text-ink-muted">
                    {r.kind}
                  </span>
                </button>
              ))}
              {query && results.length === 0 && (
                <p className="px-2.5 py-4 text-center text-[13px] text-ink-muted">Nothing matches “{query}”.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* alerts */}
      <div ref={bellRef} className="group relative">
        <CircleButton
          icon="bell"
          tone="subtle"
          label="Notifications"
          iconClassName="anim-bell"
          onClick={() => setBellOpen((v) => !v)}
        />
        <span className="pointer-events-none absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-white" />
        <AnimatePresence>
          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute right-0 top-[calc(100%+12px)] z-40 w-[286px] rounded-panel border border-line bg-surface p-2 shadow-float"
            >
              <p className="px-2 py-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">Notifications</p>
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
                    <span className="block text-[13.5px] font-semibold leading-snug text-ink">{n.title}</span>
                    <span className="text-[12px] text-ink-muted">{n.at}</span>
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
          className="relative ml-0.5"
          aria-label="Account"
        >
          <Avatar src={me.photo} seed={0} size={40} ring />
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-mint ring-2 ring-white">
            <Icon name="check" size={10} strokeWidth={3} className="text-white" />
          </span>
        </motion.button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute right-0 top-[calc(100%+14px)] z-40 w-[214px] rounded-panel border border-line bg-surface p-1.5 shadow-float"
            >
              <div className="flex items-center gap-2.5 px-2 py-2">
                <Avatar src={me.photo} seed={0} size={34} />
                <span>
                  <span className="block text-[14px] font-bold text-ink">{me.name}</span>
                  <span className="text-[12px] text-ink-muted">{me.tier}</span>
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[14px] font-semibold text-ink-body transition-colors hover:bg-subtle hover:text-ink"
                >
                  <Icon name={r.icon} size={15} />
                  {r.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
