import { useMemo } from "react";
import { me } from "../data/account";
import { activeUsers } from "../data/feed";
import {
  countFor,
  fanPoints,
  listenedHours,
  POINT_RULES,
  type FanActivity,
  type PointRule,
  type PointRuleId,
} from "../data/points";
import { useMyActivity } from "../app/ContributionsContext";
import { usePreferences } from "../app/PreferencesContext";
import { withThousands } from "../lib/format";
import { cn } from "../lib/cn";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

/* ------------------------------------------------------------------ *
 *  The leaderboard — the same five rules, side by side.
 *
 *  The shelf card only has room for the total, so the numbers behind it
 *  live here: one row per listener, one column per rule, all of them read
 *  straight off the fans' activity records. The signed-in account takes its
 *  place in the table, which is the honest way to show where it stands.
 * ------------------------------------------------------------------ */

/**
 * One column per rule — built from POINT_RULES, so adding a sixth rule to
 * the economy adds a sixth column here instead of quietly leaving it out.
 * The widths are fixed so the heads and the cells stay in line.
 */
const WIDTH: Record<PointRuleId, string> = {
  listening: "w-[58px]",
  comments: "w-[62px]",
  invites: "w-[54px]",
  tenure: "w-[46px]",
  lyrics: "w-[50px]",
};

const COLUMNS = POINT_RULES.map((rule) => ({ rule, width: WIDTH[rule.id] }));

/** a raw count in the unit its rule is counted in */
function cellFor(rule: PointRule, activity: FanActivity): string {
  const count = countFor(rule, activity);
  if (rule.short === "hours") return `${listenedHours(count)}h`;
  if (rule.short === "days") return `${count}d`;
  return withThousands(count);
}

type Row = {
  id: string;
  name: string;
  handle: string;
  photo?: string;
  seed?: number;
  online?: boolean;
  activity: FanActivity;
  you?: boolean;
};

export function LeaderboardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = usePreferences();
  const myActivity = useMyActivity();

  /* active listeners plus this account, best balance first — a tie keeps
     the ladder's own order, which is why the sort is by points alone */
  const rows: Row[] = useMemo(() => {
    const mine: Row = {
      id: "me",
      name: me.name,
      handle: me.handle,
      photo: me.photo,
      seed: 0,
      activity: myActivity,
      you: true,
    };
    const others: Row[] = activeUsers.map((user) => ({ ...user }));
    return [...others, mine].sort((a, b) => fanPoints(b.activity) - fanPoints(a.activity));
  }, [myActivity]);

  return (
    <Modal open={open} onClose={onClose} width={636}>
      <span className="flex size-9 items-center justify-center rounded-[12px] bg-primary-soft text-primary-deep">
        <Icon name="crown" size={17} strokeWidth={2} />
      </span>

      <h2 className="font-display mt-2.5 text-[18px] font-bold leading-snug text-ink">
        {t("leader.title")}
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{t("leader.subtitle")}</p>

      <div className="scroll-slim mt-3 overflow-x-auto">
        <div className="min-w-[540px]">
          {/* the heads */}
          <div className="flex items-center gap-2 px-2 pb-1.5">
            <span className="flex-1 text-[11.5px] font-bold text-ink-faint">
              {t("leader.listener")}
            </span>
            {COLUMNS.map((column) => (
              <span
                key={column.rule.id}
                className={cn(column.width, "text-end text-[11.5px] font-bold text-ink-faint")}
              >
                {t(column.rule.headKey)}
              </span>
            ))}
            <span className="w-[64px] text-end text-[11.5px] font-bold text-ink-faint">
              {t("points.total")}
            </span>
          </div>

          <ul className="flex flex-col gap-1">
            {rows.map((row, i) => {
              const total = fanPoints(row.activity);
              return (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-center gap-2 rounded-[14px] px-2 py-1.5",
                    row.you ? "bg-primary-faint/80 ring-1 ring-primary/20" : "hover:bg-subtle/70",
                  )}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "w-4 shrink-0 text-[11.5px] font-extrabold tabular-nums",
                        i < 3 ? "text-primary-deep" : "text-ink-faint",
                      )}
                    >
                      {i + 1}
                    </span>
                    <Avatar src={row.photo} seed={row.seed} size={26} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-ink">{row.name}</span>
                        {row.you && (
                          <span className="shrink-0 rounded-full bg-primary px-1.5 py-[1px] text-[10.5px] font-extrabold text-white">
                            {t("leader.you")}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[11.5px] font-semibold text-ink-faint">
                        {row.handle}
                        {row.online ? ` · ${t("shelf.onlineNow")}` : ""}
                      </span>
                    </span>
                  </span>

                  {COLUMNS.map((column) => (
                    <span
                      key={column.rule.id}
                      title={
                        column.rule.short === "hours"
                          ? t("points.countMinutes", {
                              m: countFor(column.rule, row.activity).toLocaleString(locale),
                              h: listenedHours(
                                countFor(column.rule, row.activity),
                              ).toLocaleString(locale),
                            })
                          : undefined
                      }
                      className={cn(
                        column.width,
                        "shrink-0 text-end text-[12.5px] font-semibold tabular-nums text-ink-body",
                      )}
                    >
                      {cellFor(column.rule, row.activity)}
                    </span>
                  ))}

                  <span className="flex w-[64px] shrink-0 items-center justify-end gap-1 text-[13px] font-extrabold tabular-nums text-flame-deep">
                    <Icon name="flame" size={12} strokeWidth={2} />
                    {total.toLocaleString(locale, { maximumFractionDigits: 2 })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-[14px] bg-subtle/70 px-3 py-2.5">
        <Icon name="star" size={13} className="mt-[1px] shrink-0 text-primary-deep" />
        <p className="text-[11.5px] leading-relaxed text-ink-muted">{t("leader.rulesNote")}</p>
      </div>

      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">{t("leader.tapNote")}</p>
    </Modal>
  );
}
