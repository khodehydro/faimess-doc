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
} from "../data/allBadges";
import { coverPhoto } from "../data/playlists";
import { CreatePlaylistDialog } from "../ui/PlaylistDialogs";
import { FollowListModal } from "../ui/FollowListModal";
import { ContentRequestModal } from "../ui/ContentRequestModal";
import { ClayBadgeIcon } from "../ui/ClayBadgeIcon";
import { cn } from "../lib/cn";

/**
 * 3D Claymorphic Custom Badge Card View
 * Enhanced tactile collector card with embossed podium, ambient lighting,
 * shimmering rarity jewel pill, and dynamic 3D progress ribbon.
 */
function RichClayBadgeCard({
  badge,
  lang,
  dataLabel,
  onSelect,
}: {
  badge: BadgeStatusItem;
  lang: string;
  dataLabel: (s: string) => string;
  onSelect: (b: BadgeStatusItem) => void;
}) {
  const rarityConfig = {
    common: {
      labelFa: "عادی",
      labelEn: "Common",
      pill: "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400/25",
      halo: "from-slate-400/10 to-transparent",
      border: "border-line/70 hover:border-line",
    },
    rare: {
      labelFa: "کمیاب",
      labelEn: "Rare",
      pill: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30",
      halo: "from-sky-500/15 to-transparent",
      border: "border-sky-300/40 dark:border-sky-500/20 hover:border-sky-400",
    },
    epic: {
      labelFa: "حماسی",
      labelEn: "Epic",
      pill: "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30",
      halo: "from-purple-500/15 to-transparent",
      border: "border-purple-300/40 dark:border-purple-500/20 hover:border-purple-400",
    },
    legendary: {
      labelFa: "افسانه‌ای",
      labelEn: "Legendary",
      pill: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30 shadow-xs",
      halo: "from-amber-500/20 to-transparent",
      border: "border-amber-300/50 dark:border-amber-500/30 hover:border-amber-400",
    },
    mythic: {
      labelFa: "اسطوره‌ای",
      labelEn: "Mythic",
      pill: "bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 shadow-xs",
      halo: "from-rose-500/20 via-amber-500/15 to-transparent",
      border: "border-rose-300/50 dark:border-rose-500/30 hover:border-rose-400",
    },
  }[badge.rarity];

  const categoryNamesFa: Record<BadgeCategory, string> = {
    streaming: "استریم",
    lyrics: "لیریک",
    playlists: "مجموعه‌دار",
    community: "جامعه",
    loyalty: "وفاداری",
    mythic: "اسطوره‌ای",
  };

  return (
    <div
      onClick={() => onSelect(badge)}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] border p-4 transition-all duration-300",
        "shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:-translate-y-1.5 hover:shadow-xl",
        badge.unlocked
          ? cn(
              "bg-gradient-to-b from-surface via-surface to-subtle/50",
              rarityConfig.border,
            )
          : "border-line/60 bg-gradient-to-b from-subtle/40 via-surface to-surface opacity-85 hover:opacity-100",
      )}
    >
      {/* Background ambient radial glow when unlocked */}
      {badge.unlocked && (
        <div
          className={cn(
            "pointer-events-none absolute -end-12 -top-12 size-36 rounded-full bg-gradient-to-b blur-2xl",
            rarityConfig.halo,
          )}
        />
      )}

      {/* Top Header: Monospace #ID & Category & Shimmering Rarity */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] font-black tracking-tight text-ink-faint">
              #{badge.number < 10 ? `0${badge.number}` : badge.number}
            </span>
            <span className="rounded-full bg-subtle px-2 py-0.5 text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? categoryNamesFa[badge.category] : badge.category}
            </span>
          </div>

          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[12px] font-black transition",
              rarityConfig.pill,
            )}
          >
            {lang === "fa" ? rarityConfig.labelFa : rarityConfig.labelEn}
          </span>
        </div>

        {/* Elevated 3D Clay Podium */}
        <div className="mt-3.5 flex items-center justify-center">
          <div className="relative flex size-[76px] items-center justify-center rounded-2xl bg-gradient-to-b from-white/95 to-white/60 dark:from-white/10 dark:to-white/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_6px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] transition duration-300 group-hover:scale-105">
            <ClayBadgeIcon
              glyph={badge.clayGlyph}
              tone={badge.clayTone}
              size="md"
              locked={!badge.unlocked}
            />
          </div>
        </div>

        {/* Titles & Lore */}
        <div className="mt-3 text-center">
          <h3 className="truncate font-black text-[14px] text-ink transition-colors group-hover:text-primary-deep">
            {dataLabel(badge.titleFa)}
          </h3>
          <p className="mt-0.5 text-[12px] font-bold text-ink-muted/80">
            {badge.titleEn}
          </p>

          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-body">
            {badge.descriptionFa}
          </p>
        </div>
      </div>

      {/* Footer Tactile 3D Ribbon / Progress Bar */}
      <div className="mt-3.5 border-t border-line/60 pt-3">
        {badge.unlocked ? (
          <div className="flex items-center justify-between rounded-xl bg-mint-soft/80 px-2.5 py-1.5 text-[12px] ring-1 ring-mint-deep/20">
            <span className="flex items-center gap-1 font-black text-mint-deep">
              <Icon name="check" size={13} strokeWidth={2.8} />
              <span>{lang === "fa" ? "دریافت شده" : "Unlocked"}</span>
            </span>
            <span className="font-extrabold text-mint-deep">
              +{badge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-ink-muted">
                {badge.remainingPoints.toLocaleString()} {lang === "fa" ? "امتیاز مانده" : "needed"}
              </span>
              <span className="font-extrabold text-primary-deep">
                {badge.progressPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-subtle ring-1 ring-line/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-flame transition-all duration-500"
                style={{ width: `${badge.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Micro-Affordance */}
        <div className="mt-2 flex items-center justify-center gap-1 text-[12px] font-bold text-ink-faint transition group-hover:text-primary-deep">
          <Icon name="search" size={12} />
          <span>{lang === "fa" ? "مشاهده مدل ۳بعدی" : "View 3D Badge"}</span>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { lang, dir, dataLabel } = usePreferences();
  const { notify, openDetail, viewedProfileUsername, openProfile } = useApp();
  const { mine: myPlaylists } = usePlaylists();

  // Load profile for viewed user or self
  const [profile, setProfile] = useState<UserProfile>(() =>
    socialApi.getProfile(viewedProfileUsername || undefined),
  );

  const [followStats, setFollowStats] = useState(() =>
    socialApi.getFollowStats(profile.username),
  );
  const [isFollowing, setIsFollowing] = useState(() =>
    socialApi.isFollowing(profile.username),
  );

  // Sync state whenever viewedProfileUsername changes and reset scroll
  useEffect(() => {
    const updated = socialApi.getProfile(viewedProfileUsername || undefined);
    setProfile(updated);
    setFollowStats(socialApi.getFollowStats(updated.username));
    setIsFollowing(socialApi.isFollowing(updated.username));
    setEditName(updated.name);
    setEditHandle(updated.handle);
    setEditBio(updated.bio);
    setEditGenre(updated.favoriteGenre);
    setEditAvatar(updated.avatar);

    if (typeof document !== "undefined") {
      document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [viewedProfileUsername]);

  const isSelf = profile.isSelf;

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

  // Sub-tabs: overview, badges, playlists, followers, following, requests
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "playlists" | "followers" | "following" | "requests">("badges");

  // Reset scroll to top on tab switch
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeTab]);

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

  // Direct user navigation input on profile page
  const [userSearchInput, setUserSearchInput] = useState("");

  const tierProgress = useMemo(
    () => calculateTierProgress(profile.points),
    [profile.points],
  );

  const featuredCommunityMembers = useMemo(
    () => socialApi.getFeaturedCommunityUsers(),
    [],
  );

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

  const handleGoToUser = (e: React.FormEvent) => {
    e.preventDefault();
    const target = userSearchInput.trim();
    if (!target) return;
    openProfile(target);
    setUserSearchInput("");
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
    <div dir={dir} className="flex min-h-0 flex-1 flex-col p-4 sm:p-6 space-y-6">
      {/* Top Banner when viewing someone else's profile */}
      {!isSelf && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft/40 px-4 py-3 shadow-xs">
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

      {/* ======================= COMMUNITY QUICK MEMBERS & ID SEARCH ======================= */}
      <div className="rounded-[22px] border border-line bg-surface/90 p-3.5 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Quick Member Avatars Rail */}
          <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1">
            <span className="shrink-0 text-[12px] font-extrabold text-ink-faint ps-1">
              {lang === "fa" ? "اعضای برتر استودیو:" : "Community:"}
            </span>

            {featuredCommunityMembers.map((m) => {
              const isSelected = profile.username.toLowerCase() === m.username.toLowerCase();
              return (
                <button
                  key={m.username}
                  type="button"
                  onClick={() => openProfile(m.username)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[12px] font-bold transition",
                    isSelected
                      ? "border-primary bg-primary text-white shadow-primary"
                      : "border-line bg-surface text-ink hover:border-primary/40 hover:bg-subtle",
                  )}
                >
                  <div className="size-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/50">
                    <Photo src={m.avatar} alt={m.displayNameFa} />
                  </div>
                  <span>{m.displayNameFa}</span>
                </button>
              );
            })}

            {/* Self button if not current */}
            {!isSelf && (
              <button
                type="button"
                onClick={() => openProfile()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-subtle px-2.5 py-1 text-[12px] font-bold text-ink-muted hover:text-ink"
              >
                <span>{lang === "fa" ? "⭐ پروفایل خودم" : "⭐ My Profile"}</span>
              </button>
            )}
          </div>

          {/* Direct Search / Go to User ID Form */}
          <form
            onSubmit={handleGoToUser}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="relative w-full sm:w-[220px]">
              <Icon
                name="search"
                size={14}
                className="pointer-events-none absolute start-3 top-2.5 text-ink-faint"
              />
              <input
                type="text"
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                placeholder={lang === "fa" ? "آیدی کاربر (مثلاً yuna_music@)" : "Username (e.g. yuna_music)"}
                className="w-full rounded-xl border border-line bg-surface py-1.5 pe-3 ps-8 text-[12px] text-ink outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-primary-deep shadow-2xs"
            >
              {lang === "fa" ? "مشاهده" : "View"}
            </button>
          </form>
        </div>
      </div>

      {/* ======================= HERO IDENTITY CARD ======================= */}
      <div className="relative rounded-[28px] border border-line bg-gradient-to-b from-subtle/80 via-surface to-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity & Avatar */}
          <div className="flex flex-col items-center gap-5 sm:flex-row text-center sm:text-start">
            {/* Avatar with 3D Ring & Level Crest */}
            <div className="relative shrink-0">
              <div className="size-[96px] overflow-hidden rounded-full ring-4 ring-primary-soft/80 shadow-md sm:size-[104px]">
                <Photo src={profile.avatar} alt={profile.name} />
              </div>
              <span className="absolute -bottom-1 -end-1 flex items-center gap-1 rounded-full bg-primary-deep px-2.5 py-1 text-[12px] font-extrabold text-white shadow-sm ring-2 ring-surface">
                <Icon name="crown" size={13} />
                <span>Lv.{tierProgress.currentTier.level}</span>
              </span>
            </div>

            {/* Names & Bios */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="truncate font-black text-[22px] text-ink sm:text-[25px]">
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

              <p className="mt-2.5 max-w-[560px] text-[13px] leading-relaxed text-ink-body">
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
          <div className="flex flex-col items-center lg:items-end gap-3.5 shrink-0">
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
            <div className="flex items-center gap-4 text-[13px] rounded-xl border border-line/70 bg-surface/80 px-4 py-2 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setFollowModalTab("followers");
                  setFollowModalOpen(true);
                }}
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
                onClick={() => {
                  setFollowModalTab("following");
                  setFollowModalOpen(true);
                }}
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
        <div className="mt-5 rounded-2xl border border-line/70 bg-surface/90 p-4 shadow-2xs">
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
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition",
              activeTab === "overview"
                ? "bg-primary text-white shadow-primary"
                : "bg-surface text-ink-muted hover:bg-subtle hover:text-ink",
            )}
          >
            <Icon name="compass" size={14} />
            <span>{lang === "fa" ? "نمای کلی" : "Overview"}</span>
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
                ? `پلی‌لیست‌ها (${displayPlaylists.length})`
                : `Playlists (${displayPlaylists.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFollowModalTab("following");
              setFollowModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold bg-surface text-ink-muted hover:bg-subtle hover:text-ink transition"
          >
            <Icon name="users" size={14} />
            <span>
              {lang === "fa"
                ? `دنبال‌شدگان (${followStats.followingCount})`
                : `Following (${followStats.followingCount})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFollowModalTab("followers");
              setFollowModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold bg-surface text-ink-muted hover:bg-subtle hover:text-ink transition"
          >
            <Icon name="heart" size={14} />
            <span>
              {lang === "fa"
                ? `دنبال‌کنندگان (${followStats.followersCount})`
                : `Followers (${followStats.followersCount})`}
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
              <span>{lang === "fa" ? "درخواست‌های آهنگ من" : "My Requests"}</span>
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

      {/* ======================= TAB 0: OVERVIEW ======================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Highlights of Top Unlocked Badges */}
          <div className="rounded-[24px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="sparkle" size={18} className="text-amber-500" />
                <h2 className="font-extrabold text-[16px] text-ink">
                  {lang === "fa" ? "برگزیده نشان‌های سه‌بعدی کسب‌شده" : "Featured Unlocked 3D Badges"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("badges")}
                className="text-[12px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "مشاهده همه ۱۰۰ نشان ←" : "View all 100 badges →"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
              {all100Badges.filter((b) => b.unlocked).slice(0, 6).map((badge) => (
                <RichClayBadgeCard
                  key={badge.id}
                  badge={badge}
                  lang={lang}
                  dataLabel={dataLabel}
                  onSelect={setSelectedBadge}
                />
              ))}
            </div>
          </div>

          {/* User Playlists in Overview */}
          <div className="rounded-[24px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Icon name="disc" size={18} className="text-primary" />
                <h2 className="font-extrabold text-[16px] text-ink">
                  {isSelf
                    ? lang === "fa" ? "پلی‌لیست‌های اختصاصی من" : "My Created Playlists"
                    : lang === "fa" ? `پلی‌لیست‌های ${profile.name}` : `${profile.name}’s Playlists`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("playlists")}
                className="text-[12px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "مشاهده همه پلی‌لیست‌ها ←" : "View all playlists →"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
              {displayPlaylists.slice(0, 3).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-3 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle shadow-xs">
                    <Photo src={pl.cover} alt={pl.name} />
                  </div>
                  <h3 className="mt-2.5 truncate font-bold text-[14px] text-ink group-hover:text-primary-deep">
                    {pl.name}
                  </h3>
                  <p className="text-[12px] text-ink-muted">
                    {pl.trackIds.length} {lang === "fa" ? "قطعه موسیقی" : "tracks"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

          {/* 100 Badges Grid with Rich Custom Views */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBadges.map((badge) => (
              <RichClayBadgeCard
                key={badge.id}
                badge={badge}
                lang={lang}
                dataLabel={dataLabel}
                onSelect={setSelectedBadge}
              />
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
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{lang === "fa" ? "ساخت پلی‌لیست جدید" : "New Playlist"}</span>
              </button>
            )}
          </div>

          {displayPlaylists.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              <Icon name="disc" size={32} className="mx-auto text-ink-faint" />
              <p className="mt-2 font-bold text-[14px]">
                {lang === "fa" ? "هنوز هیچ پلی‌لیستی ایجاد نشده است." : "No playlists yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {displayPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-3 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle shadow-xs">
                    <Photo src={pl.cover} alt={pl.name} />
                  </div>
                  <h3 className="mt-2.5 truncate font-bold text-[14px] text-ink group-hover:text-primary-deep">
                    {pl.name}
                  </h3>
                  <p className="text-[12px] text-ink-muted">
                    {pl.trackIds.length} {lang === "fa" ? "قطعه موسیقی" : "tracks"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: CONTENT REQUESTS (SELF ONLY) ======================= */}
      {activeTab === "requests" && isSelf && (
        <div className="rounded-[22px] border border-line bg-surface p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "پیگیری درخواست‌های افزودن موزیک و آلبوم" : "Track & Album Requests"}
              </h2>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "وضعیت بررسی قطعات ارسالی توسط ادمین‌های استودیو فیمس. با تایید هر قطعه ۲۵ امتیاز دریافت می‌کنید."
                  : "Track submission status. Earn +25 points when approved"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-primary-deep"
            >
              <Icon name="plus" size={13} strokeWidth={2.4} />
              <span>{lang === "fa" ? "درخواست جدید" : "New Request"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {socialApi.getUserRequests().map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-2 rounded-xl border border-line/70 bg-subtle/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[14px] text-ink">
                      {req.title}
                    </h3>
                    <span className="text-[12px] text-ink-muted">
                      ({req.artistName})
                    </span>
                  </div>
                  {req.notes && (
                    <p className="mt-1 text-[12px] text-ink-muted">
                      {req.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {req.status === "pending" && (
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-600 ring-1 ring-amber-500/30">
                      {lang === "fa" ? "در انتظار بررسی ادمین" : "Pending Review"}
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
              {/* Extra Large 3D Clay Badge Icon on Collector Podium */}
              <div className="relative flex size-28 items-center justify-center rounded-3xl bg-gradient-to-b from-white/95 to-white/50 dark:from-white/10 dark:to-white/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
                <ClayBadgeIcon
                  glyph={selectedBadge.clayGlyph}
                  tone={selectedBadge.clayTone}
                  size="xl"
                  locked={!selectedBadge.unlocked}
                  className="scale-110"
                />
              </div>

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
                {lang === "fa" ? "بستن پنجره" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT PROFILE MODAL ======================= */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-extrabold text-[16px] text-ink">
                {lang === "fa" ? "ویرایش اطلاعات حساب کاربری" : "Edit Profile"}
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
              {/* Avatar Selector */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-2">
                  {lang === "fa" ? "انتخاب آواتار ۳بعدی" : "Select Avatar"}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={cn(
                        "size-12 overflow-hidden rounded-full ring-2 transition",
                        editAvatar === av ? "ring-primary-deep scale-105" : "ring-transparent hover:ring-line",
                      )}
                    >
                      <Photo src={av} alt={`Avatar option ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "نام نمایشی" : "Display Name"}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep"
                  required
                />
              </div>

              {/* Handle */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "نام کاربری (هندل)" : "Username (Handle)"}
                </label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep font-mono"
                  required
                />
              </div>

              {/* Favorite Genre */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "سبک موسیقی مورد علاقه" : "Favorite Genre"}
                </label>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "بیوگرافی و معرفی کوتاه" : "Bio"}
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary-deep resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-ink-muted hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {lang === "fa" ? "ذخیره تغییرات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Creation Dialog */}
      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
      />

      {/* Followers / Following List Modal */}
      <FollowListModal
        open={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        initialTab={followModalTab}
        onFollowToggle={() => {
          setFollowStats(socialApi.getFollowStats(profile.username));
          setIsFollowing(socialApi.isFollowing(profile.username));
        }}
      />

      {/* Request Music Content Modal */}
      <ContentRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </div>
  );
}
