import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGS, STRINGS, fill, type Lang, type Theme, type TVars } from "../data/i18n";

/* ------------------------------------------------------------------ *
 *  Preferences — language and appearance.
 *
 *  Both live on <html> (`lang`, `dir`, `data-theme`) so the CSS tokens in
 *  index.css flip wholesale and portalled dialogs stay in the same
 *  language and direction as everything else. Choices are kept in
 *  localStorage; the demo has no profile service to sync them to.
 * ------------------------------------------------------------------ */

type PreferencesValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  /** the language's own number/date formatting locale */
  locale: string;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** translate a key; `{name}` holes are filled from `vars` */
  t: (key: string, vars?: TVars) => string;
  /** is this key in the table? — lets callers fall back to data labels */
  has: (key: string) => boolean;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

const LANG_KEY = "faimess.lang";
const THEME_KEY = "faimess.theme";

const isLang = (value: string | null): value is Lang => !!value && LANGS.some((l) => l.id === value);

function readStored<T extends string>(key: string, fallback: T, ok: (v: string | null) => boolean): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return ok(raw) ? (raw as T) : fallback;
  } catch {
    /* private mode / storage disabled — fall back to the default */
    return fallback;
  }
}

export function PreferencesProvider({
  children,
  initialLang,
  initialTheme,
}: {
  children: ReactNode;
  /** start from a known language instead of localStorage (SSR checks, previews) */
  initialLang?: Lang;
  /** same for the appearance */
  initialTheme?: Theme;
}) {
  const [lang, setLangState] = useState<Lang>(
    () => initialLang ?? readStored<Lang>(LANG_KEY, "en", isLang),
  );
  const [theme, setThemeState] = useState<Theme>(
    () => initialTheme ?? readStored<Theme>(THEME_KEY, "light", (v) => v === "light" || v === "dark"),
  );

  const meta = LANGS.find((l) => l.id === lang);
  const dir = meta?.dir ?? "ltr";
  const locale = meta?.locale ?? "en-US";

  /* the whole document follows the choice — CSS tokens read data-theme */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = lang;
    root.dir = dir;
  }, [theme, lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* nothing to persist to — the switch still works for this session */
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* see above */
    }
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  const t = useCallback(
    (key: string, vars?: TVars) => {
      const entry = STRINGS[key];
      if (!entry) return key;
      return fill(entry[lang] || entry.en, vars);
    },
    [lang],
  );

  const has = useCallback((key: string) => !!STRINGS[key], []);

  const value = useMemo<PreferencesValue>(
    () => ({ lang, dir, locale, setLang, theme, setTheme, toggleTheme, t, has }),
    [lang, dir, locale, setLang, theme, setTheme, toggleTheme, t, has],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}

/** the common case — just the translator */
export function useT() {
  return usePreferences().t;
}
