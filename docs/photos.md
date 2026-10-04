# عکس‌های FAIMESS — انتخاب، پردازش و اتصال

> این سند «خط لولهٔ تصویر» است: چه عکس‌هایی، با چه ابعادی، چطور ساخته شده‌اند، چطور در کد وصل می‌شوند و برای انتشار عمومی چه چیزی باید عوض شود.

## ۱. چه چیزی واقعی شد؟

| سطح | پوشه | ابعاد | تعداد |
|---|---|---|---|
| آرتیست‌ها (دایرهٔ شلف + کارت صفحهٔ Artists) | `src/assets/photos/artists/` | ۲۸۰×۲۸۰ | ۸ |
| آلبوم‌ها و سینگل‌ها (کاور آلبوم و تامبنیل ترک) | `src/assets/photos/albums/` | ۴۲۰×۴۲۰ (سینگل ۳۲۰) | ۱۲ |
| پلی‌لیست‌ها | `src/assets/photos/playlists/` | ۴۲۰×۴۲۰ | ۶ |
| شنوند‌هٔ و مخاطبان پیام‌ها | `src/assets/photos/users/` | ۱۶۰×۱۶۰ | ۱۳ |
| بنرهای هیرو | `src/assets/photos/banners/` | ۱۴۰۰×۴۶۰ | ۳ |

جمع: **۴۲ فایل WebP، ~۸۴۴KB**. همه داخل خود پروژه سرو می‌شوند؛ **هیچ درخواست تصویر به دامنهٔ خارجی زده نمی‌شود** (چون سرورهای تصویر بیرونی هم در محیط سندباکس در دسترس نبودند).

**عمداً تصویری مانده:** کارت‌های خبر (`NewsShelf` / `NewsPage`) — تصویرسازی‌های `ui/Scenes.tsx` مثل یک «میز تحریریهٔ تصویرشده» در کنار عکس‌های واقعی بازیگری می‌کنند.

## ۲. اتصال در کد

```
src/assets/photos/**            فایل‌های WebP
        │
        ├─ src/data/library.ts     artists / albums / playlists   → فیلد photo
        ├─ src/data/feed.ts        tracks / trendingTracks / users → فیلد photo
        ├─ src/data/banners.ts     banners                        → فیلد photo
        ├─ src/data/messages.ts    conversations                  → فیلد photo
        └─ src/data/account.ts     me (پروفایل بالای صفحه)        → فیلد photo
```

- `src/ui/Cover.tsx` → `Cover` و `ArtistCover` پراپ `src` می‌گیرند و در نبودش همان **SVG تولیدشده از `seed`** را می‌کشند (fallback). کامپوننت مشترک `<Photo>` هم از همین فایل export می‌شود (بنر از آن استفاده می‌کند).
- `src/ui/Avatar.tsx` → پراپ `src` عکس گرد می‌گذارد، وگرنه آدمک برداری قبلی.
- `vite.config.ts` → `build.assetsInlineLimit = 2048` تا هیچ عکسی base64 داخل JS جا نگیرد و هر فایل جدا کش شود.
- `npm run check:ssr` → ۲۱ بررسی: رندر همهٔ صفحه‌ها + اینکه هر ۵۰ مسیر عکس موجود و یکتاست.

## ۳. عوض کردن یک عکس (۳۰ ثانیه)

1. فایل جدید را **با همان نام** در همان پوشه بگذار (هر ابعاد مربعی؛ خط لوله خودش برش و بهینه‌سازی می‌کند).
2. اگر نام فایل عوض شد، فقط `import` همان فایل در `src/data/*.ts` را به‌روز کن.
3. `npm run check:ssr` و بعد `npm run build`.

افزودن آرتیست/آلبوم تازه هم همین است: یک آبجکت در `library.ts` با یک `import` عکس.

## ۴. دستور پردازش (ImageMagick)

هر فایل از یک عکس خام ساخته شده است: برش مربع/پانوراما + یک «گرید» رنگی برند + شارپ سبک + WebP با کیفیت ۸۲.

```bash
convert "$SRC" -auto-orient -filter Lanczos -resize "420x420^" \
  -gravity center -extent 420x420 \
  -modulate 100,112,100 -fill '#8267F0' -colorize 20% -level 5%,97% \
  -unsharp 0x0.7+0.55+0.02 -quality 82 -define webp:method=6 "$OUT"
```

گریدهای آماده: `violet`, `deepviolet`, `cool`, `teal`, `warm`, `amber`, `magenta`, `bw`, `plain`.
`plain` برای چهره‌ها (بدون دست‌کاری رنگ) و گریدهای رنگی برای کاورها/بنرها تا کل مجموعه یک هویت بصری بگیرد.

## ۵. منابع و لایسنس ⚠️

این عکس‌ها **فقط برای ماکت/شبیه‌سازی** از نتایج جست‌وجوی تصویر وب انتخاب و برش خورده‌اند:

| گروه | دامنهٔ منبع |
|---|---|
| بنرها و کارت‌های گروهی (NOVAE / AXION / LUNEX) | `vecteezy.com` — عکس‌های رایگان «concert hall / stage lights» (تولیدشده با AI) |
| پرتره‌های SEORA / HANEUL | `pinterest.com` (ایدهٔ عکاسی پرترهٔ کره‌ای) |
| پرترهٔ PRISM9 | `gettyimages.com` («moody female portrait in low light») |
| پرترهٔ KAIROS | `postcrest.com` — پرترهٔ ادیتوریال AI (نسخهٔ ۱۶۰۰×۲۸۴۴) |
| کاورهای شهری (Afterglow, Nightbloom, Tokyo Window, Midnight Seoul) | `wallpapers.com` · `peakpx.com` · `pinterest.com` (نئون سئول/توکیو) |
| کاورهای طبیعت (Blue Hour, Slow Motion) | `amateurphotographer.com` · `rawpixel.com` |
| کاورهای انتزاعی (Velvet Static, Long Exposure) | `pinterest.com` (نوردهی بلند) · `uniqstiq.com` (هنر آکریلیک) |
| پلی‌لیست‌های پاستلی (Rainy Window, Deep Focus, Weekend Reset) | `dreamstime.com` (گرادیان‌های تصویرسازی) |
| چهرهٔ شنوندگان و پیام‌ها | `vecteezy.com` · `pexels.com` · `easy-peasy.ai` · `123rf.com` |

نکتهٔ مهم: این فایل‌ها **جانشین موقت** هستند. پیش از هر انتشار عمومی/تجاری باید با عکس‌های دارای لایسنس (عکاسی اختصاصی، استوک خریداری‌شده، یا تصویرسازی سفارشی) جایگزین شوند — کافی است فایل‌ها را با همان نام‌ها عوض کنی و `npm run build` بگیری. اسامی آرتیست‌ها هم خیالی‌اند و به هیچ گروه واقعی اشاره ندارند.
