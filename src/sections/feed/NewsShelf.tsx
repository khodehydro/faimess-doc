import { motion } from "framer-motion";
import { Shelf } from "./Shelf";
import { Thumb } from "../../ui/Scenes";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { newsItems } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

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
  const { navigate, notify } = useApp();

  return (
    <Shelf
      id="feed-news"
      icon="news"
      title="Latest news"
      hint="K-pop desk"
      action={
        <PillButton tone="soft" icon="arrowUpRight" onClick={() => navigate("news")}>
          Go to news
        </PillButton>
      }
    >
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
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
            aria-label={item.title}
            className="group flex cursor-pointer items-center gap-3 overflow-hidden rounded-[16px] border border-line/80 bg-surface p-2.5 text-left transition-colors hover:border-primary/25"
          >
            <span className="relative h-[62px] w-[92px] shrink-0 overflow-hidden rounded-[12px]">
              <Thumb scene={item.scene} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className={cn("rounded-full px-2 py-[2px] text-[12px] font-bold uppercase tracking-wide", TAG_TONE[item.tag])}>
                  {item.tag}
                </span>
                <span className="truncate text-[12px] text-ink-faint">{item.ago}</span>
              </span>
              <span className="mt-1 block line-clamp-2 text-[14px] font-bold leading-snug text-ink">{item.title}</span>
              <span className="mt-1 flex items-center gap-1 text-[12px] text-ink-muted">
                <Icon name="news" size={12} />
                {item.source}
              </span>
            </span>
            <motion.span
              transition={spring}
              className="mr-0.5 shrink-0 text-ink-faint transition-colors group-hover:text-primary"
            >
              <Icon name="chevronRight" size={16.5} strokeWidth={2} />
            </motion.span>
          </motion.div>
        ))}
      </div>
    </Shelf>
  );
}
