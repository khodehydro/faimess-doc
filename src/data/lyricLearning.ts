/**
 * Korean Language Educational Learning & Academy Sponsorship System
 * Provides vocabulary breakdown, grammar rules, cultural notes for lyric lines,
 * natural English phonetic romanization, points-based unlocking,
 * and sponsored Korean language academy promotional card.
 */

export type LyricWord = {
  korean: string;
  pronunciation?: string; // Persian phonetic e.g. "بین‌نادا"
  pronunciationEn?: string; // English Romanization e.g. "bit-na-da"
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
  romanization?: string; // English phonetic pronunciation for the entire sentence
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

export type EducationSettings = {
  freeLinesCount: number; // default: 3
  requiredPoints: number; // default: 50
};

export const DEFAULT_EDUCATION_SETTINGS: EducationSettings = {
  freeLinesCount: 3,
  requiredPoints: 50,
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

/**
 * High-accuracy algorithmic Hangul Romanizer for Korean sentences and words.
 * Decomposes syllable blocks into Initial, Medial, and Final jamo and maps to
 * natural English phonetic letters so users who cannot read Hangul can easily read aloud.
 */
export function romanizeHangul(text: string): string {
  if (!text) return "";
  const INITIALS = [
    "g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s",
    "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
  ];
  const VOWELS = [
    "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa",
    "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i",
  ];
  const FINALS = [
    "", "k", "k", "ks", "n", "nj", "nh", "t", "l", "lg",
    "lm", "lb", "ls", "lt", "lp", "lh", "m", "p", "bs", "s",
    "ss", "ng", "j", "ch", "k", "t", "p", "h",
  ];

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const syl = code - 0xac00;
      const f = syl % 28;
      const m = Math.floor((syl - f) / 28) % 21;
      const ini = Math.floor(Math.floor((syl - f) / 28) / 21);
      result += INITIALS[ini] + VOWELS[m] + FINALS[f];
    } else {
      result += text[i];
    }
  }

  // Capitalize first character of words for aesthetic typography
  return result
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

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
        {
          korean: "빛나다",
          pronunciation: "بین‌نادا",
          pronunciationEn: "bit-na-da",
          meaning: "درخشیدن، نور افشاندن",
          partOfSpeech: "فعل",
        },
        {
          korean: "밤하늘",
          pronunciation: "بام‌هانول",
          pronunciationEn: "bam-ha-neul",
          meaning: "آسمان شب (ترکیب 밤 شب + 하늘 آسمان)",
          partOfSpeech: "اسم",
        },
        {
          korean: "아래서",
          pronunciation: "آرِئه‌سو",
          pronunciationEn: "a-rae-seo",
          meaning: "در زیر، پایینِ",
          partOfSpeech: "حرف اضافه مکان",
        },
      ],
      grammar: [
        {
          rule: "پسوند صفت‌ساز فاعلی ~는",
          explanation: "این پسوند به ریشه فعل زمان حال اضافه می‌شود و اسم بعدی را توصیف می‌کند (빛나다 ← 빛나는 밤: شب درخشان).",
        },
        {
          rule: "نشانه مکانی ~서 (از / در)",
          explanation: "مخفف 에서 است و نشان‌دهنده محلی است که فعالیتی در آن انجام می‌شود.",
        },
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
        {
          korean: "우리",
          pronunciation: "اوری",
          pronunciationEn: "u-ri",
          meaning: "ما، مال ما",
          partOfSpeech: "ضمیر",
        },
        {
          korean: "둘만",
          pronunciation: "دول‌مان",
          pronunciationEn: "dul-man",
          meaning: "فقط دو نفر (둘 دو + 만 فقط)",
          partOfSpeech: "اسم + پسوند",
        },
        {
          korean: "노래",
          pronunciation: "نورائه",
          pronunciationEn: "no-rae",
          meaning: "ترانه، آهنگ، آواز",
          partOfSpeech: "اسم",
        },
        {
          korean: "부르다",
          pronunciation: "بوروبودا",
          pronunciationEn: "bu-reu-da",
          meaning: "صدا زدن، خواندن ترانه",
          partOfSpeech: "فعل",
        },
      ],
      grammar: [
        {
          rule: "پسوند انحصاری ~만 (فقط/تنها)",
          explanation: "این پسوند برای محدود کردن موضوع به کار می‌رود (둘만 = فقط دو نفر).",
        },
        {
          rule: "پسوند مفعولی ~를/을",
          explanation: "به اسم مفعول متصل می‌شود. چون 노래 به مصوت ختم شده، 를 می‌گیرد.",
        },
        {
          rule: "صرف فعل بی‌قاعده 르 (부르다 ← 불러)",
          explanation: "وقتی حرف 르 به یک پسوند مصوتی برخورد کند، به ㄹㄹ تبدیل می‌شود.",
        },
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
        {
          korean: "어둠",
          pronunciation: "اودوم",
          pronunciationEn: "eo-dum",
          meaning: "تاریکی، ظلمت",
          partOfSpeech: "اسم",
        },
        {
          korean: "내려앉다",
          pronunciation: "نِریوآن‌تا",
          pronunciationEn: "nae-ryeo-an-da",
          meaning: "فرود آمدن، سایه افکندن",
          partOfSpeech: "فعل مرکب",
        },
      ],
      grammar: [
        {
          rule: "نشانه فاعلی ~이/가",
          explanation: "چون کلمه 어둠 به صامت ختم شده، پسوند فاعلی 이 گرفته است.",
        },
        {
          rule: "پسوند شرطی-تقابلی ~아/어도 (حتی اگر...)",
          explanation: "بیانگر موقعیتی است که با وجود وقوع آن، شرایط تغییر نمی‌کند (내려앉아도 = حتی اگر فرود بیاید).",
        },
      ],
      culturalNotes: "فعل مرکب 내려앉다 از ترکیب 내려 (پایین) و 앉다 (نشستن) ساخته شده که در ادبیات شعر کره تجسمی شاعرانه از غروب و فرارسیدن شب است.",
    },
    {
      id: "nt1_3",
      trackId: "nt1",
      lineIndex: 3,
      koreanLine: "너와 함께라면 두렵지 않아",
      romanization: "Neowa hamkkeramyeon duryeopji ana",
      translationFa: "تا زمانی که با تو باشم، هیچ ترسی ندارم",
      words: [
        {
          korean: "너",
          pronunciation: "نو",
          pronunciationEn: "neo",
          meaning: "تو (صمیمانه)",
          partOfSpeech: "ضمیر",
        },
        {
          korean: "함께",
          pronunciation: "هام‌که",
          pronunciationEn: "ham-kke",
          meaning: "با هم، همراه",
          partOfSpeech: "قید",
        },
        {
          korean: "두렵다",
          pronunciation: "دوریوپ‌تا",
          pronunciationEn: "du-ryeop-da",
          meaning: "ترسیدن، بیم داشتن",
          partOfSpeech: "صفت / فعل حالتی",
        },
        {
          korean: "않다",
          pronunciation: "آن‌تا",
          pronunciationEn: "an-ta",
          meaning: "نبودن، منفی‌ساز فعل",
          partOfSpeech: "فعل کمکی منفی",
        },
      ],
      grammar: [
        {
          rule: "پسوند همراهی ~와/과 (با)",
          explanation: "چون 너 به مصوت ختم شده، پسوند 와 به آن اضافه می‌شود (너와 = با تو).",
        },
        {
          rule: "ساختار شرطی ~(이)라면 (اگر ... باشد)",
          explanation: "به اسم متصل شده و حالت فرضی را بیان می‌کند.",
        },
        {
          rule: "ساختار منفی‌ساز ~지 않다",
          explanation: "برای منفی کردن افعال و صفات به کار می‌رود (두렵지 않아 = نمی‌ترسم).",
        },
      ],
      culturalNotes: "عبارت «너와 함께라면» یکی از احساسی‌ترین کلیدواژه‌های موسیقی کی‌پاپ برای بیان امید، استقامت و تسلی‌بخشی روحی میان خواننده و هواداران است.",
    },
  ],
};

