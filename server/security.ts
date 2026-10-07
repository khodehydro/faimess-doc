/* ------------------------------------------------------------------ *
 *  FAIMESS Backend Security Suite
 *  Cryptographic primitives, password hashing, HMAC token authentication,
 *  timing-safe verification, sliding-window rate limiting, and DRM tokens.
 * ------------------------------------------------------------------ */

import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

// Security Configuration
export const JWT_SECRET = process.env.FAIMESS_JWT_SECRET || "FAIMESS_SUPER_SECURE_JWT_SECRET_2026_987123";
export const DRM_SECRET = process.env.FAIMESS_DRM_SECRET || "FAIMESS_DRM_STREAM_SECRET_9871239847192837";
const TOKEN_TTL_SECONDS = 86400 * 7; // 7 days

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: "super_admin" | "music_curator" | "comment_moderator" | "shop_manager" | "fan_user";
  exp: number;
  iat: number;
}

// ---------------------------------------------------------------------
// 1. Password Hashing (PBKDF2-SHA512 + 32-byte Salt + 100,000 rounds)
// ---------------------------------------------------------------------

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, savedHash: string, salt: string): boolean {
  try {
    const computedHash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    const a = Buffer.from(computedHash, "hex");
    const b = Buffer.from(savedHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// 2. Cryptographic Session Token (HMAC-SHA256 Signed JWT)
// ---------------------------------------------------------------------

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64").toString("utf8");
}

export function signAuthToken(user: { id: string; username: string; role: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: AuthTokenPayload = {
    userId: user.id,
    username: user.username,
    role: (user.role as any) || "fan_user",
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", JWT_SECRET)
    .update(dataToSign)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${dataToSign}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const dataToSign = `${headerB64}.${payloadB64}`;

  const expectedSig = createHmac("sha256", JWT_SECRET)
    .update(dataToSign)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Timing-safe comparison
  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expectedSig);
  if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as AuthTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// 3. Sliding-Window Rate Limiter (Brute-Force & DDoS Mitigation)
// ---------------------------------------------------------------------

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks and increments rate limit for a client IP.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(
  ip: string,
  keyPrefix = "global",
  maxRequests = 120,
  windowMs = 60000,
): { allowed: boolean; remaining: number; resetInSec: number } {
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

// Periodic cleanup of rate limit store (every 5 mins)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetAt <= now) rateLimitStore.delete(k);
  }
}, 300000).unref();

// ---------------------------------------------------------------------
// 4. IP Hashing for Privacy-Preserving Audit Logs
// ---------------------------------------------------------------------

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

export function hashIpForAudit(ip: string): string {
  return createHash("sha256").update(`${ip}_FAIMESS_SALT_2026`).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------
// 5. Security Headers Applier
// ---------------------------------------------------------------------

export function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  );
}

// ---------------------------------------------------------------------
// 6. Audio Stream DRM Token Verification
// ---------------------------------------------------------------------

export function generateStreamToken(trackId: string, ttlSeconds = 86400): string {
  const expires = Date.now() + ttlSeconds * 1000;
  const raw = `${trackId}:${expires}`;
  const sig = createHmac("sha256", DRM_SECRET).update(raw).digest("hex").slice(0, 32);
  return Buffer.from(`${raw}:${sig}`).toString("base64url");
}

export function verifyStreamToken(token: string, trackId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [tId, expStr, sig] = decoded.split(":");
    if (tId !== trackId) return false;

    const expires = Number(expStr);
    if (!expires || Date.now() > expires) return false;

    const raw = `${tId}:${expStr}`;
    const expectedSig = createHmac("sha256", DRM_SECRET).update(raw).digest("hex").slice(0, 32);

    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
