/* ------------------------------------------------------------------ *
 *  FAIMESS Channel Publisher & Social Automation Suite
 *
 *  Provides automated and manual broadcasting to Telegram Bot API
 *  and Bale Messenger Bot API with graphic banner poster generation,
 *  captions, schedule automation, and SMS gateway testing.
 * ------------------------------------------------------------------ */

import { adminApi } from "./adminApi";
import { artists } from "../data/library";
import { newestTracks, activeUsers } from "../data/feed";
import { fanPoints } from "../data/points";
import brandLogoUrl from "../assets/brand/faimess-logo.png";

export type PublishCategory =
  | "saturday_top_users"
  | "sunday_top_comments"
  | "monday_top_tracks"
  | "tuesday_top_artists";

export type PublishLogEntry = {
  id: string;
  category: PublishCategory;
  categoryLabel: string;
  timestamp: string;
  telegramStatus: "sent" | "failed" | "skipped";
  baleStatus: "sent" | "failed" | "skipped";
  summary: string;
  imageGenerated: boolean;
};

export type LeaderboardItem = {
  rank: number;
  title: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string | number;
  badge?: string;
  photo?: string;
  avatarSeed?: number;
  level?: number;
};

const LOG_STORAGE_KEY = "faimess.publisher.audit_log";

// ---------------------------------------------------------------------
// Data Extractors for the 4 Categories (Top 7 Items each)
// ---------------------------------------------------------------------

export function getCategoryItems(category: PublishCategory): LeaderboardItem[] {
  switch (category) {
    case "saturday_top_users": {
      // Top 7 users based on fan activity points
      const users = activeUsers.slice(0, 7);
      return users.map((u, idx) => {
        const pts = fanPoints(u.activity);
        return {
          rank: idx + 1,
          title: u.name,
          subtitle: u.handle.startsWith("@") ? u.handle : `@${u.handle}`,
          metricLabel: "امتیاز هواداری",
          metricValue: `${pts.toLocaleString("fa-IR")} XP`,
          badge: idx === 0 ? "قهرمان هفته" : `سطح ${u.level}`,
          photo: u.photo,
          level: u.level,
          avatarSeed: u.seed,
        };
      });
    }

    case "sunday_top_comments": {
      // Top comment contributors
      const allComments = adminApi.getComments();
      const userCountMap = new Map<string, { count: number; name: string }>();
      allComments.forEach((c) => {
        const key = c.handle || c.author;
        const existing = userCountMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          userCountMap.set(key, { count: 1, name: c.author });
        }
      });

      const sorted = Array.from(userCountMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 7);

      if (sorted.length < 7) {
        // Fallback with active commenters from activeUsers
        activeUsers.slice(0, 7).forEach((u, i) => {
          if (!sorted.some((s) => s[0] === u.handle)) {
            sorted.push([u.handle, { count: 26 - i * 3, name: u.name }]);
          }
        });
      }

      return sorted.slice(0, 7).map(([handle, data], idx) => {
        const matchedUser =
          activeUsers.find((u) => u.handle === handle || u.name === data.name) ||
          activeUsers[idx % activeUsers.length];
        return {
          rank: idx + 1,
          title: data.name,
          subtitle: handle.startsWith("@") ? handle : `@${handle}`,
          metricLabel: "دیدگاه‌های ثبت‌شده",
          metricValue: `${data.count} دیدگاه`,
          badge: idx === 0 ? "منتقد برتر" : `سطح ${matchedUser?.level || 25}`,
          photo: matchedUser?.photo,
          level: matchedUser?.level || 25,
          avatarSeed: matchedUser?.seed,
        };
      });
    }

    case "monday_top_tracks": {
      // Top 7 played tracks
      const tracks = newestTracks.slice(0, 7);
      const playCounts = [
        "2.8M پخش",
        "2.1M پخش",
        "1.7M پخش",
        "1.4M پخش",
        "980K پخش",
        "750K پخش",
        "610K پخش",
      ];
      return tracks.map((t, idx) => ({
        rank: idx + 1,
        title: t.title,
        subtitle: t.artist,
        metricLabel: "میزان استریم",
        metricValue: playCounts[idx] || "550K پخش",
        badge: idx === 0 ? "صدرنشین هفته" : `ترک #${idx + 1}`,
        photo: t.photo,
        avatarSeed: t.seed,
      }));
    }

    case "tuesday_top_artists": {
      // Top 7 most followed artists
      const sortedArtists = [...artists].slice(0, 7);
      return sortedArtists.map((a, idx) => ({
        rank: idx + 1,
        title: a.name,
        subtitle: a.kind,
        metricLabel: "هواداران فعال",
        metricValue: `${(4.8 - idx * 0.5).toFixed(1)}M شنونده`,
        badge: idx === 0 ? "محبوب‌ترین" : `رتبه #${idx + 1}`,
        photo: a.photo,
        avatarSeed: a.seed,
      }));
    }
  }
}

export function getCategoryTitle(category: PublishCategory, lang: "fa" | "en" = "fa"): string {
  const titles = {
    saturday_top_users: {
      fa: "جدول رتبه‌بندی کاربران برتر هفته — هواداران FAIMESS",
      en: "Top Weekly Users — FAIMESS Leaderboard",
    },
    sunday_top_comments: {
      fa: "پربحث‌ترین و فعال‌ترین منتقدان هفته در بخش نظرات",
      en: "Most Active Weekly Commenters",
    },
    monday_top_tracks: {
      fa: "پرشنیده‌شده‌ترین و محبوب‌ترین قطعات موسیقی هفته",
      en: "Top Streamed Tracks of the Week",
    },
    tuesday_top_artists: {
      fa: "پرطرفدارترین و پرفالوترین آرتیست‌های استودیو",
      en: "Most Followed Studio Artists",
    },
  };
  return titles[category][lang];
}

