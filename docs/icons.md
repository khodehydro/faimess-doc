# آیکون‌ها — مجموعهٔ Lets Icons

تمام آیکون‌های سایت از **یک مجموعهٔ واحد** می‌آیند:

| | |
|---|---|
| **نام مجموعه** | Lets Icons — همان «Free Icon Pack 1800+ icons» |
| **طراح** | Leonid Tsvetkov |
| **منبع اصلی** | <https://www.figma.com/community/file/886554014393250663/free-icon-pack-1800-icons> |
| **نسخهٔ استفاده‌شده** | آینهٔ Iconify با کلید `lets-icons` (۱۵۴۴ آیکن، ۲۴×۲۴، خطی با `stroke`) |
| **لایسنس** | **CC BY 4.0** — <https://creativecommons.org/licenses/by/4.0/> |

> چرا از خود فایل فیگما دانلود نشد؟ فایل‌های Community بدون حساب فیگما قابل export نیستند
> (نه API بی‌توکن دارند و نه لینک مستقیم SVG). همان مجموعه با همان طراح و همان هندسه در
> Iconify منتشر شده و همان چیزی است که اینجا مصرف می‌شود. **انتساب (attribution) CC BY
> الزامی است**: نام طراح و لایسنس در `src/ui/icons.gen.ts`، همین سند، و بخش «کردیت‌ها» در
> `README.md` آمده است.

---

## ۱. خط تولید (pipeline)

```
tools/icons/lets-icons.json        ← کش ۹۰۰kB از مجموعه (git-ignore)
        │  tools/icons/build.mjs   ← جدول site-name → pack-name
        ▼
src/ui/icons.gen.ts (کامیت می‌شود، ۵۵ آیکن)
        │  src/ui/Icon.tsx          ← تنها مصرف‌کنندهٔ فایل تولید‌شده
        ▼
همهٔ بخش‌ها: <Icon name="heart" />  ← اسم‌های خودِ سایت دست‌نخورده می‌مانند
```

```bash
# ساخت دوبارهٔ فایل تولیدشده (وقتی آیکن جدیدی به جدول اضافه شد)
node tools/icons/build.mjs            # نوشتن src/ui/icons.gen.ts
node tools/icons/build.mjs --check    # اگر فایل کهنه باشد، با کد ۱ بیرون می‌آید

# گرفتن کش، در نبودِ شبکه یا توکن:
curl -L -H "Accept: application/vnd.github.raw" \
  https://api.github.com/repos/iconify/icon-sets/contents/json/lets-icons.json \
  -o tools/icons/lets-icons.json
```

- **هیچ هندسه‌ای دستی کشیده نمی‌شود.** `build.mjs` تنها جای نگاشت است؛ `src/ui/Icon.tsx`
  فقط رشتهٔ آمادهٔ آیکن را رندر می‌کند. پس عوض‌کردن یک آیکن = یک خط در جدول + `build`.
- افزودن نام تازه: یک ردیف در `MAP` داخل `tools/icons/build.mjs` (و اگر معادل دقیقی نبود،
  یک خط توضیح در همان‌جا و در جدول زیر).

## ۲. جدول نگاشت

