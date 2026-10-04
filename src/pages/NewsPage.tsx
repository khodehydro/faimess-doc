import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/primitives";
import { Thumb } from "../ui/Scenes";
import { Icon } from "../ui/Icon";
import { newsItems, type NewsItem } from "../data/feed";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, popChild, staggerParent } from "../lib/motion";
import { useState } from "react";
import { SurfaceCard } from "../ui/primitives";
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
  const { t, dir } = usePreferences();
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");

  const items = tag === "All" ? newsItems : newsItems.filter((n) => n.tag === tag);

  return (
    <SurfaceCard dir={dir} className="p-6">
      <div className="flex items-center gap-4 pb-5">
        <div className="min-w-0">
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.018em] text-ink">
            {t("news.title")}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">{t("news.subtitle")}</p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {TAGS.map((tagName) => (
            <PillButton key={tagName} active={tag === tagName} onClick={() => setTag(tagName)}>
              {t(TAG_KEY[tagName] ?? "news.tag.all")}
            </PillButton>
          ))}
          <PillButton tone="soft" icon="arrowLeft" onClick={() => navigate("home")}>
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
          className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 lg:grid-cols-3"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              variants={popChild}
              whileHover={{ y: -5 }}
              onClick={() => notify(`Opening “${item.title}”`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  notify(`Opening “${item.title}”`);
                }
              }}
              className={cn(
                "group flex cursor-pointer flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float",
                i === 0 && "lg:col-span-3 lg:flex-row",
              )}
            >
              <span className={cn("relative block overflow-hidden", i === 0 ? "h-[150px] lg:h-auto lg:w-[380px]" : "h-[124px]")}>
                <Thumb scene={item.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]" />
                <span className={cn("absolute start-3 top-3 rounded-full px-2.5 py-[3px] text-[12px] font-bold uppercase tracking-wide backdrop-blur", TAG_TONE[item.tag])}>
                  {item.tag}
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col p-4">
                <span className="font-display text-[16px] font-bold leading-snug tracking-[-0.008em] text-ink">{item.title}</span>
                <span className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-muted">{item.excerpt}</span>
                <span className="mt-auto flex items-center gap-2 pt-3 text-[12.5px] text-ink-faint">
                  <Icon name="news" size={12.5} />
                  {item.source}
                  <span>·</span>
                  {item.ago}
                  <span className="ms-auto text-ink-muted transition-colors group-hover:text-primary">
                    <Icon name="arrowUpRight" size={14.5} strokeWidth={2} />
                  </span>
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </SurfaceCard>
  );
}
