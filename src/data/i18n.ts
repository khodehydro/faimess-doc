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