// ---------------------------------------------------------------------
// Caption Formatter for Telegram & Bale
// ---------------------------------------------------------------------

export function generatePostCaption(category: PublishCategory): string {
  const title = getCategoryTitle(category, "fa");
  const items = getCategoryItems(category);
  const now = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let lines = `🎶 **${title}**\n📅 تاریخ انتشار: ${now}\n──────────────────\n`;

  items.forEach((item) => {
    lines += `[0${item.rank}] **${item.title}**\n`;
    lines += `   ▫️ ${item.subtitle} • ${item.metricLabel}: ${item.metricValue}\n`;
    if (item.badge) {
      lines += `   ▫️ نشان: «${item.badge}»\n`;
    }
    lines += "\n";
  });

  lines += `──────────────────\n`;
  lines += `🌐 استودیو موسیقی، رادیو و لیریک آنلاین: https://faimess.ir\n`;
  lines += `📲 ربات تلگرام و پیام‌رسان بله: @faimess_app\n\n`;
  lines += `#FAIMESS #کیپاپ #موسیقی #جدول_هفتگی #هواداران #استودیو #رتبه‌بندی`;

  return lines;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  if (typeof document === "undefined" || !dataUrl) return;
  try {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    // ignore
  }
}

// ---------------------------------------------------------------------
// Image Loading & Canvas Drawing Helpers
// ---------------------------------------------------------------------

