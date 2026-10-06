/* ------------------------------------------------------------------ *
 *  FAIMESS Master Unified API Suite
 *  Complete, 100% control over all domains: Tracks, Artists, Albums,
 *  Playlists, Banners, News, Shop, Comments, Lyrics, Users, Admin, System.
 * ------------------------------------------------------------------ */

import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginationParams,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  CreateNewsDto,
  CreateOrderDto,
  OrderReceipt,
  AddCommentDto,
  SubmitLyricsDto,
  SystemHealthReport,
  FollowStats,
} from "./types";
import { QUEUE, trackById, type PlayerTrack } from "../data/player";
import { artists, albums, playlists, type Artist, type Album, type Playlist } from "../data/library";
import { banners, type Banner } from "../data/banners";
import { newsItems, type NewsItem, type NewsComment } from "../data/feed";
import { shopProducts, type ShopProduct, type ShopCategoryId } from "../data/shop";
import { LYRICS, type LyricLine, type LyricSubmission } from "../data/lyrics";
import { socialApi, type UserProfile } from "./socialApi";
import { adminApi } from "./adminApi";

/* ------------------------------------------------------------------ *
 *  1. Tracks API Module
 * ------------------------------------------------------------------ */
export const tracksApi = {
  async getAll(): Promise<ApiResponse<PlayerTrack[]>> {
    return apiClient.execute<PlayerTrack[]>("/tracks", () => [...QUEUE], {
      cacheKey: "tracks:all",
      ttlMs: 300_000,
    });
  },

  async getById(id: string): Promise<ApiResponse<PlayerTrack | null>> {
    return apiClient.execute<PlayerTrack | null>(`/tracks/${id}`, () => trackById(id) ?? null, {
      cacheKey: `track:${id}`,
    });
  },

  async search(query: string): Promise<ApiResponse<PlayerTrack[]>> {
    const q = query.trim().toLowerCase();
    return apiClient.execute<PlayerTrack[]>(`/tracks/search?q=${encodeURIComponent(q)}`, () => {
      if (!q) return [];
      return QUEUE.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q),
      );
    });
  },

  async getTrending(): Promise<ApiResponse<PlayerTrack[]>> {
    return apiClient.execute<PlayerTrack[]>("/tracks/trending", () => QUEUE.slice(0, 8), {
      cacheKey: "tracks:trending",
      ttlMs: 120_000,
    });
  },

  async getNewReleases(): Promise<ApiResponse<PlayerTrack[]>> {
    return apiClient.execute<PlayerTrack[]>("/tracks/new-releases", () => QUEUE.slice(0, 6), {
      cacheKey: "tracks:new_releases",
      ttlMs: 120_000,
    });
  },

  async recordPlay(trackId: string): Promise<ApiResponse<{ recorded: boolean; trackId: string }>> {
    apiClient.events.emit("track:play", { trackId, timestamp: Date.now() });
    return apiClient.execute(`/tracks/${trackId}/play`, () => ({ recorded: true, trackId }), {
      method: "POST",
    });
  },
};

/* ------------------------------------------------------------------ *
 *  2. Artists API Module
 * ------------------------------------------------------------------ */
