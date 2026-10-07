import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import {
  getLyricEducationForLine,
  loadAcademyAd,
  loadEducationSettings,
  romanizeHangul,
  type LyricEducation,
  type AcademyAd,
  type EducationSettings,
} from "../data/lyricLearning";
import { socialApi } from "../api/socialApi";
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

type LearningTab = "overview" | "vocabulary" | "grammar" | "cultural" | "academy";

interface TabMeta {
  id: LearningTab;
  labelFa: string;
  labelEn: string;
  labelKo: string;
  icon: "sparkle" | "list" | "check" | "star" | "crown";
  getBadge?: (edu: LyricEducation, ad: AcademyAd) => string | number | null;
}

const TABS: TabMeta[] = [
  {
    id: "overview",
    labelFa: "نمای کلی",
    labelEn: "Overview",
    labelKo: "개요",
    icon: "sparkle",
  },
  {
    id: "vocabulary",
    labelFa: "واژگان",
    labelEn: "Vocabulary",
    labelKo: "어휘",
    icon: "list",
    getBadge: (edu) => edu.words.length || null,
  },
  {
    id: "grammar",
    labelFa: "دستور زبان",
    labelEn: "Grammar",
    labelKo: "문법",
    icon: "check",
    getBadge: (edu) => edu.grammar.length || null,
  },
  {
    id: "cultural",
    labelFa: "مفاهیم",
    labelEn: "Nuance",
    labelKo: "뉘앙스",
    icon: "star",
  },
  {
    id: "academy",
    labelFa: "آموزشگاه",
    labelEn: "Academy",
    labelKo: "어학원",
    icon: "crown",
    getBadge: (_edu, ad) => (ad.enabled && ad.discountCode ? "%" : null),
  },
];

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

  const [activeTab, setActiveTab] = useState<LearningTab>("overview");
  const [education, setEducation] = useState<LyricEducation | null>(() =>
    track ? getLyricEducationForLine(track.id, lineIndex, koreanLine, persianLine) : null
  );
  const [ad, setAd] = useState<AcademyAd>(() => loadAcademyAd());
  const [settings, setSettings] = useState<EducationSettings>(() => loadEducationSettings());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const profile = socialApi.getProfile();
  const userPoints = profile.points || 0;

  // Unlocking calculation: Lines 0, 1, 2 are completely free previews
  const isFreePreview = lineIndex < settings.freeLinesCount;
  const isLocked = !isFreePreview && userPoints < settings.requiredPoints;

  useEffect(() => {
    if (open && track) {
      const data = getLyricEducationForLine(track.id, lineIndex, koreanLine, persianLine);
      setEducation(data);
      setAd(loadAcademyAd());
      setSettings(loadEducationSettings());
      setActiveTab("overview");
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

  if (!open || !track || !education || typeof document === "undefined" || !document.body) return null;

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

  const handleCopyWord = (word: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(word);
      setCopiedWord(word);
      notify(
        lang === "fa"
          ? `واژه «${word}» کپی شد.`
          : `Copied word "${word}".`,
        "teal",
      );
      setTimeout(() => setCopiedWord(null), 2000);
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];
  const sentenceRomanization = education.romanization || romanizeHangul(education.koreanLine);

  const getTabTitle = () => {
    if (lang === "fa") {
      switch (activeTab) {
        case "overview": return "نمای کلی خط لیریک";
        case "vocabulary": return `واژگان و اصطلاحات (${education.words.length} واژه)`;
        case "grammar": return `قواعد دستوری و ساختار (${education.grammar.length} نکته)`;
        case "cultural": return "نکات مفهومی و فرهنگ کی‌پاپ";
        case "academy": return "آموزشگاه زبان کره‌ای و کد تخفیف";
      }
    }
    if (lang === "ko") {
      switch (activeTab) {
        case "overview": return "가사 개요";
        case "vocabulary": return `핵심 어휘 (${education.words.length})`;
        case "grammar": return `문법 포인트 (${education.grammar.length})`;
        case "cultural": return "문화 및 뉘앙스";
        case "academy": return "어학원 및 할인 혜택";
      }
    }
    switch (activeTab) {
      case "overview": return "Lyric Line Overview";
      case "vocabulary": return `Key Vocabulary (${education.words.length})`;
      case "grammar": return `Grammar Points (${education.grammar.length})`;
      case "cultural": return "Cultural & Nuance Notes";
      case "academy": return "Korean Academy & Promo";
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-end lg:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm overscroll-contain animate-fadeIn overflow-hidden"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] lg:max-h-[85vh] w-full max-w-[840px] flex-col lg:flex-row overflow-hidden rounded-t-[26px] lg:rounded-[26px] border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
         *  DESKTOP SIDEBAR (Brand Purple Background with Vertical Navigation)
         *  نمایش سایدبار بنفش در دسکتاپ (صفحه‌های بالای ۱۰۲۴ پیکسل)
         * ========================================================================= */}
        <aside className="hidden lg:flex lg:w-[240px] shrink-0 flex-col justify-between bg-primary p-4 text-white shadow-inner select-none">
          <div>
            {/* Sidebar Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/20">
              <span className="flex size-8 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs">
                <Icon name="sparkle" size={16} strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[13.5px] font-black text-white leading-tight">
                  {lang === "fa" ? "آموزش زبان کره‌ای" : lang === "ko" ? "가사 한국어" : "Korean Learning"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[12px] text-white/80 font-bold">
                    {lang === "fa" ? `خط ${lineIndex + 1}` : `Line ${lineIndex + 1}`}
                  </span>
                  {isFreePreview ? (
                    <span className="rounded-full bg-emerald-400/25 px-1.5 py-0.2 text-[12px] font-black text-emerald-200">
                      {lang === "fa" ? "رایگان" : "Free"}
                    </span>
                  ) : isLocked ? (
                    <span className="rounded-full bg-amber-400/25 px-1.5 py-0.2 text-[12px] font-black text-amber-200 flex items-center gap-0.5">
                      <Icon name="lock" size={10} />
                      <span>{settings.requiredPoints}P</span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-400/25 px-1.5 py-0.2 text-[12px] font-black text-emerald-200">
                      {lang === "fa" ? "بازگشایی شده" : "Unlocked"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-4 space-y-1.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const badge = tab.getBadge ? tab.getBadge(education, ad) : null;
                const label = lang === "fa" ? tab.labelFa : lang === "ko" ? tab.labelKo : tab.labelEn;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-[12.5px] transition cursor-pointer",
                      isActive
                        ? "bg-white text-primary font-black shadow-md scale-[1.02]"
                        : "text-white/85 font-bold hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon name={tab.icon} size={15} strokeWidth={isActive ? 2.4 : 2} />
                      <span className="truncate">{label}</span>
                    </div>

                    {badge !== null && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[12px] font-extrabold shrink-0",
                          isActive
                            ? "bg-primary text-white"
                            : "bg-white/20 text-white",
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Track Summary */}
          <div className="mt-4 rounded-xl bg-black/20 p-2.5 backdrop-blur-2xs border border-white/10">
            <p className="truncate text-[12px] font-black text-white/95">
              {track.title}
            </p>
            <p className="truncate text-[12px] text-white/75 mt-0.5">
              {track.artist}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[12px] text-white/80 border-t border-white/15 pt-1">
              <span>{lang === "fa" ? "امتیاز شما:" : "Points:"}</span>
              <span className="font-extrabold text-white">{userPoints}</span>
            </div>
          </div>
        </aside>

        {/* =========================================================================
         *  MOBILE & TABLET TOP MENU (Brand Purple Header with Capsule Tabs)
         *  تبدیل سایدبار به منوی کپسولی شیک در موبایل و تبلت (زیر ۱۰۲۴ پیکسل)
         * ========================================================================= */}
        <div className="flex lg:hidden flex-col bg-primary p-3 text-white shrink-0 select-none shadow-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                <Icon name="sparkle" size={14} strokeWidth={2.4} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[13px] font-black text-white truncate">
                  {lang === "fa" ? "آموزش زبان کره‌ای با لیریک" : lang === "ko" ? "가사 한국어 학습" : "Korean via Lyrics"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[12px] text-white/80 font-bold truncate">
                    {track.title} • {lang === "fa" ? `خط ${lineIndex + 1}` : `Line ${lineIndex + 1}`}
                  </p>
                  {isFreePreview ? (
                    <span className="rounded-full bg-emerald-400/25 px-1.5 py-0.2 text-[12px] font-black text-emerald-200 shrink-0">
                      {lang === "fa" ? "رایگان" : "Free"}
                    </span>
                  ) : isLocked ? (
                    <span className="rounded-full bg-amber-400/25 px-1.5 py-0.2 text-[12px] font-black text-amber-200 shrink-0 flex items-center gap-0.5">
                      <Icon name="lock" size={10} />
                      <span>{settings.requiredPoints}P</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition shrink-0"
              aria-label="Close"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          {/* Horizontal Scrollable Capsule Menu */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scroll-rail pb-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const badge = tab.getBadge ? tab.getBadge(education, ad) : null;
              const label = lang === "fa" ? tab.labelFa : lang === "ko" ? tab.labelKo : tab.labelEn;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition cursor-pointer",
                    isActive
                      ? "bg-white text-primary font-black shadow-sm"
                      : "bg-white/15 text-white/90 font-bold hover:bg-white/25",
                  )}
                >
                  <Icon name={tab.icon} size={13} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{label}</span>
                  {badge !== null && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[12px] font-extrabold",
                        isActive ? "bg-primary text-white" : "bg-black/30 text-white",
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
         *  MAIN CONTENT VIEW AREA (Clean, Focused, and Uncluttered)
         *  محتوای اصلی به تفکیک تب انتخاب‌شده همراه با قفل امتیازی خطوط پیشرفته
         * ========================================================================= */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Desktop Content Header */}
          <div className="hidden lg:flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface/50">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary-deep">
                <Icon name={activeTabMeta.icon} size={15} strokeWidth={2.4} />
              </span>
              <h4 className="text-[14px] font-black text-ink">
                {getTabTitle()}
              </h4>
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

          {/* Active Tab Body Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 scroll-slim space-y-4">
            {/* If line is locked (lineIndex >= 3 and user has insufficient points) */}
            {isLocked && activeTab !== "academy" ? (
              <div className="rounded-[22px] border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface to-surface p-5 shadow-sm text-center space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 shadow-inner">
                  <Icon name="lock" size={26} strokeWidth={2.4} />
                </div>

                <div>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[12px] font-black text-amber-700 dark:text-amber-400">
                    {lang === "fa" ? "قفل امتیازی آموزش پیشرفته" : "Advanced Education Locked"}
                  </span>
                  <h4 className="mt-2 text-[16px] font-black text-ink">
                    {lang === "fa" ? "این بخش نیاز به امتیاز هواداری دارد" : "Fan Points Required to Unlock"}
                  </h4>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted max-w-md mx-auto">
                    {lang === "fa"
                      ? `۳ خط نخست ترانه‌ها به صورت هدیه و رایگان در دسترس شماست. برای بازگشایی کامل تحلیل واژگان، گرامر و تلفظ خطوط بعدی (خط ۴ به بعد)، نیاز به حداقل ${settings.requiredPoints} امتیاز دارید.`
                      : `The first 3 lines of this song are free previews. To unlock vocabulary and grammar for lines 4+, you need ${settings.requiredPoints} fan points.`}
                  </p>
                </div>

                {/* Progress Bar towards unlock */}
                <div className="rounded-xl border border-line bg-surface p-3.5 max-w-md mx-auto text-start">
                  <div className="flex items-center justify-between text-[12px] font-bold">
                    <span className="text-ink-muted">
                      {lang === "fa" ? "امتیاز فعلی شما:" : "Your Current Points:"}
                    </span>
                    <span className="font-extrabold text-primary-deep">
                      {userPoints} / {settings.requiredPoints}
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(8, (userPoints / settings.requiredPoints) * 100))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                    {lang === "fa"
                      ? `تنها ${Math.max(0, settings.requiredPoints - userPoints)} امتیاز دیگر تا بازگشایی کامل آموزش این آهنگ!`
                      : `${Math.max(0, settings.requiredPoints - userPoints)} more points needed to unlock!`}
                  </p>
                </div>

                {/* How to earn points */}
                <div className="rounded-xl border border-line/70 bg-subtle/40 p-3 max-w-md mx-auto text-start text-[12px]">
                  <p className="font-extrabold text-ink mb-1.5">
                    💡 {lang === "fa" ? "راه‌های سریع برای کسب امتیاز:" : "How to earn points:"}
                  </p>
                  <ul className="space-y-1 text-ink-muted list-disc list-inside">
                    <li>{lang === "fa" ? "پخش و گوش دادن کامل به ترانه‌ها (+۱ امتیاز)" : "Stream full tracks (+1 pt)"}</li>
                    <li>{lang === "fa" ? "ثبت نظر و گفتگو در صفحه آهنگ‌ها (+۰.۲۵ امتیاز)" : "Leave comments (+0.25 pt)"}</li>
                    <li>{lang === "fa" ? "دعوت دوستان با لینک و کد معرف پروفایل (+۳ امتیاز)" : "Invite friends with referral code (+3 pts)"}</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-primary px-5 py-2 text-[12px] font-bold text-white shadow-primary hover:bg-primary-deep transition"
                  >
                    {lang === "fa" ? "متوجه شدم (بستن)" : "Close"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ---------------- 1. TAB: OVERVIEW (نمای کلی خط) ---------------- */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Main Lyric Focus Card */}
                    <div className="rounded-[22px] border-2 border-primary/30 bg-gradient-to-br from-primary-faint/70 via-surface to-surface p-4 sm:p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-[12px] font-black text-primary-deep">
                          {lang === "fa" ? "متن اصلی ترانه" : "Original Lyric"}
                        </span>
                        {isFreePreview && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[12px] font-extrabold text-emerald-700 dark:text-emerald-400">
                            {lang === "fa" ? "✨ خط رایگان" : "Free Line"}
                          </span>
                        )}
                      </div>

                      {/* Korean Hangul Line */}
                      <p className="mt-2.5 text-[18px] sm:text-[22px] font-black tracking-tight text-ink leading-snug">
                        {education.koreanLine}
                      </p>

                      {/* ENGLISH PRONUNCIATION / ROMANIZATION CARD */}
                      <div className="mt-3 rounded-2xl border border-primary/25 bg-primary-soft/30 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-extrabold text-primary-deep flex items-center gap-1.5">
                            <Icon name="mic" size={13} strokeWidth={2.4} />
                            <span>{lang === "fa" ? "تلفظ انگلیسی جمله (Romanization):" : "English Pronunciation:"}</span>
                          </span>
                          <span className="rounded bg-primary/15 px-2 py-0.5 text-[12px] font-bold text-primary-deep font-mono">
                            Phonetic
                          </span>
                        </div>
                        <p className="font-mono text-[13.5px] sm:text-[14px] font-black text-ink tracking-wide select-all">
                          {sentenceRomanization}
                        </p>
                        <p className="text-[12px] text-ink-muted mt-1">
                          {lang === "fa"
                            ? "کاربرانی که کره‌ای بلد نیستند می‌توانند از روی تلفظ انگلیسی همخوانی کنند."
                            : "Easy phonetic guide for fans who do not read Hangul."}
                        </p>
                      </div>

                      {/* Persian Translation */}
                      <p dir="rtl" className="mt-3 text-[14px] font-bold text-ink-body leading-relaxed border-t border-line/60 pt-2.5">
                        {education.translationFa}
                      </p>
                    </div>

                    {/* Quick Highlights / Navigation Jump Cards */}
                    <div>
                      <h5 className="text-[12.5px] font-extrabold text-ink-muted mb-2">
                        {lang === "fa" ? "بخش‌های آموزشی این خط:" : "Educational Sections:"}
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Jump to Vocabulary */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("vocabulary")}
                          className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-start shadow-2xs hover:border-primary/50 hover:bg-primary-faint/30 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary-deep">
                              <Icon name="list" size={15} strokeWidth={2.4} />
                            </span>
                            <div>
                              <p className="text-[13px] font-black text-ink">
                                {lang === "fa" ? "واژگان کلیدی" : "Key Vocabulary"}
                              </p>
                              <p className="text-[12px] text-ink-muted">
                                {education.words.length} {lang === "fa" ? "واژه با تلفظ انگلیسی و معنی" : "words with English pronunciation"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary-deep">
                            {lang === "fa" ? "مشاهده" : "View"}
                          </span>
                        </button>

                        {/* Jump to Grammar */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("grammar")}
                          className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-start shadow-2xs hover:border-primary/50 hover:bg-primary-faint/30 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                              <Icon name="check" size={15} strokeWidth={2.4} />
                            </span>
                            <div>
                              <p className="text-[13px] font-black text-ink">
                                {lang === "fa" ? "قواعد دستوری" : "Grammar Rules"}
                              </p>
                              <p className="text-[12px] text-ink-muted">
                                {education.grammar.length} {lang === "fa" ? "نکته ساختاری جمله" : "grammar breakdown"}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[12px] font-bold text-amber-700 dark:text-amber-400">
                            {lang === "fa" ? "بررسی" : "Check"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Cultural Teaser Card */}
                    {education.culturalNotes && (
                      <div
                        onClick={() => setActiveTab("cultural")}
                        className="flex items-center justify-between rounded-xl border border-line/80 bg-subtle/50 p-3 hover:border-primary/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-surface text-amber-500 shadow-2xs">
                            <Icon name="star" size={14} />
                          </span>
                          <p className="truncate text-[12.5px] font-bold text-ink-body">
                            {lang === "fa" ? "نکته مفهومی ترانه:" : "Nuance:"} {education.culturalNotes}
                          </p>
                        </div>
                        <span className="shrink-0 text-[12px] font-bold text-primary-deep">
                          {lang === "fa" ? "بیشتر" : "More"}
                        </span>
                      </div>
                    )}

                    {/* Academy Ad Sneak Peek */}
                    {ad.enabled && (
                      <div
                        onClick={() => setActiveTab("academy")}
                        className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary-faint/40 p-3 hover:bg-primary-faint/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-2xs">
                            <Icon name="crown" size={13} strokeWidth={2.4} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-black text-ink">
                              {ad.academyName}
                            </p>
                            <p className="truncate text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                              🏷️ {ad.discountText}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[12px] font-bold text-white shadow-primary">
                          {lang === "fa" ? "تخفیف ویژه" : "Promo"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- 2. TAB: VOCABULARY (واژگان و اصطلاحات با تلفظ انگلیسی) ---------------- */}
                {activeTab === "vocabulary" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-line/70">
                      <p className="text-[12.5px] font-extrabold text-ink-muted">
                        {lang === "fa" ? "واژگان استخراج‌شده به همراه تلفظ انگلیسی و معنی:" : "Words with English pronunciation & definitions:"}
                      </p>
                      <span className="text-[12px] font-bold text-primary-deep">
                        {education.words.length} {lang === "fa" ? "واژه" : "words"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {education.words.map((w, idx) => {
                        const isCopied = copiedWord === w.korean;
                        const englishPron = w.pronunciationEn || romanizeHangul(w.korean);

                        return (
                          <div
                            key={idx}
                            className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 shadow-2xs hover:border-primary/50 transition group"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="text-[17px] font-black text-ink tracking-tight">
                                  {w.korean}
                                </span>

                                {/* ENGLISH PRONUNCIATION */}
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="font-mono text-[12px] font-black text-primary-deep bg-primary-soft/60 px-2 py-0.5 rounded-md">
                                    🗣️ {englishPron}
                                  </span>
                                </div>

                                {w.pronunciation && w.pronunciation !== englishPron && (
                                  <p className="text-[12px] font-semibold text-ink-faint mt-0.5">
                                    {w.pronunciation}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {w.partOfSpeech && (
                                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[12px] font-bold text-primary-deep">
                                    {w.partOfSpeech}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopyWord(w.korean)}
                                  title={lang === "fa" ? "کپی واژه کره‌ای" : "Copy Korean word"}
                                  className="flex size-7 items-center justify-center rounded-lg text-ink-muted hover:bg-subtle hover:text-ink transition"
                                >
                                  <Icon name={isCopied ? "check" : "copy"} size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2.5 border-t border-line/60 pt-2">
                              <p className="text-[13px] font-bold text-ink-body">
                                {w.meaning}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ---------------- 3. TAB: GRAMMAR (دستور زبان و قواعد) ---------------- */}
                {activeTab === "grammar" && (
                  <div className="space-y-3">
                    <div className="pb-1 border-b border-line/70">
                      <p className="text-[12.5px] font-extrabold text-ink-muted">
                        {lang === "fa" ? "تحلیل و بررسی ساختار دستوری جمله:" : "Grammar structure and sentence patterns:"}
                      </p>
                    </div>

                    {education.grammar.length > 0 ? (
                      <div className="space-y-3">
                        {education.grammar.map((g, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-line bg-surface p-4 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[13px] font-black text-amber-700 dark:text-amber-400">
                                {g.rule}
                              </span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-ink-body font-medium pt-1">
                              {g.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-line bg-subtle/30 text-center">
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary-deep mb-2">
                          <Icon name="check" size={18} strokeWidth={2.4} />
                        </span>
                        <p className="text-[13px] font-bold text-ink">
                          {lang === "fa" ? "ساختار مستقیم و ساده" : "Simple Sentence Structure"}
                        </p>
                        <p className="text-[12px] text-ink-muted mt-1 max-w-sm">
                          {lang === "fa"
                            ? "این خط از لیریک از ساختار گفتاری روان و مستقیم استفاده می‌کند و نکته گرامری پیچیده‌ای ندارد."
                            : "This lyric line uses straightforward conversational Korean without complex grammatical shifts."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- 4. TAB: CULTURAL & NUANCE (نکات مفهومی) ---------------- */}
                {activeTab === "cultural" && (
                  <div className="space-y-3">
                    <div className="pb-1 border-b border-line/70">
                      <p className="text-[12.5px] font-extrabold text-ink-muted">
                        {lang === "fa" ? "بار معنایی، احساسی و بافت فرهنگی ترانه:" : "Lyric nuance, emotional tone, and K-pop culture:"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-faint/50 via-surface to-surface p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-2xs">
                          <Icon name="star" size={14} />
                        </span>
                        <h5 className="text-[13.5px] font-black text-ink">
                          {lang === "fa" ? "مفهوم عمیق ترانه" : "Deep Nuance & Meaning"}
                        </h5>
                      </div>

                      <p className="text-[13px] leading-relaxed text-ink-body font-medium">
                        {education.culturalNotes || (
                          lang === "fa"
                            ? "این خط از ترانه بیانگر حس عاطفی و صمیمانه خواننده با شنونده است که با ظرافت‌های احساسی خاص کی‌پاپ ادا می‌شود."
                            : "This line expresses intimate artistic emotion reflecting modern K-pop songwriting aesthetics."
                        )}
                      </p>
                    </div>

                    {/* Extra Study Tip */}
                    <div className="rounded-xl border border-line bg-subtle/50 p-3.5 text-[12px] text-ink-muted space-y-1">
                      <p className="font-extrabold text-ink">
                        💡 {lang === "fa" ? "نکته آموزشی برای علاقه‌مندان:" : "Pro Study Tip:"}
                      </p>
                      <p className="leading-relaxed">
                        {lang === "fa"
                          ? "تکرار همزمان با خواننده و تطبیق تلفظ با خط هانگول به درک بهتر ریتم و آهنگ زبان کره‌ای کمک شایانی می‌کند."
                          : "Shadow-singing this line alongside the artist will help cement phonetic cadence and natural speech melody."}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---------------- 5. TAB: ACADEMY (آموزشگاه زبان و کد تخفیف) ---------------- */}
            {activeTab === "academy" && (
              <div className="space-y-3">
                {ad.enabled ? (
                  <div className="overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary-faint/80 via-surface to-surface p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-line/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-primary">
                          <Icon name="crown" size={16} strokeWidth={2.4} />
                        </span>
                        <div>
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[12px] font-black text-primary-deep">
                            {ad.badgeText}
                          </span>
                          <h5 className="mt-0.5 text-[14px] font-black text-ink">
                            {ad.academyName}
                          </h5>
                        </div>
                      </div>

                      {ad.discountCode && (
                        <button
                          type="button"
                          onClick={handleCopyDiscount}
                          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[12px] font-extrabold text-ink shadow-2xs hover:border-primary/50 transition cursor-pointer"
                        >
                          <span>{ad.discountCode}</span>
                          <Icon name={copiedCode ? "check" : "copy"} size={13} />
                        </button>
                      )}
                    </div>

                    <div>
                      <h6 className="text-[14px] font-extrabold text-ink">
                        {ad.title}
                      </h6>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                        {ad.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                        <span className="text-[12.5px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          🏷️ {ad.discountText}
                        </span>

                        <a
                          href={ad.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
                        >
                          <span>{ad.ctaText}</span>
                          <Icon name="arrowUpRight" size={13} strokeWidth={2.4} />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-line bg-subtle/30 text-ink-muted text-[13px]">
                    {lang === "fa" ? "در حال حاضر تبلیغ فعالی ثبت نشده است." : "No active academy sponsorship."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-line px-4 py-2.5 sm:px-5 bg-subtle/40 shrink-0">
            <span className="text-[12px] font-bold text-ink-muted">
              {lang === "fa" ? "پلتفرم استریم فیمس" : "FAIMESS Learning"}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-subtle px-4 py-1.5 text-[12px] font-bold text-ink hover:bg-subtle/80 transition"
            >
              {lang === "fa" ? "بستن" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
