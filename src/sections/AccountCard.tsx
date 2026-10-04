import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Avatar } from "../ui/Avatar";
import { CircleButton } from "../ui/primitives";
import { useClickOutside } from "../hooks/useClickOutside";
import { useApp } from "../app/AppContext";
import { useContributions, useMyActivity } from "../app/ContributionsContext";
import { usePreferences } from "../app/PreferencesContext";
import { LANGS, THEMES } from "../data/i18n";
import { ContributionsModal } from "./ContributionsModal";
import { PointsDialog } from "../ui/PointsDialog";
import { navItems, notifications } from "../data/navigation";
import { allRoutes } from "../app/router";
import { artists, albums, playlists } from "../data/library";
import { me } from "../data/account";
import { cn } from "../lib/cn";
import { forwardIcon } from "../lib/rtl";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Card 3 — search + alerts + profile.
 *  One pill: search field, bell and avatar live inside it, so the whole
 *  card is a pill with semicircular ends. Popovers open below it.
 * ------------------------------------------------------------------ */

export function AccountCard() {
  const { route, navigate, notify } = useApp();
  const { t, has, dir } = usePreferences();
  /** nav labels are translated where we have them, otherwise the data label stands */
  const label = (key: string, fallback: string) =>
    has(key) ? t(key) : fallback;
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  /** the lifetime record plus whatever the moderators approved just now */
  const myActivity = useMyActivity();

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
        .map((r) => ({
          id: `page-${r.id}`,
          label: r.label,
          labelKey: `nav.${r.id}`,
          kind: "page",
          icon: "news" as const,
          route: r.id,
        })),
    [],
  );

  const quick = useMemo(
    () => [
      ...navItems.map((n) => ({
        id: n.id,
        label: n.label,
        labelKey: `nav.${n.id}`,
        kind: "page",
        icon: n.icon,
        route: n.id as string,
      })),
      ...extraPages,
    ],
    [extraPages],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [
      ...quick,
      ...artists.map((a) => ({
        id: a.id,
        label: a.name,
        labelKey: "",
        kind: "artist",
        icon: "mic" as const,
        route: undefined,
      })),
      ...albums.map((a) => ({
        id: a.id,
        label: a.title,
        labelKey: "",
        kind: "album",
        icon: "disc" as const,
        route: undefined,
      })),
      ...playlists.map((p) => ({
        id: p.id,
        label: p.name,
        labelKey: "",
        kind: "playlist",
        icon: "music" as const,
        route: undefined,
      })),
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
    <div
      ref={rootRef}
      dir={dir}
      className="flex h-[62px] shrink-0 items-center gap-2 rounded-full bg-surface p-2 shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.05]"
    >
      {/* search */}
      <div ref={searchRef} className="relative">
        <motion.div
          animate={{ width: focused || query ? 330 : 268 }}
          transition={spring}
          className={cn(
            "flex items-center gap-2.5 rounded-full bg-subtle px-4 py-2.5 transition-colors",
            focused || searchOpen
              ? "bg-primary-faint ring-1 ring-primary/25"
              : "ring-1 ring-transparent hover:ring-line",
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
            placeholder={t("account.search")}
            className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label={t("account.clear")}
              className="text-ink-faint transition-colors hover:text-ink"
            >
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
              className="absolute start-0 top-[calc(100%+12px)] z-40 w-[336px] overflow-hidden rounded-panel border border-line bg-surface p-2.5 shadow-float"
            >
              <p className="px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                {query ? t("account.results") : t("account.quickJump")}
              </p>
              {(query ? results : quick).map((r) => (
                <button
                  key={r.id}
                  onClick={() => go(r)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-subtle"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-subtle text-ink-body">
                    <Icon name={r.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
                    {r.labelKey ? label(r.labelKey, r.label) : r.label}
                  </span>
                  <span className="ms-auto rounded-full bg-muted px-2.5 py-1 text-[12px] font-semibold text-ink-muted">
                    {t(`account.kind.${r.kind}`)}
                  </span>
                </button>
              ))}
              {query && results.length === 0 && (
                <p className="px-2.5 py-4 text-center text-[13px] text-ink-muted">
                  {t("account.noMatch", { q: query })}
                </p>
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
          label={t("account.notifications")}
          iconClassName="anim-bell"
          onClick={() => setBellOpen((v) => !v)}
        />
        <span className="pointer-events-none absolute end-2 top-2 size-2 rounded-full bg-primary ring-2 ring-surface" />
        <AnimatePresence>
          {bellOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute end-0 top-[calc(100%+12px)] z-40 w-[292px] rounded-panel border border-line bg-surface p-2.5 shadow-float"
            >
              <p className="px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                {t("account.notifications")}
              </p>
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
                  className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-start transition-colors hover:bg-subtle"
                >
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      n.tone === "primary" && "bg-primary",
                      n.tone === "teal" && "bg-teal",
                      n.tone === "mint" && "bg-mint",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold leading-snug text-ink">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-muted">{n.at}</span>
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
          className="relative ms-0.5"
          aria-label={t("account.account")}
        >
          <Avatar src={me.photo} seed={0} size={40} ring />
          <span className="absolute -bottom-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-mint ring-2 ring-surface">
            <Icon
              name="check"
              size={10}
              strokeWidth={3}
              className="text-white"
            />
          </span>
        </motion.button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute end-0 top-[calc(100%+14px)] z-40"
            >
              <ProfileMenuContent
                onClose={() => setProfileOpen(false)}
                onContributions={() => setContribOpen(true)}
                onPoints={() => {
                  setProfileOpen(false);
                  setPointsOpen(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ContributionsModal
        open={contribOpen}
        onClose={() => setContribOpen(false)}
      />

      <PointsDialog
        open={pointsOpen}
        onClose={() => setPointsOpen(false)}
        subject={{
          name: me.name,
          handle: me.handle,
          photo: me.photo,
          seed: 0,
          meta: me.tier,
          activity: myActivity,
          note: t("points.sessionNote"),
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  The profile popover — identity, points, language and appearance.
 *
 *  Exported on its own so the SSR check can render it without opening the
 *  menu first. Both preferences are written to <html> and localStorage by
 *  PreferencesProvider; nothing here talks to a server.
 * ------------------------------------------------------------------ */

export function ProfileMenuContent({
  onClose,
  onContributions,
  onPoints,
}: {
  onClose: () => void;
  onContributions: () => void;
  /** open the breakdown behind the balance */
  onPoints: () => void;
}) {
  const { t, lang, setLang, theme, setTheme, locale, dir } = usePreferences();
  const { notify } = useApp();
  const { points, submissions } = useContributions();
  const pendingSheets = submissions.filter(
    (s) => s.status === "pending",
  ).length;

  return (
    <div className="w-[252px] rounded-panel border border-line bg-surface p-2.5 shadow-float">
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        <Avatar src={me.photo} seed={0} size={34} />
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-bold text-ink">
            {me.name}
          </span>
          <span className="text-[12px] text-ink-muted">{me.tier}</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onPoints}
        aria-label={t("points.open")}
        title={t("points.open")}
        className="mx-1.5 mb-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-[13px] bg-primary-faint/70 px-3 py-2.5 text-start transition-colors hover:bg-primary-faint"
      >
        <Icon name="star" size={14} className="shrink-0 text-primary-deep" />
        <span className="text-[12.5px] font-bold text-ink">
          {t("account.points", { n: points.toLocaleString(locale) })}
        </span>
        {pendingSheets > 0 && (
          <span className="ms-auto rounded-full bg-primary px-2 py-[1px] text-[12px] font-extrabold text-white">
            {pendingSheets}
          </span>
        )}
        {/* a “drill in” chevron, which is the forward arrow in this direction */}
        <Icon
          name={forwardIcon(dir)}
          size={13}
          strokeWidth={2.2}
          className={cn("shrink-0 text-primary-deep/70", pendingSheets === 0 && "ms-auto")}
        />
      </button>

      {/* preferences — language + appearance, both kept in the browser */}
      <div className="mt-2 rounded-[13px] bg-subtle px-2.5 py-2.5">
        <p className="flex items-center gap-2 px-1 pb-2 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          <Icon name="globe" size={12} strokeWidth={2} />
          {t("pref.language")}
        </p>
        <div className="flex items-center gap-1.5">
          {LANGS.map((option) => (
            <button
              key={option.id}
              onClick={() => setLang(option.id)}
              aria-pressed={lang === option.id}
              title={option.label}
              className={cn(
                "flex-1 rounded-[10px] px-2 py-2 text-[12.5px] font-bold transition-colors",
                lang === option.id
                  ? "bg-primary text-white shadow-primary"
                  : "bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {option.native}
            </button>
          ))}
        </div>

        <p className="flex items-center gap-2 px-1 pb-2 pt-3 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          <Icon
            name={theme === "dark" ? "moon" : "sun"}
            size={12}
            strokeWidth={2}
          />
          {t("pref.appearance")}
        </p>
        <div className="flex items-center gap-1.5">
          {THEMES.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              aria-pressed={theme === option.id}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-[10px] px-2 py-2 text-[12.5px] font-bold transition-colors",
                theme === option.id
                  ? "bg-primary text-white shadow-primary"
                  : "bg-surface text-ink-muted hover:text-ink",
              )}
            >
              <Icon name={option.icon} size={13} strokeWidth={2.1} />
              {t(option.key)}
            </button>
          ))}
        </div>

        <p className="px-0.5 pt-1.5 text-[12px] leading-relaxed text-ink-faint">
          {lang === "fa" ? t("pref.persianNote") : t("pref.note")}
        </p>
      </div>

      <span className="my-1.5 block h-px w-full bg-line" />
      {[
        {
          labelKey: "account.contributions",
          icon: "medal" as const,
          contributions: true,
        },
        { labelKey: "account.yourLibrary", icon: "folder" as const },
        { labelKey: "account.likedTracks", icon: "heart" as const },
        { labelKey: "account.signOut", icon: "arrowUpRight" as const },
      ].map((r) => (
        <button
          key={r.labelKey}
          onClick={() => {
            onClose();
            if (r.contributions) onContributions();
            else notify(t(r.labelKey));
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[14px] font-semibold text-ink-body transition-colors hover:bg-subtle hover:text-ink"
        >
          <Icon name={r.icon} size={15} />
          {t(r.labelKey)}
        </button>
      ))}
    </div>
  );
}
