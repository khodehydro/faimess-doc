import { useEffect } from "react";
import { useApp } from "../app/AppContext";
import { usePlayer } from "../app/PlayerContext";
import { usePreferences } from "../app/PreferencesContext";
import { artists, albums, playlists } from "../data/library";
import { newsItems } from "../data/feed";
import { QUEUE } from "../data/player";
import {
  applySeo,
  PAGE_SEO,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  getArtistSeo,
  getAlbumSeo,
  getPlaylistSeo,
  getNewsSeo,
  getTrackSeo,
  type SeoMetadata,
} from "../lib/seo";

/* ------------------------------------------------------------------ *
 *  SeoHead — Dynamic Head & Schema.org Controller
 *  Monitors active route, selected artist, album, playlist, news, or
 *  music track, and dynamically synchronizes:
 *    - Document Title (Bilingual Persian & English)
 *    - Meta Description & Keywords (Google search ranking)
 *    - Canonical link & Hreflang alternates
 *    - OpenGraph (Facebook, WhatsApp, Telegram previews)
 *    - Twitter Cards
 *    - Schema.org JSON-LD (MusicGroup, MusicAlbum, NewsArticle, etc.)
 * ------------------------------------------------------------------ */

export function SeoHead() {
  const { route, detail, selectedNewsId, deepLinkTrackId } = useApp();
  const { track } = usePlayer();
  const { lang } = usePreferences();

  useEffect(() => {
    // 1. If viewing an entity detail (album, artist, playlist)
    if (detail) {
      if (detail.kind === "artist") {
        const artist = artists.find((a) => a.id === detail.id);
        if (artist) {
          applySeo(getArtistSeo(artist, lang), lang);
          return;
        }
      }
      if (detail.kind === "album") {
        const album = albums.find((a) => a.id === detail.id);
        if (album) {
          applySeo(getAlbumSeo(album, lang), lang);
          return;
        }
      }
      if (detail.kind === "playlist") {
        const playlist = playlists.find((p) => p.id === detail.id);
        if (playlist) {
          applySeo(getPlaylistSeo(playlist, lang), lang);
          return;
        }
      }
    }

    // 2. If viewing a news article
    if (selectedNewsId) {
      const news = newsItems.find((n) => n.id === selectedNewsId);
      if (news) {
        applySeo(getNewsSeo(news, lang), lang);
        return;
      }
    }

    // 3. If deep-linked to a track
    if (deepLinkTrackId) {
      const t = QUEUE.find((q) => q.id === deepLinkTrackId);
      if (t) {
        applySeo(getTrackSeo(t, lang), lang);
        return;
      }
    }

    // 4. Fallback to route SEO
    const pageData = PAGE_SEO[route] ?? PAGE_SEO.home;
    const isFa = lang === "fa";
    const currentLangData = isFa ? pageData.fa : pageData.en;
    const canonical = `${SITE_URL}/#/${route === "home" ? "" : route}`;

    const defaultMeta: SeoMetadata = {
      title: currentLangData.title,
      description: currentLangData.desc,
      canonical,
      ogType: "website",
      ogImage: DEFAULT_OG_IMAGE,
      keywords: isFa
        ? "کیپاپ, دانلود آهنگ کیپاپ, استریم کیپاپ, لیریک کیپاپ, آلبوم کیپاپ, ترجمه آهنگ های کره ای"
        : "K-pop streaming, K-pop lyrics, K-pop songs, Korean music, albums, artist discography",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": currentLangData.title,
        "description": currentLangData.desc,
        "url": canonical,
      },
      hreflang: {
        en: `${canonical}?lang=en`,
        fa: `${canonical}?lang=fa`,
        ko: `${canonical}?lang=ko`,
      },
    };

    applySeo(defaultMeta, lang);
  }, [route, detail, selectedNewsId, deepLinkTrackId, lang]);

  return null;
}
