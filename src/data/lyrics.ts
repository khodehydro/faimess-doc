/* ------------------------------------------------------------------ *
 *  Lyrics — bilingual, line by line: the original line plus its
 *  Persian translation, with the second each line lands on.
 *
 *  Every artist in the roster is fictional, so these are original demo
 *  lyrics written for FAIMESS, not a transcription of any real song.
 *  Persian lines are rendered RTL with `--font-fa` (Vazirmatn).
 * ------------------------------------------------------------------ */

export type LyricLine = {
  /** second the line starts on */
  at: number;
  /** original line (Korean with English hooks) */
  ko: string;
  /** Persian translation */
  fa: string;
};

export const LYRICS: Record<string, LyricLine[]> = {
  /* NOVAE — Afterglow ------------------------------------------------ */
  nt1: [
    { at: 0, ko: "해가 진 뒤에도 남아 있는 빛", fa: "نوری که بعد از غروب هم می‌مونه" },
    { at: 12, ko: "We don’t need the sun tonight", fa: "امشب به خورشید نیازی نداریم" },
    { at: 24, ko: "손끝에서 번지는 노을", fa: "غروبی که از نوک انگشت‌ها پخش می‌شه" },
    { at: 38, ko: "Hold it, hold it, don’t let go", fa: "نگهش دار، نگهش دار، رهاش نکن" },
    { at: 54, ko: "우리는 천천히 빛나", fa: "ما آرام‌آرام می‌درخشیم" },
    { at: 72, ko: "Afterglow, afterglow — 아직 뜨거워", fa: "اَفتِرگلو، اَفتِرگلو — هنوز داغه" },
    { at: 96, ko: "Stay until the morning comes", fa: "بمون تا صبح از راه برسه" },
    { at: 128, ko: "이 밤이 다 지나가도", fa: "حتی وقتی این شب کاملاً تموم بشه" },
    { at: 158, ko: "너의 빛은 남아 있어", fa: "نورِ تو باقی می‌مونه" },
  ],

  /* AXION — Midnight Seoul ------------------------------------------ */
  nt2: [
    { at: 0, ko: "자정의 도시, 불빛이 쏟아져", fa: "شهرِ نیمه‌شب، چراغ‌ها سرازیر می‌شن" },
    { at: 14, ko: "Midnight Seoul, we run the night", fa: "سئولِ نیمه‌شب، شب رو ما می‌چرخونیم" },
    { at: 30, ko: "빗속의 네온, 발밑에 흐르는 별", fa: "نئون توی بارون، ستاره‌هایی که زیر پامون روانه" },
    { at: 48, ko: "No sleep, no brake, only us", fa: "نه خواب، نه ترمز، فقط ما" },
    { at: 70, ko: "새벽 세 시, 아직 깨어 있어", fa: "ساعت سهٔ بامداد، هنوز بیداریم" },
    { at: 100, ko: "Turn the city up, we’re alive", fa: "شهر رو بلند کن، ما زنده‌ایم" },
    { at: 140, ko: "이 밤을 멈추지 마", fa: "این شب رو متوقف نکن" },
  ],

  /* SEORA — Paper Heart --------------------------------------------- */
  nt3: [
    { at: 0, ko: "종이로 접은 내 마음", fa: "قلبم رو از کاغذ ساختم" },
    { at: 11, ko: "하나, 둘 — 조심히 펼쳐 봐", fa: "یک، دو — آروم بازش کن" },
    { at: 26, ko: "Paper heart, don’t tear it apart", fa: "قلب کاغذی، پاره‌اش نکن" },
    { at: 42, ko: "네 손끝에 구겨져도", fa: "حتی وقتی زیر انگشت‌هات چین می‌خوره" },
    { at: 62, ko: "I’ll fold it back for you", fa: "برای تو از نو تاش می‌کنم" },
    { at: 92, ko: "바람이 불어도, 나는 여기 있어", fa: "حتی وقتی باد بلند می‌شه، من همین‌جام" },
    { at: 132, ko: "조용히 너를 안아 줄게", fa: "آروم بغلت می‌کنم" },
  ],

  /* LUNEX — Neon Bloom ---------------------------------------------- */
  nt4: [
    { at: 0, ko: "어둠 속에서 피어난", fa: "توی تاریکی شکوفه داد" },
    { at: 13, ko: "Neon bloom, neon bloom", fa: "نئون‌بلوم، نئون‌بلوم" },
    { at: 28, ko: "핑크빛 연기, 숨을 쉬어", fa: "دودِ صورتی، نفس می‌کشم" },
    { at: 45, ko: "Every color on my skin", fa: "هر رنگی روی پوستِ من" },
    { at: 66, ko: "꺼지지 마, 아직 피어나", fa: "خاموش نشو، هنوز شکوفه می‌دی" },
    { at: 100, ko: "Bloom until the morning light", fa: "شکوفه بده تا نورِ صبح" },
    { at: 140, ko: "이 밤은 우리의 무대", fa: "این شب صحنهٔ ماست" },
  ],

  /* PRISM9 — Halo Drive -------------------------------------------- */
  nt5: [
    { at: 0, ko: "시동을 걸어, 밤을 달려", fa: "ماشین رو روشن کن، توی شب برون" },
    { at: 15, ko: "Halo drive, halo drive", fa: "هالو درایو، هالو درایو" },
    { at: 32, ko: "헤드라이트에 별이 부서져", fa: "ستاره‌ها روی چراغِ جلو می‌شکنن" },
    { at: 52, ko: "Let the bassline take the wheel", fa: "بذار خطِ باس فرمان رو بگیره" },
    { at: 78, ko: "속도를 올려, 심장이 뛰어", fa: "سرعت رو بالا ببر، قلبم می‌تپه" },
    { at: 112, ko: "We don’t stop till the sunrise", fa: "تا طلوع آفتاب وای نمی‌ستیم" },
    { at: 156, ko: "창밖의 도시가 흐른다", fa: "شهر از پشت پنجره جاری می‌شه" },
  ],

  /* HANEUL — Silver Hour ------------------------------------------- */
  nt6: [
    { at: 0, ko: "은빛으로 물든 창가", fa: "پنجره‌ای که نقره‌ای شده" },
    { at: 16, ko: "조용히 너를 기다려", fa: "آروم منتظرت می‌مونم" },
    { at: 34, ko: "Silver hour, stay a little longer", fa: "ساعتِ نقره‌ای، یه‌کم بیشتر بمون" },
    { at: 58, ko: "말하지 않아도 알아", fa: "بدون حرف هم می‌دونم" },
    { at: 88, ko: "시간이 멈춘 것 같아", fa: "انگار زمان ایستاده" },
    { at: 126, ko: "그 빛이 사라지기 전에", fa: "قبل از اینکه اون نور محو بشه" },
    { at: 176, ko: "내 손을 잡아 줘", fa: "دستم رو بگیر" },
  ],

  /* PRISM9 — Cherry Static ----------------------------------------- */
  tr3: [
    { at: 0, ko: "체리빛 정전기, 손끝이 찌릿", fa: "الکتریسیتهٔ گیلاسی، سرِ انگشت‌ها گزگز می‌کنه" },
    { at: 14, ko: "Cherry static on my lips", fa: "استاتیکِ گیلاسی روی لب‌هام" },
    { at: 30, ko: "깨진 라디오처럼 지직지직", fa: "مثل رادیوی خراب خش‌خش می‌کنه" },
    { at: 50, ko: "Turn the noise into a song", fa: "این نویز رو تبدیل کن به آهنگ" },
    { at: 74, ko: "심장 소리가 비트가 돼", fa: "صدای قلبم شده بیت" },
    { at: 108, ko: "멈추지 마, 계속 돌려", fa: "نگه ندار، همین‌طور بچرخونش" },
  ],

  /* VELVET MOON — Gravity ------------------------------------------ */
  tr5: [
    { at: 0, ko: "달빛이 우리를 당겨", fa: "مهتاب ما رو به سمت خودش می‌کشه" },
    { at: 15, ko: "Gravity, gravity, you and me", fa: "گرانش، گرانش، تو و من" },
    { at: 34, ko: "도시의 불빛 아래서", fa: "زیر چراغ‌های شهر" },
    { at: 56, ko: "떠 있는 마음, 둥둥", fa: "قلبِ شناور، آروم می‌چرخه" },
    { at: 86, ko: "Fall into the night with me", fa: "با من توی شب بیفت" },
    { at: 122, ko: "아침이 오면 놓아 줄게", fa: "وقتی صبح بیاد، رهات می‌کنم" },
  ],

  /* KAIROS — Blue Signal ------------------------------------------- */
  tr6: [
    { at: 0, ko: "파란 신호가 깜빡여", fa: "سیگنالِ آبی چشمک می‌زنه" },
    { at: 12, ko: "Blue signal, can you hear me now?", fa: "سیگنالِ آبی، الان صدای منو می‌شنوی؟" },
    { at: 28, ko: "주파수 사이로 너를 찾아", fa: "بین فرکانس‌ها دنبالت می‌گردم" },
    { at: 46, ko: "Don’t lose the line tonight", fa: "امشب این خط رو گم نکن" },
    { at: 70, ko: "대답해, 아주 작게라도", fa: "جواب بده، حتی خیلی آروم" },
    { at: 104, ko: "이 신호는 너에게 가는 중", fa: "این سیگنال داره به سمت تو می‌ره" },
  ],
};

