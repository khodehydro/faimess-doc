/* ------------------------------------------------------------------ *
 *  i18n — one flat table, three languages.
 *
 *  `en` is the source of truth: every key must have one, and the others
 *  fall back to it when a string hasn't been translated yet. Placeholders
 *  are `{name}` and filled by `t(key, { name })` in the provider.
 *
 *  Rule of thumb for what lives here: the chrome. Track titles, artist
 *  names, comment text and lyric lines are demo content and stay as they
 *  are in the data files — the same way a real product leaves UGC alone.
 * ------------------------------------------------------------------ */

export type Lang = "en" | "fa" | "ko";

export type LangMeta = {
  id: Lang;
  /** as the switcher spells it */
  label: string;
  /** what the language calls itself */
  native: string;
  dir: "ltr" | "rtl";
  /** number formatting for this language */
  locale: string;
  /** shown next to the language in the switcher */
  sample: string;
};

export const LANGS: LangMeta[] = [
  { id: "en", label: "English", native: "English", dir: "ltr", sample: "Aa", locale: "en-US" },
  { id: "fa", label: "Persian", native: "فارسی", dir: "rtl", sample: "آا", locale: "fa-IR" },
  { id: "ko", label: "Korean", native: "한국어", dir: "ltr", sample: "가나", locale: "ko-KR" },
];

export type Theme = "light" | "dark";

/** the two modes, in the order the switcher shows them */
export const THEMES: { id: Theme; icon: "sun" | "moon"; key: string }[] = [
  { id: "light", icon: "sun", key: "pref.light" },
  { id: "dark", icon: "moon", key: "pref.dark" },
];

type Entry = { en: string; fa: string; ko: string };

