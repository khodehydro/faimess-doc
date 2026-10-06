/* ------------------------------------------------------------------ *
 *  FAIMESS Admin Mobile Navigation
 *  Thumb-friendly bottom bar replacing consumer navigation on phones.
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
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-1 overflow-x-auto rounded-full border border-line bg-surface/95 p-1.5 shadow-float backdrop-blur-md scroll-rail">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-full px-2.5 py-1 text-[12px] font-bold text-ink-muted transition hover:bg-subtle hover:text-ink"
        >
          <Icon name="home" size={16} />
          <span>{lang === "fa" ? "سایت" : "Exit"}</span>
        </button>

        <div className="h-6 w-px shrink-0 bg-line" />

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
                  ? "bg-primary-deep text-white shadow-sm"
                  : "text-ink-muted hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon name={tab.icon} size={16} />
              <span className="truncate max-w-[60px]">{lang === "fa" ? tab.labelFa : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
