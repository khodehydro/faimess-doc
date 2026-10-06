import { useState, useMemo, useEffect } from "react";
import { Icon } from "../ui/Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { usePlaylists } from "../app/PlaylistsContext";
import { Photo } from "../ui/Cover";
import {
  socialApi,
  calculateTierProgress,
  AVAILABLE_AVATARS,
  type UserProfile,
  type BadgeStatusItem,
  type PublicUserPlaylist,
} from "../api/socialApi";
import {
  BADGE_CATEGORIES,
  type BadgeCategory,
  type BadgeRarity,
} from "../data/allBadges";
import { coverPhoto } from "../data/playlists";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { FollowListModal } from "../ui/FollowListModal";
import { ContentRequestModal } from "../ui/ContentRequestModal";
import { ClayBadgeIcon } from "../ui/ClayBadgeIcon";
import { cn } from "../lib/cn";

export function ProfilePage() {
  const { lang, dir, dataLabel } = usePreferences();
  const { notify, openDetail, viewedProfileUsername, openProfile } = useApp();
  const { mine: myPlaylists } = usePlaylists();

  // Load profile for viewed user or self
  const [profile, setProfile] = useState<UserProfile>(() =>
    socialApi.getProfile(viewedProfileUsername || undefined),
  );

  // Sync state when viewedProfileUsername changes
  useEffect(() => {
    setProfile(socialApi.getProfile(viewedProfileUsername || undefined));
  }, [viewedProfileUsername]);

  const isSelf = profile.isSelf;

  const [followStats, setFollowStats] = useState(() =>
    socialApi.getFollowStats(profile.username),
  );
  const [isFollowing, setIsFollowing] = useState(() =>
    socialApi.isFollowing(profile.username),
  );

  // 100 Badges computation
  const all100Badges = useMemo(
    () => socialApi.getAll100Badges(profile.points),
    [profile.points],
  );

  // Badges Filtering & Searching
  const [badgeCategory, setBadgeCategory] = useState<"all" | BadgeCategory>("all");
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<BadgeStatusItem | null>(null);

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<"badges" | "playlists" | "requests">("badges");

  // Edit Profile Modal (Only for Self)
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

  const tierProgress = useMemo(
    () => calculateTierProgress(profile.points),
    [profile.points],
  );

  const refreshProfileData = () => {
    const updated = socialApi.getProfile(viewedProfileUsername || undefined);
    setProfile(updated);
    setFollowStats(socialApi.getFollowStats(updated.username));
    setIsFollowing(socialApi.isFollowing(updated.username));
  };

  const handleToggleFollow = () => {
    const nowFollowing = socialApi.toggleFollow(profile.username);
    setIsFollowing(nowFollowing);
    setFollowStats(socialApi.getFollowStats(profile.username));
    notify(
      nowFollowing
        ? lang === "fa"
          ? `شما @${profile.username} را دنبال کردید`
          : `You followed @${profile.username}`
        : lang === "fa"
          ? `دنبال کردن @${profile.username} لغو شد`
          : `Unfollowed @${profile.username}`,
      nowFollowing ? "mint" : "primary",
    );
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

  // Playlists to show
  const displayPlaylists = useMemo(() => {
    if (isSelf) {
      return myPlaylists.map((pl) => ({
        id: pl.id,
        name: pl.name,
        cover: coverPhoto(pl.cover),
        trackIds: pl.trackIds,
      }));
    }
    return socialApi.getUserPlaylists(profile.username);
  }, [isSelf, myPlaylists, profile.username]);

  // Filtered 100 Badges
  const filteredBadges = useMemo(() => {
    return all100Badges.filter((b) => {
      if (badgeCategory !== "all" && b.category !== badgeCategory) return false;
      if (badgeStatusFilter === "unlocked" && !b.unlocked) return false;
      if (badgeStatusFilter === "locked" && b.unlocked) return false;
      if (badgeSearch.trim()) {
        const q = badgeSearch.toLowerCase().trim();
        return (
          b.titleFa.toLowerCase().includes(q) ||
          b.titleEn.toLowerCase().includes(q) ||
          b.descriptionFa.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [all100Badges, badgeCategory, badgeStatusFilter, badgeSearch]);

  const unlockedCount = all100Badges.filter((b) => b.unlocked).length;

  return (
    <div dir={dir} className="flex min-h-0 flex-1 flex-col p-4 lg:p-7 space-y-6">
      {/* Back to my profile banner if viewing someone else */}
      {!isSelf && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-primary-deep" />
            <span className="text-[13px] font-bold text-ink">
              {lang === "fa"
                ? `در حال مشاهده پروفایل کاربری ${profile.name}`
                : `Viewing profile of ${profile.name}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openProfile()}
            className="flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-[12px] font-extrabold text-primary-deep shadow-2xs transition hover:bg-white"
          >
            <Icon name="users" size={13} />
            <span>{lang === "fa" ? "بازگشت به پروفایل من" : "Back to My Profile"}</span>
          </button>
        </div>
      )}

      {/* ======================= HERO IDENTITY HEADER ======================= */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-subtle/80 via-surface to-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center text-center sm:text-start">
            {/* Avatar with 3D Ring & Level Crest */}
            <div className="relative">
              <div className="size-[96px] overflow-hidden rounded-full ring-4 ring-primary-soft/80 shadow-md sm:size-[108px]">
                <Photo src={profile.avatar} alt={profile.name} />
              </div>
              <span className="absolute -bottom-1 -end-1 flex items-center gap-1 rounded-full bg-primary-deep px-2.5 py-1 text-[12px] font-extrabold text-white shadow-sm">
                <Icon name="crown" size={13} />
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
                {profile.role && (
                  <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
                    {profile.role}
                  </span>
                )}
              </div>

              <p className="mt-1 font-semibold text-[13px] text-ink-muted">
                {profile.handle}
              </p>

              <p className="mt-2.5 max-w-[540px] text-[13px] leading-relaxed text-ink-body">
                {profile.bio || (lang === "fa" ? "علاقه‌مند به دنیای کی‌پاپ و استودیو موسیقی فیمس" : "K-Pop music enthusiast")}
              </p>

              {/* Badges / Chips */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink-muted shadow-2xs">
                  <Icon name="music" size={13} />
                  <span>{lang === "fa" ? "سبک:" : "Genre:"} {profile.favoriteGenre}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink-muted shadow-2xs">
                  <Icon name="star" size={13} className="text-amber-500" />
                  <span>{profile.points.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1 text-[12px] font-bold text-ink-muted shadow-2xs">
                  <Icon name="medal" size={13} className="text-mint-deep" />
                  <span>{unlockedCount} / 100 {lang === "fa" ? "نشان افتخار" : "Badges"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Social Stats & Primary Actions */}
          <div className="flex flex-col items-center sm:items-end gap-3.5">
            {/* Follow / Edit Button */}
            {isSelf ? (
              <div className="flex flex-wrap items-center gap-2">
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
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-2xs transition hover:bg-subtle"
                >
                  <Icon name="bolt" size={14} />
                  <span>{lang === "fa" ? "ویرایش مشخصات" : "Edit Profile"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-deep px-4 py-2 text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep/90"
                >
                  <Icon name="plus" size={14} />
                  <span>{lang === "fa" ? "درخواست آهنگ" : "Request Track"}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition shadow-sm",
                    isFollowing
                      ? "border border-line bg-surface text-ink hover:border-rose-400 hover:text-rose-500"
                      : "bg-primary text-white hover:bg-primary-deep shadow-primary",
                  )}
                >
                  <Icon name={isFollowing ? "check" : "plus"} size={14} />
                  <span>
                    {isFollowing
                      ? lang === "fa" ? "دنبال می‌کنید" : "Following"
                      : lang === "fa" ? "دنبال کردن" : "Follow"}
                  </span>
                </button>
              </div>
            )}

            {/* Followers / Following counts */}
            <div className="flex items-center gap-4 text-[13px] rounded-xl border border-line/60 bg-surface/70 px-4 py-2">
              <button
                type="button"
                onClick={() => handleOpenFollowers("followers")}
                className="group flex items-center gap-1.5 transition hover:text-primary-deep"
              >
                <span className="font-black text-ink group-hover:text-primary-deep">
                  {followStats.followersCount}
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
                  {followStats.followingCount}
                </span>
                <span className="text-ink-muted">
                  {lang === "fa" ? "دنبال‌شده" : "Following"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Tier Progression Bar */}
        <div className="mt-6 rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">
                {lang === "fa" ? "رتبه و سطح فعلی:" : "Current Rank:"}
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
                {lang === "fa" ? "★ بالاترین سطح استودیو کسب شده است!" : "★ Highest rank achieved!"}
              </span>
            )}
          </div>

          <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-subtle p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-primary-deep transition-all duration-700 shadow-xs"
              style={{ width: `${tierProgress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================= TABS NAVIGATION ======================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex flex-wrap gap-2">
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
                ? `تالار ۱۰۰ نشان افتخار (${unlockedCount}/100)`
                : `100 Honors Hall (${unlockedCount}/100)`}
            </span>
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
              {lang === "fa"
                ? `پلی‌لیست‌های کاربر (${displayPlaylists.length})`
                : `Playlists (${displayPlaylists.length})`}
            </span>
          </button>

          {isSelf && (
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
              <span>{lang === "fa" ? "درخواست‌های آهنگ من" : "My Content Requests"}</span>
            </button>
          )}
        </div>

        {isSelf && (
          <button
            type="button"
            onClick={() => setCreatePlaylistOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[12px] font-bold text-ink shadow-2xs hover:bg-subtle"
          >
            <Icon name="plus" size={13} strokeWidth={2.4} />
            <span>{lang === "fa" ? "ساخت پلی‌لیست جدید" : "New Playlist"}</span>
          </button>
        )}
      </div>

      {/* ======================= TAB 1: 100 3D CLAYMORPHIC BADGES ======================= */}
      {activeTab === "badges" && (
        <div className="space-y-5">
          {/* Badges Progress Summary Banner */}
          <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa"
                    ? "کاتالوگ کامل ۱۰۰ نشان ۳بعدی کلی‌مورفیسم استودیو فیمس"
                    : "Complete 100 3D Claymorphic Honors Hall"}
                </h2>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {lang === "fa"
                    ? "نشان‌های اختصاصی شامل «ستاره برتر»، «الماس سه‌تایی»، «خرگوش پا طلایی»، «گربه فضایی» و ۱۰۰ افتخار کلکسیونی."
                    : "Exclusive collectible 3D clay badges unlocked through listening, lyrics and loyalty."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[12px] font-black text-primary-deep">
                  {unlockedCount} {lang === "fa" ? "نشان بازشده" : "Unlocked"}
                </span>
                <span className="rounded-full bg-subtle px-3 py-1 text-[12px] font-bold text-ink-muted">
                  {100 - unlockedCount} {lang === "fa" ? "نشان قفل" : "Locked"}
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBadgeCategory("all")}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[12px] font-bold transition",
                  badgeCategory === "all"
                    ? "bg-ink text-surface"
                    : "bg-subtle text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "همه دسته‌بندی‌ها (۱۰۰)" : "All Categories (100)"}
              </button>
              {BADGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBadgeCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold transition",
                    badgeCategory === cat.id
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon name={cat.icon} size={13} />
                  <span>{dataLabel(cat.labelFa)}</span>
                </button>
              ))}
            </div>

            {/* Sub-Filters: Status & Search */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-ink-muted">
                  {lang === "fa" ? "نمایش:" : "Status:"}
                </span>
                {(["all", "unlocked", "locked"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setBadgeStatusFilter(st)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[12px] font-bold transition",
                      badgeStatusFilter === st
                        ? "bg-primary-soft text-primary-deep font-extrabold"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {st === "all"
                      ? lang === "fa" ? "همه" : "All"
                      : st === "unlocked"
                        ? lang === "fa" ? "دریافت‌شده" : "Unlocked"
                        : lang === "fa" ? "باقی‌مانده و قفل" : "Locked"}
                  </button>
                ))}
              </div>

              {/* Search input for badges */}
              <div className="relative w-full sm:w-[240px]">
                <Icon
                  name="search"
                  size={14}
                  className="pointer-events-none absolute start-3 top-2.5 text-ink-faint"
                />
                <input
                  type="text"
                  value={badgeSearch}
                  onChange={(e) => setBadgeSearch(e.target.value)}
                  placeholder={lang === "fa" ? "جستجوی نشان (خرگوش، ستاره...)" : "Search badge..."}
                  className="w-full rounded-xl border border-line bg-surface py-1.5 pe-3 ps-8 text-[12px] text-ink outline-none focus:border-primary-deep"
                />
              </div>
            </div>
          </div>

          {/* 100 Badges Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "group flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md",
                  badge.unlocked
                    ? "border-mint-deep/30 bg-surface hover:border-mint-deep/60"
                    : "border-line/70 bg-subtle/30 opacity-85 hover:opacity-100 hover:border-line",
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    {/* 3D Clay Badge Icon */}
                    <ClayBadgeIcon
                      glyph={badge.clayGlyph}
                      tone={badge.clayTone}
                      size="md"
                      locked={!badge.unlocked}
                    />

                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[12px] font-black text-ink-faint">
                        #{badge.number}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[12px] font-extrabold",
                          badge.rarity === "common" && "bg-subtle text-ink-muted",
                          badge.rarity === "rare" && "bg-sky-500/10 text-sky-600",
                          badge.rarity === "epic" && "bg-purple-500/10 text-purple-600",
                          badge.rarity === "legendary" && "bg-amber-500/10 text-amber-600",
                          badge.rarity === "mythic" && "bg-rose-500/10 text-rose-600",
                        )}
                      >
                        {badge.rarity === "common"
                          ? lang === "fa" ? "عادی" : "Common"
                          : badge.rarity === "rare"
                            ? lang === "fa" ? "کمیاب" : "Rare"
                            : badge.rarity === "epic"
                              ? lang === "fa" ? "حماسی" : "Epic"
                              : badge.rarity === "legendary"
                                ? lang === "fa" ? "افسانه‌ای" : "Legendary"
                                : lang === "fa" ? "اسطوره‌ای" : "Mythic"}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-3 truncate font-extrabold text-[13.5px] text-ink group-hover:text-primary-deep">
                    {dataLabel(badge.titleFa)}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                    {badge.descriptionFa}
                  </p>
                </div>

                {/* Progress / Status Bar */}
                <div className="mt-3.5 border-t border-line/60 pt-2.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-ink-muted">
                      {badge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
                    </span>
                    {badge.unlocked ? (
                      <span className="font-black text-mint-deep">
                        ✓ {lang === "fa" ? "دریافت شده" : "Unlocked"}
                      </span>
                    ) : (
                      <span className="font-bold text-primary-deep">
                        {badge.remainingPoints.toLocaleString()} {lang === "fa" ? "مانده" : "needed"}
                      </span>
                    )}
                  </div>

                  {!badge.unlocked && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line/80">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="py-12 text-center text-ink-muted">
              <Icon name="search" size={24} className="mx-auto text-ink-faint" />
              <p className="mt-2 text-[13px] font-bold">
                {lang === "fa" ? "هیچ نشانی با این فیلتر یا نام یافت نشد." : "No badges match your criteria."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: PUBLIC USER PLAYLISTS ======================= */}
      {activeTab === "playlists" && (
        <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-extrabold text-[16px] text-ink">
                {isSelf
                  ? lang === "fa" ? "پلی‌لیست‌های اختصاصی من" : "My Created Playlists"
                  : lang === "fa" ? `پلی‌لیست‌های عمومی ${profile.name}` : `${profile.name}’s Playlists`}
              </h2>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پلی‌لیست‌های ساخته‌شده با کاورهای رسمی استودیو فیمس (امکان پخش فوری و مشاهده قطعات)."
                  : "Curated playlists strictly with studio bundled artwork"}
              </p>
            </div>

            {isSelf && (
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary hover:bg-primary-deep"
              >
                <Icon name="plus" size={14} />
                <span>{lang === "fa" ? "ساخت پلی‌لیست جدید" : "New Playlist"}</span>
              </button>
            )}
          </div>

          {displayPlaylists.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              <p className="text-[13px]">
                {lang === "fa" ? "هیچ پلی‌لیستی در این بخش موجود نیست." : "No playlists found."}
              </p>
              {isSelf && (
                <button
                  type="button"
                  onClick={() => setCreatePlaylistOpen(true)}
                  className="mt-3 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-white"
                >
                  {lang === "fa" ? "ساخت اولین پلی‌لیست" : "Create One"}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {displayPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-3 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle shadow-xs">
                    <Photo src={pl.cover} alt={pl.name} />
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

      {/* ======================= TAB 3: FAN CONTENT REQUESTS (SELF ONLY) ======================= */}
      {isSelf && activeTab === "requests" && (
        <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "پیگیری درخواست‌های ارسالی به مدیران" : "Your Content Requests"}
              </h2>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "وضعیت بررسی و تایید ترانه‌ها، آلبوم‌ها یا متن‌های ارسالی به ناظران استودیو"
                  : "Track status of tracks, albums or lyrics submitted for review"}
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

          <div className="space-y-2.5">
            {socialApi.getContentRequests().map((req) => (
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
        </div>
      )}

      {/* ======================= 3D CLAY BADGE DETAIL MODAL ======================= */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[26px] border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-black text-ink-faint">
                  #{selectedBadge.number}
                </span>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[12px] font-bold text-primary-deep">
                  {selectedBadge.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center py-6 text-center">
              {/* Extra Large 3D Clay Badge Icon */}
              <ClayBadgeIcon
                glyph={selectedBadge.clayGlyph}
                tone={selectedBadge.clayTone}
                size="xl"
                locked={!selectedBadge.unlocked}
                className="scale-110"
              />

              <h3 className="mt-5 font-black text-[20px] text-ink">
                {dataLabel(selectedBadge.titleFa)}
              </h3>
              <p className="text-[13px] font-bold text-ink-muted">
                {selectedBadge.titleEn}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-0.5 text-[12px] font-black",
                    selectedBadge.rarity === "common" && "bg-subtle text-ink-muted",
                    selectedBadge.rarity === "rare" && "bg-sky-500/10 text-sky-600",
                    selectedBadge.rarity === "epic" && "bg-purple-500/10 text-purple-600",
                    selectedBadge.rarity === "legendary" && "bg-amber-500/10 text-amber-600",
                    selectedBadge.rarity === "mythic" && "bg-rose-500/10 text-rose-600",
                  )}
                >
                  {selectedBadge.rarity === "common"
                    ? lang === "fa" ? "درجه: عادی" : "Rarity: Common"
                    : selectedBadge.rarity === "rare"
                      ? lang === "fa" ? "درجه: کمیاب" : "Rarity: Rare"
                      : selectedBadge.rarity === "epic"
                        ? lang === "fa" ? "درجه: حماسی" : "Rarity: Epic"
                        : selectedBadge.rarity === "legendary"
                          ? lang === "fa" ? "درجه: افسانه‌ای" : "Rarity: Legendary"
                          : lang === "fa" ? "درجه: اسطوره‌ای" : "Rarity: Mythic"}
                </span>

                <span className="rounded-full border border-line bg-subtle px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
                  {selectedBadge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
                </span>
              </div>

              <p className="mt-4 max-w-[360px] text-[13px] leading-relaxed text-ink-body">
                {selectedBadge.descriptionFa}
              </p>

              <div className="mt-6 w-full rounded-2xl border border-line/70 bg-subtle/50 p-3.5">
                {selectedBadge.unlocked ? (
                  <div className="flex items-center justify-center gap-2 text-mint-deep font-extrabold text-[13px]">
                    <Icon name="check" size={16} />
                    <span>{lang === "fa" ? "شما این نشان ۳بعدی را باز کرده‌اید!" : "Badge Unlocked!"}</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-ink-muted">
                        {lang === "fa" ? "کسر امتیاز تا باز شدن:" : "Points needed:"}
                      </span>
                      <span className="font-extrabold text-primary-deep">
                        {selectedBadge.remainingPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${selectedBadge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-line pt-3 text-center">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full rounded-xl bg-subtle py-2 text-[12.5px] font-bold text-ink hover:bg-surface"
              >
                {lang === "fa" ? "بستن" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT PROFILE MODAL ======================= */}
      {isSelf && isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "ویرایش اطلاعات حساب کاربری" : "Edit Profile Details"}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-slim">
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
