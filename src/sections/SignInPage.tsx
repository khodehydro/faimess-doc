import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { Icon } from "../ui/Icon";
import { useAuth } from "../app/AuthContext";
import { usePreferences } from "../app/PreferencesContext";
import { forwardIcon } from "../lib/rtl";
import { DEMO_ACCOUNT } from "../data/auth";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The door — the whole screen while nobody is signed in.
 *
 *  It is not a card inside the dashboard: before the app has an account
 *  there is no dashboard, so this paints on the studio backdrop with the
 *  brand mark at the top, the way a first-run screen does. Everything on
 *  it is translated (the panel is the app's own chrome), and the demo
 *  credential is stated out loud — a demo that hides its password is a
 *  demo nobody can open.
 * ------------------------------------------------------------------ */

/** what the panel needs to say when the credential is refused */
type Problem = { field: "user" | "password"; key: string } | null;

export function SignInPage({ onSignedIn }: { onSignedIn?: (user: string) => void }) {
  const { t, lang, dir, setLang } = usePreferences();
  const { signIn } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  const [busy, setBusy] = useState(false);

  /** the demo credential, printed from the same source the check reads */
  const demo = useMemo(() => DEMO_ACCOUNT, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setProblem(null);
    setBusy(true);
    /* one beat, so the button has something to say while it works */
    window.setTimeout(() => {
      const result = signIn(user, password);
      if (result === "unknown-user") setProblem({ field: "user", key: "auth.badUser" });
      else if (result === "bad-password") setProblem({ field: "password", key: "auth.badPassword" });
      else onSignedIn?.(user.trim().toLowerCase());
      setBusy(false);
    }, 320);
  };

  const fillDemo = () => {
    setUser(demo.user);
    setPassword(demo.password);
    setProblem(null);
  };

  return (
    <div
      dir={dir}
      className="studio-backdrop relative flex min-h-dvh w-full items-center justify-center px-4 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="w-full max-w-[404px]"
      >
        {/* the brand, centred over the panel — this screen *is* the front door */}
        <div className="flex flex-col items-center gap-3">
          <span className="rounded-[18px] shadow-card ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <Logo size={54} />
          </span>
          <span className="font-display text-[22px] font-extrabold tracking-[-0.026em] text-ink">
            FAIMESS
          </span>
        </div>

        <div className="mt-6 rounded-card bg-surface p-5 shadow-float ring-1 ring-black/[0.04] lg:p-6 dark:ring-white/[0.06]">
          <h1 className="font-display text-[19px] font-bold leading-tight tracking-[-0.016em] text-ink lg:text-[21px]">
            {t("auth.title")}
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted lg:text-[13px]">
            {t("auth.subtitle")}
          </p>

          <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
            <Field
              icon="users"
              label={t("auth.user")}
              problem={problem?.field === "user" ? t(problem.key) : undefined}
            >
              <input
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  if (problem?.field === "user") setProblem(null);
                }}
                placeholder={t("auth.userPlaceholder")}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </Field>

            <Field
              icon="lock"
              label={t("auth.password")}
              problem={problem?.field === "password" ? t(problem.key) : undefined}
            >
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (problem?.field === "password") setProblem(null);
                }}
                type={shown ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="current-password"
                spellCheck={false}
                className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
              {/* the icon pack has no eye, so the reveal toggle says the
                  word instead of wearing a glyph that means something else */}
              <button
                type="button"
                onClick={() => setShown((v) => !v)}
                aria-label={t(shown ? "auth.hidePassword" : "auth.showPassword")}
                title={t(shown ? "auth.hidePassword" : "auth.showPassword")}
                aria-pressed={shown}
                className="shrink-0 rounded-full px-1.5 py-1 text-[12px] font-bold text-ink-faint transition-colors hover:text-primary-deep"
              >
                {t(shown ? "auth.hide" : "auth.show")}
              </button>
            </Field>

            {/* the panel's own error line: the two fields can refuse
                independently, so the message names the one at fault */}
            <AnimatePresence initial={false}>
              {problem && (
                <motion.p
                  key={problem.field}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  role="alert"
                  className="rounded-[12px] bg-flame-soft px-3 py-2.5 text-[12.5px] font-semibold leading-relaxed text-flame-deep"
                >
                  {t(problem.key)}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={busy}
              whileHover={busy ? undefined : { y: -1.5 }}
              whileTap={busy ? undefined : { scale: 0.985 }}
              transition={spring}
              className={cn(
                "mt-0.5 flex h-[46px] items-center justify-center gap-2 rounded-[14px] bg-primary text-[14px] font-bold text-white shadow-primary transition-colors hover:bg-primary-deep",
                busy && "cursor-wait opacity-80",
              )}
            >
              {busy ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="flex"
                  >
                    <Icon name="activity" size={15} strokeWidth={2.3} />
                  </motion.span>
                  {t("auth.working")}
                </>
              ) : (
                <>
                  <Icon name={forwardIcon(dir)} size={16} strokeWidth={2.2} />
                  {t("auth.submit")}
                </>
              )}
            </motion.button>
          </form>

          {/* the demo account, stated plainly — and one tap to fill it */}
          <div className="mt-4 rounded-[14px] bg-primary-faint px-3.5 py-3">
            <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-primary-deep">
              <Icon name="verified" size={12.5} strokeWidth={2.2} />
              {t("auth.demoTitle")}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-body">{t("auth.demoBody")}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <code className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-bold tabular-nums text-ink shadow-xs" dir="ltr">
                {demo.user} / {demo.password}
              </code>
              <button
                type="button"
                onClick={fillDemo}
                className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] font-bold text-ink-body transition-colors hover:border-primary/35 hover:text-primary-deep"
              >
                {t("auth.fill")}
              </button>
            </div>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-ink-faint">
            <Icon name="lock" size={12.5} strokeWidth={2.1} className="mt-0.5 shrink-0" />
            {t("auth.footnote")}
          </p>
        </div>

        {/* the language switcher, so the door is readable before signing in */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {(["en", "fa", "ko"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLang(id)}
              aria-pressed={lang === id}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
                lang === id
                  ? "bg-primary text-white shadow-primary"
                  : "bg-surface/70 text-ink-muted hover:text-ink",
              )}
            >
              {id === "en" ? "English" : id === "fa" ? "فارسی" : "한국어"}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  One labelled row of the form: an icon, the field, and the message the
 *  field owes when it is the one that was refused.
 * ------------------------------------------------------------------ */
function Field({
  icon,
  label,
  problem,
  children,
}: {
  icon: "users" | "lock";
  label: string;
  problem?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-0.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-2.5 rounded-[13px] bg-subtle px-3.5 py-3 ring-1 transition-colors focus-within:bg-primary-faint",
          problem ? "ring-flame/45 focus-within:ring-flame/60" : "ring-transparent focus-within:ring-primary/25",
        )}
      >
        <Icon
          name={icon}
          size={15.5}
          strokeWidth={2}
          className={cn("shrink-0", problem ? "text-flame-deep" : "text-ink-faint")}
        />
        {children}
      </span>
      {problem && (
        <span className="mt-1.5 block px-0.5 text-[12px] font-semibold text-flame-deep">{problem}</span>
      )}
    </label>
  );
}
