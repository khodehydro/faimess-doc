/* ------------------------------------------------------------------ *
 *  FAIMESS Social, Community & Playlists Routes
 *  Follow/Unfollow, comments with moderation, playlists CRUD,
 *  collaborative Duo playlists, fan leaderboards, and anthem pinning.
 * ------------------------------------------------------------------ */

import { db } from "../db.ts";
import type { RequestContext } from "./auth.ts";

export const socialRoutes = {
  // -------------------------------------------------------------------
  // 1. Comments
  // -------------------------------------------------------------------

  async listComments(query: any, _ctx: RequestContext) {
    const targetId = query?.targetId;
    if (!targetId) {
      return { status: 400, data: { error: "شناسه مقصد (targetId) الزامی است." } };
    }

    const comments = db.prepare(`
      SELECT id, source_type, target_id, target_title, author, handle, avatar, text, status, created_at
      FROM comments
      WHERE target_id = ? AND status != 'rejected'
      ORDER BY created_at DESC
    `).all(targetId);

    return { status: 200, data: comments };
  },

  async addComment(body: any, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "برای ثبت دیدگاه ابتدا وارد حساب کاربری شوید." } };
    }

    const { targetId, targetTitle, text, sourceType } = body || {};
    if (!targetId || !text || String(text).trim().length < 2) {
      return { status: 400, data: { error: "متن دیدگاه باید حداقل ۲ کاراکتر باشد." } };
    }

    const user = db.prepare("SELECT username, display_name, avatar FROM users WHERE id = ?").get(ctx.user.userId) as any;
    const commentId = `cm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO comments (id, source_type, target_id, target_title, author, handle, avatar, text, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      commentId,
      sourceType || "track",
      targetId,
      targetTitle || "Track",
      user.display_name,
      user.username,
      user.avatar,
      String(text).trim(),
      now,
    );

    // Award +5 fan points for valuable comment participation
    db.prepare("UPDATE users SET points = points + 5 WHERE id = ?").run(ctx.user.userId);

    return {
      status: 201,
      data: {
        id: commentId,
        author: user.display_name,
        handle: user.username,
        avatar: user.avatar,
        text: String(text).trim(),
        createdAt: now,
        pointsAwarded: 5,
      },
    };
  },

  // -------------------------------------------------------------------
  // 2. Playlists
  // -------------------------------------------------------------------

  async listPlaylists(query: any, ctx: RequestContext) {
    const isMine = query?.mine === "true";
    let rows: any[];

    if (isMine && ctx.user) {
      rows = db.prepare(`
        SELECT id, name, curator, mood, photo, track_ids, is_user, owner_username, is_duo, duo_code, created_at
        FROM playlists
        WHERE owner_username = ?
        ORDER BY created_at DESC
      `).all(ctx.user.username);
    } else {
      rows = db.prepare(`
        SELECT id, name, curator, mood, photo, track_ids, is_user, owner_username, is_duo, duo_code, created_at
        FROM playlists
        WHERE is_user = 0
        ORDER BY created_at ASC
      `).all();
    }

    const playlists = rows.map((p) => ({
      id: p.id,
      name: p.name,
      curator: p.curator,
      mood: p.mood,
      photo: p.photo,
      trackIds: JSON.parse(p.track_ids || "[]"),
      tracks: JSON.parse(p.track_ids || "[]").length,
      isUser: Boolean(p.is_user),
      isDuo: Boolean(p.is_duo),
      duoCode: p.duo_code,
    }));

    return { status: 200, data: playlists };
  },

  async createPlaylist(body: any, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "برای ساخت پلی‌لیست وارد شوید." } };
    }

    const { name, trackIds, photo, mood, isDuo } = body || {};
    if (!name || String(name).trim().length < 2) {
      return { status: 400, data: { error: "نام پلی‌لیست باید حداقل ۲ کاراکتر باشد." } };
    }

    const id = `pl-usr-${Date.now().toString(36)}`;
    const now = Date.now();
    const duoCode = isDuo ? `DUO-${Math.random().toString(36).slice(2, 7).toUpperCase()}` : null;
    const cleanTracks = Array.isArray(trackIds) ? trackIds : [];

    db.prepare(`
      INSERT INTO playlists (id, name, curator, mood, photo, track_ids, is_user, owner_username, is_duo, duo_code, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run(
      id,
      String(name).trim(),
      ctx.user.username,
      mood || "Personal Mix",
      photo || "/assets/photos/playlists/midnight-drive.webp",
      JSON.stringify(cleanTracks),
      ctx.user.username,
      isDuo ? 1 : 0,
      duoCode,
      now,
    );

    return {
      status: 201,
      data: {
        id,
        name: String(name).trim(),
        curator: ctx.user.username,
        trackIds: cleanTracks,
        isDuo: Boolean(isDuo),
        duoCode,
      },
    };
  },

  // -------------------------------------------------------------------
  // 3. User Profile & Follows
  // -------------------------------------------------------------------

  async getProfile(username: string, ctx: RequestContext) {
    const user = db.prepare(`
      SELECT id, username, display_name, role, points, avatar, banner, bio, anthem_track_id, bias_artist_id, referral_code, created_at
      FROM users WHERE username = ?
    `).get(username.trim().toLowerCase()) as any;

    if (!user) {
      return { status: 404, data: { error: "کاربر یافت نشد." } };
    }

    // Follower / Following count
    const followers = (db.prepare("SELECT COUNT(*) as count FROM user_follows WHERE following_username = ?").get(user.username) as any)?.count ?? 0;
    const following = (db.prepare("SELECT COUNT(*) as count FROM user_follows WHERE follower_username = ?").get(user.username) as any)?.count ?? 0;

    // Check if requester is following this user
    let isFollowing = false;
    if (ctx.user) {
      const row = db.prepare("SELECT 1 FROM user_follows WHERE follower_username = ? AND following_username = ?").get(ctx.user.username, user.username);
      isFollowing = Boolean(row);
    }

    return {
      status: 200,
      data: {
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        points: user.points,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        anthemTrackId: user.anthem_track_id,
        biasArtistId: user.bias_artist_id,
        referralCode: user.referral_code,
        followersCount: followers,
        followingCount: following,
        isFollowing,
        createdAt: user.created_at,
      },
    };
  },

  async toggleFollow(username: string, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "ابتدا وارد حساب کاربری خود شوید." } };
    }

    const target = username.trim().toLowerCase();
    if (target === ctx.user.username) {
      return { status: 400, data: { error: "نمی‌توانید خودتان را دنبال کنید." } };
    }

    const existing = db.prepare("SELECT 1 FROM user_follows WHERE follower_username = ? AND following_username = ?").get(ctx.user.username, target);

    if (existing) {
      db.prepare("DELETE FROM user_follows WHERE follower_username = ? AND following_username = ?").run(ctx.user.username, target);
      return { status: 200, data: { following: false } };
    } else {
      db.prepare("INSERT INTO user_follows (follower_username, following_username, created_at) VALUES (?, ?, ?)").run(ctx.user.username, target, Date.now());
      // Award points for community interaction
      db.prepare("UPDATE users SET points = points + 3 WHERE id = ?").run(ctx.user.userId);
      return { status: 200, data: { following: true } };
    }
  },

  // -------------------------------------------------------------------
  // 4. Leaderboard
  // -------------------------------------------------------------------

  async getLeaderboard(_query: any, _ctx: RequestContext) {
    const topUsers = db.prepare(`
      SELECT username, display_name, points, avatar, bias_artist_id
      FROM users
      ORDER BY points DESC
      LIMIT 20
    `).all() as any[];

    const formatted = topUsers.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      name: u.display_name,
      points: u.points,
      avatar: u.avatar,
      biasArtistId: u.bias_artist_id,
      level: Math.max(1, Math.floor(u.points / 50)),
    }));

    return { status: 200, data: formatted };
  },
};
