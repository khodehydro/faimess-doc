import { motion } from "framer-motion";
import { Shelf, Row } from "./Shelf";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { activeUsers } from "../../data/feed";
import { useApp } from "../../app/AppContext";
import { withThousands } from "../../lib/format";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shelf 6 — the most active listeners: circular profile, level and
 *  the points they earned this season.
 * ------------------------------------------------------------------ */

export function ActiveUsers() {
  const { notify } = useApp();

  return (
    <Shelf
      id="feed-users"
      icon="activity"
      title="Active listeners"
      hint="updated live"
      action={
        <PillButton tone="soft" icon="crown" onClick={() => notify("Opening the season leaderboard")}>
          Leaderboard
        </PillButton>
      }
    >
      <Row>
        {activeUsers.map((user, i) => {
          const medal = i < 3;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.04 } }}
              whileHover={{ y: -4 }}
              transition={spring}
              onClick={() => notify(`Opening ${user.handle}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  notify(`Opening ${user.handle}`);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${user.name} ${user.handle}`}
              className={cn(
                "group relative flex w-[170px] shrink-0 cursor-pointer snap-start flex-col items-center gap-2 rounded-[18px] border p-3 text-center transition-colors",
                medal ? "border-primary/25 bg-primary-faint/70" : "border-line/80 bg-surface hover:border-primary/20",
              )}
            >
              {/* rank ribbon */}
              <span
                className={cn(
                  "absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[12px] font-extrabold",
                  medal ? "bg-primary text-white" : "bg-subtle text-ink-muted",
                )}
              >
                {medal ? <Icon name="crown" size={11} strokeWidth={2.2} /> : `#${i + 1}`}
                {medal && <span className="tabular-nums">{i + 1}</span>}
              </span>

              {user.online && (
                <span className="absolute right-2.5 top-3 size-2 rounded-full bg-mint ring-2 ring-white" title="Online now" />
              )}

              {/* circular profile */}
              <span className="relative mt-3">
                <Avatar src={user.photo} seed={user.seed} size={56} className={medal ? "ring-2 ring-primary ring-offset-2" : ""} />
              </span>

              <span className="w-full">
                <span className="flex items-center justify-center gap-1">
                  <span className="truncate text-[14px] font-bold text-ink">{user.name}</span>
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-faint">{user.handle}</span>
              </span>

              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1 rounded-full bg-flame-soft px-2 py-0.5 text-[13.5px] font-extrabold tabular-nums text-flame-deep">
                  <Icon name="flame" size={12.5} strokeWidth={2} />
                  {withThousands(user.points)}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
                  <span className="rounded-full bg-subtle px-1.5 py-[1px]">Lv {user.level}</span>
                  <span className="flex items-center gap-0.5">
                    <Icon name="bolt" size={11} strokeWidth={2.2} className="text-primary" />
                    {user.streak}d
                  </span>
                </span>
              </span>
            </motion.div>
          );
        })}
      </Row>
    </Shelf>
  );
}
