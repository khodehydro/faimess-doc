/* ------------------------------------------------------------------ *
 *  FAIMESS Admin Console Top Navigation
 *  Replaces the site's consumer navigation with platform control tabs
 *  and quick exit affordance when in admin mode.
 * ------------------------------------------------------------------ */

import { usePreferences } from "../../app/PreferencesContext";
import { useRoute } from "../../app/router";
import { Icon, type IconName } from "../../ui/Icon";
import { cn } from "../../lib/cn";

export type AdminTabId =
  | "dashboard"
  | "tracks"
  | "albums"
  | "artists"
  | "playlists"
  | "news"
  | "moderation"
  | "shop"
  | "users";

export const ADMIN_TABS: { id: AdminTabId; labelFa: string; labelEn: string; icon: IconName }[] = [
  { id: "dashboard", labelFa: "پیشخوان", labelEn: "Overview", icon: "sparkle" },
  { id: "tracks", labelFa: "آهنگ‌ها", labelEn: "Tracks", icon: "music" },
  { id: "albums", labelFa: "آلبوم‌ها", labelEn: "Albums", icon: "disc" },
  { id: "artists", labelFa: "هنرمندان", labelEn: "Artists", icon: "mic" },
  { id: "playlists", labelFa: "پلی‌لیست‌ها", labelEn: "Playlists", icon: "list" },
  { id: "news", labelFa: "تحریریه اخبار", labelEn: "News", icon: "news" },
  { id: "moderation", labelFa: "نظارت جامعه", labelEn: "Moderation", icon: "message" },
  { id: "shop", labelFa: "فروشگاه", labelEn: "Shop", icon: "shop" },
  { id: "users", labelFa: "کاربران و دسترسی", labelEn: "Users", icon: "users" },
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
  const { lang, t } = usePreferences();
  const { navigate } = useRoute();
  const currentTab = getActiveAdminTab();

  const handleSelectTab = (tabId: AdminTabId) => {
    if (typeof window !== "undefined") {
      window.location.hash = tabId === "dashboard" ? "#/admin" : `#/admin/${tabId}`;
    }
  };

  return (
    <nav
      aria-label="Admin Navigation"
      className="flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-line bg-surface/90 px-3 py-1.5 shadow-sm backdrop-blur-md scroll-rail"
    >
      {/* Return to Site Button */}
      <button
        type="button"
        onClick={() => navigate("home")}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-[12px] font-bold text-ink-muted transition hover:bg-subtle/80 hover:text-ink"
        title={lang === "fa" ? "بازگشت به برنامه اصلی" : "Back to Main Site"}
      >
        <Icon name="home" size={14} />
        <span>{lang === "fa" ? "سایت اصلی" : "Exit"}</span>
      </button>

      <div className="h-4 w-px shrink-0 bg-line" />

      {/* Admin Tabs */}
      {ADMIN_TABS.map((tab) => {
        const isActive = currentTab === tab.id;
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
          </button>
        );
      })}
    </nav>
  );
}
