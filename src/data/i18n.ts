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
  "nav.primary": { en: "Main navigation", fa: "منوی اصلی", ko: "메인 메뉴" },
  "nav.artists": { en: "Artists", fa: "هنرمندان", ko: "아티스트" },
  "nav.albums": { en: "Albums", fa: "آلبوم‌ها", ko: "앨범" },
  "nav.playlists": { en: "Playlists", fa: "پلی‌لیست‌ها", ko: "플레이리스트" },
  "nav.shop": { en: "Shop", fa: "فروشگاه", ko: "상점" },
  "nav.news": { en: "News", fa: "اخبار", ko: "뉴스" },
  "nav.download": { en: "Download", fa: "دانلود", ko: "다운로드" },
  "nav.admin": { en: "Admin Console", fa: "پنل مدیریت کل", ko: "관리자 콘솔" },
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
  "account.kind.user": { en: "User", fa: "کاربر", ko: "사용자" },
  "account.kindPlaylist": { en: "Playlist", fa: "پلی‌لیست", ko: "플레이리스트" },
  "account.yourLibrary": { en: "Your library", fa: "کتابخانهٔ تو", ko: "내 라이브러리" },
  "account.profile": { en: "User Profile", fa: "پروفایل کاربری", ko: "사용자 프로필" },
  "account.likedTracks": { en: "Liked tracks", fa: "آهنگ‌های لایک‌شده", ko: "좋아요한 곡" },
  "account.contributions": { en: "Your contributions", fa: "مشارکت‌های تو", ko: "내 기여" },
  "account.signOut": { en: "Sign out", fa: "خروج از حساب", ko: "로그아웃" },
  "account.points": { en: "{n} fan points", fa: "{n} امتیاز هواداری", ko: "팬 포인트 {n}" },

  /* ------------------------ the five point rules ---------------------- */
  "points.title": { en: "How points add up", fa: "امتیازها چطور جمع می‌شوند", ko: "포인트 계산법" },
  "points.subtitle": {
    en: "The same five rules for every listener on FAIMESS.",
    fa: "پنج قاعدهٔ یکسان برای همهٔ شنونده‌های فیمس.",
    ko: "FAIMESS의 모든 리스너에게 같은 다섯 가지 규칙이에요.",
  },
  "points.total": { en: "Total", fa: "مجموع", ko: "합계" },
  "points.open": {
    en: "See how these points add up",
    fa: "ببین امتیازها چطور جمع می‌شوند",
    ko: "포인트 계산법 보기",
  },
  "points.listening": { en: "Listening time", fa: "زمان گوش‌دادن", ko: "청취 시간" },
  "points.comments": { en: "Comments on the site", fa: "کامنت‌های ثبت‌شده", ko: "사이트 댓글" },
  "points.invites": { en: "Friends who joined", fa: "دوستانی که عضو شدند", ko: "초대해 가입한 친구" },
  "points.tenure": { en: "Days as a member", fa: "روزهای عضویت", ko: "가입 일수" },
  "points.lyrics": { en: "Lyric sheets approved", fa: "لیریک‌های تأییدشده", ko: "승인된 가사" },
  "points.ratePerMinute": { en: "{n} per minute", fa: "{n} به ازای هر دقیقه", ko: "분당 {n}" },
  "points.ratePerComment": { en: "{n} per comment", fa: "{n} به ازای هر کامنت", ko: "댓글당 {n}" },
  "points.ratePerInvite": {
    en: "{n} per joined invite",
    fa: "{n} به ازای هر دعوت موفق",
    ko: "가입 1명당 {n}",
  },
  "points.ratePerDay": { en: "{n} per day", fa: "{n} به ازای هر روز", ko: "하루당 {n}" },
  "points.ratePerSheet": {
    en: "{n} per approved sheet",
    fa: "{n} به ازای هر لیریک تأییدشده",
    ko: "승인 1건당 {n}",
  },
  /* the same rates in the short form the breakdown column reads; the long
     sentence above stays as the tooltip on that cell */
  "points.shortRate.listening": { en: "{n}/min", fa: "{n} در دقیقه", ko: "{n}/분" },
  "points.shortRate.comments": { en: "{n}/comment", fa: "{n} در کامنت", ko: "{n}/댓글" },
  "points.shortRate.invites": { en: "{n}/joined invite", fa: "{n} در دعوت", ko: "{n}/가입" },
  "points.shortRate.tenure": { en: "{n}/day", fa: "{n} در روز", ko: "{n}/일" },
  "points.shortRate.lyrics": { en: "{n}/sheet", fa: "{n} در شیت", ko: "{n}/가사" },
  "points.countHours": { en: "{n} hours listened", fa: "{n} ساعت گوش‌دادن", ko: "{n}시간 청취" },
  "points.countMinutes": {
    en: "{m} minutes · {h} hours",
    fa: "{m} دقیقه · {h} ساعت",
    ko: "{m}분 · {h}시간",
  },
  "points.countComments": { en: "{n} comments", fa: "{n} کامنت", ko: "댓글 {n}개" },
  "points.countInvites": { en: "{n} friends joined", fa: "{n} دوست عضو شد", ko: "친구 {n}명 가입" },
  "points.countDays": { en: "{n} days on FAIMESS", fa: "{n} روز عضویت در فیمس", ko: "FAIMESS {n}일" },
  "points.countSheets": { en: "{n} sheets approved", fa: "{n} لیریک تأییدشده", ko: "가사 {n}건 승인" },
  "points.sessionNote": {
    en: "A sheet approved in this session is counted straight away; the balance itself lives in this browser.",
    fa: "لیریکی که همین حالا تأیید شود بلافاصله حساب می‌شود؛ خودِ موجودی در همین مرورگر می‌ماند.",
    ko: "이번 세션에서 승인된 가사는 바로 반영돼요. 잔액은 이 브라우저에만 남아요.",
  },

  /* --------------------------- the table ----------------------------- */
  "points.head.listening": { en: "Listening", fa: "گوش‌دادن", ko: "청취" },
  "points.head.comments": { en: "Comments", fa: "کامنت", ko: "댓글" },
  "points.head.invites": { en: "Invites", fa: "دعوت", ko: "초대" },
  "points.head.days": { en: "Days", fa: "روز", ko: "일수" },
  "points.head.lyrics": { en: "Lyrics", fa: "لیریک", ko: "가사" },
  /* ------------------------- the detail card ------------------------- */
  "detail.back": { en: "Back", fa: "بازگشت", ko: "뒤로" },
  "detail.playAll": { en: "Play all", fa: "پخش همه", ko: "전체 재생" },
  "detail.edit": { en: "Edit", fa: "ویرایش", ko: "편집" },
  "detail.shuffle": { en: "Shuffle", fa: "تصادفی", ko: "셔플" },
  "detail.share": { en: "Share", fa: "اشتراک", ko: "공유" },
  "detail.minutes": { en: "{n} min", fa: "{n} دقیقه", ko: "{n}분" },
  "detail.singles": { en: "Singles", fa: "سینگل‌ترک‌ها", ko: "싱글" },
  "detail.artistAlbums": { en: "Albums", fa: "آلبوم‌های آرتیست", ko: "앨범" },
  "detail.openAlbum": { en: "Open “{name}”", fa: "باز کردن «{name}»", ko: "“{name}” 열기" },
  "detail.empty": { en: "Nothing here yet", fa: "هنوز چیزی اینجا نیست", ko: "아직 아무것도 없어요" },
  "detail.emptyBody": {
    en: "Add a few songs and this list starts playing like any other.",
    fa: "چند آهنگ اضافه کن تا این لیست هم مثل بقیه پخش شود.",
    ko: "곡을 몇 개 담으면 다른 리스트처럼 재생돼요.",
  },
  "detail.addSongs": { en: "Add songs", fa: "افزودن آهنگ", ko: "곡 추가" },

  "leader.title": { en: "Leaderboard", fa: "جدول امتیازها", ko: "리더보드" },
  "leader.subtitle": {
    en: "Every balance here is the same five rules, added up.",
    fa: "هر موجودی در این جدول، مجموع همان پنج قاعدهٔ یکسان است.",
    ko: "이 표의 모든 잔액은 같은 다섯 규칙을 더한 값이에요.",
  },
  "leader.listener": { en: "Listener", fa: "شنونده", ko: "리스너" },
  "leader.you": { en: "You", fa: "تو", ko: "나" },
  "leader.rulesNote": {
    en: "A comment earns 0.25, a friend who signs up earns 3, and an approved lyric sheet earns 120.",
    fa: "هر کامنت ۰.۲۵ امتیاز، هر دوستی که عضو شود ۳ امتیاز و هر لیریک تأییدشده ۱۲۰ امتیاز دارد.",
    ko: "댓글은 0.25, 가입한 친구는 3, 승인된 가사는 120 포인트예요.",
  },
  "leader.tapNote": {
    en: "Pick any listener on the shelf to open their own five lines.",
    fa: "روی هر شنونده در قفسه بزن تا پنج خط امتیاز خودش باز شود.",
    ko: "선반에서 리스너를 고르면 그 사람의 다섯 줄을 볼 수 있어요.",
  },

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
  "shelf.hintDesk": { en: "K-pop desk", fa: "میز پاپ کره‌ای", ko: "K-pop 데스크" },
  "shelf.hintWeek": { en: "this week", fa: "این هفته", ko: "이번 주" },
  "shelf.hintLive": { en: "updated live", fa: "زنده به‌روز می‌شود", ko: "실시간 업데이트" },
  "shelf.wasLiveSuffix": { en: "was live", fa: "لایو بود", ko: "라이브 했어요" },

  /* ------------------------------- hero ------------------------------- */

  /* ------------------------------ player ------------------------------ */
  /* the player header carries the play count where the word "Player" was */
  "player.plays": { en: "{n} plays", fa: "{n} پخش", ko: "{n}회 재생" },
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
  /* the compact (phone/tablet) player: a bar over the bottom navigation */
  "player.miniPick": { en: "Pick a song", fa: "یه آهنگ پخش کن", ko: "곡을 골라 보세요" },
  "player.openFull": { en: "Open the player", fa: "باز کردن پلیر", ko: "플레이어 열기" },
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
  "player.heyGuest": { en: "Hey,", fa: "سلام،", ko: "안녕하세요," },
  "player.pickOne": {
    en: "Pick a song and the player fills up — cover, seek bar and the bilingual lyrics.",
    fa: "یک آهنگ انتخاب کن تا پلیر پر شود — کاور، نوار پخش و لیریک دوزبانه.",
    ko: "곡을 고르면 커버, 탐색 바, 이중 언어 가사가 채워져요.",
  },
  "player.opening": { en: "Opening “{name}”", fa: "باز شدن «{name}»", ko: "“{name}” 여는 중" },
  "player.playing": { en: "Playing {artist} — “{title}”", fa: "پخش {artist} — «{title}»", ko: "{artist} — “{title}” 재생 중" },

  /* ------------------------------ lyrics ------------------------------ */
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
  "report.note": {
    en: "Reports are anonymous. The fan won’t know — moderators review it and decide.",
    fa: "گزارش‌ها بی‌نام‌اند. هوادار متوجه نمی‌شود — مدیران بررسی می‌کنند و تصمیم می‌گیرند.",
    ko: "신고는 익명이에요. 팬은 알 수 없고, 관리자가 검토해 결정합니다.",
  },
  "comments.more": { en: "More actions", fa: "کارهای بیشتر", ko: "더보기" },
  "comments.verified": { en: "Verified account", fa: "حساب تأییدشده", ko: "인증된 계정" },
  "comments.close": { en: "Close comments", fa: "بستن کامنت‌ها", ko: "댓글 닫기" },
  "comments.copied": { en: "Link copied", fa: "لینک کپی شد", ko: "링크를 복사했어요" },
  "comments.deletedToast": { en: "Comment deleted", fa: "کامنت حذف شد", ko: "댓글을 삭제했어요" },
  "comments.deletedWithRepliesToast": {
    en: "Comment and all replies deleted",
    fa: "کامنت و تمامی پاسخ‌های آن حذف شدند",
    ko: "댓글과 모든 답글이 삭제되었습니다",
  },
  "comments.deleteConfirmTitle": {
    en: "Delete comment and all replies?",
    fa: "حذف کامنت و تمامی پاسخ‌ها؟",
    ko: "댓글과 모든 답글을 삭제하시겠어요?",
  },
  "comments.deleteConfirmDesc": {
    en: "This comment has {n} replies. Deleting it will permanently remove the entire thread.",
    fa: "این کامنت {n} پاسخ دارد. با حذف آن، تمامی پاسخ‌های این گفتگو نیز به‌طور کامل حذف خواهند شد.",
    ko: "이 댓글에 {n}개의 답글이 있습니다. 삭제 시 모든 답글도 함께 영구 삭제됩니다.",
  },
  "comments.deleteAsAdmin": {
    en: "Delete as Admin",
    fa: "حذف توسط مدیر",
    ko: "관리자 권한으로 삭제",
  },
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
  "page.saveAlbum": { en: "Save album", fa: "ذخیرهٔ آلبوم", ko: "앨범 저장" },
  "page.openArtist": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },
  "page.openAlbum": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },
  "page.openPlaylist": { en: "Open {name}", fa: "باز کردن {name}", ko: "{name} 열기" },

  /* ------------------------- your own playlists ----------------------- */
  "playlist.new": { en: "New playlist", fa: "پلی‌لیست تازه", ko: "새 플레이리스트" },
  "playlist.newTip": {
    en: "Build a playlist of your own",
    fa: "برای خودت پلی‌لیست بساز",
    ko: "나만의 플레이리스트 만들기",
  },
  "playlist.createTitle": { en: "Create a playlist", fa: "ساخت پلی‌لیست", ko: "플레이리스트 만들기" },
  "playlist.createBody": {
    en: "Give it a name, pick one of the FAIMESS covers, then search the catalogue for songs.",
    fa: "یک اسم بگذار، یکی از کاورهای فیمس را انتخاب کن و بعد آهنگ‌ها را در کاتالوگ جست‌وجو کن.",
    ko: "이름을 정하고 FAIMESS 커버를 고른 뒤 카탈로그에서 곡을 검색하세요.",
  },
  "playlist.editTitle": { en: "Edit “{name}”", fa: "ویرایش «{name}»", ko: "“{name}” 편집" },
  "playlist.editBody": {
    en: "Rename it, swap the cover, or change which songs are in it.",
    fa: "اسم و کاور را عوض کن یا آهنگ‌های داخلش را تغییر بده.",
    ko: "이름과 커버를 바꾸거나 곡을 편집하세요.",
  },
  "playlist.nameLabel": { en: "Name", fa: "اسم", ko: "이름" },
  "playlist.namePlaceholder": { en: "Late night drive", fa: "رانندگی شبانه", ko: "늦은 밤 드라이브" },
  "playlist.coverLabel": { en: "Cover", fa: "کاور", ko: "커버" },
  "playlist.coverNote": {
    en: "Covers come from the FAIMESS library — nothing to upload.",
    fa: "کاورها از تصاویر آمادهٔ فیمس انتخاب می‌شوند — آپلودی در کار نیست.",
    ko: "커버는 FAIMESS 라이브러리에서 고릅니다 — 업로드는 없어요.",
  },
  "playlist.songsLabel": { en: "Songs", fa: "آهنگ‌ها", ko: "곡" },
  "playlist.searchPlaceholder": {
    en: "Search songs, artists, albums",
    fa: "جست‌وجوی آهنگ، هنرمند، آلبوم",
    ko: "곡·아티스트·앨범 검색",
  },
  "playlist.searchHint": {
    en: "Type to search {count} tracks from the catalogue",
    fa: "برای جست‌وجو در {count} آهنگ کاتالوگ تایپ کن",
    ko: "카탈로그 {count}곡에서 검색해 보세요",
  },
  "playlist.noResults": {
    en: "Nothing matches “{query}”",
    fa: "چیزی با «{query}» پیدا نشد",
    ko: "“{query}”와 맞는 곡이 없어요",
  },
  "playlist.selected": { en: "{count} songs selected", fa: "{count} آهنگ انتخاب شد", ko: "{count}곡 선택됨" },
  "playlist.empty": {
    en: "No songs yet — search above and tap a row to add it.",
    fa: "هنوز آهنگی نیست — بالا جست‌وجو کن و روی یک ردیف بزن تا اضافه شود.",
    ko: "아직 곡이 없어요 — 위에서 검색해 곡을 눌러 추가하세요.",
  },
  "playlist.removeSong": { en: "Remove this song", fa: "حذف این آهنگ", ko: "이 곡 빼기" },
  "playlist.pick": { en: "Add this song", fa: "افزودن این آهنگ", ko: "이 곡 추가" },
  "playlist.picked": { en: "Take this song out", fa: "برداشتن این آهنگ", ko: "이 곡 빼기" },
  "playlist.create": { en: "Create playlist", fa: "ساخت پلی‌لیست", ko: "플레이리스트 만들기" },
  "playlist.save": { en: "Save changes", fa: "ذخیرهٔ تغییرات", ko: "변경 사항 저장" },
  "playlist.delete": { en: "Delete playlist", fa: "حذف پلی‌لیست", ko: "플레이리스트 삭제" },
  "playlist.created": { en: "“{name}” is ready", fa: "«{name}» آماده است", ko: "“{name}” 완성" },
  "playlist.saved": { en: "“{name}” updated", fa: "«{name}» به‌روز شد", ko: "“{name}” 수정됨" },
  "playlist.deleted": { en: "“{name}” deleted", fa: "«{name}» حذف شد", ko: "“{name}” 삭제됨" },
  "playlist.add": { en: "Add to a playlist", fa: "افزودن به پلی‌لیست", ko: "플레이리스트에 담기" },
  "playlist.addTitle": { en: "Add “{title}” to…", fa: "«{title}» را به کدام اضافه کنم؟", ko: "“{title}” 어디에 담을까요?" },
  "playlist.added": { en: "Added to “{name}”", fa: "به «{name}» اضافه شد", ko: "“{name}”에 담았어요" },
  "playlist.already": { en: "Already in “{name}”", fa: "از قبل در «{name}» هست", ko: "이미 “{name}”에 있어요" },
  "playlist.noLists": { en: "No playlists yet", fa: "هنوز پلی‌لیستی نداری", ko: "아직 플레이리스트가 없어요" },
  "playlist.noListsBody": {
    en: "Make one and it shows up here, in the player's playlists panel, and on the Playlists page.",
    fa: "یکی بساز تا اینجا، در پنل پلی‌لیست‌های پلیر و در صفحهٔ پلی‌لیست‌ها ظاهر شود.",
    ko: "하나 만들면 여기와 플레이어 패널, 플레이리스트 페이지에 나타나요.",
  },
  "playlist.trackCount": { en: "{count} tracks", fa: "{count} آهنگ", ko: "{count}곡" },
  "playlist.trackOne": { en: "1 track", fa: "۱ آهنگ", ko: "1곡" },
  "playlist.yours": { en: "Yours", fa: "ساختهٔ تو", ko: "내 것" },
  "playlist.openMine": { en: "Open “{name}”", fa: "باز کردن «{name}»", ko: "“{name}” 열기" },
  "playlist.cover.midnight-drive": { en: "Midnight drive", fa: "رانندگی نیمه‌شب", ko: "미드나이트 드라이브" },
  "playlist.cover.comeback": { en: "Comeback", fa: "کمبک", ko: "컴백" },
  "playlist.cover.golden-hour": { en: "Golden hour", fa: "ساعت طلایی", ko: "골든 아워" },
  "playlist.cover.rainy-window": { en: "Rainy window", fa: "پنجرهٔ بارانی", ko: "비 오는 창" },
  "playlist.cover.deep-focus": { en: "Deep focus", fa: "تمرکز عمیق", ko: "딥 포커스" },
  "playlist.cover.weekend-reset": { en: "Weekend reset", fa: "ریست آخر هفته", ko: "위켄드 리셋" },
  "share.title": { en: "Share “{title}”", fa: "اشتراک «{title}»", ko: "“{title}” 공유" },
  "share.body": {
    en: "The link opens straight in the browser — no app needed to listen.",
    fa: "لینک مستقیم در مرورگر باز می‌شود — برای شنیدن به اپ نیازی نیست.",
    ko: "링크는 브라우저에서 바로 열려요 — 듣는 데 앱이 필요 없어요.",
  },
  "share.copyLink": { en: "Copy link", fa: "کپی لینک", ko: "링크 복사" },
  "share.copied": { en: "Link copied", fa: "لینک کپی شد", ko: "링크를 복사했어요" },
  "share.copyNote": {
    en: "If the clipboard is blocked, select the link above.",
    fa: "اگر کلیپ‌بورد اجازه نداد، لینک بالا را دستی انتخاب کن.",
    ko: "클립보드가 막혀 있으면 위 링크를 직접 선택하세요.",
  },
  "share.via": { en: "Send it to", fa: "بفرست به", ko: "보내기" },
  "share.x": { en: "X", fa: "ایکس", ko: "X" },
  "share.whatsapp": { en: "WhatsApp", fa: "واتس‌اپ", ko: "왓츠앱" },
  "share.telegram": { en: "Telegram", fa: "تلگرام", ko: "텔레그램" },
  "share.facebook": { en: "Facebook", fa: "فیسبوک", ko: "페이스북" },
  "share.kakao": { en: "KakaoTalk", fa: "کاکائو تاک", ko: "카카오톡" },
  "shop.title": { en: "Shop", fa: "فروشگاه", ko: "상점" },
  "shop.subtitle": {
    en: "Official merch, photocards and lightsticks — the whole shelf.",
    fa: "مرچ رسمی، فوتوکارت و لایت‌استیک — همهٔ قفسه.",
    ko: "공식 굿즈, 포토카드, 응원봉 — 전체 진열대.",
  },
  "shop.host": { en: "Sold on {host}", fa: "فروش در {host}", ko: "{host}에서 판매" },
  "shop.redirectNote": {
    en: "Tap any product and it opens on our store site. Prices are in Toman; the purchase happens there, not here.",
    fa: "روی هر محصول بزنی، در سایت فروشگاه باز می‌شود. قیمت‌ها به تومان است و خرید همان‌جا انجام می‌شود، نه اینجا.",
    ko: "상품을 누르면 스토어 사이트에서 열려요. 가격은 토만이고, 구매는 그곳에서 진행돼요.",
  },
  "shop.onStore": { en: "Open on the store", fa: "باز کردن در فروشگاه", ko: "스토어에서 열기" },
  "shop.openOnStore": {
    en: "Open “{name}” on the store site",
    fa: "باز کردن «{name}» در سایت فروشگاه",
    ko: "스토어 사이트에서 “{name}” 열기",
  },
  "shop.currency": { en: "Toman", fa: "تومان", ko: "토만" },
  "shop.count": { en: "{n} products", fa: "{n} محصول", ko: "상품 {n}개" },
  "shop.category.all": { en: "All", fa: "همه", ko: "전체" },
  "shop.category.apparel": { en: "Apparel", fa: "پوشاک", ko: "의류" },
  "shop.category.accessories": { en: "Accessories", fa: "اکسسوری", ko: "액세서리" },
  "shop.category.collectibles": { en: "Collectibles", fa: "کلکسیونی", ko: "컬렉션" },
  "shop.badge.new": { en: "New", fa: "تازه", ko: "신상" },
  "shop.badge.bestseller": { en: "Best seller", fa: "پرفروش", ko: "베스트" },
  "shop.badge.low": { en: "Almost gone", fa: "آخرین‌ها", ko: "품절 임박" },
  "playlist.editTip": { en: "Edit playlist", fa: "ویرایش پلی‌لیست", ko: "플레이리스트 편집" },
  "playlist.playTip": { en: "Play this playlist", fa: "پخش این پلی‌لیست", ko: "플레이리스트 재생" },
  "playlist.shareTip": { en: "Share playlist", fa: "اشتراک پلی‌لیست", ko: "플레이리스트 공유" },
  "playlist.listCount": { en: "{count} playlists", fa: "{count} پلی‌لیست", ko: "플레이리스트 {count}개" },
  "playlist.curated": { en: "From the FAIMESS desk", fa: "از میز تحریریهٔ فیمس", ko: "FAIMESS 데스크 추천" },
  "playlist.emptyNote": { en: "“{name}” has no songs yet", fa: "«{name}» هنوز آهنگی ندارد", ko: "“{name}”에는 아직 곡이 없어요" },
  "player.shareTip": { en: "Share this song", fa: "اشتراک این آهنگ", ko: "이 곡 공유" },
  "player.addTip": { en: "Add to one of your playlists", fa: "افزودن به یکی از پلی‌لیست‌هایت", ko: "내 플레이리스트에 추가" },

  "news.title": { en: "News", fa: "اخبار", ko: "뉴스" },
  "news.subtitle": {
    en: "Comebacks, tours, charts and everything the K-pop desk is tracking",
    fa: "کمبک، تور، چارت و هر چیزی که میز پاپ کره‌ای دنبال می‌کند",
    ko: "컴백, 투어, 차트까지 — K-pop 데스크가 쫓는 모든 것",
  },
  "news.backHome": { en: "Back home", fa: "بازگشت به خانه", ko: "홈으로" },
  "news.tag.all": { en: "All", fa: "همه", ko: "전체" },
  "news.tag.comeback": { en: "Comeback", fa: "کمبک", ko: "컴백" },
  "news.tag.tour": { en: "Tour", fa: "تور", ko: "투어" },
  "news.tag.charts": { en: "Charts", fa: "چارت", ko: "차트" },
  "news.tag.awards": { en: "Awards", fa: "جوایز", ko: "어워즈" },
  "news.tag.editorial": { en: "Editorial", fa: "تحریریه", ko: "에디토리얼" },

  "news.shelf.trending": { en: "Trending News", fa: "اخبار ترند (بر اساس لایک)", ko: "인기 뉴스 (좋아요 순)" },
  "news.shelf.trendingDesc": {
    en: "Most liked stories by the community this week",
    fa: "محبوب‌ترین و پرلایک‌ترین اخبار این هفته از نگاه کاربران",
    ko: "이번 주 팬들에게 가장 많은 좋아요를 받은 뉴스",
  },
  "news.shelf.latest": { en: "Latest News", fa: "جدیدترین اخبار", ko: "최신 뉴스" },
  "news.shelf.latestDesc": {
    en: "Fresh updates from comebacks, tours and charts",
    fa: "تازه‌ترین رویدادها، تاریخ تورها و صدرنشینان چارت",
    ko: "컴백, 투어, 차트의 따끈따끈한 소식",
  },
  "news.shelf.mostDiscussed": { en: "Most Discussed", fa: "پر بحث‌ترین اخبار (بر اساس کامنت‌ها)", ko: "화제의 뉴스 (댓글 많은 순)" },
  "news.shelf.mostDiscussedDesc": {
    en: "Articles generating the hottest fan conversations",
    fa: "اخباری که بیشترین گفتگو و نظرات طرفداران را برانگیخته‌اند",
    ko: "팬들의 열띤 토론이 이어지는 화제의 기사",
  },
  "news.backToNews": { en: "Back to news", fa: "بازگشت به اخبار", ko: "뉴스로 돌아가기" },
  "news.viewsCount": { en: "{n} views", fa: "{n} بازدید", ko: "조회수 {n}회" },
  "news.likesCount": { en: "{n} likes", fa: "{n} لایک", ko: "좋아요 {n}개" },
  "news.commentsCount": { en: "{n} comments", fa: "{n} دیدگاه", ko: "댓글 {n}개" },
  "news.readTime": { en: "3 min read", fa: "۳ دقیقه مطالعه", ko: "3분 읽기" },
  "news.authorBy": { en: "By {author}", fa: "به قلم {author}", ko: "{author} 작성" },
  "news.commentsTitle": { en: "Discussion & Comments", fa: "دیدگاه‌ها و گفتگو", ko: "댓글 및 토론" },
  "news.commentPlaceholder": {
    en: "Share your thoughts on this story…",
    fa: "نظر خود را دربارهٔ این خبر بنویسید…",
    ko: "이 뉴스에 대한 생각을 남겨보세요…",
  },
  "news.commentSend": { en: "Post comment", fa: "ارسال نظر", ko: "댓글 등록" },
  "news.shareTitle": { en: "Share story", fa: "اشتراک‌گذاری خبر", ko: "뉴스 공유" },
  "news.likedToast": { en: "Added to your liked stories", fa: "به اخبار پسندیده‌شده افزوده شد", ko: "좋아요한 뉴스에 추가되었습니다" },
  "news.unlikedToast": { en: "Removed from liked stories", fa: "از اخبار پسندیده‌شده حذف شد", ko: "좋아요를 취소했습니다" },
  "news.commentPosted": { en: "Your comment was published", fa: "دیدگاه شما با موفقیت ثبت شد", ko: "댓글이 등록되었습니다" },
  "news.seeAll": { en: "See all news", fa: "مشاهدهٔ همه اخبار", ko: "모든 뉴스 보기" },
  "news.featuredBadge": { en: "Featured Story", fa: "خبر ویژه", ko: "주요 뉴스" },

  "download.title": { en: "Get the FAIMESS app", fa: "اپ فیمس را بگیر", ko: "FAIMESS 앱 받기" },
  "download.subtitle": {
    en: "Downloading tracks is an Android feature — the browser streams.",
    fa: "دانلود آهنگ‌ها فقط در اندروید است — مرورگر پخش می‌کند.",
    ko: "트랙 다운로드는 안드로이드 기능이에요 — 브라우저는 스트리밍해요.",
  },
  "download.appName": { en: "FAIMESS for Android", fa: "فیمس برای اندروید", ko: "안드로이드용 FAIMESS" },
  "download.meta": { en: "Version 2.4 · 28 MB · Android 9 and up", fa: "نسخهٔ ۲.۴ · ۲۸ مگابایت · اندروید ۹ و بالاتر", ko: "버전 2.4 · 28MB · 안드로이드 9 이상" },
  "download.body": {
    en: "The app carries everything the web player does — the feed, the bilingual lyric sheet, the player card — and adds the part the browser can’t do: taking the music with you.",
    fa: "اپ همهٔ چیزهایی که پخش‌کنندهٔ وب دارد را با خودش می‌آورد — فید، متن دوزبانه و کارت پلیر — و آن بخشی را اضافه می‌کند که مرورگر نمی‌تواند: بردن موسیقی همراهت.",
    ko: "앱은 웹 플레이어의 모든 것을 담고 있어요 — 피드, 이중언어 가사, 플레이어 카드 — 그리고 브라우저가 못 하는 일을 더해요: 음악을 함께 들고 다니기.",
  },
  "download.buildStore": {
    en: "Prototype build — the store listing lands with the app",
    fa: "نسخهٔ آزمایشی — صفحهٔ فروشگاه همراه خود اپ می‌آید",
    ko: "프로토타입 빌드 — 스토어 등록은 앱과 함께",
  },
  "download.buildApk": {
    en: "Prototype build — the APK ships with the app",
    fa: "نسخهٔ آزمایشی — فایل APK همراه خود اپ می‌آید",
    ko: "프로토타입 빌드 — APK는 앱과 함께",
  },
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

  /* ------------------------------ PWA -------------------------------- */
  "pwa.installButton": { en: "Install Web App (PWA)", fa: "نصب وب‌اپلیکیشن (PWA)", ko: "웹 앱 설치 (PWA)" },
  "pwa.installed": { en: "App installed", fa: "اپلیکیشن نصب شده است", ko: "앱 설치됨" },
  "pwa.installPrompt": {
    en: "Install FAIMESS on your phone or desktop for an app-like streaming experience.",
    fa: "FAIMESS را برای تجربهٔ روان و بدون نیاز به استور روی گوشی یا رایانه نصب کنید.",
    ko: "스토어 없이 기기에 FAIMESS를 설치하여 매끄러운 스트리밍을 경험하세요.",
  },
  "pwa.iosGuide": {
    en: "In Safari, tap Share and select 'Add to Home Screen'.",
    fa: "در سافاری، دکمه Share (اشتراک) را بزنید و گزینه «Add to Home Screen» را انتخاب کنید.",
    ko: "Safari에서 공유 버튼을 누르고 '홈 화면에 추가'를 선택하세요.",
  },
  "pwa.installedToast": {
    en: "FAIMESS installed successfully!",
    fa: "وب‌اپلیکیشن FAIMESS با موفقیت نصب شد!",
    ko: "FAIMESS 웹 앱이 성공적으로 설치되었습니다!",
  },
  "pwa.androidGuide": {
    en: "Tap the browser menu (⋮) and select 'Install app' or 'Add to Home screen'.",
    fa: "منوی سه‌نقطه (⋮) بالای مرورگر را بزنید و «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.",
    ko: "브라우저 메뉴(⋮)를 누르고 '앱 설치' 또는 '홈 화면에 추가'를 선택하세요.",
  },
  "pwa.insecureNotice": {
    en: "PWA on mobile requires HTTPS or localhost port forwarding via USB.",
    fa: "نصب وب‌اپلیکیشن در موبایل نیازمند HTTPS یا فوروارد پورت localhost است.",
    ko: "모바일에서 웹 앱을 설치하려면 HTTPS 또는 localhost 포트 포워딩이 필요합니다.",
  },
  "pwa.badge": { en: "PWA Web App", fa: "وب‌اپلیکیشن PWA", ko: "PWA 웹 앱" },

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
  "ui.cancel": { en: "Cancel", fa: "لغو", ko: "취소" },

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

  /* --------------------------- banner copy ----------------------------- *
   *  The hero carousel is editorial copy FAIMESS writes itself (unlike a
   *  track title or a fan's comment), so it is translated too: an English
   *  headline on top of a Persian home page is exactly the mix this table
   *  exists to avoid. The data keeps the English source of truth.        */
  "banner.afterglow-tour.title": {
    en: "NOVAE — Afterglow World Tour",
    fa: "NOVAE — تور جهانی Afterglow",
    ko: "NOVAE — Afterglow 월드 투어",
  },
  "banner.afterglow-tour.subtitle": {
    en: "Three nights at KSPO Dome, then Tokyo and Milan.",
    fa: "سه شب در KSPO Dome، بعد توکیو و میلان.",
    ko: "KSPO 돔에서 3일, 그리고 도쿄와 밀라노.",
  },
  "banner.prism9-asia.title": {
    en: "PRISM9 — Velvet Static Asia leg",
    fa: "PRISM9 — بخش آسیایی Velvet Static",
    ko: "PRISM9 — Velvet Static 아시아 투어",
  },
  "banner.prism9-asia.subtitle": {
    en: "Velvet Static lands in Tokyo, Manila and Bangkok this December.",
    fa: "Velvet Static این دسامبر به توکیو، مانیل و بانکوک می‌رسد.",
    ko: "Velvet Static이 12월에 도쿄, 마닐라, 방콕에 찾아옵니다.",
  },
  "banner.midnight-seoul.title": {
    en: "AXION — “Midnight Seoul”",
    fa: "AXION — «Midnight Seoul»",
    ko: "AXION — “Midnight Seoul”",
  },
  "banner.midnight-seoul.subtitle": {
    en: "The new single is out everywhere — listening party tonight, 20:00 KST.",
    fa: "سینگل تازه همه‌جا منتشر شد — امشب ساعت ۲۰:۰۰ به وقت کره مهمانی شنیدن داریم.",
    ko: "신곡이 전 세계에 공개됐어요 — 오늘 밤 20:00 (KST) 리스닝 파티.",
  },
  "banner.banner-shop-hoodie.title": {
    en: "On Stage Tour Hoodie",
    fa: "هودی تور On Stage",
    ko: "온 스테이지 투어 후디",
  },
  "banner.banner-shop-hoodie.subtitle": {
    en: "Heavyweight oversized fleece with tour embroidery — limited stock.",
    fa: "هودی اورسایز گرم با گلدوزی اختصاصی تور — موجودی محدود.",
    ko: "투어 자수가 들어간 헤비웨이트 오버핏 플리스 — 한정 수량.",
  },
  "banner.banner-playlist-drive.title": {
    en: "Late Night Drive",
    fa: "پلی‌لیست رانندگی شبانه",
    ko: "레이트 나이트 드라이브",
  },
  "banner.banner-playlist-drive.subtitle": {
    en: "Neon-lit city beats, smooth synth-wave and midnight vocals.",
    fa: "بیت‌های نئونی شهری، سینث‌ویو نرم و وکال‌های نیمه‌شب.",
    ko: "네온사인 도시의 비트, 감각적인 신스웨이브와 미드나잇 보컬.",
  },
  "banner.banner-artist-prism9.title": {
    en: "PRISM9 — Velvet Static",
    fa: "PRISM9 — Velvet Static",
    ko: "PRISM9 — Velvet Static",
  },
  "banner.banner-artist-prism9.subtitle": {
    en: "Explore the full discography, singles, and member stories.",
    fa: "کشف دیسکوگرافی کامل، تک‌آهنگ‌ها و داستان اعضا.",
    ko: "전체 디스코그래피, 싱글, 멤버 스토리 만나보기.",
  },
  "banner.afterglow-tour.eyebrow": {
    en: "World tour",
    fa: "تور جهانی",
    ko: "월드 투어",
  },
  "banner.prism9-asia.eyebrow": {
    en: "New dates",
    fa: "تاریخ‌های جدید",
    ko: "새 일정",
  },
  "banner.midnight-seoul.eyebrow": {
    en: "Out now",
    fa: "منتشر شد",
    ko: "신규 발매",
  },
  "banner.banner-shop-hoodie.eyebrow": {
    en: "Official Merch",
    fa: "مرچ رسمی",
    ko: "공식 굿즈",
  },
  "banner.banner-playlist-drive.eyebrow": {
    en: "Curated Playlist",
    fa: "پلی‌لیست منتخب",
    ko: "추천 플레이리스트",
  },
  "banner.banner-artist-prism9.eyebrow": {
    en: "Featured Artist",
    fa: "هنرمند منتخب",
    ko: "추천 아티스트",
  },

  /* --------------------------- news copy ------------------------------- *
   *  Headlines and standfirsts from the K-pop desk: the same rule as the
   *  banner — written by FAIMESS, so it reads in the reader's language.
   *  The `en` column is the literal the data file carries.               */
  "news.nw1.title": {
    en: "NOVAE announce first world tour “Afterglow”",
    fa: "NOVAE اولین تور جهانی «Afterglow» را اعلام کرد",
    ko: "NOVAE, 첫 월드 투어 “Afterglow” 발표",
  },
  "news.nw1.excerpt": {
    en: "Twelve cities across Asia, Europe and North America, with the Seoul opener streaming live.",
    fa: "دوازده شهر در آسیا، اروپا و آمریکای شمالی، با پخش زندهٔ افتتاحیه در سئول.",
    ko: "아시아·유럽·북미 12개 도시, 서울 개막 공연은 라이브 스트리밍.",
  },
  "news.nw1.p1": {
    en: "NOVAE have officially announced their first-ever world tour titled 'Afterglow'. The tour kicks off with three massive headline nights at the KSPO Dome in Seoul.",
    fa: "گروه NOVAE رسماً اولین تور جهانی خود را با عنوان «Afterglow» معرفی کرد. این تور با سه شب کنسرت پرشکوه در KSPO Dome سئول آغاز خواهد شد.",
    ko: "NOVAE가 첫 월드 투어 'Afterglow'의 공식 일정을 발표했습니다. 이번 투어는 서울 KSPO 돔에서 3일간의 대규모 공연으로 화려한 막을 올립니다.",
  },
  "news.nw1.p2": {
    en: "The twelve-city itinerary spans major musical capitals across Asia, Europe, and North America, including Tokyo, Milan, London, New York, and Los Angeles. International ticket sales begin next Monday.",
    fa: "برنامهٔ دوازده شهر این تور شامل پایتخت‌های موسیقی در آسیا، اروپا و آمریکای شمالی از جمله توکیو، میلان، لندن، نیویورک و لس‌آنجلس خواهد بود. فروش بلیت‌ها از دوشنبهٔ آینده آغاز می‌شود.",
    ko: "도쿄, 밀라노, 런던, 뉴욕, 로스앤젤레스 등 아시아·유럽·북미 12개 주요 도시를 순회하며 글로벌 팬들과 만날 예정입니다. 해외 티켓 예매는 다음 주 월요일부터 시작됩니다.",
  },
  "news.nw1.p3": {
    en: "For global fans unable to attend in person, the agency confirmed that the Seoul opening night will be streamed live exclusively on FAIMESS with multi-angle 4K feeds and synced bilingual lyrics.",
    fa: "برای هواداران در سراسر جهان که امکان حضور فیزیکی ندارند، استودیو تأیید کرده است که کنسرت افتتاحیه سئول به‌صورت پخش زنده و اختصاصی از داشبورد FAIMESS با کیفیت 4K و لیریک دوزبانه پخش خواهد شد.",
    ko: "현장에 함께하지 못하는 글로벌 팬들을 위해 서울 개막 공연은 FAIMESS 대시보드를 통해 4K 멀티뷰 및 실시간 이중 언어 가사로 독점 라이브 스트리밍됩니다.",
  },
  "news.nw2.title": {
    en: "AXION’s “Midnight Seoul” tops the global chart",
    fa: "«Midnight Seoul» از AXION صدرنشین چارت جهانی شد",
    ko: "AXION의 “Midnight Seoul”, 글로벌 차트 1위",
  },
  "news.nw2.excerpt": {
    en: "The lead single climbs to #1 in nine markets and breaks the group’s first-week record.",
    fa: "این سینگل در ۹ بازار به شمارهٔ ۱ رسید و رکورد هفتهٔ اول گروه را شکست.",
    ko: "9개 시장에서 1위에 오르며 그룹의 첫 주 기록을 갈아치웠어요.",
  },
  "news.nw2.p1": {
    en: "AXION have scored their biggest international milestone yet as their latest single 'Midnight Seoul' rocketed to the #1 spot on the global streaming chart within hours of its drop.",
    fa: "گروه AXION بزرگ‌ترین دستاورد بین‌المللی خود را ثبت کرد؛ سینگل تازهٔ آن‌ها «Midnight Seoul» تنها چند ساعت پس از انتشار، به رتبهٔ اول چارت استریم جهانی صعود کرد.",
    ko: "AXION이 최신 싱글 'Midnight Seoul' 발매 چند 시간 만에 글로벌 스트리밍 차트 1위에 오르며 자체 최고 기록을 경신했습니다.",
  },
  "news.nw2.p2": {
    en: "The synth-heavy track has captured nine major markets simultaneously, driving unprecedented streaming traffic and smashing the group's previous first-week record by over forty percent.",
    fa: "این قطعه با بیس جذاب سینث‌پاپ خود همزمان در ۹ بازار بزرگ رکورد زد و رکورد قبلی هفتهٔ اول گروه را بیش از چهل درصد بهبود بخشید.",
    ko: "감각적인 신스 사운드가 돋보이는 이번 곡은 9개 주요 음악 시장을 동시에 석권하며 이전 첫 주 기록을 40% 이상 뛰어넘었습니다.",
  },
  "news.nw2.p3": {
    en: "Music critics have praised the song's production, calling it a masterclass in modern Korean pop production, while fans celebrate the achievement across social communities worldwide.",
    fa: "منتقدان موسیقی تهیه‌کنندگی این اثر را ستوده‌اند و آن را کلاسی پیشرفته در پاپ مدرن کره‌ای نامیده‌اند؛ هواداران در تمام شبکه‌ها این موفقیت تاریخی را جشن گرفته‌اند.",
    ko: "음악 평론가들은 현대 K-pop 프로덕션의 정수라고 호평했으며, 전 세계 팬 커뮤니티는 뜨거운 축하를 이어가고 있습니다.",
  },
  "news.nw3.title": {
    en: "SEORA teases her mini-album with a 20-second clip",
    fa: "SEORA با کلیپ ۲۰ ثانیه‌ای مینی‌آلبومش را تیزر زد",
    ko: "SEORA, 20초 티저로 미니 앨범 예고",
  },
  "news.nw3.excerpt": {
    en: "A midnight teaser confirms the six-track EP and a title song written with LUNEX’s producer.",
    fa: "تیزر نیمه‌شب، EP شش‌تِرَکه و ترک تیتراژ را که با تهیه‌کنندهٔ LUNEX نوشته شده تأیید می‌کند.",
    ko: "자정 티저가 6곡 EP와 LUNEX 프로듀서가 참여한 타이틀곡을 공개했어요.",
  },
  "news.nw3.p1": {
    en: "Solo sensation SEORA stunned fans at midnight with a cinematic 20-second visual teaser, officially confirming her highly anticipated upcoming mini-album.",
    fa: "سولوییست محبوب SEORA در نیمه‌شب با انتشار یک ویدیوی سینمایی ۲۰ ثانیه‌ای، مینی‌آلبوم مورد انتظار خود را رسماً معرفی کرد.",
    ko: "솔로 아티스트 SEORA가 자정에 감각적인 20초 비주얼 티저를 깜짝 공개하며 많은 기대를 모아온 새 미니 앨범 소식을 알렸습니다.",
  },
  "news.nw3.p2": {
    en: "The upcoming EP will feature six brand-new tracks, including a much-anticipated title song crafted in collaboration with the producer behind LUNEX's signature hits.",
    fa: "این EP شامل شش قطعهٔ کاملاً جدید خواهد بود؛ از جمله ترک اصلی که با همکاری تهیه‌کنندهٔ مشهور هیت‌های گروه LUNEX ساخته شده است.",
    ko: "이번 EP는 총 6곡의 신곡으로 채워지며, LUNEX의 대표 히트곡을 탄생시킨 프로듀서와 협업한 타이틀곡이 수록됩니다.",
  },
  "news.nw3.p3": {
    en: "Pre-saves for the digital album and collector photocard packages will open this Friday across all supported streaming platforms.",
    fa: "پیش‌ذخیرهٔ دیجیتال آلبوم و بسته‌های ویژهٔ فتوکارت کالکتور از روز جمعه روی تمامی پلتفرم‌های استریم در دسترس قرار می‌گیرد.",
    ko: "디지털 앨범 프리세이브와 한정판 포토카드 패키지 예약 판매는 이번 주 금요일부터 시작됩니다.",
  },
  "news.nw4.title": {
    en: "PRISM9 add three dates to the Asia leg",
    fa: "PRISM9 سه تاریخ به بخش آسیایی اضافه کرد",
    ko: "PRISM9, 아시아 투어 3회 추가",
  },
  "news.nw4.excerpt": {
    en: "Manila, Bangkok and Jakarta join the run after two sold-out nights in Tokyo.",
    fa: "بعد از دو شب فروش‌رفته در توکیو، مانیل، بانکوک و جاکارتا هم به تور اضافه شدند.",
    ko: "도쿄에서 두 번 매진된 뒤 마닐라·방콕·자카르타가 일정에 합류했어요.",
  },
  "news.nw4.p1": {
    en: "Following instantaneous sell-outs for both Tokyo stadium dates, PRISM9's management confirmed three additional arena shows across Southeast Asia.",
    fa: "در پی فروش رفتن تمام بلیت‌های هر دو شب استادیوم توکیو در چند دقیقه، مدیریت PRISM9 سه اجرای جدید در سالن‌های بزرگ جنوب شرق آسیا اعلام کرد.",
    ko: "도쿄 스타디움 공연 2회가 초고속 매진을 기록함에 따라, PRISM9 측은 동남아시아 아레나 투어 3회 추가 일정을 확정했습니다.",
  },
  "news.nw4.p2": {
    en: "New stops in Manila, Bangkok, and Jakarta have been officially slated for December, meeting overwhelming demand from international fandoms.",
    fa: "توقف‌های جدید در مانیل، بانکوک و جاکارتا برای ماه دسامبر برنامه‌ریزی شده‌اند تا پاسخگوی اشتیاق بالای فندوم‌های بین‌المللی باشند.",
    ko: "마닐라, 방콕, 자카르타 공연이 오는 12월로 정식 편성되어 글로벌 팬들의 열렬한 성원에 화답할 예정입니다.",
  },
  "news.nw4.p3": {
    en: "Ticketing details and special fanclub pre-sale windows are scheduled to be revealed on the tour portal later this week.",
    fa: "جزئیات بلیت‌فروشی و مهلت پیش‌خرید ویژهٔ فندوم رسمی در اواخر همین هفته در پورتال تور منتشر خواهد شد.",
    ko: "티켓 예매 안내 및 공식 팬클럽 선예매 일정은 이번 주 후반 투어 전용 포털을 통해 공지됩니다.",
  },
  "news.nw5.title": {
    en: "FAIMESS Weekly: the 10 fastest-rising debuts",
    fa: "هفته‌نامهٔ فیمس: ۱۰ دبیوی سریع‌ترین رشد",
    ko: "FAIMESS 위클리: 가장 빠르게 뜬 데뷔 10팀",
  },
  "news.nw5.excerpt": {
    en: "Our editors rank the rookies whose first week lit up the fire counter.",
    fa: "تحریریه تازه‌واردهایی را رتبه‌بندی کرده که هفتهٔ اولشان شمارندهٔ فایر را روشن کرد.",
    ko: "첫 주에 불 카운터를 밝힌 루키들을 에디터가 정리했어요.",
  },
  "news.nw5.p1": {
    en: "Our editorial desk combed through streaming velocity, community discussions, and fire engagement counters to curate this season's top ten rookie debuts.",
    fa: "میز تحریریهٔ ما با بررسی شتاب استریم، گفتگوهای فعال هواداران و شمارندهٔ فایر، ده دبیوی برتر و پرشتاب این فصل را رتبه‌بندی کرده است.",
    ko: "에디토리얼 데스크가 스트리밍 속도, 커뮤니티 토론, 파이어 반응을 종합 분석하여 이번 시즌 가장 눈부신 신인 데뷔 10팀을 엄선했습니다.",
  },
  "news.nw5.p2": {
    en: "From genre-bending choreography to bold, self-produced soundscapes, these emerging artists represent the vanguard of the next K-pop era.",
    fa: "از طراحی رقص‌های نوآورانه تا صداگذاری‌های جسورانهٔ خودساخته، این آرتیست‌های نوظهور طلایه‌داران عصر آیندهٔ کی‌پاپ هستند.",
    ko: "장르를 넘나드는 퍼포먼스부터 당찬 자체 프로듀싱까지, 차세대 K-pop을 이끌어갈 신예들의 매력을 깊이 있게 조명합니다.",
  },
  "news.nw5.p3": {
    en: "Explore the complete curated playlist and hear editorial commentary tracks inside the FAIMESS Discover hub today.",
    fa: "پلی‌لیست کامل این برگزیدگان را به همراه یادداشت‌های تحریریه همین امروز در بخش کشف FAIMESS بشنوید.",
    ko: "에디터 코멘터리가 담긴 엄선 플레이리스트를 지금 바로 FAIMESS 발견 탭에서 만나보세요.",
  },
  "news.nw6.title": {
    en: "Fan-voted awards: voting opens tonight",
    fa: "جوایز با رأی هواداران: رأی‌گیری امشب آغاز می‌شود",
    ko: "팬 투표 어워즈: 오늘 밤 투표 시작",
  },
  "news.nw6.excerpt": {
    en: "Six categories, seven days of voting, and a live stage for the winners.",
    fa: "شش بخش، هفت روز رأی‌گیری و اجرای زندهٔ برندگان.",
    ko: "6개 부문, 7일간의 투표, 그리고 수상자를 위한 라이브 무대.",
  },
  "news.nw6.p1": {
    en: "The annual FAIMESS Fan-Voted Music Awards officially open voting booths tonight, welcoming ballots from listeners across over one hundred territories.",
    fa: "جوایز سالانهٔ موسیقی FAIMESS با رأی مستقیم طرفداران امشب رسماً درهای رأی‌گیری را به روی شنوندگان از بیش از صد کشور می‌گشاید.",
    ko: "FAIMESS 연례 팬 투표 뮤직 어워즈가 오늘 밤 전 세계 100여 개 지역 리스너들의 참여 속에 본격적인 투표를 시작합니다.",
  },
  "news.nw6.p2": {
    en: "With six fiercely contested categories including Artist of the Year, Best Collab, and Viral Stage, votes will remain open for exactly seven days.",
    fa: "با شش دسته‌بندی رقابتی داغ از جمله بهترین آرتیست سال، بهترین همکاری و استیج وایرال، رقابت به مدت هفت روز ادامه خواهد داشت.",
    ko: "올해의 아티스트, 베스트 콜라보, 바이럴 스테이지 등 치열한 6개 부문에 걸쳐 앞으로 7일 동안 투표가 진행됩니다.",
  },
  "news.nw6.p3": {
    en: "Winners will be crowned during a spectacular gala showcase featuring special collaborative stages, broadcast in real time across the globe.",
    fa: "برندگان نهایی در یک مراسم ویژه با اجراهای مشترک شگفت‌انگیز تجلیل خواهند شد که به صورت زنده در سراسر جهان پخش می‌شود.",
    ko: "수상자들은 전 세계에 생중계되는 스페셜 컬래버레이션 갈라 쇼 무대에서 영예의 트로피를 안게 됩니다.",
  },

  /* ------------------------------ sign in ------------------------------ *
   *  The door, and the one account this demo knows.                     */
  "auth.title": { en: "Sign in", fa: "ورود", ko: "로그인" },
  "auth.subtitle": {
    en: "Your account is only needed for the things that belong to you: a comment, a follow, a playlist of your own.",
    fa: "حساب فقط برای کارهایی لازم است که مال خودت هستند: یک کامنت، یک فالو، پلی‌لیست خودت.",
    ko: "계정은 내 것인 활동에만 필요해요: 댓글, 팔로우, 나만의 플레이리스트.",
  },
  "auth.tabIn": { en: "Sign in", fa: "ورود", ko: "로그인" },
  "auth.tabUp": { en: "Create account", fa: "ایجاد حساب", ko: "계정 만들기" },
  "auth.upTitle": { en: "Create an account", fa: "ساخت حساب کاربری", ko: "계정 만들기" },
  "auth.upSubtitle": {
    en: "A name and a password, and the comment box, the follow button and your own playlists open up.",
    fa: "یک نام و یک گذرواژه — و کادر کامنت، دکمهٔ فالو و پلی‌لیست‌های خودت باز می‌شوند.",
    ko: "이름과 비밀번호만 있으면 댓글창, 팔로우 버튼, 내 플레이리스트가 열려요.",
  },
  "auth.newUser": { en: "Choose a username", fa: "یک نام کاربری انتخاب کن", ko: "사용자 이름 정하기" },
  "auth.newPassword": { en: "Choose a password", fa: "یک گذرواژه انتخاب کن", ko: "비밀번호 정하기" },
  "auth.upRules": {
    en: "At least {n} characters for the name and {m} for the password.",
    fa: "دست‌کم {n} نویسه برای نام و {m} نویسه برای گذرواژه.",
    ko: "이름은 {n}자, 비밀번호는 {m}자 이상이어야 해요.",
  },
  "auth.upSubmit": { en: "Create and sign in", fa: "ساخت حساب و ورود", ko: "만들고 로그인" },
  "auth.upWorking": { en: "Making it…", fa: "در حال ساخت…", ko: "만드는 중…" },
  "auth.upLocal": {
    en: "No backend here: the account is written to this browser's local storage and never sent anywhere. It stays until you clear the site's data.",
    fa: "بک‌اندی در کار نیست: حساب در حافظهٔ محلی همین مرورگر نوشته می‌شود و جایی فرستاده نمی‌شود. تا وقتی دادهٔ سایت را پاک نکنی می‌ماند.",
    ko: "백엔드가 없어서 계정은 이 브라우저의 로컬 스토리지에만 저장돼요. 사이트 데이터를 지우기 전까지 유지됩니다.",
  },
  "auth.nameShort": {
    en: "That name is too short.",
    fa: "این نام کاربری کوتاه است.",
    ko: "사용자 이름이 너무 짧아요.",
  },
  "auth.nameTaken": {
    en: "That name is taken.",
    fa: "این نام کاربری گرفته شده است.",
    ko: "이미 사용 중인 이름이에요.",
  },
  "auth.nameTakenHint": {
    en: "\"{demo}\" is the demo account — pick another name, or sign in with it.",
    fa: "«{demo}» حساب دموست — نام دیگری انتخاب کن، یا با همان وارد شو.",
    ko: "\"{demo}\"는 데모 계정이에요 — 다른 이름을 고르거나 그 계정으로 로그인하세요.",
  },
  "auth.passwordShort": {
    en: "That password is too short.",
    fa: "این گذرواژه کوتاه است.",
    ko: "비밀번호가 너무 짧아요.",
  },
  "auth.gateTitle": { en: "An account is needed here", fa: "این‌جا حساب لازم است", ko: "여기서는 계정이 필요해요" },
  "auth.resume": {
    en: "Sign in and this goes through by itself — you do not have to start over.",
    fa: "وارد شو و همین کار خودش انجام می‌شود — لازم نیست از اول شروع کنی.",
    ko: "로그인하면 하던 일이 그대로 이어져요.",
  },
  "auth.user": { en: "Username", fa: "نام کاربری", ko: "사용자 이름" },
  "auth.password": { en: "Password", fa: "گذرواژه", ko: "비밀번호" },
  "auth.userPlaceholder": { en: "admin", fa: "admin", ko: "admin" },
  "auth.passwordPlaceholder": { en: "••••••", fa: "••••••", ko: "••••••" },
  "auth.show": { en: "Show", fa: "نمایش", ko: "보기" },
  "auth.hide": { en: "Hide", fa: "پنهان", ko: "숨기기" },
  "auth.showPassword": { en: "Show the password", fa: "نمایش گذرواژه", ko: "비밀번호 보기" },
  "auth.hidePassword": { en: "Hide the password", fa: "پنهان کردن گذرواژه", ko: "비밀번호 숨기기" },
  "auth.submit": { en: "Sign in", fa: "ورود", ko: "로그인" },
  "auth.working": { en: "Signing in…", fa: "در حال ورود…", ko: "로그인 중…" },
  "auth.welcome": { en: "Welcome back, {name}", fa: "خوش برگشتی {name}", ko: "다시 오셨네요, {name}" },
  "auth.badUser": {
    en: "No account by that name.",
    fa: "حسابی با این نام کاربری نیست.",
    ko: "그런 사용자 이름의 계정이 없어요.",
  },
  "auth.badPassword": {
    en: "That password is not right.",
    fa: "گذرواژه درست نیست.",
    ko: "비밀번호가 맞지 않아요.",
  },
  "auth.errorTitle": { en: "Check the details", fa: "مشخصات را بررسی کن", ko: "입력값을 확인해 주세요" },
  "auth.demoTitle": { en: "Demo account", fa: "حساب دمو", ko: "데모 계정" },
  "auth.demoBody": {
    en: "A demo build has no backend. The door is one username and one password:",
    fa: "بیلد دمو بک‌اند ندارد. در ورودی یک نام کاربری و یک گذرواژه است:",
    ko: "데모 빌드에는 백엔드가 없어요. 계정은 하나입니다:",
  },
  "auth.fill": { en: "Use the demo account", fa: "پر کردن با حساب دمو", ko: "데모 계정으로 채우기" },
  "auth.footnote": {
    en: "Nothing leaves this browser — the session is kept in local storage.",
    fa: "هیچ‌چیز از مرورگر بیرون نمی‌رود — نشست در حافظهٔ محلی ذخیره می‌شود.",
    ko: "모든 정보는 이 브라우저에만 있어요 — 세션은 로컬 스토리지에 저장됩니다.",
  },
  "auth.role": { en: "Administrator · Demo build", fa: "مدیر · بیلد دمو", ko: "관리자 · 데모 빌드" },

  /* ---------------------- what the door stands in front of -------------- *
   *  One line per action that needs an account. The door prints the one
   *  that fits, so nobody is asked to sign in "for no reason".          */
  "gate.follow": {
    en: "Follow an artist, and the news and the new releases reach you.",
    fa: "برای فالو کردن آرتیست — تا خبر و انتشارهای تازه به دستت برسد.",
    ko: "아티스트를 팔로우하려면 계정이 필요해요.",
  },
  "gate.unfollow": {
    en: "Unfollow an artist.",
    fa: "برای لغو فالو یک آرتیست.",
    ko: "아티스트 팔로우를 취소하려면 계정이 필요해요.",
  },
  "gate.comment": {
    en: "Write a comment on a track.",
    fa: "برای نوشتن کامنت روی یک ترک.",
    ko: "트랙에 댓글을 남기려면 계정이 필요해요.",
  },
  "gate.reply": {
    en: "Reply to a comment.",
    fa: "برای پاسخ دادن به یک کامنت.",
    ko: "댓글에 답글을 달려면 계정이 필요해요.",
  },
  "gate.lyrics": {
    en: "Send the lyrics of a track — the moderators review them, and points come back.",
    fa: "برای فرستادن لیریک یک ترک — مدیران بررسی می‌کنند و امتیاز برمی‌گردد.",
    ko: "가사의 번역을 보내려면 계정이 필요해요. 검수 후 포인트가 쌓여요.",
  },
  "gate.playlist": {
    en: "Keep a playlist of your own.",
    fa: "برای ساختن و نگه‌داشتن پلی‌لیست خودت.",
    ko: "나만의 플레이리스트를 만들려면 계정이 필요해요.",
  },
  "gate.like": {
    en: "Save a track to your liked songs.",
    fa: "برای ذخیرهٔ یک ترک در آهنگ‌های پسندیده.",
    ko: "좋아요한 곡에 저장하려면 계정이 필요해요.",
  },
  "gate.invite": {
    en: "Answer a collaboration invite.",
    fa: "برای پاسخ دادن به دعوت همکاری.",
    ko: "협업 초대에 답하려면 계정이 필요해요.",
  },

  /* signing out asks first — it is the one destructive thing in the menu */
  "account.guest": { en: "Guest", fa: "مهمان", ko: "게스트" },
  "account.guestBody": {
    en: "You are reading the demo without an account. Everything is open — the account is only asked for when you comment, follow or keep a playlist.",
    fa: "داری دمو را بدون حساب می‌بینی. همه‌چیز باز است — حساب فقط وقتی خواسته می‌شود که کامنت بگذاری، فالو کنی یا پلی‌لیست بسازی.",
    ko: "계정 없이 데모를 보고 있어요. 댓글·팔로우·플레이리스트 때만 계정을 요청해요.",
  },
  "account.enter": { en: "Sign in / create account", fa: "ورود / ایجاد حساب", ko: "로그인 / 계정 만들기" },
  "account.signOutTitle": { en: "Sign out of FAIMESS?", fa: "از فیمس خارج شوی؟", ko: "FAIMESS에서 로그아웃할까요?" },
  "account.signOutBody": {
    en: "Your playlists and points stay on this device; the door locks behind you.",
    fa: "پلی‌لیست‌ها و امتیازهایت روی همین دستگاه می‌مانند؛ فقط در بسته می‌شود.",
    ko: "플레이리스트와 포인트는 기기에 남아 있어요. 문만 잠깁니다.",
  },
  "account.signOutConfirm": { en: "Sign out", fa: "خروج", ko: "로그아웃" },
  "account.signOutCancel": { en: "Stay signed in", fa: "بمان در حساب", ko: "로그인 유지" },
  "account.signedOut": { en: "Signed out", fa: "خارج شدی", ko: "로그아웃했어요" },

  /* --------------------- labels that live in the data ------------------ *
   *  The data files carry these words in English — an artist is a “Boy
   *  group”, a playlist is “Mellow”, a track landed “2 hrs ago”. They are
   *  chrome, not content: they describe a record, so they have to follow
   *  the interface language like every other string in this table.
   *  `tData()` below is the single door for them.                        */

  "kind.boyGroup": { en: "Boy group", fa: "گروه پسرانه", ko: "보이그룹" },
  "kind.girlGroup": { en: "Girl group", fa: "گروه دخترانه", ko: "걸그룹" },
  "kind.soloist": { en: "Soloist", fa: "تک‌خوان", ko: "솔로" },
  "kind.duo": { en: "Duo", fa: "دونفره", ko: "듀오" },

  "genre.electroPop": { en: "Electro pop", fa: "الکترو پاپ", ko: "일렉트로 팝" },
  "genre.altRnb": { en: "Alt R&B", fa: "آراندبی آلترنیتیو", ko: "앨트 R&B" },
  "genre.hipHop": { en: "Hip-hop", fa: "هیپ‌هاپ", ko: "힙합" },
  "genre.synthPop": { en: "Synth pop", fa: "سینث‌پاپ", ko: "신스 팝" },
  "genre.dancePop": { en: "Dance pop", fa: "دنس‌پاپ", ko: "댄스 팝" },
  "genre.cityPop": { en: "City pop", fa: "سیتی‌پاپ", ko: "시티팝" },
  "genre.ballad": { en: "Ballad", fa: "بالاد", ko: "발라드" },

  "mood.mellow": { en: "Mellow", fa: "ملایم", ko: "멜로우" },
  "mood.hype": { en: "Hype", fa: "پرهیجان", ko: "하입" },
  "mood.sunny": { en: "Sunny", fa: "آفتابی", ko: "햇살" },
  "mood.soft": { en: "Soft", fa: "آرام", ko: "소프트" },
  "mood.ambient": { en: "Ambient", fa: "محیطی", ko: "앰비언트" },
  "mood.warm": { en: "Warm", fa: "گرم", ko: "따뜻함" },

  /* how big an artist is — the number stays, the unit follows the language */
  "artist.monthly": {
    en: "{n} monthly listeners",
    fa: "{n} شنوندهٔ ماهانه",
    ko: "월간 리스너 {n}",
  },
  "artist.monthlyK": {
    en: "{n}K monthly listeners",
    fa: "{n} هزار شنوندهٔ ماهانه",
    ko: "월간 리스너 {n}K",
  },
  "artist.monthlyM": {
    en: "{n}M monthly listeners",
    fa: "{n} میلیون شنوندهٔ ماهانه",
    ko: "월간 리스너 {n}M",
  },
  "artist.followers": {
    en: "{n} followers",
    fa: "{n} دنبال‌کننده",
    ko: "팔로워 {n}",
  },
  "artist.followersK": {
    en: "{n}K followers",
    fa: "{n} هزار دنبال‌کننده",
    ko: "팔로워 {n}K",
  },
  "artist.followersM": {
    en: "{n}M followers",
    fa: "{n} میلیون دنبال‌کننده",
    ko: "팔로워 {n}M",
  },

  /* how long ago something landed — a line per unit, one and many */
  "ago.justNow": { en: "just now", fa: "همین حالا", ko: "방금" },
  "ago.today": { en: "today", fa: "امروز", ko: "오늘" },
  "ago.yesterday": { en: "yesterday", fa: "دیروز", ko: "어제" },
  "ago.minutes": { en: "{n} min ago", fa: "{n} دقیقه پیش", ko: "{n}분 전" },
  "ago.hour": { en: "1 hr ago", fa: "۱ ساعت پیش", ko: "1시간 전" },
  "ago.hours": { en: "{n} hrs ago", fa: "{n} ساعت پیش", ko: "{n}시간 전" },
  "ago.day": { en: "1 day ago", fa: "۱ روز پیش", ko: "1일 전" },
  "ago.days": { en: "{n} days ago", fa: "{n} روز پیش", ko: "{n}일 전" },
  "ago.week": { en: "1 week ago", fa: "۱ هفته پیش", ko: "1주 전" },
  "ago.weeks": { en: "{n} weeks ago", fa: "{n} هفته پیش", ko: "{n}주 전" },
  "ago.month": { en: "1 month ago", fa: "۱ ماه پیش", ko: "1개월 전" },
  "ago.months": { en: "{n} months ago", fa: "{n} ماه پیش", ko: "{n}개월 전" },

  /* 3h 12m — a playlist's length */
  "time.hoursMinutes": { en: "{h}h {m}m", fa: "{h} ساعت و {m} دقیقه", ko: "{h}시간 {m}분" },

  /* the fan cards: level and streak */
  "fans.level": { en: "Lv {n}", fa: "سطح {n}", ko: "Lv {n}" },
  "fans.streak": { en: "{n}d", fa: "{n} روز", ko: "{n}일" },
  /* a track whose record field reads “Afterimage · single” — one-offs */
  "release.singleFrom": { en: "{name} · single", fa: "{name} · تک‌آهنگ", ko: "{name} · 싱글" },

  /* short counts: the digits are the number, this is its magnitude */
  "num.thousand": { en: "K", fa: "هزار", ko: "K" },
  "num.million": { en: "M", fa: "میلیون", ko: "M" },

  /* a date as the demo's cards and chat stamps write it */
  "date.dayMonth": { en: "{day} {month}", fa: "{day} {month}", ko: "{day} {month}" },
  "msg.stamp": { en: "{day} {month} · {time}", fa: "{day} {month} · {time}", ko: "{day} {month} · {time}" },
  "msg.online": { en: "Online", fa: "آنلاین", ko: "온라인" },

  /* the week, short and long — chat stamps and the calendar both use it */
  "weekday.monday": { en: "Monday", fa: "دوشنبه", ko: "월요일" },
  "weekday.tuesday": { en: "Tuesday", fa: "سه‌شنبه", ko: "화요일" },
  "weekday.wednesday": { en: "Wednesday", fa: "چهارشنبه", ko: "수요일" },
  "weekday.thursday": { en: "Thursday", fa: "پنجشنبه", ko: "목요일" },
  "weekday.friday": { en: "Friday", fa: "جمعه", ko: "금요일" },
  "weekday.saturday": { en: "Saturday", fa: "شنبه", ko: "토요일" },
  "weekday.sunday": { en: "Sunday", fa: "یکشنبه", ko: "일요일" },

  /* the Gregorian months the demo dates name */
  "month.jan": { en: "Jan", fa: "ژانویه", ko: "1월" },
  "month.feb": { en: "Feb", fa: "فوریه", ko: "2월" },
  "month.mar": { en: "Mar", fa: "مارس", ko: "3월" },
  "month.apr": { en: "Apr", fa: "آپریل", ko: "4월" },
  "month.may": { en: "May", fa: "مه", ko: "5월" },
  "month.jun": { en: "Jun", fa: "ژوئن", ko: "6월" },
  "month.jul": { en: "Jul", fa: "جولای", ko: "7월" },
  "month.aug": { en: "Aug", fa: "اوت", ko: "8월" },
  "month.sep": { en: "Sep", fa: "سپتامبر", ko: "9월" },
  "month.oct": { en: "Oct", fa: "اکتبر", ko: "10월" },
  "month.nov": { en: "Nov", fa: "نوامبر", ko: "11월" },
  "month.dec": { en: "Dec", fa: "دسامبر", ko: "12월" },

  /* the comments sheet, and the points a sheet pays out */
  "comments.shown": {
    en: "{shown} of {total} shown",
    fa: "{shown} از {total} نمایش داده شده",
    ko: "{total}개 중 {shown}개 표시",
  },
  "contrib.pts": { en: "+{n} pts", fa: "{n}+ امتیاز", ko: "+{n} 포인트" },
  "lyrics.lang.mixed": { en: "Mixed", fa: "ترکیبی", ko: "혼합" },
  "lyrics.lang.english": { en: "English", fa: "انگلیسی", ko: "영어" },
  "lyrics.lang.korean": { en: "한국어", fa: "کره‌ای", ko: "한국어" },

  /* the trend arrow on a trending row */
  "shelf.delta": { en: "+{n}%", fa: "{n}٪ رشد", ko: "+{n}%" },
  "shelf.range24h": { en: "24h", fa: "۲۴ ساعت", ko: "24시간" },
  "shelf.rangeWeek": { en: "Week", fa: "هفته", ko: "주간" },
  "shelf.addToLibrary": {
    en: "Add {title} to your library",
    fa: "افزودن «{title}» به کتابخانه",
    ko: "“{title}”을(를) 라이브러리에 추가",
  },
  "shelf.fireAria": { en: "Fire {title}", fa: "فایر دادن به «{title}»", ko: "“{title}”에 불 누르기" },
  "points.shortHours": { en: "{n}h", fa: "{n} ساعت", ko: "{n}시간" },
  "points.shortDays": { en: "{n}d", fa: "{n} روز", ko: "{n}일" },
  "page.follow": { en: "Follow", fa: "دنبال کن", ko: "팔로우" },
  "page.following": { en: "Following", fa: "دنبال می‌کنی", ko: "팔로잉" },

  /* the news desk's own names, and the labels of its sources */
  "news.source.desk": { en: "FAIMESS Desk", fa: "میز فیمس", ko: "FAIMESS 데스크" },
  "news.source.chartWatch": { en: "Chart Watch", fa: "رصد چارت", ko: "차트 워치" },
  "news.source.liveWire": { en: "Live Wire", fa: "لایو وایر", ko: "라이브 와이어" },
  "news.source.weekly": { en: "FAIMESS Weekly", fa: "هفته‌نامهٔ فیمس", ko: "FAIMESS 위클리" },

  /* the account's own line, under the name in the profile menu */
  "account.tier.premium": { en: "Listener · Premium", fa: "شنونده · پریمیوم", ko: "리스너 · 프리미엄" },

  /* the crests a fan (or an artist) wears on their avatar */
  "badge.topListener": { en: "Top listener · Season 12", fa: "بهترین شنونده · فصل ۱۲", ko: "톱 리스너 · 시즌 12" },
  "badge.chart": { en: "Weekly chart #1", fa: "شمارهٔ ۱ چارت هفتگی", ko: "주간 차트 1위" },
  "badge.fanOfMonth": { en: "Fan of the month", fa: "هوادار ماه", ko: "이달의 팬" },
  "badge.streak": { en: "30-day comeback streak", fa: "۳۰ روز پیگیری کمبک", ko: "30일 컴백 스트릭" },
  "badge.artist": { en: "Verified artist", fa: "هنرمند تأییدشده", ko: "인증 아티스트" },
  "badge.moderator": { en: "Community moderator", fa: "مدیر انجمن", ko: "커뮤니티 모더레이터" },
  "badge.rookie": { en: "Rookie of the week", fa: "تازه‌وارد هفته", ko: "이주의 루키" },

  /* the notification tray — the demo data names the three kinds */
  "notif.newsPublished": {
    en: "New Story: {title}",
    fa: "خبر جدید: {title}",
    ko: "새 뉴스: {title}",
  },
  "notif.newsTrending": {
    en: "Trending: {title}",
    fa: "خبر داغ: {title}",
    ko: "인기 뉴스: {title}",
  },
  "notif.newSong": {
    en: "New Track: {artist} released “{title}”",
    fa: "آهنگ جدید: {artist} قطعهٔ «{title}» را منتشر کرد",
    ko: "새 곡: {artist}의 신곡 “{title}” 발매",
  },
  "notif.newAlbum": {
    en: "New Album: {artist} dropped “{title}”",
    fa: "آلبوم جدید: {artist} آلبوم «{title}» را منتشر کرد",
    ko: "새 앨범: {artist}의 새 앨범 “{title}” 발매",
  },
  "notif.newPlaylist": {
    en: "New Playlist: “{name}” is now available",
    fa: "پلی‌لیست جدید: «{name}» اکنون در دسترس است",
    ko: "새 플레이리스트: “{name}” 공개",
  },
  "notif.commentReply": {
    en: "{user} replied to your comment on “{title}”",
    fa: "{user} به دیدگاه شما در «{title}» پاسخ داد",
    ko: "{user}님이 “{title}”의 내 댓글에 답글을 남겼어요",
  },
  "notif.lyricsApproved": {
    en: "Your lyrics for “{title}” were approved (+50 pts)!",
    fa: "لیریک ارسالی شما برای «{title}» تأیید شد (+۵۰ امتیاز)!",
    ko: "“{title}” 가사 등록이 승인되었어요 (+50점)!",
  },
  "notif.pointsEarned": {
    en: "You earned +{points} fan points: {reason}",
    fa: "شما +{points} امتیاز دریافت کردید: {reason}",
    ko: "+{points} 팬 포인트를 획득했어요: {reason}",
  },
  "notif.markAllRead": {
    en: "Mark all as read",
    fa: "خواندن همه",
    ko: "모두 읽음",
  },
  "notif.empty": {
    en: "No new notifications",
    fa: "اعلان جدیدی وجود ندارد",
    ko: "새 알림이 없습니다",
  },
  "notif.release": {
    en: "{artist} released “{title}”",
    fa: "{artist} «{title}» را منتشر کرد",
    ko: "{artist}이(가) “{title}”을(를) 발표했어요",
  },
  "notif.mixReady": {
    en: "Your mix of the week is ready",
    fa: "میکس این هفته‌ات آماده است",
    ko: "이번 주 믹스가 준비됐어요",
  },
  "notif.tracksAdded": {
    en: "{n} tracks added to “{name}”",
    fa: "{n} آهنگ به «{name}» اضافه شد",
    ko: "“{name}”에 {n}곡을 추가했어요",
  },

  /* --------------------------- admin portal --------------------------- */
  "admin.console": { en: "Admin Console", fa: "پنل مدیریت کل", ko: "관리자 콘솔" },
  "admin.title": { en: "FAIMESS Studio Admin", fa: "پنل مدیریت کل فیمس", ko: "FAIMESS 스튜디오 관리자" },
  "admin.subtitle": {
    en: "Centralized control panel for catalog, editorial desk, moderation & users",
    fa: "مرکز فرماندهی، مدیریت کاتالوگ موسیقی، تحریریه خبر، نظارت و کاربران",
    ko: "음악 카탈로그, 뉴스 에디토리얼, 커뮤니티 관리 및 사용자 통합 제어 센터",
  },
  "admin.tab.overview": { en: "Overview", fa: "داشبورد و آمار", ko: "개요 및 통계" },
  "admin.tab.tracks": { en: "Tracks & Songs", fa: "آهنگ‌ها و قطعات", ko: "트랙 및 곡 관리" },
  "admin.tab.artists": { en: "Artists", fa: "هنرمندان و گروه‌ها", ko: "آتیست‌ها و گروه‌ها" },
  "admin.tab.albums": { en: "Albums", fa: "آلبوم‌ها", ko: "앨범 관리" },
  "admin.tab.news": { en: "News & Stories", fa: "اخبار و تحریریه", ko: "뉴스 및 기사" },
  "admin.tab.moderation": { en: "Community & Lyrics", fa: "دیدگاه‌ها و لیریک", ko: "커뮤니티 및 가사 검수" },
  "admin.tab.shop": { en: "Shop & Merch", fa: "فروشگاه و موجودی", ko: "상점 및 굿즈" },
  "admin.tab.users": { en: "Users & RBAC", fa: "کاربران و دسترسی‌ها", ko: "사용자 및 권한" },
  "admin.quickActions": { en: "Quick Actions", fa: "اقدامات سریع", ko: "빠른 작업" },
  "admin.action.addTrack": { en: "Add Song", fa: "افزودن آهنگ جدید", ko: "새 곡 추가" },
  "admin.action.addArtist": { en: "Add Artist", fa: "افزودن هنرمند", ko: "아티스트 등록" },
  "admin.action.addNews": { en: "Write Article", fa: "نگارش خبر جدید", ko: "새 기사 작성" },
  "admin.action.addProduct": { en: "Add Merch Item", fa: "افزودن محصول جدید", ko: "새 굿즈 등록" },
  "admin.searchPlaceholder": {
    en: "Search records by title, name or ID...",
    fa: "جستجو در رکوردها بر اساس نام، عنوان یا شناسه...",
    ko: "제목, 이름 또는 ID로 검색...",
  },
  "admin.stat.streams": { en: "Total Streams", fa: "مجموع استریم‌ها", ko: "총 스트리밍 수" },
  "admin.stat.listeners": { en: "Active Today", fa: "شنوندگان فعال امروز", ko: "오늘의 활성 청취자" },
  "admin.stat.reported": { en: "Reported Comments", fa: "دیدگاه‌های گزارش‌شده", ko: "신고된 댓글" },
  "admin.stat.pendingLyrics": { en: "Pending Lyrics Sheets", fa: "لیریک‌های در انتظار تایید", ko: "검토 대기 가사" },
  "admin.stat.revenue": { en: "Merch Sales Est.", fa: "تخمین فروش مرچ (تومان)", ko: "예상 굿즈 매출" },
  "admin.stat.users": { en: "Total Accounts", fa: "کل کاربران ثبت‌نامی", ko: "총 등록 사용자" },
  "admin.loginPrompt": { en: "Super Admin Authentication", fa: "احراز هویت مدیریت کل", ko: "최고 관리자 인증" },
  "admin.loginDesc": {
    en: "Access to the FAIMESS core administrative console is restricted to authorized staff.",
    fa: "ورود به مرکز کنترل و مدیریت فیمس ویژه مدیران ارشد و کادر مدیریت است.",
    ko: "FAIMESS 관리 콘솔 접근은 승인된 관리자에게만 제한됩니다.",
  },
  "admin.fastLogin": {
    en: "Instant Demo Admin Access",
    fa: "ورود سریع با اکانت پیش‌فرض ادمین (admin / admin)",
    ko: "기본 관리자 계정으로 빠른 로그인 (admin / admin)",
  },
  "admin.loginButton": { en: "Enter Admin Console", fa: "ورود به پنل مدیریت", ko: "관리 콘솔 입장" },
  "admin.exitConsole": { en: "Back to App", fa: "بازگشت به سایت", ko: "앱으로 돌아가기" },
  "admin.save": { en: "Save changes", fa: "ذخیره تغییرات", ko: "변경사항 저장" },
  "admin.cancel": { en: "Cancel", fa: "انصراف", ko: "취소" },
  "admin.delete": { en: "Delete", fa: "حذف", ko: "삭제" },
  "admin.edit": { en: "Edit", fa: "ویرایش", ko: "수정" },
  "admin.approve": { en: "Approve", fa: "تایید و انتشار", ko: "승인 및 게시" },
  "admin.dismiss": { en: "Dismiss report", fa: "رد گزارش", ko: "신고 기각" },
  "admin.savedToast": { en: "Changes saved successfully", fa: "تغییرات با موفقیت ذخیره شد", ko: "변경사항이 성공적으로 저장되었습니다" },
  "admin.deletedToast": { en: "Item deleted successfully", fa: "مورد با موفقیت حذف شد", ko: "항목이 성공적으로 삭제되었습니다" },
  "admin.auditLog": { en: "Real-time System Audit Log", fa: "لاگ زنده و تاریخچه عملیات سیستم", ko: "실시간 시스템 감사 로그" },
  "admin.role.superAdmin": { en: "Super Admin", fa: "مدیر ارشد کل", ko: "최고 관리자" },
  "admin.role.moderator": { en: "Moderator", fa: "ناظر محتوا", ko: "운영자" },
  "admin.role.editor": { en: "Editor", fa: "تحریریه", ko: "에디터" },
  "admin.role.user": { en: "Fan User", fa: "کاربر عادی", ko: "일반 사용자" },
  "admin.status.active": { en: "Active", fa: "فعال", ko: "활성" },
  "admin.status.suspended": { en: "Suspended", fa: "مسدود", ko: "정지" },
  "admin.resetDb": { en: "Reset to seed data", fa: "بازنشانی دیتابیس به داده‌های اولیه", ko: "초기 데이터로 재설정" },
  "admin.restricted": { en: "Super Admin Restricted", fa: "دسترسی مدیریت ارشد محدود است", ko: "최고 관리자 전용" },
  "admin.restrictedDesc": { en: "You must be signed in with a Super Admin or Staff account to view the studio control panel.", fa: "برای دسترسی به پنل مدیریت کل استودیو باید با حساب مدیر وارد شوید.", ko: "스튜디오 제어판을 보려면 최고 관리자 계정으로 로그인해야 합니다." },
  "admin.statsTracks": { en: "Total Songs", fa: "کل آهنگ‌ها", ko: "총 트랙 수" },
  "admin.statsArtists": { en: "Artists", fa: "هنرمندان", ko: "아티스트" },
  "admin.statsAlbums": { en: "Albums", fa: "آلبوم‌ها", ko: "앨범" },
  "admin.statsStreams": { en: "Lifetime Streams", fa: "مجموع استریم‌ها", ko: "총 스트리밍" },
  "admin.statsRevenue": { en: "Estimated Revenue", fa: "ارزش برآورد شده", ko: "예상 매출" },
  "admin.statsModeration": { en: "Pending Review", fa: "در صف بررسی", ko: "검تو 대기" },
  "admin.recentActivity": { en: "Recent System Activity", fa: "فعالیت‌های اخیر سیستم", ko: "최근 시스템 활동" },
  "admin.addTrack": { en: "+ Add Song", fa: "+ افزودن آهنگ جدید", ko: "+ 새 곡 추가" },
  "admin.addArtist": { en: "+ Add Artist", fa: "+ افزودن هنرمند", ko: "+ 아티스트 등록" },
  "admin.publishNews": { en: "+ Publish Story", fa: "+ انتشار خبر", ko: "+ 기사 발행" },
  "admin.colTitle": { en: "Title", fa: "عنوان", ko: "제목" },
  "admin.colArtist": { en: "Artist", fa: "هنرمند", ko: "아티스트" },
  "admin.colAlbum": { en: "Album", fa: "آلبوم", ko: "앨범" },
  "admin.colDuration": { en: "Duration", fa: "مدت", ko: "재생 시간" },
  "admin.colPlays": { en: "Streams", fa: "پخش‌ها", ko: "스트림" },
  "admin.colActions": { en: "Actions", fa: "عملیات", ko: "작업" },
};

