/* ------------------------------------------------------------------ *
 *  FAIMESS Database Layer (SQLite with WAL mode)
 *  Zero-dependency, high-performance, ACID-compliant persistence
 *  utilizing Node.js 22's native DatabaseSync engine.
 * ------------------------------------------------------------------ */

import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { hashPassword } from "./security.ts";

const DB_DIR = join(process.cwd(), "server", "data");
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = join(DB_DIR, "faimess.db");
export const db = new DatabaseSync(DB_FILE);

// Enable WAL mode for high concurrency read/writes
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA synchronous = NORMAL;");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'fan_user',
      points INTEGER NOT NULL DEFAULT 100,
      avatar TEXT NOT NULL DEFAULT '/assets/photos/listeners/me.webp',
      banner TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      favorite_genre TEXT DEFAULT 'K-Pop',
      anthem_track_id TEXT DEFAULT NULL,
      bias_artist_id TEXT DEFAULT 'bts',
      referral_code TEXT UNIQUE,
      referred_by TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      duration INTEGER NOT NULL,
      audio_url TEXT NOT NULL,
      photo TEXT NOT NULL,
      plays INTEGER NOT NULL DEFAULT 1000,
      is_single INTEGER NOT NULL DEFAULT 0,
      lyrics_original TEXT DEFAULT '',
      lyrics_translation TEXT DEFAULT '',
      lyrics_romanization TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      genre TEXT NOT NULL,
      photo TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      followers_count INTEGER NOT NULL DEFAULT 12000,
      following INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      year INTEGER NOT NULL,
      photo TEXT NOT NULL,
      tracks_count INTEGER NOT NULL DEFAULT 8
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      curator TEXT NOT NULL,
      mood TEXT NOT NULL,
      photo TEXT NOT NULL,
      track_ids TEXT NOT NULL,
      is_user INTEGER NOT NULL DEFAULT 0,
      owner_username TEXT DEFAULT NULL,
      is_duo INTEGER NOT NULL DEFAULT 0,
      duo_code TEXT DEFAULT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_title TEXT NOT NULL,
      author TEXT NOT NULL,
      handle TEXT NOT NULL,
      avatar TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved',
      report_reason TEXT DEFAULT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lyric_education (
      id TEXT PRIMARY KEY,
      track_id TEXT NOT NULL,
      line_index INTEGER NOT NULL,
      korean_line TEXT NOT NULL,
      persian_line TEXT NOT NULL,
      romanization TEXT NOT NULL,
      words_json TEXT NOT NULL,
      grammar_json TEXT NOT NULL,
      nuance_notes TEXT NOT NULL,
      UNIQUE(track_id, line_index)
    );

    CREATE TABLE IF NOT EXISTS user_follows (
      follower_username TEXT NOT NULL COLLATE NOCASE,
      following_username TEXT NOT NULL COLLATE NOCASE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY(follower_username, following_username)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  seedInitialDataIfEmpty();
}

