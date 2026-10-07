/* ------------------------------------------------------------------ *
 *  FAIMESS Authentication & User Routes
 *  Secure registration, PBKDF2 authentication, JWT sessions,
 *  profile editing, anthem updating, and referral reward system.
 * ------------------------------------------------------------------ */

import { db } from "../db.ts";
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  type AuthTokenPayload,
} from "../security.ts";

export interface RequestContext {
  user: AuthTokenPayload | null;
  ip: string;
}

export const authRoutes = {
  async register(body: any, ctx: RequestContext) {
    const { username, password, displayName, referralCode } = body || {};

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return { status: 400, data: { error: "نام کاربری باید حداقل ۳ کاراکتر باشد." } };
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return { status: 400, data: { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." } };
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate username
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(cleanUsername);
    if (existing) {
      return { status: 409, data: { error: "این نام کاربری قبلاً ثبت شده است." } };
    }

    // Process referral code bonus (+100 points for newcomer and referrer)
    let initialPoints = 100;
    let referredBy: string | null = null;
    if (referralCode && typeof referralCode === "string") {
      const referrer = db.prepare("SELECT username, points FROM users WHERE referral_code = ?").get(referralCode.trim().toUpperCase()) as any;
      if (referrer) {
        referredBy = referrer.username;
        initialPoints += 100;
        // Award referrer
        db.prepare("UPDATE users SET points = points + 100 WHERE username = ?").run(referrer.username);
      }
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const myReferralCode = `FM-${cleanUsername.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO users (
        id, username, password_hash, salt, display_name, role, points, referral_code, referred_by, created_at
      ) VALUES (?, ?, ?, ?, ?, 'fan_user', ?, ?, ?, ?)
    `).run(
      userId,
      cleanUsername,
      hash,
      salt,
      (displayName && String(displayName).trim()) || cleanUsername,
      initialPoints,
      myReferralCode,
      referredBy,
      now,
    );

    const token = signAuthToken({ id: userId, username: cleanUsername, role: "fan_user" });

    return {
      status: 201,
      data: {
        token,
        user: {
          id: userId,
          username: cleanUsername,
          displayName: (displayName && String(displayName).trim()) || cleanUsername,
          role: "fan_user",
          points: initialPoints,
          referralCode: myReferralCode,
          avatar: "/assets/photos/listeners/me.webp",
        },
      },
    };
  },

  async login(body: any, ctx: RequestContext) {
    const { username, password } = body || {};

    if (!username || !password) {
      return { status: 400, data: { error: "نام کاربری و رمز عبور الزامی است." } };
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, username, password_hash, salt, display_name, role, points, avatar, banner, bio, anthem_track_id, bias_artist_id, referral_code, status
      FROM users WHERE username = ?
    `).get(cleanUsername) as any;

    if (!user) {
      return { status: 401, data: { error: "نام کاربری یا رمز عبور اشتباه است." } };
    }

    if (user.status === "suspended") {
      return { status: 403, data: { error: "حساب کاربری شما توسط مدیریت تعلیق شده است." } };
    }

    const isValid = verifyPassword(String(password), user.password_hash, user.salt);
    if (!isValid) {
      return { status: 401, data: { error: "نام کاربری یا رمز عبور اشتباه است." } };
    }

    const token = signAuthToken({ id: user.id, username: user.username, role: user.role });

    return {
      status: 200,
      data: {
        token,
        user: {
          id: user.id,
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
        },
      },
    };
  },

  async me(_body: any, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "احراز هویت انجام نشده است." } };
    }

    const user = db.prepare(`
      SELECT id, username, display_name, role, points, avatar, banner, bio, anthem_track_id, bias_artist_id, referral_code
      FROM users WHERE id = ?
    `).get(ctx.user.userId) as any;

    if (!user) {
      return { status: 404, data: { error: "کاربر یافت نشد." } };
    }

    return {
      status: 200,
      data: {
        id: user.id,
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
      },
    };
  },

  async updateProfile(body: any, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "ابتدا وارد حساب کاربری خود شوید." } };
    }

    const { displayName, bio, avatar, banner, anthemTrackId, biasArtistId } = body || {};

    db.prepare(`
      UPDATE users SET
        display_name = COALESCE(?, display_name),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        banner = COALESCE(?, banner),
        anthem_track_id = ?,
        bias_artist_id = COALESCE(?, bias_artist_id)
      WHERE id = ?
    `).run(
      displayName ? String(displayName).trim() : null,
      bio !== undefined ? String(bio).trim() : null,
      avatar ? String(avatar) : null,
      banner !== undefined ? String(banner) : null,
      anthemTrackId !== undefined ? anthemTrackId : null,
      biasArtistId ? String(biasArtistId) : null,
      ctx.user.userId,
    );

    return this.me(null, ctx);
  },
};
