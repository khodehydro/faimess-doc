/* ------------------------------------------------------------------ *
 *  FAIMESS Social & Community API
 *  Manages User Profile customization, Follows & Followers,
 *  Badges & Unlocks, Levels & Tiers, and Content Requests.
 * ------------------------------------------------------------------ */

import { adminApi, type ContentRequest, type ContentRequestType } from "./adminApi";
import { BADGES, type CommentBadge } from "../data/badges";
import type { IconName } from "../ui/Icon";

import mePhoto from "../assets/photos/users/me.webp";
import yunaPhoto from "../assets/photos/users/yuna.webp";
import taehyunPhoto from "../assets/photos/users/taehyun.webp";
import haruPhoto from "../assets/photos/users/haru.webp";
import jxnniePhoto from "../assets/photos/users/jxnnie.webp";
import ariPhoto from "../assets/photos/users/ari.webp";
import soraPhoto from "../assets/photos/users/sora.webp";
import minhoPhoto from "../assets/photos/users/minho.webp";

export const AVAILABLE_AVATARS = [
  mePhoto,
  yunaPhoto,
  taehyunPhoto,
  haruPhoto,
  jxnniePhoto,
  ariPhoto,
  soraPhoto,
  minhoPhoto,
];

export type UserLevelInfo = {
  level: number;
  tierKey: string;
  tierNameFa: string;
  tierNameEn: string;
  minPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
  badgeTone: "primary" | "mint" | "flame" | "teal";
};

export type BadgeProgressItem = {
  id: string;
  badge: CommentBadge;
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: string;
  remainingPoints: number;
  progressPercent: number;
};

export type FanBadge = {
  id: string;
  icon: IconName;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  requiredPoints: number;
  unlocked: boolean;
};

export type UserProfileData = {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  favoriteGenre: string;
  joinedAt: string;
  points: number;
  role: string;
};

export type UserProfile = {
  username: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  favoriteGenre: string;
  joinedAt: string;
  points: number;
  role: string;
  tier: string;
};

export type SocialUserSummary = {
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  points: number;
  isFollowing: boolean;
};

export type UserProfileSummary = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  badge?: string;
  points: number;
};

const PROFILE_KEY = "faimess.user_profile.v1";
const FOLLOWS_KEY = "faimess.social_follows.v1";

const DEFAULT_PROFILE: UserProfileData = {
  username: "sori",
  displayName: "Sori",
  bio: "K-pop lover & synthwave addict. Listener, curator and lyric enthusiast.",
  avatar: mePhoto,
  favoriteGenre: "Electro Pop / K-pop",
  joinedAt: "2025-01-15",
  points: 1840,
  role: "Listener · Premium",
};

export const FAN_BADGES_CATALOG: FanBadge[] = [
  {
    id: "rookie",
    icon: "sparkle",
    titleFa: "عضو تازه‌وارد (Rookie)",
    titleEn: "Rookie Listener",
    descriptionFa: "پیوستن به جامعه شنوندگان فیمس و ثبت نام",
    requiredPoints: 100,
    unlocked: true,
  },
  {
    id: "fanOfMonth",
    icon: "star",
    titleFa: "هوادار برتر ماه",
    titleEn: "Fan of the Month",
    descriptionFa: "بیش از ۳۰ ساعت گوش دادن فعال به موسیقی",
    requiredPoints: 500,
    unlocked: true,
  },
  {
    id: "streak",
    icon: "bolt",
    titleFa: "زنجیره طلایی ۳۰ روزه",
    titleEn: "30-Day Streak",
    descriptionFa: "سی روز فعالیت و حضور مداوم در استودیو فیمس",
    requiredPoints: 1000,
    unlocked: true,
  },
  {
    id: "chart",
    icon: "trend",
    titleFa: "شکارچی چارت‌های کی‌پاپ",
    titleEn: "Chart Hunter",
    descriptionFa: "گوش دادن به صدرنشینان چارت هفتگی ملون و سرکل",
    requiredPoints: 1500,
    unlocked: true,
  },
  {
    id: "topListener",
    icon: "crown",
    titleFa: "شنونده برتر فصل ۱۲",
    titleEn: "Top Listener S12",
    descriptionFa: "کسب جایگاه برتر میان ۵٪ از وفادارترین کاربران استودیو",
    requiredPoints: 2000,
    unlocked: false,
  },
  {
    id: "moderator",
    icon: "medal",
    titleFa: "مشارکت‌کننده رسمی لیریک",
    titleEn: "Community Lyricist",
    descriptionFa: "ارسال و تایید موفق حداقل ۵ برگه متن و ترجمه آهنگ",
    requiredPoints: 3500,
    unlocked: false,
  },
  {
    id: "artist",
    icon: "verified",
    titleFa: "اسطوره هواداران فیمس",
    titleEn: "FAIMESS Legend",
    descriptionFa: "بالاترین نشان وفاداری استودیو با مشارکت‌های ماندگار",
    requiredPoints: 5000,
    unlocked: false,
  },
];

