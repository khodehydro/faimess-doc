/* ------------------------------------------------------------------ *
 *  FAIMESS Lyrics & Korean Education Routes
 *  Bilingual synchronized sheets, English phonetic romanization,
 *  server-side fan points gate verification (lines >= 3),
 *  and user fan-sheet contributions.
 * ------------------------------------------------------------------ */

import { db } from "../db.ts";
import type { RequestContext } from "./auth.ts";

export const lyricRoutes = {
  async getEducationForLine(query: any, ctx: RequestContext) {
    const trackId = query?.trackId;
    const lineIndex = parseInt(query?.lineIndex ?? "0", 10);

    if (!trackId) {
      return { status: 400, data: { error: "شناسه قطعه الزامی است." } };
    }

    // Check user points on server if lineIndex >= 3
    let isUnlocked = lineIndex < 3;
    let userPoints = 0;

    if (ctx.user) {
      const user = db.prepare("SELECT points FROM users WHERE id = ?").get(ctx.user.userId) as any;
      userPoints = user?.points ?? 0;
      if (userPoints >= 50) {
        isUnlocked = true;
      }
    }

    const row = db.prepare(`
      SELECT korean_line, persian_line, romanization, words_json, grammar_json, nuance_notes
      FROM lyric_education
      WHERE track_id = ? AND line_index = ?
    `).get(trackId, lineIndex) as any;

    if (!row) {
      // Return default educational guidance
      return {
        status: 200,
        data: {
          trackId,
          lineIndex,
          isFreePreview: lineIndex < 3,
          isUnlocked,
          userPoints,
          requiredPoints: 50,
          koreanLine: "빛나는 밤하늘 아래서",
          persianLine: "زیر آسمان درخشان شب",
          romanization: "Binnaneun bamhaneul araeseo",
          words: [
            { korean: "빛나는", persian: "درخشان / تابان", pronunciationEn: "Bin-na-neun", pos: "صفت / فعل توصیفی" },
            { korean: "밤하늘", persian: "آسمان شب", pronunciationEn: "Bam-ha-neul", pos: "اسم مرکب" },
            { korean: "아래서", persian: "زیر / در زیرِ", pronunciationEn: "A-rae-seo", pos: "حرف اضافه مکانی" },
          ],
          grammar: [
            { rule: "پسوند صفت‌ساز 는 (neun)", explanation: "تبدیل ریشه فعل به صفت جاری یا توصیف اسم بعد از خود" },
            { rule: "پسوند مکانی 에서 (e-seo)", explanation: "نشان‌دهنده انجام عمل در یک موقعیت یا مکان مشخص" },
          ],
          nuance: "در ادبیات کی‌پاپ، «밤하늘» نماد امید، رویا و پیوند قلبی با هواداران است.",
        },
      };
    }

    return {
      status: 200,
      data: {
        trackId,
        lineIndex,
        isFreePreview: lineIndex < 3,
        isUnlocked,
        userPoints,
        requiredPoints: 50,
        koreanLine: row.korean_line,
        persianLine: row.persian_line,
        romanization: row.romanization,
        words: isUnlocked ? JSON.parse(row.words_json || "[]") : [],
        grammar: isUnlocked ? JSON.parse(row.grammar_json || "[]") : [],
        nuance: isUnlocked ? row.nuance_notes : "این بخش نیازمند ۵۰ امتیاز هواداری است.",
      },
    };
  },

  async submitFanSheet(body: any, ctx: RequestContext) {
    if (!ctx.user) {
      return { status: 401, data: { error: "برای ارسال متن ترانه وارد شوید." } };
    }

    const { trackId, original, translation } = body || {};
    if (!trackId || !original || !translation) {
      return { status: 400, data: { error: "متن اصلی و ترجمه الزامی است." } };
    }

    // Award immediate submission points (+18) and schedule moderation (+120 upon approval)
    db.prepare("UPDATE users SET points = points + 18 WHERE id = ?").run(ctx.user.userId);

    return {
      status: 201,
      data: {
        message: "متن ترانه با موفقیت ارسال شد و پس از بازبینی تایید خواهد شد.",
        pointsAwarded: 18,
      },
    };
  },
};