export const artistsApi = {
  async getAll(): Promise<ApiResponse<Artist[]>> {
    return apiClient.execute<Artist[]>("/artists", () => [...artists], {
      cacheKey: "artists:all",
      ttlMs: 600_000,
    });
  },

  async getById(id: string): Promise<ApiResponse<Artist | null>> {
    return apiClient.execute<Artist | null>(
      `/artists/${id}`,
      () => artists.find((a) => a.id === id) ?? null,
      { cacheKey: `artist:${id}` },
    );
  },

  async getFollowed(): Promise<ApiResponse<Artist[]>> {
    return apiClient.execute<Artist[]>("/artists/following", () => artists.filter((a) => a.following), {
      cacheKey: "artists:following",
      ttlMs: 30_000,
    });
  },

  async toggleFollow(id: string): Promise<ApiResponse<{ id: string; following: boolean }>> {
    const art = artists.find((a) => a.id === id);
    const nextState = art ? !art.following : true;
    if (art) art.following = nextState;

    apiClient.invalidateCache("artists:following");
    apiClient.events.emit("artist:follow_toggle", { id, following: nextState });

    return apiClient.execute(
      `/artists/${id}/follow`,
      () => ({ id, following: nextState }),
      { method: "POST" },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  3. Albums API Module
 * ------------------------------------------------------------------ */
export const albumsApi = {
  async getAll(): Promise<ApiResponse<Album[]>> {
    return apiClient.execute<Album[]>("/albums", () => [...albums], {
      cacheKey: "albums:all",
      ttlMs: 600_000,
    });
  },

  async getById(id: string): Promise<ApiResponse<Album | null>> {
    return apiClient.execute<Album | null>(
      `/albums/${id}`,
      () => albums.find((a) => a.id === id) ?? null,
      { cacheKey: `album:${id}` },
    );
  },

  async getByArtist(artistName: string): Promise<ApiResponse<Album[]>> {
    return apiClient.execute<Album[]>(
      `/albums/by-artist?artist=${encodeURIComponent(artistName)}`,
      () => albums.filter((a) => a.artist.toLowerCase() === artistName.toLowerCase()),
      { cacheKey: `albums:artist:${artistName}` },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  4. Playlists API Module
 * ------------------------------------------------------------------ */
export const playlistsApi = {
  async getCurated(): Promise<ApiResponse<Playlist[]>> {
    return apiClient.execute<Playlist[]>("/playlists/curated", () => [...playlists], {
      cacheKey: "playlists:curated",
      ttlMs: 300_000,
    });
  },

  async getById(id: string): Promise<ApiResponse<{ id: string; name: string; curator: string; cover: string; trackIds: string[] } | null>> {
    return apiClient.execute(`/playlists/${id}`, () => {
      // 1. Curated
      const curated = playlists.find((p) => p.id === id);
      if (curated) {
        return {
          id: curated.id,
          name: curated.name,
          curator: "FAIMESS Editorial",
          cover: curated.photo,
          trackIds: QUEUE.slice(0, curated.tracks || 5).map((t) => t.id),
        };
      }
      // 2. User or community
      return socialApi.getPlaylistById(id);
    });
  },

  async getUserPlaylists(username: string): Promise<ApiResponse<Array<{ id: string; name: string; cover: string; trackIds: string[] }>>> {
    return apiClient.execute(`/users/${username}/playlists`, () => socialApi.getUserPlaylists(username));
  },

  async create(data: CreatePlaylistDto): Promise<ApiResponse<{ id: string; name: string }>> {
    const newId = `pl_${Date.now()}`;
    apiClient.events.emit("playlist:created", { id: newId, name: data.name });
    return apiClient.execute(
      "/playlists",
      () => ({ id: newId, name: data.name }),
      { method: "POST", body: data },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  5. Hero Banners API Module
 * ------------------------------------------------------------------ */
export const bannersApi = {
  async getAll(): Promise<ApiResponse<Banner[]>> {
    return apiClient.execute<Banner[]>("/banners", () => [...banners], {
      cacheKey: "banners:all",
      ttlMs: 600_000,
    });
  },

  async recordClick(bannerId: string): Promise<ApiResponse<{ success: boolean }>> {
    apiClient.events.emit("banner:click", { bannerId, timestamp: Date.now() });
    return apiClient.execute(`/banners/${bannerId}/click`, () => ({ success: true }), {
      method: "POST",
    });
  },
};

/* ------------------------------------------------------------------ *
 *  6. News & Editorial API Module
 * ------------------------------------------------------------------ */
export const newsApi = {
  async getAll(category?: string): Promise<ApiResponse<NewsItem[]>> {
    return apiClient.execute<NewsItem[]>(
      `/news${category ? `?category=${category}` : ""}`,
      () => {
        if (!category || category === "all") return [...newsItems];
        return newsItems.filter((n) => n.tag.toLowerCase() === category.toLowerCase());
      },
      { cacheKey: `news:${category || "all"}`, ttlMs: 120_000 },
    );
  },

  async getById(id: string): Promise<ApiResponse<NewsItem | null>> {
    return apiClient.execute<NewsItem | null>(
      `/news/${id}`,
      () => newsItems.find((n) => n.id === id) ?? null,
      { cacheKey: `news:item:${id}` },
    );
  },

  async addComment(newsId: string, comment: { text: string; authorName: string }): Promise<ApiResponse<NewsComment>> {
    const item = newsItems.find((n) => n.id === newsId);
    const newComment: NewsComment = {
      id: `comm_${Date.now()}`,
      author: comment.authorName,
      handle: `@${comment.authorName.toLowerCase().replace(/\s+/g, "")}`,
      text: comment.text,
      time: "Just now",
      likes: 0,
      avatar: "/avatar.webp",
      seed: Math.floor(Math.random() * 20),
    };
    if (item) {
      item.comments = [newComment, ...(item.comments || [])];
      item.commentsCount = (item.commentsCount || 0) + 1;
    }
    apiClient.events.emit("news:comment_added", { newsId, comment: newComment });
    return apiClient.execute(
      `/news/${newsId}/comments`,
      () => newComment,
      { method: "POST", body: comment },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  7. Shop & Merchandise API Module
 * ------------------------------------------------------------------ */
export const shopApi = {
  async getAll(categoryId?: ShopCategoryId | "all"): Promise<ApiResponse<ShopProduct[]>> {
    return apiClient.execute<ShopProduct[]>(
      `/shop${categoryId && categoryId !== "all" ? `?category=${categoryId}` : ""}`,
      () => {
        if (!categoryId || categoryId === "all") return [...shopProducts];
        return shopProducts.filter((p) => p.category === categoryId);
      },
      { cacheKey: `shop:${categoryId || "all"}`, ttlMs: 300_000 },
    );
  },

  async getById(id: string): Promise<ApiResponse<ShopProduct | null>> {
    return apiClient.execute<ShopProduct | null>(
      `/shop/${id}`,
      () => shopProducts.find((p) => p.id === id) ?? null,
      { cacheKey: `shop:product:${id}` },
    );
  },

  async createOrder(order: CreateOrderDto): Promise<ApiResponse<OrderReceipt>> {
    const total = order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const receipt: OrderReceipt = {
      orderId: `ord_${Date.now()}`,
      orderNumber: `FM-${Math.floor(100000 + Math.random() * 900000)}`,
      totalAmount: total,
      status: "pending",
      createdAt: new Date().toISOString(),
      itemsCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
    };

    apiClient.events.emit("shop:order_created", receipt);
    return apiClient.execute(
      "/shop/orders",
      () => receipt,
      { method: "POST", body: order },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  8. Lyrics API Module
 * ------------------------------------------------------------------ */
export const lyricsApi = {
  async getForTrack(trackId: string): Promise<ApiResponse<LyricLine[] | null>> {
    return apiClient.execute<LyricLine[] | null>(
      `/lyrics/${trackId}`,
      () => LYRICS[trackId] ?? null,
      { cacheKey: `lyrics:${trackId}`, ttlMs: 600_000 },
    );
  },

  async submitFanLyrics(submission: SubmitLyricsDto): Promise<ApiResponse<LyricSubmission>> {
    const tr = trackById(submission.trackId);
    const created: LyricSubmission = {
      id: `sub_${Date.now()}`,
      trackId: submission.trackId,
      trackTitle: tr?.title || "Track",
      lines: submission.lines.length,
      status: "pending",
      sentAt: "Just now",
      points: 50,
      language: "Korean / Persian",
      original: submission.lines.map((l) => `[${l.at}] ${l.ko}`).join("\n"),
      translation: submission.lines.map((l) => `[${l.at}] ${l.fa}`).join("\n"),
    };

    apiClient.events.emit("lyrics:submitted", created);
    return apiClient.execute(
      "/lyrics/submit",
      () => created,
      { method: "POST", body: submission },
    );
  },
};

/* ------------------------------------------------------------------ *
 *  9. Community & Social Users API Module
 * ------------------------------------------------------------------ */
export const usersApi = {
  async getProfile(username?: string): Promise<ApiResponse<UserProfile>> {
    return apiClient.execute<UserProfile>(
      `/users/${username || "me"}`,
      () => socialApi.getProfile(username),
      { ttlMs: 15_000 },
    );
  },

  async getFollowStats(username: string): Promise<ApiResponse<FollowStats>> {
    return apiClient.execute<FollowStats>(
      `/users/${username}/stats`,
      () => socialApi.getFollowStats(username),
    );
  },

  async toggleFollow(targetUsername: string): Promise<ApiResponse<{ following: boolean }>> {
    const res = socialApi.toggleFollow(targetUsername);
    apiClient.events.emit("user:follow_toggle", { username: targetUsername, following: res });
    return apiClient.execute(
      `/users/${targetUsername}/follow`,
      () => ({ following: res }),
      { method: "POST" },
    );
  },

  async getFavorites(username: string): Promise<ApiResponse<{ trackIds: string[]; albumIds: string[]; playlistIds: string[] }>> {
    return apiClient.execute(
      `/users/${username}/favorites`,
      () => socialApi.getUserFavorites(username),
    );
  },
};

/* ------------------------------------------------------------------ *
 *  10. System Health & Performance API Module
 * ------------------------------------------------------------------ */
export const systemApi = {
  async getHealthReport(): Promise<ApiResponse<SystemHealthReport>> {
    const report: SystemHealthReport = {
      status: "healthy",
      latencyMs: Math.round(performance.now() % 50 + 8),
      cacheHitRatio: 0.94,
      cachedKeys: apiClient.getCacheSize(),
      activeListeners: 1240,
      totalTracks: QUEUE.length,
      totalAlbums: albums.length,
      totalPlaylists: playlists.length,
      storageUsageKb: typeof window !== "undefined" ? Math.round(JSON.stringify(window.localStorage).length / 1024) : 0,
      uptimeSeconds: Math.round(performance.now() / 1000),
      version: "0.1.0-prod",
    };

    return apiClient.wrapResponse(report);
  },

  clearCache(): void {
    apiClient.invalidateCache();
  },
};

/* ------------------------------------------------------------------ *
 *  Master Export: FAIMESS Unified API
 * ------------------------------------------------------------------ */
export const faimessApi = {
  client: apiClient,
  tracks: tracksApi,
  artists: artistsApi,
  albums: albumsApi,
  playlists: playlistsApi,
  banners: bannersApi,
  news: newsApi,
  shop: shopApi,
  lyrics: lyricsApi,
  users: usersApi,
  admin: adminApi,
  system: systemApi,
  on: apiClient.events.on.bind(apiClient.events),
  emit: apiClient.events.emit.bind(apiClient.events),
};

export default faimessApi;
