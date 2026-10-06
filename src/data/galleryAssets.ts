/* ------------------------------------------------------------------ *
 *  FAIMESS Media Gallery Assets Catalog
 *  Bundled high-resolution photography assets categorized for easy
 *  selection as featured images across tracks, albums, artists, etc.
 * ------------------------------------------------------------------ */

// Albums
import afterglowImg from "../assets/photos/albums/afterglow.webp";
import afterimageImg from "../assets/photos/albums/afterimage.webp";
import blueHourImg from "../assets/photos/albums/blue-hour.webp";
import cherryStaticImg from "../assets/photos/albums/cherry-static.webp";
import longExposureImg from "../assets/photos/albums/long-exposure.webp";
import midnightSeoulImg from "../assets/photos/albums/midnight-seoul.webp";
import neonBloomImg from "../assets/photos/albums/neon-bloom.webp";
import nightbloomImg from "../assets/photos/albums/nightbloom.webp";
import paperBoatsImg from "../assets/photos/albums/paper-boats.webp";
import paperHeartImg from "../assets/photos/albums/paper-heart.webp";
import slowMotionImg from "../assets/photos/albums/slow-motion.webp";
import tokyoWindowImg from "../assets/photos/albums/tokyo-window.webp";
import velvetStaticImg from "../assets/photos/albums/velvet-static.webp";

// Artists
import axionImg from "../assets/photos/artists/axion.webp";
import haneulImg from "../assets/photos/artists/haneul.webp";
import kairosImg from "../assets/photos/artists/kairos.webp";
import lunexImg from "../assets/photos/artists/lunex.webp";
import novaeImg from "../assets/photos/artists/novae.webp";
import prism9Img from "../assets/photos/artists/prism9.webp";
import seoraImg from "../assets/photos/artists/seora.webp";
import velvetMoonImg from "../assets/photos/artists/velvet-moon.webp";

// Playlists
import comebackImg from "../assets/photos/playlists/comeback.webp";
import deepFocusImg from "../assets/photos/playlists/deep-focus.webp";
import goldenHourImg from "../assets/photos/playlists/golden-hour.webp";
import midnightDriveImg from "../assets/photos/playlists/midnight-drive.webp";
import rainyWindowImg from "../assets/photos/playlists/rainy-window.webp";
import weekendResetImg from "../assets/photos/playlists/weekend-reset.webp";

// News & Banners
import asiaLegImg from "../assets/photos/banners/asia-leg.webp";
import tourAfterglowImg from "../assets/photos/banners/tour-afterglow.webp";
import midnightBannerImg from "../assets/photos/banners/midnight-seoul.webp";

// Shop
import backpackImg from "../assets/photos/shop/backpack.webp";
import bomberImg from "../assets/photos/shop/bomber.webp";
import braceletImg from "../assets/photos/shop/bracelet.webp";
import buckethatImg from "../assets/photos/shop/buckethat.webp";
import capImg from "../assets/photos/shop/cap.webp";
import earringsImg from "../assets/photos/shop/earrings.webp";
import hoodieImg from "../assets/photos/shop/hoodie.webp";
import keyringImg from "../assets/photos/shop/keyring.webp";
import lightstickImg from "../assets/photos/shop/lightstick.webp";
import mugImg from "../assets/photos/shop/mug.webp";
import phonecaseImg from "../assets/photos/shop/phonecase.webp";
import photocardsImg from "../assets/photos/shop/photocards.webp";
import postersImg from "../assets/photos/shop/posters.webp";
import sneakersImg from "../assets/photos/shop/sneakers.webp";
import socksImg from "../assets/photos/shop/socks.webp";
import stickersImg from "../assets/photos/shop/stickers.webp";
import teeImg from "../assets/photos/shop/tee.webp";
import toteImg from "../assets/photos/shop/tote.webp";

export type GalleryCategory =
  | "all"
  | "albums"
  | "artists"
  | "playlists"
  | "news"
  | "shop";

export type GalleryItem = {
  id: string;
  category: "albums" | "artists" | "playlists" | "news" | "shop";
  title: string;
  url: string;
};

