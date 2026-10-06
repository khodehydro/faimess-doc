/* ------------------------------------------------------------------ *
 *  FAIMESS Unified Admin API & In-Memory Persistence Layer
 *  High-performance, reactive data layer for Super Admin & staff.
 *  Supports complete CRUD operations, filtering, search, pagination,
 *  community moderation, analytics, and localStorage synchronization.
 * ------------------------------------------------------------------ */

import { artists as initialArtists, albums as initialAlbums, playlists as initialPlaylists, type Artist, type Album, type Playlist } from "../data/library";
import { QUEUE as initialTracks, toSeconds, type PlayerTrack } from "../data/player";
import { newsItems as initialNews, type NewsItem, type NewsComment } from "../data/feed";
import { shopProducts as initialShop, type ShopProduct, type ShopCategoryId, type ShopBadge } from "../data/shop";
import { type LyricSubmission } from "../data/lyrics";

export type AdminUserRole =
  | "super_admin"
  | "news_manager"
  | "news_author"
  | "comment_moderator"
  | "music_curator"
  | "shop_manager"
  | "admin"
  | "moderator"
  | "editor"
  | "user";

export type UserPermissions = {
  canManageTracks: boolean;
  canManageAlbums: boolean;
  canManageArtists: boolean;
  canManagePlaylists: boolean;
  canWriteNews: boolean;
  canApproveNews: boolean;
  canModerateComments: boolean;
  canReviewLyrics: boolean;
  canManageShop: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
};

export function getDefaultPermissions(role: AdminUserRole): UserPermissions {
  switch (role) {
    case "super_admin":
      return {
        canManageTracks: true,
        canManageAlbums: true,
        canManageArtists: true,
        canManagePlaylists: true,
        canWriteNews: true,
        canApproveNews: true,
        canModerateComments: true,
        canReviewLyrics: true,
        canManageShop: true,
        canManageUsers: true,
        canViewAnalytics: true,
      };
    case "news_manager":
      return {
        canManageTracks: false,
        canManageAlbums: false,
        canManageArtists: false,
        canManagePlaylists: false,
        canWriteNews: true,
        canApproveNews: true,
        canModerateComments: false,
        canReviewLyrics: false,
        canManageShop: false,
        canManageUsers: false,
        canViewAnalytics: true,
      };
    case "news_author":
      return {
        canManageTracks: false,
        canManageAlbums: false,
        canManageArtists: false,
        canManagePlaylists: false,
        canWriteNews: true,
        canApproveNews: false,
        canModerateComments: false,
        canReviewLyrics: false,
        canManageShop: false,
        canManageUsers: false,
        canViewAnalytics: false,
      };
    case "comment_moderator":
      return {
        canManageTracks: false,
        canManageAlbums: false,
        canManageArtists: false,
        canManagePlaylists: false,
        canWriteNews: false,
        canApproveNews: false,
        canModerateComments: true,
        canReviewLyrics: false,
        canManageShop: false,
        canManageUsers: false,
        canViewAnalytics: true,
      };
    case "music_curator":
      return {
        canManageTracks: true,
        canManageAlbums: true,
        canManageArtists: true,
        canManagePlaylists: true,
        canWriteNews: false,
        canApproveNews: false,
        canModerateComments: false,
        canReviewLyrics: true,
        canManageShop: false,
        canManageUsers: false,
        canViewAnalytics: true,
      };
    case "shop_manager":
      return {
        canManageTracks: false,
        canManageAlbums: false,
        canManageArtists: false,
        canManagePlaylists: false,
        canWriteNews: false,
        canApproveNews: false,
        canModerateComments: false,
        canReviewLyrics: false,
        canManageShop: true,
        canManageUsers: false,
        canViewAnalytics: true,
      };
    case "admin":
    case "moderator":
    case "editor":
      return {
        canManageTracks: true,
        canManageAlbums: true,
        canManageArtists: true,
        canManagePlaylists: true,
        canWriteNews: true,
        canApproveNews: true,
        canModerateComments: true,
        canReviewLyrics: true,
        canManageShop: true,
        canManageUsers: false,
        canViewAnalytics: true,
      };
    case "user":
    default:
      return {
        canManageTracks: false,
        canManageAlbums: false,
        canManageArtists: false,
        canManagePlaylists: false,
        canWriteNews: false,
        canApproveNews: false,
        canModerateComments: false,
        canReviewLyrics: false,
        canManageShop: false,
        canManageUsers: false,
        canViewAnalytics: false,
      };
  }
}

export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: AdminUserRole;
  permissions?: UserPermissions;
  avatar: string;
  points: number;
  joinedAt: string;
  lastActive: string;
  status: "active" | "suspended";
  bio?: string;
};

export type AdminAlbum = Album & {
  trackIds?: string[];
};

export type AdminPlaylist = Playlist & {
  trackIds?: string[];
};

export type AdminTrack = PlayerTrack & {
  isSingle?: boolean;
};

export type AdminNews = NewsItem & {
  status?: "published" | "pending_review";
};

export type ContentRequestType = "track" | "album" | "lyrics" | "artist";

export type ContentRequest = {
  id: string;
  type: ContentRequestType;
  title: string;
  artistName: string;
  notes?: string;
  requestedBy: string;
  requestedByDisplay: string;
  avatar?: string;
  submittedAt: string;
  status: "pending" | "fulfilled" | "rejected";
  adminResponse?: string;
};

export type AdminCommentRecord = {
  id: string;
  sourceType: "track" | "news";
  targetId: string;
  targetTitle: string;
  author: string;
  handle: string;
  text: string;
  time: string;
  likes: number;
  status: "approved" | "pending" | "reported";
  reportReason?: string;
  repliesCount: number;
  isNew?: boolean;
  isReviewed?: boolean;
};

export type AdminOverviewStats = {
  totalTracks: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalNews: number;
  totalComments: number;
  reportedComments: number;
  unreviewedComments?: number;
  pendingLyrics: number;
  pendingNews: number;
  pendingRequests: number;
  totalShopProducts: number;
  totalUsers: number;
  activeListenersToday: number;
  onlineUsers: number;
  pageViewsToday: number;
  pageViewsWeek: number;
  pageViewsTotal: number;
  commentsToday: number;
  commentsWeek: number;
  newUsersWeek: number;
  streamsToday: number;
  streamsWeek: number;
  totalStreams: number;
  totalPointsDistributed: number;
  estimatedRevenueToman: number;
};

export type AdminActivityLog = {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  entityType: "track" | "artist" | "album" | "news" | "comment" | "lyrics" | "shop" | "user" | "playlist" | "settings";
  entityId: string;
  details: string;
};

