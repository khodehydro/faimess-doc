/* ------------------------------------------------------------------ *
 *  FAIMESS Tracks & Audio Streaming Routes
 *  High-speed catalog queries, tokenized stream endpoints,
 *  HTTP 206 Partial Content range streaming, and .fap packaging.
 * ------------------------------------------------------------------ */

import { db } from "../db.ts";
import { generateStreamToken, verifyStreamToken } from "../security.ts";
import type { RequestContext } from "./auth.ts";
import { join } from "node:path";
import { existsSync, statSync, createReadStream, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

const DEMO_AUDIO_PATH = join(process.cwd(), "src", "assets", "audio", "faimess-demo.mp3");

export const trackRoutes = {
  async list(query: any, _ctx: RequestContext) {
    const q = (query?.q || "").trim().toLowerCase();
    let rows: any[];

    if (q) {
      rows = db.prepare(`
        SELECT id, title, artist, album, duration, photo, plays, is_single
        FROM tracks
        WHERE LOWER(title) LIKE ? OR LOWER(artist) LIKE ? OR LOWER(album) LIKE ?
        ORDER BY plays DESC
      `).all(`%${q}%`, `%${q}%`, `%${q}%`);
    } else {
      rows = db.prepare(`
        SELECT id, title, artist, album, duration, photo, plays, is_single
        FROM tracks
        ORDER BY plays DESC
      `).all();
    }

    const tracks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      album: r.album,
      duration: r.duration,
      seconds: r.duration,
      photo: r.photo,
      plays: r.plays,
      isSingle: Boolean(r.is_single),
      // Secure tokenized stream link
      streamUrl: `/api/tracks/${r.id}/stream?token=${generateStreamToken(r.id)}`,
      fapDownloadUrl: `/api/tracks/${r.id}/fap-download`,
    }));

    return { status: 200, data: tracks };
  },

  async getById(id: string, _ctx: RequestContext) {
    const track = db.prepare(`
      SELECT id, title, artist, album, duration, photo, plays, is_single,
             lyrics_original, lyrics_translation, lyrics_romanization
      FROM tracks
      WHERE id = ?
    `).get(id) as any;

    if (!track) {
      return { status: 404, data: { error: "قطعه موسیقی یافت نشد." } };
    }

    return {
      status: 200,
      data: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        seconds: track.duration,
        photo: track.photo,
        plays: track.plays,
        isSingle: Boolean(track.is_single),
        streamUrl: `/api/tracks/${track.id}/stream?token=${generateStreamToken(track.id)}`,
        fapDownloadUrl: `/api/tracks/${track.id}/fap-download`,
        lyrics: {
          original: track.lyrics_original,
          translation: track.lyrics_translation,
          romanization: track.lyrics_romanization,
        },
      },
    };
  },

  /**
   * HTTP 206 Partial Content Stream Handler with DRM Token verification
   */
  handleAudioStream(
    trackId: string,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const parsedUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const token = parsedUrl.searchParams.get("token");

    // Verify DRM token
    if (!token || !verifyStreamToken(token, trackId)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "توکن استریم منقضی شده یا نامعتبر است." }));
      return;
    }

    if (!existsSync(DEMO_AUDIO_PATH)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "فایل صوتی در سرور یافت نشد." }));
      return;
    }

    const stat = statSync(DEMO_AUDIO_PATH);
    const totalSize = stat.size;
    const range = req.headers.range;

    // Increment track play count in DB asynchronously
    try {
      db.prepare("UPDATE tracks SET plays = plays + 1 WHERE id = ?").run(trackId);
    } catch {
      // non-blocking
    }

    if (range) {
      // Parse Range header e.g. "bytes=0-1024"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      });

      const stream = createReadStream(DEMO_AUDIO_PATH, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": totalSize,
        "Accept-Ranges": "bytes",
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      });

      const stream = createReadStream(DEMO_AUDIO_PATH);
      stream.pipe(res);
    }
  },

  /**
   * Encrypted .fap (FAIMESS Package) Container Download Handler
   */
  handleFapDownload(
    trackId: string,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const track = db.prepare(`
      SELECT id, title, artist, album, duration, photo, plays
      FROM tracks WHERE id = ?
    `).get(trackId) as any;

    if (!track) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "قطعه یافت نشد." }));
      return;
    }

    if (!existsSync(DEMO_AUDIO_PATH)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "فایل صوتی یافت نشد." }));
      return;
    }

    // Build .fap binary container
    const rawAudio = readFileSync(DEMO_AUDIO_PATH);
    const magicHeader = Buffer.from([0x46, 0x41, 0x50, 0x31, 0x01, 0x00, 0x00, 0x00]); // FAP1\x01\x00\x00\x00

    // Metadata block
    const meta = JSON.stringify({
      format: "FAIMESS_PACKAGE",
      version: 1,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      photo: track.photo,
      drm: {
        cipher: "FAIMESS-XOR-STREAM-V1",
        createdAt: Date.now(),
        license: "OFFLINE_PLAYBACK_AUTHORIZED",
        platform: "FAIMESS-SERVER-V1",
      },
    });

    // Keystream cipher for audio and metadata
    const metaEnc = Buffer.alloc(meta.length);
    for (let i = 0; i < meta.length; i++) {
      metaEnc[i] = meta.charCodeAt(i) ^ ((i * 31 + 17) & 0xff);
    }

    const audioEnc = Buffer.alloc(rawAudio.length);
    for (let i = 0; i < rawAudio.length; i++) {
      audioEnc[i] = rawAudio[i] ^ ((i * 31 + 17) & 0xff);
    }

    const metaLenBuf = Buffer.alloc(4);
    metaLenBuf.writeUInt32BE(metaEnc.length, 0);

    const audioLenBuf = Buffer.alloc(4);
    audioLenBuf.writeUInt32BE(audioEnc.length, 0);

    const fapBuffer = Buffer.concat([magicHeader, metaLenBuf, metaEnc, audioLenBuf, audioEnc]);
    const safeFilename = `${track.artist} - ${track.title}.fap`.replace(/[\\/:*?"<>|]/g, "_");

    res.writeHead(200, {
      "Content-Type": "application/x-faimess-package",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(safeFilename)}"`,
      "Content-Length": fapBuffer.length,
      "Access-Control-Allow-Origin": "*",
    });

    res.end(fapBuffer);
  },
};