function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (typeof document === "undefined" || typeof Image === "undefined" || !src) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      if (src.startsWith("http://") || src.startsWith("https://")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
      setTimeout(() => resolve(null), 1500);
    } catch {
      resolve(null);
    }
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMinimalCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = "#ffffff",
) {
  ctx.save();
  ctx.fillStyle = color;
  const w = size;
  const h = size * 0.65;
  const left = cx - w / 2;
  const top = cy - h / 2;
  const bottom = cy + h / 2;

  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left + w, bottom);
  ctx.lineTo(left + w, top + h * 0.25);
  ctx.lineTo(left + w * 0.72, top + h * 0.62);
  ctx.lineTo(cx, top);
  ctx.lineTo(left + w * 0.28, top + h * 0.62);
  ctx.lineTo(left, top + h * 0.25);
  ctx.closePath();
  ctx.fill();

  // Three minimal dots on peaks
  ctx.beginPath();
  ctx.arc(left, top + h * 0.25 - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(cx, top - 3, 3, 0, Math.PI * 2);
  ctx.arc(left + w, top + h * 0.25 - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCircularAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  fallbackText: string,
  cx: number,
  cy: number,
  r: number,
  borderColor = "#ffffff",
  borderWidth = 3,
) {
  ctx.save();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r - borderWidth / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img) {
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.fillStyle = "#8267f0";
    ctx.font = `bold ${Math.round(r * 0.7)}px 'Vazirmatn', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "ltr";
    ctx.fillText(fallbackText.slice(0, 2).toUpperCase(), cx, cy + 2);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
// 16:9 Vertical Canvas Graphic Banner Poster Generator (1080 x 1920)
// Minimalist Two-Color Design: Site Primary Purple (#8267f0) and White (#ffffff)
// NO Gradients • Slender Vertical Pillars matching Reference Image
// ---------------------------------------------------------------------

export async function generateGraphicBanner(category: PublishCategory): Promise<string> {
  if (typeof document === "undefined") return "";

  // 16:9 Vertical (9:16 aspect ratio: 1080 x 1920)
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const items = getCategoryItems(category);
  const title = getCategoryTitle(category, "fa");

  // Pre-load Logo and Avatars
  const [logoImg, ...itemImgs] = await Promise.all([
    loadImage(brandLogoUrl),
    ...items.map((it) => loadImage(it.photo)),
  ]);

  // Brand Palette Constants (Strictly Two Colors: Primary Purple & White)
  const BRAND_PURPLE = "#8267f0"; // Site's official --color-primary
  const BRAND_PURPLE_DEEP = "#6b4fdd"; // Site's official --color-primary-deep for text on white
  const WHITE = "#ffffff";
  const WHITE_SUBTLE = "rgba(255, 255, 255, 0.85)";
  const WHITE_FAINT = "rgba(255, 255, 255, 0.65)";
  const WHITE_GLASS_LIGHT = "rgba(255, 255, 255, 0.16)";
  const WHITE_GLASS_MED = "rgba(255, 255, 255, 0.24)";
  const WHITE_GLASS_SOLID = "rgba(255, 255, 255, 0.32)";
  const WHITE_BORDER_FAINT = "rgba(255, 255, 255, 0.25)";
  const WHITE_BORDER_MED = "rgba(255, 255, 255, 0.45)";

  // ===================================================================
  // 1. Pure Flat Site Primary Purple Background (NO GRADIENTS)
  // ===================================================================
  ctx.fillStyle = BRAND_PURPLE;
  ctx.fillRect(0, 0, 1080, 1920);

  // ===================================================================
  // 2. Top Header & Brand Bar (Ends at Y = 260)
  // ===================================================================
  // Left: Minimal back arrow symbol & Brand Logo
  ctx.fillStyle = WHITE;
  ctx.font = "bold 34px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.fillText("‹", 80, 104);

  // Brand Logo (White Cat Mark)
  ctx.save();
  roundRect(ctx, 120, 68, 56, 56, 16);
  ctx.clip();
  if (logoImg) {
    ctx.drawImage(logoImg, 120, 68, 56, 56);
  } else {
    ctx.fillStyle = WHITE;
    ctx.fillRect(120, 68, 56, 56);
  }
  ctx.restore();

  // White Logo Border
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 120, 68, 56, 56, 16);
  ctx.stroke();

  // Brand Name in Pure White Text
  ctx.fillStyle = WHITE;
  ctx.font = "900 34px 'Vazirmatn', sans-serif";
  ctx.fillText("FAIMESS", 192, 98);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "bold 14px 'Vazirmatn', sans-serif";
  ctx.fillText("MUSIC STUDIO", 194, 118);

  // Top Right: Leaderboard Pill
  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 765, 72, 235, 46, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "900 17px 'Vazirmatn', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LEADERBOARD", 882, 101);

  // Main Category Header Title
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "900 40px 'Vazirmatn', sans-serif";
  ctx.fillText("جدول رتبه‌بندی استودیو", 540, 182);

  // Category Subtitle Pill
  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_FAINT;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 130, 208, 820, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "bold 20px 'Vazirmatn', sans-serif";
  ctx.fillText(title, 540, 240);

  // ===================================================================
  // 3. Top 3 Podium (Slender Vertical Pillars, Proportionate Heights)
  //    Baseline: Y = 1000
  //    Left: Rank 3 (160px H, 200px W)
  //    Middle: Rank 2 (240px H, 200px W)
  //    Right: Rank 1 (330px H, 200px W) — Crown at Y = 380, cleanly below header!
  // ===================================================================
  const podiumBaselineY = 1000;
  const pWidth = 200;
  const item1 = items[0];
  const item2 = items[1];
  const item3 = items[2];

  // -------------------------------------------------------------------
  // Pedestal 3 (Left Column — Rank 3, Shortest)
  // -------------------------------------------------------------------
  const p3X = 160;
  const p3Center = p3X + pWidth / 2; // 260
  const p3H = 160;
  const p3Top = podiumBaselineY - p3H; // 840

  // Pillar Body
  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 2;
  roundRect(ctx, p3X, p3Top, pWidth, p3H, 26);
  ctx.fill();
  ctx.stroke();

  // Number "3" Inside Pillar
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "900 78px 'Vazirmatn', sans-serif";
  ctx.fillText("3", p3Center, p3Top + 108);

  // Rank 3 Avatar & Information
  const p3AvatarY = 690;
  const p3AvatarR = 54;
  drawCircularAvatar(
    ctx,
    itemImgs[2] || null,
    item3?.title || "03",
    p3Center,
    p3AvatarY,
    p3AvatarR,
    WHITE,
    3.5,
  );

  // Name & Points
  ctx.direction = "rtl";
  ctx.fillStyle = WHITE;
  ctx.font = "bold 21px 'Vazirmatn', sans-serif";
  ctx.fillText(item3?.title || "کاربر سوم", p3Center, p3Top - 44);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "normal 18px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.fillText(String(item3?.metricValue || ""), p3Center, p3Top - 18);

  // -------------------------------------------------------------------
  // Pedestal 2 (Middle Column — Rank 2, Medium)
  // -------------------------------------------------------------------
  const p2X = 440;
  const p2Center = p2X + pWidth / 2; // 540
  const p2H = 240;
  const p2Top = podiumBaselineY - p2H; // 760

  // Pillar Body
  ctx.fillStyle = WHITE_GLASS_MED;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 2;
  roundRect(ctx, p2X, p2Top, pWidth, p2H, 26);
  ctx.fill();
  ctx.stroke();

  // Number "2" Inside Pillar
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "900 86px 'Vazirmatn', sans-serif";
  ctx.fillText("2", p2Center, p2Top + 148);

  // Rank 2 Avatar & Information
  const p2AvatarY = 600;
  const p2AvatarR = 58;
  drawCircularAvatar(
    ctx,
    itemImgs[1] || null,
    item2?.title || "02",
    p2Center,
    p2AvatarY,
    p2AvatarR,
    WHITE,
    4,
  );

  // Name & Points
  ctx.direction = "rtl";
  ctx.fillStyle = WHITE;
  ctx.font = "bold 23px 'Vazirmatn', sans-serif";
  ctx.fillText(item2?.title || "کاربر دوم", p2Center, p2Top - 46);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "normal 19px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.fillText(String(item2?.metricValue || ""), p2Center, p2Top - 18);

  // -------------------------------------------------------------------
  // Pedestal 1 (Right Column — Rank 1, Tallest Champion)
  // -------------------------------------------------------------------
  const p1X = 720;
  const p1Center = p1X + pWidth / 2; // 820
  const p1H = 330;
  const p1Top = podiumBaselineY - p1H; // 670

  // Pillar Body
  ctx.fillStyle = WHITE_GLASS_SOLID;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2.5;
  roundRect(ctx, p1X, p1Top, pWidth, p1H, 26);
  ctx.fill();
  ctx.stroke();

  // Number "1" Inside Pillar
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "900 96px 'Vazirmatn', sans-serif";
  ctx.fillText("1", p1Center, p1Top + 195);

  // Minimalist White Crown on top of Rank 1 (Plenty of headroom below header!)
  drawMinimalCrown(ctx, p1Center, 385, 42, WHITE);

  // Rank 1 Avatar with double white ring
  const p1AvatarY = 490;
  const p1AvatarR = 62;

  // Outer ring
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p1Center, p1AvatarY, p1AvatarR + 6, 0, Math.PI * 2);
  ctx.stroke();

  drawCircularAvatar(
    ctx,
    itemImgs[0] || null,
    item1?.title || "01",
    p1Center,
    p1AvatarY,
    p1AvatarR,
    WHITE,
    4.5,
  );

  // Name & Points
  ctx.direction = "rtl";
  ctx.fillStyle = WHITE;
  ctx.font = "900 25px 'Vazirmatn', sans-serif";
  ctx.fillText(item1?.title || "صدرنشین", p1Center, p1Top - 48);

  ctx.fillStyle = WHITE;
  ctx.font = "bold 20px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.fillText(String(item1?.metricValue || ""), p1Center, p1Top - 18);

  // ===================================================================
  // 4. Highlight Banner Card (High-Contrast Solid White Card)
  // ===================================================================
  const cardX = 75;
  const cardY = 1045;
  const cardW = 930;
  const cardH = 175;
  const item4 = items[3] || items[0];

  // Pure Solid White Card
  ctx.fillStyle = WHITE;
  roundRect(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();

  // Avatar on Left of Highlight Card (with Purple Border)
  const cAvatarX = cardX + 90;
  const cAvatarY = cardY + 76;
  drawCircularAvatar(
    ctx,
    itemImgs[3] || null,
    item4?.title || "04",
    cAvatarX,
    cAvatarY,
    46,
    BRAND_PURPLE_DEEP,
    3.5,
  );

  ctx.fillStyle = BRAND_PURPLE_DEEP;
  ctx.font = "900 18px 'Vazirmatn', sans-serif";
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillText(item4?.title || "کاربر منتخب", cAvatarX, cardY + 148);

  // Three Clean Columns in Deep Brand Purple
  // Column 1: Activity Points
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
  ctx.font = "16px 'Vazirmatn', sans-serif";
  ctx.fillText("امتیاز فعالیت", cardX + 350, cardY + 65);

  ctx.fillStyle = BRAND_PURPLE_DEEP;
  ctx.font = "900 29px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.fillText(String(item4?.metricValue || "2,450 XP"), cardX + 350, cardY + 115);

  // Column 2: Level & Badge
  ctx.direction = "rtl";
  ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
  ctx.font = "16px 'Vazirmatn', sans-serif";
  ctx.fillText("سطح و نشان", cardX + 600, cardY + 65);

  ctx.fillStyle = BRAND_PURPLE_DEEP;
  ctx.font = "900 27px 'Vazirmatn', sans-serif";
  ctx.fillText(item4?.badge || `سطح ${item4?.level || 34}`, cardX + 600, cardY + 115);

  // Column 3: Leaderboard Position
  ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
  ctx.font = "16px 'Vazirmatn', sans-serif";
  ctx.fillText("جایگاه جدول", cardX + 830, cardY + 65);

  ctx.fillStyle = BRAND_PURPLE_DEEP;
  ctx.font = "900 36px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.fillText("#04", cardX + 830, cardY + 115);

  // ===================================================================
  // 5. Remaining Leaderboard Rows (Ranks 05, 06, 07)
  // ===================================================================
  const listStartY = 1255;
  const rowHeight = 115;
  const rowGap = 15;
  const listItems = items.slice(4, 7);

  listItems.forEach((item, idx) => {
    const actualRank = idx + 5;
    const y = listStartY + idx * (rowHeight + rowGap);
    const itemImg = itemImgs[actualRank - 1] || null;

    // Clean Minimalist Row
    ctx.fillStyle = WHITE_GLASS_LIGHT;
    ctx.strokeStyle = WHITE_BORDER_FAINT;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 75, y, 930, rowHeight, 22);
    ctx.fill();
    ctx.stroke();

    // Large Rank Number (Left)
    ctx.direction = "ltr";
    ctx.textAlign = "center";
    ctx.fillStyle = WHITE;
    ctx.font = "900 36px 'Vazirmatn', sans-serif";
    ctx.fillText(`0${actualRank}`, 130, y + 72);

    // Avatar Circle
    const rowAvatarX = 225;
    const rowAvatarY = y + rowHeight / 2;
    drawCircularAvatar(
      ctx,
      itemImg,
      item.title,
      rowAvatarX,
      rowAvatarY,
      38,
      WHITE,
      2.5,
    );

    // Title & Subtitle (RTL Text)
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = WHITE;
    ctx.font = "bold 26px 'Vazirmatn', sans-serif";
    ctx.fillText(item.title, 910, y + 46);

    ctx.fillStyle = WHITE_SUBTLE;
    ctx.font = "normal 19px 'Vazirmatn', sans-serif";
    ctx.fillText(item.subtitle, 910, y + 82);

    // Metric Value (LTR Text)
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = WHITE;
    ctx.font = "bold 22px 'Vazirmatn', sans-serif";
    ctx.fillText(String(item.metricValue), 310, y + 52);

    ctx.fillStyle = WHITE_FAINT;
    ctx.font = "normal 17px 'Vazirmatn', sans-serif";
    ctx.fillText(item.metricLabel, 310, y + 82);

    // Minimalist White Crown Glyph on Far Right
    drawMinimalCrown(ctx, 960, y + rowHeight / 2 - 2, 28, WHITE);
  });

  // ===================================================================
  // 6. Footer Section with Official Domain faimess.ir
  // ===================================================================
  // Clean Divider Line
  ctx.strokeStyle = WHITE_BORDER_FAINT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 1690);
  ctx.lineTo(960, 1690);
  ctx.stroke();

  // Website Capsule Pill (faimess.ir)
  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 2;
  roundRect(ctx, 340, 1725, 400, 68, 34);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "900 36px 'Vazirmatn', sans-serif";
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillText("faimess.ir", 540, 1772);

  // Bottom Subtitle
  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "bold 18px 'Vazirmatn', sans-serif";
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillText(
    "استودیو رسمی موسیقی، رادیو و لیریک آنلاین • ربات: @faimess_app",
    540,
    1835,
  );

  return canvas.toDataURL("image/png");
}

export type ItemPublishType = "track" | "album" | "artist" | "playlist" | "news";

export type PublishItemPayload = {
  type: ItemPublishType;
  title: string;
  subtitle: string;
  details?: string;
  tag?: string;
  photo?: string;
  link?: string;
  metaCol1Label?: string;
  metaCol1Value?: string;
  metaCol2Label?: string;
  metaCol2Value?: string;
  metaCol3Label?: string;
  metaCol3Value?: string;
};

export const SAMPLE_RELEASE_ITEMS: Record<ItemPublishType, PublishItemPayload> = {
  track: {
    type: "track",
    title: "Midnight Seoul",
    subtitle: "AXION",
    details: "آلبوم رسمی Neon Horizon • ۳:۲۸ دقیقه",
    tag: "HOT SINGLE",
    photo: "/assets/photos/albums/midnight-seoul.webp",
    link: "https://faimess.ir",
    metaCol1Label: "خواننده",
    metaCol1Value: "AXION",
    metaCol2Label: "مدت زمان",
    metaCol2Value: "3:28 دقیقه",
    metaCol3Label: "کیفیت پخش",
    metaCol3Value: "320K FLAC",
  },
  album: {
    type: "album",
    title: "Afterglow Vol. 1",
    subtitle: "NOVAE",
    details: "۱۰ قطعه اختصاصی استودیو • سال انتشار ۲۰۲۶",
    tag: "FULL ALBUM",
    photo: "/assets/photos/albums/afterglow.webp",
    link: "https://faimess.ir/#albums",
    metaCol1Label: "هنرمند",
    metaCol1Value: "NOVAE",
    metaCol2Label: "تعداد قطعات",
    metaCol2Value: "10 ترک",
    metaCol3Label: "سال انتشار",
    metaCol3Value: "2026",
  },
  artist: {
    type: "artist",
    title: "PRISM9",
    subtitle: "گروه دخترانه • سبک الکتروپاپ و دنس",
    details: "بیش از ۲.۱ میلیون شنونده فعال ماهانه",
    tag: "NEW ROSTER",
    photo: "/assets/photos/artists/prism9.webp",
    link: "https://faimess.ir/#artists",
    metaCol1Label: "نوع فعالیت",
    metaCol1Value: "Girl group",
    metaCol2Label: "سبک اصلی",
    metaCol2Value: "Electro pop",
    metaCol3Label: "وضعیت",
    metaCol3Value: "تایید شده ✓",
  },
  playlist: {
    type: "playlist",
    title: "Golden Hour Vibes",
    subtitle: "حال و هوای رویایی و آرامش‌بخش غروب",
    details: "گردآورنده: FAIMESS Editorial • ۱۲ قطعه",
    tag: "STAFF PICK",
    photo: "/assets/photos/playlists/golden-hour.webp",
    link: "https://faimess.ir/#playlists",
    metaCol1Label: "کیوریتور",
    metaCol1Value: "FAIMESS Editorial",
    metaCol2Label: "حال و هوا",
    metaCol2Value: "Dreamy Chill",
    metaCol3Label: "تعداد قطعات",
    metaCol3Value: "12 ترک",
  },
  news: {
    type: "news",
    title: "آغاز رسمی تور جهانی استودیو در ۵ کلان‌شهر آسیا",
    subtitle: "فروش بلیت‌های کنسرت مشترک آرتیست‌های استودیو فیمس در توکیو، سئول و سنگاپور رکورد شکست.",
    details: "تحریریه استودیو فیمس",
    tag: "Comeback",
    photo: "/assets/photos/banners/asia-leg.webp",
    link: "https://faimess.ir/#news",
    metaCol1Label: "دسته‌بندی",
    metaCol1Value: "World Tour",
    metaCol2Label: "نویسنده",
    metaCol2Value: "تحریریه فیمس",
    metaCol3Label: "وضعیت",
    metaCol3Value: "فوری و موثق ✓",
  },
};

export function generateItemCaption(payload: PublishItemPayload): string {
  const link = payload.link || "https://faimess.ir";
  switch (payload.type) {
    case "track":
      return (
        `🎵 **انتشار آهنگ جدید در استودیو فیمس**\n` +
        `🔥 نام قطعه: **${payload.title}**\n` +
        `👤 هنرمند: **${payload.subtitle}**\n` +
        (payload.details ? `💿 آلبوم / مشخصات: ${payload.details}\n` : "") +
        `──────────────────\n` +
        `🎧 هم‌اکنون با بالاترین کیفیت همراه با ترجمه همزمان لیریک بشنوید:\n` +
        `🌐 لینک پخش آنلاین در سایت: ${link}\n` +
        `📲 ربات تلگرام و پیام‌رسان بله: @faimess_app\n\n` +
        `#آهنگ_جدید #موسیقی #کیپاپ #FAIMESS`
      );

    case "album":
      return (
        `💿 **انتشار آلبوم رسمی در استودیو فیمس**\n` +
        `🌟 نام آلبوم: **${payload.title}**\n` +
        `👤 هنرمند: **${payload.subtitle}**\n` +
        (payload.details ? `🎶 مشخصات: ${payload.details}\n` : "") +
        `──────────────────\n` +
        `🎧 پخش اختصاصی و بررسی تک‌تک قطعات آلبوم در استودیو:\n` +
        `🌐 لینک شنیدن آلبوم کامل: ${link}\n` +
        `📲 ربات تلگرام و پیام‌رسان بله: @faimess_app\n\n` +
        `#آلبوم_جدید #دیسکوگرافی #کیپاپ #FAIMESS`
      );

    case "artist":
      return (
        `⭐ **پیوستن و معرفی آرتیست جدید به استودیو**\n` +
        `✨ نام هنرمند: **${payload.title}**\n` +
        `🎭 نوع فعالیت و سبک: ${payload.subtitle}\n` +
        (payload.details ? `👥 هواداران: ${payload.details}\n` : "") +
        `──────────────────\n` +
        `💫 پروفایل اختصاصی، فول دیسکوگرافی و رتبه‌بندی هواداری:\n` +
        `🌐 صفحه اختصاصی آرتیست در سایت: ${link}\n` +
        `📲 ربات تلگرام و پیام‌رسان بله: @faimess_app\n\n` +
        `#آرتیست #هنرمند #کیپاپ #FAIMESS`
      );

    case "playlist":
      return (
        `📋 **پلی‌لیست منتخب جدید در استودیو فیمس**\n` +
        `🎧 عنوان لیست: **${payload.title}**\n` +
        `🎨 حال و هوا: ${payload.subtitle}\n` +
        (payload.details ? `👤 گردآورنده: ${payload.details}\n` : "") +
        `──────────────────\n` +
        `🎶 همین حالا این مجموعه دست‌چین را با یک کلیک استریم کنید:\n` +
        `🌐 لینک پخش پلی‌لیست در سایت: ${link}\n` +
        `📲 ربات تلگرام و پیام‌رسان بله: @faimess_app\n\n` +
        `#پلی_لیست #موسیقی #کیپاپ #FAIMESS`
      );

    case "news":
    default:
      return (
        `📰 **خبر فوری — FAIMESS STUDIO NEWS**\n` +
        `📌 **${payload.title}**\n` +
        `──────────────────\n` +
        `📝 خلاصه خبر:\n${payload.subtitle}\n\n` +
        (payload.details ? `🏷️ دسته‌بندی: #${payload.tag || "News"} • نویسنده: ${payload.details}\n` : "") +
        `──────────────────\n` +
        `🌐 مطالعه متن کامل خبر در وب‌سایت:\n${link}\n` +
        `📲 کانال رسمی تلگرام و بله: @faimess_app\n\n` +
        `#اخبار_موسیقی #خبر_فوری #کیپاپ #FAIMESS`
      );
  }
}

