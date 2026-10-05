/* ------------------------------------------------------------------ *
 *  The demo account — the one username/password this build accepts.
 *
 *  This is a front-end demo with no backend, so there is nothing to
 *  authenticate against: the check lives in `src/app/AuthContext.tsx` and
 *  only gate-keeps the interface. It is deliberately *not* security —
 *  anyone can read this file — and it must not be mistaken for it.
 *
 *  Username: admin   Password: admin
 * ------------------------------------------------------------------ */

/** what the door can say about a credential pair */
export type SignInResult = "ok" | "unknown-user" | "bad-password";

/**
 * The whole authentication of this build, as one pure function: the name is
 * matched case-insensitively (nobody types "Admin" twice), the password is
 * matched exactly. Kept out of the context so it can be exercised directly.
 */
export function checkCredential(user: string, password: string): SignInResult {
  if (user.trim().toLowerCase() !== DEMO_ACCOUNT.user) return "unknown-user";
  if (password !== DEMO_ACCOUNT.password) return "bad-password";
  return "ok";
}

export const DEMO_ACCOUNT = {
  /** the username that signs in — case-insensitive */
  user: "admin",
  /** the password that signs in — case-sensitive */
  password: "admin",
} as const;

/* The account's words are data-labels like every other record field: the
   literals stay English here and `tData` translates them where they show. */
export const DEMO_ROLE = "Administrator · Demo build";
