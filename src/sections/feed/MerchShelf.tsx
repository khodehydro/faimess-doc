import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shelf, Row } from "./Shelf";
import { Photo } from "../../ui/Cover";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import {
  shopProducts,
  productUrl,
  toman,
  type ShopProduct,
} from "../../data/shop";
import { useApp } from "../../app/AppContext";
import { forwardIcon } from "../../lib/rtl";
import { spring } from "../../lib/motion";
import { usePreferences } from "../../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Merch Spotlight Shelf — random rotation of official merch goods.
 * ------------------------------------------------------------------ */

const SPOTLIGHT_COUNT = 6;

// Deterministic initial set for SSR
const INITIAL_PRODUCTS = shopProducts.slice(0, SPOTLIGHT_COUNT);

function pickRandomProducts(currentIds: string[] = []): ShopProduct[] {
  const pool = shopProducts.filter((p) => !currentIds.includes(p.id));
  const candidatePool = pool.length >= SPOTLIGHT_COUNT ? pool : [...shopProducts];
  const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, SPOTLIGHT_COUNT);
}

export function MerchShelf() {
  const { t, dir, locale } = usePreferences();
  const { navigate } = useApp();
  const [items, setItems] = useState<ShopProduct[]>(INITIAL_PRODUCTS);

  const randomize = useCallback(() => {
    setItems((prev) => pickRandomProducts(prev.map((p) => p.id)));
  }, []);

  // Client-side initial randomize on mount and window focus
  useEffect(() => {
    randomize();

    const onFocus = () => randomize();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [randomize]);

  return (
    <Shelf
      id="feed-merch"
      icon="shop"
      title={t("shelf.spotlightMerch")}
      hint={t("shelf.hintMerch")}
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={randomize}
            title={t("shelf.shuffleMerch")}
            className="flex size-7 items-center justify-center rounded-full bg-subtle text-ink-muted transition hover:bg-surface hover:text-ink shadow-2xs"
          >
            <Icon name="sparkle" size={13} strokeWidth={2} />
          </button>
          <PillButton tone="soft" icon={forwardIcon(dir)} onClick={() => navigate("shop")}>
            {t("shelf.allProducts")}
          </PillButton>
        </div>
      }
    >
      <Row>
        {items.map((product, i) => (
          <motion.a
            key={product.id}
            href={productUrl(product.id)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.04 } }}
            whileHover={{ y: -4 }}
            transition={spring}
            title={product.name}
            className="group flex w-[130px] shrink-0 flex-col snap-start overflow-hidden rounded-[15px] bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float lg:w-[150px]"
          >
            <div className="relative aspect-square overflow-hidden bg-subtle/50">
              <Photo
                src={product.photo}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              {product.badge && (
                <span className="absolute start-2 top-2 rounded-full bg-surface/92 px-2 py-0.5 text-[12px] font-bold text-ink backdrop-blur-xs">
                  {t(`shop.badge.${product.badge}`)}
                </span>
              )}
              <span className="absolute inset-x-2 bottom-2 hidden items-center justify-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[12px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:flex">
                <span>{t("shop.onStore")}</span>
                <Icon name="arrowUpRight" size={12} strokeWidth={2.2} />
              </span>
            </div>

            <div className="flex flex-col p-2.5">
              <p className="truncate text-[13px] font-bold text-ink lg:text-[13.5px]">
                {product.name}
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <span className="text-[12.5px] font-extrabold tabular-nums text-primary-deep lg:text-[13px]">
                  {toman(product.price, locale)}
                  <span className="ms-1 text-[12px] font-semibold text-ink-muted">
                    {t("shop.currency")}
                  </span>
                </span>
                {product.wasPrice && (
                  <span className="text-[12px] font-semibold tabular-nums text-ink-faint line-through">
                    {toman(product.wasPrice, locale)}
                  </span>
                )}
              </div>
            </div>
          </motion.a>
        ))}
      </Row>
    </Shelf>
  );
}
