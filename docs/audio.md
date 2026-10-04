# صدا در FAIMESS (نسخهٔ دمو)

## چه چیزی ship می‌شود

`src/assets/audio/faimess-demo.mp3` — **یک مستر دمو** به‌مدت ۲:۴۰ (۱۶۰ ثانیه)، مونو، ۴۴٫۱kHz، ۸۰kbps، ~۱٫۵MB.

- کل صف پلیر (`QUEUE` در `src/data/player.ts`) فعلاً به **همین یک فایل** اشاره می‌کند؛ یعنی با زدن پخش روی هر آهنگ، همین قطعه از ابتدا پخش می‌شود.
- نام آهنگ/آرتیست/کاور و **لیریک** همان ترکِ انتخابی است، پس همهٔ کنترل‌ها (پخش/توقف/بعدی/قبلی/درگ نوار پیشرفت/♥/دانلود) با فایل واقعی قابل تست‌اند.
- کنداکتور زمانی لیریک‌ها (`lyrics.ts`) طوری نوشته شده که داخل همین ۱۶۰ ثانیه جا شود (آخرین خطِ `nt1` روی ۲:۳۸ است).

## چرا ساخته‌شده (و نه دانلودشده)

سندباکس به هیچ میزبان بیرونی دسترسی ندارد (همهٔ درخواست‌ها → کد ۰۰۰) و هیچ فایل صوتی هم داخل `node_modules` نیست؛ ابزار `image_search` هم فقط تصویر می‌دهد. پس قطعه **از صفر سنتز شده** تا:

1. دکمه‌های پلیر روی صدای واقعی تست شوند (نه زمان شبیه‌سازی‌شده)،
2. هیچ حق ثالثی در پروژه نباشد (اثر خودِ همین ریپو است).

`ffmpeg`/`lame` در سندباکس نیست، پس انکود MP3 با **lamejs** (پورت جاوااسکریپتی LAME) انجام می‌شود.

## ساخت دوباره

```bash
python3 -m venv /tmp/fontenv
/tmp/fontenv/bin/pip install numpy

# ۱) رندر WAV: پد + باس + درام + لید، ۸۴BPM، لامینور، ۵۶ میزان
/tmp/fontenv/bin/python tools/make-demo-audio.py /tmp/faimess-demo.wav

# ۲) انکود MP3 (۸۰kbps مونو)
npm i -D @breezystack/lamejs
node tools/encode-demo-audio.mjs /tmp/faimess-demo.wav src/assets/audio/faimess-demo.mp3 80
```

پارامترهای موسیقی در بالای `tools/make-demo-audio.py`: `BPM`، `BARS`، آرایهٔ `CHORDS` (پیشروی Am7–Fmaj7–Cmaj7–G6)، `SCALE` (پنتاتونیک A مینور) و سکشن‌بندی `section()` (intro / verse / chorus / break / outro).

## چطور در پلیر استفاده می‌شود

| قطعه | نقش |
|---|---|
| `src/data/player.ts` | هر `PlayerTrack` یک فیلد `audio` دارد (فعلاً همه = `faimess-demo.mp3`) |
| `src/app/PlayerContext.tsx` | یک `HTMLAudioElement` ساخته می‌شود؛ `position` از `timeupdate`، `duration` از `durationchange`، و `ended` ترک را جلو می‌برد |
| `src/sections/PlayerSection.tsx` | `DownloadButton` (تک‌رنگ، آینهٔ ♥) دیالوگ اندروید را باز می‌کند — هیچ فایلی در وب ذخیره نمی‌شود |

اگر مرورگر (یا محیطی مثل SSR) سازندهٔ `Audio` نداشته باشد، همان کنترل‌ها روی **زمان شبیه‌سازی‌شدهٔ ۲۵۰ms** کار می‌کنند تا UI از کار نیفتد.

## پیش از انتشار عمومی

1. هر ترک یک فایل **لایسنس‌دار** خودش بگیرد و `audio` در `data/player.ts` به آن اشاره کند (و اگر لازم شد `seconds` و `at`های لیریک با مدت واقعی هم‌تراز شوند).
2. `faimess-demo.mp3` و اسکریپت‌های ساختش می‌توانند بمانند (اثر خود پروژه‌اند) یا حذف شوند.
3. **در وب دانلود نداریم:** دکمهٔ ⤓ پلیر فقط دیالوگ «Downloads live in the Android app» را باز می‌کند و دکمهٔ آن به صفحهٔ `#/download` می‌برد (`src/pages/DownloadPage.tsx`). فایل دمو فقط برای تست پخش/سیک است، نه برای ذخیره‌کردن توسط کاربر.
