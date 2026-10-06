/**
 * Korean Language Educational Learning & Academy Sponsorship System
 * Provides vocabulary breakdown, grammar rules, cultural notes for lyric lines,
 * and sponsored Korean language academy promotional card.
 */

export type LyricWord = {
  korean: string;
  pronunciation: string;
  meaning: string;
  partOfSpeech?: string;
};

export type LyricGrammar = {
  rule: string;
  explanation: string;
};

export type LyricEducation = {
  id: string; // e.g. `${trackId}_${lineIndex}`
  trackId: string;
  lineIndex: number;
  koreanLine: string;
  romanization?: string;
  translationFa: string;
  words: LyricWord[];
  grammar: LyricGrammar[];
  culturalNotes?: string;
};

export type AcademyAd = {
  enabled: boolean;
  academyName: string;
  badgeText: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  discountCode: string;
  discountText: string;
  contactNumber?: string;
  telegramId?: string;
};

export const DEFAULT_ACADEMY_AD: AcademyAd = {
  enabled: true,
  academyName: "آموزشگاه زبان کره‌ای هانگل (Hangul Academy)",
  badgeText: "اسپانسر رسمی آموزش",
  title: "یادگیری اصولی زبان کره‌ای از مبتدی تا آزمون رسمی TOPIK",
  description: "دوره‌های مکالمه آنلاین با اساتید برتر، تمرین با لیریک ترانه‌های کی‌پاپ و اهدای مدرک معتبر با تخفیف ویژه کاربران فیمس.",
  ctaText: "مشاوره رایگان و ثبت‌نام",
  ctaUrl: "https://t.me/faimessofficial",
  discountCode: "FAIMESS-KOREAN",
  discountText: "۳۰٪ تخفیف ویژه هواداران فیمس",
  contactNumber: "۰۲۱-۸۸۲۲۵۵۰۰",
  telegramId: "@faimessofficial",
};

// Pre-seeded high quality educational sheets for tracks
const SEED_LYRIC_EDUCATION: Record<string, LyricEducation[]> = {
  nt1: [
    {
      id: "nt1_0",
      trackId: "nt1",
      lineIndex: 0,
      koreanLine: "빛나는 밤하늘 아래서",
      romanization: "Binnaneun bamhaneul araeseo",
      translationFa: "زیر آسمان درخشان شب",
      words: [
        { korean: "빛나다", pronunciation: "بین‌نادا (bit-na-da)", meaning: "درخشیدن، نور افشاندن", partOfSpeech: "فعل" },
        { korean: "밤하늘", pronunciation: "بام‌هانول (bam-ha-neul)", meaning: "آسمان شب (ترکیب 밤 شب + 하늘 آسمان)", partOfSpeech: "اسم" },
        { korean: "아래서", pronunciation: "آرِئه‌سو (a-rae-seo)", meaning: "در زیر، پایینِ", partOfSpeech: "حرف اضافه مکان" },
      ],
      grammar: [
        { rule: "پسوند صفت‌ساز فاعلی ~는", explanation: "این پسوند به ریشه فعل زمان حال اضافه می‌شود و اسم بعدی را توصیف می‌کند (빛나다 ← 빛나는 밤: شب درخشان)." },
        { rule: "نشانه مکانی ~서 (از / در)", explanation: "مخفف 에서 است و نشان‌دهنده محلی است که فعالیتی در آن انجام می‌شود." },
      ],
      culturalNotes: "در اشعار و تصنیف‌های کره‌ای، ترکیب «آسمان شب» (밤하늘) معمولاً استعاره از رویاها، کنسرت‌های روشن با لایت‌استیک‌ها و پیوند جاودانه آرتیست با هواداران است.",
    },
    {
      id: "nt1_1",
      trackId: "nt1",
      lineIndex: 1,
      koreanLine: "우리 둘만의 노래를 불러",
      romanization: "Uri dulmane noraereul bulleo",
      translationFa: "ترانهٔ مخصوص فقط ما دو نفر را می‌خوانم",
      words: [
        { korean: "우리", pronunciation: "اوری (u-ri)", meaning: "ما، مال ما", partOfSpeech: "ضمیر" },
        { korean: "둘만", pronunciation: "دول‌مان (dul-man)", meaning: "فقط دو نفر (둘 دو + 만 فقط)", partOfSpeech: "اسم + پسوند" },
        { korean: "노래", pronunciation: "نورائه (no-rae)", meaning: "ترانه، آهنگ، آواز", partOfSpeech: "اسم" },
        { korean: "부르다", pronunciation: "بوروبودا (bu-reu-da)", meaning: "صدا زدن، خواندن ترانه", partOfSpeech: "فعل" },
      ],
      grammar: [
        { rule: "پسوند انحصاری ~만 (فقط/تنها)", explanation: "این پسوند برای محدود کردن موضوع به کار می‌رود (둘만 = فقط دو نفر)." },
        { rule: "پسوند مفعولی ~를/을", explanation: "به اسم مفعول متصل می‌شود. چون 노래 به مصوت ختم شده، 를 می‌گیرد." },
        { rule: "صرف فعل بی‌قاعده 르 (부르다 ← 불러)", explanation: "وقتی حرف 르 به یک پسوند مصوتی برخورد کند، به ㄹㄹ تبدیل می‌شود." },
      ],
      culturalNotes: "کلمه «우리» در فرهنگ کره‌ای مفهومی جمعی و سرشار از صمیمیت دارد و حتی برای اعضای خانواده و دوستان نزدیک نیز با حس تعلق عمیق به کار می‌رود.",
    },
    {
      id: "nt1_2",
      trackId: "nt1",
      lineIndex: 2,
      koreanLine: "어둠이 내려앉아도",
      romanization: "Eodumi naeryeoanjado",
      translationFa: "حتی اگر تاریکی فرود بیاید و همه‌جا را فراگیرد",
      words: [
        { korean: "어둠", pronunciation: "اودوم (eo-dum)", meaning: "تاریکی، ظلمت", partOfSpeech: "اسم" },
        { korean: "내려앉다", pronunciation: "نِریوآن‌تا (nae-ryeo-an-da)", meaning: "فرود آمدن، سایه افکندن", partOfSpeech: "فعل مرکب" },
      ],
      grammar: [
        { rule: "نشانه فاعلی ~이/가", explanation: "چون کلمه 어둠 به صامت ختم شده، پسوند فاعلی 이 گرفته است." },
        { rule: "پسوند شرطی-تقابلی ~아/어도 (حتی اگر...)", explanation: "بیانگر موقعیتی است که با وجود وقوع آن، شرایط تغییر نمی‌کند (내려앉아도 = حتی اگر فرود بیاید)." },
      ],
      culturalNotes: "فعل مرکب 내려앉다 از ترکیب 내려 (پایین) و 앉다 (نشستن) ساخته شده که در ادبیات شعر کره تجسمی شاعرانه از غروب و فرارسیدن شب است.",
    },
  ],
};

