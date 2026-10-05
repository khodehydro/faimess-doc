import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/primitives";
import { forwardIcon } from "../lib/rtl";
import { Thumb } from "../ui/Scenes";
import { Icon } from "../ui/Icon";
import { newsItems, type NewsItem } from "../data/feed";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, popChild, staggerParent } from "../lib/motion";
import { useState } from "react";
import { usePreferences } from "../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  News page (#/news) — reached from the feed's “Go to news” action.
 * ------------------------------------------------------------------ */

const TAGS: Array<NewsItem["tag"] | "All"> = ["All", "Comeback", "Tour", "Charts", "Awards", "Editorial"];
const TAG_KEY: Record<string, string> = {
  All: "news.tag.all",
  Comeback: "news.tag.comeback",
  Tour: "news.tag.tour",
  Charts: "news.tag.charts",
  Awards: "news.tag.awards",
  Editorial: "news.tag.editorial",
};

const TAG_TONE: Record<string, string> = {
  Comeback: "bg-primary-soft text-primary-deep",
  Tour: "bg-teal-soft text-teal-deep",
  Charts: "bg-mint-soft text-teal-deep",
  Editorial: "bg-muted text-ink-body",
  Awards: "bg-flame-soft text-flame-deep",
};

export function NewsPage() {
  const { notify, navigate } = useApp();
  const { t, dir, dataLabel, text } = usePreferences();
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");

  const items = tag === "All" ? newsItems : newsItems.filter((n) => n.tag === tag);

  return (
    /* content only: the Shell owns the card, so the player stays beside it */
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pb-4 lg:pb-5">
        <div className="min-w-0">
          <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.018em] text-ink lg:text-[26px]">
            {t("news.title")}
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted lg:mt-1.5 lg:text-[13.5px]">{t("news.subtitle")}</p>
        </div>
        {/* the five tags scroll sideways on a phone instead of wrapping the
            header into three rows */}
        <div className="scroll-rail flex min-w-0 basis-full items-center gap-1.5 overflow-x-auto py-1 lg:ms-auto lg:basis-auto lg:gap-2 lg:overflow-visible">
          {TAGS.map((tagName) => (
            <PillButton key={tagName} active={tag === tagName} className="shrink-0" onClick={() => setTag(tagName)}>
              {t(TAG_KEY[tagName] ?? "news.tag.all")}
            </PillButton>
          ))}
          <PillButton tone="soft" icon={forwardIcon(dir)} onClick={() => navigate("home")}>
            {t("news.backHome")}
          </PillButton>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tag}
          variants={staggerParent(0.04)}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
          className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2.5 lg:grid-cols-3 lg:gap-4"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              variants={popChild}
              whileHover={{ y: -5 }}
              onClick={() => notify(t("toast.opening", { name: text(`news.${item.id}.title`, item.title) }))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  notify(t("toast.opening", { name: text(`news.${item.id}.title`, item.title) }));
                }
              }}
              className={cn(
                "group flex cursor-pointer flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float",
                i === 0 && "lg:col-span-3 lg:flex-row",
              )}
            >
              <span className={cn("relative block overflow-hidden", i === 0 ? "h-[132px] lg:h-auto lg:w-[380px]" : "h-[108px]")}>
                <Thumb scene={item.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]" />
                  <span className={cn("absolute start-2.5 top-2.5 rounded-full px-2 py-[2px] text-[12px] font-bold tracking-wide backdrop-blur lg:start-3 lg:top-3 lg:px-2.5 lg:py-[3px]", TAG_TONE[item.tag])}>
                  {dataLabel(item.tag)}
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
                <span className="font-display text-[14.5px] font-bold leading-snug tracking-[-0.008em] text-ink lg:text-[16px]">
                  {text(`news.${item.id}.title`, item.title)}
                </span>
                <span className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted lg:mt-2 lg:text-[13.5px]">
                  {text(`news.${item.id}.excerpt`, item.excerpt)}
                </span>
                <span className="mt-auto flex items-center gap-1.5 pt-2.5 text-[12px] text-ink-faint lg:gap-2 lg:pt-3 lg:text-[12.5px]">
                  <Icon name="news" size={12.5} />
                  {dataLabel(item.source)}
                  <span>·</span>
                  {dataLabel(item.ago)}
                  <span className="ms-auto text-ink-muted transition-colors group-hover:text-primary">
                    <Icon name="arrowUpRight" size={14.5} strokeWidth={2} />
                  </span>
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