export const GALLERY_ITEMS: GalleryItem[] = [
  // Albums
  { id: "alb-afterglow", category: "albums", title: "Afterglow", url: afterglowImg },
  { id: "alb-afterimage", category: "albums", title: "Afterimage", url: afterimageImg },
  { id: "alb-blue-hour", category: "albums", title: "Blue Hour", url: blueHourImg },
  { id: "alb-cherry-static", category: "albums", title: "Cherry Static", url: cherryStaticImg },
  { id: "alb-long-exposure", category: "albums", title: "Long Exposure", url: longExposureImg },
  { id: "alb-midnight-seoul", category: "albums", title: "Midnight Seoul", url: midnightSeoulImg },
  { id: "alb-neon-bloom", category: "albums", title: "Neon Bloom", url: neonBloomImg },
  { id: "alb-nightbloom", category: "albums", title: "Nightbloom", url: nightbloomImg },
  { id: "alb-paper-boats", category: "albums", title: "Paper Boats", url: paperBoatsImg },
  { id: "alb-paper-heart", category: "albums", title: "Paper Heart", url: paperHeartImg },
  { id: "alb-slow-motion", category: "albums", title: "Slow Motion", url: slowMotionImg },
  { id: "alb-tokyo-window", category: "albums", title: "Tokyo Window", url: tokyoWindowImg },
  { id: "alb-velvet-static", category: "albums", title: "Velvet Static", url: velvetStaticImg },

  // Artists
  { id: "art-axion", category: "artists", title: "AXION", url: axionImg },
  { id: "art-haneul", category: "artists", title: "Haneul", url: haneulImg },
  { id: "art-kairos", category: "artists", title: "KAIROS", url: kairosImg },
  { id: "art-lunex", category: "artists", title: "LUNEX", url: lunexImg },
  { id: "art-novae", category: "artists", title: "NOVAE", url: novaeImg },
  { id: "art-prism9", category: "artists", title: "PRISM9", url: prism9Img },
  { id: "art-seora", category: "artists", title: "SEORA", url: seoraImg },
  { id: "art-velvet-moon", category: "artists", title: "VELVET MOON", url: velvetMoonImg },

  // Playlists
  { id: "pl-comeback", category: "playlists", title: "Comeback Special", url: comebackImg },
  { id: "pl-deep-focus", category: "playlists", title: "Deep Focus", url: deepFocusImg },
  { id: "pl-golden-hour", category: "playlists", title: "Golden Hour", url: goldenHourImg },
  { id: "pl-midnight-drive", category: "playlists", title: "Midnight Drive", url: midnightDriveImg },
  { id: "pl-rainy-window", category: "playlists", title: "Rainy Window", url: rainyWindowImg },
  { id: "pl-weekend-reset", category: "playlists", title: "Weekend Reset", url: weekendResetImg },

  // News & Tours
  { id: "nw-asia-leg", category: "news", title: "Asia Tour Special", url: asiaLegImg },
  { id: "nw-tour-afterglow", category: "news", title: "Tour Afterglow", url: tourAfterglowImg },
  { id: "nw-midnight-banner", category: "news", title: "Midnight Festival", url: midnightBannerImg },

  // Shop
  { id: "sh-hoodie", category: "shop", title: "Tour Hoodie", url: hoodieImg },
  { id: "sh-tee", category: "shop", title: "Oversized Tee", url: teeImg },
  { id: "sh-lightstick", category: "shop", title: "Official Lightstick", url: lightstickImg },
  { id: "sh-backpack", category: "shop", title: "Waterproof Backpack", url: backpackImg },
  { id: "sh-cap", category: "shop", title: "Embroidered Cap", url: capImg },
  { id: "sh-sneakers", category: "shop", title: "High-top Sneakers", url: sneakersImg },
  { id: "sh-bomber", category: "shop", title: "Bomber Jacket", url: bomberImg },
  { id: "sh-keyring", category: "shop", title: "Acrylic Keyring", url: keyringImg },
  { id: "sh-photocards", category: "shop", title: "Collectible Photocards", url: photocardsImg },
  { id: "sh-posters", category: "shop", title: "A2 Matte Poster Set", url: postersImg },
  { id: "sh-bracelet", category: "shop", title: "Silver Chain Bracelet", url: braceletImg },
  { id: "sh-earrings", category: "shop", title: "Orbit Drop Earrings", url: earringsImg },
  { id: "sh-mug", category: "shop", title: "Ceramic Studio Mug", url: mugImg },
  { id: "sh-phonecase", category: "shop", title: "Impact Phone Case", url: phonecaseImg },
  { id: "sh-socks", category: "shop", title: "Crew Socks Set", url: socksImg },
  { id: "sh-stickers", category: "shop", title: "Holographic Sticker Pack", url: stickersImg },
  { id: "sh-tote", category: "shop", title: "Canvas Tote Bag", url: toteImg },
  { id: "sh-buckethat", category: "shop", title: "Reversible Bucket Hat", url: buckethatImg },
];
