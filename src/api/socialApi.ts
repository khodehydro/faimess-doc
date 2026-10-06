/* ------------------------------------------------------------------ *
 *  FAIMESS Social & Community API
 *  Manages User Profile customization, Follows & Followers,
 *  100 3D Claymorphic Badges & Unlocks, Levels & Tiers, and
 *  Content Requests.
 * ------------------------------------------------------------------ */

import { adminApi, type ContentRequest, type ContentRequestType } from "./adminApi";
import { BADGES, type CommentBadge } from "../data/badges";
import { ALL_100_BADGES, type PlatformBadge, type BadgeCategory, type BadgeRarity } from "../data/allBadges";
import { activeUsers } from "../data/feed";
import { fanPoints } from "../data/points";
import type { IconName } from "../ui/Icon";

import mePhoto from "../assets/photos/users/me.webp";
import yunaPhoto from "../assets/photos/users/yuna.webp";
import taehyunPhoto from "../assets/photos/users/taehyun.webp";
import haruPhoto from "../assets/photos/users/haru.webp";
import jxnniePhoto from "../assets/photos/users/jxnnie.webp";
import ariPhoto from "../assets/photos/users/ari.webp";
import soraPhoto from "../assets/photos/users/sora.webp";
import minhoPhoto from "../assets/photos/users/minho.webp";
import yunhaPhoto from "../assets/photos/users/yunha.webp";
import misoPhoto from "../assets/photos/users/miso.webp";
import seojinPhoto from "../assets/photos/users/seojin.webp";

export const AVAILABLE_AVATARS = [
  mePhoto,
  yunaPhoto,
  taehyunPhoto,
  haruPhoto,
  jxnniePhoto,
  ariPhoto,
  soraPhoto,
  minhoPhoto,
  yunhaPhoto,
  misoPhoto,
  seojinPhoto,
];

