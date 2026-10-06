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

export type AdminUserRole = "super_admin" | "admin" | "moderator" | "editor" | "user";

export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: AdminUserRole;
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
};

export type AdminOverviewStats = {
  totalTracks: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalNews: number;
  totalComments: number;
  reportedComments: number;
  pendingLyrics: number;
  totalShopProducts: number;
  totalUsers: number;
  activeListenersToday: number;
  totalStreams: number;
  totalPointsDistributed: number;
  estimatedRevenueToman: number;
};

export type AdminActivityLog = {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  entityType: "track" | "artist" | "album" | "news" | "comment" | "lyrics" | "shop" | "user" | "playlist";
  entityId: string;
  details: string;
};

const DB_KEY = "faimess.admin_db.v3";

type AdminDbState = {
  artists: Artist[];
  albums: AdminAlbum[];
  tracks: PlayerTrack[];
  playlists: Playlist[];
  news: NewsItem[];
  comments: AdminCommentRecord[];
  lyricsSubmissions: LyricSubmission[];
  lyricsByTrack: Record<string, { original: string; translation?: string }>;
  shop: ShopProduct[];
  users: AdminUser[];
  activities: AdminActivityLog[];
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
    avatar: "/assets/photos/account/me.webp",
    points: 12500,
    joinedAt: "2025-01-01",
    lastActive: "Just now",
    status: "active",
    bio: "Lead platform director & super-administrator.",
  },
  {
    id: "usr-mod",
    username: "moderator",
    displayName: "Staff Moderator",
    role: "moderator",
    avatar: "/assets/photos/listeners/sora.webp",
    points: 8400,
    joinedAt: "2025-02-15",
    lastActive: "10 mins ago",
    status: "active",
    bio: "Community and lyrics sheet moderation desk.",
  },
  {
    id: "usr-minho",
    username: "minho_k",
    displayName: "Minho",
    role: "editor",
    avatar: "/assets/photos/listeners/minho.webp",
    points: 3200,
    joinedAt: "2025-03-01",
    lastActive: "1 hr ago",
    status: "active",
    bio: "Editorial columnist and review contributor.",
  },
  {
    id: "usr-yuna",
    username: "yuna_music",
    displayName: "Yuna",
    role: "user",
    avatar: "/assets/photos/listeners/yuna.webp",
    points: 1850,
    joinedAt: "2025-04-12",
    lastActive: "2 hrs ago",
    status: "active",
  },
  {
    id: "usr-haru",
    username: "haru_beats",
    displayName: "Haru",
    role: "user",
    avatar: "/assets/photos/listeners/haru.webp",
    points: 920,
    joinedAt: "2025-05-20",
    lastActive: "Yesterday",
    status: "active",
  },
  {
    id: "usr-jinah",
    username: "jinah_p",
    displayName: "Jinah",
    role: "user",
    avatar: "/assets/photos/listeners/jinah.webp",
    points: 450,
    joinedAt: "2025-06-11",
    lastActive: "3 days ago",
    status: "active",
  },
];