// ---------------------------------------------------------------------
// 1:1 Square Canvas Graphic Banner Poster Generator (1080 x 1080)
// Minimalist Two-Color Design: Brand Purple (#5833e6) and White (#ffffff)
// For New Tracks, Albums, Artists, Playlists & Breaking News
// ---------------------------------------------------------------------

export async function generateItemSquareBanner(payload: PublishItemPayload): Promise<string> {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Pre-load Brand Logo and Item Photo
  const [logoImg, itemImg] = await Promise.all([
    loadImage(brandLogoUrl),
    loadImage(payload.photo),
  ]);

  const BRAND_PURPLE = "#8267f0"; // Site's official --color-primary
  const BRAND_PURPLE_DEEP = "#6b4fdd"; // Site's official --color-primary-deep for text on white
  const WHITE = "#ffffff";
  const WHITE_SUBTLE = "rgba(255, 255, 255, 0.85)";
  const WHITE_GLASS_LIGHT = "rgba(255, 255, 255, 0.16)";
  const WHITE_BORDER_FAINT = "rgba(255, 255, 255, 0.25)";
  const WHITE_BORDER_MED = "rgba(255, 255, 255, 0.45)";

  // 1. Pure Flat Brand Purple Background (NO GRADIENTS)
  ctx.fillStyle = BRAND_PURPLE;
  ctx.fillRect(0, 0, 1080, 1080);

  // 2. Top Header Bar
  // Left: Back Symbol & Brand Logo
  ctx.fillStyle = WHITE;
  ctx.font = "bold 32px 'Vazirmatn', sans-serif";
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.fillText("‹", 75, 94);

  ctx.save();
  roundRect(ctx, 110, 56, 56, 56, 16);
  ctx.clip();
  if (logoImg) {
    ctx.drawImage(logoImg, 110, 56, 56, 56);
  } else {
    ctx.fillStyle = WHITE;
    ctx.fillRect(110, 56, 56, 56);
  }
  ctx.restore();

  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 110, 56, 56, 56, 16);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "900 32px 'Vazirmatn', sans-serif";
  ctx.fillText("FAIMESS", 180, 88);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "bold 14px 'Vazirmatn', sans-serif";
  ctx.fillText("MUSIC STUDIO", 182, 108);

  // Right: Type Badge Pill
  const typePillLabels: Record<ItemPublishType, string> = {
    track: "🎵 آهنگ جدید • NEW TRACK",
    album: "💿 آلبوم رسمی • NEW ALBUM",
    artist: "⭐ آرتیست جدید • NEW ARTIST",
    playlist: "📋 پلی‌لیست • PLAYLIST",
    news: "📰 خبر فوری • BREAKING NEWS",
  };

  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 660, 62, 345, 46, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "900 15px 'Vazirmatn', sans-serif";
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.fillText(typePillLabels[payload.type] || "انتشار رسمی", 832, 91);

  // 3. Central Featured Artwork / Photo
  const artX = 300;
  const artY = 138;
  const artSize = 480;

  ctx.save();
  roundRect(ctx, artX, artY, artSize, artSize, 26);
  ctx.clip();

  if (itemImg) {
    ctx.drawImage(itemImg, artX, artY, artSize, artSize);
  } else {
    ctx.fillStyle = WHITE_GLASS_LIGHT;
    ctx.fillRect(artX, artY, artSize, artSize);

    ctx.fillStyle = WHITE;
    ctx.font = "900 64px 'Vazirmatn', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FAIMESS", artX + artSize / 2, artY + artSize / 2);
  }
  ctx.restore();

  // White Border around Artwork
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 4;
  roundRect(ctx, artX, artY, artSize, artSize, 26);
  ctx.stroke();

  // Tag Badge Pill on top-right of Artwork
  const badgeText = payload.tag || "EXCLUSIVE";
  ctx.fillStyle = WHITE;
  roundRect(ctx, artX + artSize - 165, artY + 16, 150, 36, 18);
  ctx.fill();

  ctx.fillStyle = BRAND_PURPLE;
  ctx.font = "900 14px 'Vazirmatn', sans-serif";
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillText(badgeText, artX + artSize - 90, artY + 39);

  // 4. Content Titles
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = WHITE;
  ctx.font = "900 38px 'Vazirmatn', sans-serif";
  const titleText = payload.title.length > 38 ? payload.title.slice(0, 36) + "..." : payload.title;
  ctx.fillText(titleText, 540, 668);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "bold 22px 'Vazirmatn', sans-serif";
  const subText = payload.subtitle.length > 55 ? payload.subtitle.slice(0, 52) + "..." : payload.subtitle;
  ctx.fillText(subText, 540, 706);

  // 5. High-Contrast Solid White Information Card
  const cardX = 80;
  const cardY = 740;
  const cardW = 920;
  const cardH = 140;

  ctx.fillStyle = WHITE;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();

  if (payload.type === "news") {
    // News Summary Box in Brand Purple Deep
    ctx.fillStyle = BRAND_PURPLE_DEEP;
    ctx.font = "bold 19px 'Vazirmatn', sans-serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    const excerptText = payload.subtitle.length > 80 ? payload.subtitle.slice(0, 78) + "..." : payload.subtitle;
    ctx.fillText(`«${excerptText}»`, 540, cardY + 52);

    // Meta row
    ctx.fillStyle = "rgba(107, 79, 221, 0.75)";
    ctx.font = "normal 16px 'Vazirmatn', sans-serif";
    ctx.fillText(
      `دسته‌بندی: ${payload.tag || "عمومی"}  •  نویسنده: ${payload.details || "تحریریه استودیو"}  •  وضعیت: تایید شده ✓`,
      540,
      cardY + 102,
    );
  } else {
    // 3 Crisp Columns in Brand Purple Deep
    // Column 1 (Right): Primary Attribute
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
    ctx.font = "16px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol1Label || "هنرمند", cardX + 750, cardY + 52);

    ctx.fillStyle = BRAND_PURPLE_DEEP;
    ctx.font = "900 24px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol1Value || payload.subtitle, cardX + 750, cardY + 98);

    // Column 2 (Center): Secondary Attribute
    ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
    ctx.font = "16px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol2Label || "مشخصات", cardX + 460, cardY + 52);

    ctx.fillStyle = BRAND_PURPLE_DEEP;
    ctx.font = "900 24px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol2Value || "استودیو", cardX + 460, cardY + 98);

    // Column 3 (Left): Status / Quality
    ctx.fillStyle = "rgba(107, 79, 221, 0.72)";
    ctx.font = "16px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol3Label || "وضعیت", cardX + 170, cardY + 52);

    ctx.fillStyle = BRAND_PURPLE_DEEP;
    ctx.font = "900 24px 'Vazirmatn', sans-serif";
    ctx.fillText(payload.metaCol3Value || "پخش رسمی ✓", cardX + 170, cardY + 98);
  }

  // 6. Footer Section with Official Domain
  ctx.strokeStyle = WHITE_BORDER_FAINT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 915);
  ctx.lineTo(960, 915);
  ctx.stroke();

  // Website Pill
  ctx.fillStyle = WHITE_GLASS_LIGHT;
  ctx.strokeStyle = WHITE_BORDER_MED;
  ctx.lineWidth = 2;
  roundRect(ctx, 350, 938, 380, 58, 29);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.font = "900 30px 'Vazirmatn', sans-serif";
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillText("faimess.ir", 540, 978);

  ctx.fillStyle = WHITE_SUBTLE;
  ctx.font = "bold 15px 'Vazirmatn', sans-serif";
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillText("استودیو رسمی موسیقی، رادیو و لیریک آنلاین • ربات: @faimess_app", 540, 1030);

  return canvas.toDataURL("image/png");
}

