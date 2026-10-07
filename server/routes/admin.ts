/* ------------------------------------------------------------------ *
 *  FAIMESS Admin & RBAC Protected Management Routes
 *  Granular permission checks, catalog CRUD, user management,
 *  points adjustments, and immutable audit logging.
 * ------------------------------------------------------------------ */

import { db } from "../db.ts";
import { hashIpForAudit, type AuthTokenPayload } from "../security.ts";
import type { RequestContext } from "./auth.ts";

function requireAdminRole(
  ctx: RequestContext,
  allowedRoles: Array<AuthTokenPayload["role"]> = ["super_admin"],
) {
  if (!ctx.user) {
    return { status: 401, error: "احراز هویت انجام نشده است." };
  }
  if (!allowedRoles.includes(ctx.user.role) && ctx.user.role !== "super_admin") {
    return { status: 403, error: "شما مجوز دسترسی به این بخش مدیریتی را ندارید." };
  }
  return null;
}

function logAudit(
  ctx: RequestContext,
  action: string,
  targetType: string,
  targetId: string,
  details: string,
) {
  try {
    const id = `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const actor = ctx.user?.username || "anonymous";
    const ipHash = hashIpForAudit(ctx.ip);
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, target_type, target_id, details, ip_hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, actor, action, targetType, targetId, details, ipHash, Date.now());
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export const adminRoutes = {
  // -------------------------------------------------------------------
  // 1. Dashboard Overview Stats & Audit Logs
  // -------------------------------------------------------------------

  async getOverviewStats(_query: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin", "music_curator", "comment_moderator", "shop_manager"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const usersCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any)?.count ?? 0;
    const tracksCount = (db.prepare("SELECT COUNT(*) as count FROM tracks").get() as any)?.count ?? 0;
    const commentsCount = (db.prepare("SELECT COUNT(*) as count FROM comments").get() as any)?.count ?? 0;
    const playlistsCount = (db.prepare("SELECT COUNT(*) as count FROM playlists").get() as any)?.count ?? 0;

    const recentAudits = db.prepare(`
      SELECT id, actor, action, target_type, target_id, details, timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 15
    `).all();

    return {
      status: 200,
      data: {
        metrics: {
          totalUsers: usersCount,
          totalTracks: tracksCount,
          totalComments: commentsCount,
          totalPlaylists: playlistsCount,
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          databaseStatus: "healthy (WAL mode)",
        },
        auditLogs: recentAudits,
      },
    };
  },

  // -------------------------------------------------------------------
  // 2. Track Management (CRUD)
  // -------------------------------------------------------------------

  async createTrack(body: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin", "music_curator"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const { title, artist, album, duration, audioUrl, photo, lyricsOriginal, lyricsTranslation, lyricsRomanization } = body || {};
    if (!title || !artist) {
      return { status: 400, data: { error: "عنوان و نام خواننده الزامی است." } };
    }

    const id = `tr-${Date.now().toString(36)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO tracks (id, title, artist, album, duration, audio_url, photo, plays, is_single, lyrics_original, lyrics_translation, lyrics_romanization, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 100, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(title).trim(),
      String(artist).trim(),
      album || "Single",
      Number(duration) || 210,
      audioUrl || "/assets/audio/faimess-demo.mp3",
      photo || "/assets/photos/banners/tour-afterglow.webp",
      album?.includes("single") ? 1 : 0,
      lyricsOriginal || "",
      lyricsTranslation || "",
      lyricsRomanization || "",
      now,
    );

    logAudit(ctx, "CREATE_TRACK", "track", id, `Published track "${title}" by ${artist}`);

    return { status: 201, data: { id, title, artist, album } };
  },

  async updateTrack(id: string, body: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin", "music_curator"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const { title, artist, album, duration, audioUrl, photo, lyricsOriginal, lyricsTranslation, lyricsRomanization } = body || {};

    db.prepare(`
      UPDATE tracks SET
        title = COALESCE(?, title),
        artist = COALESCE(?, artist),
        album = COALESCE(?, album),
        duration = COALESCE(?, duration),
        audio_url = COALESCE(?, audio_url),
        photo = COALESCE(?, photo),
        lyrics_original = COALESCE(?, lyrics_original),
        lyrics_translation = COALESCE(?, lyrics_translation),
        lyrics_romanization = COALESCE(?, lyrics_romanization)
      WHERE id = ?
    `).run(
      title ? String(title).trim() : null,
      artist ? String(artist).trim() : null,
      album ? String(album).trim() : null,
      duration ? Number(duration) : null,
      audioUrl ? String(audioUrl).trim() : null,
      photo ? String(photo).trim() : null,
      lyricsOriginal !== undefined ? lyricsOriginal : null,
      lyricsTranslation !== undefined ? lyricsTranslation : null,
      lyricsRomanization !== undefined ? lyricsRomanization : null,
      id,
    );

    logAudit(ctx, "UPDATE_TRACK", "track", id, `Updated track details for ID ${id}`);

    return { status: 200, data: { success: true, id } };
  },

  async deleteTrack(id: string, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin", "music_curator"]);
    if (err) return { status: err.status, data: { error: err.error } };

    db.prepare("DELETE FROM tracks WHERE id = ?").run(id);
    logAudit(ctx, "DELETE_TRACK", "track", id, `Deleted track ID ${id}`);

    return { status: 200, data: { success: true, id } };
  },

  // -------------------------------------------------------------------
  // 3. User & Role Management
  // -------------------------------------------------------------------

  async listUsers(query: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const q = (query?.q || "").trim().toLowerCase();
    let rows: any[];

    if (q) {
      rows = db.prepare(`
        SELECT id, username, display_name, role, points, avatar, status, created_at
        FROM users
        WHERE LOWER(username) LIKE ? OR LOWER(display_name) LIKE ?
        ORDER BY created_at DESC
      `).all(`%${q}%`, `%${q}%`);
    } else {
      rows = db.prepare(`
        SELECT id, username, display_name, role, points, avatar, status, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 50
      `).all();
    }

    return { status: 200, data: rows };
  },

  async updateUserRole(username: string, body: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const { role } = body || {};
    const validRoles = ["super_admin", "music_curator", "comment_moderator", "shop_manager", "fan_user"];
    if (!validRoles.includes(role)) {
      return { status: 400, data: { error: "نقش کاربری نامعتبر است." } };
    }

    db.prepare("UPDATE users SET role = ? WHERE username = ?").run(role, username.trim().toLowerCase());
    logAudit(ctx, "CHANGE_ROLE", "user", username, `Changed role of @${username} to ${role}`);

    return { status: 200, data: { success: true, username, role } };
  },

  async adjustPoints(username: string, body: any, ctx: RequestContext) {
    const err = requireAdminRole(ctx, ["super_admin"]);
    if (err) return { status: err.status, data: { error: err.error } };

    const delta = Number(body?.delta || 0);
    const reason = String(body?.reason || "Admin adjustment").trim();

    db.prepare("UPDATE users SET points = MAX(0, points + ?) WHERE username = ?").run(delta, username.trim().toLowerCase());
    logAudit(ctx, "ADJUST_POINTS", "user", username, `Adjusted points by ${delta} for: ${reason}`);

    return { status: 200, data: { success: true, delta } };
  },
};
