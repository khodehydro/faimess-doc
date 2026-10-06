import { useState } from "react";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { useAuth } from "../app/AuthContext";
import { socialApi, type UserProfileSummary } from "../api/socialApi";
import { cn } from "../lib/cn";
import { Photo } from "./Cover";

export function FollowListModal({
  open,
  onClose,
  initialTab = "followers",
  onFollowToggle,
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following";
  onFollowToggle?: () => void;
}) {
  const { lang } = usePreferences();
  const { openProfile } = useApp();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<UserProfileSummary[]>(() => socialApi.getFollowers());
  const [following, setFollowing] = useState<UserProfileSummary[]>(() => socialApi.getFollowing());

  const { requireAccount } = useAuth();

  if (!open) return null;

  const refresh = () => {
    setFollowers(socialApi.getFollowers());
    setFollowing(socialApi.getFollowing());
    if (onFollowToggle) onFollowToggle();
  };

  const handleToggle = (user: UserProfileSummary) => {
    requireAccount("gate.userFollow", () => {
      socialApi.toggleFollow(user.id);
      refresh();
    });
  };

  const list = activeTab === "followers" ? followers : following;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("followers")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-bold transition",
                activeTab === "followers"
                  ? "bg-primary text-white"
                  : "bg-subtle text-ink-muted hover:text-ink",
              )}
            >
              {lang === "fa" ? `دنبال‌کنندگان (${followers.length})` : `Followers (${followers.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-bold transition",
                activeTab === "following"
                  ? "bg-primary text-white"
                  : "bg-subtle text-ink-muted hover:text-ink",
              )}
            >
              {lang === "fa" ? `دنبال‌شده‌ها (${following.length})` : `Following (${following.length})`}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scroll-slim">
          {list.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-ink-faint">
              {lang === "fa" ? "هنوز کاربری در این لیست نیست." : "No users found in this list."}
            </div>
          ) : (
            list.map((u) => {
              const isFollowing = socialApi.isFollowing(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line/60 bg-subtle/30 p-2.5 transition hover:border-line hover:bg-subtle/60"
                >
                  <div
                    onClick={() => {
                      openProfile(u.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
                  >
                    <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                      <Photo src={u.avatar} alt={u.name} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-ink group-hover:text-primary-deep transition-colors">
                          {u.name}
                        </span>
                        {u.badge && (
                          <span className="shrink-0 rounded-md bg-primary-soft/50 px-1.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
                            {u.badge}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[12px] text-ink-muted font-medium">
                        {u.handle} · {u.points} {lang === "fa" ? "امتیاز" : "pts"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(u)}
                    className={cn(
                      "shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-bold transition shadow-2xs",
                      isFollowing
                        ? "border border-line bg-surface text-ink-muted hover:border-rose-400 hover:text-rose-500"
                        : "bg-primary text-white hover:bg-primary-deep",
                    )}
                  >
                    {isFollowing
                      ? lang === "fa"
                        ? "لغو دنبال‌کردن"
                        : "Unfollow"
                      : lang === "fa"
                        ? "دنبال کردن"
                        : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
