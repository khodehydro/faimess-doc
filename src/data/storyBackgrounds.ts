/**
 * Story Card Backgrounds Database & Manager
 * Supports group/artist-tailored backgrounds with required fan points threshold.
 * Admin can add/upload new backgrounds via Site Settings.
 */

export type StoryBackground = {
  id: string;
  titleFa: string;
  titleEn: string;
  artistId: string; // group id or 'all'
  artistName: string;
  requiredPoints: number; // 0 = free, 100, 250, 500
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  pattern: "neon_stage" | "cosmic_stars" | "purple_haze" | "prism_glow" | "minimal_dark" | "gradient" | "custom_image";
  imageUrl?: string;
  isOfficial?: boolean;
};

const DEFAULT_STORY_BACKGROUNDS: StoryBackground[] = [
  // 1. Universal Official Brand Violet
  {
    id: "bg-brand-violet",
    titleFa: "بنفش اصیل فیمس",
    titleEn: "Brand Purple",
    artistId: "all",
    artistName: "FAIMESS",
    requiredPoints: 0,
    gradientFrom: "#8267f0",
    gradientTo: "#3d1b8c",
    accentColor: "#ffffff",
    pattern: "purple_haze",
    isOfficial: true,
  },
  // 2. Midnight Noir
  {
    id: "bg-midnight-noir",
    titleFa: "میدنایت سئول",
    titleEn: "Midnight Noir",
    artistId: "all",
    artistName: "FAIMESS",
    requiredPoints: 0,
    gradientFrom: "#0d0c15",
    gradientTo: "#1b182b",
    accentColor: "#8267f0",
    pattern: "minimal_dark",
    isOfficial: true,
  },
  // 3. BTS Purple Galaxy
  {
    id: "bg-bts-ocean",
    titleFa: "کهکشان بنفش آرمی",
    titleEn: "BTS Purple Ocean",
    artistId: "bts",
    artistName: "BTS",
    requiredPoints: 100,
    gradientFrom: "#9333ea",
    gradientTo: "#20063b",
    accentColor: "#f3e8ff",
    pattern: "cosmic_stars",
    isOfficial: true,
  },
  // 4. BTS World Tour Velvet
  {
    id: "bg-bts-tour",
    titleFa: "کنسرت جهانی BTS",
    titleEn: "BTS World Tour",
    artistId: "bts",
    artistName: "BTS",
    requiredPoints: 250,
    gradientFrom: "#7e22ce",
    gradientTo: "#0f051d",
    accentColor: "#e9d5ff",
    pattern: "neon_stage",
    isOfficial: true,
  },
  // 5. BLACKPINK Pink Venom
  {
    id: "bg-bp-pink",
    titleFa: "پینک ونوم بلک‌پینک",
    titleEn: "Pink Venom Arena",
    artistId: "blackpink",
    artistName: "BLACKPINK",
    requiredPoints: 100,
    gradientFrom: "#ec4899",
    gradientTo: "#12030a",
    accentColor: "#fdf2f8",
    pattern: "neon_stage",
    isOfficial: true,
  },
  // 6. BLACKPINK Born Pink Noir
  {
    id: "bg-bp-born",
    titleFa: "بورن پینک نوار",
    titleEn: "Born Pink Noir",
    artistId: "blackpink",
    artistName: "BLACKPINK",
    requiredPoints: 250,
    gradientFrom: "#db2777",
    gradientTo: "#050505",
    accentColor: "#fce7f3",
    pattern: "minimal_dark",
    isOfficial: true,
  },
  // 7. Stray Kids Maniac Red
  {
    id: "bg-skz-maniac",
    titleFa: "قطب‌نمای سرخ استی",
    titleEn: "SKZ Red Compass",
    artistId: "stray-kids",
    artistName: "Stray Kids",
    requiredPoints: 100,
    gradientFrom: "#e11d48",
    gradientTo: "#160307",
    accentColor: "#ffe4e6",
    pattern: "neon_stage",
    isOfficial: true,
  },
  // 8. NewJeans Ditto Denim
  {
    id: "bg-nj-ditto",
    titleFa: "آبی پاستلی دیتو",
    titleEn: "Ditto Y2K Denim",
    artistId: "newjeans",
    artistName: "NewJeans",
    requiredPoints: 100,
    gradientFrom: "#0284c7",
    gradientTo: "#0b1528",
    accentColor: "#e0f2fe",
    pattern: "gradient",
    isOfficial: true,
  },
  // 9. TWICE Candy Bong
  {
    id: "bg-twice-candy",
    titleFa: "آبنبات نئونی توایس",
    titleEn: "TWICE Candy Bong",
    artistId: "twice",
    artistName: "TWICE",
    requiredPoints: 100,
    gradientFrom: "#f97316",
    gradientTo: "#831843",
    accentColor: "#ffedd5",
    pattern: "prism_glow",
    isOfficial: true,
  },
  // 10. Aespa Kwangya Dimension
  {
    id: "bg-aespa-kwangya",
    titleFa: "بُعد مجازی کوانیا",
    titleEn: "Kwangya Dimension",
    artistId: "aespa",
    artistName: "Aespa",
    requiredPoints: 150,
    gradientFrom: "#6366f1",
    gradientTo: "#0c0a27",
    accentColor: "#c7d2fe",
    pattern: "cosmic_stars",
    isOfficial: true,
  },
  // 11. SEVENTEEN Carat Diamond
  {
    id: "bg-svt-carat",
    titleFa: "الماس رز کوارتز سونتین",
    titleEn: "Carat Rose Quartz",
    artistId: "seventeen",
    artistName: "SEVENTEEN",
    requiredPoints: 150,
    gradientFrom: "#f472b6",
    gradientTo: "#1e1b4b",
    accentColor: "#fce7f3",
    pattern: "prism_glow",
    isOfficial: true,
  },
  // 12. TXT Starseeker Cyan
  {
    id: "bg-txt-cyan",
    titleFa: "آبی رویایی موآ",
    titleEn: "TXT Dream Cyan",
    artistId: "txt",
    artistName: "TXT",
    requiredPoints: 100,
    gradientFrom: "#0891b2",
    gradientTo: "#082f49",
    accentColor: "#cffafe",
    pattern: "cosmic_stars",
    isOfficial: true,
  },
  // 13. Platform: NOVAE Supernova
  {
    id: "bg-novae-supernova",
    titleFa: "انفجار سوپرنوا",
    titleEn: "NOVAE Supernova",
    artistId: "ar-novae",
    artistName: "NOVAE",
    requiredPoints: 50,
    gradientFrom: "#2563eb",
    gradientTo: "#030712",
    accentColor: "#dbeafe",
    pattern: "neon_stage",
    isOfficial: true,
  },
  // 14. Platform: PRISM9 9-Colors
  {
    id: "bg-prism9-colors",
    titleFa: "طیف ۹ رنگ منشوری",
    titleEn: "PRISM9 Spectrum",
    artistId: "ar-prism9",
    artistName: "PRISM9",
    requiredPoints: 50,
    gradientFrom: "#d946ef",
    gradientTo: "#1e1b4b",
    accentColor: "#fae8ff",
    pattern: "prism_glow",
    isOfficial: true,
  },
  // 15. Platform: KAIROS Nebula
  {
    id: "bg-kairos-orbit",
    titleFa: "مدار کیهانی کایروس",
    titleEn: "KAIROS Orbit",
    artistId: "ar-kairos",
    artistName: "KAIROS",
    requiredPoints: 50,
    gradientFrom: "#7c3aed",
    gradientTo: "#110726",
    accentColor: "#ede9fe",
    pattern: "cosmic_stars",
    isOfficial: true,
  },
];

const STORAGE_KEY = "faimess_story_backgrounds_v1";

export function loadAllStoryBackgrounds(): StoryBackground[] {
  if (typeof window === "undefined") return DEFAULT_STORY_BACKGROUNDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORY_BACKGROUNDS;
    const parsed: StoryBackground[] = JSON.parse(raw);
    // Combine with default ensuring unique IDs
    const customOnly = parsed.filter(
      (p) => !DEFAULT_STORY_BACKGROUNDS.some((d) => d.id === p.id),
    );
    return [...DEFAULT_STORY_BACKGROUNDS, ...customOnly];
  } catch {
    return DEFAULT_STORY_BACKGROUNDS;
  }
}

export function saveStoryBackground(bg: StoryBackground): StoryBackground[] {
  const current = loadAllStoryBackgrounds();
  const index = current.findIndex((b) => b.id === bg.id);
  let updated: StoryBackground[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = bg;
  } else {
    updated = [bg, ...current];
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export function deleteStoryBackground(id: string): StoryBackground[] {
  const current = loadAllStoryBackgrounds();
  const updated = current.filter((b) => b.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}
