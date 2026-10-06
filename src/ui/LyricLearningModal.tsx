import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import {
  getLyricEducationForLine,
  loadAcademyAd,
  type LyricEducation,
  type AcademyAd,
} from "../data/lyricLearning";
import { type PlayerTrack } from "../data/player";
import { cn } from "../lib/cn";

export interface LyricLearningModalProps {
  open: boolean;
  onClose: () => void;
  track: PlayerTrack | null;
  lineIndex: number;
  koreanLine: string;
  persianLine: string;
}

export function LyricLearningModal({
  open,
  onClose,
  track,
  lineIndex,
  koreanLine,
  persianLine,
}: LyricLearningModalProps) {
  const { lang } = usePreferences();
  const { notify } = useApp();

  const [education, setEducation] = useState<LyricEducation | null>(null);
  const [ad, setAd] = useState<AcademyAd>(() => loadAcademyAd());
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (open && track) {
      const data = getLyricEducationForLine(track.id, lineIndex, koreanLine, persianLine);
      setEducation(data);
      setAd(loadAcademyAd());
    }
  }, [open, track, lineIndex, koreanLine, persianLine]);

  // Lock background scrolling while open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [open]);

  if (!open || !track || !education) return null;

  const handleCopyDiscount = () => {
    if (ad.discountCode && typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(ad.discountCode);
      setCopiedCode(true);
      notify(
        lang === "fa"
          ? `کد تخفیف «${ad.discountCode}» کپی شد.`
          : `Copied promo code "${ad.discountCode}".`,
        "teal",
      );
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm overscroll-contain animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] sm:max-h-[85vh] w-full max-w-[540px] flex-col overflow-hidden rounded-t-[26px] sm:rounded-[26px] border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary-deep">
              <Icon name="sparkle" size={14} strokeWidth={2.4} />
            </span>
            <div>
              <h3 className="text-[14px] sm:text-[15px] font-black text-ink">
                {lang === "fa" ? "آموزش زبان کره‌ای با لیریک" : lang === "ko" ? "가사로 배우는 한국어" : "Learn Korean via Lyrics"}
              </h3>
              <p className="text-[12px] font-bold text-ink-muted">
                {track.title} • {track.artist} (خط {lineIndex + 1})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-subtle hover:text-ink"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 scroll-slim">
          {/* Main Lyric Focus Card */}
          <div className="rounded-[20px] border border-primary/30 bg-gradient-to-br from-primary-faint/60 via-surface to-surface p-4 shadow-xs">
            <span className="inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
              {lang === "fa" ? "متن ترانه" : "Current Line"}
            </span>
            <p className="mt-2 text-[17px] sm:text-[19px] font-black tracking-tight text-ink leading-snug">
              {education.koreanLine}
            </p>
            {education.romanization && (
              <p className="mt-1 text-[12px] font-bold text-primary-deep font-mono tracking-wide">
                {education.romanization}
              </p>
            )}
            <p dir="rtl" className="mt-2 text-[13.5px] font-bold text-ink-body leading-relaxed border-t border-line/60 pt-2">
              {education.translationFa}
            </p>
          </div>

          {/* Vocabulary Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-subtle text-ink-muted">
                <Icon name="list" size={12} />
              </span>
              <h4 className="text-[13px] font-extrabold text-ink">
                {lang === "fa" ? "واژگان و اصطلاحات کلیدی" : "Key Vocabulary"}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {education.words.map((w, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-xl border border-line bg-subtle/50 p-2.5 shadow-2xs hover:border-primary/40 transition"
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[14px] font-black text-ink">{w.korean}</span>
                    {w.partOfSpeech && (
                      <span className="rounded bg-primary-soft/60 px-1.5 py-0.5 text-[12px] font-bold text-primary-deep">
                        {w.partOfSpeech}
                      </span>
                    )}
                  </div>
                  {w.pronunciation && (
                    <span className="mt-0.5 text-[12px] font-semibold text-ink-faint">
                      {w.pronunciation}
                    </span>
                  )}
                  <p className="mt-1.5 text-[12px] font-bold text-ink-body">
                    {w.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Section */}
          {education.grammar.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="flex size-5 items-center justify-center rounded-md bg-subtle text-ink-muted">
                  <Icon name="check" size={12} strokeWidth={2.4} />
                </span>
                <h4 className="text-[13px] font-extrabold text-ink">
                  {lang === "fa" ? "نکات دستوری و گرامر" : "Grammar Points"}
                </h4>
              </div>

              <div className="space-y-2">
                {education.grammar.map((g, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-surface p-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[12px] font-black text-amber-700 dark:text-amber-400">
                        {g.rule}
                      </span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink-body">
                      {g.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural / Nuance Note */}
          {education.culturalNotes && (
            <div className="rounded-xl border border-line bg-subtle/40 p-3">
              <span className="text-[12px] font-extrabold text-ink-muted block mb-1">
                {lang === "fa" ? "💡 نکتهٔ زبانی و فرهنگی کی‌پاپ:" : "Cultural Note:"}
              </span>
              <p className="text-[12px] leading-relaxed text-ink-muted">
                {education.culturalNotes}
              </p>
            </div>
          )}

          {/* =========================================================================
           *  SPONSORED KOREAN LANGUAGE ACADEMY ADVERTISING CARD
           *  (بخش تبلیغات آموزشگاه‌های زبان کره‌ای با کد تخفیف اختصاصی فیمس)
           * ========================================================================= */}
          {ad.enabled && (
            <div className="mt-4 overflow-hidden rounded-[22px] border-2 border-primary/40 bg-gradient-to-br from-primary-faint/80 via-surface to-surface p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-line/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-primary">
                    <Icon name="crown" size={14} strokeWidth={2.4} />
                  </span>
                  <div>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[12px] font-black text-primary-deep">
                      {ad.badgeText}
                    </span>
                    <h5 className="mt-0.5 text-[13px] font-black text-ink">
                      {ad.academyName}
                    </h5>
                  </div>
                </div>

                {ad.discountCode && (
                  <button
                    type="button"
                    onClick={handleCopyDiscount}
                    className="flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-1 text-[12px] font-extrabold text-ink shadow-2xs hover:border-primary/50"
                  >
                    <span>{ad.discountCode}</span>
                    <Icon name={copiedCode ? "check" : "share"} size={12} />
                  </button>
                )}
              </div>

              <div className="pt-3">
                <h6 className="text-[13.5px] font-extrabold text-ink">
                  {ad.title}
                </h6>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                  {ad.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/60">
                  <span className="text-[12px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    🏷️ {ad.discountText}
                  </span>

                  <a
                    href={ad.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
                  >
                    <span>{ad.ctaText}</span>
                    <Icon name="arrowUpRight" size={12} strokeWidth={2.4} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-line px-4 py-3 bg-subtle/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-subtle px-4 py-1.5 text-[12px] font-bold text-ink hover:bg-subtle/80"
          >
            {lang === "fa" ? "متوجه شدم (بستن)" : "Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