const BADGE_POINTS_MAP: Record<string, number> = {
  rookie: 100,
  fanOfMonth: 500,
  streak: 1000,
  chart: 1500,
  topListener: 2000,
  moderator: 3500,
  artist: 5000,
};

type SocialDbState = {
  profile: UserProfileData;
  following: string[];
  followers: string[];
};

function loadSocialState(): SocialDbState {
  if (typeof window === "undefined") {
    return {
      profile: DEFAULT_PROFILE,
      following: ["yuna_music", "jxnnie_glow", "haru_beats"],
      followers: ["taehyun_fan", "kairos_orbit", "editor_chief", "ari_beats"],
    };
  }

  try {
    const rawProfile = window.localStorage.getItem(PROFILE_KEY);
    const rawFollows = window.localStorage.getItem(FOLLOWS_KEY);

    const profile = rawProfile ? { ...DEFAULT_PROFILE, ...JSON.parse(rawProfile) } : DEFAULT_PROFILE;
    const follows = rawFollows
      ? JSON.parse(rawFollows)
      : {
          following: ["yuna_music", "jxnnie_glow", "haru_beats"],
          followers: ["taehyun_fan", "kairos_orbit", "editor_chief", "ari_beats"],
        };

    return {
      profile,
      following: Array.isArray(follows.following) ? follows.following : [],
      followers: Array.isArray(follows.followers) ? follows.followers : [],
    };
  } catch {
    return {
      profile: DEFAULT_PROFILE,
      following: ["yuna_music", "jxnnie_glow", "haru_beats"],
      followers: ["taehyun_fan", "kairos_orbit", "editor_chief", "ari_beats"],
    };
  }
}

let socialState: SocialDbState = loadSocialState();
type SocialChangeListener = () => void;
const socialListeners = new Set<SocialChangeListener>();

