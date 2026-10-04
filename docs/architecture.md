# معماری FAIMESS

سند مرجع برای توسعهٔ ماژولار پروژه. هدف: **افزودن بخش/صفحه/بنر بدون دست‌زدن به هستهٔ اپ.**

---

## ۱. لایه‌ها

```
main.tsx                →  App (Provider + Stage + Shell)
├── app/AppContext.tsx  →  route, navigate, notify (toast)   ← تنها وابستگی مشترک بخش‌ها
├── app/Stage.tsx       →  مقیاس‌دهی آرت‌بورد ثابت ۱۳۲۰×۹۳۰
└── app/App.tsx         →  Shell: TopBar + صفحهٔ فعال
    ├── sections/*      →  بخش‌ها (مستقل، فقط از useApp استفاده می‌کنند)
    ├── pages/*         →  ترکیب بخش‌ها در یک چیدمان
    └── data/*          →  محتوا (بدون منطق رندر)
```

قواعد:
- هر بخش **خودکفا**ست: داده‌اش را از `data/` می‌خواند و پیام‌ها را با `useApp().notify` می‌فرستد.
- هیچ بخشی مستقیماً بخش دیگر را import نمی‌کند.
- محتوا (متن، تصاویر، آیتم‌ها) همیشه در `data/` است، نه داخل JSX.

## ۲. صحنه (Stage) و رفتار «بدون اسکرول»

`src/lib/stage.ts` اندازهٔ آرت‌بورد و متریک‌های چیدمان را نگه می‌دارد:

```ts
export const STAGE = { width: 1580, height: 889, padding: 20, maxScale: 1.5 };
export const HOME_METRICS = { topBar: 84, gutter: 18, hero: 356, greeting: 344, rightColumn: 520 };
```

`useStageScale` نسبت مقیاس را حساب می‌کند:

```
scale = min((vw − 2·padding)/1580, (vh − 2·padding)/889, maxScale)
```

- **دسکتاپ (≥1024px):** صفحه `h-dvh overflow-hidden` است؛ محتوا هرگز سرریز نمی‌کند، فقط مقیاس عوض می‌شود.
- **زیر ۱۰۲۴px:** اسکیل خاموش، چیدمان تک‌ستونی با ارتفاع‌های اختصاصی هر بخش (کلاس‌های `lg:` حذف می‌شوند) و اسکرول عادی.
- `MotionConfig` با `transformPagePoint` مختصات اشاره‌گر را به فضای محلی صحنه تبدیل می‌کند تا هاور و درگ در حالت مقیاس‌خورده دقیق بمانند.

### ارتفاع‌های صفحهٔ Home (فضای صحنه)

| بخش | ارتفاع |
|---|---|
| TopBar | محتوا‌محور (≈۷۰) |
| Hero (چپ) | ۳۵۶ (عرض `flex-1`) |
| Feed (چپ) | `flex-1` (≈۴۳۶، اسکرول داخلی) |
| Greeting (راست) | ۳۴۴ |
| Messages (راست) | `flex-1` (≈۴۷۸) |
| فاصله‌ها | ۱۸ بین بخش‌ها، ۲۰ پدینگ صفحه |

عرض ستون‌ها: **چپ `flex-1` (کشسان)** / **راست ثابت ۵۲۰px** (`HOME_METRICS.rightColumn`). ارتفاع‌ها با تصویر مرجع هم‌تراز است؛ فقط عرض ستون چپ با فریم کشیده می‌شود.

## ۳. رجیستری بخش‌ها

`src/sections/registry.tsx`:

```ts
export type SectionParams = {
  topbar: undefined;
  hero: undefined;
  schedule: undefined;   // آماده برای صفحات دیگر (مثلاً یک صفحهٔ تقویم)
  feed: undefined;
  greeting: undefined;
  messages: undefined;
  collection: { kind: "artists" | "albums" | "playlists" };
};
```

استفاده در صفحه:

```tsx
<SectionSlot id="hero" params={undefined} />
<SectionSlot id="collection" params={{ kind: "albums" }} />
```

### افزودن بخش
1. `src/sections/MySection.tsx` را بساز:
   ```tsx
   export function MySection({ params }: { params: { foo: number } }) {
     return <section className="h-full w-full rounded-card bg-surface p-5 shadow-card">…</section>;
   }
   ```
   قاعده: بخش‌ها `h-full w-full` می‌گیرند و ارتفاع را والد تعیین می‌کند.