const AD_STORAGE_KEY = "faimess_academy_ad_v1";
const EDUCATION_STORAGE_KEY = "faimess_lyric_education_v1";
const SETTINGS_STORAGE_KEY = "faimess_education_settings_v1";

export function loadEducationSettings(): EducationSettings {
  if (typeof window === "undefined") return DEFAULT_EDUCATION_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_EDUCATION_SETTINGS, ...JSON.parse(raw) } : DEFAULT_EDUCATION_SETTINGS;
  } catch {
    return DEFAULT_EDUCATION_SETTINGS;
  }
}

export function saveEducationSettings(settings: EducationSettings): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }
}

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

  // Guarantee romanization and word romanization are filled
  const enrichedItem: LyricEducation = {
    ...item,
    romanization: item.romanization?.trim() || romanizeHangul(item.koreanLine),
    words: item.words.map((w) => ({
      ...w,
      pronunciationEn: w.pronunciationEn?.trim() || romanizeHangul(w.korean),
      pronunciation: w.pronunciation?.trim() || w.pronunciationEn || romanizeHangul(w.korean),
    })),
  };

  if (existingIdx >= 0) {
    trackItems[existingIdx] = enrichedItem;
  } else {
    trackItems.push(enrichedItem);
  }
  all[item.trackId] = trackItems;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
}

export function deleteLyricEducationItem(trackId: string, lineIndex: number): void {
  const all = loadAllLyricEducation();
  if (!all[trackId]) return;
  all[trackId] = all[trackId].filter((x) => x.lineIndex !== lineIndex);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
}

/**
 * Intelligent parser: returns custom admin educational notes if available,
 * or generates on-the-fly breakdown with natural English romanization for any Korean line
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
  if (found) {
    return {
      ...found,
      romanization: found.romanization || romanizeHangul(koreanLine),
      words: found.words.map((w) => ({
        ...w,
        pronunciationEn: w.pronunciationEn || romanizeHangul(w.korean),
      })),
    };
  }

  // Smart fallback generator for lines without explicit admin notes
  const tokens = koreanLine.split(/\s+/).filter(Boolean);
  const words: LyricWord[] = tokens.map((word) => {
    const clean = word.replace(/[^\uAC00-\uD7A3]/g, "");
    const rom = romanizeHangul(clean || word);
    return {
      korean: clean || word,
      pronunciation: rom,
      pronunciationEn: rom,
      meaning: `واژهٔ کلیدی در متن ترانه: «${clean || word}»`,
      partOfSpeech: "واژه",
    };
  });

  return {
    id: `${trackId}_${lineIndex}`,
    trackId,
    lineIndex,
    koreanLine,
    romanization: romanizeHangul(koreanLine),
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
