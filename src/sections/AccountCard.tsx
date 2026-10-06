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
import { useAuth } from "../app/AuthContext";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { PointsDialog } from "../ui/PointsDialog";
import { navItems, notifications, type Notification } from "../data/navigation";
import { allRoutes } from "../app/router";
import { artists, albums, playlists } from "../data/library";
import { me } from "../data/account";
import { cn } from "../lib/cn";
import { forwardIcon } from "../lib/rtl";
import { EASE, spring } from "../lib/motion";
import { usePwaInstall } from "../lib/pwa";
import { usePlayer } from "../app/PlayerContext";
import { trackById } from "../data/player";
import { socialApi } from "../api/socialApi";

/* ------------------------------------------------------------------ *
 *  Card 3 — search + alerts + profile.
 *  One pill on desktop; on compact layouts the search, notification bell
 *  and profile can be placed independently around the centred brand. Popovers
 *  open below their own control.
 * ------------------------------------------------------------------ */

/**
 * The search field, the bell and the avatar — together in one pill on
 * desktop, and split apart on phones: the compact shell takes the search
 * out as a full-width capsule of its own and places the notification and
 * profile controls on opposite sides of the centred brand. `part` asks for
 * one section; the desktop call site passes nothing and gets the whole pill.
 */
export function AccountCard({
  part = "all",
  className,
}: {
  part?: "all" | "search" | "controls" | "notification" | "profile";
  className?: string;
} = {}) {
  const { route, navigate, notify, openDetail, openNews, openProfile } = useApp();
  const { play } = usePlayer();
  const { t, has, dir, dataLabel, lang } = usePreferences();
  const { signOut, signedIn } = useAuth();
  /** the menu is inside a popover that closes on click, so the dialog the
      `Sign out` row asks for has to live here, one level up from the menu */
  const [signOutOpen, setSignOutOpen] = useState(false);
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
  const [notifList, setNotifList] = useState<Notification[]>(notifications);
  const unreadCount = notifList.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifList((list) => list.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n: Notification) => {
    setBellOpen(false);
    setNotifList((list) =>
      list.map((item) => (item.id === n.id ? { ...item, unread: false } : item)),
    );

    if (n.newsId) {
      openNews(n.newsId);
      return;
    }
    if (n.trackId) {
      const tr = trackById(n.trackId);
      if (tr) play(tr);
      notify(t(n.textKey, n.vars), n.tone === "flame" ? "primary" : n.tone);
      return;
    }
    if (n.albumId) {
      openDetail({ kind: "album", id: n.albumId });
      return;
    }
    if (n.playlistId) {
      openDetail({ kind: "playlist", id: n.playlistId });
      return;
    }
    if (n.points) {
      setPointsOpen(true);
      return;
    }

    notify(t(n.textKey, n.vars), n.tone === "flame" ? "primary" : n.tone);
  };
  const showSearch = part === "all" || part === "search";
  const showNotifications = part === "all" || part === "controls" || part === "notification";
  const showProfile = part === "all" || part === "controls" || part === "profile";
  const isolatedControl = part === "notification" || part === "profile";
  const glassSurface = isolatedControl || part === "search";

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
    const rawQ = query.trim().toLowerCase();
    if (!rawQ) return [];
    const cleanQ = rawQ.replace(/^@/, "");

    const pool = [
      ...quick,
      ...artists.map((a) => ({
        id: a.id,
        label: a.name,
        labelKey: "",
        kind: "artist",
        icon: "mic" as const,
        route: undefined,
        username: undefined,
      })),
      ...albums.map((a) => ({
        id: a.id,
        label: a.title,
        labelKey: "",
        kind: "album",
        icon: "disc" as const,
        route: undefined,
        username: undefined,
      })),
      ...playlists.map((p) => ({
        id: p.id,
        label: p.name,
        labelKey: "",
        kind: "playlist",
        icon: "music" as const,
        route: undefined,
        username: undefined,
      })),
      ...socialApi.getAllSearchableUsers().map((u) => ({
        id: u.username,
        label: `${u.displayName} (${u.handle})`,
        labelKey: "",
        kind: "user",
        icon: "users" as const,
        route: undefined,
        username: u.username,
      })),
    ];

    return pool
      .filter((p) => {
        if (p.kind === "user") {
          const userSlug = "username" in p && typeof p.username === "string" ? p.username.toLowerCase() : "";
          return (
            p.label.toLowerCase().includes(rawQ) ||
            p.id.toLowerCase().includes(cleanQ) ||
            userSlug.includes(cleanQ)
          );
        }
        return p.label.toLowerCase().includes(rawQ);
      })
      .slice(0, 6);
  }, [query, quick]);

  /** a search hit for a playlist / artist / album opens it in the content
   *  card — user opens profile — only plain pages change route */
  const go = (r: { label: string; route?: string; id?: string; kind?: string; username?: string }) => {
    setSearchOpen(false);
    if (r.kind === "user" && (r.username || r.id)) {
      openProfile(r.username || r.id);
      return;
    }
    if ((r.kind === "artist" || r.kind === "album" || r.kind === "playlist") && r.id) {
      openDetail({ kind: r.kind, id: r.id });
      return;
    }
    if (r.route) {
      if (route !== r.route) navigate(r.route as typeof route);
    } else {
      notify(t("toast.opened", { name: r.label }));
    }
  };

  return (
    <div
      ref={rootRef}
      dir={dir}
      className={cn(
        "flex shrink-0 items-center gap-2",
        glassSurface
          ? "bg-white/80 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-surface/80 dark:ring-white/[0.06]"
          : "bg-surface shadow-card ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
        isolatedControl && "h-[52px] w-[52px] justify-center rounded-full p-1",
        /* the compact search is a capsule of its own: `rounded-full` on a
           card with no fixed height leaves both ends true semicircles, the
           same shape the desktop pill has */
        part === "search"
          ? "rounded-full p-2"
          : part === "controls"
            ? "h-[56px] rounded-full p-1.5"
            : part === "all"
              ? "h-[62px] rounded-full p-2"
              : "",
        className,
      )}
    >
      {showSearch && (
        <div ref={searchRef} className={cn("relative", part === "search" && "min-w-0 flex-1")}>
          <motion.div
            animate={{ width: part === "search" ? "100%" : focused || query ? 330 : 268 }}
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
                className={cn(
                  "absolute top-[calc(100%+12px)] z-40 overflow-hidden rounded-panel border border-line bg-surface p-2.5 shadow-float",
                  part === "search"
                    ? "inset-x-0"
                    : "start-0 w-[336px]",
                )}
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
      )}

      {showNotifications && (
        <div ref={bellRef} className="group relative">
          <CircleButton
            icon="bell"
            tone="subtle"
            label={t("account.notifications")}
            iconClassName="anim-bell"
            onClick={() => setBellOpen((v) => !v)}
          />
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute end-1.5 top-1.5 flex size-2.5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary ring-2 ring-surface" />
            </span>
          )}
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className={cn(
                  "absolute top-[calc(100%+12px)] z-40 w-[310px] sm:w-[340px] rounded-panel border border-line bg-surface p-2.5 shadow-float",
                  part === "notification" ? "left-0" : "end-0",
                )}
              >
                <div className="flex items-center justify-between border-b border-line px-2 pb-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">
                      {t("account.notifications")}
                    </p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[12px] font-bold text-primary-deep">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-[12px] font-semibold text-primary transition-colors hover:text-primary-deep"
                      >
                        {t("notif.markAllRead")}
                      </button>
                    )}
                    {notifList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNotifList([])}
                        className="text-[12px] font-semibold text-ink-faint transition-colors hover:text-rose-500"
                      >
                        {lang === "fa" ? "پاکسازی" : "Clear"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-1.5 max-h-[380px] overflow-y-auto scroll-slim space-y-1">
                  {notifList.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-ink-muted">
                      {t("notif.empty")}
                    </div>
                  ) : (
                    notifList.map((n, i) => (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i, duration: 0.25 }}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "group flex w-full items-start gap-2.5 rounded-xl p-2.5 text-start transition-colors",
                          n.unread
                            ? "bg-primary-soft/30 hover:bg-primary-soft/50"
                            : "hover:bg-subtle",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-white shadow-xs",
                            n.tone === "primary" && "bg-primary",
                            n.tone === "teal" && "bg-teal",
                            n.tone === "mint" && "bg-mint",
                            n.tone === "flame" && "bg-flame",
                          )}
                        >
                          <Icon name={n.icon ?? "bell"} size={13} strokeWidth={2.2} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">
                            {t(n.textKey, n.vars)}
                          </span>
                          <span className="mt-1 flex items-center justify-between text-[12px] text-ink-muted">
                            <span>{dataLabel(n.at)}</span>
                            {n.unread && (
                              <span className="size-1.5 rounded-full bg-primary" />
                            )}
                          </span>
                        </span>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showProfile && (
        <div ref={profileRef} className="relative">
          <motion.button
            onClick={() => setProfileOpen((v) => !v)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="relative ms-0.5"
            aria-label={t("account.account")}
          >
            {/* nobody signed in ⇒ nobody's face: the control shows the
                guest mark, and the menu behind it is where an account is made */}
            {signedIn ? (
              <>
                <Avatar src={me.photo} seed={0} size={40} ring />
                <span className="absolute -bottom-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-mint ring-2 ring-surface">
                  <Icon
                    name="check"
                    size={10}
                    strokeWidth={3}
                    className="text-white"
                  />
                </span>
              </>
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink-muted ring-1 ring-line">
                <Icon name="users" size={17} strokeWidth={2} />
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className={cn(
                  "absolute top-[calc(100%+14px)] z-40",
                  part === "profile" ? "right-0" : "end-0",
                )}
              >
                <ProfileMenuContent
                  onClose={() => setProfileOpen(false)}
                  onContributions={() => setContribOpen(true)}
                  onSignOut={() => setSignOutOpen(true)}
                  onPoints={() => {
                    setProfileOpen(false);
                    setPointsOpen(true);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ContributionsModal
        open={contribOpen}
        onClose={() => setContribOpen(false)}
      />

      {/* the one destructive row in the account menu — it asks first, and
          the safe answer is the button nearest the thumb (subtle, full width,
          under the tinted confirm) */}
      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          signOut();
          notify(t("account.signedOut"), "primary");
        }}
        title={t("account.signOutTitle")}
        body={t("account.signOutBody")}
        confirmKey="account.signOutConfirm"
        cancelKey="account.signOutCancel"
        icon="lock"
      />

      <PointsDialog
        open={pointsOpen}
        onClose={() => setPointsOpen(false)}
        subject={{
          name: me.name,
          handle: me.handle,
          photo: me.photo,
          seed: 0,
          meta: dataLabel(me.tier),
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
  onSignOut,
}: {
  onClose: () => void;
  onContributions: () => void;
  /** open the breakdown behind the balance */
  onPoints: () => void;
  /** signing out asks first, so the row only raises the question */
  onSignOut: () => void;
}) {
  const { t, lang, setLang, theme, setTheme, locale, dir, dataLabel } = usePreferences();
  const { notify, navigate } = useApp();
  const { signedIn, isAdmin, openAccount } = useAuth();
  const { points, submissions } = useContributions();
  const { canInstall, isInstalled, isIOS, isAndroid, isSecure, install } = usePwaInstall();
  const pendingSheets = submissions.filter(
    (s) => s.status === "pending",
  ).length;

  const handlePwa = async () => {
    onClose();
    if (isInstalled) {
      notify(t("pwa.installed"), "primary");
      return;
    }
    if (canInstall) {
      const ok = await install();
      if (ok) notify(t("pwa.installedToast"), "mint");
    } else if (isIOS) {
      notify(t("pwa.iosGuide"), "primary");
    } else if (isAndroid) {
      if (!isSecure) {
        notify(t("pwa.insecureNotice"), "primary");
      } else {
        notify(t("pwa.androidGuide"), "primary");
      }
    } else {
      notify(t("pwa.installPrompt"), "primary");
    }
  };

  return (
    <div className="w-[252px] rounded-panel border border-line bg-surface p-2.5 shadow-float">
      {signedIn ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("profile");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-start transition-colors hover:bg-subtle"
        >
          <Avatar src={me.photo} seed={0} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-ink">
              {me.name}
            </span>
            <span className="text-[12px] text-ink-muted">{dataLabel(me.tier)}</span>
          </span>
          <Icon name={forwardIcon(dir)} size={13} className="text-ink-faint" />
        </button>
      ) : (
        /* the guest header tells the truth about who is looking and offers
           the one thing the menu is for at that point: an account */
        <div className="px-2.5 py-2">
          <div className="flex items-center gap-3">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-subtle text-ink-muted ring-1 ring-line">
              <Icon name="users" size={15} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-bold text-ink">
                {t("account.guest")}
              </span>
              <span className="text-[12px] text-ink-muted">{t("auth.role")}</span>
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
            {t("account.guestBody")}
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              openAccount();
            }}
            className="mt-2.5 flex h-[38px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[13px] font-bold text-white shadow-primary transition-colors hover:bg-primary-deep"
          >
            <Icon name="lock" size={14} strokeWidth={2.2} />
            {t("account.enter")}
          </button>
        </div>
      )}

      {/* points only exist for an account, so the row only exists with one */}
      {signedIn && (
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
      )}

      {/* admin console link for administrative staff */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("admin");
          }}
          className="mx-1.5 mb-1.5 flex w-[calc(100%-12px)] items-center justify-between rounded-[13px] border border-primary/30 bg-primary/10 px-3 py-2 text-start transition-colors hover:bg-primary/20"
        >
          <div className="flex items-center gap-2">
            <Icon name="crown" size={14} className="text-primary-deep" />
            <span className="text-[12px] font-bold text-primary-deep">
              {t("admin.console")}
            </span>
          </div>
          <Icon name={forwardIcon(dir)} size={12} className="text-primary-deep/70" />
        </button>
      )}

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

        {!isInstalled && (
          <button
            onClick={handlePwa}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary/10 px-2.5 py-1.5 text-[12px] font-bold text-primary-deep transition-colors hover:bg-primary/20"
          >
            <Icon name="bolt" size={13} strokeWidth={2.2} />
            <span>{t("pwa.installButton")}</span>
          </button>
        )}
      </div>

      {/* everything below belongs to somebody: your contributions, your
          library, your liked tracks — and the way out. A guest gets none of
          those rows, because none of them are theirs yet */}
      {signedIn && (
        <>
      <span className="my-1.5 block h-px w-full bg-line" />
      {[
        {
          labelKey: "account.profile",
          icon: "users" as const,
          action: () => navigate("profile"),
        },
        {
          labelKey: "account.contributions",
          icon: "medal" as const,
          contributions: true,
        },
        { labelKey: "account.yourLibrary", icon: "folder" as const },
        { labelKey: "account.likedTracks", icon: "heart" as const },
        {
          labelKey: "account.signOut",
          icon: "arrowUpRight" as const,
          signOut: true,
        },
      ].map((r) => (
        <button
          key={r.labelKey}
          onClick={() => {
            onClose();
            if (r.action) r.action();
            else if (r.contributions) onContributions();
            else if (r.signOut) onSignOut();
            else notify(t(r.labelKey));
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[14px] font-semibold text-ink-body transition-colors hover:bg-subtle hover:text-ink"
        >
          <Icon name={r.icon} size={15} />
          {t(r.labelKey)}
        </button>
      ))}
        </>
      )}
    </div>
  );
}
