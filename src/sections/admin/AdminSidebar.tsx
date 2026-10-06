import { useEffect, useState } from "react";
import { usePreferences } from "../../app/PreferencesContext";
import { useRoute } from "../../app/router";
import { Icon } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { adminApi, type AdminOverviewStats } from "../../api/adminApi";
import { ADMIN_TABS, getActiveAdminTab, type AdminTabId } from "./AdminTopNav";

/* ------------------------------------------------------------------ *
 *  FAIMESS Admin Sidebar
 *  Brand purple sidebar with crisp white typography and icons.
 * ------------------------------------------------------------------ */

export function AdminSidebar() {
  const { lang, dir } = usePreferences();
  const { navigate } = useRoute();
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

  const unreviewedCommentsCount = stats.unreviewedComments ?? 0;

  return (
    <aside
      dir={dir}
      aria-label="Admin Sidebar"
      className="flex w-full shrink-0 flex-col rounded-[24px] bg-gradient-to-b from-[#6b4fdd] via-[#5e3ed4] to-[#4c2eba] p-4 text-white shadow-xl lg:w-64 xl:w-72"
    >
      {/* Header: Brand & View Site */}
      <div className="flex flex-col gap-3 pb-3 border-b border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm ring-1 ring-white/30">
              <Icon name="sparkle" size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-[14.5px] font-black tracking-tight text-white leading-tight">
                {lang === "fa" ? "مدیریت فیمس" : "FAIMESS Admin"}
              </h2>
              <span className="text-[12px] font-bold text-white/70">
                {lang === "fa" ? "کنسول مدیریت" : "Studio Console"}
              </span>
            </div>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[12px] font-black text-white/90">
            <span className="size-1.5 rounded-full bg-mint" />
            <span>v4.0</span>
          </span>
        </div>

        {/* View Site in New Window Button */}
        <button
          type="button"
          onClick={handleOpenSiteInNewWindow}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-[12.5px] font-bold text-white shadow-xs transition hover:bg-white/20 active:scale-[0.98]"
          title={lang === "fa" ? "نمایش سایت در پنجره جدید" : "Open site in new window"}
        >
          <Icon name="arrowUpRight" size={14} strokeWidth={2.2} className="text-white" />
          <span>{lang === "fa" ? "مشاهده زنده سایت" : "View Live Site"}</span>
        </button>
      </div>

      {/* Tabs list */}
      <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 py-3 scroll-slim pe-1">
        {ADMIN_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-all text-start",
                isActive
                  ? "bg-white/25 text-white shadow-sm ring-1 ring-white/35"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {isActive && (
                <span className="absolute start-1 top-2 bottom-2 w-1 rounded-full bg-white shadow-xs" />
              )}
              <Icon
                name={tab.icon}
                size={16}
                strokeWidth={isActive ? 2.4 : 1.9}
                className="text-white shrink-0 transition-transform group-hover:scale-110"
              />
              <span className="truncate flex-1">
                {lang === "fa" ? tab.labelFa : tab.labelEn}
              </span>

              {/* Badges for pending items */}
              {tab.id === "comments" && (unreviewedCommentsCount > 0 || stats.reportedComments > 0) && (
                <span className="ms-auto flex h-4.5 min-w-[20px] items-center justify-center rounded-full bg-white text-[#5e3ed4] px-1.5 text-[12px] font-black shadow-xs">
                  {unreviewedCommentsCount + stats.reportedComments}
                </span>
              )}
              {tab.id === "lyrics" && stats.pendingLyrics > 0 && (
                <span className="ms-auto flex h-4.5 min-w-[20px] items-center justify-center rounded-full bg-white text-[#5e3ed4] px-1.5 text-[12px] font-black shadow-xs">
                  {stats.pendingLyrics}
                </span>
              )}
              {tab.id === "news" && stats.pendingNews > 0 && (
                <span className="ms-auto flex h-4.5 min-w-[20px] items-center justify-center rounded-full bg-white text-[#5e3ed4] px-1.5 text-[12px] font-black shadow-xs">
                  {stats.pendingNews}
                </span>
              )}
              {tab.id === "requests" && stats.pendingRequests > 0 && (
                <span className="ms-auto flex h-4.5 min-w-[20px] items-center justify-center rounded-full bg-white text-[#5e3ed4] px-1.5 text-[12px] font-black shadow-xs">
                  {stats.pendingRequests}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: Exit to Site */}
      <div className="pt-3 border-t border-white/15 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-[12px] font-bold text-white transition"
        >
          <Icon name="home" size={14} className="text-white" />
          <span>{lang === "fa" ? "بازگشت به سایت" : "Return to site"}</span>
        </button>

        <span className="text-[12px] font-semibold text-white/60">
          FAIMESS Core
        </span>
      </div>
    </aside>
  );
}
