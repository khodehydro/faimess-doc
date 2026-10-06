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
import { useApp } from "../../app/AppContext";

/* ------------------------------------------------------------------ *
 *  Shelf 6 — the most active listeners: circular profile, level and the
 *  points their activity has earned. The number on the card is derived
 *  from the five rules in data/points.ts; opening a card shows the sums.
 * ------------------------------------------------------------------ */

export function ActiveUsers() {
  const { t, num } = usePreferences();
  const { openProfile } = useApp();
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
      {/* the rail reserves headroom (see `Row`): the card's top edge is the
          rank ribbon, and a lift or a ring must not be sliced off it */}
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
              onClick={() => openProfile(user.handle.replace(/^@/, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProfile(user.handle.replace(/^@/, ""));
                }
              }}
              role="button"
              tabIndex={0}
              title={`${user.name} (${user.handle})`}
              aria-label={`${user.name} ${user.handle}`}
              className={cn(
                /* the card is written physically (`dir="ltr"`): a logical
                   `top-2` inset on the ribbon landed on the *other* physical
                   edge from `start-2`, which poked it out of the card's
                   rounded corner and had it clipped by the rail's top edge */
                "group relative flex w-[150px] shrink-0 cursor-pointer snap-start flex-col items-center gap-2 rounded-[16px] border p-3 text-center transition-colors lg:w-[176px] lg:gap-2.5 lg:rounded-[18px] lg:p-3.5",
                medal ? "border-primary/25 bg-primary-faint/70" : "border-line/80 bg-surface hover:border-primary/20",
              )}
            >
              {/* rank ribbon — no taller than a chip: the crown used to give
                  the line box a taller content box than its neighbours, which
                  pushed the whole row down and had the ribbon look clipped
                  against the card's rounded top corner */}
              <span
                className={cn(
                  "absolute start-2 top-2 flex items-center gap-1.5 rounded-full px-1.5 py-[1px] text-[12px] font-extrabold leading-normal lg:start-2.5 lg:top-2.5 lg:px-2 lg:py-[2px]",
                  medal ? "bg-primary text-white" : "bg-subtle text-ink-muted",
                )}
              >
                {medal ? <Icon name="crown" size={11} strokeWidth={2.2} /> : `#${num(i + 1)}`}
                {medal && <span className="tabular-nums">{num(i + 1)}</span>}
              </span>

              {user.online && (
                <span className="absolute end-2.5 top-3 size-2 rounded-full bg-mint ring-2 ring-surface" title={t("shelf.onlineNow")} />
              )}

              {/* circular profile — ONE avatar. It cannot be sized per
                  breakpoint by rendering it twice: `Avatar` sets its own
                  `inline-flex`, and `.hidden` is emitted *before*
                  `.inline-flex`, so a bare `hidden` loses the cascade and
                  both copies paint. `mt-5` is what keeps the ribbon clear
                  of the ring — at `mt-3` the boxes overlapped and the
                  ribbon read as if the card had been cut. */}
              <span className="relative mt-5">
                <Avatar src={user.photo} seed={user.seed} size={56} className={medal ? "ring-2 ring-primary ring-offset-2" : ""} />
              </span>

              <span className="w-full">
                <span className="flex items-center justify-center gap-1.5">
                  <span className="truncate text-[13px] font-bold text-ink lg:text-[14px]">{user.name}</span>
                </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-faint lg:mt-1">{user.handle}</span>
              </span>

              <span className="flex flex-col items-center gap-1.5">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    inspect(user);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      inspect(user);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-flame-soft px-2 py-0.5 text-[12.5px] font-extrabold tabular-nums text-flame-deep transition hover:scale-105 lg:px-2.5 lg:py-1 lg:text-[13.5px]"
                  title={t("points.open")}
                >
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
