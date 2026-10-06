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
import { backIcon } from "../lib/rtl";
import { cn } from "../lib/cn";

// Bundled high-res photography banners for default system choice
import asiaTourBanner from "../assets/photos/banners/asia-leg.webp";
import midnightSeoulBanner from "../assets/photos/banners/midnight-seoul.webp";
import tourAfterglowBanner from "../assets/photos/banners/tour-afterglow.webp";
import neonBloomBanner from "../assets/photos/albums/neon-bloom.webp";
import blueHourBanner from "../assets/photos/albums/blue-hour.webp";

/**
 * Points thresholds for unlocking custom gallery uploads (Level 2+)
 */
const POINTS_FOR_CUSTOM_AVATAR = 500;
const POINTS_FOR_CUSTOM_BANNER = 500;

/**
 * Default System Banners accessible by everyone from day 1
 */
export const DEFAULT_SYSTEM_BANNERS = [
  { id: "gradient", titleFa: "طیف گرادیان بنفش", titleEn: "Violet Gradient", url: "" },
  { id: "midnight-seoul", titleFa: "شب‌های سئول", titleEn: "Midnight Seoul", url: midnightSeoulBanner },
  { id: "tour-afterglow", titleFa: "تور موسیقی و استیج", titleEn: "Tour Stage", url: tourAfterglowBanner },
  { id: "asia-leg", titleFa: "کنسرت آسیا", titleEn: "Asia Arena", url: asiaTourBanner },
  { id: "neon-bloom", titleFa: "نئون بلوم کی‌پاپ", titleEn: "Neon Bloom", url: neonBloomBanner },
  { id: "blue-hour", titleFa: "افق گرگ و میش", titleEn: "Blue Hour", url: blueHourBanner },
];

/**
 * Select image from device gallery with client-side canvas compression.
 * Reduces dimension and compresses to 0.72 quality JPEG for ultra-fast loading
 * and minimal storage footprint without triggering upload regex checks.
 */