const AD_STORAGE_KEY = "faimess_academy_ad_v1";
const EDUCATION_STORAGE_KEY = "faimess_lyric_education_v1";

export function loadAcademyAd(): AcademyAd {
  if (typeof window === "undefined") return DEFAULT_ACADEMY_AD;
  try {
    const raw = localStorage.getItem(AD_STORAGE_KEY);
    return raw ? { ...DEFAULT_ACADEMY_AD, ...JSON.parse(raw) } : DEFAULT_ACADEMY_AD;
  } catch {
    return DEFAULT_ACADEMY_AD;
  }
}

export function saveAcademyAd(ad: AcademyAd): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(ad));
    } catch {}
  }
}

export function loadAllLyricEducation(): Record<string, LyricEducation[]> {
  if (typeof window === "undefined") return SEED_LYRIC_EDUCATION;
  try {
    const raw = localStorage.getItem(EDUCATION_STORAGE_KEY);
    if (!raw) return SEED_LYRIC_EDUCATION;
    const parsed: Record<string, LyricEducation[]> = JSON.parse(raw);
    return { ...SEED_LYRIC_EDUCATION, ...parsed };
  } catch {
    return SEED_LYRIC_EDUCATION;
  }
}

export function saveLyricEducationItem(item: LyricEducation): void {
  const all = loadAllLyricEducation();
  const trackItems = all[item.trackId] ? [...all[item.trackId]] : [];
  const existingIdx = trackItems.findIndex((x) => x.lineIndex === item.lineIndex);
  if (existingIdx >= 0) {
    trackItems[existingIdx] = item;
  } else {
    trackItems.push(item);
  }
  all[item.trackId] = trackItems;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
}

/**
 * Intelligent parser: returns custom admin educational notes if available,
 * or generates on-the-fly breakdown for any Korean line
 */
export function getLyricEducationForLine(
  trackId: string,
  lineIndex: number,
  koreanLine: string,
  persianLine: string,
): LyricEducation {
  const all = loadAllLyricEducation();
  const trackItems = all[trackId] || [];
  const found = trackItems.find((x) => x.lineIndex === lineIndex);
  if (found) return found;

  // Smart fallback generator for lines without explicit admin notes
  const tokens = koreanLine.split(/\s+/).filter(Boolean);
  const words: LyricWord[] = tokens.map((word) => {
    const clean = word.replace(/[^\uAC00-\uD7A3]/g, "");
    return {
      korean: clean || word,
      pronunciation: clean,
      meaning: `واژهٔ کلیدی در متن ترانه: «${clean}»`,
      partOfSpeech: "واژه",
    };
  });

  return {
    id: `${trackId}_${lineIndex}`,
    trackId,
    lineIndex,
    koreanLine,
    romanization: undefined,
    translationFa: persianLine,
    words: words.slice(0, 5),
    grammar: [
      {
        rule: "ساختار جمله در زبان کره‌ای (SOV)",
        explanation: "در زبان کره‌ای برخلاف زبان انگلیسی، فعل همواره در انتهای جمله قرار می‌گیرد (فاعل + مفعول + فعل).",
      },
      {
        rule: "نشانه‌ها و پسوندهای دستوری (조사)",
        explanation: "پسوندها نقش هر واژه در جمله را معین می‌کنند (مانند 은/는 برای موضوع، 이/가 برای فاعل و 을/를 برای مفعول مستقیم).",
      },
    ],
    culturalNotes: "این خط بخشی از ترانهٔ رسمی است. تلفظ دقیق حروف و لحن احساسی (احساس غم، هیجان یا امید) نقش کلیدی در زیبایی اجرای موسیقی کی‌پاپ ایفا می‌کند.",
  };
}
