import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "../../ui/Modal";
import { Icon } from "../../ui/Icon";
import { useApp } from "../../app/AppContext";
import { useContributions } from "../../app/ContributionsContext";
import { LYRIC_LANGUAGES, LYRIC_REWARD, submissionProblem } from "../../data/lyrics";
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
  const { send, pendingFor, points } = useContributions();
  const [language, setLanguage] = useState<string>(LYRIC_LANGUAGES[0]);
  const [original, setOriginal] = useState("");
  const [translation, setTranslation] = useState("");
  const [sent, setSent] = useState(false);

  const problem = original.trim().length > 0 ? submissionProblem(original) : null;
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
    notify(`Lyrics sent for review — +${LYRIC_REWARD} pts once approved`, "primary");
  };

  return (
    <Modal open={open} onClose={close} width={440}>
      {sent ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }}>
          <span className="flex size-11 items-center justify-center rounded-full bg-mint-soft text-teal-deep">
            <Icon name="check" size={22} strokeWidth={2.6} />
          </span>
          <h2 className="font-display mt-3 text-[17.5px] font-bold leading-snug text-ink">
            Sent to the moderators
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
            A moderator checks the text against the official sheet for “{track.title}”. Once it's
            approved your name goes under the lyrics and{" "}
            <span className="font-bold text-primary-deep">+{LYRIC_REWARD} points</span> land in your
            fan account — you're on {points.toLocaleString("en-US")} today.
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-panel bg-subtle px-3 py-2.5">
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11.5px] font-extrabold text-primary-deep">
              Pending review
            </span>
            <span className="text-[12.5px] font-semibold text-ink-muted">
              {language} · {original.split("\n").filter((l) => l.trim()).length} lines
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={close}
              className="rounded-[14px] bg-primary px-3.5 py-2.5 text-[13.5px] font-bold text-white shadow-primary"
            >
              Back to the player
            </motion.button>
            <button
              onClick={() => setSent(false)}
              className="rounded-[14px] px-3 py-2.5 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              Send an updated version
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <Icon name="mic" size={20} strokeWidth={2.1} />
          </span>

          <h2 className="font-display mt-3 text-[17.5px] font-bold leading-snug text-ink">
            Send the lyrics
          </h2>
          <p className="mt-1 text-[12.5px] font-semibold text-ink-muted">
            {track.title} · {track.artist}
          </p>

          <p className="mt-2 rounded-panel bg-primary-faint/70 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-body">
            Moderators check every sheet against the official text before it goes live. Approved
            sheets earn <span className="font-bold text-primary-deep">+{LYRIC_REWARD} fan points</span> and
            carry your name.
          </p>

          {pending && (
            <p className="mt-2 flex items-center gap-1.5 rounded-panel bg-subtle px-3 py-2 text-[12.5px] font-semibold text-ink-muted">
              <Icon name="clock" size={13} />
              You already sent a sheet for this track — it's pending review.
            </p>
          )}

          {/* language */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Original</span>
            {LYRIC_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors",
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
          <label className="mt-3 block">
            <span className="flex items-baseline gap-2">
              <span className="text-[12.5px] font-bold text-ink-body">Lyrics</span>
              <span className="text-[11.5px] text-ink-faint">
                one line per line — add [01:12] if you know where a line lands
              </span>
            </span>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={5}
              dir="auto"
              placeholder={"해가 진 뒤에도 남아 있는 빛\n[00:12] We don’t need the sun tonight\n[00:24] 손끝에서 번지는 노을"}
              className="mt-1.5 w-full resize-none rounded-panel border border-line bg-subtle px-3 py-2.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-primary/40 focus:outline-none"
            />
          </label>

          {/* translation */}
          <label className="mt-2.5 block">
            <span className="flex items-baseline gap-2">
              <span className="text-[12.5px] font-bold text-ink-body">Persian translation</span>
              <span className="text-[11.5px] text-ink-faint">optional, line by line</span>
            </span>
            <textarea
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              rows={3}
              dir="rtl"
              className="font-fa mt-1.5 w-full resize-none rounded-panel border border-line bg-subtle px-3 py-2.5 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-primary/40 focus:outline-none"
              placeholder="نوری که بعد از غروب هم می‌مونه…"
            />
          </label>

          {problem && <p className="mt-2 text-[12px] font-semibold text-flame-deep">{problem}</p>}

          <div className="mt-4 flex items-center gap-2">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={submit}
              disabled={!!submissionProblem(original)}
              className={cn(
                "flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[13.5px] font-bold transition-colors",
                submissionProblem(original)
                  ? "bg-muted text-ink-faint"
                  : "bg-primary text-white shadow-primary",
              )}
            >
              <Icon name="send" size={15} strokeWidth={2.1} />
              Send to moderators
            </motion.button>
            <button
              onClick={close}
              className="rounded-[14px] px-3 py-2.5 text-[13.5px] font-bold text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              Cancel
            </button>
            <span className="ml-auto text-[12px] font-semibold text-ink-faint">
              {me.name} · {points.toLocaleString("en-US")} pts
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}
