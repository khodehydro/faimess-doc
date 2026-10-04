/* ------------------------------------------------------------------ *
 *  Shop — the merch shelf the main menu links to.
 *
 *  Same shape as the rest of `data/`: content only, no logic. Artwork is
 *  self-hosted like every other photo in the app, and the demo "assets"
 *  carry a lilac accent so the shelf reads as FAIMESS.
 * ------------------------------------------------------------------ */

import hoodiePhoto from "../assets/photos/shop/hoodie.webp";
import sneakersPhoto from "../assets/photos/shop/sneakers.webp";
import braceletPhoto from "../assets/photos/shop/bracelet.webp";
import photocardsPhoto from "../assets/photos/shop/photocards.webp";
import capPhoto from "../assets/photos/shop/cap.webp";
import totePhoto from "../assets/photos/shop/tote.webp";
import lightstickPhoto from "../assets/photos/shop/lightstick.webp";
import teePhoto from "../assets/photos/shop/tee.webp";

export type ShopCategoryId = "all" | "apparel" | "accessories" | "collectibles";

/** the filter pills, in the order they are shown */
export const SHOP_CATEGORIES: ShopCategoryId[] = ["all", "apparel", "accessories", "collectibles"];

/** the badge in the corner of a card — `null` means "nothing to shout about" */
export type ShopBadge = "new" | "bestseller" | "low";

export type ShopProduct = {
  id: string;
  /** the artwork's own alt text; the name comes from i18n */
  name: string;
  photo: string;
  category: Exclude<ShopCategoryId, "all">;
  /** in USD — the demo sells worldwide */
  price: number;
  /** the old price, when the item is on sale */
  wasPrice?: number;
  rating: number;
  reviews: number;
  badge?: ShopBadge;
  /** true once someone tapped the heart */
  saved?: boolean;
};

export const shopProducts: ShopProduct[] = [
  {
    id: "hoodie-onstage",
    name: "On Stage hoodie",
    photo: hoodiePhoto,
    category: "apparel",
    price: 68,
    wasPrice: 82,
    rating: 4.9,
    reviews: 412,
    badge: "bestseller",
  },
  {
    id: "sneakers-lilac",
    name: "Lilac court sneakers",
    photo: sneakersPhoto,
    category: "apparel",
    price: 119,
    rating: 4.7,
    reviews: 188,
    badge: "new",
  },
  {
    id: "bracelet-star",
    name: "Star charm bracelet",
    photo: braceletPhoto,
    category: "accessories",
    price: 34,
    rating: 4.8,
    reviews: 265,
  },
  {
    id: "photocards",
    name: "Photocard set",
    photo: photocardsPhoto,
    category: "collectibles",
    price: 22,
    rating: 5,
    reviews: 921,
    badge: "bestseller",
  },
  {
    id: "cap-midnight",
    name: "Midnight cap",
    photo: capPhoto,
    category: "apparel",
    price: 41,
    rating: 4.6,
    reviews: 143,
  },
  {
    id: "tote-canvas",
    name: "Canvas tote",
    photo: totePhoto,
    category: "accessories",
    price: 29,
    wasPrice: 36,
    rating: 4.7,
    reviews: 208,
  },
  {
    id: "lightstick-heart",
    name: "Heart lightstick",
    photo: lightstickPhoto,
    category: "collectibles",
    price: 54,
    rating: 4.9,
    reviews: 763,
    badge: "new",
  },
  {
    id: "tee-lavender",
    name: "Lavender tee",
    photo: teePhoto,
    category: "apparel",
    price: 39,
    rating: 4.5,
    reviews: 96,
    badge: "low",
  },
];

/** `$68` when it is a round number, `$68.50` when it is not */
export const money = (value: number) =>
  Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
