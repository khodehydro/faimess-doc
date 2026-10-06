/* ------------------------------------------------------------------ *
 *  FAIMESS Admin Mobile Navigation
 *  Thumb-friendly bottom bar replacing consumer navigation on phones.
 *  Brand purple background with white text and icons.
 * ------------------------------------------------------------------ */

import { usePreferences } from "../../app/PreferencesContext";
import { useRoute } from "../../app/router";
import { Icon } from "../../ui/Icon";
import { cn } from "../../lib/cn";
import { ADMIN_TABS, getActiveAdminTab, type AdminTabId } from "./AdminTopNav";

export function AdminMobileNav() {
  const { lang } = usePreferences();
  const { navigate } = useRoute();
  const currentTab = getActiveAdminTab();

  const handleSelectTab = (tabId: AdminTabId) => {
    if (typeof window !== "undefined") {
      window.location.hash = tabId === "dashboard" ? "#/admin" : `#/admin/${tabId}`;
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-1 overflow-x-auto rounded-full bg-gradient-to-r from-[#6b4fdd] via-[#5e3ed4] to-[#4c2eba] p-1.5 shadow-float backdrop-blur-md scroll-rail text-white border border-white/20">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-full px-2.5 py-1 text-[12px] font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <Icon name="home" size={16} className="text-white" />
          <span>{lang === "fa" ? "سایت" : "Exit"}</span>
        </button>

        <div className="h-6 w-px shrink-0 bg-white/20" />

        {ADMIN_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 rounded-full px-3 py-1 text-[12px] font-bold transition",
                isActive
                  ? "bg-white/25 text-white shadow-xs ring-1 ring-white/40"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon name={tab.icon} size={16} className="text-white" />
              <span className="truncate max-w-[60px] text-white">{lang === "fa" ? tab.labelFa : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
