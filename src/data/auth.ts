/* ------------------------------------------------------------------ *
 *  Accounts — the rules this build can honestly enforce.
 *
 *  This is a front-end demo with no backend, so there is nothing to
 *  authenticate against: the rules below decide who the *interface*
 *  believes, and nothing more. It is deliberately not security — anyone
 *  can read this file — and it must not be mistaken for it.
 *
 *  Two ways in:
 *    · the demo account that always exists — admin / admin
 *    · an account created here, kept in this browser's localStorage
 * ------------------------------------------------------------------ */

/** what the sign-in panel can say about a credential pair */
export type SignInResult = "ok" | "unknown-user" | "bad-password";

/** what the create-account panel can say about a new pair */
export type SignUpResult = "ok" | "name-short" | "name-taken" | "password-short";

/** an account created in this browser */
export type Account = { user: string; password: string };

/** the shortest new name and password the form accepts */
export const MIN_NAME = 3;
export const MIN_PASSWORD = 4;

/** the username that always works, whatever else this browser has stored */
export const DEMO_ACCOUNT = {
  /** the username that signs in — case-insensitive */
  user: "admin",
  /** the password that signs in — case-sensitive */
  password: "admin",
} as const;

/* The account's words are data-labels like every other record field: the
   literals stay English here and `tData` translates them where they show. */
export const DEMO_ROLE = "Administrator · Demo build";

/** how a typed name is stored and compared: trimmed, case-insensitive */
export const accountKey = (user: string) => user.trim().toLowerCase();

/**
 * The whole sign-in rule of this build, as one pure function: the name is
 * matched case-insensitively (nobody types "Admin" twice), the password is
 * matched exactly. `accounts` are the ones this browser created; the demo
 * account is always in the list. Kept out of the context so it can be
 * exercised directly.
 */
export function checkCredential(
  user: string,
  password: string,
  accounts: Account[] = [],
): SignInResult {
  const key = accountKey(user);
  const known =
    key === DEMO_ACCOUNT.user || accounts.some((a) => accountKey(a.user) === key);
  /* an unknown name and a wrong password are different answers, so the
     panel can point at the field that needs the eye */
  if (!known) return "unknown-user";
  if (key === DEMO_ACCOUNT.user) {
    return password === DEMO_ACCOUNT.password ? "ok" : "bad-password";
  }
  const account = accounts.find((a) => accountKey(a.user) === key);
  return account && password === account.password ? "ok" : "bad-password";
}

/**
 * The rule for a *new* account. `taken` is the list of names already in
 * use (the demo name included) — a demo build has no server to race with,
 * so this is the whole uniqueness check.
 */
export function checkNewAccount(
  user: string,
  password: string,
  taken: string[] = [],
): SignUpResult {
  const key = accountKey(user);
  if (key.length < MIN_NAME) return "name-short";
  /* the demo name is never free, whichever accounts this browser has */
  if ([DEMO_ACCOUNT.user, ...taken].map(accountKey).includes(key)) return "name-taken";
  if (password.length < MIN_PASSWORD) return "password-short";
  return "ok";
}

/** the names this browser cannot create again — the demo name included */
export const takenNames = (accounts: Account[] = []) => [
  DEMO_ACCOUNT.user,
  ...accounts.map((a) => a.user),
];
