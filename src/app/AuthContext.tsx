import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  accountKey,
  checkCredential,
  checkNewAccount,
  takenNames,
  type Account,
  type SignInResult,
  type SignUpResult,
} from "../data/auth";

/* ------------------------------------------------------------------ *
 *  Auth — an account you *ask* for, not a wall you start behind.
 *
 *  The app is browsable by anyone: the shelves, the player and the
 *  pages have nothing to do with who is looking. An account is only
 *  wanted at the moment it is needed — following an artist, writing a
 *  comment, sending lyrics, keeping a playlist — and that moment is
 *  `requireAccount()`: the action runs at once when somebody is in, and
 *  otherwise the door opens with the reason printed on it, remembers the
 *  action, and replays it the instant the sign-in lands.
 *
 *  With no backend this is a gate on the interface, not security:
 *  `DEMO_ACCOUNT` (admin/admin) always works, and accounts created here
 *  live in this browser's localStorage and nowhere else.
 * ------------------------------------------------------------------ */

export type { Account, SignInResult, SignUpResult };

type Door = { open: boolean; reason: string | null };

type AuthValue = {
  /** the user name, while signed in; `null` at the door */
  user: string | null;
  signedIn: boolean;
  /** check a credential pair; the caller decides how to say no */
  signIn: (user: string, password: string) => SignInResult;
  /** create an account in this browser and sign in as it */
  signUp: (user: string, password: string) => SignUpResult;
  signOut: () => void;
  /**
   * Run `run` if somebody is signed in. Otherwise open the account door
   * with `reason` (an i18n key) on it, keep `run` and play it back after
   * the sign-in. Returns whether it ran straight away.
   */
  requireAccount: (reason: string, run?: () => void) => boolean;
  /** open the door without an action behind it (the menu's own entry) */
  openAccount: (reason?: string | null) => void;
  closeDoor: () => void;
  doorOpen: boolean;
  /** the i18n key explaining what the door is standing in front of */
  doorReason: string | null;
  /** something is waiting behind the door to be played back */
  pendingAction: boolean;
};

const AuthContext = createContext<AuthValue | null>(null);

const USER_KEY = "faimess.user";
const ACCOUNTS_KEY = "faimess.accounts";

/* ---------------------------- this browser ---------------------------- */

const readStoredUser = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    /* private mode / storage disabled — the door just asks again */
    return null;
  }
};

/** the accounts this browser created, sanitised: a demo file, not a vault */
const readAccounts = (): Account[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (a): a is Account =>
          !!a &&
          typeof (a as Account).user === "string" &&
          typeof (a as Account).password === "string",
      )
      .map((a) => ({ user: a.user, password: a.password }));
  } catch {
    /* unreadable file — behave as if nothing was ever created here */
    return [];
  }
};

const writeAccounts = (accounts: Account[]) => {
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* nothing to persist to — this session still works */
  }
};

/* ------------------------------ provider ------------------------------ */

export function AuthProvider({
  children,
  /** start signed in as this name instead of reading localStorage (SSR checks, previews) */
  initialUser,
  /** start with the door already open, explaining this (an i18n key) */
  initialDoorReason,
}: {
  children: ReactNode;
  initialUser?: string | null;
  initialDoorReason?: string | null;
}) {
  /* `initialUser={null}` is the door on purpose, so only an *absent*
     option falls back to the stored session — `??` would swallow the null */
  const [user, setUser] = useState<string | null>(() =>
    initialUser === undefined ? readStoredUser() : initialUser,
  );
  const [accounts, setAccounts] = useState<Account[]>(readAccounts);
  const [door, setDoor] = useState<Door>({
    open: initialDoorReason !== undefined,
    reason: initialDoorReason ?? null,
  });

  /** what the door interrupted — replayed the moment the sign-in lands */
  const pending = useRef<(() => void) | null>(null);
  /** the same fact as state, so the door can word its welcome accordingly */
  const [pendingAction, setPendingAction] = useState(false);

  const closeDoor = useCallback(() => {
    pending.current = null;
    setPendingAction(false);
    setDoor({ open: false, reason: null });
  }, []);

  const openAccount = useCallback((reason: string | null = null) => {
    setDoor({ open: true, reason });
  }, []);

  /** the one place a session begins — both sign-in and sign-up end here */
  const begin = useCallback((name: string) => {
    const key = accountKey(name);
    setUser(key);
    try {
      window.localStorage.setItem(USER_KEY, key);
    } catch {
      /* nothing to persist to — this session still works */
    }
    const run = pending.current;
    pending.current = null;
    setPendingAction(false);
    setDoor({ open: false, reason: null });
    /* after the door closes, so the action's own toast is the last word */
    run?.();
  }, []);

  const signIn = useCallback(
    (name: string, password: string): SignInResult => {
      const result = checkCredential(name, password, accounts);
      if (result === "ok") begin(name);
      return result;
    },
    [accounts, begin],
  );

  const signUp = useCallback(
    (name: string, password: string): SignUpResult => {
      const result = checkNewAccount(name, password, takenNames(accounts));
      if (result !== "ok") return result;
      const created: Account = { user: accountKey(name), password };
      const next = [...accounts, created];
      setAccounts(next);
      writeAccounts(next);
      begin(name);
      return "ok";
    },
    [accounts, begin],
  );

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* see above */
    }
  }, []);

  const requireAccount = useCallback(
    (reason: string, run?: () => void) => {
      if (user) {
        run?.();
        return true;
      }
      pending.current = run ?? null;
      setPendingAction(!!run);
      setDoor({ open: true, reason });
      return false;
    },
    [user],
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      signedIn: !!user,
      signIn,
      signUp,
      signOut,
      requireAccount,
      openAccount,
      closeDoor,
      doorOpen: door.open,
      doorReason: door.reason,
      pendingAction,
    }),
    [
      user,
      signIn,
      signUp,
      signOut,
      requireAccount,
      openAccount,
      closeDoor,
      door.open,
      door.reason,
      pendingAction,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