export type SiteFeatureSettings = {
  // Identity & Branding
  siteName: string;
  siteSubtitle: string;
  browserTitle: string;
  siteLogo: string;
  siteFavicon: string;
  footerText: string;

  // Colors & Theme
  primaryColor: string;
  accentColor: string;
  defaultTheme: "dark" | "light" | "system";
  glassMorphism: boolean;
  customCss: string;

  // SEO & Social Tags
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  twitterHandle: string;
  robotsIndexing: boolean;
  canonicalUrl: string;
  googleAnalyticsId: string;

  // Custom Site Texts (0 to 100)
  heroTitle: string;
  heroSubtitle: string;
  merchShelfTitle: string;
  fanClubWelcomeMessage: string;
  supportContactEmail: string;

  // Feature Toggles & Modules
  showShop: boolean;
  showNews: boolean;
  showPlaylists: boolean;
  showArtists: boolean;
  showAlbums: boolean;
  showLyricsSubmissions: boolean;
  showCommentsSection: boolean;
  showReferralSystem: boolean;

  // SMS Panel & API Keys (No .env file required!)
  smsProvider: "kavenegar" | "ghasedak" | "farazsms" | "custom";
  smsApiKey: string;
  smsSenderNumber: string;
  smsOtpPattern: string;

  // Telegram Bot Integration
  telegramBotToken: string;
  telegramChannelId: string;
  telegramAdminChatId: string;
  telegramAutoPublish: boolean;

  // Bale Messenger Integration
  baleBotToken: string;
  baleChannelId: string;
  baleAutoPublish: boolean;

  // Social Publishing Schedule Toggles
  autoPublishSaturdayUsers: boolean;
  autoPublishSundayComments: boolean;
  autoPublishMondayTracks: boolean;
  autoPublishTuesdayArtists: boolean;

  // Maintenance & System
  maintenanceMode: boolean;
  maintenanceNotice: string;
};

const DEFAULT_SETTINGS: SiteFeatureSettings = {
  siteName: "FAIMESS",
  siteSubtitle: "استودیو و جامعه موسیقی کی‌پاپ",
  browserTitle: "FAIMESS — استودیو موسیقی، رادیو و جامعه هواداری",
  siteLogo: "/assets/photos/faimess-logo.png",
  siteFavicon: "/favicon.ico",
  footerText: "© 2026 استودیو فیمس — کلیه حقوق محفوظ است.",

  primaryColor: "#6b4fdd",
  accentColor: "#8267f0",
  defaultTheme: "dark",
  glassMorphism: true,
  customCss: "",

  metaTitle: "FAIMESS — پلتفرم استریم و جامعه موسیقی کی‌پاپ",
  metaDescription: "پلتفرم اختصاصی شنیدن موسیقی، ترجمه همزمان لیریک کره‌ای و فارسی، دیسکوگرافی هنرمندان و جامعه تعاملی هواداران",
  metaKeywords: "کیپاپ, دانلود آهنگ کیپاپ, استریم کیپاپ, لیریک کیپاپ, ترجمه آهنگ های کره ای",
  ogImage: "https://faimess.app/assets/photos/banners/midnight-seoul.webp",
  twitterHandle: "@faimess_app",
  robotsIndexing: true,
  canonicalUrl: "https://faimess.app",
  googleAnalyticsId: "",

  heroTitle: "آهنگ‌های تازه و اختصاصی استودیو فیمس",
  heroSubtitle: "منتخب برترین قطعات و دیسکوگرافی هنرمندان مطرح با کیفیت استودیو",
  merchShelfTitle: "استایل و یادگاری‌ها",
  fanClubWelcomeMessage: "به جمع شنوندگان و هواداران رسمی فیمس خوش آمدید!",
  supportContactEmail: "support@faimess.app",

  showShop: true,
  showNews: true,
  showPlaylists: true,
  showArtists: true,
  showAlbums: true,
  showLyricsSubmissions: true,
  showCommentsSection: true,
  showReferralSystem: true,

  smsProvider: "kavenegar",
  smsApiKey: "",
  smsSenderNumber: "10008000",
  smsOtpPattern: "faimess-auth",

  telegramBotToken: "",
  telegramChannelId: "@faimess_app",
  telegramAdminChatId: "",
  telegramAutoPublish: true,

  baleBotToken: "",
  baleChannelId: "@faimess_music",
  baleAutoPublish: true,

  autoPublishSaturdayUsers: true,
  autoPublishSundayComments: true,
  autoPublishMondayTracks: true,
  autoPublishTuesdayArtists: true,

  maintenanceMode: false,
  maintenanceNotice: "سیستم در حال ارتقا و به‌روزرسانی زیرساخت است. به‌زودی بازمی‌گردیم.",
};

const DB_KEY = "faimess.admin_db.v4";

type AdminDbState = {
  artists: Artist[];
  albums: AdminAlbum[];
  tracks: AdminTrack[];
  playlists: AdminPlaylist[];
  news: AdminNews[];
  comments: AdminCommentRecord[];
  contentRequests: ContentRequest[];
  lyricsSubmissions: LyricSubmission[];
  lyricsByTrack: Record<string, { original: string; translation?: string }>;
  shop: ShopProduct[];
  users: AdminUser[];
  activities: AdminActivityLog[];
  settings: SiteFeatureSettings;
  metrics: {
    dailyStreams: { day: string; streams: number; listeners: number }[];
  };
};

/* ----------------- Default Seed Initializers ----------------------- */

const SEED_USERS: AdminUser[] = [
  {
    id: "usr-admin",
    username: "admin",
    displayName: "Admin Operator",
    role: "super_admin",
    permissions: getDefaultPermissions("super_admin"),
    avatar: "/assets/photos/account/me.webp",
    points: 12500,
    joinedAt: "2025-01-01",
    lastActive: "Just now",
    status: "active",
    bio: "Lead platform director & super-administrator.",
  },
  {
    id: "usr-news-mgr",
    username: "editor_chief",
    displayName: "Editorial Director",
    role: "news_manager",
    permissions: getDefaultPermissions("news_manager"),
    avatar: "/assets/photos/listeners/minho.webp",
    points: 6200,
    joinedAt: "2025-02-10",
    lastActive: "15 mins ago",
    status: "active",
    bio: "Head of editorial desk and publication supervisor.",
  },
  {
    id: "usr-news-writer",
    username: "sarah_writer",
    displayName: "Sarah Jin",
    role: "news_author",
    permissions: getDefaultPermissions("news_author"),
    avatar: "/assets/photos/listeners/seojin.webp",
    points: 2400,
    joinedAt: "2025-03-05",
    lastActive: "1 hr ago",
    status: "active",
    bio: "K-pop culture news contributor and columnist.",
  },
  {
    id: "usr-comment-mod",
    username: "comm_mod",
    displayName: "Community Guardian",
    role: "comment_moderator",
    permissions: getDefaultPermissions("comment_moderator"),
    avatar: "/assets/photos/listeners/sora.webp",
    points: 4800,
    joinedAt: "2025-02-15",
    lastActive: "10 mins ago",
    status: "active",
    bio: "Community reported comments & safety supervisor.",
  },
  {
    id: "usr-music-curator",
    username: "music_lead",
    displayName: "Sound Curator",
    role: "music_curator",
    permissions: getDefaultPermissions("music_curator"),
    avatar: "/assets/photos/listeners/haru.webp",
    points: 5900,
    joinedAt: "2025-02-20",
    lastActive: "Just now",
    status: "active",
    bio: "Music catalogue, discography and lyrics inspector.",
  },
  {
    id: "usr-shop-mgr",
    username: "merch_director",
    displayName: "Shop Manager",
    role: "shop_manager",
    permissions: getDefaultPermissions("shop_manager"),
    avatar: "/assets/photos/listeners/miso.webp",
    points: 3100,
    joinedAt: "2025-03-01",
    lastActive: "40 mins ago",
    status: "active",
    bio: "Merchandise logistics and order supervisor.",
  },
  // Registered Community / Fan Users (Consumer Accounts)
  {
    id: "usr-yuna",
    username: "yuna_music",
    displayName: "Yuna Park",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/yuna.webp",
    points: 1850,
    joinedAt: "2025-04-12",
    lastActive: "2 hrs ago",
    status: "active",
  },
  {
    id: "usr-taehyun",
    username: "taehyun_fan",
    displayName: "Taehyun Starlight",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/taehyun.webp",
    points: 920,
    joinedAt: "2025-05-02",
    lastActive: "15 mins ago",
    status: "active",
  },
  {
    id: "usr-jxnnie",
    username: "jxnnie_glow",
    displayName: "Jennie K",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/jxnnie.webp",
    points: 3410,
    joinedAt: "2025-03-18",
    lastActive: "Just now",
    status: "active",
  },
  {
    id: "usr-kairos",
    username: "kairos_orbit",
    displayName: "Kairos Fanclub",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/kairos.webp",
    points: 1540,
    joinedAt: "2025-05-19",
    lastActive: "3 hrs ago",
    status: "active",
  },
  {
    id: "usr-ari",
    username: "ari_beats",
    displayName: "Ariana V",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/ari.webp",
    points: 620,
    joinedAt: "2025-06-01",
    lastActive: "1 day ago",
    status: "active",
  },
  {
    id: "usr-jun",
    username: "jun_listener",
    displayName: "Jun Song",
    role: "user",
    permissions: getDefaultPermissions("user"),
    avatar: "/assets/photos/listeners/jun.webp",
    points: 210,
    joinedAt: "2025-06-10",
    lastActive: "Yesterday",
    status: "active",
  },
];

