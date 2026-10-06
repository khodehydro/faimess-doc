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
  getBadgeTitle,
  getBadgeDesc,
} from "../data/allBadges";
import { coverPhoto } from "../data/playlists";
import { trackById } from "../data/player";
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
  { id: "gradient", titleFa: "طیف بنفش", titleEn: "Violet Gradient", titleKo: "바이올렛", url: "" },
  { id: "midnight-seoul", titleFa: "شب‌های سئول", titleEn: "Midnight Seoul", titleKo: "미드나잇 서울", url: midnightSeoulBanner },
  { id: "tour-afterglow", titleFa: "استیج و تور", titleEn: "Tour Stage", titleKo: "투어 스테이지", url: tourAfterglowBanner },
  { id: "asia-leg", titleFa: "کنسرت آسیا", titleEn: "Asia Arena", titleKo: "아시아 아레나", url: asiaTourBanner },
  { id: "neon-bloom", titleFa: "نئون بلوم", titleEn: "Neon Bloom", titleKo: "네온 블룸", url: neonBloomBanner },
  { id: "blue-hour", titleFa: "افق گرگ و میش", titleEn: "Blue Hour", titleKo: "블루 아워", url: blueHourBanner },
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
  onSelect,
}: {
  badge: BadgeStatusItem;
  lang: string;
  onSelect: (b: BadgeStatusItem) => void;
}) {
  const rarityConfig = {
    common: {
      labelFa: "عادی",
      labelEn: "Common",
      labelKo: "일반",
      pill: "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400/25",
      border: "border-line/70 hover:border-line",
    },
    rare: {
      labelFa: "کمیاب",
      labelEn: "Rare",
      labelKo: "희귀",
      pill: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30",
      border: "border-sky-300/40 dark:border-sky-500/20 hover:border-sky-400",
    },
    epic: {
      labelFa: "حماسی",
      labelEn: "Epic",
      labelKo: "에픽",
      pill: "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30",
      border: "border-purple-300/40 dark:border-purple-500/20 hover:border-purple-400",
    },
    legendary: {
      labelFa: "افسانه‌ای",
      labelEn: "Legendary",
      labelKo: "전설",
      pill: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30 shadow-xs",
      border: "border-amber-300/50 dark:border-amber-500/30 hover:border-amber-400",
    },
    mythic: {
      labelFa: "اسطوره‌ای",
      labelEn: "Mythic",
      labelKo: "신화",
      pill: "bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30 shadow-xs",
      border: "border-rose-300/50 dark:border-rose-500/30 hover:border-rose-400",
    },
  }[badge.rarity];

  const title = getBadgeTitle(badge, lang);
  const rarityLabel =
    lang === "fa" ? rarityConfig.labelFa : lang === "ko" ? rarityConfig.labelKo : rarityConfig.labelEn;

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
          {rarityLabel}
        </span>
      </div>

      {/* Central 3D Icon on Compact Pedestal */}
      <div className="my-2 flex flex-col items-center">
        <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-white/95 to-white/40 dark:from-white/10 dark:to-white/5 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
          <ClayBadgeIcon
            glyph={badge.clayGlyph}
            tone={badge.clayTone}
            size="md"
            locked={!badge.unlocked}
          />
        </div>

        <h3 className="mt-2 truncate text-center text-[12.5px] font-black text-ink group-hover:text-primary-deep transition">
          {title}
        </h3>
        {lang !== "en" && (
          <p className="truncate text-center text-[12px] text-ink-faint">
            {badge.titleEn}
          </p>
        )}
      </div>

      {/* Bottom Status */}
      <div className="mt-1 border-t border-line/60 pt-2">
        {badge.unlocked ? (
          <div className="flex items-center justify-between rounded-lg bg-primary px-2 py-1 text-[12px] text-white shadow-2xs">
            <span className="flex items-center gap-1 font-black text-white">
              <Icon name="check" size={13} strokeWidth={2.8} className="text-white" />
              <span className="text-white">{lang === "fa" ? "دریافت شد" : lang === "ko" ? "획득" : "Unlocked"}</span>
            </span>
            <span className="font-extrabold text-white">
              +{badge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : lang === "ko" ? "P" : "pts"}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-ink-muted">
                {badge.remainingPoints.toLocaleString()} {lang === "fa" ? "مانده" : lang === "ko" ? "P 남음" : "needed"}
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
  const { lang, dir } = usePreferences();
  const { notify, viewedProfileUsername, openProfile } = useApp();
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
          : lang === "ko"
            ? `@${profile.username}님을 팔로우했습니다`
            : `You followed @${profile.username}`
        : lang === "fa"
          ? `دنبال کردن @${profile.username} لغو شد`
          : lang === "ko"
            ? `@${profile.username}님 언팔로우 완료`
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
          : lang === "ko"
            ? `@${profile.username} 프로필 링크가 복사되었습니다`
            : `Profile link of @${profile.username} copied to clipboard`,
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
      lang === "fa"
        ? "اطلاعات حساب کاربری با موفقیت به‌روزرسانی شد"
        : lang === "ko"
          ? "프로필이 성공적으로 업데이트되었습니다"
          : "Profile updated successfully",
      "mint",
    );
  };

  const handleCustomAvatarPick = () => {
    if (profile.points < POINTS_FOR_CUSTOM_AVATAR) {
      notify(
        lang === "fa"
          ? `برای آپلود عکس دلخواه از گالری، حداقل به ${POINTS_FOR_CUSTOM_AVATAR} امتیاز نیاز دارید`
          : lang === "ko"
            ? `갤러리 아바타 업로드는 ${POINTS_FOR_CUSTOM_AVATAR}P에 해금됩니다`
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
            ? "تصویر با موفقیت فشرده و آماده شد"
            : lang === "ko"
              ? "이미지가 성공적으로 압축되었습니다"
              : "Image compressed successfully",
          "mint",
        );
      },
      256,
      256,
      () => {
        notify(
          lang === "fa"
            ? "خطا در پردازش تصویر گالری"
            : lang === "ko"
              ? "이미지 처리 실패"
              : "Failed to process image",
          "primary",
        );
      },
    );
  };

  const handleCustomBannerPick = () => {
    if (profile.points < POINTS_FOR_CUSTOM_BANNER) {
      notify(
        lang === "fa"
          ? `برای آپلود بنر دلخواه از گالری، حداقل به ${POINTS_FOR_CUSTOM_BANNER} امتیاز نیاز دارید`
          : lang === "ko"
            ? `갤러리 배너 업로드는 ${POINTS_FOR_CUSTOM_BANNER}P에 해금됩니다`
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
            : lang === "ko"
              ? "배너가 성공적으로 압축되었습니다"
              : "Banner compressed successfully",
          "mint",
        );
      },
      960,
      320,
      () => {
        notify(
          lang === "fa"
            ? "خطا در پردازش بنر گالری"
            : lang === "ko"
              ? "배너 처리 실패"
              : "Failed to process banner",
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
        ? `گزارش کاربر @${profile.username} با موفقیت ثبت شد.`
        : lang === "ko"
          ? `@${profile.username} 사용자 신고가 접수되었습니다.`
          : `Report against @${profile.username} submitted.`,
      "mint",
    );
  };

  // Playlists to show — cover is always the first track's album cover
  const displayPlaylists = useMemo(() => {
    if (isSelf) {
      return myPlaylists.map((pl) => {
        const lead = pl.trackIds[0] ? trackById(pl.trackIds[0]) : null;
        return {
          id: pl.id,
          name: pl.name,
          cover: lead?.photo ?? coverPhoto(pl.cover),
          trackIds: pl.trackIds,
        };
      });
    }
    const publicLists = socialApi.getUserPlaylists(profile.username);
    return publicLists.map((pl) => {
      const lead = pl.trackIds[0] ? trackById(pl.trackIds[0]) : null;
      return {
        ...pl,
        cover: lead?.photo ?? pl.cover,
      };
    });
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
        const matchTitleKo = (b.titleKo || "").toLowerCase().includes(query);
        const matchDescFa = b.descriptionFa.toLowerCase().includes(query);
        if (!matchTitleFa && !matchTitleEn && !matchTitleKo && !matchDescFa) return false;
      }
      return true;
    });
  }, [all100Badges, badgeCategory, badgeStatusFilter, badgeSearch]);

  const unlockedCount = unlockedBadges.length;

  const tierName =
    lang === "fa"
      ? tierProgress.currentTier.nameFa
      : lang === "ko"
        ? tierProgress.currentTier.nameKo
        : tierProgress.currentTier.nameEn;

  const roleLabel = profile.role
    ? profile.role.toLowerCase().includes("premium")
      ? lang === "fa" ? "شنونده ویژه" : lang === "ko" ? "프리미엄 리스너" : "Listener · Premium"
      : lang === "fa" ? "شنونده" : lang === "ko" ? "리스너" : "Listener"
    : null;

  return (
    <div dir={dir} className="mx-auto flex w-full max-w-[880px] flex-col gap-4 sm:gap-5 px-3 py-3.5 sm:px-5 sm:py-5 lg:p-6 pb-32 sm:pb-36">
      {/* =========================================================================
       *  PROFILE SPECIFICATIONS CARD (کارت مشخصات کاربر)
       *  Equipped with shrink-0 and explicit minimum height to prevent any collapsing!
       * ========================================================================= */}
      <section className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-xs transition-shadow duration-300">
        {/* Generous Banner: Custom compressed image or rich atmospheric gradient */}
        <div className="relative h-36 min-h-[144px] w-full shrink-0 overflow-hidden bg-gradient-to-r from-primary-deep via-primary to-indigo-600 sm:h-44 sm:min-h-[176px] md:h-48 md:min-h-[192px]">
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
                <span>{lang === "fa" ? "پروفایل من" : lang === "ko" ? "내 프로필" : "My Profile"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-md">
                <Icon name="verified" size={13} className="text-white" />
                <span>{lang === "fa" ? "حساب کاربری شما" : lang === "ko" ? "내 계정" : "Your Account"}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Report button — strictly visible only for other users */}
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  title={lang === "fa" ? "گزارش کاربر" : lang === "ko" ? "사용자 신고" : "Report user"}
                  className="flex size-8 items-center justify-center rounded-full bg-rose-500/90 text-white backdrop-blur-md shadow-2xs transition hover:bg-rose-600"
                >
                  <Icon name="flag" size={13.5} strokeWidth={2.2} />
                </button>
              )}
              <button
                type="button"
                onClick={handleShareProfile}
                title={lang === "fa" ? "اشتراک‌گذاری پروفایل" : lang === "ko" ? "프로필 공유" : "Share profile"}
                className="flex size-8 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur-md shadow-2xs transition hover:bg-surface"
              >
                <Icon name="share" size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Specifications Body Container */}
        <div className="relative flex flex-col shrink-0 px-4 pb-4 pt-1 sm:px-6 sm:pb-6">
          {/* Top Row: Floating Avatar + Actions Alignment */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            {/* Avatar on the Seam with High-Z Ring and Level Crown */}
            <div className="relative -mt-10 shrink-0 sm:-mt-12 md:-mt-14">
              <div className="size-20 overflow-hidden rounded-full ring-4 ring-surface bg-surface shadow-xl sm:size-24 md:size-28">
                <Photo src={profile.avatar} alt={profile.name} />
              </div>
              {/* Level Crown Tag */}
              <span
                title={`${lang === "fa" ? "سطح:" : lang === "ko" ? "레벨:" : "Level:"} ${tierProgress.currentTier.level}`}
                className="absolute -bottom-1 -end-1 flex items-center gap-0.5 rounded-full bg-primary-deep px-2 py-0.5 text-[12px] font-black text-white shadow-md ring-2 ring-surface"
              >
                <Icon name="crown" size={12} strokeWidth={2.4} />
                <span>{tierProgress.currentTier.level}</span>
              </span>
              {/* Active Dot */}
              <span
                title={lang === "fa" ? "آنلاین" : lang === "ko" ? "온라인" : "Online"}
                className="absolute top-1 start-1 size-3.5 rounded-full bg-mint ring-2 ring-surface shadow-xs"
              />
            </div>

            {/* Action Buttons */}
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
                    className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] sm:text-[12.5px] font-bold text-ink shadow-2xs transition hover:border-primary/40 hover:bg-subtle"
                  >
                    <Icon name="edit" size={13} strokeWidth={2} />
                    <span>{lang === "fa" ? "ویرایش" : lang === "ko" ? "편집" : "Edit"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] sm:text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
                  >
                    <Icon name="plus" size={13} strokeWidth={2.4} />
                    <span>{lang === "fa" ? "درخواست آهنگ" : lang === "ko" ? "곡 요청" : "Request Track"}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-bold transition shadow-xs",
                      isFollowing
                        ? "border border-line bg-surface text-ink hover:border-rose-400 hover:text-rose-500"
                        : "bg-primary text-white hover:bg-primary-deep shadow-primary",
                    )}
                  >
                    <Icon name={isFollowing ? "check" : "plus"} size={13} strokeWidth={2.4} />
                    <span>
                      {isFollowing
                        ? lang === "fa" ? "دنبال می‌کنید" : lang === "ko" ? "팔로잉" : "Following"
                        : lang === "fa" ? "دنبال کردن" : lang === "ko" ? "팔로우" : "Follow"}
                    </span>
                  </button>

                  {/* Report button — only for other users */}
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-1.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-500/20"
                  >
                    <Icon name="flag" size={13} strokeWidth={2.2} />
                    <span>{lang === "fa" ? "گزارش" : lang === "ko" ? "신고" : "Report"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Name, Handle, Tier and Role Row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-[19px] font-black tracking-tight text-ink sm:text-[23px]">
              {profile.name}
            </h1>

            {/* Tier Pill */}
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
              <Icon name="sparkle" size={12} className="text-primary-deep" />
              <span>{tierName}</span>
            </span>

            {/* Role Tag if present */}
            {roleLabel && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[12px] font-extrabold text-amber-600 dark:text-amber-400">
                <Icon name="star" size={12} className="text-amber-500" />
                <span>{roleLabel}</span>
              </span>
            )}
          </div>

          {/* Handle */}
          <p className="mt-0.5 text-[12.5px] font-semibold text-ink-muted">
            {profile.handle}
          </p>

          {/* User Bio */}
          <p className="mt-2.5 text-[13px] leading-relaxed text-ink-body break-words">
            {profile.bio ||
              (lang === "fa"
                ? "همراه استودیو موسیقی فیمس و علاقه‌مند به کی‌پاپ."
                : lang === "ko"
                  ? "케이팝과 음악을 사랑하는 페이메스 리스너입니다."
                  : "K-Pop music enthusiast on FAIMESS.")}
          </p>

          {/* Social Stats Strip (4-Column) */}
          <div className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2 rounded-2xl border border-line/80 bg-subtle/50 p-2 sm:p-2.5 text-center">
            {/* 1. Fan Points */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-[14px] font-black text-ink tabular-nums sm:text-[16px]">
                {profile.points.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "امتیاز" : lang === "ko" ? "포인트" : "Points"}
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
              <span className="text-[14px] font-black text-ink tabular-nums sm:text-[16px]">
                {followStats.followersCount}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "دنبال‌کننده" : lang === "ko" ? "팔로워" : "Followers"}
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
              <span className="text-[14px] font-black text-ink tabular-nums sm:text-[16px]">
                {followStats.followingCount}
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "دنبال‌شده" : lang === "ko" ? "팔로잉" : "Following"}
              </span>
            </button>

            {/* 4. Badges (Interactive — Jump to Badges Tab) */}
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className="flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-surface/80"
            >
              <span className="text-[14px] font-black text-primary-deep tabular-nums sm:text-[16px]">
                {unlockedCount} / 100
              </span>
              <span className="text-[12px] font-bold text-ink-muted">
                {lang === "fa" ? "نشان‌ها" : lang === "ko" ? "배지" : "Badges"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
       *  COMPACT SEGMENTED NAVIGATION TABS (کنترل تب‌ها)
       * ========================================================================= */}
      <div className="flex w-full shrink-0 items-center gap-1 overflow-x-auto scroll-rail rounded-2xl bg-surface border border-line p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] sm:text-[12.5px] font-extrabold transition",
            activeTab === "overview"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="compass" size={14} />
          <span>{lang === "fa" ? "نمای کلی" : lang === "ko" ? "개요" : "Overview"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("playlists")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] sm:text-[12.5px] font-extrabold transition",
            activeTab === "playlists"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="disc" size={14} />
          <span>
            {lang === "fa"
              ? `پلی‌لیست‌ها (${displayPlaylists.length})`
              : lang === "ko"
                ? `플레이리스트 (${displayPlaylists.length})`
                : `Playlists (${displayPlaylists.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] sm:text-[12.5px] font-extrabold transition",
            activeTab === "badges"
              ? "bg-primary text-white shadow-xs"
              : "text-ink-muted hover:text-ink hover:bg-subtle",
          )}
        >
          <Icon name="medal" size={14} />
          <span>
            {lang === "fa"
              ? `نشان‌ها (${unlockedCount})`
              : lang === "ko"
                ? `배지 (${unlockedCount})`
                : `Badges (${unlockedCount})`}
          </span>
        </button>

        {isSelf && (
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] sm:text-[12.5px] font-extrabold transition",
              activeTab === "requests"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-subtle",
            )}
          >
            <Icon name="plus" size={14} />
            <span>{lang === "fa" ? "درخواست‌ها" : lang === "ko" ? "요청" : "Requests"}</span>
          </button>
        )}
      </div>

      {/* =========================================================================
       *  TAB 0: OVERVIEW (نمای کلی و ویترین مینیمال)
       * ========================================================================= */}
      {activeTab === "overview" && (
        <div className="flex w-full shrink-0 flex-col gap-4">
          {/* Minimal Honors Badges Shelf */}
          <div className="rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Icon name="sparkle" size={15} className="text-amber-500" />
                <h2 className="font-extrabold text-[13.5px] sm:text-[14px] text-ink">
                  {lang === "fa" ? "نشان‌های افتخار" : lang === "ko" ? "획득한 배지" : "Badges"}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-extrabold text-primary-deep">
                  {unlockedBadges.length} / 100
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("badges")}
                className="text-[12px] sm:text-[12.5px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "همه ←" : lang === "ko" ? "전체보기 →" : "All →"}
              </button>
            </div>

            {unlockedBadges.length === 0 ? (
              <div className="py-6 text-center text-ink-muted">
                <p className="text-[12.5px] font-bold">
                  {lang === "fa"
                    ? "هنوز نشانی کسب نشده است."
                    : lang === "ko"
                      ? "아직 획득한 배지가 없습니다."
                      : "No badges earned yet."}
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
                    title={`${getBadgeTitle(badge, lang)} (#${badge.number})`}
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
                      {getBadgeTitle(badge, lang)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Playlists Shelf */}
          <div className="rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Icon name="disc" size={15} className="text-primary" />
                <h2 className="font-extrabold text-[13.5px] sm:text-[14px] text-ink">
                  {isSelf
                    ? lang === "fa" ? "پلی‌لیست‌های من" : lang === "ko" ? "내 플레이리스트" : "My Playlists"
                    : lang === "fa" ? `پلی‌لیست‌های ${profile.name}` : lang === "ko" ? `${profile.name}의 플레이리스트` : `${profile.name}’s Playlists`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("playlists")}
                className="text-[12px] sm:text-[12.5px] font-bold text-primary transition hover:text-primary-deep"
              >
                {lang === "fa" ? "همه ←" : lang === "ko" ? "전체보기 →" : "All →"}
              </button>
            </div>

            {displayPlaylists.length === 0 ? (
              <div className="py-6 text-center text-ink-muted">
                <p className="text-[12.5px] font-bold">
                  {lang === "fa"
                    ? "هنوز پلی‌لیستی ساخته نشده است."
                    : lang === "ko"
                      ? "생성된 플레이리스트가 없습니다."
                      : "No playlists created yet."}
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3 overflow-x-auto scroll-rail py-2">
                {displayPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="group flex w-[140px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-subtle/50 p-2.5 transition hover:border-primary/40 hover:bg-surface sm:w-[150px]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-xs">
                      <Photo src={pl.cover} alt={pl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                    <h3 className="mt-2 truncate text-[12.5px] font-extrabold text-ink group-hover:text-primary transition">
                      {pl.name}
                    </h3>
                    <p className="truncate text-[12px] font-semibold text-ink-muted">
                      {lang === "fa" ? `${pl.trackIds.length} آهنگ` : lang === "ko" ? `${pl.trackIds.length}곡` : `${pl.trackIds.length} tracks`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Community Activity Shelf */}
          <div className="rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Icon name="activity" size={15} className="text-teal" />
              <h2 className="font-extrabold text-[13.5px] sm:text-[14px] text-ink">
                {lang === "fa" ? "فعالیت‌های اخیر" : lang === "ko" ? "최근 활동" : "Recent Activity"}
              </h2>
            </div>

            <div className="mt-3 divide-y divide-line/60">
              {[
                {
                  id: "act-1",
                  titleFa: "ثبت دیدگاه روی آهنگ",
                  titleKo: "댓글 작성",
                  titleEn: "Commented on track",
                  points: "+2",
                  time: "2h ago",
                  icon: "message" as const,
                },
                {
                  id: "act-2",
                  titleFa: "دریافت لایک برای نظر",
                  titleKo: "좋아요 획득",
                  titleEn: "Received comment like",
                  points: "+1",
                  time: "5h ago",
                  icon: "heart" as const,
                },
                {
                  id: "act-3",
                  titleFa: "ارسال و تایید لیریک آهنگ",
                  titleKo: "가사 기여 승인",
                  titleEn: "Lyrics submission approved",
                  points: "+50",
                  time: "1d ago",
                  icon: "waveform" as const,
                },
                {
                  id: "act-4",
                  titleFa: "دعوت موفق دوست به فیمس",
                  titleKo: "친구 초대 완료",
                  titleEn: "Invited friend to FAIMESS",
                  points: "+20",
                  time: "3d ago",
                  icon: "users" as const,
                },
              ].map((act) => (
                <div key={act.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary-deep">
                      <Icon name={act.icon} size={13} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-bold text-ink">
                        {lang === "fa" ? act.titleFa : lang === "ko" ? act.titleKo : act.titleEn}
                      </p>
                      <span className="text-[12px] text-ink-muted">{act.time}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[12px] font-extrabold text-mint">
                    {act.points} {lang === "fa" ? "امتیاز" : lang === "ko" ? "P" : "pts"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       *  TAB 1: PLAYLISTS (مدیریت پلی‌لیست‌ها با کاور آهنگ اول)
       * ========================================================================= */}
      {activeTab === "playlists" && (
        <div className="flex w-full shrink-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div>
              <h2 className="font-extrabold text-[15px] text-ink">
                {isSelf
                  ? lang === "fa" ? "پلی‌لیست‌های من" : lang === "ko" ? "내 플레이리스트" : "My Playlists"
                  : lang === "fa" ? `پلی‌لیست‌های ${profile.name}` : lang === "ko" ? `${profile.name}의 플레이리스트` : `${profile.name}’s Playlists`}
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پلی‌لیست‌های شخصی با کاور خودکار اولین آهنگ"
                  : lang === "ko"
                    ? "첫 번째 곡 앨범 커버가 자동 적용되는 플레이리스트"
                    : "Personal playlists with automatic lead track artwork"}
              </p>
            </div>

            {isSelf && (
              <button
                type="button"
                onClick={() => setCreatePlaylistOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] sm:text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
              >
                <Icon name="plus" size={13} strokeWidth={2.4} />
                <span>{lang === "fa" ? "+ پلی‌لیست جدید" : lang === "ko" ? "+ 새 플레이리스트" : "+ New Playlist"}</span>
              </button>
            )}
          </div>

          {displayPlaylists.length === 0 ? (
            <div className="rounded-[22px] border border-line bg-surface py-12 text-center text-ink-muted">
              <Icon name="disc" size={32} className="mx-auto text-ink-faint" />
              <p className="mt-2 text-[12.5px] font-bold">
                {lang === "fa" ? "هیچ پلی‌لیستی یافت نشد." : lang === "ko" ? "플레이리스트가 없습니다." : "No playlists found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-xs">
                    <Photo src={pl.cover} alt={pl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-2.5 truncate text-[13px] font-black text-ink group-hover:text-primary transition">
                    {pl.name}
                  </h3>
                  <p className="truncate text-[12px] font-semibold text-ink-muted">
                    {lang === "fa" ? `${pl.trackIds.length} آهنگ` : lang === "ko" ? `${pl.trackIds.length}곡` : `${pl.trackIds.length} tracks`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       *  TAB 2: 100 BADGES (تالار کامل ۱۰۰ نشان ۳بعدی با فیلترها و پشتیبانی ۳ زبانه)
       * ========================================================================= */}
      {activeTab === "badges" && (
        <div className="flex w-full shrink-0 flex-col gap-4">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="medal" size={17} className="text-primary" />
                <h2 className="font-extrabold text-[15px] text-ink">
                  {lang === "fa" ? "تالار ۱۰۰ نشان افتخار" : lang === "ko" ? "100개 명예의 전당 배지" : "100 Honors Badges"}
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-extrabold text-primary-deep">
                  {unlockedCount} / 100
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "نشان‌های سه‌بعدی و جوایز فعالیت در استودیو فیمس"
                  : lang === "ko"
                    ? "FAIMESS 활동으로 획득하는 3D 배지 컬렉션"
                    : "3D clay collector badges earned through platform activity"}
              </p>
            </div>

            {/* Badges Search */}
            <div className="relative w-full sm:w-56">
              <Icon name="search" size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                placeholder={lang === "fa" ? "جستجوی نشان..." : lang === "ko" ? "배지 검색..." : "Search badges..."}
                className="w-full rounded-xl border border-line bg-surface ps-9 pe-3 py-1.5 text-[12px] text-ink outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-3 shadow-2xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scroll-rail py-1">
              {[
                { id: "all", labelFa: "همه", labelKo: "전체", labelEn: "All" },
                { id: "unlocked", labelFa: "دریافت‌شده", labelKo: "획득함", labelEn: "Unlocked" },
                { id: "locked", labelFa: "قفل", labelKo: "잠김", labelEn: "Locked" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setBadgeStatusFilter(st.id as any)}
                  className={cn(
                    "whitespace-nowrap rounded-xl px-3 py-1 text-[12px] font-extrabold transition",
                    badgeStatusFilter === st.id
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-subtle text-ink-muted hover:bg-subtle/80 hover:text-ink",
                  )}
                >
                  {lang === "fa" ? st.labelFa : lang === "ko" ? st.labelKo : st.labelEn}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scroll-rail border-t border-line/60 pt-2 pb-1">
              <button
                type="button"
                onClick={() => setBadgeCategory("all")}
                className={cn(
                  "whitespace-nowrap rounded-xl px-2.5 py-1 text-[12px] font-bold transition",
                  badgeCategory === "all"
                    ? "bg-ink text-white"
                    : "bg-subtle text-ink-muted hover:text-ink",
                )}
              >
                {lang === "fa" ? "همه دسته‌ها" : lang === "ko" ? "모든 카테고리" : "All Categories"}
              </button>

              {BADGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBadgeCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-1 text-[12px] font-bold transition",
                    badgeCategory === cat.id
                      ? "bg-primary-deep text-white shadow-2xs"
                      : "bg-subtle text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon name={cat.icon} size={12} />
                  <span>{lang === "fa" ? cat.labelFa : lang === "ko" ? cat.labelKo : cat.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 100 Badges Responsive Grid */}
          {filteredBadges.length === 0 ? (
            <div className="rounded-[22px] border border-line bg-surface py-12 text-center text-ink-muted">
              <Icon name="search" size={24} className="mx-auto text-ink-faint" />
              <p className="mt-2 text-[12.5px] font-bold">
                {lang === "fa"
                  ? "نشانی با این مشخصات یافت نشد."
                  : lang === "ko"
                    ? "해당하는 배지가 없습니다."
                    : "No badges match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {filteredBadges.map((badge) => (
                <CompactClayBadgeCard
                  key={badge.id}
                  badge={badge}
                  lang={lang}
                  onSelect={setSelectedBadge}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       *  TAB 3: REQUESTS (پیگیری درخواست‌ها — ویژه خود کاربر)
       * ========================================================================= */}
      {activeTab === "requests" && isSelf && (
        <div className="flex w-full shrink-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs">
            <div>
              <h2 className="font-extrabold text-[15px] text-ink">
                {lang === "fa" ? "درخواست‌های آهنگ من" : lang === "ko" ? "내 곡 요청" : "My Track Requests"}
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {lang === "fa"
                  ? "پیگیری وضعیت افزودن آهنگ‌ها و لیریک‌های درخواستی شما"
                  : lang === "ko"
                    ? "요청한 곡 및 가사 처리 상태"
                    : "Track the status of your submitted song and lyric requests"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] sm:text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
            >
              <Icon name="plus" size={13} strokeWidth={2.4} />
              <span>{lang === "fa" ? "+ ثبت درخواست جدید" : lang === "ko" ? "+ 새 곡 요청" : "+ New Request"}</span>
            </button>
          </div>

          <div className="rounded-[22px] border border-line bg-surface p-3.5 sm:p-5 shadow-xs divide-y divide-line/60">
            {[
              {
                id: "req-1",
                trackTitle: "Seven",
                artistName: "Jung Kook",
                status: "fulfilled",
                time: "2025-02-10",
                notes: "Track and synced lyrics live on platform.",
              },
              {
                id: "req-2",
                trackTitle: "Super Shy",
                artistName: "NewJeans",
                status: "fulfilled",
                time: "2025-02-14",
                notes: "Added with bilingual Persian/English synchronisation.",
              },
              {
                id: "req-3",
                trackTitle: "Magnetic",
                artistName: "ILLIT",
                status: "pending",
                time: "2025-02-18",
                notes: "Pending review by editor chief.",
              },
            ].map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[13px] text-ink">
                      {req.trackTitle}
                    </span>
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
                      {lang === "fa" ? "در انتظار بررسی" : lang === "ko" ? "검토 대기 중" : "Pending"}
                    </span>
                  )}
                  {req.status === "fulfilled" && (
                    <span className="rounded-full bg-mint-soft px-2.5 py-0.5 text-[12px] font-extrabold text-mint-deep ring-1 ring-mint-deep/30">
                      ✓ {lang === "fa" ? "تایید شد (+۲۵ امتیاز)" : lang === "ko" ? "✓ 승인됨 (+25P)" : "✓ Fulfilled (+25 pts)"}
                    </span>
                  )}
                  {req.status === "rejected" && (
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[12px] font-bold text-rose-500 ring-1 ring-rose-500/30">
                      {lang === "fa" ? "رد شد" : lang === "ko" ? "반려됨" : "Rejected"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
       *  3D CLAY BADGE DETAIL MODAL (دیالوگ نشان ۳بعدی)
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
                  {(() => {
                    const c = BADGE_CATEGORIES.find((cat) => cat.id === selectedBadge.category);
                    return lang === "fa" ? c?.labelFa : lang === "ko" ? c?.labelKo : c?.labelEn;
                  })()}
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
                {getBadgeTitle(selectedBadge, lang)}
              </h3>
              {lang !== "en" && (
                <p className="text-[12px] font-bold text-ink-muted">
                  {selectedBadge.titleEn}
                </p>
              )}

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
                    ? lang === "fa" ? "درجه: عادی" : lang === "ko" ? "일반" : "Common"
                    : selectedBadge.rarity === "rare"
                      ? lang === "fa" ? "درجه: کمیاب" : lang === "ko" ? "희귀" : "Rare"
                      : selectedBadge.rarity === "epic"
                        ? lang === "fa" ? "درجه: حماسی" : lang === "ko" ? "에픽" : "Epic"
                        : selectedBadge.rarity === "legendary"
                          ? lang === "fa" ? "درجه: افسانه‌ای" : lang === "ko" ? "전설" : "Legendary"
                          : lang === "fa" ? "درجه: اسطوره‌ای" : lang === "ko" ? "신화" : "Mythic"}
                </span>

                <span className="rounded-full border border-line bg-subtle px-2.5 py-0.5 text-[12px] font-bold text-ink-muted">
                  {selectedBadge.requiredPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : lang === "ko" ? "P" : "pts"}
                </span>
              </div>

              <p className="mt-2.5 max-w-[320px] text-[12.5px] leading-relaxed text-ink-body">
                {getBadgeDesc(selectedBadge, lang)}
              </p>

              <div className="mt-4 w-full rounded-2xl border border-line/70 bg-subtle/50 p-3">
                {selectedBadge.unlocked ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-white font-extrabold text-[12px] shadow-xs">
                    <Icon name="check" size={14} className="text-white" strokeWidth={2.6} />
                    <span className="text-white">
                      {lang === "fa" ? "شما این نشان ۳بعدی را دریافت کرده‌اید!" : lang === "ko" ? "이 3D 배지를 획득하셨습니다!" : "Badge Unlocked!"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-ink-muted">
                        {lang === "fa" ? "کسر امتیاز تا باز شدن:" : lang === "ko" ? "획득까지 남은 포인트:" : "Points needed:"}
                      </span>
                      <span className="font-extrabold text-primary-deep">
                        {selectedBadge.remainingPoints.toLocaleString()} {lang === "fa" ? "امتیاز" : lang === "ko" ? "P" : "pts"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
                        style={{ width: `${selectedBadge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-line text-center">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full rounded-xl bg-subtle py-2 text-[12px] font-bold text-ink hover:bg-subtle/80"
              >
                {lang === "fa" ? "بستن" : lang === "ko" ? "닫기" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       *  REPORT USER MODAL (گزارش تخلف — فقط برای سایر کاربران)
       * ========================================================================= */}
      {reportModalOpen && !isSelf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                  <Icon name="flag" size={14} strokeWidth={2.2} />
                </span>
                <h3 className="font-extrabold text-[14px] text-ink">
                  {lang === "fa"
                    ? `گزارش کاربر @${profile.username}`
                    : lang === "ko"
                      ? `@${profile.username} 신고`
                      : `Report @${profile.username}`}
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
                  {lang === "fa" ? "دلیل گزارش" : lang === "ko" ? "신고 사유" : "Reason"}
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      fa: "محتوای نامناسب یا توهین‌آمیز",
                      ko: "부적절하거나 불쾌한 콘텐츠",
                      en: "Inappropriate or offensive content",
                    },
                    {
                      fa: "ارسال هرزنامه یا تبلیغات اسپم",
                      ko: "스팸 또는 원치 않는 광고",
                      en: "Spam or unwanted advertising",
                    },
                    {
                      fa: "بیوگرافی یا هویت جعلی",
                      ko: "사칭 또는 가짜 프로필",
                      en: "Fake identity or impersonation",
                    },
                    {
                      fa: "نقض حق کپی‌رایت یا لیریک جعلی",
                      ko: "저작권 침해 또는 허위 가사",
                      en: "Copyright infringement or false lyrics",
                    },
                  ].map((item) => {
                    const label = lang === "fa" ? item.fa : lang === "ko" ? item.ko : item.en;
                    return (
                      <label
                        key={item.en}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-[12px] font-bold transition",
                          reportReason === item.fa
                            ? "border-primary bg-primary/10 text-primary-deep"
                            : "border-line bg-surface text-ink hover:bg-subtle",
                        )}
                      >
                        <span>{label}</span>
                        <input
                          type="radio"
                          name="report-reason"
                          checked={reportReason === item.fa}
                          onChange={() => setReportReason(item.fa)}
                          className="accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "توضیحات تکمیلی (اختیاری)" : lang === "ko" ? "추가 설명 (선택 사항)" : "Additional Details"}
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder={
                    lang === "fa"
                      ? "توضیح مختصری بنویسید..."
                      : lang === "ko"
                        ? "자세한 설명을 입력하세요..."
                        : "Explain details..."
                  }
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-xl px-3.5 py-1.5 text-[12px] font-bold text-ink-muted hover:bg-subtle"
                >
                  {lang === "fa" ? "انصراف" : lang === "ko" ? "취소" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  {lang === "fa" ? "ارسال گزارش" : lang === "ko" ? "신고 제출" : "Submit Report"}
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
                {lang === "fa" ? "ویرایش مشخصات" : lang === "ko" ? "프로필 편집" : "Edit Profile"}
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
                    {lang === "fa" ? "آواتارهای عروسکی پیش‌فرض" : lang === "ko" ? "기본 인형 아바타" : "Default Doll Avatars"}
                  </label>
                  <span className="text-[12px] text-ink-faint">
                    {AVAILABLE_AVATARS.length} {lang === "fa" ? "آواتار" : lang === "ko" ? "개" : "avatars"}
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
                      <span>{lang === "fa" ? "📁 انتخاب عکس از گالری (فشرده‌سازی خودکار)" : lang === "ko" ? "📁 갤러리 아바타 업로드 (자동 압축)" : "📁 Upload Avatar (Auto-compressed)"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/70 px-3 py-2 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Icon name="lock" size={13} className="text-amber-500" />
                        <span>{lang === "fa" ? "آپلود عکس از گالری" : lang === "ko" ? "갤러리 아바타 업로드" : "Custom Avatar Upload"}</span>
                      </span>
                      <span className="font-extrabold text-amber-600">
                        {lang === "fa" ? `قفل (نیاز به ${POINTS_FOR_CUSTOM_AVATAR} امتیاز)` : lang === "ko" ? `잠김 (500P 필요)` : `Locked (${POINTS_FOR_CUSTOM_AVATAR} pts)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Banner Selector: Default System Banners + Custom Upload (Unlocked at 500 points) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-ink-muted">
                    {lang === "fa" ? "بنرهای پیش‌فرض سیستم" : lang === "ko" ? "기본 시스템 배너" : "Default System Banners"}
                  </label>
                  <span className="text-[12px] text-ink-faint">
                    {DEFAULT_SYSTEM_BANNERS.length} {lang === "fa" ? "طرح" : lang === "ko" ? "개" : "themes"}
                  </span>
                </div>

                {/* Default System Banners Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1">
                  {DEFAULT_SYSTEM_BANNERS.map((bannerItem) => (
                    <button
                      key={bannerItem.id}
                      type="button"
                      onClick={() => setEditBanner(bannerItem.url)}
                      title={lang === "fa" ? bannerItem.titleFa : lang === "ko" ? bannerItem.titleKo : bannerItem.titleEn}
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
                        {lang === "fa" ? bannerItem.titleFa : lang === "ko" ? bannerItem.titleKo : bannerItem.titleEn}
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
                        <span>{lang === "fa" ? "🖼️ انتخاب بنر از گالری (فشرده‌سازی)" : lang === "ko" ? "🖼️ 갤러리 배너 업로드 (자동 압축)" : "🖼️ Upload Banner (Auto-compressed)"}</span>
                      </button>
                      {editBanner && (
                        <button
                          type="button"
                          onClick={() => setEditBanner("")}
                          className="rounded-xl border border-line bg-surface px-2.5 py-2 text-[12px] font-bold text-ink-muted hover:text-rose-500"
                        >
                          {lang === "fa" ? "حذف" : lang === "ko" ? "초기화" : "Reset"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-line bg-subtle/70 px-3 py-2 text-[12px] text-ink-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Icon name="lock" size={13} className="text-amber-500" />
                        <span>{lang === "fa" ? "آپلود بنر دلخواه از گالری" : lang === "ko" ? "맞춤 배너 업로드" : "Custom Banner Upload"}</span>
                      </span>
                      <span className="font-extrabold text-amber-600">
                        {lang === "fa" ? `قفل (نیاز به ${POINTS_FOR_CUSTOM_BANNER.toLocaleString()} امتیاز)` : lang === "ko" ? `잠김 (500P 필요)` : `Locked (${POINTS_FOR_CUSTOM_BANNER} pts)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-[12px] font-bold text-ink-muted mb-1">
                  {lang === "fa" ? "نام نمایشی" : lang === "ko" ? "닉네임" : "Display Name"}
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
                  {lang === "fa" ? "نام کاربری (هندل)" : lang === "ko" ? "핸들" : "Username (Handle)"}
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
                  {lang === "fa" ? "سبک موسیقی مورد علاقه" : lang === "ko" ? "선호 장르" : "Favorite Genre"}
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
                  {lang === "fa" ? "بیوگرافی و معرفی کوتاه" : lang === "ko" ? "소개글" : "Bio"}
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
                  {lang === "fa" ? "انصراف" : lang === "ko" ? "취소" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-1.5 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep"
                >
                  {lang === "fa" ? "ذخیره تغییرات" : lang === "ko" ? "저장" : "Save Changes"}
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
        onClose={() => setFollowModalOpen(false)}
        initialTab={followModalTab}
      />

      <ContentRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </div>
  );
}
