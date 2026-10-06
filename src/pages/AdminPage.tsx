import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { useAuth } from "../app/AuthContext";
import { adminApi, type AdminOverviewStats, type AdminUserRole } from "../api/adminApi";
import { Icon, type IconName } from "../ui/Icon";
import { toman } from "../data/shop";
import { forwardIcon } from "../lib/rtl";
import { cn } from "../lib/cn";
import type { Artist } from "../data/library";
import type { NewsItem } from "../data/feed";
import type { ShopCategoryId } from "../data/shop";

/* ------------------------------------------------------------------ *
 *  FAIMESS Super Admin Console — Master Management Dashboard
 *  Full-featured administrative cockpit for music catalog, editorial,
 *  community moderation, user access control, and platform analytics.
 * ------------------------------------------------------------------ */

type AdminTab =
  | "overview"
  | "tracks"
  | "artists"
  | "albums"
  | "news"
  | "moderation"
  | "shop"
  | "users";

export function AdminPage() {
  const { t, locale, dir } = usePreferences();
  const { navigate, notify } = useApp();
  const { isAdmin, openAccount } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminOverviewStats>(() => adminApi.getOverviewStats());
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [newTrackArtist, setNewTrackArtist] = useState("NOVAE");
  const [newTrackAlbum, setNewTrackAlbum] = useState("Afterglow");
  const [newTrackDuration, setNewTrackDuration] = useState("3:24");

  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistKind, setNewArtistKind] = useState<Artist["kind"]>("Boy group");
  const [newArtistGenre, setNewArtistGenre] = useState("Electro pop");

  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsTag, setNewNewsTag] = useState<NewsItem["tag"]>("Tour");
  const [newNewsExcerpt, setNewNewsExcerpt] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Exclude<ShopCategoryId, "all">>("apparel");
  const [newProdPrice, setNewProdPrice] = useState(1500000);

  // Synchronize with reactive updates from adminApi
  const refreshData = useCallback(() => {
    setStats(adminApi.getOverviewStats());
  }, []);

  useEffect(() => {
    return adminApi.subscribe(refreshData);
  }, [refreshData]);

  // Auth gate
  if (!isAdmin) {
    return (
      <div className="flex min-h-[520px] w-full flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-[24px] border border-line bg-surface p-6 shadow-card sm:p-8"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-deep ring-1 ring-primary/20">
            <Icon name="lock" size={26} strokeWidth={2.2} />
          </div>

          <h2 className="mt-4 text-center font-display text-[20px] font-bold tracking-tight text-ink">
            {t("admin.loginPrompt")}
          </h2>
          <p className="mt-2 text-center text-[13px] leading-relaxed text-ink-muted">
            {t("admin.loginDesc")}
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => openAccount("admin.loginPrompt")}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[13.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
            >
              <Icon name="lock" size={15} />
              <span>{t("admin.loginButton")}</span>
            </button>

            <button
              type="button"
              onClick={() => openAccount("admin.loginPrompt")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-primary/30 bg-primary/5 text-[12.5px] font-bold text-primary-deep transition hover:bg-primary/10"
            >
              <Icon name="sparkle" size={14} />
              <span>{t("admin.fastLogin")}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("home")}
              className="mt-3 flex w-full justify-center text-[12.5px] font-semibold text-ink-muted hover:text-ink"
            >
              {t("admin.exitConsole")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------- Tab Navigation Config -------------------------- */

  const TABS: { id: AdminTab; labelKey: string; icon: IconName }[] = [
    { id: "overview", labelKey: "admin.tab.overview", icon: "activity" },
    { id: "tracks", labelKey: "admin.tab.tracks", icon: "music" },
    { id: "artists", labelKey: "admin.tab.artists", icon: "mic" },
    { id: "albums", labelKey: "admin.tab.albums", icon: "disc" },
    { id: "news", labelKey: "admin.tab.news", icon: "news" },
    { id: "moderation", labelKey: "admin.tab.moderation", icon: "message" },
    { id: "shop", labelKey: "admin.tab.shop", icon: "shop" },
    { id: "users", labelKey: "admin.tab.users", icon: "users" },
  ];

  /* ---------------- Handlers --------------------------------------- */

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;
    adminApi.createTrack({
      title: newTrackTitle.trim(),
      artist: newTrackArtist,
      album: newTrackAlbum,
      duration: newTrackDuration,
    });
    setTrackModalOpen(false);
    setNewTrackTitle("");
    notify(t("admin.savedToast"), "mint");
  };

  const handleCreateArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    adminApi.createArtist({
      name: newArtistName.trim(),
      kind: newArtistKind,
      genre: newArtistGenre,
      verified: true,
      newRelease: true,
    });
    setArtistModalOpen(false);
    setNewArtistName("");
    notify(t("admin.savedToast"), "mint");
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim()) return;
    adminApi.createNews({
      title: newNewsTitle.trim(),
      tag: newNewsTag,
      source: "FAIMESS Desk",
      excerpt: newNewsExcerpt || newNewsTitle,
      bodyParagraphs: ["Detailed article coverage."],
    });
    setNewsModalOpen(false);
    setNewNewsTitle("");
    setNewNewsExcerpt("");
    notify(t("admin.savedToast"), "mint");
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    adminApi.createProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: newProdPrice,
      badge: "new",
    });
    setProductModalOpen(false);
    setNewProdName("");
    notify(t("admin.savedToast"), "mint");
  };

  /* ---------------- Render ----------------------------------------- */

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-[22px] border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-primary">
              <Icon name="crown" size={17} strokeWidth={2.4} />
            </span>
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-ink sm:text-[26px]">
              {t("admin.title")}
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-extrabold uppercase text-primary-deep">
              Super Admin
            </span>
          </div>
          <p className="mt-1 text-[13px] text-ink-muted">{t("admin.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              adminApi.resetDatabase();
              notify(t("admin.savedToast"), "mint");
            }}
            className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-subtle px-3 text-[12px] font-bold text-ink-body transition hover:bg-surface"
          >
            <Icon name="sparkle" size={13} />
            <span>{t("admin.resetDb")}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
          >
            <Icon name={forwardIcon(dir)} size={13} />
            <span>{t("admin.exitConsole")}</span>
          </button>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-rail">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all",
                active
                  ? "bg-primary text-white shadow-primary"
                  : "bg-surface border border-line/60 text-ink-muted hover:text-ink hover:bg-subtle",
              )}
            >
              <Icon name={tab.icon} size={15} strokeWidth={2.2} />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------- TAB: OVERVIEW ----------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card sm:p-5">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">
              {t("admin.quickActions")}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setTrackModalOpen(true)}
                className="flex items-center gap-2 rounded-[12px] bg-primary/10 px-3.5 py-2 text-[12.5px] font-bold text-primary-deep transition hover:bg-primary/20"
              >
                <Icon name="plus" size={14} strokeWidth={2.4} />
                <span>{t("admin.action.addTrack")}</span>
              </button>
              <button
                type="button"
                onClick={() => setArtistModalOpen(true)}
                className="flex items-center gap-2 rounded-[12px] bg-teal-soft px-3.5 py-2 text-[12.5px] font-bold text-teal-deep transition hover:opacity-85"
              >
                <Icon name="plus" size={14} strokeWidth={2.4} />
                <span>{t("admin.action.addArtist")}</span>
              </button>
              <button
                type="button"
                onClick={() => setNewsModalOpen(true)}
                className="flex items-center gap-2 rounded-[12px] bg-flame-soft px-3.5 py-2 text-[12.5px] font-bold text-flame-deep transition hover:opacity-85"
              >
                <Icon name="plus" size={14} strokeWidth={2.4} />
                <span>{t("admin.action.addNews")}</span>
              </button>
              <button
                type="button"
                onClick={() => setProductModalOpen(true)}
                className="flex items-center gap-2 rounded-[12px] bg-mint-soft px-3.5 py-2 text-[12.5px] font-bold text-teal-deep transition hover:opacity-85"
              >
                <Icon name="plus" size={14} strokeWidth={2.4} />
                <span>{t("admin.action.addProduct")}</span>
              </button>
            </div>
          </div>

          {/* 6 Metric KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.streams")}</span>
              <p className="mt-1 font-display text-[22px] font-extrabold text-ink">
                {stats.totalStreams.toLocaleString(locale)}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-mint-deep">↑ +14% weekly</span>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.listeners")}</span>
              <p className="mt-1 font-display text-[22px] font-extrabold text-ink">
                {stats.activeListenersToday.toLocaleString(locale)}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-mint-deep">● Live</span>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.reported")}</span>
              <p className="mt-1 font-display text-[22px] font-extrabold text-flame-deep">
                {stats.reportedComments}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-ink-faint">Requires review</span>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.pendingLyrics")}</span>
              <p className="mt-1 font-display text-[22px] font-extrabold text-primary-deep">
                {stats.pendingLyrics}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-primary-deep">Sheets</span>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.revenue")}</span>
              <p className="mt-1 font-display text-[17px] font-extrabold text-ink sm:text-[19px]">
                {toman(stats.estimatedRevenueToman, locale)}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-ink-faint">Est. Gross</span>
            </div>

            <div className="rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="text-[12px] font-bold text-ink-muted">{t("admin.stat.users")}</span>
              <p className="mt-1 font-display text-[22px] font-extrabold text-ink">
                {stats.totalUsers}
              </p>
              <span className="mt-1 inline-block text-[12px] font-bold text-ink-faint">Accounts</span>
            </div>
          </div>

          {/* Weekly Streams Chart & Audit Log */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Stream Growth */}
            <div className="rounded-[20px] border border-line bg-surface p-5 shadow-card">
              <h3 className="font-display text-[16px] font-bold text-ink">Daily Streaming Trends</h3>
              <p className="text-[12px] text-ink-muted">Past 7 days volume across catalogue</p>

              <div className="mt-6 flex h-40 items-end justify-between gap-3 px-2">
                {adminApi.getStreamChart().map((point) => {
                  const heightPercent = Math.round((point.streams / 35000) * 100);
                  return (
                    <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[12px] font-bold text-ink-muted">
                        {(point.streams / 1000).toFixed(0)}k
                      </span>
                      <div className="w-full max-w-[32px] rounded-t-lg bg-primary/20 transition-all hover:bg-primary">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-lg bg-primary transition-all"
                        />
                      </div>
                      <span className="text-[12px] font-semibold text-ink-faint">{point.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Log */}
            <div className="rounded-[20px] border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[16px] font-bold text-ink">{t("admin.auditLog")}</h3>
                <span className="rounded-full bg-subtle px-2 py-0.5 text-[12px] font-bold text-ink-muted">
                  Live Feed
                </span>
              </div>

              <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto scroll-slim pe-1">
                {adminApi.getRecentActivities().map((act) => (
                  <div key={act.id} className="flex items-start gap-3 rounded-xl border border-line/60 bg-subtle/50 p-2.5 text-[12.5px]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
                      <Icon name="check" size={12} strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">{act.action}</span>
                        <span className="text-[12px] text-ink-faint">{act.timestamp}</span>
                      </div>
                      <p className="truncate text-ink-muted">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: TRACKS ------------------- */}
      {activeTab === "tracks" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">Tracks & Songs Catalogue</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setTrackModalOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{t("admin.action.addTrack")}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scroll-rail">
            <table className="w-full text-start text-[13px]">
              <thead>
                <tr className="border-b border-line text-ink-faint text-[12px] uppercase">
                  <th className="pb-2.5 text-start font-bold">Track</th>
                  <th className="pb-2.5 text-start font-bold">Artist</th>
                  <th className="pb-2.5 text-start font-bold">Album</th>
                  <th className="pb-2.5 text-start font-bold">Duration</th>
                  <th className="pb-2.5 text-start font-bold">Streams</th>
                  <th className="pb-2.5 text-end font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {adminApi.getTracks(searchQuery).map((tr) => (
                  <tr key={tr.id} className="transition-colors hover:bg-subtle/50">
                    <td className="py-2.5 font-bold text-ink">{tr.title}</td>
                    <td className="py-2.5 text-ink-muted">{tr.artist}</td>
                    <td className="py-2.5 text-ink-muted">{tr.album}</td>
                    <td className="py-2.5 font-mono text-[12px] text-ink-faint">
                      {Math.floor(tr.seconds / 60)}:{String(Math.floor(tr.seconds % 60)).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 text-ink-muted">{(tr.plays ?? 1000).toLocaleString(locale)}</td>
                    <td className="py-2.5 text-end">
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.deleteTrack(tr.id);
                          notify(t("admin.deletedToast"), "primary");
                        }}
                        className="rounded-lg p-1.5 text-ink-faint transition hover:bg-flame-soft hover:text-flame-deep"
                        title="Delete"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: ARTISTS ------------------ */}
      {activeTab === "artists" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">Artists & Groups Roster</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setArtistModalOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{t("admin.action.addArtist")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {adminApi.getArtists(searchQuery).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-[16px] border border-line/70 bg-subtle/40 p-3.5">
                <div className="flex items-center gap-3">
                  <img src={a.photo} alt={a.name} className="size-11 rounded-full object-cover ring-1 ring-line" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[14px] font-bold text-ink">{a.name}</span>
                      {a.verified && <Icon name="verified" size={14} className="text-primary-deep" />}
                    </div>
                    <span className="text-[12px] text-ink-muted">{a.genre} · {a.kind}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adminApi.toggleArtistVerified(a.id)}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[12px] font-bold transition",
                      a.verified ? "bg-primary/10 text-primary-deep" : "bg-subtle text-ink-faint hover:text-ink",
                    )}
                  >
                    Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      adminApi.deleteArtist(a.id);
                      notify(t("admin.deletedToast"), "primary");
                    }}
                    className="rounded-lg p-1.5 text-ink-faint hover:bg-flame-soft hover:text-flame-deep"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: ALBUMS ------------------- */}
      {activeTab === "albums" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">Albums & Releases</h3>
            <input
              type="text"
              placeholder={t("admin.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {adminApi.getAlbums(searchQuery).map((al) => (
              <div key={al.id} className="overflow-hidden rounded-[16px] border border-line/70 bg-subtle/30">
                <img src={al.photo} alt={al.title} className="h-32 w-full object-cover" />
                <div className="p-3">
                  <h4 className="font-bold text-ink truncate text-[14px]">{al.title}</h4>
                  <p className="text-[12px] text-ink-muted">{al.artist} · {al.year}</p>
                  <span className="mt-2 inline-block rounded-md bg-subtle px-2 py-0.5 text-[12px] font-bold text-ink-faint">
                    {al.tracks} tracks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: NEWS --------------------- */}
      {activeTab === "news" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">News & Editorial Articles</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setNewsModalOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{t("admin.action.addNews")}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {adminApi.getNews(searchQuery).map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-4 rounded-[16px] border border-line/60 bg-subtle/40 p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={n.photo} alt={n.title} className="size-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary-deep">
                        {n.tag}
                      </span>
                      <span className="text-[12px] text-ink-faint">{n.ago}</span>
                    </div>
                    <h4 className="mt-0.5 truncate font-bold text-[13.5px] text-ink">{n.title}</h4>
                    <p className="line-clamp-1 text-[12px] text-ink-muted">{n.excerpt}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] text-ink-faint">{n.views} views</span>
                  <button
                    type="button"
                    onClick={() => {
                      adminApi.deleteNews(n.id);
                      notify(t("admin.deletedToast"), "primary");
                    }}
                    className="rounded-lg p-1.5 text-ink-faint hover:bg-flame-soft hover:text-flame-deep"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: MODERATION --------------- */}
      {activeTab === "moderation" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Comments Moderation */}
          <div className="space-y-3 rounded-[20px] border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[16px] font-bold text-ink">Comments Moderation</h3>
              <span className="rounded-full bg-flame-soft px-2.5 py-0.5 text-[12px] font-extrabold text-flame-deep">
                {stats.reportedComments} flagged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto scroll-slim pe-1">
              {adminApi.getComments().map((cm) => (
                <div
                  key={cm.id}
                  className={cn(
                    "rounded-[16px] border p-3.5 transition",
                    cm.status === "reported"
                      ? "border-flame-deep/30 bg-flame-soft/30"
                      : "border-line/60 bg-subtle/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-ink">{cm.author} <span className="font-normal text-ink-faint">{cm.handle}</span></span>
                    <span className="text-[12px] text-ink-faint">{cm.time}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-body">{cm.text}</p>
                  {cm.reportReason && (
                    <p className="mt-1.5 rounded-lg bg-flame-deep/10 px-2 py-1 text-[12px] font-bold text-flame-deep">
                      Flag: {cm.reportReason}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    {cm.status === "reported" && (
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.approveComment(cm.id);
                          notify(t("admin.savedToast"), "mint");
                        }}
                        className="rounded-lg bg-teal-soft px-2.5 py-1 text-[12px] font-bold text-teal-deep hover:opacity-85"
                      >
                        {t("admin.approve")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        adminApi.deleteComment(cm.id);
                        notify(t("admin.deletedToast"), "primary");
                      }}
                      className="rounded-lg bg-flame-soft px-2.5 py-1 text-[12px] font-bold text-flame-deep hover:opacity-85"
                    >
                      {t("admin.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lyrics Submissions Review */}
          <div className="space-y-3 rounded-[20px] border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[16px] font-bold text-ink">Lyrics Submissions</h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
                {stats.pendingLyrics} pending review
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto scroll-slim pe-1">
              {adminApi.getLyricSubmissions().map((sub) => (
                <div key={sub.id} className="rounded-[16px] border border-line/60 bg-subtle/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[13.5px] text-ink">{sub.trackTitle}</h4>
                      <span className="text-[12px] text-ink-muted">{sub.language} · {sub.sentAt}</span>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[12px] font-extrabold uppercase",
                      sub.status === "approved" ? "bg-mint-soft text-teal-deep" : "bg-primary-soft text-primary-deep",
                    )}>
                      {sub.status}
                    </span>
                  </div>

                  <pre className="mt-2 max-h-24 overflow-y-auto rounded-lg bg-surface p-2 font-mono text-[12px] leading-relaxed text-ink-body scroll-slim">
                    {sub.original}
                  </pre>

                  {sub.status === "pending" && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.rejectLyricSubmission(sub.id);
                          notify(t("admin.deletedToast"), "primary");
                        }}
                        className="rounded-lg bg-subtle px-3 py-1 text-[12px] font-bold text-ink-muted hover:text-ink"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.approveLyricSubmission(sub.id, 18);
                          notify(t("admin.savedToast"), "mint");
                        }}
                        className="rounded-lg bg-primary px-3 py-1 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep"
                      >
                        Approve (+18 pts)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: SHOP --------------------- */}
      {activeTab === "shop" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">Shop & Merch Inventory</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("admin.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setProductModalOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{t("admin.action.addProduct")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {adminApi.getProducts(searchQuery).map((p) => (
              <div key={p.id} className="overflow-hidden rounded-[16px] border border-line/70 bg-subtle/30">
                <img src={p.photo} alt={p.name} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-extrabold uppercase text-primary-deep">{p.category}</span>
                    {p.badge && (
                      <span className="rounded-full bg-subtle px-2 py-0.5 text-[12px] font-bold text-ink-muted">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 font-bold text-ink text-[13.5px] truncate">{p.name}</h4>
                  <p className="mt-1 font-display text-[14px] font-extrabold text-primary-deep">
                    {toman(p.price, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB: USERS -------------------- */}
      {activeTab === "users" && (
        <div className="space-y-4 rounded-[20px] border border-line bg-surface p-5 shadow-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="font-display text-[17px] font-bold text-ink">User Accounts & Role Permissions</h3>
            <input
              type="text"
              placeholder={t("admin.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-full border border-line bg-subtle px-3.5 py-1.5 text-[12.5px] outline-none focus:border-primary"
            />
          </div>

          <div className="overflow-x-auto scroll-rail">
            <table className="w-full text-start text-[13px]">
              <thead>
                <tr className="border-b border-line text-ink-faint text-[12px] uppercase">
                  <th className="pb-2.5 text-start font-bold">User</th>
                  <th className="pb-2.5 text-start font-bold">Role</th>
                  <th className="pb-2.5 text-start font-bold">Points</th>
                  <th className="pb-2.5 text-start font-bold">Status</th>
                  <th className="pb-2.5 text-start font-bold">Last Active</th>
                  <th className="pb-2.5 text-end font-bold">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {adminApi.getUsers(searchQuery).map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-subtle/50">
                    <td className="py-2.5 font-bold text-ink">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.displayName} className="size-7 rounded-full object-cover" />
                        <div>
                          <span>{u.displayName}</span>
                          <span className="block text-[12px] font-normal text-ink-faint">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          adminApi.updateUserRole(u.username, e.target.value as AdminUserRole);
                          notify(t("admin.savedToast"), "mint");
                        }}
                        className="rounded-lg border border-line bg-surface px-2 py-1 text-[12px] font-bold text-ink outline-none"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="editor">Editor</option>
                        <option value="user">Fan User</option>
                      </select>
                    </td>
                    <td className="py-2.5 font-bold text-ink-body">{u.points.toLocaleString(locale)} pts</td>
                    <td className="py-2.5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[12px] font-bold uppercase",
                        u.status === "active" ? "bg-mint-soft text-teal-deep" : "bg-flame-soft text-flame-deep",
                      )}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-[12px] text-ink-muted">{u.lastActive}</td>
                    <td className="py-2.5 text-end">
                      <button
                        type="button"
                        onClick={() => {
                          adminApi.adjustUserPoints(u.username, 50, "Admin bonus");
                          notify(t("admin.savedToast"), "mint");
                        }}
                        className="rounded-md bg-primary/10 px-2 py-1 text-[12px] font-bold text-primary-deep hover:bg-primary/20"
                      >
                        +50 pts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODALS ------------------------ */}

      {/* Add Track Modal */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-line bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-[18px] font-bold text-ink">{t("admin.action.addTrack")}</h3>
            <form onSubmit={handleCreateTrack} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Title</label>
                <input
                  type="text"
                  required
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  placeholder="e.g. Midnight City"
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-bold text-ink-muted">Artist</label>
                  <input
                    type="text"
                    required
                    value={newTrackArtist}
                    onChange={(e) => setNewTrackArtist(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-ink-muted">Album</label>
                  <input
                    type="text"
                    required
                    value={newTrackAlbum}
                    onChange={(e) => setNewTrackAlbum(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Duration</label>
                <input
                  type="text"
                  required
                  value={newTrackDuration}
                  onChange={(e) => setNewTrackDuration(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrackModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-bold text-ink-muted hover:text-ink"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {t("admin.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Artist Modal */}
      {artistModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-line bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-[18px] font-bold text-ink">{t("admin.action.addArtist")}</h3>
            <form onSubmit={handleCreateArtist} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Artist Name</label>
                <input
                  type="text"
                  required
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  placeholder="e.g. VELVET ECHO"
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Category / Kind</label>
                <select
                  value={newArtistKind}
                  onChange={(e) => setNewArtistKind(e.target.value as Artist["kind"])}
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  <option value="Boy group">Boy group</option>
                  <option value="Girl group">Girl group</option>
                  <option value="Soloist">Soloist</option>
                  <option value="Duo">Duo</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Genre</label>
                <input
                  type="text"
                  required
                  value={newArtistGenre}
                  onChange={(e) => setNewArtistGenre(e.target.value)}
                  placeholder="e.g. Dance pop"
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArtistModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-bold text-ink-muted hover:text-ink"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {t("admin.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add News Modal */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-line bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-[18px] font-bold text-ink">{t("admin.action.addNews")}</h3>
            <form onSubmit={handleCreateNews} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Title / Headline</label>
                <input
                  type="text"
                  required
                  value={newNewsTitle}
                  onChange={(e) => setNewNewsTitle(e.target.value)}
                  placeholder="Headline..."
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Tag</label>
                <select
                  value={newNewsTag}
                  onChange={(e) => setNewNewsTag(e.target.value as NewsItem["tag"])}
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  <option value="Tour">Tour</option>
                  <option value="Comeback">Comeback</option>
                  <option value="Charts">Charts</option>
                  <option value="Awards">Awards</option>
                  <option value="Editorial">Editorial</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Excerpt</label>
                <textarea
                  rows={2}
                  value={newNewsExcerpt}
                  onChange={(e) => setNewNewsExcerpt(e.target.value)}
                  placeholder="Short summary excerpt..."
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-bold text-ink-muted hover:text-ink"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {t("admin.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-line bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-[18px] font-bold text-ink">{t("admin.action.addProduct")}</h3>
            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Tour Cap"
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as Exclude<ShopCategoryId, "all">)}
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                >
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                  <option value="collectibles">Collectibles</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-ink-muted">Price (Toman)</label>
                <input
                  type="number"
                  required
                  step={50000}
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-line bg-subtle px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12.5px] font-bold text-ink-muted hover:text-ink"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {t("admin.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
