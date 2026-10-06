/* ------------------------------------------------------------------ *
 *  SEO Infrastructure — Structured Data, Dynamic Meta & Search Indexing
 *  Powers search engine discovery (Google, Bing), rich snippets,
 *  Knowledge Graph entries, OpenGraph, Twitter Cards, and hreflang
 *  for all artists, albums, tracks, playlists, news, and shop items.
 * ------------------------------------------------------------------ */

import type { Artist, Album, Playlist } from "../data/library";
import type { PlayerTrack } from "../data/player";
import type { NewsItem } from "../data/feed";
import type { ShopProduct } from "../data/shop";
import { STRINGS, tData, type Lang } from "../data/i18n";

export const SITE_URL = "https://faimess.app";
export const BRAND_NAME = "FAIMESS";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`;

export type SeoMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "music.song" | "music.album" | "profile" | "article" | "product";
  ogImage: string;
  keywords: string;
  jsonLd: Record<string, unknown> | Array<Record<string, unknown>>;
  hreflang: {
    en: string;
    fa: string;
    ko: string;
  };
};

/* --------------------------- Page Meta ----------------------------- */

export const PAGE_SEO: Record<string, { en: { title: string; desc: string }; fa: { title: string; desc: string } }> = {
  home: {
    en: {
      title: "FAIMESS — K-Pop Streaming, Lyrics & Community",
      desc: "Stream the latest K-pop releases, follow trending charts, discover fresh albums, and enjoy bilingual synchronized lyrics in Persian, English and Korean on FAIMESS.",
    },
    fa: {
      title: "فیمس (FAIMESS) — مرجع آنلاین استریم کیپاپ، متن و ترجمه آهنگ‌ها",
      desc: "پلتفرم تخصصی پخش موسیقی کی‌پاپ، دیسکوگرافی آرتیست‌ها، لیریک همگام با ترجمه فارسی، آلبوم‌های جدید و جامعه هواداران کی‌پاپ در فیمس.",
    },
  },
  artists: {
    en: {
      title: "K-Pop Artists & Groups Directory — Discography & Profiles | FAIMESS",
      desc: "Browse the complete directory of K-pop boy groups, girl groups, soloists, and duos. Listen to discographies, singles, and member stories.",
    },
    fa: {
      title: "فهرست گروه‌ها و خوانندگان کیپاپ — دیسکوگرافی و آلبوم‌ها | فیمس",
      desc: "راهنمای جامع و آرشیو کامل بوی‌بندها، گرل‌گروه‌ها و سولیست‌های کی‌پاپ همراه با آهنگ‌ها، آلبوم‌ها و اطلاعات هنرمندان در فیمس.",
    },
  },
  albums: {
    en: {
      title: "K-Pop Albums & Fresh Releases — Tracklists & Stream | FAIMESS",
      desc: "Explore the latest K-pop studio albums, EPs, and singles. Listen to full tracklists with time-synced lyrics and album art.",
    },
    fa: {
      title: "آلبوم‌های جدید کیپاپ — پخش آنلاین، لیست ترک‌ها و کاورها | فیمس",
      desc: "جدیدترین آلبوم‌ها، مینی‌آلبوم‌ها و سینگل‌های کی‌پاپ. پخش کامل ترک‌ها به همراه متن و ترجمه ترانه‌ها در فیمس.",
    },
  },
  playlists: {
    en: {
      title: "Curated K-Pop Playlists — Late Night, Workout, Chill & Hits | FAIMESS",
      desc: "Curated K-pop playlists for every mood and moment. Discover fan favorites, deep focus tracks, and trending comeback anthems.",
    },
    fa: {
      title: "پلی‌لیست‌های اختصاصی کیپاپ — گلچین بهترین آهنگ‌ها | فیمس",
      desc: "مجموعه‌ای از برترین پلی‌لیست‌های کی‌پاپ برای هر حس و حال، از آهنگ‌های آرام‌بخش و رانندگی شبانه تا آهنگ‌های پرانرژی و ترند.",
    },
  },
  news: {
    en: {
      title: "K-Pop News, Tour Dates & Comebacks | FAIMESS Editorial Desk",
      desc: "Stay updated with breaking K-pop news, world tour announcements, comeback dates, chart records, and in-depth music journalism.",
    },
    fa: {
      title: "اخبار کیپاپ، تاریخ کنسرت‌ها و کامبک‌ها | تحریریه فیمس",
      desc: "آخرین اخبار و رویدادهای دنیای کی‌پاپ، اعلام تورهای جهانی کنسرت، تاریخ انتشار آهنگ‌ها و تحلیل‌های موسیقی در رسانه فیمس.",
    },
  },
  shop: {
    en: {
      title: "Official K-Pop Merch Store — Hoodies, Photocards & Lightsticks | FAIMESS",
      desc: "Shop official artist merchandise, tour apparel, collectible photocards, acrylic keyrings, lightsticks, and accessories with fast checkout.",
    },
    fa: {
      title: "فروشگاه رسمی مرچ و کالای کیپاپ — هودی، فوتوکارت و لایت‌استیک | فیمس",
      desc: "خرید آنلاین انواع مرچندایز و پوشاک رسمی کنسرت، فوتوکارت‌های کلکسیونی، لایت‌استیک، بج و اکسسوری‌های کی‌پاپ در فروشگاه فیمس.",
    },
  },
  download: {
    en: {
      title: "Download FAIMESS App — Install on iOS, Android & Desktop",
      desc: "Get the FAIMESS progressive web app for phone and desktop. Instant install, offline playback support, fast streaming, and low data mode.",
    },
    fa: {
      title: "دانلود و نصب اپلیکیشن فیمس — نسخه موبایل، تبلت و کامپیوتر",
      desc: "نصب آسان وب‌اپلیکیشن (PWA) فیمس روی آیفون، اندروید و ویندوز. استریم سریع، مصرف بهینه اینترنت و دسترسی آفلاین به موزیک‌ها.",
    },
  },
};

/* ---------------------- Entity Generators -------------------------- */

export function getArtistSeo(artist: Artist, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const tr = (k: string) => STRINGS[k]?.[lang] ?? k;
  const artistKind = tData(tr, artist.kind, lang);
  const artistGenre = tData(tr, artist.genre, lang);

  const title = isFa
    ? `${artist.name} — دیسکوگرافی، آلبوم‌ها و آهنگ‌ها | فیمس کیپاپ`
    : `${artist.name} — Songs, Albums & Discography | FAIMESS`;

  const description = isFa
    ? `آرشیو کامل آهنگ‌ها، آلبوم‌ها، موزیک‌ها و دیسکوگرافی ${artist.name} (${artistKind}) در سبک ${artistGenre}. پخش آنلاین با کیفیت بالا و لیریک همگام‌سازی شده فارسی و کره‌ای در فیمس.`
    : `Explore ${artist.name}'s complete discography, popular songs, singles, and albums on FAIMESS. Stream in high quality with bilingual synced lyrics.`;

  const canonical = `${SITE_URL}/#/artist/${artist.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": artist.kind === "Soloist" ? "Person" : "MusicGroup",
    "@id": canonical,
    "name": artist.name,
    "genre": artist.genre,
    "image": artist.photo.startsWith("http") ? artist.photo : `${SITE_URL}${artist.photo}`,
    "url": canonical,
    "description": description,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ListenAction",
      "userInteractionCount": artist.listeners,
    },
  };

  return {
    title,
    description,
    canonical,
    ogType: "profile",
    ogImage: artist.photo.startsWith("http") ? artist.photo : `${SITE_URL}${artist.photo}`,
    keywords: `${artist.name}, ${artist.name} songs, ${artist.name} albums, آهنگ های ${artist.name}, دیسکوگرافی ${artist.name}, K-pop ${artistKind}`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/artist/${artist.id}?lang=en`,
      fa: `${SITE_URL}/#/artist/${artist.id}?lang=fa`,
      ko: `${SITE_URL}/#/artist/${artist.id}?lang=ko`,
    },
  };
}

