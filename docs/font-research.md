# انتخاب فونت برای FAIMESS

> **وضعیت فعلی محصول:** تمام متن‌های انگلیسی و فارسی با Vazirmatn رندر می‌شوند؛ subset لاتین و عربیِ Vazirmatn به‌صورت محلی و با `unicode-range` بارگذاری می‌شوند. Pretendard فقط برای متن‌های کره‌ای به‌عنوان fallback باقی مانده است. بخش‌های پایین‌تر، تاریخچهٔ انتخاب اولیهٔ فونت را ثبت می‌کنند.

### مرحلهٔ ۱: تحلیل مقالهٔ «24 best fonts for websites» از Figma
### مرحلهٔ ۲: بررسی فونت خود Weverse و جایگزینی آن (وضعیت فعلی)

منبع بررسی‌شده: [figma.com/resource-library/best-fonts-for-websites](https://www.figma.com/resource-library/best-fonts-for-websites/)
(۲۴ فونت معرفی‌شده در مقاله + پنج توصیهٔ آن برای انتخاب فونت)

---

## ۱. معیارهای ما

FAIMESS یک **پلتفرم استریم موسیقی K-pop** است با مخاطب **۱۲ تا ۳۰ سال**. یعنی فونت باید هم‌زمان:

1. **انرژی و شخصیت** داشته باشد (فرهنگ فن‌محور، رنگارنگ، پرتحرک) — نه لحن شرکتی و خنثی.
2. در **UI متراکم** (لیست آهنگ، شمارندهٔ آتش، مدت زمان، بج‌ها) در اندازه‌های ۱۲–۱۵px خوانا بماند.
3. **اعداد مرتب** بدهد: شمارندهٔ آتش، امتیاز کاربران، مدت آهنگ → نیاز به `tabular-nums`.
4. **وزن‌های سنگین** داشته باشد؛ تیترهای Bold/ExtraBold بخش زیادی از هویت K-pop را می‌سازند.
5. **متن‌باز و چندزبانه** باشد (مخاطب فارسی/انگلیسی + در آینده کره‌ای).
6. سبک و سریع لود شود (ترجیحاً variable یا چند وزن محدود).

## ۲. گزینه‌های کاندید از فهرست Figma

| فونت | نوع | حکم برای FAIMESS |
|---|---|---|
| **Poppins** | Sans serif هندسی | ✅ **انتخاب‌شده برای تیترها** — «لبه‌های منحنی مدرن و ضخامت خط یکنواخت»، خیلی محبوب در فرهنگ فن‌محور و برندینگ نسل Z؛ در وزن‌های Bold/ExtraBold فوق‌العاده برای تیتر و لوگو |
| **DM Sans** | Sans serif هندسی | ✅ **انتخاب‌شده برای متن/UI** — «با در نظر گرفتن اندازه‌های کوچک طراحی شده» + «هندسی با ظاهری دوستانه اما موقر»؛ دقیقاً همان چیزی که UI متراکم ما لازم دارد و با هندسهٔ Poppins هم‌خانواده است |
| Rubik | Sans serif (لبه‌های کمی گرد) | گزینهٔ دوم — متغیر و خوانا، اما شخصیتش «بازی‌گونه و نرم» است؛ برای برند موسیقی کمی کم‌جسارت |
| Nunito | Sans serif (ترمینال گرد) | خیلی گرم و دعوت‌کننده، ولی بیش از حد «کودکانه/نرم»؛ برای سن ۱۲–۳۰ (نیمهٔ بالای بازه) کمتر جدی به نظر می‌رسد |
| Manrope | Sans serif هندسی | «دوستانه و خوش‌آمد» و متغیر؛ اما کمی بی‌طرف و «استارتاپی» — هویت K-pop را حمل نمی‌کند |
| Montserrat | Sans serif هندسی | فنی قوی و x-height بالا، ولی **بسیار پرمصرف و جنریک**؛ تمایز برند را کم می‌کند |
| Inter | Sans serif UI | بهترین فونت UI (اعداد جدولی، OpenType)، اما لحنش **خنثی/تک‌محور** است؛ مناسب متن است نه برای لحن یک برند سرگرمی — جایگزین تیرهٔ DM Sans می‌تواند باشد |
| Josefin Sans | Sans serif هندسی وینتیج | x-height پایین و حس دههٔ ۱۹۲۰ → در UI متراکم و اندازه‌های کوچک ضعیف؛ مناسب تیترهای تزئینی، نه اپلیکیشن |
| Roboto / Open Sans / Source Sans Pro / Ubuntu / Lato | Sans serif خنثی | امن، بی‌شخصیت و تا حدی «کهنه»؛ برای پلتفرم سرگرمی جوان‌پسند هیچ حرف تازه‌ای ندارند |
| Raleway | Sans serif ظریف | ظرافت ادیتوریال، برای برند لوکس/مد خوب است نه برای موسیقی پرانرژی |
| Work Sans / Object Sans | Sans serif هندسی | متین و امن، ولی بی‌حال؛ Object Sans علاوه بر آن **تجاری/غیرآزاد** است → ریسک لایسنس |
| Playfair Display · Libre Baskerville · Lora · Soria · Neuton · Sreda · Arvo | Serif / Slab serif | ❌ کاملاً بیربط به یک اپ استریم موسیقی؛ لحن کلاسیک/چاپی/رسمی می‌دهند |

## ۳. انتخاب نهایی — پس از بررسی Weverse

پس از اینکه مشخص شد **Weverse با چه فونتی ساخته شده**، همان فونت جایگزین شد:

> **Weverse (weverse.io) کل محصولش را با یک فونت می‌سازد: `Pretendard`.**
> یک نیو-گروتسک کره‌ای (ساخته‌شده بر پایهٔ Inter و Source Han Sans) که استانداردِ دی‌فکتوی محصولات کره‌ای است.
> و قاعدهٔ مهمش: **سلسله‌مراتب فقط با وزن ساخته می‌شود** (۸۰۰ ExtraBold برای نام‌های شاخص، ۷۰۰ برای تیتر و دکمه، ۵۰۰ برای ناوبری، ۴۰۰ برای متن) — هیچ فونت نمایشی دومی وجود ندارد.

```
همه‌چیز  →  Pretendard
```

**چرا برای FAIMESS درست است:**
1. **بومیِ K-pop است.** Weverse پلتفرم رسمی HYBE است؛ همین فونت، زبان بصری‌ای است که مخاطب ۱۲–۳۰ سالهٔ K-pop هر روز می‌بیند.
2. **هم لاتین هم کره‌ای** را با یک خانواده پوشش می‌دهد → اگر بعداً اسم آرتیست/آهنگ‌ها را به هانگول نوشتیم، فونت عوض نمی‌شود.
3. **بدون نیاز به تنظیم letter-spacing** طراحی شده (برخلاف فونت‌های هندسی که تراکینگ منفی لازم داشتند) → در UI متراکم بهتر می‌نشیند.
4. **عددها تمیز و جدولی** هستند → مناسب شمارندهٔ آتش، امتیاز و مدت آهنگ.
5. وزن‌های ۴۰۰/۵۰۰/۶۰۰/۷۰۰/۸۰۰ دقیقاً همان چیزی است که UI ما استفاده می‌کند (میانگین/نیمه‌پر/پر/فوق‌پر).

**اعمال در پروژه:**
- فایل‌ها **self-hosted** هستند در `src/assets/fonts/pretendard-{400,500,600,700,800}.woff2`
- هر فایل یک **subset لاتین** (~۲۹KB) است — کل فونت لاتین ۱۶۴KB به‌جای ~۳.۵MB
- `@font-face`ها در `src/index.css` و هر دو توکن `--font-sans` و `--font-display` به Pretendard اشاره می‌کنند (همان قاعدهٔ «یک خانواده، سلسله‌مراتب با وزن»)
- تراکینگ منفیِ فونت نمایشی قبلی در کل اپ ملایم شد (۱۰ مورد) چون Pretendard بدون تصحیح فاصله طراحی شده
- لایسنس OFL کنار فایل‌ها: `src/assets/fonts/LICENSE-Pretendard.txt`

### ساخت دوبارهٔ subsetها (در صورت نیاز)
```bash
npm i -D @fontsource/pretendard            # منبع رسمی
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli

LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD,U+2022,U+2026,U+2018-201D"

for w in 400 500 600 700 800; do
  /tmp/fontenv/bin/pyftsubset "node_modules/@fontsource/pretendard/files/pretendard-latin-$w-normal.woff2" \
    --unicodes="$LATIN" --layout-features='*' --flavor=woff2 \
    --output-file="src/assets/fonts/pretendard-$w.woff2" --no-hinting --desubroutinize
done
```

### کره‌ای — انجام شد (لیریک پلیر)
لیریک‌ها هانگول دارند، پس یک subset کر‌ه‌ای هم ساخته شد. منبع، نسخهٔ رسمی بستهٔ `pretendard` است (npm، شامل فایل‌های کامل کره‌ای؛ داخل `node_modules` نمی‌ماند):

```bash
npm pack pretendard && tar xzf pretendard-1.3.9.tgz          # dist/web/static/woff2/Pretendard-<Weight>.woff2

# فهرست کاراکترهای هانگولِ واقعاً استفاده‌شده در اپ (لیریک + برچسب‌ها)
grep -rhoP '[\x{ac00}-\x{d7a3}]' src | tr -d '\n' | fold -w1 | sort -u | tr -d '\n' > /tmp/ko_chars.txt

for pair in 400:Regular 500:Medium 600:SemiBold 700:Bold 800:ExtraBold; do
  w=${pair%%:*}; n=${pair##*:}
  /tmp/fontenv/bin/pyftsubset "…/dist/web/static/woff2/Pretendard-$n.woff2" \
    --text-file=/tmp/ko_chars.txt --layout-features='' --flavor=woff2 \
    --no-hinting --desubroutinize --output-file="src/assets/fonts/pretendard-ko-$w.woff2"
done
```

- نتیجه: **~۱۱KB هر وزن** (۱۵۳ سیلاب هانگول) به‌جای ~۵۸۰KB برای کل بلوک هانگول و ~۷۵۰KB فونت کامل.
- `@font-face`ها در `src/index.css` همان خانوادهٔ `"Pretendard"` هستند با `unicode-range: U+AC00-D7A3`؛ مرورگر خودش برای متن لاتین فایل لاتین و برای هانگول فایل کره‌ای را می‌گیرد.
- اگر متن کره‌ای تازه‌ای اضافه شد که سیلاب‌هایش در subset نیست، همان یک کاراکتر به فونت سیستم برمی‌گردد؛ برای پوشش کامل، دستور بالا را دوباره با فهرست کاراکترهای تازه اجرا کن.

### لاتین + فارسی — Vazirmatn (وضعیت فعلی)
تمام UI انگلیسی و فارسی، از جمله ترجمهٔ لیریک، با **Vazirmatn** رندر می‌شود (`--font-sans`, `--font-display`, `--font-fa`). دو subset با `unicode-range` جدا، برای Latin و Arabic/Persian انتخاب می‌شوند:

- منبع: `@fontsource/vazirmatn` → `vazirmatn-latin-{400,500,600,700,800}-normal.woff2` در فایل‌های `vazirmatn-latin-<weight>.woff2` و `vazirmatn-arabic-{400,500,600,700,800}-normal.woff2` در `vazirmatn-<weight>.woff2` کپی شده‌اند؛ همه self-hosted هستند و لایسنس `LICENSE-Vazirmatn.txt` (OFL) کنارشان است.
- subset عربی حروف فارسی (پ، چ، ژ، گ و نیم‌فاصله) را پوشش می‌دهد؛ subset لاتین متن انگلیسی/اعداد را. Pretendard فقط برای Hangul به‌عنوان fallback استفاده می‌شود.

### عوض کردن فونت در ۲ خط
```css
/* src/index.css */
--font-sans:    "نام فونت متن Variable", ui-sans-serif, system-ui, sans-serif;
--font-display: "نام فونت تیتر", "نام فونت متن Variable", ui-sans-serif, sans-serif;
```
و در `src/main.tsx` پکیج `@fontsource-variable/<font>` (یا `@fontsource/<font>/latin-<weight>.css`) را ایمپورت کن.