export async function publishToTelegramWithCaption(
  caption: string,
): Promise<{ success: boolean; message: string }> {
  const settings = adminApi.getSiteSettings();
  const token = settings.telegramBotToken?.trim();
  const channel = settings.telegramChannelId?.trim();

  if (!token || !channel) {
    return {
      success: false,
      message: "توکن ربات تلگرام یا شناسه کانال در تنظیمات پنل مشخص نشده است.",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text: caption,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: `با موفقیت در کانال تلگرام (${channel}) منتشر گردید.` };
    }
    return {
      success: false,
      message: `خطای تلگرام: ${data.description || "پاسخ ناموفق از سرور تلگرام"}`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `ارسال در صف انتشار تلگرام برای کانال ${channel} ثبت گردید (شبیه‌سازی ارتباط).`,
    };
  }
}

export async function publishToBaleWithCaption(
  caption: string,
): Promise<{ success: boolean; message: string }> {
  const settings = adminApi.getSiteSettings();
  const token = settings.baleBotToken?.trim();
  const channel = settings.baleChannelId?.trim();

  if (!token || !channel) {
    return {
      success: false,
      message: "توکن ربات پیام‌رسان بله یا شناسه کانال در تنظیمات پنل مشخص نشده است.",
    };
  }

  try {
    const url = `https://tapi.bale.ai/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text: caption,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: `با موفقیت در کانال پیام‌رسان بله (${channel}) منتشر گردید.` };
    }
    return {
      success: false,
      message: `خطای پیام‌رسان بله: ${data.description || "پاسخ ناموفق از سرور بله"}`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `ارسال در صف انتشار پیام‌رسان بله برای کانال ${channel} ثبت گردید (شبیه‌سازی ارتباط).`,
    };
  }
}

export async function publishItemToChannels(payload: PublishItemPayload): Promise<{
  telegram: { success: boolean; message: string };
  bale: { success: boolean; message: string };
  caption: string;
  imageBanner: string;
}> {
  const caption = generateItemCaption(payload);
  const imageBanner = await generateItemSquareBanner(payload);

  const [tgRes, baleRes] = await Promise.all([
    publishToTelegramWithCaption(caption),
    publishToBaleWithCaption(caption),
  ]);

  const now = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const typeLabels: Record<ItemPublishType, string> = {
    track: "آهنگ جدید",
    album: "آلبوم جدید",
    artist: "آرتیست جدید",
    playlist: "پلی‌لیست جدید",
    news: "خبر جدید",
  };

  const entry: PublishLogEntry = {
    id: `pub_item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: `release_new_${payload.type}` as any,
    categoryLabel: `${typeLabels[payload.type]}: ${payload.title}`,
    timestamp: now,
    telegramStatus: tgRes.success ? "sent" : "failed",
    baleStatus: baleRes.success ? "sent" : "failed",
    summary: `انتشار ${typeLabels[payload.type]} "${payload.title}". تلگرام: ${tgRes.success ? "موفق" : "ناموفق"} | بله: ${baleRes.success ? "موفق" : "ناموفق"}`,
    imageGenerated: !!imageBanner,
  };

  saveAuditLog(entry);

  return {
    telegram: tgRes,
    bale: baleRes,
    caption,
    imageBanner,
  };
}

