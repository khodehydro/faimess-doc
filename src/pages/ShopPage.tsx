import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { Meta, PillButton } from "../ui/primitives";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import {
  money,
  shopProducts,
  SHOP_CATEGORIES,
  type ShopBadge,
  type ShopCategoryId,
  type ShopProduct,
} from "../data/shop";
import { cn } from "../lib/cn";
import { EASE, popChild, spring, staggerParent } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shop (#/shop) — the merch shelf.
 *
 *  A content-only page, like every other route since v26: the shell owns
 *  the card it sits in and the player keeps playing beside it. The demo
 *  has no backend, so "Add to bag" is honest about what it is — it counts
 *  the bag and says so, instead of pretending to take a card number.
 * ------------------------------------------------------------------ */

const BADGE_TONE: Record<ShopBadge, string> = {
  new: "bg-primary text-white",
  bestseller: "bg-ink text-white",
  low: "bg-flame text-white",
};

function ProductCard({ product, onAdd }: { product: ShopProduct; onAdd: () => void }) {
  const { t } = usePreferences();
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      variants={popChild}
      className="group flex min-h-0 flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Photo
          src={product.photo}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {product.badge && (
          <span
            className={cn(
              "absolute start-2.5 top-2.5 rounded-full px-2.5 py-1 text-[12px] font-bold",
              BADGE_TONE[product.badge],
            )}
          >
            {t(`shop.badge.${product.badge}`)}
          </span>
        )}
        {/* the standard merch hover: the whole card is the photo, and the
            one thing you might do with it appears when you point at it */}
        <motion.button
          type="button"
          onClick={onAdd}
          initial={false}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-white opacity-0 shadow-primary transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Icon name="bag" size={14} strokeWidth={2.2} />
          {t("shop.add")}
        </motion.button>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label={t(saved ? "shop.saved" : "shop.save")}
          title={t(saved ? "shop.saved" : "shop.save")}
          className={cn(
            "absolute end-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-surface/92 shadow-sm transition-colors",
            saved ? "text-primary" : "text-ink-muted hover:text-primary-deep",
          )}
        >
          <Icon name="heart" size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-ink">{product.name}</p>
          <Meta icon="star" iconSize={11} className="text-[12.5px] text-ink-muted">
            {product.rating.toFixed(1)} · {t("shop.reviews", { n: product.reviews })}
          </Meta>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          {product.wasPrice && (
            <span className="text-[12px] font-semibold text-ink-faint line-through">
              {money(product.wasPrice)}
            </span>
          )}
          <span className="text-[15px] font-bold tabular-nums text-ink">{money(product.price)}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function ShopPage() {
  const { t } = usePreferences();
  const { notify } = useApp();
  const [category, setCategory] = useState<ShopCategoryId>("all");
  /* the demo's bag: a count, not a checkout */
  const [bag, setBag] = useState(0);

  const shown = useMemo(
    () =>
      category === "all"
        ? shopProducts
        : shopProducts.filter((product) => product.category === category),
    [category],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      {/* header — the bag lives next to the copy, so it is always in sight */}
      <div className="flex items-start gap-4 pb-5">
        <div className="min-w-0">
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.018em] text-ink">
            {t("shop.title")}
          </h2>
          <p className="mt-1.5 truncate text-[13.5px] text-ink-muted">{t("shop.subtitle")}</p>
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-bold tabular-nums transition-colors",
              bag > 0 ? "bg-primary-faint text-primary-deep" : "bg-subtle text-ink-muted",
            )}
          >
            <Icon name="bag" size={15} strokeWidth={2.1} />
            {t("shop.bag", { n: bag })}
          </span>
        </div>
      </div>

      {/* categories */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {SHOP_CATEGORIES.map((id) => (
          <PillButton key={id} active={category === id} onClick={() => setCategory(id)}>
            {t(`shop.category.${id}`)}
          </PillButton>
        ))}
        <span className="ms-auto flex items-center gap-2 text-[12.5px] font-semibold text-ink-faint">
          <Icon name="shop" size={14} strokeWidth={2} />
          {t("shop.ships")}
        </span>
      </div>

      {/* shelf */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          variants={staggerParent(0.035)}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE } }}
          className="grid min-h-0 flex-1 grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {shown.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => {
                setBag((n) => n + 1);
                notify(t("shop.added", { name: product.name }), "mint");
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* the demo's own honesty line, where a cart summary would be */}
      <div className="flex items-center gap-3 pt-4">
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-relaxed text-ink-faint">
          {t("shop.demoNote")}
        </p>
        <motion.button
          whileHover={{ y: -1.5 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => notify(t("shop.shipsNote"), "primary")}
          disabled={bag === 0}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-[14px] px-4 py-2.5 text-[13.5px] font-bold transition-colors",
            bag > 0
              ? "bg-primary text-white shadow-primary"
              : "bg-subtle text-ink-faint",
          )}
        >
          <Icon name="bag" size={15} strokeWidth={2.2} />
          {t("shop.checkout")}
        </motion.button>
      </div>
    </div>
  );
}