2. در `registry.tsx` کلید `my: { foo: number }` را به `SectionParams` و `my: MySection` را به `sections` اضافه کن.
3. در صفحه: `<SectionSlot id="my" params={{ foo: 1 }} />` (در یک والد با ارتفاع مشخص، مثلاً `h-[300px]`).

## ۳.۱ اسکرول ستون چپ (مهم)

در دسکتاپ، **ستون چپ صفحهٔ خانه** صاحب اسکرول است:

```tsx
<div className="scroll-slim … lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1.5">
  <Hero />   {/* ۳۵۶px — با اسکرول از دید خارج می‌شود */}
  <Feed />   {/* ارتفاع طبیعی، بدون اسکرول داخلی */}
</div>
```

- بنر ثابت نیست؛ با اسکرول کنار می‌رود و فید ادامه پیدا می‌کند.
- `FeedSection` **هیچ `overflow` داخلی ندارد** (و عمداً `overflow-hidden` هم نمی‌گیرد، چون sticky را می‌شکند).
- نوار چیپ‌ها `sticky top-0` است و هدر هر شلف `top: 48px` (`SHELF_STICKY_TOP` / `CHIP_STRIP_HEIGHT`) — یعنی چیپ‌ها بالا می‌مانند و عنوان شلف دقیقاً زیرشان.
- پرش چیپ‌ها با `scrollIntoView` انجام می‌شود و `scroll-mt-[56px]` روی هر شلف، جا برای نوار چسبان باز می‌کند.
- تشخیص شلف فعال با شنوندهٔ `scroll` روی `window` و `capture: true` است تا هر کانتینری که اسکرول می‌کند (ستون در دسکتاپ، document در موبایل) پوشش داده شود.
- زیر ۱۰۲۴px اسکرول به document برمی‌گردد و همان stickyها روی viewport می‌چسبند.

## ۳.۲ فید خانه (src/sections/feed/)

فید یک **پشتهٔ شش‌شلفی** است که زیر بنر در همان ستون اسکرول‌شو می‌نشیند. هر شلف از `Shelf` استفاده می‌کند:

```tsx
<Shelf id="feed-artists" icon="users" title="Artists you follow" hint="۱۰" action={<PillButton …/>}>
  <Row>{/* آیتم‌های افقی */}</Row>
</Shelf>
```

- `Shelf` → هدر **چسبان** (با پس‌زمینهٔ نیمه‌شفاف + بلور) که هنگام اسکرول روی محتوا می‌ماند، به‌علاوهٔ `Row` (ردیف افقی snap‌دار) و `PlayDot` (دکمهٔ پخش روی کاور).
- `FEED_SHELVES` در `feed/index.tsx` منبع ترتیب است: هر آیتم `{ id, label, icon, Component }`. افزودن/جابه‌جایی/حذف شلف = ویرایش همین آرایه؛ چیپ‌های میان‌بر بالای باکس و رفتار «شلف فعال» خودکار از همین آرایه ساخته می‌شوند.
- هر شلف داده‌اش را از `src/data/feed.ts` می‌خواند. افزودن آهنگ/آرتیست/خبر تازه = افزودن یک آبجکت به همان فایل.

### شلف‌های فعلی
| id | عنوان | نوع محتوا |
|---|---|---|
| `feed-artists` | Artists you follow | کاور دایره‌ای + نام + نشان تأیید + پالس ریلیز جدید |
| `feed-newest` | Newest songs | لیست دوستونه با کاور، بج `NEW`، مدت و «افزودن به کتابخانه» |
| `feed-trending` | Trending now | رتبه + **شمارندهٔ آتش** قابل کلیک (رأی کاربر) + درصد رشد |
| `feed-news` | Latest news | کارت خبر + دکمهٔ «Go to news» → مسیر `#/news` |
| `feed-albums` | Fresh albums | ردیف افقی کاور مربعی + دکمهٔ پخش |
| `feed-users` | Active listeners | پروفایل دایره‌ای + امتیاز (flame) + سطح و استریک |

## ۴. صفحه‌ها و مسیرها

`app/router.ts` منبع حقیقت مسیرهاست:

```ts
export const routes = [
  { id: "home", label: "Home", path: "#/" },
  { id: "artists", label: "Artists", path: "#/artists" },
  { id: "albums", label: "Albums", path: "#/albums" },
  { id: "playlists", label: "Playlists", path: "#/playlists" },
];
```

