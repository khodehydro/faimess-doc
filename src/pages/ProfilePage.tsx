import { useState, useMemo } from "react";
import { Icon } from "../ui/Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { usePlayer } from "../app/PlayerContext";
import { Photo } from "../ui/Cover";
import {
  socialApi,
  calculateTierProgress,
  AVAILABLE_AVATARS,
  type UserProfile,
  type FanBadge,
} from "../api/socialApi";
import { coverPhoto } from "../data/playlists";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { FollowListModal } from "../ui/FollowListModal";
import { ContentRequestModal } from "../ui/ContentRequestModal";
import { cn } from "../lib/cn";
import { SectionSlot } from "../sections/registry";

export function ProfilePage() {
  const { lang, dir, dataLabel } = usePreferences();
  const { notify, openDetail } = useApp();
  const { mine: userPlaylists } = usePlaylists();
  const { play, queue } = usePlayer();

  const [profile, setProfile] = useState<UserProfile>(() => socialApi.getProfile());
  const [badgeSummary, setBadgeSummary] = useState(() => socialApi.getUserBadges(profile.points));
  const [followersCount, setFollowersCount] = useState(() => socialApi.getFollowers().length);
  const [followingCount, setFollowingCount] = useState(() => socialApi.getFollowing().length);
  const [contentRequests, setContentRequests] = useState(() => socialApi.getContentRequests());

  // Edit Profile Modal / Drawer State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editGenre, setEditGenre] = useState(profile.favoriteGenre);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Dialogs
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<"followers" | "following">("followers");
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Profile Active Sub-tab
  const [activeTab, setActiveTab] = useState<"overview" | "playlists" | "badges" | "requests">("overview");

  const tierProgress = useMemo(() => calculateTierProgress(profile.points), [profile.points]);

  const refreshProfileData = () => {
    const p = socialApi.getProfile();
    setProfile(p);
    setBadgeSummary(socialApi.getUserBadges(p.points));
    setFollowersCount(socialApi.getFollowers().length);
    setFollowingCount(socialApi.getFollowing().length);
    setContentRequests(socialApi.getContentRequests());
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editHandle.trim()) return;

    const updated = socialApi.updateProfile({
      name: editName.trim(),
      handle: editHandle.trim().startsWith("@") ? editHandle.trim() : `@${editHandle.trim()}`,
      bio: editBio.trim(),
      favoriteGenre: editGenre.trim(),
      avatar: editAvatar,
    });

    setProfile(updated);
    setIsEditing(false);
    notify(
      lang === "fa" ? "اطلاعات حساب کاربری با موفقیت به‌روزرسانی شد" : "Profile updated successfully",
      "mint",
    );
  };

  const handleOpenFollowers = (tab: "followers" | "following") => {
    setFollowModalTab(tab);
    setFollowModalOpen(true);
  };

  return (
    <div dir={dir} className="flex min-h-0 flex-1 flex-col p-4 lg:p-7 space-y-6">
      {/* ======================= HERO PROFILE HEADER ======================= */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-subtle/70 to-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center text-center sm:text-start">
            {/* Avatar with Level Ring */}
            <div className="relative">
              <div className="size-[90px] overflow-hidden rounded-full ring-4 ring-primary-soft shadow-md sm:size-[104px]">
                <Photo src={profile.avatar} alt={profile.name} />
              </div>
              <span className="absolute -bottom-1 -end-1 flex items-center gap-1 rounded-full bg-primary-deep px-2.5 py-1 text-[12px] font-extrabold text-white shadow-sm">
                <Icon name="medal" size={12} />
                <span>Lv.{tierProgress.currentTier.level}</span>
              </span>
            </div>

            {/* Names & Bios */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="truncate font-black text-[22px] text-ink sm:text-[26px]">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-deep">
                  {dataLabel(tierProgress.currentTier.nameFa)}
                </span>
              </div>
              <p className="mt-1 font-semibold text-[13px] text-ink-muted">
                {profile.handle}
              </p>
              <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-ink-body">
                {profile.bio || (lang === "fa" ? "علاقه‌مند به دنیای کی‌پاپ و موسیقی متن" : "K-Pop and OST enthusiast")}
              </p>

              {/* Badges/Tags */}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-muted">
                  <Icon name="music" size={12} />
                  <span>{lang === "fa" ? "سبک موردعلاقه:" : "Favorite:"} {profile.favoriteGenre}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-muted">
                  <Icon name="disc" size={12} />
                  <span>{lang === "fa" ? "پلی‌لیست‌ها:" : "Playlists:"} {userPlaylists.length}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-muted">
                  <Icon name="star" size={12} />
                  <span>{profile.points.toLocaleString()} {lang === "fa" ? "امتیاز" : "points"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons & Stats */}
          <div className="flex flex-col items-center sm:items-end gap-3.5">
            <button
              type="button"
              onClick={() => {
                setEditName(profile.name);
                setEditHandle(profile.handle);
                setEditBio(profile.bio);
                setEditGenre(profile.favoriteGenre);
                setEditAvatar(profile.avatar);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-2xs transition hover:bg-subtle hover:border-line"
            >
              <Icon name="bolt" size={14} />
              <span>{lang === "fa" ? "ویرایش مشخصات پروفایل" : "Edit Profile"}</span>
            </button>

            {/* Followers / Following counts */}
            <div className="flex items-center gap-4 text-[13px]">
              <button
                type="button"
                onClick={() => handleOpenFollowers("followers")}
                className="group flex items-center gap-1.5 transition hover:text-primary-deep"
              >
                <span className="font-black text-ink group-hover:text-primary-deep">
                  {followersCount}
                </span>
                <span className="text-ink-muted">
                  {lang === "fa" ? "دنبال‌کننده" : "Followers"}
                </span>
              </button>

              <span className="text-line">|</span>

              <button
                type="button"
                onClick={() => handleOpenFollowers("following")}
                className="group flex items-center gap-1.5 transition hover:text-primary-deep"
              >
                <span className="font-black text-ink group-hover:text-primary-deep">
                  {followingCount}
                </span>
                <span className="text-ink-muted">
                  {lang === "fa" ? "دنبال‌شده" : "Following"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 rounded-2xl border border-line/70 bg-surface/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">
                {lang === "fa" ? "سطح فعلی کاربر:" : "Current Tier:"}
              </span>
              <span className="font-extrabold text-primary-deep">
                {profile.tier}
              </span>
            </div>
            {tierProgress.nextTier ? (
              <div className="text-ink-muted">
                {lang === "fa"
                  ? `${tierProgress.pointsToNext} امتیاز دیگر تا ارتقا به «${tierProgress.nextTier.nameFa}»`
                  : `${tierProgress.pointsToNext} more pts to reach ${tierProgress.nextTier.nameEn}`}
              </div>
            ) : (
              <span className="font-bold text-teal-deep">
                {lang === "fa" ? "★ شما به بالاترین سطح استودیو رسیده‌اید!" : "★ Highest studio rank achieved!"}
              </span>
            )}
          </div>

          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-deep transition-all duration-500"
              style={{ width: `${tierProgress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================= PROFILE NAVIGATION TABS ======================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition",
              activeTab === "overview"
                ? "bg-primary text-white shadow-primary"
                : "bg-surface text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name="star" size={14} />
            <span>{lang === "fa" ? "نمای کلی و نشان‌ها" : "Overview & Badges"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("playlists")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition",
              activeTab === "playlists"
                ? "bg-primary text-white shadow-primary"
                : "bg-surface text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name="disc" size={14} />
            <span>
              {lang === "fa" ? `پلی‌لیست‌های من (${userPlaylists.length})` : `My Playlists (${userPlaylists.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("badges")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition",
              activeTab === "badges"
                ? "bg-primary text-white shadow-primary"
                : "bg-surface text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name="medal" size={14} />
            <span>
              {lang === "fa"
                ? `نشان‌های افتخار (${badgeSummary.earned.length}/${badgeSummary.earned.length + badgeSummary.remaining.length})`
                : `Badges (${badgeSummary.earned.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition",
              activeTab === "requests"
                ? "bg-primary text-white shadow-primary"
                : "bg-surface text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name="waveform" size={14} />
            <span>
              {lang === "fa"
                ? `درخواست‌های آهنگ و لیریک (${contentRequests.length})`
                : `Requests (${contentRequests.length})`}
            </span>
          </button>
        </div>

        {/* Quick Hub Trigger */}
        <button
          type="button"
          onClick={() => setRequestModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-soft/70 px-3.5 py-1.5 text-[12px] font-extrabold text-primary-deep transition hover:bg-primary-soft"
        >
          <Icon name="plus" size={13} strokeWidth={2.4} />
          <span>{lang === "fa" ? "درخواست جدید به مدیران" : "Request Content"}</span>
        </button>
      </div>

      {/* ======================= TAB 1: OVERVIEW ======================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Badges Highlight */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "نشان‌های دریافت‌شده و بازشده" : "Earned Badges"}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "نشان‌هایی که با فعالیت مستمر، مشارکت در لیریک‌ها و گوش دادن به موسیقی کسب کرده‌اید"
                    : "Badges unlocked through contributions and engagement"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("badges")}
                className="text-[12px] font-bold text-primary-deep hover:underline"
              >
                {lang === "fa" ? "مشاهده همه نشان‌ها" : "View All"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {badgeSummary.earned.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-xl border border-mint-deep/20 bg-mint-soft/30 p-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint-deep text-white shadow-2xs">
                    <Icon name={b.icon} size={18} />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-ink">
                      {dataLabel(b.titleFa)}
                    </span>
                    <span className="block text-[12px] text-ink-muted">
                      {b.descriptionFa}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Playlists Highlight */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "پلی‌لیست‌های اختصاصی من" : "My Created Playlists"}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "پلی‌لیست‌های عمومی ساخته‌شده با کاورهای باندل‌شده سایت"
                    : "Public user playlists created using bundled artwork"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary-deep px-3 py-1.5 text-[12px] font-bold text-white shadow-xs hover:bg-primary-deep/90"
              >
                <Icon name="plus" size={13} />
                <span>{lang === "fa" ? "ساخت پلی‌لیست" : "New Playlist"}</span>
              </button>
            </div>

            {userPlaylists.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-ink-muted">
                  {lang === "fa" ? "هنوز هیچ پلی‌لیست شخصی ایجاد نکرده‌اید." : "You have not created any playlist yet."}
                </p>
                <button
                  type="button"
                  onClick={() => setCreatePlaylistOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-subtle px-4 py-2 text-[12px] font-bold text-ink hover:bg-surface"
                >
                  <Icon name="plus" size={13} />
                  <span>{lang === "fa" ? "ساخت اولین پلی‌لیست" : "Create First Playlist"}</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {userPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/60 bg-subtle/30 p-2.5 transition hover:border-line hover:bg-subtle"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle shadow-xs">
                      <Photo src={coverPhoto(pl.cover)} alt={pl.name} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md">
                          <Icon name="play" size={14} />
                        </span>
                      </div>
                    </div>
                    <span className="mt-2 block truncate text-[13px] font-bold text-ink">
                      {pl.name}
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      {pl.trackIds.length} {lang === "fa" ? "قطعه" : "tracks"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: PLAYLISTS ======================= */}
      {activeTab === "playlists" && (
        <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "پلی‌لیست‌های شخصی و عمومی کاربر" : "User Playlists"}
              </h3>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پلی‌لیست‌ها با کاورهای پیش‌فرض طراحی‌شده استودیو بدون نیاز یا اجازه آپلود فایل دستی."
                  : "Curated lists strictly with bundled artwork (no file upload required)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreatePlaylistOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
            >
              <Icon name="plus" size={14} />
              <span>{lang === "fa" ? "ایجاد پلی‌لیست جدید" : "Create New Playlist"}</span>
            </button>
          </div>

          {userPlaylists.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              <p className="text-[14px]">
                {lang === "fa" ? "هیچ پلی‌لیستی ایجاد نشده است." : "No playlists found."}
              </p>
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="mt-4 rounded-xl bg-primary px-5 py-2 text-[12px] font-bold text-white"
              >
                {lang === "fa" ? "ساخت پلی‌لیست" : "Create One"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-3 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle shadow-xs">
                    <Photo src={coverPhoto(pl.cover)} alt={pl.name} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-md">
                        <Icon name="play" size={16} />
                      </span>
                    </div>
                  </div>
                  <span className="mt-2.5 block truncate text-[13px] font-bold text-ink">
                    {pl.name}
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    {pl.trackIds.length} {lang === "fa" ? "قطعه موسیقی" : "tracks"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: BADGES (EARNED VS LOCKED) ======================= */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          {/* Earned Badges Box */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Icon name="medal" size={18} className="text-mint-deep" />
              <h3 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? `نشان‌های دریافت‌شده (${badgeSummary.earned.length})` : `Earned Badges (${badgeSummary.earned.length})`}
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {badgeSummary.earned.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start gap-3 rounded-2xl border border-mint-deep/30 bg-mint-soft/30 p-3.5 transition"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint-deep text-white shadow-xs">
                    <Icon name={b.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13px] font-extrabold text-ink">
                        {dataLabel(b.titleFa)}
                      </span>
                      <span className="shrink-0 rounded-full bg-mint-deep/20 px-2 py-0.5 text-[12px] font-bold text-mint-deep">
                        {lang === "fa" ? "دریافت‌شده" : "Unlocked"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                      {b.descriptionFa}
                    </p>
                    <span className="mt-2 inline-block text-[12px] font-bold text-ink-faint">
                      {b.requiredPoints} {lang === "fa" ? "امتیاز نیاز بوده" : "points"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining Badges Box with Points Needed */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Icon name="lock" size={18} className="text-ink-faint" />
              <div>
                <h3 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa"
                    ? `نشان‌های باقی‌مانده و امتیازهای موردنیاز (${badgeSummary.remaining.length})`
                    : `Remaining Badges & Points Required (${badgeSummary.remaining.length})`}
                </h3>
                <p className="text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "با مشارکت در ویرایش لیریک، ثبت نظر، و ثبت درخواست آهنگ، این نشان‌ها را آزاد کنید."
                    : "Earn points by contributing lyrics and participating"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {badgeSummary.remaining.map((b) => {
                const deficit = b.requiredPoints - profile.points;
                const progress = Math.min(100, Math.round((profile.points / b.requiredPoints) * 100));

                return (
                  <div
                    key={b.id}
                    className="flex flex-col rounded-2xl border border-line bg-subtle/40 p-3.5 opacity-90 transition hover:bg-subtle"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink-faint ring-1 ring-line">
                        <Icon name={b.icon} size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-[13px] font-bold text-ink">
                            {dataLabel(b.titleFa)}
                          </span>
                          <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-[12px] font-bold text-ink-faint ring-1 ring-line">
                            <Icon name="lock" size={12} className="inline-block me-1" />
                            {lang === "fa" ? "قفل" : "Locked"}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                          {b.descriptionFa}
                        </p>
                      </div>
                    </div>

                    {/* Progress to unlock this badge */}
                    <div className="mt-3.5 border-t border-line/60 pt-2.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-ink-muted">
                          {lang === "fa" ? "امتیاز لازم:" : "Req:"} {b.requiredPoints}
                        </span>
                        <span className="font-extrabold text-primary-deep">
                          {lang === "fa" ? `${deficit} امتیاز باقی‌مانده` : `${deficit} pts needed`}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line/80">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: FAN CONTENT REQUESTS ======================= */}
      {activeTab === "requests" && (
        <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h3 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "درخواست‌های ثبت‌شده شما به استودیو" : "Your Content Requests"}
              </h3>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پیگیری وضعیت درخواست آهنگ‌ها، آلبوم‌ها یا متن‌های ارسالی به مدیران استودیو"
                  : "Track status of tracks, albums or lyrics requested from staff"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
            >
              <Icon name="plus" size={14} />
              <span>{lang === "fa" ? "ثبت درخواست جدید" : "Submit Request"}</span>
            </button>
          </div>

          {contentRequests.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              <p className="text-[14px]">
                {lang === "fa" ? "شما هنوز هیچ درخواستی ثبت نکرده‌اید." : "No content requests submitted yet."}
              </p>
              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="mt-4 rounded-xl bg-primary px-5 py-2 text-[12px] font-bold text-white"
              >
                {lang === "fa" ? "ثبت اولین درخواست" : "Request Now"}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {contentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-subtle/30 p-3.5 transition hover:bg-subtle/70"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs",
                        req.type === "track" && "bg-primary",
                        req.type === "album" && "bg-teal-deep",
                        req.type === "lyrics" && "bg-mint-deep",
                        req.type === "artist" && "bg-amber-600",
                      )}
                    >
                      <Icon
                        name={
                          req.type === "track"
                            ? "music"
                            : req.type === "album"
                              ? "disc"
                              : req.type === "lyrics"
                                ? "waveform"
                                : "mic"
                        }
                        size={18}
                      />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[14px] text-ink">
                          {req.title}
                        </span>
                        <span className="rounded-md bg-subtle px-1.5 py-0.5 text-[12px] font-bold text-ink-muted ring-1 ring-line">
                          {req.artistName}
                        </span>
                      </div>
                      {req.notes && (
                        <p className="mt-1 text-[12px] text-ink-muted">
                          {req.notes}
                        </p>
                      )}
                      <span className="mt-1.5 block text-[12px] text-ink-faint">
                        {req.submittedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {req.status === "pending" && (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-600 ring-1 ring-amber-500/30">
                        {lang === "fa" ? "در انتظار بررسی مدیران" : "Pending Review"}
                      </span>
                    )}
                    {req.status === "fulfilled" && (
                      <span className="rounded-full bg-mint-soft px-3 py-1 text-[12px] font-extrabold text-mint-deep ring-1 ring-mint-deep/30">
                        ✓ {lang === "fa" ? "تایید و اضافه شد (+۲۵ امتیاز)" : "Fulfilled (+25 pts)"}
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[12px] font-bold text-rose-500 ring-1 ring-rose-500/30">
                        {lang === "fa" ? "بررسی و رد شد" : "Rejected"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= EDIT PROFILE MODAL ======================= */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "ویرایش اطلاعات حساب کاربری" : "Edit Profile Details"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
              {/* Avatar Selection Picker (Preset only, no file upload) */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "انتخاب تصویر پروفایل (آواتارهای رسمی استودیو)" : "Choose Avatar Preset"}
                </label>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {AVAILABLE_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={cn(
                        "size-12 overflow-hidden rounded-full ring-2 transition",
                        editAvatar === av
                          ? "ring-primary scale-110 shadow-md"
                          : "ring-line opacity-75 hover:opacity-100",
                      )}
                    >
                      <Photo src={av} alt="Avatar option" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "نام نمایشی کاربر" : "Display Name"}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "شناسه کاربری (Handle)" : "Username Handle"}
                </label>
                <input
                  type="text"
                  required
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "درباره من / بیوگرافی کوتاه" : "Bio"}
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-surface p-2.5 text-[13px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "سبک یا ژانر موردعلاقه" : "Favorite Genre"}
                </label>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  placeholder="K-Pop, OST, R&B, EDM..."
                  className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-[12px] font-bold text-ink hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-deep px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-primary-deep/90"
                >
                  {lang === "fa" ? "ذخیره تغییرات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
      />

      <FollowListModal
        open={followModalOpen}
        initialTab={followModalTab}
        onClose={() => setFollowModalOpen(false)}
        onFollowToggle={refreshProfileData}
      />

      <ContentRequestModal
        open={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          refreshProfileData();
        }}
      />
    </div>
  );
}