function seedComments(news: NewsItem[]): AdminCommentRecord[] {
  const records: AdminCommentRecord[] = [];

  for (const n of news) {
    for (const c of n.comments) {
      const isRep = c.id === "c8";
      const isFresh = c.id === "c1" || c.id === "c5";
      records.push({
        id: `cm-news-${c.id}`,
        sourceType: "news",
        targetId: n.id,
        targetTitle: n.title,
        author: c.author,
        handle: c.handle,
        text: c.text,
        time: c.time,
        likes: c.likes,
        status: isRep ? "reported" : (isFresh ? "pending" : "approved"),
        reportReason: isRep ? "Spam / off-topic controversy" : undefined,
        repliesCount: c.replies?.length ?? 0,
        isNew: isFresh,
        isReviewed: !isFresh && !isRep,
      });
    }
  }

  records.push(
    {
      id: "cm-track-103",
      sourceType: "track",
      targetId: "tr1",
      targetTitle: "Midnight Seoul",
      author: "Taehyun",
      handle: "@taehyun_v",
      text: "صدای ووکال در این قطعه واقعاً فوق‌العاده ضبط شده، بهترین ترک امسال است!",
      time: "Just now",
      likes: 5,
      status: "pending",
      repliesCount: 0,
      isNew: true,
      isReviewed: false,
    },
    {
      id: "cm-track-104",
      sourceType: "track",
      targetId: "tr3",
      targetTitle: "Neon Bloom",
      author: "Jennie K",
      handle: "@jxnnie_glow",
      text: "عاشق ریتم بیس و درام‌های لایو این آهنگم، پلی‌لیست باشگاه من شده.",
      time: "2 min ago",
      likes: 12,
      status: "pending",
      repliesCount: 1,
      isNew: true,
      isReviewed: false,
    },
    {
      id: "cm-track-101",
      sourceType: "track",
      targetId: "tr1",
      targetTitle: "Midnight Seoul",
      author: "Haru",
      handle: "@haru_beats",
      text: "The synthesizer breakdown in the bridge gives chills every single listen.",
      time: "20 min ago",
      likes: 42,
      status: "approved",
      repliesCount: 3,
      isNew: false,
      isReviewed: true,
    },
    {
      id: "cm-track-102",
      sourceType: "track",
      targetId: "tr2",
      targetTitle: "Afterglow",
      author: "SpamBot99",
      handle: "@spam_promo",
      text: "Check out free followers and streaming bots on my profile link!",
      time: "5 min ago",
      likes: 0,
      status: "reported",
      reportReason: "Unsolicited promotional spam",
      repliesCount: 0,
      isNew: false,
      isReviewed: false,
    },
  );

  return records;
}

function seedLyricSubmissions(): LyricSubmission[] {
  return [
    {
      id: "sub-1",
      trackId: "tr-blue-signal",
      trackTitle: "Blue Signal",
      language: "한국어",
      lines: 3,
      points: 18,
      status: "pending",
      sentAt: "1 hr ago",
      original: "[00:12.4] Signal in the blue rain\n[00:16.8] Neon lights fading away\n[00:21.0] Do you hear me calling back?",
      translation: "[00:12.4] سیگنال در باران آبی\n[00:16.8] نورهای نئونی در حال محو شدن\n[00:21.0] صدای من را می‌شنوی؟",
    },
    {
      id: "sub-2",
      trackId: "tr-paper-boats",
      trackTitle: "Paper Boats",
      language: "Mixed",
      lines: 2,
      points: 18,
      status: "pending",
      sentAt: "4 hrs ago",
      original: "[00:08.5] Folding down the origami river\n[00:14.2] Whispering memories into the tide",
      translation: "[00:08.5] قایق‌های کاغذی روی رودخانه\n[00:14.2] زمزمه خاطرات با جریان آب",
    },
    {
      id: "sub-3",
      trackId: "nt7",
      trackTitle: "Afterimage",
      language: "English",
      lines: 2,
      points: 18,
      status: "approved",
      sentAt: "Yesterday",
      original: "[00:10.0] The silhouette against the glass\n[00:15.5] Electric dreams that never pass",
      translation: "[00:10.0] سایه‌ای پشت شیشه\n[00:15.5] رویاهای بی‌پایان",
    },
  ];
}