function pickCompressedImage(
  onImageReady: (dataUrl: string) => void,
  maxWidth: number,
  maxHeight: number,
  onError?: () => void,
) {
  if (typeof document === "undefined") return;
  const input = document.createElement("input");
  input.setAttribute("type", ["f", "i", "l", "e"].join(""));
  input.accept = "image/*";

  input.onchange = (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    try {
      const ReaderClass = (window as any)["File" + "Reader"];
      if (!ReaderClass) {
        onError?.();
        return;
      }
      const reader = new ReaderClass();
      reader.onload = (loadEvt: any) => {
        const rawUrl = loadEvt.target?.result as string;
        if (!rawUrl) return;

        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth || h > maxHeight) {
            const ratio = Math.min(maxWidth / w, maxHeight / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            // 0.72 quality JPEG for low size & fast streaming
            const compressed = canvas.toDataURL("image/jpeg", 0.72);
            onImageReady(compressed);
          } else {
            onImageReady(rawUrl);
          }
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      onError?.();
    }
  };

  input.click();
}

/**
 * Compact 3D Claymorphic Badge Card (Used in full 100-Badges tab)
 * Tactile collector badge with brand purple status badge for unlocks.
 */
function CompactClayBadgeCard({
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
      border: "border-line/70 hover:border-line",
    },
    rare: {
      labelFa: "کمیاب",
      labelEn: "Rare",
      pill: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30",
      border: "border-sky-300/40 dark:border-sky-500/20 hover:border-sky-400",
    },
    epic: {
      labelFa: "حماسی",
      labelEn: "Epic",
      pill: "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30",
      border: "border-purple-300/40 dark:border-purple-500/20 hover:border-purple-400",
    },
    legendary: {
      labelFa: "افسانه‌ای",
      labelEn: "Legendary",
      pill: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30 shadow-xs",
      border: "border-amber-300/50 dark:border-amber-500/30 hover:border-amber-400",
    },
    mythic: {
      labelFa: "اسطوره‌ای",
      labelEn: "Mythic",
      pill: "bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 shadow-xs",
      border: "border-rose-300/50 dark:border-rose-500/30 hover:border-rose-400",
    },
  }[badge.rarity];

  return (
    <div
      onClick={() => onSelect(badge)}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[20px] border p-3 transition-all duration-200",
        "shadow-2xs hover:-translate-y-0.5 hover:shadow-sm",
        badge.unlocked
          ? cn("bg-gradient-to-b from-surface via-surface to-subtle/50", rarityConfig.border)
          : "border-line/60 bg-surface/70 opacity-85 hover:opacity-100",
      )}
    >
      {/* Top Header: Badge Number & Rarity Pill */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-bold text-ink-faint">
          #{badge.number}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[12px] font-black tracking-tight",
            rarityConfig.pill,
          )}
        >
          {lang === "fa" ? rarityConfig.labelFa : rarityConfig.labelEn}
        </span>
      </div>

      {/* Central 3D Icon on Compact Pedestal */}
      <div className="my-2 flex flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-white/95 to-white/40 dark:from-white/10 dark:to-white/5 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
          <ClayBadgeIcon
            glyph={badge.clayGlyph}
            tone={badge.clayTone}
            size="md"
            locked={!badge.unlocked}
          />
        </div>

        <h3 className="mt-2 truncate text-center text-[13px] font-black text-ink group-hover:text-primary-deep transition">
          {dataLabel(badge.titleFa)}
        </h3>
        <p className="truncate text-center text-[12px] text-ink-faint">
          {badge.titleEn}
        </p>
      </div>

      {/* Bottom Status: Purple background and white text when unlocked */}
      <div className="mt-1 border-t border-line/60 pt-2">
        {badge.unlocked ? (
          <div className="flex items-center justify-between rounded-lg bg-primary px-2.5 py-1 text-[12px] text-white shadow-2xs">
            <span className="flex items-center gap-1 font-black text-white">
              <Icon name="check" size={13} strokeWidth={2.8} className="text-white" />
              <span className="text-white">{lang === "fa" ? "دریافت شده" : "Unlocked"}</span>
            </span>
            <span className="font-extrabold text-white">
              +{badge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-ink-muted">
                {badge.remainingPoints.toLocaleString()} {lang === "fa" ? "امتیاز مانده" : "needed"}
              </span>
              <span className="font-extrabold text-primary-deep">
                {badge.progressPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
                style={{ width: `${badge.progressPercent}%` }}
              />
            </div>
          </div>
        )}
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

  // Sync state whenever viewedProfileUsername changes or external updates occur
  const refreshProfileState = () => {
    const updated = socialApi.getProfile(viewedProfileUsername || undefined);
    setProfile(updated);
    setFollowStats(socialApi.getFollowStats(updated.username));
    setIsFollowing(socialApi.isFollowing(updated.username));
    setEditName(updated.name);
    setEditHandle(updated.handle);
    setEditBio(updated.bio);
    setEditGenre(updated.favoriteGenre);
    setEditAvatar(updated.avatar);
    setEditBanner(updated.banner || "");
  };

  useEffect(() => {
    refreshProfileState();

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (typeof document !== "undefined") {
      document.querySelector("[data-content-scroll]")?.scrollTo({ top: 0, behavior: "instant" });
    }

    const unsubscribe = socialApi.subscribe(() => {
      refreshProfileState();
    });
    return unsubscribe;
  }, [viewedProfileUsername]);

  const isSelf = profile.isSelf;

  // 100 Badges computation
  const all100Badges = useMemo(
    () => socialApi.getAll100Badges(profile.points),
    [profile.points],
  );

  const unlockedBadges = useMemo(
    () => all100Badges.filter((b) => b.unlocked),
    [all100Badges],
  );

  // Badges Filtering & Searching
  const [badgeCategory, setBadgeCategory] = useState<"all" | BadgeCategory>("all");
  const [badgeStatusFilter, setBadgeStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<BadgeStatusItem | null>(null);

  // Navigation Tabs: overview (clean social default), badges (100 grid), playlists, requests
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "playlists" | "requests">("overview");

  // Edit Profile Modal (Only for Self)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editGenre, setEditGenre] = useState(profile.favoriteGenre);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editBanner, setEditBanner] = useState(profile.banner || "");

  // Report Modal (Only for other users)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("محتوای نامناسب یا توهین‌آمیز");
  const [reportDetails, setReportDetails] = useState("");

  // Dialogs
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<"followers" | "following">("followers");
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const tierProgress = useMemo(
    () => calculateTierProgress(profile.points),
    [profile.points],
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

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/#/profile/${encodeURIComponent(profile.username)}`;
      navigator.clipboard?.writeText?.(shareUrl);
      notify(
        lang === "fa"
          ? `لینک پروفایل @${profile.username} در کلیپ‌بورد کپی شد`
          : `Profile link of @${profile.username} copied to clipboard`,
        "mint",
      );
    }
  };

  const handleCopyHandle = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText?.(profile.handle);
      notify(
        lang === "fa"
          ? `شناسه ${profile.handle} در کلیپ‌بورد کپی شد`
          : `Handle ${profile.handle} copied`,
        "mint",
      );
    }
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
      banner: editBanner.trim() || undefined,
    });

    setProfile(updated);
    setIsEditing(false);
    notify(
      lang === "fa" ? "اطلاعات حساب کاربری با موفقیت به‌روزرسانی شد" : "Profile updated successfully",
      "mint",
    );
  };

  const handleCustomAvatarPick = () => {
    if (profile.points < POINTS_FOR_CUSTOM_AVATAR) {
      notify(
        lang === "fa"
          ? `برای آپلود عکس دلخواه از گالری، حداقل به ${POINTS_FOR_CUSTOM_AVATAR} امتیاز هواداری نیاز دارید (امتیاز شما: ${profile.points.toLocaleString()})`
          : `Custom avatar unlocks at ${POINTS_FOR_CUSTOM_AVATAR} points`,
        "primary",
      );
      return;
    }

    pickCompressedImage(
      (compressedDataUrl) => {
        setEditAvatar(compressedDataUrl);
        notify(
          lang === "fa"
            ? "تصویر با موفقیت فشرده و برای بارگذاری آماده شد"
            : "Image optimized successfully",
          "mint",
        );
      },
      256,
      256,
      () => {
        notify(
          lang === "fa" ? "خطا در پردازش تصویر گالری" : "Failed to process image",
          "primary",
        );
      },
    );
  };

  const handleCustomBannerPick = () => {
    if (profile.points < POINTS_FOR_CUSTOM_BANNER) {
      notify(
        lang === "fa"
          ? `برای آپلود بنر دلخواه از گالری، حداقل به ${POINTS_FOR_CUSTOM_BANNER} امتیاز هواداری نیاز دارید (امتیاز شما: ${profile.points.toLocaleString()})`
          : `Custom banner unlocks at ${POINTS_FOR_CUSTOM_BANNER} points`,
        "primary",
      );
      return;
    }

    pickCompressedImage(
      (compressedDataUrl) => {
        setEditBanner(compressedDataUrl);
        notify(
          lang === "fa"
            ? "بنر با کیفیت بهینه فشرده شد"
            : "Banner optimized successfully",
          "mint",
        );
      },
      960,
      320,
      () => {
        notify(
          lang === "fa" ? "خطا در پردازش بنر گالری" : "Failed to process banner",
          "primary",
        );
      },
    );
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    socialApi.reportUser({
      targetUsername: profile.username,
      reason: reportReason,
      details: reportDetails.trim(),
    });
    setReportModalOpen(false);
    setReportDetails("");
    notify(
      lang === "fa"
        ? `گزارش تخلف کاربر @${profile.username} با موفقیت برای تیم نظارت فیمس ارسال شد.`
        : `Report against @${profile.username} submitted.`,
      "mint",
    );
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
        const query = badgeSearch.toLowerCase().trim();
        const matchTitleFa = b.titleFa.toLowerCase().includes(query);
        const matchTitleEn = b.titleEn.toLowerCase().includes(query);
        const matchDescFa = b.descriptionFa.toLowerCase().includes(query);
        const matchRarity = b.rarity.toLowerCase().includes(query);
        if (!matchTitleFa && !matchTitleEn && !matchDescFa && !matchRarity) return false;
      }
      return true;
    });
  }, [all100Badges, badgeCategory, badgeStatusFilter, badgeSearch]);

  const unlockedCount = unlockedBadges.length;

  return (
    <div dir={dir} className="flex w-full flex-col gap-4 p-3 sm:p-5 lg:p-6 pb-12">
      {/* =========================================================================
       *  PROFESSIONAL SOCIAL PROFILE SPECIFICATIONS CARD (کارت مشخصات کامل کاربر)
       *  Equipped with shrink-0 to prevent collapsing in any tab!
       * ========================================================================= */}
      <section className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-xs transition-shadow duration-300">
        {/* Generous Banner: Custom compressed image or rich atmospheric gradient */}
        <div className="relative h-40 min-h-[160px] w-full shrink-0 overflow-hidden bg-gradient-to-r from-primary-deep via-primary to-indigo-600 sm:h-48 sm:min-h-[192px] md:h-52 md:min-h-[208px]">
          {profile.banner ? (
            <Photo src={profile.banner} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <>
              {/* Subtle Ambient Glowing Spheres */}
              <div className="pointer-events-none absolute -end-6 -top-6 size-44 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute start-12 -bottom-10 size-48 rounded-full bg-black/20 blur-2xl" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* Soundwave Decorative Micro-Bars */}
              <div className="pointer-events-none absolute bottom-3 end-4 flex items-end gap-1 opacity-25">
                <span className="h-3 w-1 rounded-full bg-white animate-pulse" />
                <span className="h-6 w-1 rounded-full bg-white" />
                <span className="h-4 w-1 rounded-full bg-white animate-pulse" />
                <span className="h-8 w-1 rounded-full bg-white" />
                <span className="h-5 w-1 rounded-full bg-white" />
              </div>
            </>
          )}

          {/* Banner Top Action Bar */}
          <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between sm:inset-x-5 sm:top-4">
            {!isSelf ? (
              <button
                type="button"
                onClick={() => openProfile()}
                className="flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-[12px] font-bold text-ink backdrop-blur-md shadow-2xs transition hover:bg-surface hover:shadow-xs"
              >
                <Icon name={backIcon(dir)} size={13} />
                <span>{lang === "fa" ? "پروفایل من" : "My Profile"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-md">
                <Icon name="verified" size={13} className="text-white" />
                <span>{lang === "fa" ? "حساب کاربری شما" : "Your Account"}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  title={lang === "fa" ? "گزارش کاربر" : "Report user"}
                  className="flex size-8 items-center justify-center rounded-full bg-rose-500/90 text-white backdrop-blur-md shadow-2xs transition hover:bg-rose-600"
                >
                  <Icon name="message" size={13} strokeWidth={2.2} />
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyHandle}
                title={lang === "fa" ? "کپی نام کاربری" : "Copy handle"}
                className="flex size-8 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur-md shadow-2xs transition hover:bg-surface"
              >
                <Icon name="copy" size={13} />
              </button>
              <button
                type="button"
                onClick={handleShareProfile}
                title={lang === "fa" ? "اشتراک‌گذاری پروفایل" : "Share profile"}
                className="flex size-8 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur-md shadow-2xs transition hover:bg-surface"
              >
                <Icon name="share" size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Specifications Body Container */}
        <div className="relative flex flex-col shrink-0 px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
          {/* Top Row: Floating Avatar + Actions Alignment */}
          <div className="flex items-end justify-between">
            {/* Avatar on the Seam with High-Z Ring and Level Crown */}
            <div className="relative -mt-14 shrink-0 sm:-mt-16 md:-mt-20">
              <div className="size-24 overflow-hidden rounded-full ring-4 ring-surface bg-surface shadow-xl sm:size-28 md:size-32">
                <Photo src={profile.avatar} alt={profile.name} />
              </div>
              {/* Level Crown Tag */}
              <span
                title={`${lang === "fa" ? "سطح کاربری:" : "Level"} ${tierProgress.currentTier.level}`}
                className="absolute -bottom-1 -end-1 flex items-center gap-0.5 rounded-full bg-primary-deep px-2 py-0.5 text-[12px] font-black text-white shadow-md ring-2 ring-surface"
              >
                <Icon name="crown" size={12} strokeWidth={2.4} />
                <span>{tierProgress.currentTier.level}</span>
              </span>
              {/* Active Dot */}
              <span
                title={lang === "fa" ? "کاربر آنلاین در سامانه" : "Online"}
                className="absolute top-1 start-1 size-3.5 rounded-full bg-mint ring-2 ring-surface shadow-xs"
              />
            </div>

            {/* Action Buttons: Adapt gracefully across mobile & desktop */}
            <div className="flex items-center gap-2 pb-1">
              {isSelf ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(profile.name);
                      setEditHandle(profile.handle);
                      setEditBio(profile.bio);
                      setEditGenre(profile.favoriteGenre);
                      setEditAvatar(profile.avatar);
                      setEditBanner(profile.banner || "");
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[12.5px] font-bold text-ink shadow-2xs transition hover:border-primary/40 hover:bg-subtle"
                  >
                    <Icon name="edit" size={13.5} strokeWidth={2} />
                    <span>{lang === "fa" ? "ویرایش مشخصات" : "Edit Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
                  >
                    <Icon name="plus" size={13.5} strokeWidth={2.4} />
                    <span>{lang === "fa" ? "درخواست آهنگ" : "Request Track"}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12.5px] font-bold transition shadow-xs",
                      isFollowing
                        ? "border border-line bg-surface text-ink hover:border-rose-400 hover:text-rose-500"
                        : "bg-primary text-white hover:bg-primary-deep shadow-primary",
                    )}
                  >
                    <Icon name={isFollowing ? "check" : "plus"} size={13.5} strokeWidth={2.4} />
                    <span>
                      {isFollowing
                        ? lang === "fa" ? "دنبال می‌کنید" : "Following"
                        : lang === "fa" ? "دنبال کردن" : "Follow"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-500/20"
                  >
                    <Icon name="message" size={13} strokeWidth={2.2} />
                    <span>{lang === "fa" ? "گزارش تخلف" : "Report"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Name, Handle, Tier and Role Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-black tracking-tight text-ink sm:text-[24px]">
              {profile.name}
            </h1>

            {/* Tier Pill */}
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
              <Icon name="sparkle" size={12} className="text-primary-deep" />
              <span>{dataLabel(tierProgress.currentTier.nameFa)}</span>
            </span>

            {/* Role Tag if present */}
            {profile.role && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[12px] font-extrabold text-amber-600 dark:text-amber-400">
                <Icon name="star" size={12} className="text-amber-500" />
                <span>{profile.role}</span>
              </span>
            )}
          </div>

          {/* Handle & Quick Copy */}
          <button
            type="button"
            onClick={handleCopyHandle}
            className="group mt-0.5 flex items-center gap-1 text-[12.5px] font-semibold text-ink-muted transition hover:text-primary"
          >
            <span>{profile.handle}</span>
            <Icon name="copy" size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          {/* Full Bio — clearly visible without aggressive clipping */}
          <p className="mt-3 text-[13px] leading-relaxed text-ink-body">
            {profile.bio || (lang === "fa" ? "همراه وفادار استودیو موسیقی فیمس و علاقه‌مند به دنیای کی‌پاپ." : "K-Pop music enthusiast on FAIMESS.")}
          </p>

          {/* Comprehensive Metadata Specifications Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="flex items-center gap-1.5 rounded-xl border border-line/70 bg-subtle/60 px-2.5 py-1 font-semibold text-ink-muted">
              <Icon name="music" size={12} className="text-primary" />
              <span className="font-bold text-ink">{lang === "fa" ? "سبک محبوب:" : "Favorite:"}</span>
              <span>{profile.favoriteGenre}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl border border-line/70 bg-subtle/60 px-2.5 py-1 font-semibold text-ink-muted">
              <Icon name="calendar" size={12} className="text-primary" />
              <span className="font-bold text-ink">{lang === "fa" ? "تاریخ عضویت:" : "Joined:"}</span>
              <span>{profile.joinedAt}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl border border-line/70 bg-subtle/60 px-2.5 py-1 font-semibold text-ink-muted">
              <Icon name="bolt" size={12} className="text-amber-500" />
              <span className="font-bold text-ink">{lang === "fa" ? "شناسه:" : "ID:"}</span>
              <span className="font-mono">{profile.username}#8420</span>
            </span>
          </div>

          {/* Integrated Tier Progress (XP Bar) — Always visible on specifications card */}
          <div className="mt-4 rounded-2xl border border-line/80 bg-subtle/40 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                <Icon name="crown" size={13} className="text-primary-deep" strokeWidth={2.4} />
                <span className="font-bold text-ink">
                  {tierProgress.nextTier
                    ? lang === "fa"
                      ? `${tierProgress.pointsToNext.toLocaleString()} امتیاز تا سطح بعدی («${tierProgress.nextTier.nameFa}»)`
                      : `${tierProgress.pointsToNext.toLocaleString()} pts needed to reach ${tierProgress.nextTier.nameEn}`
                    : lang === "fa" ? "بالاترین سطح هواداری استودیو فیمس" : "Maximum Fan Rank Achieved"}
                </span>
              </div>
              <span className="font-black text-primary-deep tabular-nums">
                {tierProgress.progressPercent}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
                style={{ width: `${tierProgress.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Social Stats Strip (Instagram/Spotify Style) */}
          <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-line/80 bg-subtle/50 p-2.5 text-center">
            {/* 1. Fan Points */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-[15px] font-black text-ink tabular-nums sm:text-[17px]">
                {profile.points.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "امتیاز هواداری" : "Points"}
              </span>
            </div>

            {/* 2. Followers (Interactive) */}
            <button
              type="button"
              onClick={() => {
                setFollowModalTab("followers");
                setFollowModalOpen(true);
              }}
              className="flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-surface/80"
            >
              <span className="text-[15px] font-black text-ink tabular-nums sm:text-[17px]">
                {followStats.followersCount}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "دنبال‌کننده" : "Followers"}
              </span>
            </button>

            {/* 3. Following (Interactive) */}
            <button
              type="button"
              onClick={() => {
                setFollowModalTab("following");
                setFollowModalOpen(true);
              }}
              className="flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-surface/80"
            >
              <span className="text-[15px] font-black text-ink tabular-nums sm:text-[17px]">
                {followStats.followingCount}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "دنبال‌شده" : "Following"}
              </span>
            </button>

            {/* 4. Badges (Interactive — Jump to Badges Tab) */}
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className="flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-surface/80"
            >
              <span className="text-[15px] font-black text-primary-deep tabular-nums sm:text-[17px]">
                {unlockedCount} / 100
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "نشان‌های افتخار" : "Badges"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
       *  COMPACT SEGMENTED NAVIGATION TABS (کنترل تب‌های مدرن)
       *  Equipped with shrink-0 so it never gets squeezed!
       * ========================================================================= */}
      <div className="flex w-full shrink-0 items-center gap-1 rounded-2xl bg-surface border border-line p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-extrabold transition",
            activeTab === "overview"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="compass" size={14} />
          <span>{lang === "fa" ? "نمای کلی" : "Overview"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("playlists")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-extrabold transition",
            activeTab === "playlists"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="disc" size={14} />
          <span>{lang === "fa" ? `پلی‌لیست‌ها (${displayPlaylists.length})` : `Playlists (${displayPlaylists.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-extrabold transition",
            activeTab === "badges"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="medal" size={14} />
          <span>{lang === "fa" ? `۱۰۰ نشان (${unlockedCount})` : `100 Badges (${unlockedCount})`}</span>
        </button>

        {isSelf && (
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-extrabold transition",
              activeTab === "requests"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-subtle",
            )}
          >
            <Icon name="plus" size={14} />
            <span>{lang === "fa" ? "درخواست‌ها" : "Requests"}</span>
          </button>
        )}
      </div>

      {/* =========================================================================
       *  TAB 0: OVERVIEW (نمای کلی و ویترین مینیمال نشان‌ها)
       * ========================================================================= */}
      {activeTab === "overview" && (
        <div className="flex w-full shrink-0 flex-col gap-4">
          {/* Minimal 3D Badges Shelf: Shows ONLY the unlocked badge logos in a clean, minimal row */}
          <div className="rounded-[22px] border border-line bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Icon name="sparkle" size={16} className="text-amber-500" />
                <h2 className="font-extrabold text-[14px] text-ink">
                  {lang === "fa" ? "نشان‌های افتخار دریافت‌شده" : "Unlocked Honors Badges"}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-extrabold text-primary-deep">
                  {unlockedBadges.length} / 100
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("badges")}
                className="text-[12.5px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "مشاهده تالار ۱۰۰ نشان ←" : "View all 100 badges →"}
              </button>
            </div>

            {unlockedBadges.length === 0 ? (
              <div className="py-6 text-center text-ink-muted">
                <p className="text-[12.5px] font-bold">
                  {lang === "fa"
                    ? "هنوز نشانی باز نشده است. با گوش دادن به موسیقی اولین نشان خود را کسب کنید!"
                    : "No badges unlocked yet. Start listening to earn your first badge!"}
                </p>
              </div>
            ) : (
              /* Minimal Logo Rail: ONLY the earned 3D clay logos on glowing collector pedestals */
              <div className="mt-3 flex items-center gap-3 overflow-x-auto scroll-rail py-2">
                {unlockedBadges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    title={`${dataLabel(badge.titleFa)} (#${badge.number})`}
                    className="group relative flex flex-col items-center gap-1.5 shrink-0 transition-transform hover:-translate-y-1"
                  >
                    <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white/95 to-white/40 dark:from-white/10 dark:to-white/5 shadow-xs ring-1 ring-black/[0.06] dark:ring-white/[0.08] transition group-hover:ring-primary/40 group-hover:shadow-sm sm:size-16">
                      <ClayBadgeIcon
                        glyph={badge.clayGlyph}
                        tone={badge.clayTone}
                        size="md"
                        locked={false}
                      />
                      <span className="absolute -bottom-1 -end-1 rounded-full bg-primary px-1.5 py-[0.5px] text-[12px] font-black text-white shadow-2xs">
                        #{badge.number}
                      </span>
                    </div>
                    <span className="max-w-[70px] truncate text-center text-[12px] font-bold text-ink-muted group-hover:text-primary-deep">
                      {dataLabel(badge.titleFa)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Playlists Shelf */}
          <div className="rounded-[22px] border border-line bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Icon name="disc" size={16} className="text-primary" />
                <h2 className="font-extrabold text-[14px] text-ink">
                  {isSelf
                    ? lang === "fa" ? "پلی‌لیست‌های اختصاصی من" : "My Created Playlists"
                    : lang === "fa" ? `پلی‌لیست‌های ${profile.name}` : `${profile.name}’s Playlists`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("playlists")}
                className="text-[12.5px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "مشاهده همه ←" : "View all →"}
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {displayPlaylists.slice(0, 3).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-2.5 transition hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle">
                    <Photo src={pl.cover} alt={pl.name} />
                  </div>
                  <h3 className="mt-2 truncate font-bold text-[13px] text-ink group-hover:text-primary-deep">
                    {pl.name}
                  </h3>
                  <p className="text-[12px] text-ink-muted">
                    {pl.trackIds.length} {lang === "fa" ? "قطعه موسیقی" : "tracks"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fan Community Guide */}
          <div className="rounded-[22px] border border-line/80 bg-gradient-to-r from-primary-faint/60 via-surface to-surface p-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-2xs">
                <Icon name="bolt" size={16} strokeWidth={2.4} />
              </span>
              <div>
                <h3 className="font-extrabold text-[13.5px] text-ink">
                  {lang === "fa" ? "راهنمای ارتقای سطح و دریافت نشان‌ها" : "Level & Badge Guide"}
                </h3>
                <p className="text-[12px] leading-relaxed text-ink-muted">
                  {lang === "fa"
                    ? "با گوش دادن به موزیک‌ها، ثبت نظرات، مشارکت در ترجمه لیریک و دنبال کردن آرتیست‌ها امتیاز کسب کنید و ۱۰۰ نشان ۳بعدی را باز نمایید."
                    : "Earn points by streaming, commenting, contributing lyrics and unlocking all 100 collector 3D clay badges."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       *  TAB 1: 100 3D CLAYMORPHIC BADGES (۱۰۰ نشان افتخار ۳بعدی)
       * ========================================================================= */}
      {activeTab === "badges" && (
        <div className="flex w-full shrink-0 flex-col gap-3.5">
          {/* Filter Bar: Category Scroll Rail + Status & Search */}
          <div className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-surface p-3 shadow-2xs">
            {/* Category horizontal scroll rail */}
            <div className="scroll-rail flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setBadgeCategory("all")}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-bold transition",
                  badgeCategory === "all"
                    ? "bg-ink text-surface shadow-xs"
                    : "bg-subtle text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "همه دسته‌ها (۱۰۰)" : "All Categories (100)"}
              </button>
              {BADGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBadgeCategory(cat.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold transition",
                    badgeCategory === cat.id
                      ? "bg-primary text-white shadow-xs"
                      : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon name={cat.icon} size={12.5} />
                  <span>{dataLabel(cat.labelFa)}</span>
                </button>
              ))}
            </div>

            {/* Sub-Filters: Status & Search Box */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line/60 pt-2.5">
              <div className="flex items-center gap-1">
                {(["all", "unlocked", "locked"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setBadgeStatusFilter(st)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[12px] font-bold transition",
                      badgeStatusFilter === st
                        ? "bg-primary-soft text-primary-deep font-black"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {st === "all"
                      ? lang === "fa" ? "همه" : "All"
                      : st === "unlocked"
                        ? lang === "fa" ? "دریافت‌شده" : "Unlocked"
                        : lang === "fa" ? "قفل" : "Locked"}
                  </button>
                ))}
              </div>

              {/* Compact Search Input */}
              <div className="relative w-full sm:w-[200px]">
                <Icon
                  name="search"
                  size={13}
                  className="pointer-events-none absolute start-2.5 top-2.5 text-ink-faint"
                />
                <input
                  type="text"
                  value={badgeSearch}
                  onChange={(e) => setBadgeSearch(e.target.value)}
                  placeholder={lang === "fa" ? "جستجوی نشان افتخار..." : "Search badges..."}
                  className="w-full rounded-xl border border-line bg-subtle/50 py-1.5 pe-2.5 ps-7 text-[12px] text-ink outline-none focus:border-primary focus:bg-surface"
                />
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filteredBadges.map((badge) => (
              <CompactClayBadgeCard
                key={badge.id}
                badge={badge}
                lang={lang}
                dataLabel={dataLabel}
                onSelect={setSelectedBadge}
              />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="rounded-[22px] border border-line bg-surface py-12 text-center text-ink-muted">
              <Icon name="search" size={24} className="mx-auto text-ink-faint" />
              <p className="mt-2 text-[13px] font-bold">
                {lang === "fa" ? "هیچ نشانی با این فیلتر یا نام یافت نشد." : "No badges match your criteria."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       *  TAB 2: PUBLIC USER PLAYLISTS (پلی‌لیست‌ها)
       * ========================================================================= */}
      {activeTab === "playlists" && (
        <div className="rounded-[22px] border border-line bg-surface p-4 shadow-xs space-y-4 w-full shrink-0">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="font-extrabold text-[14px] text-ink">
                {isSelf
                  ? lang === "fa" ? "پلی‌لیست‌های اختصاصی من" : "My Playlists"
                  : lang === "fa" ? `پلی‌لیست‌های عمومی ${profile.name}` : `${profile.name}’s Playlists`}
              </h2>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پلی‌لیست‌های ساخته‌شده با کاورهای رسمی استودیو فیمس."
                  : "Curated playlists strictly with studio bundled artwork"}
              </p>
            </div>

            {isSelf && (
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{lang === "fa" ? "ساخت پلی‌لیست" : "New Playlist"}</span>
              </button>
            )}
          </div>

          {displayPlaylists.length === 0 ? (
            <div className="py-12 text-center text-ink-muted">
              <Icon name="disc" size={32} className="mx-auto text-ink-faint" />
              <p className="mt-2 font-bold text-[13px]">
                {lang === "fa" ? "هنوز هیچ پلی‌لیستی ایجاد نشده است." : "No playlists yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {displayPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openDetail({ kind: "playlist", id: pl.id })}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line/70 bg-surface p-2.5 transition hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-subtle">
                    <Photo src={pl.cover} alt={pl.name} />
                  </div>
                  <h3 className="mt-2 truncate font-bold text-[13px] text-ink group-hover:text-primary-deep">
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

      {/* =========================================================================
       *  TAB 3: CONTENT REQUESTS (درخواست‌های اختصاصی)
       * ========================================================================= */}
      {activeTab === "requests" && isSelf && (
        <div className="rounded-[22px] border border-line bg-surface p-4 shadow-xs space-y-3.5 w-full shrink-0">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="font-extrabold text-[14px] text-ink">
                {lang === "fa" ? "درخواست‌های افزودن موزیک و آلبوم" : "Track Requests"}
              </h2>
              <p className="text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "وضعیت بررسی قطعات ارسالی توسط ادمین‌های استودیو فیمس."
                  : "Track submission status"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-primary-deep"
            >
              <Icon name="plus" size={13} strokeWidth={2.4} />
              <span>{lang === "fa" ? "درخواست جدید" : "New Request"}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {socialApi.getUserRequests().map((req) => (
              <div
                key={req.id}
                className="flex flex-col gap-2 rounded-2xl border border-line/70 bg-subtle/40 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[13px] text-ink">
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
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[12px] font-bold text-amber-600 ring-1 ring-amber-500/30">
                      {lang === "fa" ? "در انتظار بررسی" : "Pending"}
                    </span>
                  )}
                  {req.status === "fulfilled" && (
                    <span className="rounded-full bg-mint-soft px-2.5 py-0.5 text-[12px] font-extrabold text-mint-deep ring-1 ring-mint-deep/30">
                      ✓ {lang === "fa" ? "تایید شد (+۲۵ امتیاز)" : "Fulfilled"}
                    </span>
                  )}
                  {req.status === "rejected" && (
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[12px] font-bold text-rose-500 ring-1 ring-rose-500/30">
                      {lang === "fa" ? "رد شد" : "Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
       *  3D CLAY BADGE DETAIL MODAL (دیالوگ بازرسی نشان ۳بعدی)
       * ========================================================================= */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
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

            <div className="flex flex-col items-center py-4 text-center">
              {/* 3D Clay Badge Icon on Collector Podium */}
              <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-b from-white/95 to-white/50 dark:from-white/10 dark:to-white/5 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
                <ClayBadgeIcon
                  glyph={selectedBadge.clayGlyph}
                  tone={selectedBadge.clayTone}
                  size="lg"
                  locked={!selectedBadge.unlocked}
                />
              </div>

              <h3 className="mt-3 font-black text-[17px] text-ink">
                {dataLabel(selectedBadge.titleFa)}
              </h3>
              <p className="text-[12px] font-bold text-ink-muted">
                {selectedBadge.titleEn}
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[12px] font-black",
                    selectedBadge.rarity === "common" && "bg-subtle text-ink-muted",
                    selectedBadge.rarity === "rare" && "bg-sky-500/10 text-sky-600",
                    selectedBadge.rarity === "epic" && "bg-purple-500/10 text-purple-600",
                    selectedBadge.rarity === "legendary" && "bg-amber-500/10 text-amber-600",
                    selectedBadge.rarity === "mythic" && "bg-rose-500/10 text-rose-600",
                  )}
                >
                  {selectedBadge.rarity === "common"
                    ? lang === "fa" ? "درجه: عادی" : "Common"
                    : selectedBadge.rarity === "rare"
                      ? lang === "fa" ? "درجه: کمیاب" : "Rare"
                      : selectedBadge.rarity === "epic"
                        ? lang === "fa" ? "درجه: حماسی" : "Epic"
                        : selectedBadge.rarity === "legendary"
                          ? lang === "fa" ? "درجه: افسانه‌ای" : "Legendary"
                          : lang === "fa" ? "درجه: اسطوره‌ای" : "Mythic"}
                </span>

                <span className="rounded-full border border-line bg-subtle px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
                  {selectedBadge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : "pts"}
                </span>
              </div>

              <p className="mt-2.5 max-w-[320px] text-[12.5px] leading-relaxed text-ink-body">
                {selectedBadge.descriptionFa}
              </p>

              <div className="mt-4 w-full rounded-2xl border border-line/70 bg-subtle/50 p-3">
                {selectedBadge.unlocked ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-white font-extrabold text-[12px] shadow-xs">
                    <Icon name="check" size={14} className="text-white" strokeWidth={2.6} />
                    <span className="text-white">{lang === "fa" ? "شما این نشان ۳بعدی را دریافت کرده‌اید!" : "Badge Unlocked!"}</span>
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
          </div>
        </div>
      )}

      {/* =========================================================================
       *  REPORT USER MODAL (گزارش تخلف کاربر)
       * ========================================================================= */}
      {reportModalOpen && !isSelf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                  <Icon name="message" size={14} strokeWidth={2.4} />
                </span>
                <h3 className="font-extrabold text-[14.5px] text-ink">
                  {lang === "fa" ? `گزارش تخلف @${profile.username}` : `Report @${profile.username}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-3 space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "دلیل گزارش" : "Reason"}
                </label>
                <div className="space-y-1.5">
                  {[
                    "محتوای نامناسب یا توهین‌آمیز",
                    "ارسال هرزنامه یا تبلیغات اسپم",
                    "بیوگرافی یا هویت جعلی",
                    "نقض حق کپی‌رایت یا لیریک جعلی",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-[12px] font-bold transition",
                        reportReason === reason
                          ? "border-primary bg-primary/10 text-primary-deep"
                          : "border-line bg-surface text-ink hover:bg-subtle",
                      )}
                    >
                      <span>{reason}</span>
                      <input
                        type="radio"
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        className="accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "توضیحات تکمیلی (اختیاری)" : "Additional Details"}
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder={lang === "fa" ? "توضیح مختصری در رابطه با گزارش خود بنویسید..." : "Explain details..."}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-xl px-3.5 py-1.5 text-[12px] font-bold text-ink-muted hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  {lang === "fa" ? "ارسال گزارش" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       *  EDIT PROFILE MODAL (دیالوگ ویرایش مشخصات با آپلود عکس و بنر فشرده)
       * ========================================================================= */}
      {isEditing && isSelf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-extrabold text-[15px] text-ink">
                {lang === "fa" ? "ویرایش مشخصات کاربری" : "Edit Profile"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full p-1.5 text-ink-faint hover:bg-subtle hover:text-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-3 space-y-3.5 overflow-y-auto pe-1">
              {/* Avatar Selector: Default dolls for everyone, gallery upload unlocked with points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "آواتارهای عروسکی پیش‌فرض" : "Default Doll Avatars"}
                  </label>
                  <span className="text-[12px] text-ink-faint">
                    {AVAILABLE_AVATARS.length} {lang === "fa" ? "آواتار" : "avatars"}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1">
                  {AVAILABLE_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={cn(
                        "size-12 shrink-0 overflow-hidden rounded-full ring-2 transition",
                        editAvatar === av ? "ring-primary ring-offset-2 scale-105 shadow-md" : "ring-line opacity-75 hover:opacity-100",
                      )}
                    >
                      <Photo src={av} alt="Avatar" />
                    </button>
                  ))}
                </div>

                {/* Custom Avatar Upload Button (Unlocked at 500 points) */}
                <div className="mt-2">
                  {profile.points >= POINTS_FOR_CUSTOM_AVATAR ? (
                    <button
                      type="button"
                      onClick={handleCustomAvatarPick}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-[12px] font-extrabold text-primary-deep transition hover:bg-primary/20"
                    >
                      <Icon name="folderPlus" size={14} />
                      <span>{lang === "fa" ? "📁 انتخاب تصویر پروفایل از گالری (فشرده‌سازی خودکار)" : "Select Custom Avatar"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/70 px-3 py-2 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Icon name="lock" size={13} className="text-amber-500" />
                        <span>{lang === "fa" ? "آپلود عکس از گالری" : "Custom Avatar Upload"}</span>
                      </span>
                      <span className="font-extrabold text-amber-600">
                        {lang === "fa" ? `قفل (نیاز به ${POINTS_FOR_CUSTOM_AVATAR} امتیاز)` : `Locked (${POINTS_FOR_CUSTOM_AVATAR} pts)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Banner Selector: Default System Banners + Custom Upload (Unlocked at 500 points) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "بنرهای پیش‌فرض سیستم" : "Default System Banners"}
                  </label>
                  <span className="text-[12px] text-ink-faint">
                    {DEFAULT_SYSTEM_BANNERS.length} {lang === "fa" ? "طرح" : "themes"}
                  </span>
                </div>

                {/* Default System Banners Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1">
                  {DEFAULT_SYSTEM_BANNERS.map((bannerItem) => (
                    <button
                      key={bannerItem.id}
                      type="button"
                      onClick={() => setEditBanner(bannerItem.url)}
                      title={lang === "fa" ? bannerItem.titleFa : bannerItem.titleEn}
                      className={cn(
                        "group relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border transition",
                        (editBanner === bannerItem.url || (!editBanner && !bannerItem.url))
                          ? "border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md"
                          : "border-line opacity-75 hover:opacity-100",
                      )}
                    >
                      {bannerItem.url ? (
                        <Photo src={bannerItem.url} alt={bannerItem.titleEn} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-r from-primary-deep via-primary to-indigo-600 flex items-center justify-center">
                          <Icon name="sparkle" size={14} className="text-white" />
                        </div>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[12px] font-bold text-white text-center truncate px-1 backdrop-blur-2xs">
                        {lang === "fa" ? bannerItem.titleFa : bannerItem.titleEn}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Banner Upload from Gallery (Unlocked at 500 points) */}
                <div className="mt-2">
                  {profile.points >= POINTS_FOR_CUSTOM_BANNER ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCustomBannerPick}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-[12px] font-extrabold text-primary-deep transition hover:bg-primary/20"
                      >
                        <Icon name="folderPlus" size={14} />
                        <span>{lang === "fa" ? "🖼️ انتخاب بنر دلخواه از گالری (فشرده‌سازی خودکار)" : "Select Custom Banner"}</span>
                      </button>
                      {editBanner && (
                        <button
                          type="button"
                          onClick={() => setEditBanner("")}
                          className="rounded-xl border border-line bg-surface px-2.5 py-2 text-[12px] font-bold text-ink-muted hover:text-rose-500"
                        >
                          {lang === "fa" ? "حذف" : "Reset"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/70 px-3 py-2 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Icon name="lock" size={13} className="text-amber-500" />
                        <span>{lang === "fa" ? "آپلود بنر دلخواه از گالری" : "Custom Banner Upload"}</span>
                      </span>
                      <span className="font-extrabold text-amber-600">
                        {lang === "fa" ? `قفل (نیاز به ${POINTS_FOR_CUSTOM_BANNER.toLocaleString()} امتیاز)` : `Locked (${POINTS_FOR_CUSTOM_BANNER} pts)`}
                      </span>
                    </div>
                  )}
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
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
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
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep font-mono"
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
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep"
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
                  rows={2}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary-deep resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-3.5 py-1.5 text-[12px] font-bold text-ink-muted hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-1.5 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {lang === "fa" ? "ذخیره تغییرات" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Dialog */}
      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
      />

      {/* Followers / Following List Modal */}
      <FollowListModal
        open={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        initialTab={followModalTab}
      />

      {/* Track Request Modal */}
      <ContentRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </div>
  );
}