function seedComments(news: NewsItem[]): AdminCommentRecord[] {
  const records: AdminCommentRecord[] = [];

  for (const n of news) {
    for (const c of n.comments) {
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
        status: c.id === "c8" ? "reported" : "approved",
        reportReason: c.id === "c8" ? "Spam / off-topic controversy" : undefined,
        repliesCount: c.replies?.length ?? 0,
      });
    }
  }

  // Sample track comment records
  records.push(
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
  const news = JSON.parse(JSON.stringify(initialNews)) as NewsItem[];
  const tracks = JSON.parse(JSON.stringify(initialTracks)) as PlayerTrack[];
  const artists = JSON.parse(JSON.stringify(initialArtists)) as Artist[];
  const rawAlbums = JSON.parse(JSON.stringify(initialAlbums)) as Album[];
  const playlists = JSON.parse(JSON.stringify(initialPlaylists)) as Playlist[];
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
    comments: seedComments(news),
    lyricsSubmissions: seedLyricSubmissions(),
    lyricsByTrack,
    shop,
    users: SEED_USERS,
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
        adminUser: "moderator",
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
    // Merge defensively with defaults
    const initial = createInitialState();
    return {
      artists: parsed.artists?.length ? parsed.artists : initial.artists,
      albums: parsed.albums?.length ? (parsed.albums as AdminAlbum[]) : initial.albums,
      tracks: parsed.tracks?.length ? parsed.tracks : initial.tracks,
      playlists: parsed.playlists?.length ? parsed.playlists : initial.playlists,
      news: parsed.news?.length ? parsed.news : initial.news,
      comments: parsed.comments?.length ? parsed.comments : initial.comments,
      lyricsSubmissions: parsed.lyricsSubmissions?.length ? parsed.lyricsSubmissions : initial.lyricsSubmissions,
      lyricsByTrack: parsed.lyricsByTrack ?? initial.lyricsByTrack,
      shop: parsed.shop?.length ? parsed.shop : initial.shop,
      users: parsed.users?.length ? parsed.users : initial.users,
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
      state = parsed;
      notifyChanges();
      return true;
    } catch {
      return false;
    }
  },

  /* ---------------- Overview & Stats ---------------- */

  getOverviewStats(): AdminOverviewStats {
    const totalStreams = state.tracks.reduce((acc, t) => acc + (t.plays ?? 1000), 0);
    const totalRev = state.shop.reduce((acc, p) => acc + p.price * 24, 0);
    const pendingLyricsCount = state.lyricsSubmissions.filter((s) => s.status === "pending").length;
    const reportedCount = state.comments.filter((c) => c.status === "reported").length;

    return {
      totalTracks: state.tracks.length,
      totalArtists: state.artists.length,
      totalAlbums: state.albums.length,
      totalPlaylists: state.playlists.length,
      totalNews: state.news.length,
      totalComments: state.comments.length,
      reportedComments: reportedCount,
      pendingLyrics: pendingLyricsCount,
      totalShopProducts: state.shop.length,
      totalUsers: state.users.length,
      activeListenersToday: 8940,
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
  }) {
    const id = `tr-${Date.now().toString(36)}`;
    const newTrack: PlayerTrack = {
      id,
      title: data.title,
      artist: data.artist,
      album: data.album,
      seconds: toSeconds(data.duration),
      photo: data.photo || "/assets/photos/albums/afterglow.webp",
      audio: data.audio || "/assets/audio/faimess-demo.mp3",
      plays: data.plays ?? 120,
    };
    state.tracks = [newTrack, ...state.tracks];

    // Store lyrics if provided
    if (data.lyricsOriginal) {
      state.lyricsByTrack[id] = {
        original: data.lyricsOriginal,
        translation: data.lyricsTranslation,
      };
    }

    // Connect to album if exists
    if (data.album && data.album !== "· single") {
      const alb = state.albums.find(
        (a) => a.title.toLowerCase() === data.album.toLowerCase(),
      );
      if (alb) {
        alb.trackIds = [...(alb.trackIds || []), id];
        alb.tracks = alb.trackIds.length;
      }
    }

    logActivity("admin", "Added Song", "track", id, `Published track "${data.title}" by ${data.artist}`);
    notifyChanges();
    return newTrack;
  },

  updateTrack(
    id: string,
    updates: Partial<PlayerTrack> & {
      duration?: string;
      lyricsOriginal?: string;
      lyricsTranslation?: string;
    },
  ) {
    const idx = state.tracks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const oldTrack = state.tracks[idx];

    const newSeconds = updates.duration
      ? toSeconds(updates.duration)
      : updates.seconds ?? oldTrack.seconds;

    const updatedTrack: PlayerTrack = {
      ...oldTrack,
      ...updates,
      seconds: newSeconds,
    };
    state.tracks[idx] = updatedTrack;

    if (updates.lyricsOriginal !== undefined) {
      state.lyricsByTrack[id] = {
        original: updates.lyricsOriginal,
        translation: updates.lyricsTranslation,
      };
    }

    // If album changed, sync album trackIds
    if (updates.album && updates.album !== oldTrack.album) {
      // remove from old album
      const prevAlb = state.albums.find(
        (a) => a.title.toLowerCase() === oldTrack.album.toLowerCase(),
      );
      if (prevAlb && prevAlb.trackIds) {
        prevAlb.trackIds = prevAlb.trackIds.filter((tid) => tid !== id);
        prevAlb.tracks = prevAlb.trackIds.length;
      }
      // add to new album
      const nextAlb = state.albums.find(
        (a) => a.title.toLowerCase() === updates.album?.toLowerCase(),
      );
      if (nextAlb) {
        nextAlb.trackIds = [...(nextAlb.trackIds || []), id];
        nextAlb.tracks = nextAlb.trackIds.length;
      }
    }

    logActivity("admin", "Updated Song", "track", id, `Modified track details for "${updatedTrack.title}"`);
    notifyChanges();
    return updatedTrack;
  },

  deleteTrack(id: string) {
    const target = state.tracks.find((t) => t.id === id);
    state.tracks = state.tracks.filter((t) => t.id !== id);
    // remove from album trackIds
    for (const alb of state.albums) {
      if (alb.trackIds) {
        alb.trackIds = alb.trackIds.filter((tid) => tid !== id);
        alb.tracks = alb.trackIds.length;
      }
    }
    delete state.lyricsByTrack[id];
    if (target) {
      logActivity("admin", "Deleted Song", "track", id, `Removed track "${target.title}" from library`);
    }
    notifyChanges();
  },

  getTrackLyrics(trackId: string) {
    return state.lyricsByTrack[trackId] ?? null;
  },

  saveTrackLyrics(trackId: string, original: string, translation?: string) {
    state.lyricsByTrack[trackId] = { original, translation };
    logActivity("moderator", "Updated Lyrics", "lyrics", trackId, `Saved updated lyric sheet for track "${trackId}"`);
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
    logActivity("admin", "Added Artist", "artist", id, `Added artist profile "${data.name}"`);
    notifyChanges();
    return newArtist;
  },

  updateArtist(id: string, updates: Partial<Artist>) {
    const idx = state.artists.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    state.artists[idx] = { ...state.artists[idx], ...updates };
    logActivity("admin", "Updated Artist", "artist", id, `Updated artist profile "${state.artists[idx].name}"`);
    notifyChanges();
    return state.artists[idx];
  },

  deleteArtist(id: string) {
    const target = state.artists.find((a) => a.id === id);
    state.artists = state.artists.filter((a) => a.id !== id);
    if (target) {
      logActivity("admin", "Deleted Artist", "artist", id, `Removed artist "${target.name}"`);
    }
    notifyChanges();
  },

  toggleArtistVerified(id: string) {
    const a = state.artists.find((item) => item.id === id);
    if (a) {
      a.verified = !a.verified;
      logActivity("admin", "Toggled Badge", "artist", id, `Verified status: ${a.verified}`);
      notifyChanges();
    }
  },

  toggleArtistNewRelease(id: string) {
    const a = state.artists.find((item) => item.id === id);
    if (a) {
      a.newRelease = !a.newRelease;
      logActivity("admin", "Toggled New Release", "artist", id, `New release status: ${a.newRelease}`);
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
        }
      }
    }

    logActivity("admin", "Created Album", "album", id, `Published album "${data.title}" by ${data.artist} with ${trackIds.length} tracks`);
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
      } else if (oldTrackIds.includes(t.id) && !updatedTrackIds.includes(t.id)) {
        if (t.album === oldTitle) {
          t.album = "· single";
        }
      }
    }

    logActivity("admin", "Updated Album", "album", id, `Modified album "${updatedAlbum.title}" (${updatedTrackIds.length} tracks)`);
    notifyChanges();
    return updatedAlbum;
  },

  deleteAlbum(id: string) {
    const target = state.albums.find((a) => a.id === id);
    state.albums = state.albums.filter((a) => a.id !== id);
    if (target) {
      // Revert tracks to single
      for (const t of state.tracks) {
        if (t.album === target.title) {
          t.album = "· single";
        }
      }
      logActivity("admin", "Deleted Album", "album", id, `Removed album "${target.title}"`);
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
  }) {
    const id = `pl-${Date.now().toString(36)}`;
    const newPlaylist: Playlist = {
      id,
      name: data.name,
      curator: data.curator,
      mood: data.mood,
      tracks: data.tracks ?? 10,
      duration: "35 mins",
      seed: state.playlists.length % 8,
      photo: data.photo || "/assets/photos/playlists/golden-hour.webp",
    };
    state.playlists = [newPlaylist, ...state.playlists];
    logActivity("admin", "Created Playlist", "playlist", id, `Created playlist "${data.name}"`);
    notifyChanges();
    return newPlaylist;
  },

  updatePlaylist(id: string, updates: Partial<Playlist>) {
    const idx = state.playlists.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    state.playlists[idx] = { ...state.playlists[idx], ...updates };
    logActivity("admin", "Updated Playlist", "playlist", id, `Updated playlist "${state.playlists[idx].name}"`);
    notifyChanges();
    return state.playlists[idx];
  },

  deletePlaylist(id: string) {
    const target = state.playlists.find((p) => p.id === id);
    state.playlists = state.playlists.filter((p) => p.id !== id);
    if (target) {
      logActivity("admin", "Deleted Playlist", "playlist", id, `Removed playlist "${target.name}"`);
    }
    notifyChanges();
  },

  /* ---------------- News & Editorial API ------------ */

  getNews(query = "") {
    const q = query.trim().toLowerCase();
    if (!q) return [...state.news];
    return state.news.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.tag.toLowerCase().includes(q),
    );
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
  }) {
    const id = `nw-${Date.now().toString(36)}`;
    const tag = data.tag || "Tour";
    const newArticle: NewsItem = {
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
    };
    state.news = [newArticle, ...state.news];
    logActivity("editor", "Published Article", "news", id, `Published story "${data.title}"`);
    notifyChanges();
    return newArticle;
  },

  updateNews(id: string, updates: Partial<NewsItem>) {
    const idx = state.news.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    state.news[idx] = { ...state.news[idx], ...updates };
    logActivity("editor", "Updated Story", "news", id, `Modified story "${state.news[idx].title}"`);
    notifyChanges();
    return state.news[idx];
  },

  deleteNews(id: string) {
    const target = state.news.find((n) => n.id === id);
    state.news = state.news.filter((n) => n.id !== id);
    if (target) {
      logActivity("editor", "Deleted Story", "news", id, `Removed news article "${target.title}"`);
    }
    notifyChanges();
  },

  /* ---------------- Comments Moderation API --------- */

  getComments(filter: "all" | "reported" | "approved" = "all", query = "") {
    let result = [...state.comments];
    if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
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

  approveComment(id: string) {
    const c = state.comments.find((item) => item.id === id);
    if (c) {
      c.status = "approved";
      c.reportReason = undefined;
      logActivity("moderator", "Approved Comment", "comment", id, `Restored comment by @${c.handle}`);
      notifyChanges();
    }
  },

  flagComment(id: string, reason: string) {
    const c = state.comments.find((item) => item.id === id);
    if (c) {
      c.status = "reported";
      c.reportReason = reason;
      logActivity("moderator", "Flagged Comment", "comment", id, `Flagged for: ${reason}`);
      notifyChanges();
    }
  },

  deleteComment(id: string, cascadeReplies = true) {
    const target = state.comments.find((c) => c.id === id);
    state.comments = state.comments.filter((c) => c.id !== id);
    if (target) {
      logActivity("moderator", "Deleted Comment", "comment", id, `Removed comment by @${target.handle}${cascadeReplies ? " with replies" : ""}`);
    }
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
      // Also save to track lyrics store
      state.lyricsByTrack[sub.trackId] = {
        original: sub.original,
        translation: sub.translation,
      };
      logActivity("moderator", "Approved Lyrics Sheet", "lyrics", id, `Approved lyrics for "${sub.trackTitle}" (+${payout} pts)`);
      notifyChanges();
    }
  },

  rejectLyricSubmission(id: string) {
    const sub = state.lyricsSubmissions.find((s) => s.id === id);
    if (sub) {
      sub.status = "rejected";
      logActivity("moderator", "Rejected Lyrics Sheet", "lyrics", id, `Rejected lyrics for "${sub.trackTitle}"`);
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
    logActivity("admin", "Added Merch Item", "shop", id, `Added product "${data.name}" (${data.price} Toman)`);
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

  getUsers(query = "", roleFilter = "all") {
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

  getUser(username: string) {
    return state.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
  },

  createUser(data: {
    username: string;
    displayName: string;
    role: AdminUserRole;
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
      logActivity("admin", "Adjusted Fan Points", "user", u.id, `Awarded ${delta > 0 ? "+" : ""}${delta} pts to @${u.username} for "${reason}"`);
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
};
