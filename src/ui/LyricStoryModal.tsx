import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { type LyricLine } from "../data/lyrics";
import { type PlayerTrack } from "../data/player";
import { cn } from "../lib/cn";
import faimessLogoSrc from "../assets/brand/faimess-logo.png";

type StoryTheme = "brand_violet" | "midnight_noir";

export function LyricStoryModal({
  open,
  onClose,
  track,
  lines,
  initialLineIndex = 0,
}: {
  open: boolean;
  onClose: () => void;
  track: PlayerTrack | null;
  lines: LyricLine[] | null;
  initialLineIndex?: number;
}) {
  const { lang, dir } = usePreferences();
  const { notify } = useApp();

  const [selectedIndex, setSelectedIndex] = useState(initialLineIndex);
  const [theme, setTheme] = useState<StoryTheme>("brand_violet");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setSelectedIndex(Math.max(0, Math.min(initialLineIndex, (lines?.length || 1) - 1)));
  }, [initialLineIndex, lines]);

  // Lock background scroll when open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [open]);

  // Client-side HTML5 Canvas Story Generation (1080 x 1920) — 0% server load
  const renderStoryCanvas = useCallback(async (): Promise<string | null> => {
    if (!track || !lines || lines.length === 0) return null;
    const activeLine = lines[selectedIndex] || lines[0];

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const isViolet = theme === "brand_violet";
    const BG_COLOR = isViolet ? "#8267f0" : "#0c0a14";
    const CARD_BG = isViolet ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.08)";
    const CARD_BORDER = isViolet ? "rgba(255, 255, 255, 0.35)" : "rgba(130, 103, 240, 0.35)";
    const TEXT_WHITE = "#ffffff";
    const TEXT_SUBTLE = isViolet ? "rgba(255, 255, 255, 0.88)" : "rgba(255, 255, 255, 0.80)";
    const TEXT_ACCENT = isViolet ? "#ffffff" : "#a78bfa";

    // 1. Background Fill
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle background artistic glow for midnight noir
    if (!isViolet) {
      const grad = ctx.createRadialGradient(540, 600, 50, 540, 600, 750);
      grad.addColorStop(0, "rgba(130, 103, 240, 0.22)");
      grad.addColorStop(1, "rgba(12, 10, 20, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Load images helper
    const loadImg = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const [logoImg, coverImg] = await Promise.all([
      loadImg(faimessLogoSrc),
      loadImg(track.photo),
    ]);

    // 2. Header: Logo & Branding (Y: 140)
    ctx.save();
    if (logoImg) {
      // Rounded logo container
      ctx.beginPath();
      ctx.arc(140, 160, 42, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, 98, 118, 84, 84);
    }
    ctx.restore();

    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 36px 'Vazirmatn', sans-serif";
    ctx.fillText("FAIMESS", 205, 155);

    ctx.fillStyle = TEXT_SUBTLE;
    ctx.font = "bold 17px 'Vazirmatn', sans-serif";
    ctx.fillText("K-POP STREAMING & LYRICS", 208, 185);

    // Pill badge: Top right
    ctx.fillStyle = CARD_BG;
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(750, 132, 230, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 18px 'Vazirmatn', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LYRIC STORY", 865, 165);

    // 3. Central Track Artwork (Square with rounded corners, Y: 290)
    const artSize = 480;
    const artX = (1080 - artSize) / 2; // 300
    const artY = 280;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 36);
    ctx.clip();
    if (coverImg) {
      ctx.drawImage(coverImg, artX, artY, artSize, artSize);
    } else {
      ctx.fillStyle = isViolet ? "#6b4fdd" : "#1a162b";
      ctx.fillRect(artX, artY, artSize, artSize);
    }
    ctx.restore();

    // Artwork Border
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 36);
    ctx.stroke();

    // 4. Track Meta (Title & Artist)
    ctx.direction = "ltr";
    ctx.textAlign = "center";
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 42px 'Vazirmatn', sans-serif";
    const safeTitle = track.title.length > 34 ? track.title.slice(0, 32) + "..." : track.title;
    ctx.fillText(safeTitle, 540, 830);

    ctx.fillStyle = TEXT_ACCENT;
    ctx.font = "bold 26px 'Vazirmatn', sans-serif";
    ctx.fillText(`• ${track.artist} •`, 540, 875);

    // 5. Lyric Quote Box (Glass Card Y: 930)
    const quoteBoxX = 90;
    const quoteBoxY = 930;
    const quoteBoxW = 900;
    const quoteBoxH = 640;

    ctx.fillStyle = CARD_BG;
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 36);
    ctx.fill();
    ctx.stroke();

    // Large Quotation Glyph
    ctx.fillStyle = isViolet ? "rgba(255, 255, 255, 0.28)" : "rgba(130, 103, 240, 0.32)";
    ctx.font = "900 130px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("“", 540, quoteBoxY + 130);

    // Korean Original Line
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 42px 'Pretendard', sans-serif";
    ctx.direction = "ltr";
    ctx.textAlign = "center";

    // Split long lines if needed
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const wrapped: string[] = [];
      let current = "";
      for (const w of words) {
        const test = current ? `${current} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth) {
          wrapped.push(current);
          current = w;
        } else {
          current = test;
        }
      }
      if (current) wrapped.push(current);
      return wrapped;
    };

    const koLines = wrapText(activeLine.ko, 800);
    let currY = quoteBoxY + 220;
    koLines.forEach((l) => {
      ctx.fillText(l, 540, currY);
      currY += 56;
    });

    // Divider line inside quote box
    ctx.strokeStyle = isViolet ? "rgba(255, 255, 255, 0.3)" : "rgba(130, 103, 240, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(340, currY + 20);
    ctx.lineTo(740, currY + 20);
    ctx.stroke();

    // Persian Translated Line
    ctx.fillStyle = TEXT_SUBTLE;
    ctx.font = "900 38px 'Vazirmatn', sans-serif";
    ctx.direction = "rtl";
    ctx.textAlign = "center";

    const faLines = wrapText(`«${activeLine.fa}»`, 800);
    currY += 80;
    faLines.forEach((l) => {
      ctx.fillText(l, 540, currY);
      currY += 52;
    });

    // 6. Footer (faimess.ir + Subtitle)
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(140, 1680);
    ctx.lineTo(940, 1680);
    ctx.stroke();

    // Website Capsule (faimess.ir)
    ctx.fillStyle = CARD_BG;
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(330, 1720, 420, 72, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 38px 'Vazirmatn', sans-serif";
    ctx.textAlign = "center";
    ctx.direction = "ltr";
    ctx.fillText("faimess.ir", 540, 1770);

    ctx.fillStyle = TEXT_SUBTLE;
    ctx.font = "bold 19px 'Vazirmatn', sans-serif";
    ctx.direction = "rtl";
    ctx.fillText(
      "پلتفرم استریم کی‌پاپ با لیریک فارسی و کره‌ای • @faimessofficial",
      540,
      1840,
    );

    return canvas.toDataURL("image/png");
  }, [track, lines, selectedIndex, theme]);

  // Update preview whenever line or theme changes
  useEffect(() => {
    if (!open) return;
    let isCurrent = true;
    renderStoryCanvas().then((url) => {
      if (isCurrent && url) {
        setPreviewUrl(url);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [open, renderStoryCanvas]);

  const handleDownloadStory = async () => {
    setGenerating(true);
    try {
      const dataUrl = await renderStoryCanvas();
      if (!dataUrl) throw new Error("Canvas error");

      const a = document.createElement("a");
      a.href = dataUrl;
      const cleanTitle = (track?.title || "faimess").toLowerCase().replace(/[^a-z0-9]/g, "-");
      a.download = `faimess-story-${cleanTitle}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      notify(
        lang === "fa"
          ? "تصویر استوری با موفقیت دانلود شد!"
          : lang === "ko"
            ? "스토리 이미지가 저장되었습니다!"
            : "Story image downloaded!",
        "mint",
      );
    } catch {
      notify(
        lang === "fa" ? "خطا در تولید تصویر استوری" : "Failed to create story image",
        "primary",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleShareStory = async () => {
    const activeLine = lines?.[selectedIndex];
    const textToShare = activeLine
      ? `«${activeLine.fa}»\n${activeLine.ko}\n\n🎵 ${track?.title} — ${track?.artist}\n🌐 شنیدن در پلتفرم فیمس: https://faimess.ir`
      : `🎵 ${track?.title} — ${track?.artist}\n🌐 شنیدن در پلتفرم فیمس: https://faimess.ir`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `لیریک ${track?.title}`,
          text: textToShare,
          url: "https://faimess.ir",
        });
        return;
      } catch {
        // cancelled
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(textToShare);
      notify(
        lang === "fa" ? "متن لیریک در کلیپ‌بورد کپی شد!" : "Lyric quote copied!",
        "mint",
      );
    }
  };

  if (!open || !track || !lines || lines.length === 0) return null;

  const currentLine = lines[selectedIndex] || lines[0];

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-fade-in">
      <div
        dir={dir}
        className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[26px] border border-line bg-surface shadow-2xl"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-line px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-primary">
              <Icon name="sparkle" size={17} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="text-[15px] font-black text-ink sm:text-[17px]">
                {lang === "fa"
                  ? "کارت استوری‌ساز لیریک"
                  : lang === "ko"
                    ? "가사 스토리 카드 생성기"
                    : "Lyric Story Card Generator"}
              </h3>
              <p className="text-[12px] font-medium text-ink-muted">
                {lang === "fa"
                  ? "تولید تصویر استوری عمودی ۱۶:۹ بدون فشار بر سرور (Client-side)"
                  : "Zero server load • 100% Client-side 9:16 Story generation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-subtle hover:text-ink"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Left/Center: Visual Story Preview */}
          <div className="flex flex-1 items-center justify-center bg-subtle/50 p-4 overflow-y-auto">
            <div className="relative aspect-[9/16] w-full max-w-[270px] sm:max-w-[290px] overflow-hidden rounded-[22px] border-2 border-line bg-black shadow-xl">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="h-full w-full object-cover select-none pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/60">
                  <span className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span className="text-[12px] font-bold">در حال پردازش گرافیک...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls & Options */}
          <div className="flex w-full md:w-[360px] flex-col border-t md:border-t-0 md:border-s border-line bg-surface p-4 sm:p-5 overflow-y-auto scroll-slim">
            {/* Theme Selector */}
            <div className="mb-4">
              <label className="block text-[12px] font-bold text-ink-muted mb-2">
                {lang === "fa" ? "قالب طراحی استوری" : "Story Visual Theme"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("brand_violet")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-[12.5px] font-black transition",
                    theme === "brand_violet"
                      ? "border-primary bg-primary text-white shadow-primary"
                      : "border-line bg-subtle/60 text-ink hover:bg-subtle",
                  )}
                >
                  <span className="size-3 rounded-full bg-white ring-1 ring-black/20" />
                  <span>{lang === "fa" ? "بنفش پلتفرم" : "Brand Violet"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("midnight_noir")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-[12.5px] font-black transition",
                    theme === "midnight_noir"
                      ? "border-ink bg-ink text-surface shadow-xs"
                      : "border-line bg-subtle/60 text-ink hover:bg-subtle",
                  )}
                >
                  <span className="size-3 rounded-full bg-purple-500 ring-1 ring-white/20" />
                  <span>{lang === "fa" ? "مشکی شبانه" : "Midnight Noir"}</span>
                </button>
              </div>
            </div>

            {/* Lyric Line Selector */}
            <div className="mb-4 flex-1">
              <label className="block text-[12px] font-bold text-ink-muted mb-2">
                {lang === "fa"
                  ? `انتخاب مصرع لیریک (${lines.length} خط)`
                  : `Select Lyric Line (${lines.length} lines)`}
              </label>
              <div className="max-h-[180px] space-y-1.5 overflow-y-auto scroll-slim pe-1">
                {lines.map((l, idx) => {
                  const isSel = idx === selectedIndex;
                  return (
                    <button
                      key={`${l.at}-${idx}`}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full rounded-xl p-2 text-start transition border",
                        isSel
                          ? "border-primary bg-primary-soft/50 text-primary-deep font-bold"
                          : "border-line/60 bg-subtle/30 text-ink-body hover:bg-subtle hover:border-line",
                      )}
                    >
                      <p className="text-[12.5px] truncate font-sans">{l.ko}</p>
                      <p dir="rtl" className="text-[12px] truncate text-ink-muted font-fa mt-0.5">
                        {l.fa}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Quote Preview Box */}
            <div className="mb-4 rounded-xl border border-line bg-subtle/50 p-3 text-center">
              <p className="text-[12.5px] font-bold text-ink">{currentLine.ko}</p>
              <p dir="rtl" className="text-[12px] font-semibold text-primary-deep mt-0.5">
                «{currentLine.fa}»
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-auto pt-2">
              <button
                type="button"
                onClick={handleDownloadStory}
                disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[13px] font-bold text-white shadow-primary transition hover:bg-primary-deep disabled:opacity-50"
              >
                <Icon name="download" size={15} strokeWidth={2.4} />
                <span>
                  {generating
                    ? lang === "fa" ? "در حال آماده‌سازی..." : "Generating..."
                    : lang === "fa" ? "دانلود تصویر استوری (PNG)" : "Download Story Image"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShareStory}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-[12.5px] font-bold text-ink transition hover:bg-subtle"
              >
                <Icon name="share" size={14} />
                <span>{lang === "fa" ? "اشتراک‌گذاری یا کپی متن" : "Share / Copy Quote"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