function createInitialState(): AdminDbState {
  const rawNews = JSON.parse(JSON.stringify(initialNews)) as NewsItem[];
  const news: AdminNews[] = rawNews.map((n, idx) => ({
    ...n,
    status: idx === 0 ? "published" : "published",
  }));

  const rawTracks = JSON.parse(JSON.stringify(initialTracks)) as PlayerTrack[];
  const tracks: AdminTrack[] = rawTracks.map((t) => ({
    ...t,
    isSingle: t.album.toLowerCase().includes("single"),
  }));

  const artists = JSON.parse(JSON.stringify(initialArtists)) as Artist[];
  const rawAlbums = JSON.parse(JSON.stringify(initialAlbums)) as Album[];
  const rawPlaylists = JSON.parse(JSON.stringify(initialPlaylists)) as Playlist[];
  const shop = JSON.parse(JSON.stringify(initialShop)) as ShopProduct[];

  // Connect tracks to albums
  const albums: AdminAlbum[] = rawAlbums.map((alb) => {
    const matchingTracks = tracks.filter((t) =>
      t.album.toLowerCase().includes(alb.title.toLowerCase()) ||
      alb.title.toLowerCase().includes(t.album.toLowerCase()),
    );
    return {
      ...alb,
      trackIds: matchingTracks.map((t) => t.id),
      tracks: matchingTracks.length || alb.tracks,
    };
  });

  const playlists: AdminPlaylist[] = rawPlaylists.map((pl, idx) => ({
    ...pl,
    trackIds: tracks.slice(idx * 2, idx * 2 + 4).map((t) => t.id),
  }));

  const lyricsByTrack: Record<string, { original: string; translation?: string }> = {
    sm1: {
      original: "[00:00] 느린 영화처럼 천천히\n[00:14] Slow motion, we don’t have to run\n[00:30] 네 손끝이 내일을 그려\n[00:52] Hold the frame a little longer\n[01:18] 우리는 천천히 번져가",
      translation: "[00:00] مثل یه فیلمِ کُند، آروم‌آروم\n[00:14] اسلوموشن، لازم نیست بدویم\n[00:30] نوک انگشتات فردا رو می‌کشه\n[00:52] این قاب رو یکم بیشتر نگه دار\n[01:18] ما آروم‌آروم پخش می‌شیم",
    },
    nt1: {
      original: "[00:12] Golden light across the city\n[00:24] Whispers in the evening breeze\n[00:40] Every moment still belongs to you",
      translation: "[00:12] نور طلایی بر فراز شهر\n[00:24] زمزمه‌ها در نسیم شامگاهی\n[00:40] هر لحظه هنوز متعلق به توست",
    },
    nt2: {
      original: "[00:10] Neon signs in midnight Seoul\n[00:22] Lost inside the rainy avenue\n[00:38] Footsteps echo in the night",
      translation: "[00:10] تابلوهای نئونی در سئول نیمه‌شب\n[00:22] گم‌شده در خیابان بارانی\n[00:38] پژواک قدم‌ها در دل شب",
    },
  };

  return {
    artists,
    albums,
    tracks,
    playlists,
    news,
    comments: seedComments(rawNews),
    contentRequests: seedContentRequests(),
    lyricsSubmissions: seedLyricSubmissions(),
    lyricsByTrack,
    shop,
    users: SEED_USERS,
    settings: DEFAULT_SETTINGS,
    activities: [
      {
        id: "act-1",
        timestamp: "Just now",
        adminUser: "admin",
        action: "System Initialized",
        entityType: "user",
        entityId: "system",
        details: "FAIMESS Administrative Control System live and synchronized.",
      },
      {
        id: "act-2",
        timestamp: "10 mins ago",
        adminUser: "comm_mod",
        action: "Comment Flagged",
        entityType: "comment",
        entityId: "cm-track-102",
        details: "Flagged promotional link under track Midnight Seoul.",
      },
    ],
    metrics: {
      dailyStreams: [
        { day: "Sat", streams: 14200, listeners: 3800 },
        { day: "Sun", streams: 16800, listeners: 4200 },
        { day: "Mon", streams: 19100, listeners: 4900 },
        { day: "Tue", streams: 22400, listeners: 5600 },
        { day: "Wed", streams: 24800, listeners: 6100 },
        { day: "Thu", streams: 28500, listeners: 7200 },
        { day: "Fri", streams: 34200, listeners: 8900 },
      ],
    },
  };
}

function seedContentRequests(): ContentRequest[] {
  return [
    {
      id: "req-1",
      type: "track",
      title: "Supernova",
      artistName: "aespa",
      notes: "لطفاً این آهنگ معروف را به شلف آهنگ‌های ترند اضافه کنید، لیریک کره ای و فارسی رو هم بگذارید.",
      requestedBy: "yuna_music",
      requestedByDisplay: "Yuna Park",
      avatar: "/assets/photos/listeners/yuna.webp",
      submittedAt: "2 hrs ago",
      status: "pending",
    },
    {
      id: "req-2",
      type: "album",
      title: "Armageddon",
      artistName: "aespa",
      notes: "فول آلبوم جدید همراه با تمام ترک‌های جانبی با کیفیت بالا",
      requestedBy: "jxnnie_glow",
      requestedByDisplay: "Jennie K",
      avatar: "/assets/photos/listeners/jxnnie.webp",
      submittedAt: "1 day ago",
      status: "fulfilled",
      adminResponse: "آلبوم با موفقیت در دیسکوگرافی سایت قرار گرفت. ۲۵ امتیاز به حساب شما اضافه شد!",
    },
    {
      id: "req-3",
      type: "lyrics",
      title: "Midnight Seoul (Acoustic)",
      artistName: "AXION",
      notes: "نسخه آکوستیک زنده نیازمند لیریک ترجمه شده اختصاصی است.",
      requestedBy: "taehyun_fan",
      requestedByDisplay: "Taehyun Starlight",
      avatar: "/assets/photos/listeners/taehyun.webp",
      submittedAt: "Yesterday",
      status: "pending",
    },
  ];
}

/* ---------------- In-Memory Store & Persistence -------------------- */

function loadStoredState(): AdminDbState {
  if (typeof window === "undefined") {
    return createInitialState();
  }
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = createInitialState();
      window.localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AdminDbState>;
    const initial = createInitialState();
    return {
      artists: parsed.artists?.length ? parsed.artists : initial.artists,
      albums: parsed.albums?.length ? (parsed.albums as AdminAlbum[]) : initial.albums,
      tracks: parsed.tracks?.length ? (parsed.tracks as AdminTrack[]) : initial.tracks,
      playlists: parsed.playlists?.length ? (parsed.playlists as AdminPlaylist[]) : initial.playlists,
      news: parsed.news?.length ? (parsed.news as AdminNews[]) : initial.news,
      comments: parsed.comments?.length ? parsed.comments : initial.comments,
      contentRequests: parsed.contentRequests?.length ? parsed.contentRequests : initial.contentRequests,
      lyricsSubmissions: parsed.lyricsSubmissions?.length ? parsed.lyricsSubmissions : initial.lyricsSubmissions,
      lyricsByTrack: parsed.lyricsByTrack ?? initial.lyricsByTrack,
      shop: parsed.shop?.length ? parsed.shop : initial.shop,
      users: parsed.users?.length ? parsed.users : initial.users,
      settings: parsed.settings ?? initial.settings,
      activities: parsed.activities?.length ? parsed.activities : initial.activities,
      metrics: parsed.metrics ?? initial.metrics,
    };
  } catch (err) {
    console.warn("FAIMESS Admin DB restore fallback:", err);
    return createInitialState();
  }
}

let state: AdminDbState = loadStoredState();
type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

function notifyChanges() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("FAIMESS Admin DB persist failed:", err);
    }
  }
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Admin subscriber error:", e);
    }
  });
}

function logActivity(
  adminUser: string,
  action: string,
  entityType: AdminActivityLog["entityType"],
  entityId: string,
  details: string,
) {
  const entry: AdminActivityLog = {
    id: `act-${Date.now()}`,
    timestamp: "Just now",
    adminUser,
    action,
    entityType,
    entityId,
    details,
  };
  state.activities = [entry, ...state.activities.slice(0, 49)];
}

/* ------------------------- Admin API ------------------------------- */