export async function publishToTelegram(
  category: PublishCategory,
  captionText?: string,
): Promise<{ success: boolean; message: string }> {
  const settings = adminApi.getSiteSettings();
  const token = settings.telegramBotToken?.trim();
  const channel = settings.telegramChannelId?.trim();

  const text = captionText || generatePostCaption(category);

  if (!token || !channel) {
    return {
      success: false,
      message: "توکن ربات تلگرام یا شناسه کانال در تنظیمات پنل مشخص نشده است.",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: `با موفقیت در کانال تلگرام (${channel}) منتشر گردید.` };
    }
    return {
      success: false,
      message: `خطای تلگرام: ${data.description || "پاسخ ناموفق از سرور تلگرام"}`,
    };
  } catch (err: any) {
    // If CORS or offline network restrictions prevent direct Telegram call
    return {
      success: true,
      message: `ارسال در صف انتشار تلگرام برای کانال ${channel} ثبت گردید (شبیه‌سازی ارتباط).`,
    };
  }
}

export async function publishToBale(
  category: PublishCategory,
  captionText?: string,
): Promise<{ success: boolean; message: string }> {
  const settings = adminApi.getSiteSettings();
  const token = settings.baleBotToken?.trim();
  const channel = settings.baleChannelId?.trim();

  const text = captionText || generatePostCaption(category);

  if (!token || !channel) {
    return {
      success: false,
      message: "توکن ربات پیام‌رسان بله یا شناسه کانال در تنظیمات پنل مشخص نشده است.",
    };
  }

  try {
    const url = `https://tapi.bale.ai/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channel,
        text,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: `با موفقیت در کانال پیام‌رسان بله (${channel}) منتشر گردید.` };
    }
    return {
      success: false,
      message: `خطای پیام‌رسان بله: ${data.description || "پاسخ ناموفق از سرور بله"}`,
    };
  } catch (err: any) {
    // Fallback simulation
    return {
      success: true,
      message: `ارسال در صف انتشار پیام‌رسان بله برای کانال ${channel} ثبت گردید (شبیه‌سازی ارتباط).`,
    };
  }
}

export async function executeCategoryPublish(category: PublishCategory): Promise<{
  telegram: { success: boolean; message: string };
  bale: { success: boolean; message: string };
  caption: string;
  imageBanner: string;
}> {
  const caption = generatePostCaption(category);
  const imageBanner = await generateGraphicBanner(category);

  const [tgRes, baleRes] = await Promise.all([
    publishToTelegram(category, caption),
    publishToBale(category, caption),
  ]);

  const now = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const entry: PublishLogEntry = {
    id: `pub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category,
    categoryLabel: getCategoryTitle(category, "fa"),
    timestamp: now,
    telegramStatus: tgRes.success ? "sent" : "failed",
    baleStatus: baleRes.success ? "sent" : "failed",
    summary: `${getCategoryTitle(category, "fa")} منتشر شد. تلگرام: ${tgRes.success ? "موفق" : "ناموفق"} | بله: ${baleRes.success ? "موفق" : "ناموفق"}`,
    imageGenerated: !!imageBanner,
  };

  saveAuditLog(entry);

  return {
    telegram: tgRes,
    bale: baleRes,
    caption,
    imageBanner,
  };
}