export function getAlbumSeo(album: Album, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const title = isFa
    ? `آلبوم ${album.title} از ${album.artist} — پخش آنلاین و متن آهنگ‌ها | فیمس`
    : `${album.title} by ${album.artist} — Full Album Stream & Lyrics | FAIMESS`;

  const description = isFa
    ? `دانلود و پخش آنلاین آلبوم ${album.title} از ${album.artist} (${album.year}). شامل ${album.tracks} قطعه موسیقی به همراه متن و ترجمه فارسی آهنگ‌ها در فیمس.`
    : `Listen to ${album.title} by ${album.artist} (${album.year}). Full tracklist with ${album.tracks} songs, bilingual synchronized lyrics, and fan discussions on FAIMESS.`;

  const canonical = `${SITE_URL}/#/album/${album.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    "@id": canonical,
    "name": album.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": album.artist,
    },
    "datePublished": String(album.year),
    "numTracks": album.tracks,
    "image": album.photo.startsWith("http") ? album.photo : `${SITE_URL}${album.photo}`,
    "url": canonical,
    "description": description,
  };

  return {
    title,
    description,
    canonical,
    ogType: "music.album",
    ogImage: album.photo.startsWith("http") ? album.photo : `${SITE_URL}${album.photo}`,
    keywords: `${album.title}, ${album.artist}, ${album.title} album, آلبوم ${album.title}, آهنگ های ${album.artist}, K-pop album stream`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/album/${album.id}?lang=en`,
      fa: `${SITE_URL}/#/album/${album.id}?lang=fa`,
      ko: `${SITE_URL}/#/album/${album.id}?lang=ko`,
    },
  };
}

