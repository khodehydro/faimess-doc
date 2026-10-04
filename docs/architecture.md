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
| کارت والد | کل صحنه (۱۵۸۰×۸۸۹) با پدینگ ۱۴ |
| ردیف بالایی (سه پیل) | ۶۲ |
| Hero (داخل کارت چپ) | ۳۴۰ (با پدینگ ۱۴) |
| Feed (داخل کارت چپ) | ارتفاع طبیعی؛ اسکرول در سطح کارت |
| Greeting (داخل کارت راست) | ۳۰۰ |
| Messages (داخل کارت راست) | `flex-1` (≈۴۸۴) |
| فاصله‌ها | ۱۴ بین کارت‌ها، ۱۴ پدینگ داخل کارت چپ |

### تقسیم ۷۵ / ۲۵
```css
@media (min-width: 1024px) {
  .home-split-left  { flex: 0 1 calc(75% - 7px); }  /* نیمهٔ گاتر ۱۴px */
  .home-split-right { flex: 0 1 calc(25% - 7px); }
}
```
- این قواعد **خارج از لایه‌ها** (unlayered) در `src/index.css` هستند تا بر `flex-1` پیش‌فرض `SurfaceCard` غلبه کنند.
- مقدارها با `HOME_METRICS.split` در `src/lib/stage.ts` هم‌تراز نگه داشته می‌شوند.
- روی عرض صحنهٔ ۱۵۸۰: چپ **۱۱۵۷px (۷۴.۵٪)** / راست **۳۸۱px (۲۴.۵٪)** — مجموع دقیقاً ردیف را پر می‌کند.
- اجزای داخل کارت راست برای عرض ۳۸۱px کالیبره شده‌اند: تیتر خوش‌آمد ۲۹px، فیلترها ۲×۲، کارت دعوت `max-w` با قابلیت جمع‌شدن، و هدر ترد با دو کنترل. ارتفاع‌ها با تصویر مرجع هم‌تراز است؛ فقط عرض ستون چپ با فریم کشیده می‌شود.

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

## ۳.۰ ترکیب پنج‌کارتی پوستهٔ خانه

```
Shell (app/App.tsx)  ← کارت والد: bg-shell #F1F2F5 · rounded-shell 30px · shadow-frame · p-14
├── row 1:  BrandCard │ NavCard │ …… │ AccountCard      (سه پیل، rounded-full)
└── row 2:  صفحه‌ها (هر صفحه کارت خودش را می‌سازد)
            Home → کارت چپ + کارت راست (دو کارت جدا)
            Artists/Albums/Playlists/News → یک کارت محتوا
```

### نردبان رنگ
```
#EAEAEC  بوم  →  #F1F2F5  کارت والد (shell)  →  #FFFFFF  کارت‌ها
```
توکن‌ها در `src/index.css`: `--color-shell` / `--color-shell-deep` و `--radius-shell: 30px` (یوتیلیتی‌های `bg-shell` و `rounded-shell`).
کارت والد هیچ اسکرولی نمی‌گیرد (`min-h-0` زنجیره‌ای حفظ شده) و فقط نگه‌دارندهٔ چیدمان است.

- سه کارت بالایی **پیل** هستند (`rounded-full`) تا چپ و راستشان نیم‌دایره شود؛ دو کارت محتوا `rounded-card` (۲۲px) دارند.
- **یک کارت والد** همهٔ کارت‌ها را در خود دارد؛ رنگش `#F1F2F5` است: روشن‌تر از بوم `#EAEAEC` و عمیق‌تر از کارت‌های سفید. کارت‌های داخل با سایهٔ نرم روی آن شناورند.
- `SurfaceCard` در `ui/primitives.tsx` کارت محتوای آماده است (بدون `overflow-hidden` نمی‌تواند باشد چون گوشه‌های گرد باید محتوا را ببُرند — و اسکرولر داخلی، sticky را حفظ می‌کند).
- بخش‌های داخلی (Greeting/Messages/Hero/Feed) **بدون** بج و سایهٔ کارت رندر می‌شوند؛ آن‌ها داخل کارت‌ها زندگی می‌کنند، نه به‌عنوان کارت مستقل.

## ۳.۱ اسکرول کارت چپ (مهم)

در دسکتاپ، **کارت چپ صفحهٔ خانه** صاحب اسکرول است:

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

## ۳.۲ فید موسیقی (src/sections/feed/)

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

هر بنر: `eyebrow, title, dateRange, location, going, photo, stops[{city,date}]` — یک **عکس واقعی** به‌عنوان پس‌زمینه + کارت رویداد شناور با لیست سه ایستگاه (شهر/تاریخ). تصویر با گرید بنفش (`deepviolet`) در `src/assets/photos/banners/` است؛ سایه‌های گرادیانی برای خوانایی متن روی عکس اضافه شده‌اند.
اسلایدها با `AnimatePresence` جهت‌دار جابه‌جا می‌شوند؛ کنترل‌ها: دکمه‌های گرد قبلی/بعدی، دات‌ها، پخش خودکار ۷s (توقف روی هاور)، کلیدهای ←/→ و سوایپ با درگ.

