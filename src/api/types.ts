/* ------------------------------------------------------------------ *
 *  FAIMESS Unified API Contracts & Data Transfer Objects (DTOs)
 *  Standardized request/response interfaces for 100% full-stack control.
 * ------------------------------------------------------------------ */

import type { PlayerTrack } from "../data/player";
import type { Artist, Album, Playlist } from "../data/library";
import type { NewsItem, NewsComment } from "../data/feed";
import type { ShopProduct, ShopCategoryId } from "../data/shop";
import type { LyricLine, LyricSubmission } from "../data/lyrics";
import type { UserProfile } from "./socialApi";
import type { Banner } from "../data/banners";

export type FollowStats = {
  followersCount: number;
  followingCount: number;
};

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    cached?: boolean;
    durationMs?: number;
    timestamp: number;
  };
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  query?: string;
};

/* --- Track Domain --- */
export type TrackFilter = {
  artistId?: string;
  albumId?: string;
  genre?: string;
  query?: string;
};

export type TrackPlayEvent = {
  trackId: string;
  timestamp: number;
  completedSeconds: number;
  source: string;
};

/* --- Playlist Domain --- */
export type CreatePlaylistDto = {
  name: string;
  description?: string;
  curator?: string;
  cover?: string;
  trackIds?: string[];
  isPublic?: boolean;
};

export type UpdatePlaylistDto = Partial<CreatePlaylistDto>;

/* --- News Domain --- */
export type CreateNewsDto = {
  title: string;
  tag: string;
  category: "comeback" | "chart" | "tour" | "interview" | "general";
  readMinutes: number;
  summary: string;
  content: string;
  photo: string;
  author: string;
};

export type NewsCommentDto = {
  newsId: string;
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
};

/* --- Shop Domain --- */
export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
};

export type CreateOrderDto = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  notes?: string;
};

export type OrderReceipt = {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: "pending" | "processing" | "paid" | "shipped" | "delivered";
  createdAt: string;
  itemsCount: number;
};

/* --- Comment Domain --- */
export type AddCommentDto = {
  trackId: string;
  text: string;
  timeSeconds?: number;
  author: {
    username: string;
    displayName: string;
    avatar: string;
  };
};

/* --- Lyric Submission Domain --- */
export type SubmitLyricsDto = {
  trackId: string;
  lines: LyricLine[];
  submitterUsername: string;
  submitterNotes?: string;
};

/* --- System & Health Domain --- */
export type SystemHealthReport = {
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  cacheHitRatio: number;
  cachedKeys: number;
  activeListeners: number;
  totalTracks: number;
  totalAlbums: number;
  totalPlaylists: number;
  storageUsageKb: number;
  uptimeSeconds: number;
  version: string;
};