export function getTrackSeo(track: PlayerTrack, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const title = isFa
    ? `آهنگ ${track.title} از ${track.artist} — پخش آنلاین و متن و ترجمه | فیمس`
    : `${track.title} by ${track.artist} — Listen & Bilingual Lyrics | FAIMESS`;

  const description = isFa
    ? `پخش آنلاین آهنگ ${track.title} از ${track.artist} (از آلبوم ${track.album}). مشاهده متن لیریک کره‌ای و ترجمه فارسی همگام با موسیقی در فیمس.`
    : `Stream ${track.title} from ${track.artist}'s ${track.album}. Experience time-synced Korean, English and Persian lyrics and join the community on FAIMESS.`;

  const canonical = `${SITE_URL}/#/track/${track.id}`;

  const durationMin = Math.floor(track.seconds / 60);
  const durationSec = track.seconds % 60;
  const isoDuration = `PT${durationMin}M${durationSec}S`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "@id": canonical,
    "name": track.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": track.artist,
    },
    "inAlbum": {
      "@type": "MusicAlbum",
      "name": track.album,
    },
    "duration": isoDuration,
    "image": track.photo.startsWith("http") ? track.photo : `${SITE_URL}${track.photo}`,
    "url": canonical,
    "description": description,
  };

  return {
    title,
    description,
    canonical,
    ogType: "music.song",
    ogImage: track.photo.startsWith("http") ? track.photo : `${SITE_URL}${track.photo}`,
    keywords: `${track.title}, ${track.artist}, ${track.title} lyrics, متن آهنگ ${track.title}, ترجمه فارسی ${track.title}, دانلود آهنگ ${track.title}, K-pop track`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/track/${track.id}?lang=en`,
      fa: `${SITE_URL}/#/track/${track.id}?lang=fa`,
      ko: `${SITE_URL}/#/track/${track.id}?lang=ko`,
    },
  };
}

export function getPlaylistSeo(playlist: Playlist, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const title = isFa
    ? `پلی‌لیست ${playlist.name} — گلچین آهنگ‌های کیپاپ | فیمس`
    : `${playlist.name} — Curated K-Pop Playlist | FAIMESS`;

  const description = isFa
    ? `پلی‌لیست منتخب ${playlist.name} شامل گلچینی از برترین موزیک‌های کی‌پاپ برای تمام لحظات در فیمس.`
    : `Listen to the ${playlist.name} curated playlist on FAIMESS. Handpicked K-pop tracks for every mood and moment.`;

  const canonical = `${SITE_URL}/#/playlist/${playlist.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    "@id": canonical,
    "name": playlist.name,
    "numTracks": playlist.tracks,
    "image": playlist.photo.startsWith("http") ? playlist.photo : `${SITE_URL}${playlist.photo}`,
    "url": canonical,
    "description": description,
  };

  return {
    title,
    description,
    canonical,
    ogType: "music.album",
    ogImage: playlist.photo.startsWith("http") ? playlist.photo : `${SITE_URL}${playlist.photo}`,
    keywords: `${playlist.name}, K-pop playlist, پلی لیست ${playlist.name}, گلچین کیپاپ`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/playlist/${playlist.id}?lang=en`,
      fa: `${SITE_URL}/#/playlist/${playlist.id}?lang=fa`,
      ko: `${SITE_URL}/#/playlist/${playlist.id}?lang=ko`,
    },
  };
}

export function getNewsSeo(news: NewsItem, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const title = isFa
    ? `${news.title} | اخبار کیپاپ فیمس`
    : `${news.title} | FAIMESS K-Pop News`;

  const description = news.excerpt;
  const canonical = `${SITE_URL}/#/news/${news.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": canonical,
    "headline": news.title,
    "description": news.excerpt,
    "image": news.photo.startsWith("http") ? news.photo : `${SITE_URL}${news.photo}`,
    "author": {
      "@type": "Person",
      "name": news.author.name,
      "jobTitle": news.author.role,
    },
    "publisher": {
      "@type": "Organization",
      "name": BRAND_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon-512.png`,
      },
    },
    "url": canonical,
  };

  return {
    title,
    description,
    canonical,
    ogType: "article",
    ogImage: news.photo.startsWith("http") ? news.photo : `${SITE_URL}${news.photo}`,
    keywords: `${news.title}, K-pop news, اخبار کیپاپ, اخبار کنسرت کیپاپ`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/news/${news.id}?lang=en`,
      fa: `${SITE_URL}/#/news/${news.id}?lang=fa`,
      ko: `${SITE_URL}/#/news/${news.id}?lang=ko`,
    },
  };
}