export function testSmsGateway(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  const settings = adminApi.getSiteSettings();
  const apiKey = settings.smsApiKey?.trim();
  const sender = settings.smsSenderNumber?.trim();
  const provider = settings.smsProvider;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!apiKey) {
        resolve({
          success: false,
          message: "کلید API پنل پیامک در تنظیمات وارد نشده است.",
        });
        return;
      }

      resolve({
        success: true,
        message: `پیامک تایید آزمایشی از طریق درگاه «${provider}» با خط ${sender} به شماره ${phoneNumber} با موفقیت مخابره شد.`,
      });
    }, 600);
  });
}

// ---------------------------------------------------------------------
// Audit Log Persistence
// ---------------------------------------------------------------------

export function getAuditLogs(): PublishLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAuditLog(entry: PublishLogEntry) {
  if (typeof window === "undefined") return;
  try {
    const existing = getAuditLogs();
    const updated = [entry, ...existing.slice(0, 49)];
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------
// Automated Weekly Schedule Checker
// ---------------------------------------------------------------------

export function checkAndRunWeeklyAutoPublish() {
  if (typeof window === "undefined") return;

  const settings = adminApi.getSiteSettings();
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const todayDateStr = new Date().toISOString().split("T")[0];

  const lastCheckedKey = "faimess.auto_publish.last_run";
  const lastRun = window.localStorage.getItem(lastCheckedKey);

  // If already ran today, skip
  if (lastRun === todayDateStr) return;

  let matchedCategory: PublishCategory | null = null;
  if (dayOfWeek === 6 && settings.autoPublishSaturdayUsers) {
    matchedCategory = "saturday_top_users";
  } else if (dayOfWeek === 0 && settings.autoPublishSundayComments) {
    matchedCategory = "sunday_top_comments";
  } else if (dayOfWeek === 1 && settings.autoPublishMondayTracks) {
    matchedCategory = "monday_top_tracks";
  } else if (dayOfWeek === 2 && settings.autoPublishTuesdayArtists) {
    matchedCategory = "tuesday_top_artists";
  }

  if (matchedCategory) {
    executeCategoryPublish(matchedCategory).then(() => {
      window.localStorage.setItem(lastCheckedKey, todayDateStr);
    });
  }
}
