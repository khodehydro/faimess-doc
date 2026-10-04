/* ------------------------------------------------------------------ *
 *  Shop — the merch shelf the main menu links to.
 *
 *  This is a *link-out* catalogue, not a checkout: every card opens the
 *  product on the store site (STORE_HOST) and nothing is bought inside
 *  the app. Prices are in Toman, the way the store prices them.
 * ------------------------------------------------------------------ */

import hoodiePhoto from "../assets/photos/shop/hoodie.webp";
import sneakersPhoto from "../assets/photos/shop/sneakers.webp";
import braceletPhoto from "../assets/photos/shop/bracelet.webp";
import photocardsPhoto from "../assets/photos/shop/photocards.webp";
import capPhoto from "../assets/photos/shop/cap.webp";
import totePhoto from "../assets/photos/shop/tote.webp";
import lightstickPhoto from "../assets/photos/shop/lightstick.webp";
import teePhoto from "../assets/photos/shop/tee.webp";
import buckethatPhoto from "../assets/photos/shop/buckethat.webp";
import phonecasePhoto from "../assets/photos/shop/phonecase.webp";
import keyringPhoto from "../assets/photos/shop/keyring.webp";
import postersPhoto from "../assets/photos/shop/posters.webp";
import mugPhoto from "../assets/photos/shop/mug.webp";
import socksPhoto from "../assets/photos/shop/socks.webp";
import backpackPhoto from "../assets/photos/shop/backpack.webp";
import bomberPhoto from "../assets/photos/shop/bomber.webp";
import earringsPhoto from "../assets/photos/shop/earrings.webp";
import stickersPhoto from "../assets/photos/shop/stickers.webp";

/** where a product card takes you — the store lives on its own host */
export const STORE_HOST = "store.faimess.app";

export const productUrl = (id: string) => `https://${STORE_HOST}/p/${id}`;

export type ShopCategoryId = "all" | "apparel" | "accessories" | "collectibles";

/** the filter pills, in the order they are shown */
export const SHOP_CATEGORIES: ShopCategoryId[] = ["all", "apparel", "accessories", "collectibles"];

/** the badge in the corner of a card — `null` means "nothing to shout about" */
export type ShopBadge = "new" | "bestseller" | "low";

export type ShopProduct = {
  id: string;
  /** the product name itself; the same words go to the store site */
  name: string;
  photo: string;
  category: Exclude<ShopCategoryId, "all">;
  /** in Toman — grouped per locale by `toman()` */
  price: number;
  /** the old price, when the item is on sale */
  wasPrice?: number;
  badge?: ShopBadge;
};

export const shopProducts: ShopProduct[] = [
  {
    id: "hoodie-onstage",
    name: "On Stage hoodie",
    photo: hoodiePhoto,
    category: "apparel",
    price: 1_890_000,
    wasPrice: 2_350_000,
    badge: "bestseller",
  },
  {
    id: "sneakers-lilac",
    name: "Lilac court sneakers",
    photo: sneakersPhoto,
    category: "apparel",
    price: 3_240_000,
    badge: "new",
  },
  {
    id: "bracelet-star",
    name: "Star charm bracelet",
    photo: braceletPhoto,
    category: "accessories",
    price: 640_000,
  },
  {
    id: "photocards",
    name: "Photocard set",
    photo: photocardsPhoto,
    category: "collectibles",
    price: 380_000,
    badge: "bestseller",
  },
  {
    id: "cap-midnight",
    name: "Midnight cap",
    photo: capPhoto,
    category: "apparel",
    price: 720_000,
  },
  {
    id: "tote-canvas",
    name: "Canvas tote",
    photo: totePhoto,
    category: "accessories",
    price: 540_000,
    wasPrice: 680_000,
  },
  {
    id: "lightstick-heart",
    name: "Heart lightstick",
    photo: lightstickPhoto,
    category: "collectibles",
    price: 1_450_000,
    badge: "new",
  },
  {
    id: "tee-lavender",
    name: "Lavender tee",
    photo: teePhoto,
    category: "apparel",
    price: 780_000,
    badge: "low",
  },
  {
    id: "bomber-black",
    name: "Satin bomber",
    photo: bomberPhoto,
    category: "apparel",
    price: 2_980_000,
  },
  {
    id: "buckethat-lilac",
    name: "Lilac bucket hat",
    photo: buckethatPhoto,
    category: "apparel",
    price: 690_000,
  },
  {
    id: "socks-star",
    name: "Star crew socks",
    photo: socksPhoto,
    category: "apparel",
    price: 260_000,
  },
  {
    id: "backpack-tour",
    name: "Tour backpack",
    photo: backpackPhoto,
    category: "accessories",
    price: 1_680_000,
    badge: "bestseller",
  },
  {
    id: "phonecase-lilac",
    name: "Photocard phone case",
    photo: phonecasePhoto,
    category: "accessories",
    price: 420_000,
    badge: "new",
  },
  {
    id: "keyring-star",
    name: "Acrylic keyring",
    photo: keyringPhoto,
    category: "accessories",
    price: 190_000,
  },
  {
    id: "earrings-crystal",
    name: "Crystal hoop earrings",
    photo: earringsPhoto,
    category: "accessories",
    price: 480_000,
  },
  {
    id: "poster-set",
    name: "Poster set · 3 prints",
    photo: postersPhoto,
    category: "collectibles",
    price: 460_000,
  },
  {
    id: "stickers-pack",
    name: "Sticker pack · 24 pcs",
    photo: stickersPhoto,
    category: "collectibles",
    price: 150_000,
  },
  {
    id: "mug-lilac",
    name: "Lilac mug",
    photo: mugPhoto,
    category: "collectibles",
    price: 350_000,
    badge: "low",
  },
];

/** `1890000` → `1,890,000` — grouped the way the reader's locale groups */
export const toman = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
