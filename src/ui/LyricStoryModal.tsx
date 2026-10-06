import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { type LyricLine } from "../data/lyrics";
import { type PlayerTrack } from "../data/player";
import { cn } from "../lib/cn";
import {
  loadAllStoryBackgrounds,
  type StoryBackground,
} from "../data/storyBackgrounds";
import { socialApi } from "../api/socialApi";
import faimessLogoSrc from "../assets/brand/faimess-logo.png";

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
  const [backgrounds, setBackgrounds] = useState<StoryBackground[]>(() => loadAllStoryBackgrounds());
  const [selectedBgId, setSelectedBgId] = useState<string>("bg-brand-violet");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const profile = socialApi.getProfile();
  const userPoints = profile.points || 0;

  useEffect(() => {
    setSelectedIndex(Math.max(0, Math.min(initialLineIndex, (lines?.length || 1) - 1)));
  }, [initialLineIndex, lines]);

  useEffect(() => {
    if (open) {
      const all = loadAllStoryBackgrounds();
      setBackgrounds(all);
    }
  }, [open]);

  // Lock background scroll when open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [open]);

  // Sort backgrounds so current artist and unlocked ones appear first
  const sortedBackgrounds = useMemo(() => {
    const artistLower = (track?.artist || "").toLowerCase();
    return [...backgrounds].sort((a, b) => {
      const aMatches = artistLower.includes(a.artistId.toLowerCase()) || a.artistId === "all";
      const bMatches = artistLower.includes(b.artistId.toLowerCase()) || b.artistId === "all";
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return a.requiredPoints - b.requiredPoints;
    });
  }, [backgrounds, track?.artist]);

  const activeBg = useMemo(() => {
    return backgrounds.find((b) => b.id === selectedBgId) || backgrounds[0];
  }, [backgrounds, selectedBgId]);

  // Client-side HTML5 Canvas Story Generation (1080 x 1920) — 0% server load
  const renderStoryCanvas = useCallback(async (): Promise<string | null> => {
    if (!track || !lines || lines.length === 0 || !activeBg) return null;
    const activeLine = lines[selectedIndex] || lines[0];

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

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

    // 1. Draw Background
    if (activeBg.imageUrl) {
      const bgImg = await loadImg(activeBg.imageUrl);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 1080, 1920);
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(0, 0, 1080, 1920);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
        bgGrad.addColorStop(0, activeBg.gradientFrom);
        bgGrad.addColorStop(1, activeBg.gradientTo);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);
      }
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, activeBg.gradientFrom);
      bgGrad.addColorStop(1, activeBg.gradientTo);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Background Artistic Patterns
    if (activeBg.pattern === "cosmic_stars") {
      ctx.save();
      // Glowing star specks
      const starCoords = [
        [180, 220, 3], [320, 150, 2], [890, 240, 3.5], [120, 850, 2],
        [960, 920, 2.5], [200, 1650, 3], [850, 1750, 2.5], [540, 1820, 2],
        [720, 400, 4], [250, 600, 2.5], [820, 1200, 3], [140, 1350, 2],
      ];
      starCoords.forEach(([x, y, r]) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      // Radial galaxy aura
      const galaxyGrad = ctx.createRadialGradient(540, 500, 80, 540, 500, 650);
      galaxyGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
      galaxyGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = galaxyGrad;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
    } else if (activeBg.pattern === "neon_stage") {
      ctx.save();
      // Angled light beams
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.lineTo(350, 0);
      ctx.lineTo(550, 1920);
      ctx.lineTo(250, 1920);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(980, 0);
      ctx.lineTo(730, 0);
      ctx.lineTo(530, 1920);
      ctx.lineTo(830, 1920);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (activeBg.pattern === "prism_glow") {
      ctx.save();
      const prismGrad = ctx.createRadialGradient(540, 800, 100, 540, 800, 700);
      prismGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      prismGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.10)");
      prismGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = prismGrad;
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.restore();
    }

    const [logoImg, coverImg] = await Promise.all([
      loadImg(faimessLogoSrc),
      loadImg(track.photo),
    ]);

    const CARD_BG = "rgba(255, 255, 255, 0.14)";
    const CARD_BORDER = "rgba(255, 255, 255, 0.35)";
    const TEXT_WHITE = "#ffffff";
    const TEXT_SUBTLE = "rgba(255, 255, 255, 0.88)";

    // 2. Header: Logo & Branding (Y: 140)
    ctx.save();
    if (logoImg) {
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
    ctx.roundRect(740, 132, 240, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 17px 'Vazirmatn', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(activeBg.titleEn.toUpperCase(), 860, 165);

    // 3. Central Track Artwork (Square, Y: 280)
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
      ctx.fillStyle = "#1e1b4b";
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

    ctx.fillStyle = TEXT_SUBTLE;
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

    // Quotation Mark Icon
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "900 110px 'Vazirmatn', sans-serif";
    ctx.fillText("“", 540, 1025);

    // Korean Original Lyric
    ctx.textAlign = "center";
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 40px 'Pretendard', sans-serif";

    // Text wrapping helper
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(" ");
      const linesOut: string[] = [];
      let current = words[0] || "";
      for (let i = 1; i < words.length; i++) {
        const test = current + " " + words[i];
        if (ctx.measureText(test).width <= maxWidth) {
          current = test;
        } else {
          linesOut.push(current);
          current = words[i];
        }
      }
      linesOut.push(current);
      return linesOut;
    };

    const koLines = wrapText(activeLine.ko, quoteBoxW - 120);
    let curY = 1100;
    koLines.forEach((l) => {
      ctx.fillText(l, 540, curY);
      curY += 56;
    });

    // Divider Line inside quote box
    curY += 20;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(340, curY);
    ctx.lineTo(740, curY);
    ctx.stroke();

    // Persian Lyric Translation
    curY += 60;
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "bold 34px 'Vazirmatn', sans-serif";
    ctx.direction = "rtl";
    const faLines = wrapText(activeLine.fa, quoteBoxW - 120);
    faLines.forEach((l) => {
      ctx.fillText(l, 540, curY);
      curY += 52;
    });

    // 6. Bottom Signature Strip (Y: 1680)
    ctx.direction = "ltr";
    ctx.textAlign = "center";

    // Brand URL
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "900 32px 'Vazirmatn', sans-serif";
    ctx.fillText("faimess.ir", 540, 1750);

    ctx.fillStyle = TEXT_SUBTLE;
    ctx.font = "bold 20px 'Vazirmatn', sans-serif";
    ctx.fillText("K-POP PLATFORM & OFFICIAL STREAMING", 540, 1795);

    return canvas.toDataURL("image/png");
  }, [track, lines, selectedIndex, activeBg]);

  // Update preview image
  useEffect(() => {
    let active = true;
    if (!open || !track || !lines) return;
    setGenerating(true);
    renderStoryCanvas().then((url) => {
      if (active) {
        setPreviewUrl(url);
        setGenerating(false);
      }
    });
    return () => {
      active = false;
    };
  }, [open, track, lines, selectedIndex, activeBg, renderStoryCanvas]);

  if (!open || !track || !lines) return null;

  // Handle PNG Download
  const handleDownload = async () => {
    try {
      const dataUrl = await renderStoryCanvas();
      if (!dataUrl) return;

      const a = document.createElement("a");
      a.href = dataUrl;
      const cleanTitle = track.title.replace(/[^\w\s-]/gi, "").trim();
      a.download = `faimess-story-${cleanTitle || "kpop"}-${selectedIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      notify(
        lang === "fa"
          ? "کارت استوری ۹:۱۶ با موفقیت دانلود شد."
          : "Story card downloaded successfully.",
        "mint",
      );
    } catch {
      notify(
        lang === "fa" ? "خطا در تولید تصویر استوری" : "Failed to generate story card",
        "primary",
      );
    }
  };

  const handleSelectBackground = (bg: StoryBackground) => {
    if (userPoints < bg.requiredPoints) {
      const diff = bg.requiredPoints - userPoints;
      notify(
        lang === "fa"
          ? `برای این طرح نیاز به ${bg.requiredPoints} امتیاز دارید (${diff} امتیاز دیگر نیاز دارید).`
          : `Requires ${bg.requiredPoints} points to unlock.`,
        "primary",
      );
      return;
    }
    setSelectedBgId(bg.id);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md overscroll-contain animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-[840px] flex-col overflow-hidden rounded-[26px] border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-primary">
              <Icon name="sparkle" size={16} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="font-extrabold text-[15px] sm:text-[16px] text-ink">
                {lang === "fa" ? "کارت استوری‌ساز لیریک (۹:۱۶)" : "Lyric Story Creator (9:16)"}
              </h3>
              <p className="text-[12px] font-bold text-ink-muted">
                {track.title} • {track.artist}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-subtle hover:text-ink"
            aria-label="Close"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        {/* Modal Body: Split 2-Column on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-4 sm:p-6 scroll-slim flex-1">
          {/* Column 1: Live Phone Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative aspect-[9/16] w-full max-w-[270px] sm:max-w-[310px] overflow-hidden rounded-[28px] border-4 border-line/80 bg-black shadow-2xl ring-2 ring-black/40">
              {generating ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-subtle">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary-deep animate-spin">
                    <Icon name="sparkle" size={20} />
                  </span>
                  <span className="text-[12px] font-extrabold text-ink-muted">
                    {lang === "fa" ? "در حال پردازش..." : "Rendering..."}
                  </span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Story Card Preview"
                  className="h-full w-full object-cover select-none pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-subtle text-ink-faint">
                  <Icon name="disc" size={32} />
                </div>
              )}

              {/* 9:16 badge */}
              <span className="absolute top-3 end-3 rounded-full bg-black/60 px-2 py-0.5 text-[12px] font-black text-white backdrop-blur-md">
                1080×1920
              </span>
            </div>

            <p className="mt-2.5 text-center text-[12px] font-bold text-ink-faint">
              {lang === "fa" ? "پردازش ۱۰۰٪ سمت کلاینت روی مرورگر شما" : "Client-side HTML5 Canvas (Zero Server Load)"}
            </p>
          </div>

          {/* Column 2: Background Selection & Controls */}
          <div className="flex flex-col gap-4">
            {/* Background / Artist Theme Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-extrabold text-ink-muted">
                  {lang === "fa" ? "پس‌زمینهٔ استوری (متناسب با گروه‌ها)" : "Story Background"}
                </label>
                <span className="text-[12px] font-bold text-primary-deep">
                  {lang === "fa" ? `امتیاز شما: ${userPoints}` : `Your points: ${userPoints}`}
                </span>
              </div>

              {/* Horizontal Backgrounds Rail */}
              <div className="w-full min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto scroll-rail pb-1.5">
                  {sortedBackgrounds.map((bg) => {
                    const isUnlocked = userPoints >= bg.requiredPoints;
                    const isSelected = selectedBgId === bg.id;

                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => handleSelectBackground(bg)}
                        title={`${bg.titleFa} (${bg.artistName}) - ${bg.requiredPoints} pts`}
                        className={cn(
                          "group relative flex h-20 w-28 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border p-2 text-start transition",
                          isSelected
                            ? "border-primary ring-2 ring-primary ring-offset-2 scale-105 shadow-md"
                            : "border-line opacity-85 hover:opacity-100",
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[12px] font-black text-white backdrop-blur-2xs">
                            {bg.artistName}
                          </span>
                          {!isUnlocked && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-black/70 text-amber-400 shadow-sm">
                              <Icon name="lock" size={11} />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-black text-white drop-shadow-sm">
                            {lang === "fa" ? bg.titleFa : bg.titleEn}
                          </p>
                          <span className="text-[12px] font-bold text-white/80">
                            {bg.requiredPoints === 0 ? (lang === "fa" ? "رایگان" : "Free") : `${bg.requiredPoints} pts`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Lyric Line Selector */}
            <div className="flex-1">
              <label className="text-[12px] font-extrabold text-ink-muted mb-1.5 block">
                {lang === "fa" ? "انتخاب خط لیریک مورد نظر:" : "Select Lyric Quote:"}
              </label>

              <div className="max-h-[220px] space-y-1.5 overflow-y-auto rounded-2xl border border-line bg-subtle/50 p-2 scroll-slim">
                {lines.map((line, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full rounded-xl p-2.5 text-start transition cursor-pointer",
                      selectedIndex === idx
                        ? "bg-primary text-white shadow-primary"
                        : "bg-surface hover:bg-surface/80 border border-line/60 text-ink",
                    )}
                  >
                    <p className={cn("text-[13px] font-bold", selectedIndex === idx ? "text-white" : "text-ink")}>
                      {line.ko}
                    </p>
                    <p
                      dir="rtl"
                      className={cn("mt-0.5 text-[12px] font-medium", selectedIndex === idx ? "text-white/90" : "text-ink-muted")}
                    >
                      {line.fa}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-subtle py-2.5 text-[12px] font-bold text-ink-muted hover:bg-subtle/80 hover:text-ink"
              >
                {lang === "fa" ? "انصراف" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={generating}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-[12px] font-black text-white shadow-primary transition hover:bg-primary-deep disabled:opacity-50"
              >
                <Icon name="download" size={15} strokeWidth={2.4} />
                <span>{lang === "fa" ? "ذخیره کارت استوری (PNG)" : "Download Story PNG"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