/* ------------------------------------------------------------------ *
 *  Community lyric submissions
 *
 *  Lyrics the editorial desk has approved come from fans: they send the
 *  text, a moderator checks it against the official sheet, and approval
 *  pays out points to the fan account. Nothing here is auto-published.
 * ------------------------------------------------------------------ */

/** points a fan earns once a submission is approved */
export const LYRIC_REWARD = 120;

/** how the sheet asks for the original text */
export const LYRIC_LANGUAGES = ["한국어", "English", "Mixed"] as const;

export type LyricSubmissionStatus = "pending" | "approved" | "rejected";

export type LyricSubmission = {
  id: string;
  trackId: string;
  trackTitle: string;
  language: string;
  /** how many lines the fan sent */
  lines: number;
  points: number;
  status: LyricSubmissionStatus;
  sentAt: string;
  /** the raw text, kept so approved submissions can go live */
  original: string;
  translation: string;
};

/** moderation turned this one down — shown as an example of the finished loop */
export const COMMUNITY_LYRICS: Record<string, { lines: LyricLine[]; by: string }> = {
  sm1: {
    by: "you",
    lines: [
      { at: 0, ko: "느린 영화처럼 천천히", fa: "مثل یه فیلمِ کُند، آرومآروم" },
      { at: 14, ko: "Slow motion, we don’t have to run", fa: "اسلوموشن، لازم نیست بدویم" },
      { at: 30, ko: "네 손끝이 내일을 그려", fa: "نوک انگشتات فردا رو میکشه" },
      { at: 52, ko: "Hold the frame a little longer", fa: "این قاب رو یهکم بیشتر نگه دار" },
      { at: 78, ko: "우리는 천천히 번져가", fa: "ما آرومآروم پخش میشیم" },
      { at: 112, ko: "Slow motion, still moving", fa: "اسلوموشن، هنوز در حرکتی" },
    ],
  },
};