/** the shape `t()` takes — good enough for the handful of placeholders we use */
export type TVars = Record<string, string | number>;

/** the translator itself, as the providers and the helpers below hand it round */
export type Translate = (key: string, vars?: TVars) => string;

/** fill `{name}` holes; missing vars are left visible so they can't pass silently */
export function fill(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

/* ------------------------------------------------------------------ *
 *  Data labels — one table for the words the data files carry.
 *
 *  A data file says an artist is a “Boy group”, a playlist is “Mellow”
 *  and a track landed “2 hrs ago”; those words are chrome around content,
 *  so they are translated wherever they are shown instead of being left
 *  in English in the middle of a Persian page. The literals stay English
 *  in the data (they are the source of truth, like the `en` column here),
 *  and `tData()` maps them over:
 *
 *    tData(t, "Boy group", "fa")      → “گروه پسرانه”
 *    tData(t, "2 hrs ago", "fa")      → “۲ ساعت پیش”
 *    tData(t, "4.8M monthly", "fa")   → “۴.۸ میلیون شنوندهٔ ماهانه”
 *    tData(t, "3h 12m", "fa")         → “۳ ساعت و ۱۲ دقیقه”
 *    tData(t, "PRISM9", "fa")         → “PRISM9” (content is left alone)
 * ------------------------------------------------------------------ */

/** the fixed words: artist kinds, genres, playlist moods, news tags/sources, tier */
const LABEL_KEYS: Record<string, string> = {
  "Boy group": "kind.boyGroup",
  "Girl group": "kind.girlGroup",
  Soloist: "kind.soloist",
  Duo: "kind.duo",

  "Electro pop": "genre.electroPop",
  "Alt R&B": "genre.altRnb",
  "Hip-hop": "genre.hipHop",
  "Synth pop": "genre.synthPop",
  "Dance pop": "genre.dancePop",
  "City pop": "genre.cityPop",
  Ballad: "genre.ballad",

  Mellow: "mood.mellow",
  Hype: "mood.hype",
  Sunny: "mood.sunny",
  Soft: "mood.soft",
  Ambient: "mood.ambient",
  Warm: "mood.warm",

  Comeback: "news.tag.comeback",
  Tour: "news.tag.tour",
  Charts: "news.tag.charts",
  Awards: "news.tag.awards",
  Editorial: "news.tag.editorial",

  "FAIMESS Desk": "news.source.desk",
  "Chart Watch": "news.source.chartWatch",
  "Live Wire": "news.source.liveWire",
  "FAIMESS Weekly": "news.source.weekly",

  "Listener · Premium": "account.tier.premium",
  "Administrator · Demo build": "auth.role",

  Online: "msg.online",
  Mixed: "lyrics.lang.mixed",
  English: "lyrics.lang.english",
  "한국어": "lyrics.lang.korean",

  Sunday: "weekday.sunday",
  Sun: "weekday.sunday",
  Monday: "weekday.monday",
  Mon: "weekday.monday",
  Tuesday: "weekday.tuesday",
  Tue: "weekday.tuesday",
  Wednesday: "weekday.wednesday",
  Wed: "weekday.wednesday",
  Thursday: "weekday.thursday",
  Thu: "weekday.thursday",
  Friday: "weekday.friday",
  Fri: "weekday.friday",
  Saturday: "weekday.saturday",
  Sat: "weekday.saturday",
};

/** “4.8M monthly”, “1.4M monthly” … — the number and its magnitude */
const LISTENERS = /^([\d.,]+)\s*([KM])?\s*monthly$/i;
/** “2.4M followers”, “890K followers” … */
const FOLLOWERS = /^([\d.,]+)\s*([KM])?\s*followers?$/i;
/** “12 min ago”, “2 hrs ago”, “1 day ago”, “3 weeks ago” … */
const AGO = /^(\d+)\s*(min|mins|minute|minutes|hr|hrs|hour|hours|day|days|week|weeks|month|months)\s*ago$/i;
/** “3h 12m” — a playlist's running time */
const HOURS_MINUTES = /^(\d+)\s*h\s*(\d+)\s*m$/i;
/** “18.4K” / “1.2M” — an already-shortened count (see lib/format) */
const COMPACT = /^([\d.,]+)([KM])$/;
/** “11 Nov · 20:00 hrs”, “14 Dec” — the dates the demo data carries */
const STAMP = /^(\d{1,2})\s+([A-Za-z]{3,})\s*·\s*(\d{1,2}):(\d{2})(?:\s*(AM|PM))?(?:\s*hrs)?$/i;
const DAY_MONTH = /^(\d{1,2})\s+([A-Za-z]{3,})$/;
const MONTH_KEYS: Record<string, string> = {
  jan: "month.jan",
  feb: "month.feb",
  mar: "month.mar",
  apr: "month.apr",
  may: "month.may",
  jun: "month.jun",
  jul: "month.jul",
  aug: "month.aug",
  sep: "month.sep",
  oct: "month.oct",
  nov: "month.nov",
  dec: "month.dec",
};
/** “Afterimage · single” — the record field, with its release type */
const SINGLE_FROM = /^(.*\S)\s*·\s*single$/i;

/** unit → its plural key (the singular one is only used for a count of 1) */
const AGO_UNITS: Record<string, { key: string; one: string }> = {
  minute: { key: "ago.minutes", one: "ago.minutes" },
  hour: { key: "ago.hours", one: "ago.hour" },
  day: { key: "ago.days", one: "ago.day" },
  week: { key: "ago.weeks", one: "ago.week" },
  month: { key: "ago.months", one: "ago.month" },
};

/** “mins” → minute, “hrs” → hour … so the table above stays four lines */
const agoUnit = (unit: string) => {
  const bare = unit.toLowerCase().replace(/s$/, "");
  if (bare === "min") return "minute";
  if (bare === "hr") return "hour";
  return bare;
};

/** western digits → the digits the language actually writes (Persian: ۰–۹) */
export function localizeDigits(text: string, lang: Lang): string {
  if (lang !== "fa") return text;
  return text
    .replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
    /* 4.8 in Persian is written ۴٫۸ — the decimal separator is a comma */
    .replace(/\./g, "٫");
}

/**
 * Translate one label that came out of a data file. Anything that is not a
 * known label — a track title, an artist's name — is handed back untouched,
 * which is what keeps demo content in the language it was written in.
 */
export function tData(t: Translate, value: string | undefined, lang: Lang): string {
  const raw = (value ?? "").trim();
  if (!raw) return value ?? "";

  const known = LABEL_KEYS[raw];
  if (known) return t(known);

  /* “Afterimage · single” — the release type follows the language too */
  const single = raw.match(SINGLE_FROM);
  if (single) return t("release.singleFrom", { name: single[1] });

  /* “11 Nov · 20:00 hrs” and “14 Dec” — a day, a month and maybe a time */
  const stamp = raw.match(STAMP);
  if (stamp) {
    if (lang === "en") return raw;
    const [, day, month, hour, minute, meridiem] = stamp;
    const key = MONTH_KEYS[month.slice(0, 3).toLowerCase()];
    const h = Number(hour) + (meridiem?.toUpperCase() === "PM" && Number(hour) < 12 ? 12 : 0);
    const time = localizeDigits(`${String(h).padStart(2, "0")}:${minute}`, lang);
    return key
      ? t("msg.stamp", { day: Number(day), month: t(key), time })
      : raw;
  }
  const dayMonth = raw.match(DAY_MONTH);
  if (dayMonth) {
    const key = MONTH_KEYS[dayMonth[2].slice(0, 3).toLowerCase()];
    if (key) return t("date.dayMonth", { day: Number(dayMonth[1]), month: t(key) });
  }

  /* the two days that have a word of their own, and “just now” */
  const day = raw.toLowerCase();
  if (day === "just now") return t("ago.justNow");
  if (day === "today") return t("ago.today");
  if (day === "yesterday") return t("ago.yesterday");

  const listeners = raw.match(LISTENERS);
  if (listeners) {
    const [, digits, unit = ""] = listeners;
    const magnitude = unit.toUpperCase();
    const key = magnitude === "M" ? "artist.monthlyM" : magnitude === "K" ? "artist.monthlyK" : "artist.monthly";
    return t(key, { n: localizeDigits(digits, lang) });
  }

  const followers = raw.match(FOLLOWERS);
  if (followers) {
    const [, digits, unit = ""] = followers;
    const magnitude = unit.toUpperCase();
    const key = magnitude === "M" ? "artist.followersM" : magnitude === "K" ? "artist.followersK" : "artist.followers";
    return t(key, { n: localizeDigits(digits, lang) });
  }

  const ago = raw.match(AGO);
  if (ago) {
    const [, count, unit] = ago;
    const rule = AGO_UNITS[agoUnit(unit)];
    if (rule) return t(Number(count) === 1 ? rule.one : rule.key, { n: Number(count) });
  }

  const runtime = raw.match(HOURS_MINUTES);
  if (runtime) {
    const [, hours, minutes] = runtime;
    return t("time.hoursMinutes", { h: Number(hours), m: Number(minutes) });
  }

  /* a count that is already in short form: “18.4K”, “1.2M” — Persian
     writes the magnitude out (“۱۸٫۴ هزار”), English and Korean keep K/M */
  const compact = raw.match(COMPACT);
  if (compact) {
    const digits = localizeDigits(compact[1], lang);
    const magnitude = t(compact[2].toUpperCase() === "M" ? "num.million" : "num.thousand");
    return lang === "fa" ? `${digits} ${magnitude}` : `${digits}${magnitude}`;
  }

  return raw;
}