| آیکن سایت | آیکن پک | یادداشت |
|---|---|---|
| `home` | `home` | |
| `calendar` | `calendar` | |
| `activity` | `chart` | نمودار میله‌ای در قاب — «الان چه‌قدر شلوغ است» |
| `message` | `chat` | `message` خودِ پک پاکت‌نامه است؛ حباب گفت‌وگو `chat` است |
| `settings` | `setting-alt-line` | |
| `search` | `search` | |
| `bell` | `bell` | |
| `folder` | `folder` | |
| `clock` | `clock` | |
| `lock` | `lock` | |
| `star` | `star` | |
| `send` | `send-hor` | هواپیمای کاغذی، و خطی است |
| `chevronLeft` | `expand-left` | شِورون سادهٔ پک |
| `chevronRight` | `expand-right` | |
| `grid` | `darhboard` | چهار مربع |
| `list` | `sort` | سه خط پشت‌سرهم |
| `check` | `done` | |
| `plus` | `add` | |
| `sparkle` | `dimond` | پک «sparkle» ندارد؛ الماس همان حس درخشش را می‌دهد |
| `pin` | `pin` | |
| `users` | `group` | |
| `video` | `video` | |
| `compass` | `compass` | |
| `arrowUpRight` | `external` | آیکن «بیرون‌رو» با فلش از جعبه |
| `arrowLeft` | `arrow-left-long` | |
| `arrowRight` | `arrow-right-long` | |
| `close` | `close-round` | |
| `radio` | `target` | دایره‌های هم‌مرکز = «روی آنتن/زنده» |
| `more` | `meatballs-menu` | سه نقطهٔ افقی |
| `trend` | `line-up` | |
| `map` | `direction` | پک `map` یک قاب عکس است؛ `direction` نقشه با مسیر است |
| `play` | `play` | |
| `pause` | `stop` | پک «pause» ندارد؛ `stop` را دقیقاً دو میلهٔ گرد می‌کشد |
| `mic` | `mic` | |
| `disc` | `doughnut-chart` | پک «vinyl/disc» ندارد؛ حلقهٔ این آیکن + دایرهٔ داخلی = صفحهٔ گرامافون |
| `music` | `music` | |
| `heart` | `favorite` | |
| `shuffle` | `sort-random` | |
| `headphones` | `headphones-fill-light` | فقط نسخهٔ `-light` خطی است (بقیه پُر هستند) |
| `waveform` | `stat` | سه میلهٔ گرد = نوار «در حال پخش» |
| `download` | `download` | پُر (fill) — بقیهٔ حالت‌های پک هم پُرند |
| `expand` | `full-screen-corner` | پُر، جفتِ `collapse` |
| `collapse` | `collapse` | |
| `flame` | `fire` | پُر |
| `crown` | `trophy` | |
| `medal` | `sertificate` | |
| `verified` | `chield-check` | املا خودِ پک همین است |
| `news` | `paper` | |
| `bolt` | `lightning` | |
| `share` | `export` | پک آیکن «share» ندارد؛ جعبه + فلش رو به بالا |
| `copy` | `copy` | |
| `folderPlus` | `folder-add` | |
| `sun` / `moon` | `sun` / `moon` | |
| `globe` | `globe` | |

### آیکن‌های پُر (fill)

`download` · `fire` · `expand` · `collapse` · `share` (نیمه) و سر `trophy` در پک پُر
کشیده شده‌اند و `strokeWidth` روی آن‌ها اثری ندارد. این‌ها در پک هم همین‌طورند و عوض
نشده‌اند؛ فقط جاهایی نشسته‌اند که پُر بودن طبیعی است (دکمهٔ دانلود، نشانگر «داغ»، دکمهٔ
باز/بستهٔ پلیر، رتبهٔ اول).

## ۳. جزئیات فنی

- **وزن خط ارث می‌برد.** `build.mjs` فقط `stroke-width="2"` (پیش‌فرض پک روی گرید ۲۴) را از
  بدنه حذف می‌کند تا آیکن وزن خود را از `<svg>` بگیرد — پس همان `strokeWidth={2.4}` یا
  `{1.7}` قبلی سرِ جایش کار می‌کند. هر ضخامت دیگری داخل بدنه (مثل قاب ۴ پیکسلی
  `verified`/`bolt`/`compass`) دست‌نخورده می‌ماند؛ آن‌ها طرح خودِ پک‌اند.
- **رنگ:** بدنه‌ها `currentColor` دارند؛ رنگ از متن می‌آید، همان‌طور که قبلاً.
- **`<mask>`:** سه آیکن (`verified`، `bolt`، `compass`) ماسک دارند و id آن‌ها سند‌سراسری
  است. `Icon.tsx` با `useId()` به هر رندر یک پسوند می‌دهد تا دو آیکن هم‌سان روی یک صفحه
  با هم تعارض نکنند.
- **RTL:** همان قاعدهٔ v23 برجاست — `MIRRORED_IN_RTL = ["arrowUpRight", "send"]` در
  `Icon.tsx` و کلاس `dir-flip` در `index.css`. فلش‌های قبلی/بعدی هم مثل قبل از
  `backIcon`/`forwardIcon` می‌آیند، نه از هاردکد.
- **اندازه:** `viewBox="0 0 24 24"` پک، پس هر `size` روی گرید ۲۴ می‌نشیند و با Stage اسکیل
  می‌شود؛ هیچ آیکنی زیر ۱۲px استفاده نمی‌شود (قاعدهٔ v21).
- **آیکن‌های غیرپک:** لوگوی FAIMESS (`src/ui/Logo.tsx`)، کاور/آواتار تولیدشده
  (`Cover.tsx`, `Avatar.tsx`) و صحنه‌های تصویرسازی (`Scenes.tsx`) عمداً بیرون از این مجموعه
  هستند — آن‌ها نشان برند و تصویرسازی‌اند، نه آیکن رابط کاربری.
