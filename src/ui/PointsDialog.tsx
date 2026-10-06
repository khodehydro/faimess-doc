import { usePreferences } from "../app/PreferencesContext";
import { useApp } from "../app/AppContext";
import { fanLines, fanPoints, listenedHours, type FanActivity } from "../data/points";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

/* ------------------------------------------------------------------ *
 *  How a fan's points add up.
 *
 *  Every listener — the signed-in account and the ones on the leaderboard —
 *  is opened with the same five lines: count × rate, then the total. The
 *  numbers come straight from data/points.ts, so this panel can never show
 *  a balance the rules don't actually produce.
 * ------------------------------------------------------------------ */

export type PointsSubject = {
  name: string;
  handle: string;
  photo?: string;
  seed?: number;
  /** whatever the caller knows about them — level, streak, tier */
  meta?: string;
  activity: FanActivity;
  /** a footnote, e.g. that this session's approvals are already counted */
  note?: string;
};

export function PointsDialog({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  subject: PointsSubject | null;
}) {
  const { t, locale, lang } = usePreferences();
  const { openProfile } = useApp();

  if (!subject) return null;

  const lines = fanLines(subject.activity);
  const total = fanPoints(subject.activity);
  const n = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });

  /* the count line under each rule, in the unit that rule is counted in */
  const counted = (id: string, count: number) => {
    switch (id) {
      case "listening":
        /* the user asked for minutes and hours, so both are on the line */
        return t("points.countMinutes", {
          m: count.toLocaleString(locale),
          h: listenedHours(count).toLocaleString(locale),
        });
      case "comments":
        return t("points.countComments", { n: count.toLocaleString(locale) });
      case "invites":
        return t("points.countInvites", { n: count.toLocaleString(locale) });
      case "tenure":
        return t("points.countDays", { n: count.toLocaleString(locale) });
      default:
        return t("points.countSheets", { n: count.toLocaleString(locale) });
    }
  };

  return (
    <Modal open={open} onClose={onClose} width={420}>
      {/* who this balance belongs to */}
      <div className="flex items-center gap-3.5 pe-8">
        <Avatar src={subject.photo} seed={subject.seed} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold text-ink">{subject.name}</span>
          <span className="block truncate text-[12.5px] font-semibold text-ink-muted">
            {subject.meta ?? subject.handle}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-flame-soft px-2.5 py-1.5 text-[13px] font-extrabold tabular-nums text-flame-deep">
          <Icon name="flame" size={12.5} strokeWidth={2} />
          {n(total)}
        </span>
      </div>

      <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
        {t("points.title")}
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{t("points.subtitle")}</p>

      {/* Two lines per rule, and only two: the rule and its rate on top —
          the rate always in the same column — then the fan's own count. The
          labels truncate instead of wrapping, so no row can push its rate
          out of line with the row above it, in any of the three languages. */}
      <ul className="mt-3.5 flex flex-col gap-1.5">
        {lines.map((line) => {
          const rate = t(line.rule.rateKey, { n: n(line.rule.value) });
          const count = counted(line.rule.id, line.count);
          return (
            <li
              key={line.rule.id}
              className="flex items-center gap-3 rounded-[14px] bg-subtle/60 px-2.5 py-2.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-surface text-primary-deep shadow-xs">
                <Icon name={line.rule.icon} size={16} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span
                    className="min-w-0 truncate text-[13px] font-bold text-ink"
                    title={t(line.rule.labelKey)}
                  >
                    {t(line.rule.labelKey)}
                  </span>
                  <span
                    className="ms-auto shrink-0 text-[12px] font-semibold text-ink-faint"
                    title={rate}
                  >
                    {t(line.rule.shortRateKey, { n: n(line.rule.value) })}
                  </span>
                </span>
                <span
                  className="mt-1 block truncate text-[12px] font-semibold text-ink-muted"
                  title={count}
                >
                  {count}
                </span>
              </span>
              <span className="shrink-0 text-[13.5px] font-extrabold tabular-nums text-primary-deep">
                +{n(line.subtotal)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-2.5 flex items-center justify-between rounded-[14px] bg-primary-faint/70 px-3.5 py-3">
        <span className="text-[13px] font-bold text-ink">{t("points.total")}</span>
        <span className="text-[15px] font-extrabold tabular-nums text-primary-deep">
          {t("account.points", { n: n(total) })}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            onClose();
            openProfile(subject.handle.replace(/^@/, ""));
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-primary transition hover:bg-primary-deep"
        >
          <Icon name="users" size={14} />
          <span>{lang === "fa" ? "مشاهده پروفایل کاربر" : "View User Profile"}</span>
        </button>
      </div>

      {subject.note && (
        <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">{subject.note}</p>
      )}
    </Modal>
  );
}