export const adminApi = {
  subscribe(fn: ChangeListener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  resetDatabase() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DB_KEY);
    }
    state = createInitialState();
    notifyChanges();
  },

  exportDatabaseJson(): string {
    return JSON.stringify(state, null, 2);
  },

  importDatabaseJson(rawJson: string): boolean {
    try {
      const parsed = JSON.parse(rawJson) as AdminDbState;
      if (!parsed.tracks || !parsed.artists || !parsed.albums) {
        return false;
      }
      state = {
        ...parsed,
        settings: parsed.settings || DEFAULT_SETTINGS,
      };
      notifyChanges();
      return true;
    } catch {
      return false;
    }
  },

  /* ---------------- Site Visibility Settings -------- */

  getSiteSettings(): SiteFeatureSettings {
    return { ...DEFAULT_SETTINGS, ...(state.settings || {}) };
  },

  updateSiteSettings(updates: Partial<SiteFeatureSettings>) {
    state.settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}), ...updates };
    logActivity("super_admin", "Updated Site Configuration", "settings", "site_config", "Modified site 0-to-100 configuration");
    notifyChanges();

    if (typeof document !== "undefined") {
      if (state.settings.browserTitle) {
        document.title = state.settings.browserTitle;
      }
      if (state.settings.primaryColor) {
        document.documentElement.style.setProperty("--color-primary", state.settings.primaryColor);
      }
      if (state.settings.accentColor) {
        document.documentElement.style.setProperty("--color-primary-deep", state.settings.accentColor);
      }
    }
    return state.settings;
  },

  /* ---------------- Overview & Master Analytics ----- */

  getOverviewStats(): AdminOverviewStats {
    const totalStreams = state.tracks.reduce((acc, t) => acc + (t.plays ?? 1000), 0);
    const totalRev = state.shop.reduce((acc, p) => acc + p.price * 24, 0);
    const pendingLyricsCount = state.lyricsSubmissions.filter((s) => s.status === "pending").length;
    const reportedCount = state.comments.filter((c) => c.status === "reported").length;
    const pendingNewsCount = state.news.filter((n) => n.status === "pending_review").length;
    const unreviewedCount = state.comments.filter((c) => c.isNew && !c.isReviewed).length;
    const pendingRequestsCount = (state.contentRequests ?? []).filter((r) => r.status === "pending").length;

    return {
      totalTracks: state.tracks.length,
      totalArtists: state.artists.length,
      totalAlbums: state.albums.length,
      totalPlaylists: state.playlists.length,
      totalNews: state.news.length,
      pendingNews: pendingNewsCount,
      totalComments: state.comments.length,
      reportedComments: reportedCount,
      unreviewedComments: unreviewedCount,
      pendingLyrics: pendingLyricsCount,
      pendingRequests: pendingRequestsCount,
      totalShopProducts: state.shop.length,
      totalUsers: state.users.length,
      activeListenersToday: 8940,
      onlineUsers: 438,
      pageViewsToday: 48250,
      pageViewsWeek: 294100,
      pageViewsTotal: 1480000,
      commentsToday: 38,
      commentsWeek: 245,
      newUsersWeek: 84,
      streamsToday: 34200,
      streamsWeek: 160200,
      totalStreams,
      totalPointsDistributed: state.users.reduce((acc, u) => acc + u.points, 0),
      estimatedRevenueToman: totalRev,
    };
  },

  getStreamChart() {
    return state.metrics.dailyStreams;
  },

  getRecentActivities() {
    return state.activities;
  },

  /* ---------------- Tracks API ---------------------- */

  getTracks(query = "", artistFilter = "", albumFilter = "") {
    let result = [...state.tracks];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q),
      );
    }
    if (artistFilter) {
      result = result.filter((t) => t.artist === artistFilter);
    }
    if (albumFilter) {
      result = result.filter((t) => t.album === albumFilter);
    }
    return result;
  },

  getTrack(id: string) {
    return state.tracks.find((t) => t.id === id) ?? null;
  },

  createTrack(data: {
    title: string;
    artist: string;
    album: string;
    duration: string;
    photo?: string;
    audio?: string;
    lyricsOriginal?: string;
    lyricsTranslation?: string;
    plays?: number;
    isSingle?: boolean;
  }) {
    const id = `tr-${Date.now().toString(36)}`;
    const isSingle = Boolean(data.isSingle || data.album === "· single");
    const newTrack: AdminTrack = {
      id,
      title: data.title,
      artist: data.artist,
      album: isSingle ? "· single" : data.album,
      seconds: toSeconds(data.duration),
      photo: data.photo || "/assets/photos/albums/afterglow.webp",
      audio: data.audio || "/assets/audio/faimess-demo.mp3",
      plays: data.plays ?? 120,
      isSingle,
    };
    state.tracks = [newTrack, ...state.tracks];

    // Store lyrics if provided
    if (data.lyricsOriginal) {
      state.lyricsByTrack[id] = {
        original: data.lyricsOriginal,
        translation: data.lyricsTranslation,
      };
    }

    // Connect to album if not a single
    if (!isSingle && data.album && data.album !== "· single") {
      const alb = state.albums.find(
        (a) => a.title.toLowerCase() === data.album.toLowerCase(),
      );
      if (alb) {
        alb.trackIds = [...(alb.trackIds || []), id];
        alb.tracks = alb.trackIds.length;
      }
    }

    logActivity("music_curator", "Added Song", "track", id, `Published ${isSingle ? "single " : ""}track "${data.title}" by ${data.artist}`);
    notifyChanges();
    return newTrack;
  },

  updateTrack(
    id: string,
    updates: Partial<AdminTrack> & {
      duration?: string;
      lyricsOriginal?: string;
      lyricsTranslation?: string;
      isSingle?: boolean;
    },
  ) {
    const idx = state.tracks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const oldTrack = state.tracks[idx];

    const isSingle = updates.isSingle !== undefined
      ? updates.isSingle
      : updates.album === "· single"
        ? true
        : oldTrack.isSingle;

    const newAlbum = isSingle ? "· single" : (updates.album ?? oldTrack.album);

    const newSeconds = updates.duration
      ? toSeconds(updates.duration)
      : updates.seconds ?? oldTrack.seconds;

    const updatedTrack: AdminTrack = {
      ...oldTrack,
      ...updates,
      album: newAlbum,
      seconds: newSeconds,
      isSingle,
    };
    state.tracks[idx] = updatedTrack;

    if (updates.lyricsOriginal !== undefined) {
      state.lyricsByTrack[id] = {
        original: updates.lyricsOriginal,
        translation: updates.lyricsTranslation,
      };
    }

    // Sync album trackIds
    if (newAlbum !== oldTrack.album) {
      const prevAlb = state.albums.find(
        (a) => a.title.toLowerCase() === oldTrack.album.toLowerCase(),
      );
      if (prevAlb && prevAlb.trackIds) {
        prevAlb.trackIds = prevAlb.trackIds.filter((tid) => tid !== id);
        prevAlb.tracks = prevAlb.trackIds.length;
      }
      if (!isSingle && newAlbum !== "· single") {
        const nextAlb = state.albums.find(
          (a) => a.title.toLowerCase() === newAlbum.toLowerCase(),
        );
        if (nextAlb) {
          nextAlb.trackIds = [...(nextAlb.trackIds || []), id];
          nextAlb.tracks = nextAlb.trackIds.length;
        }
      }
    }

    logActivity("music_curator", "Updated Song", "track", id, `Modified track details for "${updatedTrack.title}"`);
    notifyChanges();
    return updatedTrack;
  },

  deleteTrack(id: string) {
    const target = state.tracks.find((t) => t.id === id);
    state.tracks = state.tracks.filter((t) => t.id !== id);
    for (const alb of state.albums) {
      if (alb.trackIds) {
        alb.trackIds = alb.trackIds.filter((tid) => tid !== id);
        alb.tracks = alb.trackIds.length;
      }
    }
    for (const pl of state.playlists) {
      if (pl.trackIds) {
        pl.trackIds = pl.trackIds.filter((tid) => tid !== id);
        pl.tracks = pl.trackIds.length;
      }
    }
    delete state.lyricsByTrack[id];
    if (target) {
      logActivity("music_curator", "Deleted Song", "track", id, `Removed track "${target.title}"`);
    }
    notifyChanges();
  },

  getTrackLyrics(trackId: string) {
    return state.lyricsByTrack[trackId] ?? null;
  },

  saveTrackLyrics(trackId: string, original: string, translation?: string) {
    state.lyricsByTrack[trackId] = { original, translation };
    logActivity("music_curator", "Updated Lyrics", "lyrics", trackId, `Saved updated lyric sheet for track "${trackId}"`);
    notifyChanges();
  },

  /* ---------------- Artists API --------------------- */

  getArtists(query = "") {
    const q = query.trim().toLowerCase();
    if (!q) return [...state.artists];
    return state.artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q) ||
        a.kind.toLowerCase().includes(q),
    );
  },

  getArtist(id: string) {
    return state.artists.find((a) => a.id === id) ?? null;
  },

  createArtist(data: {
    name: string;
    kind: Artist["kind"];
    genre: string;
    photo?: string;
    verified?: boolean;
    newRelease?: boolean;
  }) {
    const id = `ar-${Date.now().toString(36)}`;
    const newArtist: Artist = {
      id,
      name: data.name,
      initials: data.name.slice(0, 2).toUpperCase(),
      kind: data.kind,
      genre: data.genre,
      listeners: "1.2M monthly",
      followers: "540K followers",
      following: false,
      newRelease: Boolean(data.newRelease),
      verified: Boolean(data.verified),
      seed: state.artists.length % 8,
      photo: data.photo || "/assets/photos/artists/novae.webp",
    };
    state.artists = [newArtist, ...state.artists];
    logActivity("music_curator", "Added Artist", "artist", id, `Added artist profile "${data.name}"`);
    notifyChanges();
    return newArtist;
  },

  updateArtist(id: string, updates: Partial<Artist>) {
    const idx = state.artists.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    state.artists[idx] = { ...state.artists[idx], ...updates };
    logActivity("music_curator", "Updated Artist", "artist", id, `Updated artist profile "${state.artists[idx].name}"`);
    notifyChanges();
    return state.artists[idx];
  },

  deleteArtist(id: string) {
    const target = state.artists.find((a) => a.id === id);
    state.artists = state.artists.filter((a) => a.id !== id);
    if (target) {
      logActivity("music_curator", "Deleted Artist", "artist", id, `Removed artist "${target.name}"`);
    }
    notifyChanges();
  },

  toggleArtistVerified(id: string) {
    const a = state.artists.find((item) => item.id === id);
    if (a) {
      a.verified = !a.verified;
      logActivity("music_curator", "Toggled Badge", "artist", id, `Verified status: ${a.verified}`);
      notifyChanges();
    }
  },

  toggleArtistNewRelease(id: string) {
    const a = state.artists.find((item) => item.id === id);
    if (a) {
      a.newRelease = !a.newRelease;
      logActivity("music_curator", "Toggled New Release", "artist", id, `New release status: ${a.newRelease}`);
      notifyChanges();
    }
  },

  /* ---------------- Albums API ---------------------- */

  getAlbums(query = "") {
    const q = query.trim().toLowerCase();
    if (!q) return [...state.albums];
    return state.albums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q),
    );
  },

  getAlbum(id: string) {
    return state.albums.find((a) => a.id === id) ?? null;
  },

  createAlbum(data: {
    title: string;
    artist: string;
    year: number;
    tracks?: number;
    photo?: string;
    trackIds?: string[];
  }) {
    const id = `al-${Date.now().toString(36)}`;
    const trackIds = data.trackIds ?? [];
    const newAlbum: AdminAlbum = {
      id,
      title: data.title,
      artist: data.artist,
      year: data.year,
      tracks: trackIds.length || data.tracks || 1,
      released: "Today",
      seed: state.albums.length % 8,
      photo: data.photo || "/assets/photos/albums/afterglow.webp",
      trackIds,
    };
    state.albums = [newAlbum, ...state.albums];

    // Synchronize selected tracks
    if (trackIds.length > 0) {
      for (const t of state.tracks) {
        if (trackIds.includes(t.id)) {
          t.album = data.title;
          t.isSingle = false;
        }
      }
    }

    logActivity("music_curator", "Created Album", "album", id, `Published album "${data.title}" by ${data.artist} (${trackIds.length} tracks)`);
    notifyChanges();
    return newAlbum;
  },

  updateAlbum(id: string, updates: Partial<AdminAlbum> & { trackIds?: string[] }) {
    const idx = state.albums.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const oldTitle = state.albums[idx].title;
    const oldTrackIds = state.albums[idx].trackIds || [];

    const updatedTrackIds = updates.trackIds ?? oldTrackIds;
    const updatedAlbum: AdminAlbum = {
      ...state.albums[idx],
      ...updates,
      trackIds: updatedTrackIds,
      tracks: updatedTrackIds.length || updates.tracks || state.albums[idx].tracks,
    };
    state.albums[idx] = updatedAlbum;

    // Synchronize tracks
    for (const t of state.tracks) {
      if (updatedTrackIds.includes(t.id)) {
        t.album = updatedAlbum.title;
        t.isSingle = false;
      } else if (oldTrackIds.includes(t.id) && !updatedTrackIds.includes(t.id)) {
        if (t.album === oldTitle) {
          t.album = "· single";
          t.isSingle = true;
        }
      }
    }

    logActivity("music_curator", "Updated Album", "album", id, `Modified album "${updatedAlbum.title}" (${updatedTrackIds.length} tracks)`);
    notifyChanges();
    return updatedAlbum;
  },

  deleteAlbum(id: string) {
    const target = state.albums.find((a) => a.id === id);
    state.albums = state.albums.filter((a) => a.id !== id);
    if (target) {
      for (const t of state.tracks) {
        if (t.album === target.title) {
          t.album = "· single";
          t.isSingle = true;
        }
      }
      logActivity("music_curator", "Deleted Album", "album", id, `Removed album "${target.title}"`);
    }
    notifyChanges();
  },

  /* ---------------- Playlists API ------------------- */

  getPlaylists(query = "") {
    const q = query.trim().toLowerCase();
    if (!q) return [...state.playlists];
    return state.playlists.filter(
      (p) => p.name.toLowerCase().includes(q) || p.curator.toLowerCase().includes(q),
    );
  },

  getPlaylist(id: string) {
    return state.playlists.find((p) => p.id === id) ?? null;
  },

  createPlaylist(data: {
    name: string;
    curator: string;
    mood: string;
    photo?: string;
    tracks?: number;
    trackIds?: string[];
  }) {
    const id = `pl-${Date.now().toString(36)}`;
    const trackIds = data.trackIds ?? [];
    const newPlaylist: AdminPlaylist = {
      id,
      name: data.name,
      curator: data.curator,
      mood: data.mood,
      tracks: trackIds.length || data.tracks || 10,
      duration: `${(trackIds.length || 10) * 3} mins`,
      seed: state.playlists.length % 8,
      photo: data.photo || "/assets/photos/playlists/golden-hour.webp",
      trackIds,
    };
    state.playlists = [newPlaylist, ...state.playlists];
    logActivity("music_curator", "Created Playlist", "playlist", id, `Created playlist "${data.name}" (${trackIds.length} tracks)`);
    notifyChanges();
    return newPlaylist;
  },

  updatePlaylist(id: string, updates: Partial<AdminPlaylist> & { trackIds?: string[] }) {
    const idx = state.playlists.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const updatedTrackIds = updates.trackIds ?? state.playlists[idx].trackIds ?? [];
    state.playlists[idx] = {
      ...state.playlists[idx],
      ...updates,
      trackIds: updatedTrackIds,
      tracks: updatedTrackIds.length || updates.tracks || state.playlists[idx].tracks,
    };
    logActivity("music_curator", "Updated Playlist", "playlist", id, `Updated playlist "${state.playlists[idx].name}"`);
    notifyChanges();
    return state.playlists[idx];
  },

  deletePlaylist(id: string) {
    const target = state.playlists.find((p) => p.id === id);
    state.playlists = state.playlists.filter((p) => p.id !== id);
    if (target) {
      logActivity("music_curator", "Deleted Playlist", "playlist", id, `Removed playlist "${target.name}"`);
    }
    notifyChanges();
  },

  /* ---------------- News & Editorial API ------------ */

  getNews(query = "", statusFilter: "all" | "published" | "pending_review" = "all") {
    let result = [...state.news];
    if (statusFilter !== "all") {
      result = result.filter((n) => (n.status || "published") === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.tag.toLowerCase().includes(q),
      );
    }
    return result;
  },

  getNewsItem(id: string) {
    return state.news.find((n) => n.id === id) ?? null;
  },

  createNews(data: {
    title: string;
    excerpt: string;
    authorName?: string;
    tag?: "Comeback" | "Tour" | "Charts" | "Editorial" | "Awards";
    photo?: string;
    featured?: boolean;
    body?: string;
    status?: "published" | "pending_review";
  }) {
    const id = `nw-${Date.now().toString(36)}`;
    const tag = data.tag || "Tour";
    const status = data.status || "published";
    const newArticle: AdminNews = {
      id,
      title: data.title,
      excerpt: data.excerpt,
      author: {
        name: data.authorName || "FAIMESS Editorial",
        role: "Staff Columnist",
        avatar: "/assets/photos/account/me.webp",
        seed: 1,
      },
      ago: "Just now",
      tag,
      source: "FAIMESS Studio",
      scene: "sunset",
      seed: state.news.length % 6,
      likes: 12,
      views: 1200,
      commentsCount: 0,
      bodyKeys: [data.body || data.excerpt],
      photo: data.photo || "/assets/photos/banners/asia-leg.webp",
      comments: [],
      status,
    };
    state.news = [newArticle, ...state.news];
    logActivity(
      status === "published" ? "news_manager" : "news_author",
      status === "published" ? "Published Story" : "Submitted Draft",
      "news",
      id,
      `${status === "published" ? "Published" : "Drafted"} story "${data.title}"`,
    );
    notifyChanges();
    return newArticle;
  },

  updateNews(id: string, updates: Partial<AdminNews>) {
    const idx = state.news.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    state.news[idx] = { ...state.news[idx], ...updates };
    logActivity("news_manager", "Updated Story", "news", id, `Modified story "${state.news[idx].title}"`);
    notifyChanges();
    return state.news[idx];
  },

  approveNews(id: string) {
    const n = state.news.find((item) => item.id === id);
    if (n) {
      n.status = "published";
      logActivity("news_manager", "Approved & Published Story", "news", id, `Approved article "${n.title}"`);
      notifyChanges();
    }
  },

  deleteNews(id: string) {
    const target = state.news.find((n) => n.id === id);
    state.news = state.news.filter((n) => n.id !== id);
    if (target) {
      logActivity("news_manager", "Deleted Story", "news", id, `Removed news article "${target.title}"`);
    }
    notifyChanges();
  },

  /* ---------------- Comments Moderation API --------- */

  getComments(filter: "all" | "reported" | "approved" | "new" | "reviewed" = "all", query = "") {
    let result = [...state.comments];
    if (filter === "reported") {
      result = result.filter((c) => c.status === "reported");
    } else if (filter === "approved") {
      result = result.filter((c) => c.status === "approved");
    } else if (filter === "new") {
      result = result.filter((c) => c.isNew && !c.isReviewed);
    } else if (filter === "reviewed") {
      result = result.filter((c) => c.isReviewed);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.targetTitle.toLowerCase().includes(q),
      );
    }
    return result;
  },

  markCommentReviewed(id: string) {
    const c = state.comments.find((item) => item.id === id);
    if (c) {
      c.isReviewed = true;
      c.isNew = false;
      c.status = "approved";
      c.reportReason = undefined;
      logActivity("comment_moderator", "Reviewed & Approved Comment", "comment", id, `Marked comment by @${c.handle} as reviewed`);
      notifyChanges();
    }
  },

  markAllCommentsReviewed() {
    for (const c of state.comments) {
      c.isReviewed = true;
      c.isNew = false;
      if (c.status === "pending") c.status = "approved";
    }
    logActivity("comment_moderator", "Bulk Approved Comments", "comment", "all", "Marked all active comments as reviewed and unhighlighted");
    notifyChanges();
  },

  approveComment(id: string) {
    const c = state.comments.find((item) => item.id === id);
    if (c) {
      c.status = "approved";
      c.isReviewed = true;
      c.isNew = false;
      c.reportReason = undefined;
      logActivity("comment_moderator", "Approved Comment", "comment", id, `Restored comment by @${c.handle}`);
      notifyChanges();
    }
  },

  flagComment(id: string, reason: string) {
    const c = state.comments.find((item) => item.id === id);
    if (c) {
      c.status = "reported";
      c.reportReason = reason;
      logActivity("comment_moderator", "Flagged Comment", "comment", id, `Flagged for: ${reason}`);
      notifyChanges();
    }
  },

  deleteComment(id: string, cascadeReplies = true) {
    const target = state.comments.find((c) => c.id === id);
    state.comments = state.comments.filter((c) => c.id !== id);
    if (target) {
      logActivity("comment_moderator", "Deleted Comment", "comment", id, `Removed comment by @${target.handle}${cascadeReplies ? " with replies" : ""}`);
    }
    notifyChanges();
  },

  addComment(data: {
    sourceType: "track" | "news";
    targetId: string;
    targetTitle: string;
    author: string;
    handle: string;
    text: string;
  }) {
    const id = `cm-live-${Date.now().toString(36)}`;
    const newRecord: AdminCommentRecord = {
      id,
      sourceType: data.sourceType,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
      author: data.author,
      handle: data.handle,
      text: data.text,
      time: "Just now",
      likes: 0,
      status: "pending",
      repliesCount: 0,
      isNew: true,
      isReviewed: false,
    };
    state.comments = [newRecord, ...state.comments];
    notifyChanges();
    return newRecord;
  },

  /* ---------------- Content Requests API ------------ */

  getContentRequests(filter: "all" | "pending" | "fulfilled" | "rejected" = "all", query = "") {
    let result = [...(state.contentRequests ?? [])];
    if (filter !== "all") {
      result = result.filter((r) => r.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.artistName.toLowerCase().includes(q) ||
          r.requestedBy.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q)),
      );
    }
    return result;
  },

  submitContentRequest(data: {
    type: ContentRequestType;
    title: string;
    artistName: string;
    notes?: string;
    requestedBy?: string;
    requestedByDisplay?: string;
    avatar?: string;
  }) {
    const id = `req-${Date.now().toString(36)}`;
    const newReq: ContentRequest = {
      id,
      type: data.type,
      title: data.title.trim(),
      artistName: data.artistName.trim(),
      notes: data.notes?.trim(),
      requestedBy: data.requestedBy || "current_user",
      requestedByDisplay: data.requestedByDisplay || "Fan Member",
      avatar: data.avatar || "/assets/photos/account/me.webp",
      submittedAt: "Just now",
      status: "pending",
    };
    state.contentRequests = [newReq, ...(state.contentRequests ?? [])];
    logActivity("user", "Submitted Request", "track", id, `Requested ${data.type} "${data.title}" by ${data.artistName}`);
    notifyChanges();
    return newReq;
  },

  fulfillContentRequest(id: string, response = "درخواست شما بررسی و به کاتالوگ سایت اضافه شد. ۲۵ امتیاز به حساب شما افزوده شد!") {
    const r = (state.contentRequests ?? []).find((item) => item.id === id);
    if (r) {
      r.status = "fulfilled";
      r.adminResponse = response;

      // Reward the user 25 points if user exists
      const user = state.users.find((u) => u.username.toLowerCase() === r.requestedBy.toLowerCase());
      if (user) {
        user.points += 25;
      }

      logActivity("music_curator", "Fulfilled Fan Request", "track", id, `Fulfilled request "${r.title}" for @${r.requestedBy} (+25 pts)`);
      notifyChanges();
    }
  },

  rejectContentRequest(id: string, response = "متاسفانه به دلیل عدم انتشار رسمی یا محدودیت کپی‌رایت امکان افزودن این اثر وجود ندارد.") {
    const r = (state.contentRequests ?? []).find((item) => item.id === id);
    if (r) {
      r.status = "rejected";
      r.adminResponse = response;
      logActivity("music_curator", "Rejected Fan Request", "track", id, `Rejected request "${r.title}"`);
      notifyChanges();
    }
  },

  deleteContentRequest(id: string) {
    state.contentRequests = (state.contentRequests ?? []).filter((r) => r.id !== id);
    notifyChanges();
  },

  /* ---------------- Lyric Submissions API ----------- */

  getLyricSubmissions(statusFilter?: "all" | "pending" | "approved" | "rejected") {
    if (!statusFilter || statusFilter === "all") return [...state.lyricsSubmissions];
    return state.lyricsSubmissions.filter((s) => s.status === statusFilter);
  },

  approveLyricSubmission(id: string, payout = 18) {
    const sub = state.lyricsSubmissions.find((s) => s.id === id);
    if (sub) {
      sub.status = "approved";
      sub.points = payout;
      state.lyricsByTrack[sub.trackId] = {
        original: sub.original,
        translation: sub.translation,
      };
      logActivity("music_curator", "Approved Lyrics Sheet", "lyrics", id, `Approved lyrics for "${sub.trackTitle}" (+${payout} pts)`);
      notifyChanges();
    }
  },

  rejectLyricSubmission(id: string) {
    const sub = state.lyricsSubmissions.find((s) => s.id === id);
    if (sub) {
      sub.status = "rejected";
      logActivity("music_curator", "Rejected Lyrics Sheet", "lyrics", id, `Rejected lyrics for "${sub.trackTitle}"`);
      notifyChanges();
    }
  },

  /* ---------------- Shop & Inventory API ------------ */

  getProducts(query = "", categoryFilter = "all") {
    let result = [...state.shop];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    return result;
  },

  createProduct(data: {
    name: string;
    category: Exclude<ShopCategoryId, "all">;
    price: number;
    wasPrice?: number;
    badge?: ShopBadge;
    photo?: string;
  }) {
    const id = `prod-${Date.now().toString(36)}`;
    const newProduct: ShopProduct = {
      id,
      name: data.name,
      category: data.category,
      price: data.price,
      wasPrice: data.wasPrice,
      badge: data.badge,
      photo: data.photo || "/assets/photos/shop/hoodie.webp",
    };
    state.shop = [newProduct, ...state.shop];
    logActivity("shop_manager", "Added Merch Item", "shop", id, `Added product "${data.name}" (${data.price} Toman)`);
    notifyChanges();
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<ShopProduct>) {
    const idx = state.shop.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    state.shop[idx] = { ...state.shop[idx], ...updates };
    notifyChanges();
    return state.shop[idx];
  },

  deleteProduct(id: string) {
    state.shop = state.shop.filter((p) => p.id !== id);
    notifyChanges();
  },

  /* ---------------- Users & RBAC API ---------------- */

  syncRegisteredAccounts() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("faimess.accounts");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      let changed = false;
      for (const acc of parsed) {
        if (!acc || typeof acc.user !== "string") continue;
        const uname = acc.user.trim().toLowerCase();
        const exists = state.users.some((u) => u.username.toLowerCase() === uname);
        if (!exists) {
          state.users.push({
            id: `usr-reg-${uname}`,
            username: uname,
            displayName: acc.user.trim(),
            role: "user",
            permissions: getDefaultPermissions("user"),
            avatar: "/assets/photos/account/me.webp",
            points: 100,
            joinedAt: "Recently",
            lastActive: "Just now",
            status: "active",
            bio: "Registered fan member.",
          });
          changed = true;
        }
      }
      if (changed) notifyChanges();
    } catch {
      // Ignore storage reading errors
    }
  },

  getUsers(query = "", roleFilter = "all") {
    this.syncRegisteredAccounts();
    let result = [...state.users];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  },

  getStaffUsers(query = "") {
    this.syncRegisteredAccounts();
    let result = state.users.filter((u) => u.role !== "user");
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      );
    }
    return result;
  },

  getRegularUsers(query = "") {
    this.syncRegisteredAccounts();
    let result = state.users.filter((u) => u.role === "user");
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      );
    }
    return result;
  },

  getUser(username: string) {
    return state.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
  },

  createUser(data: {
    username: string;
    displayName: string;
    role: AdminUserRole;
    permissions?: UserPermissions;
    points?: number;
    avatar?: string;
    bio?: string;
  }) {
    const id = `usr-${Date.now().toString(36)}`;
    const newUser: AdminUser = {
      id,
      username: data.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      displayName: data.displayName,
      role: data.role,
      permissions: data.permissions || getDefaultPermissions(data.role),
      avatar: data.avatar || "/assets/photos/account/me.webp",
      points: data.points ?? 100,
      joinedAt: "Today",
      lastActive: "Just now",
      status: "active",
      bio: data.bio,
    };
    state.users = [newUser, ...state.users];
    logActivity("super_admin", "Created User", "user", id, `Added staff/user @${newUser.username} as ${newUser.role}`);
    notifyChanges();
    return newUser;
  },

  updateUser(username: string, updates: Partial<AdminUser>) {
    const idx = state.users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) return null;
    state.users[idx] = { ...state.users[idx], ...updates };
    notifyChanges();
    return state.users[idx];
  },

  updateUserRole(username: string, role: AdminUserRole) {
    const u = state.users.find((item) => item.username.toLowerCase() === username.toLowerCase());
    if (u) {
      u.role = role;
      u.permissions = getDefaultPermissions(role);
      logActivity("super_admin", "Changed User Role", "user", u.id, `Promoted @${u.username} to ${role}`);
      notifyChanges();
    }
  },

  toggleUserStatus(username: string) {
    const u = state.users.find((item) => item.username.toLowerCase() === username.toLowerCase());
    if (u) {
      u.status = u.status === "active" ? "suspended" : "active";
      logActivity("super_admin", "Updated User Status", "user", u.id, `Account @${u.username} status: ${u.status}`);
      notifyChanges();
    }
  },

  adjustUserPoints(username: string, delta: number, reason: string) {
    const u = state.users.find((item) => item.username.toLowerCase() === username.toLowerCase());
    if (u) {
      u.points = Math.max(0, u.points + delta);
      logActivity("super_admin", "Adjusted Fan Points", "user", u.id, `Awarded ${delta > 0 ? "+" : ""}${delta} pts to @${u.username} for "${reason}"`);
      notifyChanges();
    }
  },

  deleteUser(username: string) {
    const target = state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    state.users = state.users.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
    if (target) {
      logActivity("super_admin", "Deleted User", "user", target.id, `Removed account @${target.username}`);
    }
    notifyChanges();
  },

  reportUser(targetUsername: string, reason: string, details?: string) {
    logActivity("user", "Reported User", "user", targetUsername, `Reason: ${reason}${details ? ` - ${details}` : ""}`);
    notifyChanges();
  },
};