export type UserLevelInfo = {
  level: number;
  tierKey: string;
  tierNameFa: string;
  tierNameEn: string;
  tierNameKo: string;
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

export type FandomInfo = {
  artistId: string;
  artistName: string;
  fandomNameFa: string;
  fandomNameEn: string;
  glowColor: string;
  accentHex: string;
  mottoFa: string;
};

export const ARTIST_FANDOMS: Record<string, FandomInfo> = {
  "ar-kairos": {
    artistId: "ar-kairos",
    artistName: "KAIROS",
    fandomNameFa: "اوربیت (ORBIT)",
    fandomNameEn: "ORBIT",
    glowColor: "rgba(130, 103, 240, 0.45)",
    accentHex: "#8267f0",
    mottoFa: "مدار بی‌پایان ستارگان",
  },
  "ar-prism9": {
    artistId: "ar-prism9",
    artistName: "PRISM9",
    fandomNameFa: "اسپکتروم (SPECTRUM)",
    fandomNameEn: "SPECTRUM",
    glowColor: "rgba(236, 72, 153, 0.45)",
    accentHex: "#ec4899",
    mottoFa: "درخشش ۹ رنگ منشور",
  },
  "ar-novae": {
    artistId: "ar-novae",
    artistName: "NOVAE",
    fandomNameFa: "سوپرنوا (SUPERNOVA)",
    fandomNameEn: "SUPERNOVA",
    glowColor: "rgba(59, 130, 246, 0.45)",
    accentHex: "#3b82f6",
    mottoFa: "انفجار نور و انرژی کیهانی",
  },
  "ar-seora": {
    artistId: "ar-seora",
    artistName: "SEORA",
    fandomNameFa: "سرافیم (SERAPHIM)",
    fandomNameEn: "SERAPHIM",
    glowColor: "rgba(168, 85, 247, 0.45)",
    accentHex: "#a855f7",
    mottoFa: "نوای فرشتگان شب‌های سئول",
  },
  "ar-axion": {
    artistId: "ar-axion",
    artistName: "AXION",
    fandomNameFa: "پالس (PULSE)",
    fandomNameEn: "PULSE",
    glowColor: "rgba(249, 115, 22, 0.45)",
    accentHex: "#f97316",
    mottoFa: "ضربان ریتم و خیابان",
  },
  "ar-lunex": {
    artistId: "ar-lunex",
    artistName: "LUNEX",
    fandomNameFa: "لونار (LUNAR)",
    fandomNameEn: "LUNAR",
    glowColor: "rgba(6, 182, 212, 0.45)",
    accentHex: "#06b6d4",
    mottoFa: "مهتاب پاپ کره‌ای",
  },
  "ar-velvet-moon": {
    artistId: "ar-velvet-moon",
    artistName: "VELVET MOON",
    fandomNameFa: "ولوت (VELVET)",
    fandomNameEn: "VELVET",
    glowColor: "rgba(225, 29, 72, 0.45)",
    accentHex: "#e11d48",
    mottoFa: "آرامش مخملین موسیقی شب",
  },
  "ar-haneul": {
    artistId: "ar-haneul",
    artistName: "HANEUL",
    fandomNameFa: "کلودز (CLOUDS)",
    fandomNameEn: "CLOUDS",
    glowColor: "rgba(16, 185, 129, 0.45)",
    accentHex: "#10b981",
    mottoFa: "آسمان آبی احساس",
  },
};

export type UserProfileData = {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner?: string;
  favoriteGenre: string;
  joinedAt: string;
  points: number;
  role: string;
  anthemTrackId?: string;
  biasArtistId?: string;
};

export type UserProfile = {
  username: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  banner?: string;
  favoriteGenre: string;
  joinedAt: string;
  points: number;
  role: string;
  tier: string;
  isSelf: boolean;
  isFollowing: boolean;
  anthemTrackId?: string;
  biasArtistId?: string;
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

export type InvitedUserRecord = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  joinedAt: string;
  earnedPoints: number;
};

export type UserReferralSummary = {
  inviteCode: string;
  inviteLink: string;
  rewardPerInvite: number;
  invitedCount: number;
  totalPointsEarned: number;
  invitedUsers: InvitedUserRecord[];
};

const PROFILE_KEY = "faimess.user_profile.v1";
const FOLLOWS_KEY = "faimess.social_follows.v1";
const REFERRALS_KEY = "faimess.referrals.v2";

const SEEDED_REFERRALS: InvitedUserRecord[] = [
  {
    id: "ref_seed_1",
    username: "taehyun_fan",
    displayName: "تهیون (Taehyun)",
    avatar: taehyunPhoto,
    joinedAt: "2025-01-18",
    earnedPoints: 3,
  },
  {
    id: "ref_seed_2",
    username: "kairos_orbit",
    displayName: "کایروس (Kairos Orbit)",
    avatar: seojinPhoto,
    joinedAt: "2025-01-22",
    earnedPoints: 3,
  },
  {
    id: "ref_seed_3",
    username: "miso_melody",
    displayName: "میسو (Miso Melody)",
    avatar: misoPhoto,
    joinedAt: "2025-01-28",
    earnedPoints: 3,
  },
  {
    id: "ref_seed_4",
    username: "editor_chief",
    displayName: "ادیتور ارشد (Chief Editor)",
    avatar: yunhaPhoto,
    joinedAt: "2025-02-02",
    earnedPoints: 3,
  },
  {
    id: "ref_seed_5",
    username: "ari_beats",
    displayName: "آری (Ari Beats)",
    avatar: ariPhoto,
    joinedAt: "2025-02-06",
    earnedPoints: 3,
  },
  {
    id: "ref_seed_6",
    username: "night_driver",
    displayName: "مسافر شب (Night Driver)",
    avatar: minhoPhoto,
    joinedAt: "2025-02-10",
    earnedPoints: 3,
  },
];

function getReferralsList(): InvitedUserRecord[] {
  if (typeof window === "undefined") return SEEDED_REFERRALS;
  try {
    const raw = window.localStorage.getItem(REFERRALS_KEY);
    if (!raw) return SEEDED_REFERRALS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEEDED_REFERRALS;
  } catch {
    return SEEDED_REFERRALS;
  }
}

function addReferralRecord(record: InvitedUserRecord) {
  const current = getReferralsList();
  const next = [record, ...current.filter((r) => r.username.toLowerCase() !== record.username.toLowerCase())];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(REFERRALS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
}

const DEFAULT_PROFILE: UserProfileData = {
  username: "sori",
  displayName: "Sori",
  bio: "K-pop lover & synthwave addict. Listener, curator and lyric enthusiast.",
  avatar: mePhoto,
  favoriteGenre: "Electro Pop / K-pop",
  joinedAt: "2025-01-15",
  points: 1840,
  role: "Listener · Premium",
  anthemTrackId: "nt1",
  biasArtistId: "ar-kairos",
};

export const COMMUNITY_USERS_SEED: Record<
  string,
  {
    username: string;
    displayName: string;
    displayNameFa: string;
    aliases: string[];
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
    displayName: "یونا (Yuna)",
    displayNameFa: "یونا",
    aliases: ["yuna", "یونا", "yuna_music", "@yuna", "@yuna_music"],
    bio: "علاقه‌مند به کی‌پاپ، مترجم لیریک و عاشق هارمونی‌های آوازی و ملودی‌های احساسی.",
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
    displayName: "تهیون (Taehyun)",
    displayNameFa: "تهیون",
    aliases: ["taehyun", "تهیون", "taehyun_fan", "@taehyun", "@taehyun_fan"],
    bio: "مجموعه‌دار سینث‌ویو، عاشق کاست‌های قدیمی و دنبال‌کننده روزانه چارت‌های موسیقی.",
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
    displayName: "جنی (Jennie Glow)",
    displayNameFa: "جنی",
    aliases: ["jennie", "جنی", "jxnnie", "jxnnie_glow", "@jennie", "@jxnnie_glow"],
    bio: "انرژی صحنه، بیت‌های پرتحرک کمبک‌ها و استایل‌های درخشان دنیای پاپ.",
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
    displayName: "هارو (Haru Beats)",
    displayNameFa: "هارو",
    aliases: ["haru", "هارو", "haru_beats", "@haru", "@haru_beats"],
    bio: "آهنگساز، طراح صدا و شنونده حرفه‌ای بیس‌های عمیق و لایو استیج‌ها.",
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
    displayName: "آری (Ari)",
    displayNameFa: "آری",
    aliases: ["ari", "آری", "ari_beats", "@ari", "@ari_beats"],
    bio: "عاشق ملودی‌های ابری و لیریک‌های عمیق؛ گوش دادن روزانه به جدیدترین ترک‌ها.",
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
    displayName: "سورا (Sora)",
    displayNameFa: "سورا",
    aliases: ["sora", "سورا", "sora_sky", "@sora", "@sora_sky"],
    bio: "شنونده تخصصی موسیقی متن سریال‌ها، فیلم‌ها و ترک‌های پیانو محور.",
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
    displayName: "مینهو (Minho)",
    displayNameFa: "مینهو",
    aliases: ["minho", "مینهو", "minho_k", "@minho", "@minho_k"],
    bio: "تحلیلگر چارت‌ها و تاریخچه پاپ مدرن از نسل اول تا گروه‌های تازه‌نفس پنج.",
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
  yunha: {
    username: "yunha",
    displayName: "یونها (Yunha)",
    displayNameFa: "یونها",
    aliases: ["yunha", "یونها", "@yunha"],
    bio: "شنونده فعال رتبه یک استودیو فیمس، طرفدار پروپاقرص سبک‌های الکتروپاپ و اجراهای زنده.",
    avatar: yunhaPhoto,
    favoriteGenre: "Electro Pop / Dance",
    joinedAt: "2024-10-12",
    points: 40150,
    role: "Top Listener",
    playlists: [
      {
        id: "pl_yunha_top",
        name: "Yunha's Peak Chart Playlist",
        cover: "/assets/photos/playlists/golden-hour.webp",
        trackIds: ["tr1", "tr2", "tr3"],
      },
    ],
  },
  miso: {
    username: "miso.k",
    displayName: "میسو (Miso K.)",
    displayNameFa: "میسو",
    aliases: ["miso", "میسو", "miso.k", "miso_k", "@miso", "@miso.k"],
    bio: "مجموعه‌دار آلبوم و شنونده حرفه‌ای ملودی‌های کره‌ای و سینث‌های شبانه.",
    avatar: misoPhoto,
    favoriteGenre: "Synth Pop & Indie",
    joinedAt: "2024-11-20",
    points: 38150,
    role: "Curator",
    playlists: [
      {
        id: "pl_miso_vibes",
        name: "Miso's Indie & Vocal Mix",
        cover: "/assets/photos/playlists/deep-focus.webp",
        trackIds: ["tr3", "tr4"],
      },
    ],
  },
  seojin: {
    username: "seojin",
    displayName: "سوجین (Seojin)",
    displayNameFa: "سوجین",
    aliases: ["seojin", "سوجین", "@seojin"],
    bio: "همراه وفادار استودیو، عاشق ترک‌های آرامش‌بخش و آکوستیک‌های زمستانی.",
    avatar: seojinPhoto,
    favoriteGenre: "Acoustic Pop & R&B",
    joinedAt: "2024-12-05",
    points: 27700,
    role: "Active Member",
    playlists: [
      {
        id: "pl_seojin_acoustic",
        name: "Seojin's Cozy Chillout",
        cover: "/assets/photos/playlists/rainy-window.webp",
        trackIds: ["tr2", "tr5"],
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
    if (
      !username ||
      username.toLowerCase() === socialState.profile.username.toLowerCase() ||
      username === "me" ||
      username === "سوری" ||
      username === "@sori"
    ) {
      return { ...socialState.profile };
    }

    const cleanUser = username.toLowerCase().replace(/^@/, "").trim();

    if (cleanUser === socialState.profile.username.toLowerCase()) {
      return { ...socialState.profile };
    }

    // Direct community seed key
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
        anthemTrackId: "nt1",
        biasArtistId: "ar-kairos",
      };
    }

    // Match aliases, Persian names or partial handle
    const aliasUser = Object.values(COMMUNITY_USERS_SEED).find((u) => {
      if (u.username.toLowerCase() === cleanUser) return true;
      if (u.displayName.toLowerCase().includes(cleanUser)) return true;
      if (u.displayNameFa && u.displayNameFa.toLowerCase().includes(cleanUser)) return true;
      if (u.aliases && u.aliases.some((a) => a.toLowerCase() === cleanUser || cleanUser.includes(a.toLowerCase()))) return true;
      return false;
    });

    if (aliasUser) {
      return {
        username: aliasUser.username,
        displayName: aliasUser.displayName,
        bio: aliasUser.bio,
        avatar: aliasUser.avatar,
        favoriteGenre: aliasUser.favoriteGenre,
        joinedAt: aliasUser.joinedAt,
        points: aliasUser.points,
        role: aliasUser.role,
        anthemTrackId: "tr1",
        biasArtistId: "ar-prism9",
      };
    }

    const adminUser = adminApi.getUser(cleanUser);
    if (adminUser) {
      return {
        username: adminUser.username,
        displayName: adminUser.displayName,
        bio: adminUser.bio || "عضو انجمن پلتفرم فیمس و شنونده فعال دنیای موسیقی کی‌پاپ.",
        avatar: adminUser.avatar,
        favoriteGenre: "Electro pop",
        joinedAt: adminUser.joinedAt,
        points: adminUser.points,
        role: adminUser.role.replace("_", " "),
        anthemTrackId: "nt2",
        biasArtistId: "ar-novae",
      };
    }

    // Match active users from feed (e.g. Yunha, Miso K., Seojin, Taehyun, Haru, Jxnnie, Minho, Ari)
    const feedUser = activeUsers.find((u) => {
      const uHandle = u.handle.toLowerCase().replace(/^@/, "");
      return (
        uHandle === cleanUser ||
        u.name.toLowerCase() === cleanUser ||
        u.name.toLowerCase().includes(cleanUser) ||
        cleanUser.includes(uHandle)
      );
    });

    if (feedUser) {
      return {
        username: feedUser.handle.replace(/^@/, ""),
        displayName: feedUser.name,
        bio: `${feedUser.name} شنونده فعال پلتفرم استریم کی‌پاپ فیمس با سطح ${feedUser.level} و زنجیره گوش دادن ${feedUser.streak} روزه.`,
        avatar: feedUser.photo,
        favoriteGenre: "K-Pop / Dance",
        joinedAt: "2024-10-01",
        points: Math.round(fanPoints(feedUser.activity)),
        role: "Active Member",
        anthemTrackId: "nt3",
        biasArtistId: "ar-seora",
      };
    }

    // Dynamic generated public user profile for any arbitrary user handle
    const charSum = cleanUser.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const avatars = [yunaPhoto, taehyunPhoto, jxnniePhoto, haruPhoto, ariPhoto, soraPhoto, minhoPhoto];
    const pickedAvatar = avatars[charSum % avatars.length];
    const generatedPoints = 350 + (charSum % 4200);

    return {
      username: cleanUser,
      displayName: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
      bio: "علاقه‌مند به دنیای کی‌پاپ و پلتفرم استریم فیمس. شنونده فعال و همراه همیشگی.",
      avatar: pickedAvatar,
      favoriteGenre: "K-Pop / Dance",
      joinedAt: "2025-01-20",
      points: generatedPoints,
      role: "Listener",
      anthemTrackId: "tr2",
      biasArtistId: "ar-kairos",
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
      banner: raw.banner,
      favoriteGenre: raw.favoriteGenre,
      joinedAt: raw.joinedAt,
      points: raw.points,
      role: raw.role,
      tier: tierInfo.tierNameFa,
      isSelf,
      isFollowing: following,
      anthemTrackId: raw.anthemTrackId,
      biasArtistId: raw.biasArtistId,
    };
  },

  updateProfile(updates: {
    name?: string;
    handle?: string;
    bio?: string;
    favoriteGenre?: string;
    avatar?: string;
    banner?: string;
    anthemTrackId?: string | null;
    biasArtistId?: string | null;
  }): UserProfile {
    if (updates.name) socialState.profile.displayName = updates.name;
    if (updates.handle) socialState.profile.username = updates.handle.replace(/^@/, "");
    if (updates.bio !== undefined) socialState.profile.bio = updates.bio;
    if (updates.favoriteGenre !== undefined) socialState.profile.favoriteGenre = updates.favoriteGenre;
    if (updates.avatar !== undefined) socialState.profile.avatar = updates.avatar;
    if (updates.banner !== undefined) socialState.profile.banner = updates.banner;
    if (updates.anthemTrackId !== undefined) socialState.profile.anthemTrackId = updates.anthemTrackId || undefined;
    if (updates.biasArtistId !== undefined) socialState.profile.biasArtistId = updates.biasArtistId || undefined;

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

  setProfileAnthem(trackId: string | null) {
    socialState.profile.anthemTrackId = trackId || undefined;
    notifySocialChanges();
  },

  setProfileBias(artistId: string | null) {
    socialState.profile.biasArtistId = artistId || undefined;
    notifySocialChanges();
  },

  getBiasFandom(artistId?: string): FandomInfo | null {
    if (!artistId) return null;
    return ARTIST_FANDOMS[artistId] || null;
  },

  getLoyaltyPoints(username?: string, artistId?: string): number {
    const raw = this.getProfileData(username);
    const targetArtist = artistId || raw.biasArtistId;
    if (!targetArtist) return 0;
    const seed = targetArtist.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Math.max(120, Math.round(raw.points * 0.45) + (seed % 350));
  },

  reportUser(report: {
    targetUsername: string;
    reason: string;
    details?: string;
  }): boolean {
    adminApi.reportUser(report.targetUsername, report.reason, report.details);
    return true;
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

  getPlaylistById(id: string): { id: string; name: string; curator: string; cover: string; trackIds: string[] } | null {
    // Check all community users
    for (const [username, user] of Object.entries(COMMUNITY_USERS_SEED)) {
      const pl = user.playlists.find((p) => p.id === id);
      if (pl) {
        return {
          id: pl.id,
          name: pl.name,
          curator: user.displayName || `@${username}`,
          cover: pl.cover,
          trackIds: pl.trackIds,
        };
      }
    }

    // Check dynamic pattern pl_${cleanUser}_favorites
    const match = id.match(/^pl_([^_]+)_favorites$/);
    if (match) {
      const cleanUser = match[1];
      return {
        id,
        name: `${cleanUser}’s Favorite Selection`,
        curator: `@${cleanUser}`,
        cover: "/assets/photos/playlists/golden-hour.webp",
        trackIds: ["tr1", "tr2"],
      };
    }

    return null;
  },

  getUserFavorites(username?: string): { trackIds: string[]; albumIds: string[]; playlistIds: string[] } {
    const cleanUser = (username || socialState.profile.username).toLowerCase().replace(/^@/, "");
    // Stable per-user favorites seed
    if (cleanUser === "yuna" || cleanUser === "yuna_music") {
      return {
        trackIds: ["nt1", "tr1", "tr3"],
        albumIds: ["al-afterglow", "al-paper-boats"],
        playlistIds: ["pl-midnight-drive", "p1"],
      };
    }
    if (cleanUser === "taehyun" || cleanUser === "taehyun_fan") {
      return {
        trackIds: ["nt2", "tr2", "tr4"],
        albumIds: ["al-blue-hour", "al-slow-motion"],
        playlistIds: ["pl-deep-focus", "p2"],
      };
    }
    if (cleanUser === "jennie" || cleanUser === "jxnnie" || cleanUser === "jxnnie_glow") {
      return {
        trackIds: ["nt3", "tr1", "tr5"],
        albumIds: ["al-velvet-static", "al-afterglow"],
        playlistIds: ["pl-comeback", "p3"],
      };
    }
    return {
      trackIds: ["nt1", "tr2", "tr5"],
      albumIds: ["al-nightbloom", "al-blue-hour"],
      playlistIds: ["pl-golden-hour", "p1"],
    };
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

  getFeaturedCommunityUsers(): {
    username: string;
    displayName: string;
    displayNameFa: string;
    handle: string;
    avatar: string;
    points: number;
    role: string;
  }[] {
    return Object.values(COMMUNITY_USERS_SEED).map((u) => ({
      username: u.username,
      displayName: u.displayName,
      displayNameFa: u.displayNameFa,
      handle: `@${u.username}`,
      avatar: u.avatar,
      points: u.points,
      role: u.role,
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
    const list: {
      username: string;
      displayName: string;
      handle: string;
      avatar: string;
      points: number;
      badge?: string;
    }[] = [];

    // Self
    list.push({
      username: socialState.profile.username,
      displayName: `${socialState.profile.displayName} (سوری)`,
      handle: `@${socialState.profile.username}`,
      avatar: socialState.profile.avatar,
      points: socialState.profile.points,
      badge: "پروفایل من",
    });

    // Community seeds
    for (const u of Object.values(COMMUNITY_USERS_SEED)) {
      list.push({
        username: u.username,
        displayName: `${u.displayName} (${u.displayNameFa})`,
        handle: `@${u.username}`,
        avatar: u.avatar,
        points: u.points,
        badge: u.points > 3000 ? "VIP" : undefined,
      });
    }

    // Admin users
    for (const u of adminApi.getUsers()) {
      if (!list.some((item) => item.username.toLowerCase() === u.username.toLowerCase())) {
        list.push({
          username: u.username,
          displayName: u.displayName,
          handle: `@${u.username}`,
          avatar: u.avatar,
          points: u.points,
          badge: u.role === "super_admin" ? "مدیر" : undefined,
        });
      }
    }

    // Active feed users
    for (const u of activeUsers) {
      const uname = u.handle.replace(/^@/, "");
      if (!list.some((item) => item.username.toLowerCase() === uname.toLowerCase())) {
        list.push({
          username: uname,
          displayName: u.name,
          handle: u.handle,
          avatar: u.photo,
          points: Math.round(fanPoints(u.activity)),
          badge: u.level >= 35 ? "VIP" : undefined,
        });
      }
    }

    return list;
  },

  /* ---------------- Badges & Level Progress ---------------- */

  getUserLevel(points: number): UserLevelInfo {
    if (points >= 7000) {
      return {
        level: 5,
        tierKey: "diamond",
        tierNameFa: "اسطوره الماس",
        tierNameEn: "Diamond Legend",
        tierNameKo: "다이아몬드 레전드",
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
        tierNameFa: "پلاتینیوم VIP",
        tierNameEn: "Platinum VIP",
        tierNameKo: "플래티넘 VIP",
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
        tierNameFa: "شنونده طلایی",
        tierNameEn: "Gold Listener",
        tierNameKo: "골드 리스너",
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
        tierNameFa: "هوادار نقره‌ای",
        tierNameEn: "Silver Fan",
        tierNameKo: "실버 팬",
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
      tierNameKo: "브론즈 루키",
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

  /* ---------------- Referral & Invites ---------------- */

  getInviteCode(username?: string): string {
    const raw = username || socialState.profile.username || "sori";
    const clean = raw.toLowerCase().replace(/^@/, "").trim();
    return `FAIMESS-${clean.toUpperCase()}`;
  },

  getReferralSummary(username?: string): UserReferralSummary {
    const code = this.getInviteCode(username);
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://faimess.app";
    const link = `${origin}/?ref=${code}`;
    const invitedUsers = getReferralsList();
    const invitedCount = Math.max(12, invitedUsers.length);
    const totalPointsEarned = invitedCount * 3;

    return {
      inviteCode: code,
      inviteLink: link,
      rewardPerInvite: 3,
      invitedCount,
      totalPointsEarned,
      invitedUsers,
    };
  },

  registerReferral(
    inviteCode: string,
    newUser: { username: string; displayName?: string; avatar?: string },
  ): {
    success: boolean;
    referrerUsername?: string;
    pointsAwarded: number;
  } {
    const normalized = inviteCode.trim().toUpperCase();
    const selfCode = this.getInviteCode();

    let referrer = "";
    if (
      normalized === selfCode ||
      normalized === socialState.profile.username.toUpperCase() ||
      normalized === "FAIMESS-SORI" ||
      normalized === "SORI"
    ) {
      referrer = socialState.profile.username;
    } else if (normalized.startsWith("FAIMESS-")) {
      referrer = normalized.replace("FAIMESS-", "").toLowerCase();
    } else {
      referrer = normalized.toLowerCase();
    }

    if (!referrer) {
      return { success: false, pointsAwarded: 0 };
    }

    const cleanNewName = newUser.username.trim();
    const newRecord: InvitedUserRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: cleanNewName,
      displayName: newUser.displayName || cleanNewName,
      avatar:
        newUser.avatar ||
        AVAILABLE_AVATARS[cleanNewName.charCodeAt(0) % AVAILABLE_AVATARS.length],
      joinedAt: new Date().toISOString().split("T")[0],
      earnedPoints: 3,
    };

    addReferralRecord(newRecord);

    if (referrer.toLowerCase() === socialState.profile.username.toLowerCase()) {
      socialState.profile.points += 3;
      notifySocialChanges();
    }

    return {
      success: true,
      referrerUsername: referrer,
      pointsAwarded: 3,
    };
  },

  simulateFriendInvite(): InvitedUserRecord {
    const sampleFriends = [
      { name: "مینا کیم (Mina Kim)", user: "mina_kpop", avatar: soraPhoto },
      { name: "دانیال (Danial Wave)", user: "danial_wave", avatar: minhoPhoto },
      { name: "지수 (Jisoo Vibe)", user: "jisoo_vibe", avatar: yunaPhoto },
      { name: "روژین (Rozhin Beats)", user: "rozhin_beats", avatar: jxnniePhoto },
      { name: "نوید (Navid Synth)", user: "navid_synth", avatar: haruPhoto },
    ];
    const existing = getReferralsList();
    const unpicked = sampleFriends.filter(
      (f) => !existing.some((e) => e.username === f.user),
    );
    const friend =
      unpicked.length > 0
        ? unpicked[0]
        : {
            name: `شنونده جدید ${existing.length + 1}`,
            user: `fan_${Date.now().toString().slice(-4)}`,
            avatar: AVAILABLE_AVATARS[existing.length % AVAILABLE_AVATARS.length],
          };

    const newRecord: InvitedUserRecord = {
      id: `ref_${Date.now()}`,
      username: friend.user,
      displayName: friend.name,
      avatar: friend.avatar,
      joinedAt: new Date().toISOString().split("T")[0],
      earnedPoints: 3,
    };

    addReferralRecord(newRecord);
    socialState.profile.points += 3;
    notifySocialChanges();
    return newRecord;
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
      nameKo: levelInfo.tierNameKo,
    },
    nextTier: nextTier
      ? {
          level: nextTier.level,
          nameFa: nextTier.tierNameFa,
          nameEn: nextTier.tierNameEn,
          nameKo: nextTier.tierNameKo,
        }
      : null,
    pointsToNext: remaining,
    progressPercent: levelInfo.progressPercent,
  };
}