export const STRINGS: Record<string, Entry> = {
  /* ---------------------------- navigation ---------------------------- */
  "nav.home": { en: "Home", fa: "خانه", ko: "홈" },
  "nav.artists": { en: "Artists", fa: "هنرمندان", ko: "아티스트" },
  "nav.albums": { en: "Albums", fa: "آلبوم‌ها", ko: "앨범" },
  "nav.playlists": { en: "Playlists", fa: "پلی‌لیست‌ها", ko: "플레이리스트" },
  "nav.news": { en: "News", fa: "اخبار", ko: "뉴스" },
  "nav.download": { en: "Download", fa: "دانلود", ko: "다운로드" },
  "brand.home": { en: "FAIMESS home", fa: "خانهٔ فیمس", ko: "FAIMESS 홈" },

  /* ------------------------------ account ----------------------------- */
  "account.search": {
    en: "Search artists, albums...",
    fa: "جستجوی هنرمند، آلبوم…",
    ko: "아티스트, 앨범 검색...",
  },
  "account.clear": { en: "Clear search", fa: "پاک کردن جستجو", ko: "검색 지우기" },
  "account.notifications": { en: "Notifications", fa: "اعلان‌ها", ko: "알림" },
  "account.account": { en: "Account", fa: "حساب کاربری", ko: "계정" },
  "account.quickJump": { en: "Quick jump", fa: "پرش سریع", ko: "빠른 이동" },
  "account.results": { en: "Results", fa: "نتایج", ko: "검색 결과" },
  "account.noMatch": {
    en: "Nothing matches “{q}”.",
    fa: "چیزی با «{q}» پیدا نشد.",
    ko: "“{q}”와 일치하는 항목이 없어요.",
  },
  "account.kind.page": { en: "Page", fa: "صفحه", ko: "페이지" },
  "account.kind.artist": { en: "Artist", fa: "هنرمند", ko: "아티스트" },
  "account.kind.album": { en: "Album", fa: "آلبوم", ko: "앨범" },
  "account.kindPlaylist": { en: "Playlist", fa: "پلی‌لیست", ko: "플레이리스트" },
  "account.yourLibrary": { en: "Your library", fa: "کتابخانهٔ تو", ko: "내 라이브러리" },
  "account.likedTracks": { en: "Liked tracks", fa: "آهنگ‌های لایک‌شده", ko: "좋아요한 곡" },
  "account.contributions": { en: "Your contributions", fa: "مشارکت‌های تو", ko: "내 기여" },
  "account.signOut": { en: "Sign out", fa: "خروج از حساب", ko: "로그아웃" },
  "account.points": { en: "{n} fan points", fa: "{n} امتیاز هواداری", ko: "팬 포인트 {n}" },

  /* --------------------------- preferences ---------------------------- */
  "pref.title": { en: "Preferences", fa: "تنظیمات", ko: "환경설정" },
  "pref.language": { en: "Language", fa: "زبان", ko: "언어" },
  "pref.appearance": { en: "Appearance", fa: "ظاهر", ko: "화면 모드" },
  "pref.light": { en: "Light", fa: "روشن", ko: "라이트" },
  "pref.dark": { en: "Dark", fa: "تیره", ko: "다크" },
  "pref.note": {
    en: "Kept in this browser — the demo has no backend.",
    fa: "فقط در همین مرورگر ذخیره می‌شود — دمو بک‌اند ندارد.",
    ko: "이 브라우저에만 저장돼요 — 데모에는 백엔드가 없어요.",
  },
  "pref.persianNote": {
    en: "Persian flips the interface to right-to-left.",
    fa: "فارسی چیدمان را راست‌به‌چپ می‌کند.",
    ko: "페르시아어는 인터페이스를 오른쪽에서 왼쪽으로 바꿔요.",
  },

  /* ------------------------------- feed ------------------------------- */
  "feed.scrollMore": { en: "scroll for more", fa: "برای بیشتر اسکرول کن", ko: "더 보려면 스크롤" },
  "feed.followed": { en: "Followed", fa: "دنبال‌شده‌ها", ko: "팔로잉" },
  "feed.newSongs": { en: "New songs", fa: "آهنگ‌های تازه", ko: "신곡" },
  "feed.trending": { en: "Trending", fa: "پرطرفدار", ko: "인기" },
  "feed.news": { en: "News", fa: "اخبار", ko: "뉴스" },
  "feed.albums": { en: "Albums", fa: "آلبوم‌ها", ko: "앨범" },
  "feed.fans": { en: "Fans", fa: "هواداران", ko: "팬" },

  /* ------------------------------ shelves ----------------------------- */
  "shelf.followedArtists": { en: "Artists you follow", fa: "هنرمندانی که دنبال می‌کنی", ko: "팔로우한 아티스트" },
  "shelf.newestSongs": { en: "Newest songs", fa: "جدیدترین آهنگ‌ها", ko: "최신 곡" },
  "shelf.trendingNow": { en: "Trending now", fa: "الان پرطرفدار", ko: "지금 인기" },
  "shelf.latestNews": { en: "Latest news", fa: "آخرین اخبار", ko: "최신 뉴스" },
  "shelf.freshAlbums": { en: "Fresh albums", fa: "آلبوم‌های تازه", ko: "새 앨범" },
  "shelf.activeListeners": { en: "Active listeners", fa: "شنونده‌های فعال", ko: "활동 중인 리스너" },
  "shelf.playAll": { en: "Play all", fa: "پخش همه", ko: "전체 재생" },
  "shelf.play": { en: "Play", fa: "پخش", ko: "재생" },
  "shelf.seeAll": { en: "See all", fa: "دیدن همه", ko: "전체 보기" },
  "shelf.findArtists": { en: "Find artists", fa: "پیدا کردن هنرمند", ko: "아티스트 찾기" },
  "shelf.goToNews": { en: "Go to news", fa: "رفتن به اخبار", ko: "뉴스로 가기" },
  "shelf.allAlbums": { en: "All albums", fa: "همهٔ آلبوم‌ها", ko: "모든 앨범" },
  "shelf.leaderboard": { en: "Leaderboard", fa: "جدول امتیازها", ko: "리더보드" },
  "shelf.onlineNow": { en: "Online now", fa: "آنلاین", ko: "지금 접속 중" },
  "shelf.verifiedArtist": { en: "Verified artist", fa: "هنرمند تأییدشده", ko: "인증된 아티스트" },
  "shelf.new": { en: "New", fa: "جدید", ko: "NEW" },
  "shelf.wasLive": { en: "was live", fa: "لایو بود", ko: "라이브 했어요" },
  "shelf.hintHourly": { en: "updated hourly", fa: "هر ساعت به‌روز", ko: "매시간 업데이트" },
  "shelf.hintFires": { en: "ranked by fan fires", fa: "به ترتیب فایر هواداران", ko: "팬 불 순" },
  "shelf.hintDesk": { en: "K-pop desk", fa: "میز K-pop", ko: "K-pop 데스크" },
  "shelf.hintWeek": { en: "this week", fa: "این هفته", ko: "이번 주" },
  "shelf.hintLive": { en: "updated live", fa: "زنده به‌روز می‌شود", ko: "실시간 업데이트" },
  "shelf.going": { en: "going", fa: "شرکت‌کننده", ko: "참석" },
  "shelf.wasLiveSuffix": { en: "was live", fa: "لایو بود", ko: "라이브 했어요" },

  /* ------------------------------- hero ------------------------------- */
  "hero.showAlerts": { en: "Show alerts", fa: "نمایش هشدارها", ko: "알림 보기" },
  "hero.openTickets": { en: "Open tickets", fa: "خرید بلیت", ko: "티켓 열기" },
  "hero.prev": { en: "Previous banner", fa: "بنر قبلی", ko: "이전 배너" },
  "hero.next": { en: "Next banner", fa: "بنر بعدی", ko: "다음 배너" },

  /* ------------------------------ player ------------------------------ */
  "player.title": { en: "Player", fa: "پخش‌کننده", ko: "플레이어" },
  "player.upNext": { en: "Up next", fa: "بعدی در صف", ko: "다음 곡" },
  "player.likedSongs": { en: "Liked songs", fa: "آهنگ‌های لایک‌شده", ko: "좋아요한 곡" },
  "player.yourPlaylists": { en: "Your playlists", fa: "پلی‌لیست‌های تو", ko: "내 플레이리스트" },
  "player.musicManagement": { en: "Music management", fa: "مدیریت موسیقی", ko: "음악 관리" },
  "player.closePanel": { en: "Close panel", fa: "بستن پنل", ko: "패널 닫기" },
  "player.playQueue": { en: "Play queue", fa: "صف پخش", ko: "재생 대기열" },
  "player.seek": { en: "Seek", fa: "جابه‌جایی", ko: "탐색" },
  "player.prevTrack": { en: "Previous track", fa: "آهنگ قبلی", ko: "이전 곡" },
  "player.nextTrack": { en: "Next track", fa: "آهنگ بعدی", ko: "다음 곡" },
  "player.play": { en: "Play", fa: "پخش", ko: "재생" },
  "player.pause": { en: "Pause", fa: "توقف", ko: "일시정지" },
  "player.expand": { en: "Expand the player", fa: "بزرگ کردن پلیر", ko: "플레이어 확대" },
  "player.collapse": { en: "Collapse the player", fa: "جمع کردن پلیر", ko: "플레이어 축소" },
  "player.railShow": { en: "More — queue, liked songs, playlists", fa: "بیشتر — صف، لایک‌ها، پلی‌لیست‌ها", ko: "더보기 — 대기열, 좋아요, 플레이리스트" },
  "player.railHide": { en: "Hide the music sidebar", fa: "بستن نوار موسیقی", ko: "음악 사이드바 숨기기" },
  "player.downloadTip": { en: "Download — Android app only", fa: "دانلود — فقط اپ اندروید", ko: "다운로드 — 안드로이드 앱 전용" },
  "player.downloadTitle": { en: "Downloads live in the Android app", fa: "دانلود در اپ اندروید است", ko: "다운로드는 안드로이드 앱에 있어요" },
  "player.downloadBody": {
    en: "Songs stream free in the browser — saving a track for offline listening, and the full-quality files, are Android-only.",
    fa: "آهنگ‌ها در مرورگر رایگان پخش می‌شوند — ذخیرهٔ آهنگ برای پخش آفلاین و فایل‌های باکیفیت فقط در اندروید است.",
    ko: "브라우저에서는 무료로 스트리밍돼요 — 오프라인 저장과 고음질 파일은 안드로이드 전용이에요.",
  },
  "player.androidPage": { en: "Android download page", fa: "صفحهٔ دانلود اندروید", ko: "안드로이드 다운로드 페이지" },
  "player.notNow": { en: "Not now", fa: "الان نه", ko: "나중에" },
  "player.likeOn": { en: "Remove from Liked songs", fa: "حذف از لایک‌ها", ko: "좋아요 취소" },
  "player.likeOff": { en: "Save to Liked songs", fa: "ذخیره در لایک‌ها", ko: "좋아요에 저장" },
  "player.likedToast": { en: "Saved to Liked songs", fa: "به لایک‌ها اضافه شد", ko: "좋아요에 저장했어요" },
  "player.unlikedToast": { en: "Removed from Liked songs", fa: "از لایک‌ها حذف شد", ko: "좋아요에서 뺐어요" },
  "player.likedEmpty": {
    en: "Nothing here yet — tap the heart while a song plays.",
    fa: "هنوز چیزی نیست — وقتی آهنگی پخش می‌شود قلب را بزن.",
    ko: "아직 아무것도 없어요 — 곡이 재생될 때 하트를 눌러보세요.",
  },
  "player.ownsPlaylists": {
    en: "Six editorial lists, curated by FAIMESS.",
    fa: "شش لیست تحریریه، ساختهٔ فیمس.",
    ko: "FAIMESS가 고른 에디토리얼 리스트 6개.",
  },
  "player.sessionOnly": {
    en: "Favourites live in this session only — the demo has no backend yet.",
    fa: "لایک‌ها فقط تا پایان همین نشست می‌مانند — دمو بک‌اند ندارد.",
    ko: "좋아요는 이번 세션에만 유지돼요 — 데모에는 백엔드가 없어요.",
  },
  "player.startWith": { en: "Start with", fa: "شروع کن با", ko: "이 곡으로 시작" },
  "player.nothingPlaying": { en: "nothing playing yet", fa: "هنوز چیزی پخش نمی‌شود", ko: "아직 재생 중인 곡이 없어요" },
  "player.hey": { en: "Hey {name},", fa: "سلام {name}،", ko: "{name}님," },
  "player.pickOne": {
    en: "Pick a song and the player fills up — cover, seek bar and the bilingual lyrics.",
    fa: "یک آهنگ انتخاب کن تا پلیر پر شود — کاور، نوار پخش و لیریک دوزبانه.",
    ko: "곡을 고르면 커버, 탐색 바, 이중 언어 가사가 채워져요.",
  },
  "player.opening": { en: "Opening “{name}”", fa: "باز شدن «{name}»", ko: "“{name}” 여는 중" },
  "player.playing": { en: "Playing {artist} — “{title}”", fa: "پخش {artist} — «{title}»", ko: "{artist} — “{title}” 재생 중" },

  /* ------------------------------ lyrics ------------------------------ */
  "lyrics.title": { en: "Lyrics", fa: "متن آهنگ", ko: "가사" },
  "lyrics.emptyTitle": { en: "No lyrics for this one yet", fa: "این آهنگ هنوز لیریک ندارد", ko: "이 곡은 아직 가사가 없어요" },
  "lyrics.emptyBody": {
    en: "Know the words by heart? Send the sheet — a moderator checks it against the official text before it goes live.",
    fa: "متن را از حافظه بلدی؟ شیت را بفرست — مدیر آن را با متن رسمی چک می‌کند و بعد منتشر می‌شود.",
    ko: "가사를 외우고 있나요? 시트를 보내주세요 — 관리자가 공식 가사와 확인한 뒤 공개돼요.",
  },
  "lyrics.emptyBodyPending": {
    en: "Your sheet is with the moderators. Once it’s approved the words show up right here — and the points land in your fan account.",
    fa: "شیت تو دست مدیران است. بعد از تأیید، متن همین‌جا می‌آید و امتیاز به حساب هواداری‌ات اضافه می‌شود.",
    ko: "보낸 시트는 관리자가 확인 중이에요. 승인되면 가사가 여기에 표시되고 팬 포인트도 들어와요.",
  },
  "lyrics.pending": { en: "Pending review", fa: "در انتظار تأیید", ko: "검토 중" },
  "lyrics.send": { en: "Send the lyrics", fa: "ارسال لیریک", ko: "가사 보내기" },
  "lyrics.pay": { en: "Approved sheets pay +{n} fan points", fa: "شیت تأییدشده {n}+ امتیاز دارد", ko: "승인되면 팬 포인트 +{n}" },
  "lyrics.wait": { en: "A moderator usually replies within a day", fa: "مدیر معمولاً تا یک روز جواب می‌دهد", ko: "관리자는 보통 하루 안에 답해요" },
  "lyrics.credit": {
    en: "Fan sheet by {who} · approved by the mods · +{n} pts",
    fa: "شیت هوادار از {who} · تأییدشده توسط مدیران · {n}+ امتیاز",
    ko: "{who}님이 보낸 팬 가사 · 관리자 승인 · 포인트 +{n}",
  },
  "lyrics.creditYou": { en: "you", fa: "تو", ko: "나" },

  /* --------------------------- lyric submit --------------------------- */
  "submit.title": { en: "Send the lyrics", fa: "ارسال لیریک", ko: "가사 보내기" },
  "submit.intro": {
    en: "Moderators check every sheet against the official text before it goes live. Approved sheets earn +{n} fan points and carry your name.",
    fa: "مدیران هر شیت را با متن رسمی چک می‌کنند. شیت تأییدشده {n}+ امتیاز دارد و با نام تو منتشر می‌شود.",
    ko: "모든 시트는 공식 가사와 대조해 확인해요. 승인되면 팬 포인트 +{n}와 함께 이름이 올라가요.",
  },
  "submit.already": {
    en: "You already sent a sheet for this track — it’s pending review.",
    fa: "قبلاً برای این آهنگ شیت فرستادی — در انتظار تأیید است.",
    ko: "이 곡의 시트는 이미 보냈어요 — 검토 중이에요.",
  },
  "submit.original": { en: "Original", fa: "زبان اصلی", ko: "원문 언어" },
  "submit.lyrics": { en: "Lyrics", fa: "متن لیریک", ko: "가사" },
  "submit.lyricsHint": {
    en: "one line per line — add [01:12] if you know where a line lands",
    fa: "هر خط یک خط — اگر می‌دانی خط کجا می‌افتد [01:12] بنویس",
    ko: "한 줄씩 — 위치를 알면 [01:12]를 붙여주세요",
  },
  "submit.translation": { en: "Persian translation", fa: "ترجمهٔ فارسی", ko: "페르시아어 번역" },
  "submit.translationHint": { en: "optional, line by line", fa: "اختیاری، خط‌به‌خط", ko: "선택 사항, 한 줄씩" },
  "submit.send": { en: "Send to moderators", fa: "ارسال به مدیران", ko: "관리자에게 보내기" },
  "submit.cancel": { en: "Cancel", fa: "انصراف", ko: "취소" },
  "submit.doneTitle": { en: "Sent to the moderators", fa: "برای مدیران فرستاده شد", ko: "관리자에게 보냈어요" },
  "submit.doneBody": {
    en: "A moderator checks the text against the official sheet for “{title}”. Once it’s approved your name goes under the lyrics and +{n} points land in your fan account — you’re on {points} today.",
    fa: "مدیر متن را با شیت رسمی «{title}» چک می‌کند. بعد از تأیید نامت زیر لیریک می‌آید و {n}+ امتیاز به حساب هواداری‌ات اضافه می‌شود — الان {points} امتیاز داری.",
    ko: "관리자가 “{title}”의 공식 가사와 대조해요. 승인되면 가사 아래에 이름이 오르고 팬 포인트 +{n}가 들어와요 — 지금 {points} 포인트예요.",
  },
  "submit.pending": { en: "Pending review", fa: "در انتظار تأیید", ko: "검토 중" },
  "submit.back": { en: "Back to the player", fa: "بازگشت به پلیر", ko: "플레이어로 돌아가기" },
  "submit.resend": { en: "Send an updated version", fa: "ارسال نسخهٔ به‌روزشده", ko: "수정본 보내기" },
  "submit.lines": { en: "{n} lines", fa: "{n} خط", ko: "{n}줄" },
  "submit.sentToast": {
    en: "Lyrics sent for review — +{n} pts once approved",
    fa: "لیریک برای بررسی فرستاده شد — بعد از تأیید {n}+ امتیاز",
    ko: "가사를 검토 요청했어요 — 승인되면 포인트 +{n}",
  },
  "submit.problemShort": { en: "That looks too short to be a full sheet.", fa: "برای یک شیت کامل خیلی کوتاه است.", ko: "전체 가사로 보기엔 너무 짧아요." },
  "submit.problemOne": { en: "At least two lines, please.", fa: "حداقل دو خط لازم است.", ko: "최소 두 줄이 필요해요." },
  "submit.problemEmpty": { en: "Paste the lyrics first.", fa: "اول متن لیریک را بچسبان.", ko: "먼저 가사를 붙여넣어 주세요." },

  /* --------------------------- contributions -------------------------- */
  "contrib.title": { en: "Your contributions", fa: "مشارکت‌های تو", ko: "내 기여" },
  "contrib.waiting": { en: "{n} sheets waiting on a moderator", fa: "{n} شیت در انتظار مدیر", ko: "관리자 확인 대기 중인 시트 {n}개" },
  "contrib.allReviewed": { en: "All sheets reviewed", fa: "همهٔ شیت‌ها بررسی شدند", ko: "모든 시트를 확인했어요" },
  "contrib.points": { en: "Fan points", fa: "امتیاز هواداری", ko: "팬 포인트" },
  "contrib.reward": { en: "+{n} per approved sheet", fa: "هر شیت تأییدشده {n}+", ko: "승인 1건당 +{n}" },
  "contrib.empty": {
    en: "Nothing sent yet. Open a track that has no lyrics, hit Send the lyrics, and it shows up here.",
    fa: "هنوز چیزی نفرستادی. یک آهنگ بدون لیریک باز کن، «ارسال لیریک» را بزن و اینجا ظاهر می‌شود.",
    ko: "아직 보낸 게 없어요. 가사가 없는 곡에서 가사 보내기를 누르면 여기에 나타나요.",
  },
  "contrib.pending": { en: "Pending review", fa: "در انتظار تأیید", ko: "검토 중" },
  "contrib.approved": { en: "Approved", fa: "تأییدشده", ko: "승인됨" },
  "contrib.returned": { en: "Sent back", fa: "برگشت‌خورده", ko: "반려됨" },
  "contrib.lines": { en: "{n} lines", fa: "{n} خط", ko: "{n}줄" },
  "contrib.moderatorView": { en: "Moderator view", fa: "نمای مدیر", ko: "관리자 보기" },
  "contrib.approve": { en: "Approve", fa: "تأیید", ko: "승인" },
  "contrib.sendBack": { en: "Send back", fa: "برگرداندن", ko: "반려" },
  "contrib.done": { en: "Done", fa: "تمام", ko: "완료" },
  "contrib.footnote": {
    en: "Approving a sheet puts the fan’s words under the track and pays the points out. This build has no admin console, so the approve button above stands in for the editorial desk.",
    fa: "تأیید یک شیت، متن هوادار را زیر آهنگ می‌گذارد و امتیاز را پرداخت می‌کند. این بیلد کنسول مدیر ندارد، پس دکمهٔ تأیید نقش میز تحریریه را بازی می‌کند.",
    ko: "시트를 승인하면 팬의 가사가 곡 아래에 붙고 포인트가 지급돼요. 이 빌드에는 관리자 콘솔이 없어서 위의 승인 버튼이 편집 데스크 역할을 해요.",
  },
  "contrib.approvedToast": { en: "Sheet approved — +{n} points", fa: "شیت تأیید شد — {n}+ امتیاز", ko: "시트 승인 — 포인트 +{n}" },
  "contrib.returnedToast": { en: "Sheet sent back for a fix", fa: "شیت برای اصلاح برگشت", ko: "시트를 반려했어요" },

  /* ------------------------------ comments ---------------------------- */
  "comments.title": { en: "Comments", fa: "کامنت‌ها", ko: "댓글" },
  "comments.openThread": { en: "Open the comment thread", fa: "باز کردن گفت‌وگوی کامنت‌ها", ko: "댓글 스레드 열기" },
  "comments.seeAll": { en: "See all", fa: "دیدن همه", ko: "전체 보기" },
  "comments.view": { en: "View", fa: "دیدن", ko: "보기" },
  "comments.count": { en: "{n} comments on “{title}”", fa: "{n} کامنت روی «{title}»", ko: "“{title}”에 댓글 {n}개" },
  "comments.countOne": { en: "{n} comment on “{title}”", fa: "{n} کامنت روی «{title}»", ko: "“{title}”에 댓글 {n}개" },
  "comments.repliesFrom": {
    en: "{n} replies from the community",
    fa: "{n} پاسخ از سوی هواداران",
    ko: "팬 답글 {n}개",
  },
  "comments.repliesFromOne": { en: "{n} reply from the community", fa: "{n} پاسخ از سوی هواداران", ko: "팬 답글 {n}개" },
  "comments.empty": { en: "No comments yet — be the first one.", fa: "هنوز کامنتی نیست — اولین نفر باش.", ko: "아직 댓글이 없어요 — 첫 댓글을 남겨보세요." },
  "comments.end": {
    en: "That’s every comment in this demo build 🎉",
    fa: "این همهٔ کامنت‌های این بیلد دموست 🎉",
    ko: "이 데모 빌드의 댓글은 여기까지예요 🎉",
  },
  "comments.hidden": { en: "Hidden — you reported this as", fa: "پنهان — تو این را گزارش کردی به‌عنوان", ko: "숨김 — 신고 사유:" },
  "comments.undo": { en: "Undo", fa: "لغو", ko: "되돌리기" },
  "comments.artist": { en: "Artist", fa: "هنرمند", ko: "아티스트" },
  "comments.reply": { en: "Reply", fa: "پاسخ", ko: "답글" },
  "comments.report": { en: "Report", fa: "گزارش", ko: "신고" },
  "comments.submitReport": { en: "Submit report", fa: "ثبت گزارش", ko: "신고 제출" },
  "comments.cancel": { en: "Cancel", fa: "انصراف", ko: "취소" },
  "comments.newest": { en: "Newest", fa: "تازه‌ترین", ko: "최신순" },
  "comments.topFired": { en: "Top fired", fa: "پرفایر", ko: "인기순" },
  "comments.reportTitle": { en: "Report this comment", fa: "گزارش این کامنت", ko: "이 댓글 신고" },
  "comments.back": { en: "Back", fa: "برگشت", ko: "뒤로" },
  "comments.placeholder": { en: "Add a comment…", fa: "کامنت بنویس…", ko: "댓글 추가…" },
  "comments.replyTo": { en: "Reply to @{handle}…", fa: "پاسخ به @{handle}…", ko: "@{handle}에게 답글…" },
  "comments.send": { en: "Send", fa: "ارسال", ko: "보내기" },
  "comments.loadMore": { en: "Load {n} more comments", fa: "نمایش {n} کامنت بیشتر", ko: "댓글 {n}개 더 보기" },
  "comments.copyLink": { en: "Copy link", fa: "کپی لینک", ko: "링크 복사" },
  "comments.reportComment": { en: "Report comment", fa: "گزارش کامنت", ko: "댓글 신고" },
  "comments.delete": { en: "Delete", fa: "حذف", ko: "삭제" },
  "comments.more": { en: "More actions", fa: "کارهای بیشتر", ko: "더보기" },
  "comments.verified": { en: "Verified account", fa: "حساب تأییدشده", ko: "인증된 계정" },
  "comments.close": { en: "Close comments", fa: "بستن کامنت‌ها", ko: "댓글 닫기" },
  "comments.copied": { en: "Link copied", fa: "لینک کپی شد", ko: "링크를 복사했어요" },
  "comments.deletedToast": { en: "Comment deleted", fa: "کامنت حذف شد", ko: "댓글을 삭제했어요" },
  "comments.reportWithdrawn": { en: "Report withdrawn", fa: "گزارش پس گرفته شد", ko: "신고를 취소했어요" },
  "comments.reportedToast": { en: "Reported to the mods", fa: "برای مدیران گزارش شد", ko: "관리자에게 신고했어요" },
  "comments.postedToast": {
    en: "Comment posted — it’s at the top of the thread",
    fa: "کامنت ثبت شد — بالای فهرست است",
    ko: "댓글을 남겼어요 — 목록 맨 위에 있어요",
  },
  "comments.repliedToast": { en: "Replied to {handle}", fa: "پاسخ به {handle}", ko: "{handle}에게 답글" },

  /* ------------------------------- pages ------------------------------ */
  "page.artists.subtitle": { en: "The voices shaping your library right now", fa: "صداهایی که همین حالا کتابخانه‌ات را می‌سازند", ko: "지금 내 라이브러리를 채우는 목소리" },
  "page.albums.subtitle": { en: "Full records, saved and ready to play", fa: "آلبوم‌های کامل، ذخیره‌شده و آمادهٔ پخش", ko: "저장된 정규 앨범, 바로 재생" },
  "page.playlists.subtitle": { en: "Mixes built by you and the Faimess editors", fa: "میکس‌هایی از تو و تحریریهٔ فیمس", ko: "나와 FAIMESS 에디터가 만든 믹스" },
  "page.filter.all": { en: "All", fa: "همه", ko: "전체" },
  "page.filter.following": { en: "Following", fa: "دنبال‌شده", ko: "팔로잉" },
  "page.filter.topPlayed": { en: "Top played", fa: "پرشنیده", ko: "최다 재생" },
  "page.filter.new": { en: "New", fa: "جدید", ko: "신규" },
  "page.filter.recent": { en: "Recent", fa: "اخیر", ko: "최근" },
  "page.filter.saved": { en: "Saved", fa: "ذخیره‌شده", ko: "저장됨" },
  "page.filter.madeByYou": { en: "Made by you", fa: "ساختهٔ تو", ko: "내가 만든" },
  "page.filter.liked": { en: "Liked", fa: "لایک‌شده", ko: "좋아요" },
  "page.filter.moods": { en: "Moods", fa: "حال‌وهوا", ko: "무드" },
  "page.filter.2025": { en: "2025", fa: "۲۰۲۵", ko: "2025" },
  "page.shuffleAll": { en: "Shuffle all", fa: "پخش تصادفی همه", ko: "전체 셔플" },
  "page.saveAlbum": { en: "Save album", fa: "ذخیرهٔ آلبوم", ko: "앨범 저장" },
  "page.openArtist": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },
  "page.openAlbum": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },
  "page.openPlaylist": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },

  "news.title": { en: "News", fa: "اخبار", ko: "뉴스" },
  "news.subtitle": {
    en: "Comebacks, tours, charts and everything the K-pop desk is tracking",
    fa: "کمبک، تور، چارت و هر چیزی که میز K-pop دنبال می‌کند",
    ko: "컴백, 투어, 차트까지 — K-pop 데스크가 쫓는 모든 것",
  },
  "news.backHome": { en: "Back home", fa: "بازگشت به خانه", ko: "홈으로" },
  "news.tag.all": { en: "All", fa: "همه", ko: "전체" },
  "news.tag.comeback": { en: "Comeback", fa: "کمبک", ko: "컴백" },
  "news.tag.tour": { en: "Tour", fa: "تور", ko: "투어" },
  "news.tag.charts": { en: "Charts", fa: "چارت", ko: "차트" },
  "news.tag.awards": { en: "Awards", fa: "جوایز", ko: "어워즈" },
  "news.tag.editorial": { en: "Editorial", fa: "تحریریه", ko: "에디토리얼" },

  "download.title": { en: "Get the FAIMESS app", fa: "اپ فیمس را بگیر", ko: "FAIMESS 앱 받기" },
  "download.subtitle": {
    en: "Downloading tracks is an Android feature — the browser streams.",
    fa: "دانلود آهنگ‌ها فقط در اندروید است — مرورگر پخش می‌کند.",
    ko: "트랙 다운로드는 안드로이드 기능이에요 — 브라우저는 스트리밍해요.",
  },
  "download.appName": { en: "FAIMESS for Android", fa: "فیمس برای اندروید", ko: "안드로이드용 FAIMESS" },
  "download.meta": { en: "Version 2.4 · 28 MB · Android 9 and up", fa: "نسخهٔ ۲.۴ · ۲۸ مگابایت · اندروید ۹ و بالاتر", ko: "버전 2.4 · 28MB · 안드로이드 9 이상" },
  "download.getItOn": { en: "Get it on", fa: "بگیر از", ko: "다운로드" },
  "download.googlePlay": { en: "Google Play", fa: "گوگل پلی", ko: "Google Play" },
  "download.apk": { en: "Download APK", fa: "دانلود APK", ko: "APK 다운로드" },
  "download.back": { en: "Back to the music", fa: "بازگشت به موسیقی", ko: "음악으로 돌아가기" },
  "download.offline": { en: "Offline saves", fa: "ذخیرهٔ آفلاین", ko: "오프라인 저장" },
  "download.background": { en: "Background play", fa: "پخش در پس‌زمینه", ko: "백그라운드 재생" },
  "download.liveLyrics": { en: "Live lyrics", fa: "لیریک همزمان", ko: "실시간 가사" },
  "download.masters": { en: "Hi-res masters", fa: "مسترهای باکیفیت", ko: "하이레조 마스터" },
  "download.offlineBody": {
    en: "Keep a comeback on the phone — the files are yours with no expiry while you subscribe.",
    fa: "کمبک را روی گوشی نگه دار — تا وقتی اشتراک داری فایل‌ها بدون انقضا مال خودت است.",
    ko: "컴백을 폰에 저장하세요 — 구독 중에는 만료 없이 내 파일이에요.",
  },
  "download.mastersBody": {
    en: "24-bit FLAC where the label has released it, lossless everywhere else.",
    fa: "FLAC ۲۴بیتی هرجا لیبل منتشر کرده باشد، و بی‌اتلاف در بقیهٔ موارد.",
    ko: "레이블이 공개한 곳은 24비트 FLAC, 나머지는 무손실이에요.",
  },
  "download.backgroundBody": {
    en: "Lock-screen controls, sleep timer and gapless queue — built for commutes.",
    fa: "کنترل روی صفحهٔ قفل، تایمر خواب و صف بدون وقفه — ساخته‌شده برای مسیر روزانه.",
    ko: "잠금화면 컨트롤, 슬립 타이머, 끊김 없는 대기열 — 출퇴근용이에요.",
  },
  "download.liveLyricsBody": {
    en: "The bilingual lyric sheet from the web player, synced and downloadable per track.",
    fa: "همان لیریک دوزبانهٔ پلیر وب، همزمان و قابل دانلود برای هر ترک.",
    ko: "웹 플레이어의 이중 언어 가사를 곡마다 동기화해 내려받을 수 있어요.",
  },

  /* ------------------------------ toasts ------------------------------ */
  "toast.opened": { en: "Opened {name}", fa: "{name} باز شد", ko: "{name} 열었어요" },
  "toast.opening": { en: "Opening “{name}”", fa: "باز کردن «{name}»", ko: "“{name}” 여는 중" },
  "toast.openingPlaylist": { en: "Opening “{name}”", fa: "باز کردن «{name}»", ko: "“{name}” 여는 중" },
  "toast.openingName": { en: "Opening “{name}”", fa: "باز کردن «{name}»", ko: "“{name}” 여는 중" },
  "toast.playingCard": {
    en: "Playing “{title}” — it’s in the player card",
    fa: "«{title}» در حال پخش — در کارت پلیر است",
    ko: "“{title}” 재생 중 — 플레이어 카드에서 확인하세요",
  },
  "toast.paused": { en: "Paused “{title}”", fa: "«{title}» متوقف شد", ko: "“{title}” 일시정지" },
  "toast.queued": { en: "Added “{title}” to your queue", fa: "«{title}» به صف اضافه شد", ko: "“{title}”을(를) 대기열에 추가했어요" },
  "toast.fired": { en: "You fired “{title}” 🔥", fa: "به «{title}» فایر دادی 🔥", ko: "“{title}”에 불을 눌렀어요 🔥" },
  "toast.unfired": {
    en: "Removed your fire from “{title}”",
    fa: "فایر تو از «{title}» برداشته شد",
    ko: "“{title}”에서 불을 뺐어요",
  },
  "toast.following": { en: "Following {name}", fa: "دنبال کردن {name}", ko: "{name} 팔로우" },
  "toast.unfollowed": { en: "Unfollowed {name}", fa: "لغو دنبال کردن {name}", ko: "{name} 팔로우 취소" },
  "toast.saved": { en: "Saved “{name}”", fa: "«{name}» ذخیره شد", ko: "“{name}” 저장했어요" },
  "toast.playingAlbum": {
    en: "Playing “{album}” — starting with “{title}”",
    fa: "پخش «{album}» — شروع با «{title}»",
    ko: "“{album}” 재생 중 — “{title}”부터",
  },
  "toast.mix": { en: "Playing the new-release mix", fa: "پخش میکس تازه‌ها", ko: "신곡 믹스 재생 중" },
  "toast.allTrending": { en: "Showing every trending track", fa: "نمایش همهٔ ترک‌های پرطرفدار", ko: "인기 트랙 전체 보기" },
  "toast.leaderboard": { en: "Opening the season leaderboard", fa: "باز کردن جدول فصل", ko: "시즌 리더보드 여는 중" },
  "toast.findMore": { en: "Find more artists to follow", fa: "هنرمندهای بیشتری برای دنبال کردن پیدا کن", ko: "팔로우할 아티스트 더 찾기" },
  "toast.caughtUp": { en: "You’re all caught up ✨", fa: "همه را دیدی ✨", ko: "모두 확인했어요 ✨" },
  "toast.tickets": { en: "{title} · tickets", fa: "{title} · بلیت‌ها", ko: "{title} · 티켓" },

  /* ------------------------- reporting reasons ------------------------ */
  "report.label.spam": { en: "Spam or advertising", fa: "اسپم یا تبلیغ", ko: "스팸 또는 광고" },
  "report.hint.spam": { en: "Repeated promos, links or scams", fa: "تبلیغ، لینک یا کلاهبرداری تکراری", ko: "반복 홍보, 링크, 사기" },
  "report.label.harassment": { en: "Harassment or hate", fa: "آزار یا نفرت", ko: "괴롭힘 또는 혐오" },
  "report.hint.harassment": {
    en: "Targeting a fan, an artist or a group",
    fa: "حمله به یک هوادار، هنرمند یا گروه",
    ko: "팬, 아티스트, 그룹을 향한 공격",
  },
  "report.label.spoiler": { en: "Spoiler", fa: "اسپویل", ko: "스포일러" },
  "report.hint.spoiler": { en: "Leaks or unreleased material", fa: "لورفتن یا محتوای منتشرنشده", ko: "유출 또는 미공개 자료" },
  "report.label.misinfo": { en: "Misinformation", fa: "اطلاعات نادرست", ko: "허위 정보" },
  "report.hint.misinfo": { en: "Fake charts, fake tour dates", fa: "چارت یا تاریخ تور جعلی", ko: "가짜 차트, 가짜 투어 일정" },
  "report.label.other": { en: "Something else", fa: "چیز دیگر", ko: "기타" },
  "report.hint.other": { en: "Our moderators will take a look", fa: "مدیران ما بررسی می‌کنند", ko: "관리자가 확인할게요" },

  /* ------------------------------- shared ------------------------------ */
  "ui.close": { en: "Close", fa: "بستن", ko: "닫기" },

  /* ---------------------- greeting (alt section) ---------------------- */
  "greet.line1": { en: "Have a Good day,", fa: "روز خوبی داشته باشی،", ko: "좋은 하루 보내세요," },
  "greet.subtitle": {
    en: "Fuel your days with the boundless enthusiasm of a fellow explorer.",
    fa: "روزهایت را با انرژی بی‌پایان یک همسفرِ کاوشگر پر کن.",
    ko: "동료 탐험가의 끝없는 열정으로 하루를 채워 보세요.",
  },
  "greet.want": { en: "I want to...", fa: "می‌خواهم…", ko: "하고 싶은 것:" },
  "greet.placeholder": { en: "start a late-night mix", fa: "یک میکس شبانه بسازم", ko: "심야 믹스 만들기" },
  "greet.pickDate": { en: "Pick a date", fa: "انتخاب تاریخ", ko: "날짜 선택" },
  "greet.saveIdea": { en: "Save idea", fa: "ذخیرهٔ ایده", ko: "아이디어 저장" },
  "greet.startPlanning": { en: "Start planning", fa: "شروع برنامه‌ریزی", ko: "계획 시작" },
  "greet.now": { en: "Now", fa: "اکنون", ko: "지금" },
  "greet.tomorrow": { en: "Tomorrow", fa: "فردا", ko: "내일" },
  "greet.nextWeek": { en: "Next week", fa: "هفتهٔ آینده", ko: "다음 주" },
  "greet.custom": { en: "Custom", fa: "دلخواه", ko: "직접 설정" },
  "greet.planningToast": {
    en: "Planning “{text}” · {label}",
    fa: "برنامه‌ریزی «{text}» · {label}",
    ko: "“{text}” 계획 중 · {label}",
  },
  "greet.drafting": { en: "Drafting a plan for", fa: "در حال نوشتن برنامه برای", ko: "계획 초안 작성:" },
  "greet.dismiss": { en: "Dismiss", fa: "بستن", ko: "닫기" },

  /* ---------------------- messages (alt section) ---------------------- */
  "msg.accept": { en: "Accept", fa: "قبول", ko: "수락" },
  "msg.reject": { en: "Reject", fa: "رد", ko: "거절" },
  "msg.going": { en: "You’re going 🎉", fa: "می‌روی! 🎉", ko: "참석 확정 🎉" },
  "msg.declined": { en: "Declined", fa: "رد شد", ko: "거절함" },
  "msg.friendsGoing": { en: "{n} friends going", fa: "{n} دوست می‌آیند", ko: "친구 {n}명 참석" },
  "msg.enterText": { en: "Enter Text...", fa: "پیامی بنویس…", ko: "메시지 입력…" },
  "msg.send": { en: "Send message", fa: "ارسال پیام", ko: "메시지 보내기" },
  "msg.joined": { en: "You joined {name}’s plan", fa: "به برنامهٔ {name} پیوستی", ko: "{name}님의 계획에 참여했어요" },
  "msg.passed": { en: "You passed on {name}’s plan", fa: "از برنامهٔ {name} گذشتی", ko: "{name}님의 계획을 넘겼어요" },
  "msg.acceptedToast": {
    en: "Invite accepted · {name} was notified",
    fa: "دعوت پذیرفته شد · {name} باخبر شد",
    ko: "초대 수락 · {name}님에게 알림",
  },
  "msg.declinedToast": { en: "Invite declined", fa: "دعوت رد شد", ko: "초대 거절" },

  /* ---------------------- schedule (alt section) ---------------------- */
  "sched.title": { en: "Upcoming Schedule", fa: "برنامهٔ پیشِ رو", ko: "다가오는 일정" },
  "sched.prevMonth": { en: "Previous month", fa: "ماه قبل", ko: "이전 달" },
  "sched.nextMonth": { en: "Next month", fa: "ماه بعد", ko: "다음 달" },
  "sched.grid": { en: "Time grid", fa: "نمای زمانی", ko: "시간 그리드" },
  "sched.list": { en: "List", fa: "فهرست", ko: "목록" },
  "sched.private": { en: "Private", fa: "خصوصی", ko: "비공개" },
  "sched.openEvent": { en: "Open event", fa: "باز کردن رویداد", ko: "이벤트 열기" },
};

/** the shape `t()` takes — good enough for the handful of placeholders we use */
export type TVars = Record<string, string | number>;

/** fill `{name}` holes; missing vars are left visible so they can't pass silently */
export function fill(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}