export function getProductSeo(product: ShopProduct, lang: Lang): SeoMetadata {
  const isFa = lang === "fa";
  const title = isFa
    ? `خرید ${product.name} — فروشگاه مرچ فیمس`
    : `Buy ${product.name} — FAIMESS Official Merch`;

  const description = isFa
    ? `خرید آنلاین ${product.name} به قیمت ${product.price.toLocaleString("fa-IR")} تومان با ارسال سریع در فروشگاه فیمس.`
    : `Order ${product.name} from the FAIMESS official merch store. Premium quality and limited edition collectibles.`;

  const canonical = `${SITE_URL}/#/shop`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.photo.startsWith("http") ? product.photo : `${SITE_URL}${product.photo}`,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": BRAND_NAME,
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "IRR",
      "availability": "https://schema.org/InStock",
      "url": canonical,
    },
  };

  return {
    title,
    description,
    canonical,
    ogType: "product",
    ogImage: product.photo.startsWith("http") ? product.photo : `${SITE_URL}${product.photo}`,
    keywords: `${product.name}, K-pop merch, خرید مرچ کیپاپ, فروشگاه کیپاپ`,
    jsonLd,
    hreflang: {
      en: `${SITE_URL}/#/shop?lang=en`,
      fa: `${SITE_URL}/#/shop?lang=fa`,
      ko: `${SITE_URL}/#/shop?lang=ko`,
    },
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND_NAME,
    "alternateName": ["FAIMESS Music", "فیمس کیپاپ"],
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/#/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ----------------- Document Head Updater --------------------------- */

function hasDom(): boolean {
  return (
    typeof document !== "undefined" &&
    Boolean(document.head) &&
    typeof document.querySelector === "function" &&
    typeof document.createElement === "function"
  );
}

function updateMetaTag(nameOrProperty: string, content: string, isProperty = false) {
  if (!hasDom()) return;
  const selector = isProperty
    ? `meta[property="${nameOrProperty}"]`
    : `meta[name="${nameOrProperty}"]`;

  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    if (isProperty) {
      tag.setAttribute("property", nameOrProperty);
    } else {
      tag.setAttribute("name", nameOrProperty);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function updateLinkTag(rel: string, href: string, extraAttrs?: Record<string, string>) {
  if (!hasDom()) return;
  let selector = `link[rel="${rel}"]`;
  if (extraAttrs?.hreflang) {
    selector += `[hreflang="${extraAttrs.hreflang}"]`;
  }
  let link = document.querySelector(selector) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  if (extraAttrs) {
    for (const [k, v] of Object.entries(extraAttrs)) {
      link.setAttribute(k, v);
    }
  }
}

function updateJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  if (!hasDom()) return;
  const scriptId = "faimess-jsonld";
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Apply complete metadata to document head
 */
export function applySeo(meta: SeoMetadata, lang: Lang) {
  if (!hasDom()) return;

  // Title
  document.title = meta.title;

  // Standard Meta
  updateMetaTag("description", meta.description);
  updateMetaTag("keywords", meta.keywords);
  updateMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // Canonical & Hreflang
  updateLinkTag("canonical", meta.canonical);
  updateLinkTag("alternate", meta.hreflang.en, { hreflang: "en" });
  updateLinkTag("alternate", meta.hreflang.fa, { hreflang: "fa" });
  updateLinkTag("alternate", meta.hreflang.ko, { hreflang: "ko" });
  updateLinkTag("alternate", meta.canonical, { hreflang: "x-default" });

  // OpenGraph
  updateMetaTag("og:title", meta.title, true);
  updateMetaTag("og:description", meta.description, true);
  updateMetaTag("og:url", meta.canonical, true);
  updateMetaTag("og:type", meta.ogType, true);
  updateMetaTag("og:site_name", BRAND_NAME, true);
  updateMetaTag("og:image", meta.ogImage, true);
  updateMetaTag("og:locale", lang === "fa" ? "fa_IR" : lang === "ko" ? "ko_KR" : "en_US", true);
  updateMetaTag("og:locale:alternate", lang === "fa" ? "en_US" : "fa_IR", true);

  // Twitter Cards
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", meta.title);
  updateMetaTag("twitter:description", meta.description);
  updateMetaTag("twitter:image", meta.ogImage);

  // Schema.org Structured Data
  const websiteLd = getWebSiteJsonLd();
  const payload = Array.isArray(meta.jsonLd) ? [websiteLd, ...meta.jsonLd] : [websiteLd, meta.jsonLd];
  updateJsonLd(payload);
}
