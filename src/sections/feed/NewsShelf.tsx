import { motion } from "framer-motion";
import { Shelf } from "./Shelf";
import { Thumb } from "../../ui/Scenes";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { newsItems } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";
import { usePreferences } from "../../app/PreferencesContext";
import { forwardIcon } from "../../lib/rtl";

/* ------------------------------------------------------------------ *
 *  Shelf 4 — latest news, with a link through to the full news page.
 * ------------------------------------------------------------------ */

const TAG_TONE: Record<string, string> = {
  Comeback: "bg-primary-soft text-primary-deep",
  Tour: "bg-teal-soft text-teal-deep",
  Charts: "bg-mint-soft text-teal-deep",
  Editorial: "bg-muted text-ink-body",
  Awards: "bg-flame-soft text-flame-deep",
};

export function NewsShelf() {
  const { t, dir, dataLabel, text } = usePreferences();
  const { navigate, notify } = useApp();

  return (
    <Shelf
      id="feed-news"
      icon="news"
      title={t("shelf.latestNews")}
      hint={t("shelf.hintDesk")}
      action={
        <PillButton tone="soft" icon="arrowUpRight" onClick={() => navigate("news")}>
          {t("shelf.goToNews")}
        </PillButton>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-4">
        {newsItems.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("news")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("news");
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={text(`news.${item.id}.title`, item.title)}
            className="group flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-[14px] border border-line/80 bg-surface p-2.5 text-start transition-colors hover:border-primary/25 lg:gap-3.5 lg:rounded-[16px] lg:p-3"
          >
            <span className="relative h-[56px] w-[82px] shrink-0 overflow-hidden rounded-[12px] lg:h-[66px] lg:w-[96px] lg:rounded-[13px]">
              <Thumb scene={item.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                  <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-[2px] text-[12px] font-bold tracking-wide lg:px-2.5", TAG_TONE[item.tag])}>
                  {dataLabel(item.tag)}
                </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-ink-faint">{dataLabel(item.ago)}</span>
              </span>
              <span className="mt-1 block line-clamp-2 text-[13px] font-bold leading-snug text-ink lg:mt-1.5 lg:text-[14px]">
                {text(`news.${item.id}.title`, item.title)}
              </span>
                <span className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-muted lg:mt-1.5">
                <Icon name="news" size={12} />
                {dataLabel(item.source)}
              </span>
            </span>
            <motion.span
              transition={spring}
              className="me-0.5 shrink-0 text-ink-faint transition-colors group-hover:text-primary"
            >
              <Icon name={forwardIcon(dir)} size={15} strokeWidth={2} className="lg:hidden" />
              <Icon name={forwardIcon(dir)} size={16.5} strokeWidth={2} className="hidden lg:block" />
            </motion.span>
          </motion.div>
        ))}
      </div>
    </Shelf>
  );
}
