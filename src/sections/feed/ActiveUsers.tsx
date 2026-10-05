import { useState } from "react";
import { motion } from "framer-motion";
import { Shelf, Row } from "./Shelf";
import { Avatar } from "../../ui/Avatar";
import { Icon } from "../../ui/Icon";
import { PillButton } from "../../ui/primitives";
import { activeUsers } from "../../data/feed";
import { fanPoints } from "../../data/points";
import { LeaderboardDialog } from "../../ui/LeaderboardDialog";
import { PointsDialog, type PointsSubject } from "../../ui/PointsDialog";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";
import { usePreferences } from "../../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Shelf 6 — the most active listeners: circular profile, level and the
 *  points their activity has earned. The number on the card is derived
 *  from the five rules in data/points.ts; opening a card shows the sums.
 * ------------------------------------------------------------------ */

export function ActiveUsers() {
  const { t, num } = usePreferences();
  /** the listener whose points breakdown is open */
  const [subject, setSubject] = useState<PointsSubject | null>(null);
  /** the five columns, side by side */
  const [boardOpen, setBoardOpen] = useState(false);

  const inspect = (user: (typeof activeUsers)[number]) =>
    setSubject({
      name: user.name,
      handle: user.handle,
      photo: user.photo,
      seed: user.seed,
      meta: `${user.handle} · ${t("fans.level", { n: user.level })} · ${t("fans.streak", { n: user.streak })}`,
      activity: user.activity,
    });

  return (
    <>
    <Shelf
      id="feed-users"
      icon="activity"
      title={t("shelf.activeListeners")}
      hint={t("shelf.hintLive")}
      action={
        <PillButton tone="soft" icon="crown" onClick={() => setBoardOpen(true)}>
          {t("shelf.leaderboard")}
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
              onClick={() => inspect(user)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inspect(user);
                }
              }}
              role="button"
              tabIndex={0}
              title={t("points.open")}
              aria-label={`${user.name} ${user.handle} — ${t("points.open")}`}
              className={cn(
                "group relative flex w-[150px] shrink-0 cursor-pointer snap-start flex-col items-center gap-2 rounded-[16px] border p-3 text-center transition-colors lg:w-[176px] lg:gap-2.5 lg:rounded-[18px] lg:p-3.5",
                medal ? "border-primary/25 bg-primary-faint/70" : "border-line/80 bg-surface hover:border-primary/20",
              )}
            >
              {/* rank ribbon */}
              <span
                className={cn(
"absolute start-2 top-2 flex items-center gap-1.5 rounded-full px-1.5 py-[1px] text-[12px] font-extrabold lg:start-2.5 lg:top-2.5 lg:px-2 lg:py-[2px]",
                  medal ? "bg-primary text-white" : "bg-subtle text-ink-muted",
                )}
              >
                {medal ? <Icon name="crown" size={11} strokeWidth={2.2} /> : `#${num(i + 1)}`}
                {medal && <span className="tabular-nums">{num(i + 1)}</span>}
              </span>

              {user.online && (
                <span className="absolute end-2.5 top-3 size-2 rounded-full bg-mint ring-2 ring-surface" title={t("shelf.onlineNow")} />
              )}

              {/* circular profile */}
              <span className="relative mt-3 lg:mt-3.5">
                <Avatar src={user.photo} seed={user.seed} size={56} className={medal ? "ring-2 ring-primary ring-offset-2" : ""} />
              </span>

              <span className="w-full">
                <span className="flex items-center justify-center gap-1.5">
                  <span className="truncate text-[13px] font-bold text-ink lg:text-[14px]">{user.name}</span>
                </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-faint lg:mt-1">{user.handle}</span>
              </span>

              <span className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-1.5 rounded-full bg-flame-soft px-2 py-0.5 text-[12.5px] font-extrabold tabular-nums text-flame-deep lg:px-2.5 lg:py-1 lg:text-[13.5px]">
                  <Icon name="flame" size={12.5} strokeWidth={2} />
                  {num(fanPoints(user.activity))}
                </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted lg:gap-2">
                  <span className="rounded-full bg-subtle px-2 py-[1px]">
                    {t("fans.level", { n: user.level })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="bolt" size={11} strokeWidth={2.2} className="text-primary" />
                    {t("fans.streak", { n: user.streak })}
                  </span>
                </span>
              </span>
            </motion.div>
          );
        })}
      </Row>
      </Shelf>

      <PointsDialog open={!!subject} onClose={() => setSubject(null)} subject={subject} />
      <LeaderboardDialog open={boardOpen} onClose={() => setBoardOpen(false)} />
    </>
  );
}
