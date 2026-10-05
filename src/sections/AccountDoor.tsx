import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "../ui/Logo";
import { Icon } from "../ui/Icon";
import { useAuth } from "../app/AuthContext";
import { useApp } from "../app/AppContext";
import { usePreferences } from "../app/PreferencesContext";
import { forwardIcon } from "../lib/rtl";
import { DEMO_ACCOUNT, MIN_NAME, MIN_PASSWORD } from "../data/auth";
import { cn } from "../lib/cn";
import { EASE, spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  The account door — sign in, or make an account.
 *
 *  It is not where the app starts. Anybody can walk the shelves, play
 *  the player and read every page without an account; the door opens at
 *  the moment an account is actually wanted, and the reason it opened is
 *  printed at the top ("to follow an artist", "to write a comment"). The
 *  action that asked for it is waiting behind the panel and runs the
 *  moment the sign-in lands — that is what `requireAccount` is for.
 *
 *  A demo build has no backend, so the credential is stated out loud:
 *  admin / admin always works, and an account created here is written to
 *  this browser's localStorage and nowhere else. The footnote says so on
 *  the panel itself — a demo that hides its password is a demo nobody can
 *  open, and one that pretends to be secure is worse.
 * ------------------------------------------------------------------ */

/** what a field has to say when it is the one that was refused */
type Problem = { field: "user" | "password"; key: string } | null;

type Tab = "in" | "up";

export function AccountDoor() {
  const { t, lang, dir, setLang } = usePreferences();
  const { notify } = useApp();
  const {
    doorOpen,
    doorReason,
    closeDoor,
    signIn,
    signUp,
    pendingAction,
  } = useAuth();

  const [tab, setTab] = useState<Tab>("in");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [problem, setProblem] = useState<Problem>(null);
  /** the rule that refused the new account, not a field */
  const [refusal, setRefusal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** the demo credential, printed from the same source the check reads */
  const demo = useMemo(() => DEMO_ACCOUNT, []);

  /* a fresh panel each time the door opens: the password never survives a
     close, and neither does the last refusal */
  useEffect(() => {
    if (!doorOpen) return;
    setPassword("");
    setShown(false);
    setProblem(null);
    setRefusal(null);
    setBusy(false);
  }, [doorOpen]);

  /* Esc closes, like any dialog — the app is behind it, not gone */
  useEffect(() => {
    if (!doorOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDoor();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doorOpen, closeDoor]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setProblem(null);
    setRefusal(null);
    setBusy(true);
    /* is something waiting behind the door? read it *before* the sign-in
       clears it, so a plain visit gets the welcome and an interrupted
       action gets its own toast instead */
    const waiting = pendingAction;
    /* one beat, so the button has something to say while it works */
    window.setTimeout(() => {
      const name = user.trim();
      if (tab === "in") {
        const result = signIn(user, password);
        if (result !== "ok") {
          setProblem({
            field: result === "unknown-user" ? "user" : "password",
            key: result === "unknown-user" ? "auth.badUser" : "auth.badPassword",
          });
          setBusy(false);
          return;
        }
        if (!waiting) notify(t("auth.welcome", { name }), "mint");
      } else {
        const result = signUp(user, password);
        if (result !== "ok") {
          /* the name itself is the subject (too short / already taken), so
             the message sits under the field it is about */
          setProblem({
            field: result === "password-short" ? "password" : "user",
            key:
              result === "name-short"
                ? "auth.nameShort"
                : result === "name-taken"
                  ? "auth.nameTaken"
                  : "auth.passwordShort",
          });
          setRefusal(result);
          setBusy(false);
          return;
        }
        if (!waiting) notify(t("auth.welcome", { name }), "mint");
      }
      setBusy(false);
    }, 320);
  };

  const fillDemo = () => {
    setTab("in");
    setUser(demo.user);
    setPassword(demo.password);
    setProblem(null);
    setRefusal(null);
  };

  const field = (which: "user" | "password") => ({
    onChange: (value: string) => {
      if (which === "user") setUser(value);
      else setPassword(value);
      if (problem?.field === which) setProblem(null);
      setRefusal(null);
    },
    problem: problem?.field === which ? t(problem.key) : undefined,
  });

  return (
    <AnimatePresence>
      {doorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={t("auth.title")}
          className="studio-backdrop scroll-slim fixed inset-0 z-[80] overflow-y-auto"
        >
          <button
            type="button"
            onClick={closeDoor}
            aria-label={t("ui.close")}
            title={t("ui.close")}
            className="fixed end-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-surface/80 text-ink-muted shadow-card ring-1 ring-black/[0.04] backdrop-blur transition-colors hover:text-ink dark:ring-white/[0.08]"
          >
            <Icon name="close" size={16} strokeWidth={2.3} />
          </button>

          <div
            dir={dir}
            className="mx-auto flex min-h-full w-full max-w-[420px] flex-col justify-center px-4 py-14"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* the brand — this panel is the app's front door, wherever it
                  is standing in the room */}
              <div className="flex flex-col items-center gap-2.5">
                <span className="rounded-[32.5%] shadow-card ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                  <Logo size={46} />
                </span>
                <span className="font-display text-[20px] font-extrabold tracking-[-0.026em] text-ink">
                  FAIMESS
                </span>
              </div>

              {/* why the door opened — the action is waiting behind it */}
              {doorReason && (
                <div className="mt-4 rounded-[14px] bg-primary-faint px-3.5 py-3 text-start">
                  <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-primary-deep">
                    <Icon name="lock" size={12.5} strokeWidth={2.2} />
                    {t("auth.gateTitle")}
                  </p>
                  <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink">
                    {t(doorReason)}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                    {t("auth.resume")}
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-card bg-surface p-5 shadow-float ring-1 ring-black/[0.04] lg:p-6 dark:ring-white/[0.06]">
                {/* two ways in, one panel */}
                <div className="flex items-center gap-1.5 rounded-[13px] bg-subtle p-1">
                  {(
                    [
                      { id: "in", key: "auth.tabIn" },
                      { id: "up", key: "auth.tabUp" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTab(option.id);
                        setProblem(null);
                        setRefusal(null);
                      }}
                      aria-pressed={tab === option.id}
                      className={cn(
                        "flex-1 rounded-[10px] px-3 py-2 text-[12.5px] font-bold transition-colors",
                        tab === option.id
                          ? "bg-primary text-white shadow-primary"
                          : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {t(option.key)}
                    </button>
                  ))}
                </div>

                <h1 className="font-display mt-4 text-[19px] font-bold leading-tight tracking-[-0.016em] text-ink lg:text-[21px]">
                  {t(tab === "in" ? "auth.title" : "auth.upTitle")}
                </h1>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted lg:text-[13px]">
                  {t(tab === "in" ? "auth.subtitle" : "auth.upSubtitle")}
                </p>

                <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
                  <Field
                    icon="users"
                    label={t(tab === "in" ? "auth.user" : "auth.newUser")}
                    problem={field("user").problem}
                  >
                    <input
                      value={user}
                      onChange={(e) => field("user").onChange(e.target.value)}
                      placeholder={t("auth.userPlaceholder")}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
                    />
                  </Field>

                  <Field
                    icon="lock"
                    label={t(tab === "in" ? "auth.password" : "auth.newPassword")}
                    problem={field("password").problem}
                  >
                    <input
                      value={password}
                      onChange={(e) => field("password").onChange(e.target.value)}
                      type={shown ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      autoComplete={tab === "in" ? "current-password" : "new-password"}
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

                  {/* the rules for a new account, stated before the refusal */}
                  {tab === "up" && !problem && (
                    <p className="px-0.5 text-[12px] leading-relaxed text-ink-faint">
                      {t("auth.upRules", { n: MIN_NAME, m: MIN_PASSWORD })}
                    </p>
                  )}

                  {/* the panel's own error line: the fields can refuse
                      independently, so the message names the one at fault */}
                  <AnimatePresence initial={false}>
                    {problem && (
                      <motion.p
                        key={`${problem.field}-${problem.key}`}
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
                        {t(tab === "in" ? "auth.working" : "auth.upWorking")}
                      </>
                    ) : (
                      <>
                        <Icon name={tab === "in" ? forwardIcon(dir) : "sparkle"} size={16} strokeWidth={2.2} />
                        {t(tab === "in" ? "auth.submit" : "auth.upSubmit")}
                      </>
                    )}
                  </motion.button>
                </form>

                {/* the demo account, stated plainly — and one tap to fill it */}
                {tab === "in" && (
                  <div className="mt-4 rounded-[14px] bg-primary-faint px-3.5 py-3">
                    <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-primary-deep">
                      <Icon name="verified" size={12.5} strokeWidth={2.2} />
                      {t("auth.demoTitle")}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-body">
                      {t("auth.demoBody")}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <code
                        className="rounded-full bg-surface px-2.5 py-1 text-[12px] font-bold tabular-nums text-ink shadow-xs"
                        dir="ltr"
                      >
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
                )}

                {/* a created account is a local file, and says so */}
                {tab === "up" && (
                  <p className="mt-4 flex items-start gap-2 rounded-[14px] bg-subtle px-3.5 py-3 text-[12px] leading-relaxed text-ink-body">
                    <Icon name="lock" size={12.5} strokeWidth={2.1} className="mt-0.5 shrink-0 text-ink-faint" />
                    {t("auth.upLocal")}
                  </p>
                )}

                <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-ink-faint">
                  <Icon name="lock" size={12.5} strokeWidth={2.1} className="mt-0.5 shrink-0" />
                  {t("auth.footnote")}
                </p>

                {/* the refusal is not always about one field — the rules
                    line above stands in for a whole-form answer */}
                {refusal === "name-taken" && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-flame-deep">
                    <Icon name="close" size={12} strokeWidth={2.4} />
                    {t("auth.nameTakenHint", { demo: demo.user })}
                  </p>
                )}
              </div>

              {/* the language switcher, so the door is readable in any language */}
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
        </motion.div>
      )}
    </AnimatePresence>
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
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-0.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-2.5 rounded-[13px] bg-subtle px-3.5 py-3 ring-1 transition-colors focus-within:bg-primary-faint",
          problem
            ? "ring-flame/45 focus-within:ring-flame/60"
            : "ring-transparent focus-within:ring-primary/25",
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
        <span className="mt-1.5 block px-0.5 text-[12px] font-semibold text-flame-deep">
          {problem}
        </span>
      )}
    </label>
  );
}
