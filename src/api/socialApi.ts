/* ------------------------------------------------------------------ *
 *  FAIMESS Social & Community API
 *  Manages User Profile customization, Follows & Followers,
 *  100 3D Claymorphic Badges & Unlocks, Levels & Tiers, and
 *  Content Requests.
 * ------------------------------------------------------------------ */

import { adminApi, type ContentRequest, type ContentRequestType } from "./adminApi";
import { BADGES, type CommentBadge } from "../data/badges";
import { ALL_100_BADGES, type PlatformBadge, type BadgeCategory, type BadgeRarity } from "../data/allBadges";
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

export type BadgeStatusItem = PlatformBadge & {
  unlocked: boolean;
  unlockedAt?: string;
  remainingPoints: number;
  progressPercent: number;
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
  isSelf: boolean;
  isFollowing: boolean;
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

export type PublicUserPlaylist = {
  id: string;
  name: string;
  cover: string;
  trackIds: string[];
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

export const COMMUNITY_USERS_SEED: Record<
  string,
  {
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    favoriteGenre: string;
    joinedAt: string;
    points: number;
    role: string;
    playlists: PublicUserPlaylist[];
  }
> = {
  yuna_music: {
    username: "yuna_music",
    displayName: "Yuna",
    bio: "K-pop enthusiast & lyric translator. Passionate about vocal harmonies and synth-pop.",
    avatar: yunaPhoto,
    favoriteGenre: "Vocal Pop & OST",
    joinedAt: "2024-11-01",
    points: 4820,
    role: "Community Moderator",
    playlists: [
      {
        id: "pl_yuna_vocal",
        name: "Yuna’s Midnight Vocals",
        cover: "/assets/photos/playlists/midnight-drive.webp",
        trackIds: ["tr1", "tr2", "tr3"],
      },
      {
        id: "pl_yuna_ballads",
        name: "Rainy Seoul Ballads",
        cover: "/assets/photos/playlists/rainy-window.webp",
        trackIds: ["tr3", "tr5"],
      },
    ],
  },
  taehyun_fan: {
    username: "taehyun_fan",
    displayName: "Taehyun",
    bio: "Synthwave collector, cassette lover and chart watcher. Always on the lookout for fresh drops.",
    avatar: taehyunPhoto,
    favoriteGenre: "Synthwave / Retro Pop",
    joinedAt: "2024-12-10",
    points: 3150,
    role: "Curator",
    playlists: [
      {
        id: "pl_taehyun_synth",
        name: "Cyberpunk Neon Beats",
        cover: "/assets/photos/playlists/deep-focus.webp",
        trackIds: ["tr2", "tr4", "tr6"],
      },
    ],
  },
  jxnnie_glow: {
    username: "jxnnie_glow",
    displayName: "Jennie",
    bio: "Dancing to every comeback beat. Fashion, stage performance and K-pop aesthetic enthusiast.",
    avatar: jxnniePhoto,
    favoriteGenre: "Dance Pop & Hip-Hop",
    joinedAt: "2025-01-05",
    points: 5890,
    role: "VIP Listener",
    playlists: [
      {
        id: "pl_jennie_stage",
        name: "Main Stage Energy",
        cover: "/assets/photos/playlists/comeback.webp",
        trackIds: ["tr1", "tr4", "tr5"],
      },
      {
        id: "pl_jennie_reset",
        name: "Weekend Reset Mix",
        cover: "/assets/photos/playlists/weekend-reset.webp",
        trackIds: ["tr2", "tr6"],
      },
    ],
  },
  haru_beats: {
    username: "haru_beats",
    displayName: "Haru",
    bio: "Beatmaker, sound designer and avid listener. Bass lover and live gig addict.",
    avatar: haruPhoto,
    favoriteGenre: "R&B / Electro",
    joinedAt: "2025-01-20",
    points: 2450,
    role: "Listener · Premium",
    playlists: [
      {
        id: "pl_haru_groove",
        name: "Deep Bass & Chill",
        cover: "/assets/photos/playlists/golden-hour.webp",
        trackIds: ["tr3", "tr6"],
      },
    ],
  },
  ari_beats: {
    username: "ari_beats",
    displayName: "Ari",
    bio: "Vocal melody enthusiast, lyrics lover and everyday music addict.",
    avatar: ariPhoto,
    favoriteGenre: "Indie Pop & Ballads",
    joinedAt: "2025-02-01",
    points: 1980,
    role: "Active Member",
    playlists: [
      {
        id: "pl_ari_melodies",
        name: "Soft Cloud Melodies",
        cover: "/assets/photos/playlists/rainy-window.webp",
        trackIds: ["tr1", "tr5"],
      },
    ],
  },
  sora_sky: {
    username: "sora_sky",
    displayName: "Sora",
    bio: "OST addict, soundtrack researcher and emotional music listener.",
    avatar: soraPhoto,
    favoriteGenre: "K-Drama OST",
    joinedAt: "2025-02-14",
    points: 2740,
    role: "OST Specialist",
    playlists: [
      {
        id: "pl_sora_drama",
        name: "Dramatic Romance Soundtracks",
        cover: "/assets/photos/playlists/midnight-drive.webp",
        trackIds: ["tr2", "tr5", "tr6"],
      },
    ],
  },
  minho_k: {
    username: "minho_k",
    displayName: "Minho",
    bio: "Chart analyst and music history buff. From 90s K-pop to 5th gen rookie groups.",
    avatar: minhoPhoto,
    favoriteGenre: "Dance & Disco",
    joinedAt: "2025-02-18",
    points: 3410,
    role: "Chart Analyst",
    playlists: [
      {
        id: "pl_minho_charts",
        name: "All-Kill Chart Leaders",
        cover: "/assets/photos/playlists/comeback.webp",
        trackIds: ["tr1", "tr2", "tr3", "tr4"],
      },
    ],
  },
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

    const cleanUser = username.toLowerCase().replace(/^@/, "");

    // Check community seed first
    if (COMMUNITY_USERS_SEED[cleanUser]) {
      const u = COMMUNITY_USERS_SEED[cleanUser];
      return {
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        avatar: u.avatar,
        favoriteGenre: u.favoriteGenre,
        joinedAt: u.joinedAt,
        points: u.points,
        role: u.role,
      };
    }

    const adminUser = adminApi.getUser(cleanUser);
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
      username: cleanUser,
      displayName: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
      bio: "FAIMESS Fan & Listener",
      avatar: mePhoto,
      favoriteGenre: "K-pop",
      joinedAt: "Recently",
      points: 450,
      role: "Fan Member",
    };
  },

  getProfile(username?: string): UserProfile {
    const isSelf = !username || username.toLowerCase() === socialState.profile.username.toLowerCase();
    const raw = this.getProfileData(username);
    const tierInfo = this.getUserLevel(raw.points);
    const following = this.isFollowing(raw.username);

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
      isSelf,
      isFollowing: following,
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

  getUserPlaylists(username?: string): PublicUserPlaylist[] {
    const cleanUser = (username || socialState.profile.username).toLowerCase().replace(/^@/, "");
    if (cleanUser === socialState.profile.username.toLowerCase()) {
      return [];
    }

    if (COMMUNITY_USERS_SEED[cleanUser]) {
      return COMMUNITY_USERS_SEED[cleanUser].playlists;
    }

    return [
      {
        id: `pl_${cleanUser}_favorites`,
        name: `${cleanUser}’s Favorite Selection`,
        cover: "/assets/photos/playlists/golden-hour.webp",
        trackIds: ["tr1", "tr2"],
      },
    ];
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
    const cleanUser = (username || socialState.profile.username).toLowerCase().replace(/^@/, "");
    if (cleanUser === socialState.profile.username.toLowerCase()) {
      return {
        followersCount: socialState.followers.length,
        followingCount: socialState.following.length,
      };
    }
    const seed = cleanUser.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 20;
    const baseFollowers = this.isFollowing(cleanUser) ? seed * 6 + 15 : seed * 6 + 14;
    return {
      followersCount: Math.max(4, baseFollowers),
      followingCount: Math.max(2, seed * 3 + 8),
    };
  },

  getFollowersList(): SocialUserSummary[] {
    const allUsers = adminApi.getUsers();
    return socialState.followers.map((uname) => {
      const match = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
      const seedMatch = COMMUNITY_USERS_SEED[uname.toLowerCase()];
      return {
        username: uname,
        displayName: match?.displayName || seedMatch?.displayName || uname,
        avatar: match?.avatar || seedMatch?.avatar || yunaPhoto,
        bio: match?.bio || seedMatch?.bio || "Active community listener",
        points: match?.points ?? seedMatch?.points ?? 750,
        isFollowing: this.isFollowing(uname),
      };
    });
  },

  getFollowingList(): SocialUserSummary[] {
    const allUsers = adminApi.getUsers();
    return socialState.following.map((uname) => {
      const match = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
      const seedMatch = COMMUNITY_USERS_SEED[uname.toLowerCase()];
      return {
        username: uname,
        displayName: match?.displayName || seedMatch?.displayName || uname,
        avatar: match?.avatar || seedMatch?.avatar || taehyunPhoto,
        bio: match?.bio || seedMatch?.bio || "Fan member",
        points: match?.points ?? seedMatch?.points ?? 1200,
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

  getAllSearchableUsers(): {
    username: string;
    displayName: string;
    handle: string;
    avatar: string;
    points: number;
    badge?: string;
  }[] {
    const map = new Map<string, { username: string; displayName: string; handle: string; avatar: string; points: number; badge?: string }>();

    // Self
    map.set(socialState.profile.username.toLowerCase(), {
      username: socialState.profile.username,
      displayName: socialState.profile.displayName,
      handle: `@${socialState.profile.username}`,
      avatar: socialState.profile.avatar,
      points: socialState.profile.points,
      badge: "Self",
    });

    // Community seeds
    for (const u of Object.values(COMMUNITY_USERS_SEED)) {
      map.set(u.username.toLowerCase(), {
        username: u.username,
        displayName: u.displayName,
        handle: `@${u.username}`,
        avatar: u.avatar,
        points: u.points,
        badge: u.points > 3000 ? "VIP" : undefined,
      });
    }

    // Admin users
    for (const u of adminApi.getUsers()) {
      if (!map.has(u.username.toLowerCase())) {
        map.set(u.username.toLowerCase(), {
          username: u.username,
          displayName: u.displayName,
          handle: `@${u.username}`,
          avatar: u.avatar,
          points: u.points,
          badge: u.role === "super_admin" ? "Admin" : undefined,
        });
      }
    }

    return Array.from(map.values());
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

  /** Returns all 100 badges with status against the given points balance */
  getAll100Badges(points: number): BadgeStatusItem[] {
    return ALL_100_BADGES.map((b) => {
      const unlocked = points >= b.requiredPoints;
      const remaining = Math.max(0, b.requiredPoints - points);
      const progress = unlocked ? 100 : Math.min(100, Math.round((points / b.requiredPoints) * 100));

      return {
        ...b,
        unlocked,
        unlockedAt: unlocked ? "Unlocked" : undefined,
        remainingPoints: remaining,
        progressPercent: progress,
      };
    });
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
