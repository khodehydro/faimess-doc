/* ------------------------------------------------------------------ *
 *  FAIMESS High-Performance Production Backend Server
 *  Engineered with Node.js 22 native HTTP, SQLite with WAL mode,
 *  PBKDF2/HMAC security, tokenized streaming, and .fap DRM container.
 * ------------------------------------------------------------------ */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { initDatabase } from "./db.ts";
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  verifyAuthToken,
  type AuthTokenPayload,
} from "./security.ts";
import { authRoutes, type RequestContext } from "./routes/auth.ts";
import { trackRoutes } from "./routes/tracks.ts";
import { socialRoutes } from "./routes/social.ts";
import { lyricRoutes } from "./routes/lyrics.ts";
import { adminRoutes } from "./routes/admin.ts";

const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = "0.0.0.0";

// Initialize persistent database
initDatabase();

// ---------------------------------------------------------------------
// Helper: Parse JSON Body with Size Limit (2MB)
// ---------------------------------------------------------------------

function parseJsonBody(req: IncomingMessage, maxBytes = 2 * 1024 * 1024): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Payload Too Large"));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON Payload"));
      }
    });

    req.on("error", (err) => reject(err));
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// ---------------------------------------------------------------------
// Main HTTP Request Dispatcher
// ---------------------------------------------------------------------

export const server = createServer(async (req, res) => {
  const ip = getClientIp(req);

  // 1. Apply Defense-in-depth Security Headers
  applySecurityHeaders(res);

  // 2. CORS Handling
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 3. Sliding-window Rate Limiting
  const rateLimit = checkRateLimit(ip, "api_global", 180, 60000);
  res.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.resetInSec));
    sendJson(res, 429, { error: "درخواست‌های بیش از حد مجاز. لطفاً کمی بعد دوباره امتحان کنید." });
    return;
  }

  // 4. Extract and verify Authorization Bearer Token
  let user: AuthTokenPayload | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    user = verifyAuthToken(token);
  }

  const ctx: RequestContext = { user, ip };
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const path = parsedUrl.pathname;
  const method = req.method?.toUpperCase() || "GET";

  try {
    // -----------------------------------------------------------------
    // Health & System Metrics
    // -----------------------------------------------------------------
    if (path === "/api/health" && method === "GET") {
      sendJson(res, 200, {
        status: "healthy",
        service: "FAIMESS K-Pop Streaming Backend API",
        version: "2.0.0",
        timestamp: Date.now(),
        uptimeSeconds: Math.floor(process.uptime()),
        drm: "FAIMESS-DRM-v2 (.fap container active)",
      });
      return;
    }

    // -----------------------------------------------------------------
    // Audio Range Streaming & .fap Package Download
    // -----------------------------------------------------------------
    const isGetOrHead = method === "GET" || method === "HEAD";
    const streamMatch = path.match(/^\/api\/tracks\/([^/]+)\/stream$/);
    if (streamMatch && isGetOrHead) {
      trackRoutes.handleAudioStream(streamMatch[1], req, res);
      return;
    }

    const fapMatch = path.match(/^\/api\/tracks\/([^/]+)\/fap-download$/);
    if (fapMatch && isGetOrHead) {
      trackRoutes.handleFapDownload(fapMatch[1], req, res);
      return;
    }

    // -----------------------------------------------------------------
    // Auth Routes
    // -----------------------------------------------------------------
    if (path === "/api/auth/register" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await authRoutes.register(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/login" && method === "POST") {
      // Stricter rate limit on login attempts (10/min)
      const authLimit = checkRateLimit(ip, "auth_login", 10, 60000);
      if (!authLimit.allowed) {
        sendJson(res, 429, { error: "تلاش‌های مکرر برای ورود. لطفاً ۱ دقیقه صبر کنید." });
        return;
      }
      const body = await parseJsonBody(req);
      const result = await authRoutes.login(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/me" && method === "GET") {
      const result = await authRoutes.me(null, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/auth/profile" && (method === "PUT" || method === "POST")) {
      const body = await parseJsonBody(req);
      const result = await authRoutes.updateProfile(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    // -----------------------------------------------------------------
    // Tracks Routes
    // -----------------------------------------------------------------
    if (path === "/api/tracks" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await trackRoutes.list(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const singleTrackMatch = path.match(/^\/api\/tracks\/([^/]+)$/);
    if (singleTrackMatch && method === "GET") {
      const result = await trackRoutes.getById(singleTrackMatch[1], ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    // -----------------------------------------------------------------
    // Social & Community Routes
    // -----------------------------------------------------------------
    if (path === "/api/social/comments" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await socialRoutes.listComments(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/social/comments" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await socialRoutes.addComment(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/social/playlists" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await socialRoutes.listPlaylists(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/social/playlists" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await socialRoutes.createPlaylist(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const profileMatch = path.match(/^\/api\/social\/profile\/([^/]+)$/);
    if (profileMatch && method === "GET") {
      const result = await socialRoutes.getProfile(profileMatch[1], ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const followMatch = path.match(/^\/api\/social\/follow\/([^/]+)$/);
    if (followMatch && method === "POST") {
      const result = await socialRoutes.toggleFollow(followMatch[1], ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/social/leaderboard" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await socialRoutes.getLeaderboard(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    // -----------------------------------------------------------------
    // Lyrics & Korean Education Routes
    // -----------------------------------------------------------------
    if (path === "/api/lyrics/education" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await lyricRoutes.getEducationForLine(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/lyrics/submit" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await lyricRoutes.submitFanSheet(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    // -----------------------------------------------------------------
    // Admin RBAC Routes
    // -----------------------------------------------------------------
    if (path === "/api/admin/overview" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await adminRoutes.getOverviewStats(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    if (path === "/api/admin/tracks" && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await adminRoutes.createTrack(body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const adminTrackUpdateMatch = path.match(/^\/api\/admin\/tracks\/([^/]+)$/);
    if (adminTrackUpdateMatch) {
      if (method === "PUT" || method === "POST") {
        const body = await parseJsonBody(req);
        const result = await adminRoutes.updateTrack(adminTrackUpdateMatch[1], body, ctx);
        sendJson(res, result.status, result.data);
        return;
      }
      if (method === "DELETE") {
        const result = await adminRoutes.deleteTrack(adminTrackUpdateMatch[1], ctx);
        sendJson(res, result.status, result.data);
        return;
      }
    }

    if (path === "/api/admin/users" && method === "GET") {
      const q = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await adminRoutes.listUsers(q, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const userRoleMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
    if (userRoleMatch && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await adminRoutes.updateUserRole(userRoleMatch[1], body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    const userPointsMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/points$/);
    if (userPointsMatch && method === "POST") {
      const body = await parseJsonBody(req);
      const result = await adminRoutes.adjustPoints(userPointsMatch[1], body, ctx);
      sendJson(res, result.status, result.data);
      return;
    }

    // Default 404 for unknown endpoints
    sendJson(res, 404, { error: `اندپوینت ${method} ${path} در سرور یافت نشد.` });
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    sendJson(res, 500, { error: "خطای داخلی سرور رخ داد." });
  }
});

// Start listening if run directly
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, HOST, () => {
    console.log(`FAIMESS Security Backend Server listening on http://${HOST}:${PORT}`);
  });
}
