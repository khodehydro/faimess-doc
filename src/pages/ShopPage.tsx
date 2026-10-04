import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { PillButton } from "../ui/primitives";
import { usePreferences } from "../app/PreferencesContext";
import {
  productUrl,
  shopProducts,
  SHOP_CATEGORIES,
  STORE_HOST,
  toman,
  type ShopProduct,
} from "../data/shop";
import { EASE, staggerParent, popChild } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shop (#/shop) — the merch shelf.
 *
 *  A catalogue, nothing more: the products, their prices in Toman, and a
 *  card that opens the item on the store site. No bag, no checkout, no
 *  payment — the app never pretends to sell anything itself. The page is
 *  long on purpose, so the content card scrolls like a shelf does.
 * ------------------------------------------------------------------ */

function ProductCard({ product }: { product: ShopProduct }) {
  const { t, locale } = usePreferences();
  return (
    <motion.a
      variants={popChild}
      href={productUrl(product.id)}
      target="_blank"
      rel="noopener noreferrer"
      title={t("shop.openOnStore", { name: product.name })}
      className="group flex min-h-0 flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
    >
      <div className="relative aspect-square overflow-hidden">
        <Photo
          src={product.photo}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {product.badge && (
          <span className="absolute start-2.5 top-2.5 rounded-full bg-surface/92 px-2.5 py-1 text-[12px] font-bold text-ink">
            {t(`shop.badge.${product.badge}`)}
          </span>
        )}
        {/* the whole card is a link — this only says out loud where it goes */}
        <span className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {t("shop.onStore")}
          <Icon name="arrowUpRight" size={12.5} strokeWidth={2.2} />
        </span>
      </div>

      <div className="flex items-start gap-2 p-3">
        <p className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{product.name}</p>
        <span className="flex shrink-0 flex-col items-end">
          {product.wasPrice && (
            <span className="text-[12px] font-semibold tabular-nums text-ink-faint line-through">
              {toman(product.wasPrice, locale)}
            </span>
          )}
          <span className="text-[14.5px] font-bold tabular-nums text-ink">
            {toman(product.price, locale)}
            <span className="ms-1 text-[12px] font-semibold text-ink-muted">
              {t("shop.currency")}
            </span>
          </span>
        </span>
      </div>
    </motion.a>
  );
}

export function ShopPage() {
  const { t } = usePreferences();
  const [category, setCategory] = useState<(typeof SHOP_CATEGORIES)[number]>("all");

  const shown = useMemo(
    () =>
      category === "all"
        ? shopProducts
        : shopProducts.filter((product) => product.category === category),
    [category],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6 lg:p-7">
      {/* header */}
      <div className="flex items-start gap-4 pb-1.5">
        <div className="min-w-0">
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.018em] text-ink">
            {t("shop.title")}
          </h2>
          <p className="mt-1.5 truncate text-[13.5px] text-ink-muted">{t("shop.subtitle")}</p>
        </div>
        <span className="ms-auto flex shrink-0 items-center gap-2 rounded-full bg-subtle px-3.5 py-2 text-[12.5px] font-semibold text-ink-muted">
          <Icon name="shop" size={14} strokeWidth={2} />
          {t("shop.host", { host: STORE_HOST })}
        </span>
      </div>

      {/* the one thing a visitor has to know before clicking */}
      <p className="flex items-center gap-2 pb-4 text-[12.5px] font-semibold leading-relaxed text-ink-faint">
        <Icon name="arrowUpRight" size={13.5} strokeWidth={2.2} className="shrink-0 text-primary" />
        {t("shop.redirectNote")}
      </p>

      {/* categories */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {SHOP_CATEGORIES.map((id) => (
          <PillButton key={id} active={category === id} onClick={() => setCategory(id)}>
            {t(`shop.category.${id}`)}
          </PillButton>
        ))}
        <span className="ms-auto text-[12.5px] font-semibold text-ink-faint">
          {t("shop.count", { n: shown.length })}
        </span>
      </div>

      {/* the shelf — long enough that the content card scrolls */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          variants={staggerParent(0.025)}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE } }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