function notifySocialChanges() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(socialState.profile));
      window.localStorage.setItem(
        FOLLOWS_KEY,
        JSON.stringify({
          following: socialState.following,
          followers: socialState.followers,
        }),
      );
    } catch {
      // storage unavailable
    }
  }
  socialListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export const socialApi = {
  subscribe(fn: SocialChangeListener) {
    socialListeners.add(fn);
    return () => {
      socialListeners.delete(fn);
    };
  },

  /* ---------------- Profile ---------------- */

  getProfileData(username?: string): UserProfileData {
    if (!username || username.toLowerCase() === socialState.profile.username.toLowerCase()) {
      return { ...socialState.profile };
    }

    const adminUser = adminApi.getUser(username);
    if (adminUser) {
      return {
        username: adminUser.username,
        displayName: adminUser.displayName,
        bio: adminUser.bio || "FAIMESS Community member and music listener.",
        avatar: adminUser.avatar,
        favoriteGenre: "Electro pop",
        joinedAt: adminUser.joinedAt,
        points: adminUser.points,
        role: adminUser.role.replace("_", " "),
      };
    }

    return {
      username,
      displayName: username,
      bio: "FAIMESS Fan & Listener",
      avatar: mePhoto,
      favoriteGenre: "K-pop",
      joinedAt: "Recently",
      points: 450,
      role: "Fan Member",
    };
  },

  getProfile(username?: string): UserProfile {
    const raw = this.getProfileData(username);
    const tierInfo = this.getUserLevel(raw.points);
    return {
      username: raw.username,
      name: raw.displayName,
      handle: `@${raw.username}`,
      bio: raw.bio,
      avatar: raw.avatar,
      favoriteGenre: raw.favoriteGenre,
      joinedAt: raw.joinedAt,
      points: raw.points,
      role: raw.role,
      tier: tierInfo.tierNameFa,
    };
  },

  updateProfile(updates: {
    name?: string;
    handle?: string;
    bio?: string;
    favoriteGenre?: string;
    avatar?: string;
  }): UserProfile {
    if (updates.name) socialState.profile.displayName = updates.name;
    if (updates.handle) socialState.profile.username = updates.handle.replace(/^@/, "");
    if (updates.bio !== undefined) socialState.profile.bio = updates.bio;
    if (updates.favoriteGenre !== undefined) socialState.profile.favoriteGenre = updates.favoriteGenre;
    if (updates.avatar !== undefined) socialState.profile.avatar = updates.avatar;

    // Also synchronize with adminApi user list if existing
    const existing = adminApi.getUser(socialState.profile.username);
    if (existing) {
      adminApi.updateUser(socialState.profile.username, {
        displayName: socialState.profile.displayName,
        avatar: socialState.profile.avatar,
        bio: socialState.profile.bio,
      });
    }

    notifySocialChanges();
    return this.getProfile();
  },

  /* ---------------- Follow System ---------------- */

  isFollowing(idOrUsername: string): boolean {
    const target = idOrUsername.toLowerCase().replace(/^@/, "");
    return socialState.following.some((u) => u.toLowerCase() === target);
  },

  toggleFollow(idOrUsername: string): boolean {
    const target = idOrUsername.toLowerCase().replace(/^@/, "");
    const alreadyFollowing = this.isFollowing(target);

    if (alreadyFollowing) {
      socialState.following = socialState.following.filter((u) => u.toLowerCase() !== target);
    } else {
      socialState.following = [...socialState.following, target];
    }

    notifySocialChanges();
    return !alreadyFollowing;
  },

  getFollowStats(username?: string): { followersCount: number; followingCount: number } {
    if (!username || username.toLowerCase() === socialState.profile.username.toLowerCase()) {
      return {
        followersCount: socialState.followers.length,
        followingCount: socialState.following.length,
      };
    }
    const u = adminApi.getUser(username);
    const seed = (u?.points ?? 500) % 15;
    return {
      followersCount: Math.max(3, seed * 7 + 12),
      followingCount: Math.max(1, seed * 3 + 4),
    };
  },

  getFollowersList(): SocialUserSummary[] {
    const allUsers = adminApi.getUsers();
    return socialState.followers.map((uname) => {
      const match = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
      return {
        username: uname,
        displayName: match?.displayName || uname,
        avatar: match?.avatar || yunaPhoto,
        bio: match?.bio || "Active community listener",
        points: match?.points ?? 750,
        isFollowing: this.isFollowing(uname),
      };
    });
  },

  getFollowingList(): SocialUserSummary[] {
    const allUsers = adminApi.getUsers();
    return socialState.following.map((uname) => {
      const match = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
      return {
        username: uname,
        displayName: match?.displayName || uname,
        avatar: match?.avatar || taehyunPhoto,
        bio: match?.bio || "Fan member",
        points: match?.points ?? 1200,
        isFollowing: true,
      };
    });
  },

  getFollowers(): UserProfileSummary[] {
    return this.getFollowersList().map((u) => ({
      id: u.username,
      name: u.displayName,
      handle: `@${u.username}`,
      avatar: u.avatar,
      badge: u.points > 1000 ? "VIP" : undefined,
      points: u.points,
    }));
  },

  getFollowing(): UserProfileSummary[] {
    return this.getFollowingList().map((u) => ({
      id: u.username,
      name: u.displayName,
      handle: `@${u.username}`,
      avatar: u.avatar,
      badge: u.points > 1000 ? "VIP" : undefined,
      points: u.points,
    }));
  },

  /* ---------------- Badges & Level Progress ---------------- */

  getUserLevel(points: number): UserLevelInfo {
    if (points >= 7000) {
      return {
        level: 5,
        tierKey: "diamond",
        tierNameFa: "اسطوره الماس فیمس",
        tierNameEn: "Diamond Legend",
        minPoints: 7000,
        nextLevelPoints: 10000,
        progressPercent: Math.min(100, Math.round(((points - 7000) / 3000) * 100)),
        badgeTone: "primary",
      };
    }
    if (points >= 3500) {
      return {
        level: 4,
        tierKey: "platinum",
        tierNameFa: "همراه ویژه پلاتینیوم",
        tierNameEn: "Platinum VIP",
        minPoints: 3500,
        nextLevelPoints: 7000,
        progressPercent: Math.min(100, Math.round(((points - 3500) / 3500) * 100)),
        badgeTone: "teal",
      };
    }
    if (points >= 1500) {
      return {
        level: 3,
        tierKey: "gold",
        tierNameFa: "شنونده طلایی ممتاز",
        tierNameEn: "Gold Listener",
        minPoints: 1500,
        nextLevelPoints: 3500,
        progressPercent: Math.min(100, Math.round(((points - 1500) / 2000) * 100)),
        badgeTone: "flame",
      };
    }
    if (points >= 500) {
      return {
        level: 2,
        tierKey: "silver",
        tierNameFa: "هوادار وفادار نقره‌ای",
        tierNameEn: "Silver Fan",
        minPoints: 500,
        nextLevelPoints: 1500,
        progressPercent: Math.min(100, Math.round(((points - 500) / 1000) * 100)),
        badgeTone: "mint",
      };
    }
    return {
      level: 1,
      tierKey: "bronze",
      tierNameFa: "شنونده نوآموز",
      tierNameEn: "Bronze Rookie",
      minPoints: 0,
      nextLevelPoints: 500,
      progressPercent: Math.min(100, Math.round((points / 500) * 100)),
      badgeTone: "mint",
    };
  },

  getAllBadgesStatus(points: number): BadgeProgressItem[] {
    const list: BadgeProgressItem[] = [];

    for (const [key, badge] of Object.entries(BADGES)) {
      const required = BADGE_POINTS_MAP[key] ?? 1000;
      const unlocked = points >= required;
      const remaining = Math.max(0, required - points);
      const progress = unlocked ? 100 : Math.min(100, Math.round((points / required) * 100));

      list.push({
        id: key,
        badge,
        pointsRequired: required,
        unlocked,
        unlockedAt: unlocked ? "Unlocked" : undefined,
        remainingPoints: remaining,
        progressPercent: progress,
      });
    }

    return list.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return a.pointsRequired - b.pointsRequired;
    });
  },

  getUserBadges(points: number): { earned: FanBadge[]; remaining: FanBadge[] } {
    const earned: FanBadge[] = [];
    const remaining: FanBadge[] = [];

    for (const b of FAN_BADGES_CATALOG) {
      const unlocked = points >= b.requiredPoints;
      const item: FanBadge = { ...b, unlocked };
      if (unlocked) {
        earned.push(item);
      } else {
        remaining.push(item);
      }
    }
    return { earned, remaining };
  },

  /* ---------------- Content Requests ---------------- */

  submitContentRequest(data: {
    type: ContentRequestType;
    title: string;
    artistName: string;
    notes?: string;
  }): ContentRequest {
    return adminApi.submitContentRequest({
      type: data.type,
      title: data.title,
      artistName: data.artistName,
      notes: data.notes,
      requestedBy: socialState.profile.username,
      requestedByDisplay: socialState.profile.displayName,
      avatar: socialState.profile.avatar,
    });
  },

  getUserRequests(username?: string): ContentRequest[] {
    const target = (username || socialState.profile.username).toLowerCase();
    const all = adminApi.getContentRequests("all");
    return all.filter((r) => r.requestedBy.toLowerCase() === target);
  },

  getContentRequests(username?: string): ContentRequest[] {
    return this.getUserRequests(username);
  },
};

export function calculateTierProgress(points: number) {
  const levelInfo = socialApi.getUserLevel(points);
  const remaining = Math.max(0, levelInfo.nextLevelPoints - points);
  const nextTier =
    levelInfo.level < 5
      ? socialApi.getUserLevel(levelInfo.nextLevelPoints)
      : null;

  return {
    currentTier: {
      level: levelInfo.level,
      nameFa: levelInfo.tierNameFa,
      nameEn: levelInfo.tierNameEn,
    },
    nextTier: nextTier
      ? {
          level: nextTier.level,
          nameFa: nextTier.tierNameFa,
          nameEn: nextTier.tierNameEn,
        }
      : null,
    pointsToNext: remaining,
    progressPercent: levelInfo.progressPercent,
  };
}
