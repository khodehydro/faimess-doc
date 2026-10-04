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
export const STAGE = { width: 1680, height: 930, padding: 20, maxScale: 1.5 };
export const HOME_METRICS = { topBar: 84, gutter: 18, hero: 372, greeting: 330, rightColumn: 520 };
```

`useStageScale` نسبت مقیاس را حساب می‌کند:

```
scale = min((vw − 2·padding)/1680, (vh − 2·padding)/930, maxScale)
```

- **دسکتاپ (≥1024px):** صفحه `h-dvh overflow-hidden` است؛ محتوا هرگز سرریز نمی‌کند، فقط مقیاس عوض می‌شود.
- **زیر ۱۰۲۴px:** اسکیل خاموش، چیدمان تک‌ستونی با ارتفاع‌های اختصاصی هر بخش (کلاس‌های `lg:` حذف می‌شوند) و اسکرول عادی.
- `MotionConfig` با `transformPagePoint` مختصات اشاره‌گر را به فضای محلی صحنه تبدیل می‌کند تا هاور و درگ در حالت مقیاس‌خورده دقیق بمانند.

### ارتفاع‌های صفحهٔ Home (فضای صحنه)

| بخش | ارتفاع |
|---|---|
| TopBar | محتوا‌محور (≈۷۰) |
| Hero (چپ) | ۳۷۲ (عرض `flex-1`) |
| Schedule (چپ) | `flex-1` (≈۴۳۶) |
| Greeting (راست) | ۳۳۰ |
| Messages (راست) | `flex-1` (≈۴۷۸) |
| فاصله‌ها | ۱۸ بین بخش‌ها، ۲۰ پدینگ صفحه |

عرض ستون‌ها: **چپ `flex-1` (کشسان)** / **راست ثابت ۵۲۰px** (`HOME_METRICS.rightColumn`). ارتفاع‌ها با تصویر مرجع هم‌تراز است؛ فقط عرض ستون چپ با فریم کشیده می‌شود.

## ۳. رجیستری بخش‌ها

`src/sections/registry.tsx`:

```ts
export type SectionParams = {
  topbar: undefined;
  hero: undefined;
  schedule: undefined;
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

افزودن صفحه: یک آیتم در `routes` + یک کامپوننت در `pages/` + یک خط در `PAGES` در `app/App.tsx`.
ناوبری بالای صفحه و پنل جست‌وجو **خودکار** از همین لیست تغذیه می‌شوند.

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
| نمایشی | `Outfit Variable` (`font-display`) | برند، تیتر بخش‌ها، خوش‌آمد، نام کارت‌ها، مونوگرام کاورها |
| بدنه/UI | `Figtree Variable` (`font-sans`) | متن‌ها، متادیتا، دکمه‌ها، ورودی‌ها |

برای عوض کردن فونت‌ها فقط دو متغیر `--font-sans` و `--font-display` در `src/index.css` را تغییر بده و پکیج `@fontsource-variable/<font>` را اضافه/جایگزین کن.

## ۹. تصویرسازی‌ها

`src/ui/Scenes.tsx` سه صحنهٔ قهرمان دارد (`SunsetScene`, `CampingScene`, `CoastScene`) که همه روی **بوم ۱۲۰۰×۴۰۰** طراحی شده‌اند تا بنر پانورامای سمت چپ را بدون برش بد پر کنند. برای صحنهٔ جدید: یک کامپوننت با همان امضا بساز (پراپ `className`)، به `SCENES` در `HeroBanner.tsx` و به `SceneKey` اضافه کن، بعد در `data/banners.ts` استفاده کن.
