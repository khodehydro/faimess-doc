/* ------------------------------------------------------------------ *
 *  FAIMESS Admin Console Top Navigation
 *  Replaces the site's consumer navigation with platform control tabs
 *  and quick new-window site launcher.
 * ------------------------------------------------------------------ */

import { useEffect, useState } from "react";
import { usePreferences } from "../../app/PreferencesContext";
import { Icon, type IconName } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { adminApi, type AdminOverviewStats } from "../../api/adminApi";

export type AdminTabId =
  | "dashboard"
  | "tracks"
  | "albums"
  | "artists"
  | "playlists"
  | "news"
  | "comments"
  | "lyrics"
  | "requests"
  | "shop"
  | "settings"
  | "users";

export const ADMIN_TABS: { id: AdminTabId; labelFa: string; labelEn: string; icon: IconName }[] = [
  { id: "dashboard", labelFa: "پیشخوان و آمار", labelEn: "Overview", icon: "sparkle" },
  { id: "tracks", labelFa: "آهنگ‌ها", labelEn: "Tracks", icon: "music" },
  { id: "albums", labelFa: "آلبوم‌ها", labelEn: "Albums", icon: "disc" },
  { id: "artists", labelFa: "هنرمندان", labelEn: "Artists", icon: "mic" },
  { id: "playlists", labelFa: "پلی‌لیست‌ها", labelEn: "Playlists", icon: "list" },
  { id: "news", labelFa: "تحریریه اخبار", labelEn: "News", icon: "news" },
  { id: "comments", labelFa: "نظارت دیدگاه‌ها", labelEn: "Comments", icon: "message" },
  { id: "lyrics", labelFa: "نظارت لیریک‌ها", labelEn: "Lyrics Review", icon: "waveform" },
  { id: "requests", labelFa: "درخواست‌های کاربران", labelEn: "Fan Requests", icon: "sparkle" },
  { id: "shop", labelFa: "فروشگاه", labelEn: "Shop", icon: "shop" },
  { id: "settings", labelFa: "نمایش بخش‌ها", labelEn: "Visibility", icon: "settings" },
  { id: "users", labelFa: "کاربران و نقش‌ها", labelEn: "Staff & RBAC", icon: "users" },
];

export function getActiveAdminTab(): AdminTabId {
  if (typeof window === "undefined") return "dashboard";
  const hash = window.location.hash.replace(/^[#/]+/, "").split("?")[0].trim();
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "admin" && parts[1]) {
    const sub = parts[1].toLowerCase() as AdminTabId;
    if (ADMIN_TABS.some((t) => t.id === sub)) {
      return sub;
    }
  }
  return "dashboard";
}

export function AdminTopNav() {
  const { lang } = usePreferences();
  const currentTab = getActiveAdminTab();
  const [stats, setStats] = useState<AdminOverviewStats>(() => adminApi.getOverviewStats());

  useEffect(() => {
    return adminApi.subscribe(() => {
      setStats(adminApi.getOverviewStats());
    });
  }, []);

  const handleSelectTab = (tabId: AdminTabId) => {
    if (typeof window !== "undefined") {
      window.location.hash = tabId === "dashboard" ? "#/admin" : `#/admin/${tabId}`;
    }
  };

  const handleOpenSiteInNewWindow = () => {
    if (typeof window !== "undefined") {
      const siteUrl = `${window.location.origin}${window.location.pathname}#/`;
      window.open(siteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <nav
      aria-label="Admin Navigation"
      className="flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-line bg-surface/90 px-3 py-1.5 shadow-sm backdrop-blur-md scroll-rail"
    >
      {/* View Site in New Window Button */}
      <button
        type="button"
        onClick={handleOpenSiteInNewWindow}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-subtle px-3 py-1.5 text-[12px] font-bold text-ink transition hover:bg-primary-soft hover:text-primary-deep"
        title={lang === "fa" ? "نمایش سایت در پنجره جدید" : "Open site in new window"}
      >
        <Icon name="arrowUpRight" size={14} />
        <span>{lang === "fa" ? "نمایش سایت" : "View Site"}</span>
      </button>

      <div className="h-4 w-px shrink-0 bg-line" />

      {/* Admin Tabs */}
      {ADMIN_TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const unreviewedCommentsCount = stats.unreviewedComments ?? 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelectTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition",
              isActive
                ? "bg-primary-deep text-white shadow-sm"
                : "text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name={tab.icon} size={14} />
            <span>{lang === "fa" ? tab.labelFa : tab.labelEn}</span>
            {tab.id === "comments" && (unreviewedCommentsCount > 0 || stats.reportedComments > 0) && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-flame-deep px-1 text-[12px] font-black text-white">
                {unreviewedCommentsCount + stats.reportedComments}
              </span>
            )}
            {tab.id === "lyrics" && stats.pendingLyrics > 0 && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary-deep px-1 text-[12px] font-black text-white">
                {stats.pendingLyrics}
              </span>
            )}
            {tab.id === "news" && stats.pendingNews > 0 && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-soft px-1 text-[12px] font-black text-ink">
                {stats.pendingNews}
              </span>
            )}
            {tab.id === "requests" && stats.pendingRequests > 0 && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-teal-deep px-1 text-[12px] font-black text-white">
                {stats.pendingRequests}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