/** "[01:12] line" or plain "line" — timestamps are optional */
const STAMP = /^\s*[[(]?(\d{1,2}):(\d{2})[\])]?\s*/;

const splitLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

/**
 * Turn a fan's text into timed lyric lines. Lines with a `[mm:ss]` stamp keep
 * it; the rest are spread evenly across the track so the highlight still walks.
 */
export function parseSubmission(original: string, translation: string, duration: number): LyricLine[] {
  const source = splitLines(original);
  const pairs = splitLines(translation);
  const step = source.length > 0 ? Math.max(2, duration / source.length) : 8;
  let stamped = false;

  const lines = source.map((raw, i) => {
    const match = raw.match(STAMP);
    let at = Math.round(i * step);
    let ko = raw;
    if (match) {
      stamped = true;
      at = Number(match[1]) * 60 + Number(match[2]);
      ko = raw.replace(STAMP, "").trim();
    }
    return { at, ko, fa: pairs[i] ?? "" };
  });

  /* mixed input: keep whatever order the stamps imply */
  return stamped ? [...lines].sort((a, b) => a.at - b.at) : lines;
}

/** what stops the form from sending — null when the text is good enough */
export function submissionProblem(original: string): string | null {
  const lines = splitLines(original);
  if (lines.length === 0) return "Paste the lyrics first.";
  if (lines.length < 2) return "At least two lines, please.";
  if (original.trim().length < 24) return "That looks too short to be a full sheet.";
  return null;
}