function seedInitialDataIfEmpty() {
  const usersCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any)?.count ?? 0;
  if (usersCount > 0) return;

  const now = Date.now();

  // 1. Seed Super Admin Account (admin / faimess2026!)
  const { hash: adminHash, salt: adminSalt } = hashPassword("faimess2026!");
  db.prepare(`
    INSERT INTO users (
      id, username, password_hash, salt, display_name, role, points, avatar, bio, anthem_track_id, bias_artist_id, referral_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "usr-admin",
    "admin",
    adminHash,
    adminSalt,
    "FAIMESS Super Admin",
    "super_admin",
    5000,
    "/assets/photos/listeners/seojin.webp",
    "Official FAIMESS Platform Administrator.",
    "nt1",
    "bts",
    "FAIMESS-ADMIN",
    now,
  );

  // 2. Seed Demo Fan User (demo / demo1234)
  const { hash: demoHash, salt: demoSalt } = hashPassword("demo1234");
  db.prepare(`
    INSERT INTO users (
      id, username, password_hash, salt, display_name, role, points, avatar, bio, anthem_track_id, bias_artist_id, referral_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "usr-demo",
    "faimess_fan",
    demoHash,
    demoSalt,
    "K-Pop Enthusiast",
    "fan_user",
    350,
    "/assets/photos/listeners/me.webp",
    "Passionate K-Pop listener and ARMY.",
    "nt1",
    "bts",
    "FAIMESS-FAN26",
    now,
  );

  // 3. Seed Catalog Tracks
  const defaultTracks = [
    {
      id: "nt1",
      title: "Afterglow",
      artist: "NOVAE",
      album: "Afterglow",
      duration: 218,
      audio: "/assets/audio/faimess-demo.mp3",
      photo: "/assets/photos/banners/tour-afterglow.webp",
      plays: 2450000,
      lyricsOriginal: "[00:00.00] 빛나는 밤하늘 아래서\n[00:04.20] 너의 손을 잡고 걸어가\n[00:09.10] 영원히 멈추지 않을 우리 이야기",
      lyricsTranslation: "[00:00.00] زیر آسمان درخشان شب\n[00:04.20] دستت را می‌گیرم و قدم می‌زنم\n[00:09.10] داستانی از ما که هرگز پایان نمی‌پذیرد",
      lyricsRomanization: "[00:00.00] Binnaneun bamhaneul araeseo\n[00:04.20] Neoui soneul japgo georeoga\n[00:09.10] Yeongwonhi meomchuji aneul uri iyagi",
    },
    {
      id: "nt2",
      title: "Midnight Seoul",
      artist: "AXION",
      album: "Midnight Seoul · single",
      duration: 195,
      audio: "/assets/audio/faimess-demo.mp3",
      photo: "/assets/photos/banners/midnight-seoul.webp",
      plays: 1890000,
      lyricsOriginal: "[00:00.00] 잠들지 않는 도시의 불빛\n[00:05.10] 네온사인 속으로 사라져\n[00:10.00] 밤새 달려가는 이 길 끝에",
      lyricsTranslation: "[00:00.00] چراغ‌های شهری که هرگز نمی‌خوابد\n[00:05.10] در میان تابلوهای نئونی محو می‌شوم\n[00:10.00] در انتهای این جاده که تمام شب را پیمودم",
      lyricsRomanization: "[00:00.00] Jamdeulji anneun dosiui bulbit\n[00:05.10] Neonsain sogeuro sarajyeo\n[00:10.00] Bamsae dallyeoganeun i gil kkeute",
    },
    {
      id: "nt3",
      title: "Paper Heart",
      artist: "SEORA",
      album: "Paper Heart · single",
      duration: 184,
      audio: "/assets/audio/faimess-demo.mp3",
      photo: "/assets/photos/playlists/paper-heart.webp",
      plays: 1420000,
      lyricsOriginal: "[00:00.00] 종이처럼 쉽게 구겨지는 마음\n[00:04.50] 바람에 날려 너에게로 닿을까",
      lyricsTranslation: "[00:00.00] قلبی که مثل کاغذ به آسانی مچاله می‌شود\n[00:04.50] آیا با نسیم پر می‌کشد و به تو خواهد رسید؟",
      lyricsRomanization: "[00:00.00] Jongicheoreom swipge gugyeojineun maeum\n[00:04.50] Barame nallyeo neoegero daeulkka",
    },
  ];

  const insertTrack = db.prepare(`
    INSERT INTO tracks (id, title, artist, album, duration, audio_url, photo, plays, is_single, lyrics_original, lyrics_translation, lyrics_romanization, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of defaultTracks) {
    insertTrack.run(
      t.id,
      t.title,
      t.artist,
      t.album,
      t.duration,
      t.audio,
      t.photo,
      t.plays,
      t.album.includes("single") ? 1 : 0,
      t.lyricsOriginal,
      t.lyricsTranslation,
      t.lyricsRomanization,
      now,
    );
  }

  // 4. Seed Artists
  const defaultArtists = [
    { id: "bts", name: "BTS", kind: "Boy Group", genre: "K-Pop", photo: "/assets/photos/artists/taehyun.webp" },
    { id: "blackpink", name: "BLACKPINK", kind: "Girl Group", genre: "K-Pop", photo: "/assets/photos/artists/jxnnie.webp" },
    { id: "stray-kids", name: "Stray Kids", kind: "Boy Group", genre: "Hip-Hop / K-Pop", photo: "/assets/photos/artists/kairos.webp" },
    { id: "newjeans", name: "NewJeans", kind: "Girl Group", genre: "R&B / K-Pop", photo: "/assets/photos/artists/minho.webp" },
    { id: "ar-prism9", name: "PRISM9", kind: "Group", genre: "Synth-Pop", photo: "/assets/photos/artists/prism9.webp" },
  ];

  const insertArtist = db.prepare(`
    INSERT INTO artists (id, name, kind, genre, photo, verified, followers_count, following)
    VALUES (?, ?, ?, ?, ?, 1, 4500000, 0)
  `);

  for (const a of defaultArtists) {
    insertArtist.run(a.id, a.name, a.kind, a.genre, a.photo);
  }

  // 5. Seed Curated Playlists
  const defaultPlaylists = [
    {
      id: "pl-midnight-drive",
      name: "Late Night Drive",
      curator: "FAIMESS Originals",
      mood: "Night Beats",
      photo: "/assets/photos/playlists/midnight-drive.webp",
      track_ids: JSON.stringify(["nt1", "nt2", "nt3"]),
    },
    {
      id: "pl-deep-focus",
      name: "Deep Focus K-Pop",
      curator: "FAIMESS Curators",
      mood: "Chill Study",
      photo: "/assets/photos/playlists/deep-focus.webp",
      track_ids: JSON.stringify(["nt2", "nt3"]),
    },
  ];

  const insertPlaylist = db.prepare(`
    INSERT INTO playlists (id, name, curator, mood, photo, track_ids, is_user, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `);

  for (const p of defaultPlaylists) {
    insertPlaylist.run(p.id, p.name, p.curator, p.mood, p.photo, p.track_ids, now);
  }

  // 6. Seed Sample Comments
  const insertComment = db.prepare(`
    INSERT INTO comments (id, source_type, target_id, target_title, author, handle, avatar, text, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
  `);

  insertComment.run(
    "cm-1",
    "track",
    "nt1",
    "Afterglow",
    "Sora",
    "sora_sky",
    "/assets/photos/listeners/sora.webp",
    "صدای وکال و میکس این قطعه فوق‌العاده با کیفیته!",
    now - 3600000,
  );
  insertComment.run(
    "cm-2",
    "track",
    "nt1",
    "Afterglow",
    "Haru",
    "haru_beats",
    "/assets/photos/listeners/haru.webp",
    "این ترک شاهکاره، تلفظ کلمات و رومی‌سازی هم خیلی برای یادگیری مفیده.",
    now - 1800000,
  );

  console.log("FAIMESS Database initialized and successfully seeded.");
}
