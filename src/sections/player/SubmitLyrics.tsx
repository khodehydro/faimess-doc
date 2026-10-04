import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../../ui/Modal";
import { Icon } from "../../ui/Icon";
import { useApp } from "../../app/AppContext";
import { usePreferences } from "../../app/PreferencesContext";
import { useContributions } from "../../app/ContributionsContext";
import {
  LYRIC_LANGUAGES,
  LYRIC_REWARD,
  submissionProblem,
  type SubmissionProblem,
} from "../../data/lyrics";
import type { PlayerTrack } from "../../data/player";
import { me } from "../../data/account";
import { EASE, spring } from "../../lib/motion";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ *
 *  Send the lyrics — the form behind the empty lyric panel.
 *
 *  Nothing publishes itself: a submission lands as `pending` and a
 *  moderator decides. Approval pays LYRIC_REWARD points and puts the
 *  fan's name under the sheet.
 * ------------------------------------------------------------------ */

export function SubmitLyrics({
  track,
  open,
  onClose,
}: {
  track: PlayerTrack;
  open: boolean;
  onClose: () => void;
}) {
  const { notify } = useApp();
  const { t, locale } = usePreferences();
  const { send, pendingFor, points } = useContributions();
  const [language, setLanguage] = useState<string>(LYRIC_LANGUAGES[0]);
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [sent, setSent] = useState(false);

  const problem = original.trim().length > 0 ? submissionProblem(original) : null;
  const PROBLEM_KEY: Record<SubmissionProblem, string> = {
    empty: "submit.problemEmpty",
    "one-line": "submit.problemOne",
    short: "submit.problemShort",
  };
  const pending = pendingFor(track.id);

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setSent(false);
      setOriginal("");
      setTranslation("");
    }, 200);
  };

  const submit = () => {
    if (submissionProblem(original)) return;
    send({
      trackId: track.id,
      trackTitle: track.title,
      language,
      original,
      translation,
      duration: track.seconds,
    });
    setSent(true);
    notify(t("submit.sentToast", { n: LYRIC_REWARD }), "primary");
  };

  return (
    <Modal open={open} onClose={close} width={440}>
      {sent ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }}>
          <span className="flex size-11 items-center justify-center rounded-full bg-mint-soft text-teal-deep">
            <Icon name="check" size={22} strokeWidth={2.6} />
          </span>
          <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
            {t("submit.doneTitle")}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
            {t("submit.doneBody", {
              title: track.title,
              n: LYRIC_REWARD,
              points: points.toLocaleString(locale),
            })}
          </p>

          <div className="mt-3.5 flex items-center gap-2.5 rounded-panel bg-subtle px-3.5 py-3">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[12px] font-extrabold text-primary-deep">
              {t("submit.pending")}
            </span>
            <span className="text-[12.5px] font-semibold text-ink-muted">
              {language} · {t("submit.lines", { n: original.split("\n").filter((l) => l.trim()).length })}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={close}
              className="rounded-[14px] bg-primary px-4 py-3 text-[13.5px] font-bold text-white shadow-primary"
            >
              {t("submit.back")}
            </motion.button>
            <button
              onClick={() => setSent(false)}
              className="rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              {t("submit.resend")}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <Icon name="mic" size={20} strokeWidth={2.1} />
          </span>

          <h2 className="font-display mt-3.5 text-[17.5px] font-bold leading-snug text-ink">
            {t("submit.title")}
          </h2>
          <p className="mt-1.5 text-[12.5px] font-semibold text-ink-muted">
            {track.title} · {track.artist}
          </p>

          <p className="mt-2.5 rounded-panel bg-primary-faint/70 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-body">
            {t("submit.intro", { n: LYRIC_REWARD })}
          </p>

          {pending && (
            <p className="mt-2.5 flex items-center gap-2 rounded-panel bg-subtle px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-muted">
              <Icon name="clock" size={13} />
              {t("submit.already")}
            </p>
          )}

          {/* language */}
          <div className="mt-3.5 flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">
              {t("submit.original")}
            </span>
            {LYRIC_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
                  language === lang
                    ? "bg-primary text-white shadow-primary"
                    : "bg-subtle text-ink-muted hover:text-ink",
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* original */}
          <label className="mt-3.5 block">
            <span className="flex items-baseline gap-2.5">
              <span className="text-[12.5px] font-bold text-ink-body">{t("submit.lyrics")}</span>
              <span className="text-[12px] text-ink-faint">
                {t("submit.lyricsHint")}
              </span>
            </span>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={5}
              dir="auto"
              placeholder={"해가 진 뒤에도 남아 있는 빛\n[00:12] We don’t need the sun tonight\n[00:24] 손끝에서 번지는 노을"}
              className="mt-2 w-full resize-none rounded-panel border border-line bg-subtle px-3.5 py-3 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-primary/40 focus:outline-none"
            />
          </label>

          {/* translation */}
          <label className="mt-3 block">
            <span className="flex items-baseline gap-2.5">
              <span className="text-[12.5px] font-bold text-ink-body">{t("submit.translation")}</span>
              <span className="text-[12px] text-ink-faint">{t("submit.translationHint")}</span>
            </span>
            <textarea
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              rows={3}
              dir="rtl"
              className="font-fa mt-2 w-full resize-none rounded-panel border border-line bg-subtle px-3.5 py-3 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-primary/40 focus:outline-none"
              placeholder="نوری که بعد از غروب هم می‌مونه…"
            />
          </label>

          {problem && (
            <p className="mt-2.5 text-[12px] font-semibold text-flame-deep">{t(PROBLEM_KEY[problem])}</p>
          )}

          <div className="mt-4 flex items-center gap-2.5">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={submit}
              disabled={!!submissionProblem(original)}
              className={cn(
                "flex items-center gap-2.5 rounded-[14px] px-4 py-3 text-[13.5px] font-bold transition-colors",
                submissionProblem(original)
                  ? "bg-muted text-ink-faint"
                  : "bg-primary text-white shadow-primary",
              )}
            >
              <Icon name="send" size={15} strokeWidth={2.1} />
              {t("submit.send")}
            </motion.button>
            <button
              onClick={close}
              className="rounded-[14px] px-3.5 py-3 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              {t("submit.cancel")}
            </button>
            <span className="ms-auto text-[12px] font-semibold text-ink-faint">
              {me.name} · {points.toLocaleString("en-US")} pts
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}
