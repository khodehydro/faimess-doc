import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { checkCredential, type SignInResult } from "../data/auth";

/* ------------------------------------------------------------------ *
 *  Auth — who is looking at the app.
 *
 *  A demo build has no backend to authenticate against, so this is a
 *  gate on the interface, not security: `DEMO_ACCOUNT` in data/auth.ts is
 *  the one credential pair, and the signed-in name is remembered in
 *  localStorage so a reload does not ask again. Clearing the site's
 *  storage signs you out, which is the honest behaviour for a build with
 *  nothing behind the door.
 * ------------------------------------------------------------------ */

export type { SignInResult };

type AuthValue = {
  /** the user name, while signed in; `null` at the door */
  user: string | null;
  signedIn: boolean;
  /** check a credential pair; the caller decides how to say no */
  signIn: (user: string, password: string) => SignInResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

const USER_KEY = "faimess.user";

const readStoredUser = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    /* private mode / storage disabled — the door just asks again */
    return null;
  }
};

export function AuthProvider({
  children,
  /** start signed in as this name instead of reading localStorage (SSR checks, previews) */
  initialUser,
}: {
  children: ReactNode;
  initialUser?: string | null;
}) {
  /* `initialUser={null}` is the door on purpose, so only an *absent*
     option falls back to the stored session — `??` would swallow the null */
  const [user, setUser] = useState<string | null>(() =>
    initialUser === undefined ? readStoredUser() : initialUser,
  );

  const signIn = useCallback((name: string, password: string): SignInResult => {
    const result = checkCredential(name, password);
    if (result !== "ok") return result;
    const signedIn = name.trim().toLowerCase();
    setUser(signedIn);
    try {
      window.localStorage.setItem(USER_KEY, signedIn);
    } catch {
      /* nothing to persist to — this session still works */
    }
    return "ok";
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* see above */
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, signedIn: !!user, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