دو لیست مسیر وجود دارد:
- `routes` → صفحات ناوبری (Home / Artists / Albums / Playlists)
- `contextualRoutes` → صفحاتی که در منو نیستند ولی از داخل اپ باز می‌شوند (News)

افزودن صفحه: یک آیتم در یکی از این دو لیست + یک کامپوننت در `pages/` + یک خط در `PAGES` در `app/App.tsx`.
ناوبری، پنل جست‌وجو و «Quick jump» **خودکار** از همین لیست‌ها تغذیه می‌شوند.

## ۵. بنر چرخشی

`src/sections/HeroBanner.tsx` + `src/data/banners.ts`

هر بنر: `eyebrow, title, dateRange, time, location, guests, scene, mapTone, travellers`.
اسلایدها با `AnimatePresence` جهت‌دار جابه‌جا می‌شوند؛ کنترل‌ها: دکمه‌های گرد قبلی/بعدی، دات‌ها، پخش خودکار ۷s (توقف روی هاور)، کلیدهای ←/→ و سوایپ با درگ.

## ۶. سیستم طراحی

- توکن‌ها به‌صورت متغیرهای `@theme` در `src/index.css` (رنگ، شعاع، سایه، فونت) → همه به‌صورت یوتیلیتی تیلویند (`bg-primary`, `rounded-card`, `shadow-float`) در دسترس‌اند.
- کامپوننت‌های پایه در `src/ui/primitives.tsx`: `Card`, `CircleButton`, `PillButton`, `Meta`, `Divider`, `Dot`.
- تصویرسازی‌ها در `src/ui/Scenes.tsx` (صحنه‌ها و بندانگشتی‌ها) و `src/ui/Cover.tsx` (کاورهای تولیدشده با seed).
- انیمیشن‌های محیطی (پرنده، موج، ستاره، شعله، برگ) به‌صورت کی‌فریم‌های CSS در `index.css` تعریف شده‌اند تا داخل SVG هم کار کنند.

## ۷. تغییر برند

- نام: `TopBar.tsx` (وردمارک) + `index.html` (title).
- رنگ لهجه: فقط `--color-primary*` را در `src/index.css` عوض کن؛ همهٔ دکمه‌ها/بج‌ها/پین‌ها/روز فعال خودکار عوض می‌شوند.
- لوگو: `src/ui/Logo.tsx`.


---

## ۸. تایپوگرافی

| نقش | فونت | کاربرد |
|---|---|---|
| نمایشی | `Quicksand Variable` (`font-display`) | برند، تیتر بخش‌ها، خوش‌آ‌مد، نام کارت‌ها، مونوگرام کاورها |
| بدنه/UI | `Nunito Sans Variable` (`font-sans`) | متن‌ها، متادیتا، دکمه‌ها، ورودی‌ها |

### مقیاس تایپ (authoring در فضای صحنه)

| نقش | اندازه |
|---|---|
| خوش‌آمد | ۳۴px / Bold |
| تیتر صفحه | ۲۴–۲۶px / Bold |
| تیتر شلف و کارت | ۱۵–۱۷px / Bold |
| متن اصلی، نام آهنگ، پیام | ۱۳٫۵–۱۵px |
| متادیتا، بج‌ها، برچسب‌ها | **حداقل ۱۲px** |
| آیکون‌ها | ۱۴–۱۸px (تِرِی‌ها ۲۸–۳۸px) |

> کف مقیاس ۱۲px است (قبلاً ۹px بود). اگر باز هم بزرگ‌تر خواستی، فقط اعداد `text-[…px]` را تغییر بده یا مقدار `STAGE.width` را کمتر کن (کل رابط بزرگ‌تر رندر می‌شود).

برای عوض کردن فونت‌ها فقط دو متغیر `--font-sans` و `--font-display` در `src/index.css` را تغییر بده و پکیج `@fontsource-variable/<font>` را اضافه/جایگزین کن.

## ۹. تصویرسازی‌ها

`src/ui/Scenes.tsx` سه صحنهٔ قهرمان دارد (`SunsetScene`, `CampingScene`, `CoastScene`) که همه روی **بوم ۱۲۰۰×۴۰۰** طراحی شده‌اند تا بنر پانورامای سمت چپ را بدون برش بد پر کنند. برای صحنهٔ جدید: یک کامپوننت با همان امضا بساز (پراپ `className`)، به `SCENES` در `HeroBanner.tsx` و به `SceneKey` اضافه کن، بعد در `data/banners.ts` استفاده کن.
