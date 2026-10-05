import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/primitives";
import { forwardIcon } from "../lib/rtl";
import { Icon } from "../ui/Icon";
import { Photo } from "../ui/Cover";
import { Avatar } from "../ui/Avatar";
import { newsItems, type NewsItem } from "../data/feed";
import { useApp } from "../app/AppContext";
import { cn } from "../lib/cn";
import { EASE, popChild, staggerParent } from "../lib/motion";
import { usePreferences } from "../app/PreferencesContext";
import { NewsHeroBanner } from "../sections/news/NewsHeroBanner";
import { NewsDetailView } from "../sections/news/NewsDetailView";

/* ------------------------------------------------------------------ *
 *  News page (#/news) — reached from the feed's “Go to news” action
 *  and notifications. Supports top banners, trending news (by likes),
 *  latest news, most discussed (by comments), and detailed news reading.
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
  const { navigate, selectedNewsId, openNews } = useApp();
  const { t, dir, dataLabel, text, locale } = usePreferences();
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");

  // If a specific news item is opened, show its detail view
  if (selectedNewsId) {
    return <NewsDetailView newsId={selectedNewsId} />;
  }

  const trendingItems = [...newsItems].sort((a, b) => b.likes - a.likes);
  const latestItems = [...newsItems];
  const mostDiscussedItems = [...newsItems].sort((a, b) => b.commentsCount - a.commentsCount);

  const filteredItems = tag === "All" ? newsItems : newsItems.filter((n) => n.tag === tag);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pb-4 lg:pb-5">
        <div className="min-w-0">
          <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.018em] text-ink lg:text-[26px]">
            {t("news.title")}
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted lg:mt-1.5 lg:text-[13.5px]">
            {t("news.subtitle")}
          </p>
        </div>

        {/* Category tags */}
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

      {tag === "All" ? (
        <div className="space-y-7 lg:space-y-9">
          {/* Top Hero Banner Slider */}
          <NewsHeroBanner />

          {/* ---------------- Shelf 1: Trending News (by likes) ---------------- */}
          <section>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-flame-soft text-flame">
                  <Icon name="heart" size={14} strokeWidth={2.2} className="fill-current" />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink lg:text-[18px]">
                    {t("news.shelf.trending")}
                  </h3>
                  <p className="text-[12px] text-ink-muted">{t("news.shelf.trendingDesc")}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {trendingItems.slice(0, 3).map((item) => (
                <motion.div
                  key={`trending-${item.id}`}
                  whileHover={{ y: -4 }}
                  onClick={() => openNews(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openNews(item.id);
                    }
                  }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float"
                >
                  <div className="relative h-[120px] w-full overflow-hidden">
                    <Photo src={item.photo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span
                      className={cn(
                        "absolute start-2.5 top-2.5 rounded-full px-2 py-0.5 text-[12px] font-bold backdrop-blur-md",
                        TAG_TONE[item.tag],
                      )}
                    >
                      {dataLabel(item.tag)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3.5">
                    <h4 className="font-display line-clamp-2 text-[14px] font-bold leading-snug text-ink group-hover:text-primary lg:text-[15px]">
                      {text(`news.${item.id}.title`, item.title)}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[12px] text-ink-muted">
                      {text(`news.${item.id}.excerpt`, item.excerpt)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 text-[12px] text-ink-faint">
                      <span className="flex items-center gap-1 font-bold text-flame">
                        <Icon name="heart" size={12} strokeWidth={2.2} className="fill-current" />
                        <span>{item.likes.toLocaleString(locale)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="message" size={12} strokeWidth={2} />
                        <span>{item.commentsCount.toLocaleString(locale)}</span>
                      </span>
                      <span>{dataLabel(item.ago)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ---------------- Shelf 2: Latest News ---------------- */}
          <section>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                  <Icon name="news" size={14} strokeWidth={2.1} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink lg:text-[18px]">
                    {t("news.shelf.latest")}
                  </h3>
                  <p className="text-[12px] text-ink-muted">{t("news.shelf.latestDesc")}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-3.5">
              {latestItems.map((item) => (
                <motion.div
                  key={`latest-${item.id}`}
                  whileHover={{ y: -3 }}
                  onClick={() => openNews(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openNews(item.id);
                    }
                  }}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-card"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <Photo src={item.photo} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold", TAG_TONE[item.tag])}>
                        {dataLabel(item.tag)}
                      </span>
                      <span className="text-[12px] text-ink-faint">· {dataLabel(item.ago)}</span>
                    </div>
                    <h4 className="font-display mt-1 truncate text-[13.5px] font-bold text-ink group-hover:text-primary lg:text-[14.5px]">
                      {text(`news.${item.id}.title`, item.title)}
                    </h4>
                    <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                      {text(`news.${item.id}.excerpt`, item.excerpt)}
                    </p>
                  </div>
                  <span className="ms-auto shrink-0 text-ink-faint transition-colors group-hover:text-primary">
                    <Icon name={forwardIcon(dir)} size={14} strokeWidth={2.2} />
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ---------------- Shelf 3: Most Discussed (by comment count) ---------------- */}
          <section>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-teal-soft text-teal-deep">
                  <Icon name="message" size={14} strokeWidth={2.1} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink lg:text-[18px]">
                    {t("news.shelf.mostDiscussed")}
                  </h3>
                  <p className="text-[12px] text-ink-muted">{t("news.shelf.mostDiscussedDesc")}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {mostDiscussedItems.slice(0, 3).map((item) => (
                <motion.div
                  key={`discussed-${item.id}`}
                  whileHover={{ y: -4 }}
                  onClick={() => openNews(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openNews(item.id);
                    }
                  }}
                  className="group flex cursor-pointer flex-col justify-between rounded-card border border-line bg-surface p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-float"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold", TAG_TONE[item.tag])}>
                        {dataLabel(item.tag)}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-teal-soft px-2.5 py-0.5 text-[12px] font-bold text-teal-deep">
                        <Icon name="message" size={12} strokeWidth={2.2} />
                        <span>{item.commentsCount.toLocaleString(locale)}</span>
                      </span>
                    </div>

                    <h4 className="font-display mt-2.5 line-clamp-2 text-[14px] font-bold leading-snug text-ink group-hover:text-primary lg:text-[15px]">
                      {text(`news.${item.id}.title`, item.title)}
                    </h4>

                    {item.comments[0] && (
                      <div className="mt-3 rounded-lg bg-subtle p-2 text-[12px] text-ink-muted">
                        <span className="font-bold text-ink">{item.comments[0].author}: </span>
                        <span className="line-clamp-2">“{item.comments[0].text}”</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 text-[12px] text-ink-faint">
                    <div className="flex items-center gap-1.5">
                      <Avatar src={item.author.avatar} seed={item.author.seed} size={20} />
                      <span>{item.author.name}</span>
                    </div>
                    <span>{dataLabel(item.ago)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Filtered Grid for selected category */
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tag}
            variants={staggerParent(0.04)}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
            className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2.5 lg:grid-cols-3 lg:gap-4"
          >
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                variants={popChild}
                whileHover={{ y: -4 }}
                onClick={() => openNews(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openNews(item.id);
                  }
                }}
                className={cn(
                  "group flex cursor-pointer flex-col overflow-hidden rounded-card bg-surface text-start shadow-card ring-1 ring-line/70 transition-shadow hover:shadow-float",
                  i === 0 && "lg:col-span-3 lg:flex-row",
                )}
              >
                <div className={cn("relative block overflow-hidden", i === 0 ? "h-[140px] lg:h-auto lg:w-[380px]" : "h-[120px]")}>
                  <Photo src={item.photo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span
                    className={cn(
                      "absolute start-2.5 top-2.5 rounded-full px-2 py-[2px] text-[12px] font-bold tracking-wide backdrop-blur-md lg:start-3 lg:top-3 lg:px-2.5 lg:py-[3px]",
                      TAG_TONE[item.tag],
                    )}
                  >
                    {dataLabel(item.tag)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-3 lg:p-4">
                  <span className="font-display text-[14.5px] font-bold leading-snug tracking-[-0.008em] text-ink lg:text-[16px]">
                    {text(`news.${item.id}.title`, item.title)}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted lg:mt-2 lg:text-[13.5px]">
                    {text(`news.${item.id}.excerpt`, item.excerpt)}
                  </span>
                  <div className="mt-auto flex items-center gap-1.5 pt-2.5 text-[12px] text-ink-faint lg:gap-2 lg:pt-3 lg:text-[12.5px]">
                    <Icon name="news" size={12.5} />
                    {dataLabel(item.source)}
                    <span>·</span>
                    {dataLabel(item.ago)}
                    <span className="ms-auto flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-flame">
                        <Icon name="heart" size={12} strokeWidth={2} className="fill-current" />
                        <span>{item.likes.toLocaleString(locale)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="message" size={12} strokeWidth={2} />
                        <span>{item.commentsCount.toLocaleString(locale)}</span>
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