## ۶. سیستم طراحی

- توکن‌ها به‌صورت متغیرهای `@theme` در `src/index.css` (رنگ، شعاع، سایه، فونت) → همه به‌صورت یوتیلیتی تیلویند (`bg-primary`, `rounded-card`, `shadow-float`) در دسترس‌اند.
- کامپوننت‌های پایه در `src/ui/primitives.tsx`: `Card`, `CircleButton`, `PillButton`, `Meta`, `Divider`, `Dot`.
- تصویرها: عکس‌های واقعی self-hosted در `src/assets/photos/` (کاور/آواتار/بنر) + `src/ui/Cover.tsx` که هم `<Photo>` را می‌دهد و هم در نبود عکس، کاور تولیدشده با `seed` را می‌کشد. `src/ui/Scenes.tsx` فقط برای تصویرسازی کارت‌های خبر مانده است.
- انیمیشن‌های محیطی (پرنده، موج، ستاره، شعله، برگ) به‌صورت کی‌فریم‌های CSS در `index.css` تعریف شده‌اند تا داخل SVG هم کار کنند.

## ۷. تغییر برند

- نام: `TopBar.tsx` (وردمارک) + `index.html` (title).
- رنگ لهجه: فقط `--color-primary*` را در `src/index.css` عوض کن؛ همهٔ دکمه‌ها/بج‌ها/پین‌ها/روز فعال خودکار عوض می‌شوند.
- لوگو: `src/ui/Logo.tsx`.


---

## ۸. تایپوگرافی

| نقش | فونت | کاربرد |
|---|---|---|
| نمایشی | `Pretendard` (`font-display`) | برند، تیتر بخش‌ها، خوش‌آ‌مد، نام کارت‌ها، مونوگرام کاورها |
| بدنه/UI | `Pretendard` (`font-sans`) | متن‌ها، متادیتا، دکمه‌ها، ورودی‌ها |

**یک خانواده، سلسله‌مراتب با وزن** — همان قاعدهٔ Weverse. Pretendard self-hosted است (`src/assets/fonts/`، subset لاتین ~۲۹KB هر وزن) و `@font-face`ها در `src/index.css` تعریف شده‌اند؛ هیچ ایمپورت فونتی در `main.tsx` نیست. مبنای انتخاب: [`font-research.md`](./font-research.md). اعداد شمارنده‌ای با `tabular-nums` رندر می‌شوند.

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

برای عوض کردن فونت‌ها فقط دو متغیر `--font-sans` و `--font-display` در `src/index.css` را تغییر بده و ایمپورت مربوطه را در `src/main.tsx` عوض کن (`@fontsource-variable/<font>` یا `@fontsource/<font>/latin-<weight>.css`).

## ۱۰. تصویرسازی‌ها

## ۹. عکس‌ها (تصاویر واقعی)

سطح‌های تصویری اپ با **عکس واقعی** پر شده‌اند: ۸ آرتیست، ۱۲ کاور (آلبوم + سینگل)، ۶ پلی‌لیست، ۱۳ چهرهٔ شنونده/پیام/پروفایل و ۳ بنر هیرو — همه self-hosted در `src/assets/photos/` (۴۲ فایل WebP، ~۸۴۴KB).

- تایپ‌های داده یک فیلد `photo: string` دارند؛ `Cover`, `ArtistCover` و `Avatar` پراپ `src` را می‌گیرند و در نبودش به هنر تولیدشده با seed برمی‌گردند.
- یک رستر مشترک (`data/library.ts`) هم شلف فالو، هم صفحهٔ Artists/Albums و هم سرچ را تغذیه می‌کند تا عکس و اسم فقط در یک‌جا عوض شوند.
- `npm run check:ssr` اتصال همهٔ عکس‌ها را می‌سنجد.
- جزئیات خط لوله، ابعاد، دستور ImageMagick، منابع و هشدار لایسنس: [`photos.md`](./photos.md).

## ۱۱. تصویرسازی‌ها

`src/ui/Scenes.tsx` سه صحنهٔ قهرمان دارد (`SunsetScene`, `CampingScene`, `CoastScene`) که همه روی **بوم ۱۲۰۰×۴۰۰** طراحی شده‌اند تا بنر پانورامای سمت چپ را بدون برش بد پر کنند. برای صحنهٔ جدید: یک کامپوننت با همان امضا بساز (پراپ `className`)، به `SCENES` در `HeroBanner.tsx` و به `SceneKey` اضافه کن، بعد در `data/banners.ts` استفاده کن.
