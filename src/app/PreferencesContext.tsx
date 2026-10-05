import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGS,
  STRINGS,
  fill,
  localizeDigits,
  tData,
  type Lang,
  type Theme,
  type TVars,
} from "../data/i18n";

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
  /**
   * Translate a label that comes out of a data file — an artist kind, a
   * playlist mood, “2 hrs ago”, “4.8M monthly”. Unknown words (track
   * titles, artist names, comment text) are returned untouched, so demo
   * content never gets mangled. See `tData` in data/i18n.ts.
   */
  dataLabel: (value?: string) => string;
  /** a plain number in this language's digits and grouping */
  num: (value: number) => string;
  /**
   * Translate a key, or hand back the data file's own English when the key
   * is not in the table yet — the door for copy that ships in a data file
   * (banner slides, news headlines) and is translated alongside it.
   */
  text: (key: string, fallback: string) => string;
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
      /* a number handed to a placeholder is written in the language's own
         digits — “{n} آهنگ” with n = 12 reads ۱۲, not 12 */
      const filled = vars
        ? Object.fromEntries(
            Object.entries(vars).map(([name, v]) => [
              name,
              typeof v === "number" ? localizeDigits(String(v), lang) : v,
            ]),
          )
        : undefined;
      return fill(entry[lang] || entry.en, filled);
    },
    [lang],
  );

  const has = useCallback((key: string) => !!STRINGS[key], []);

  const dataLabel = useCallback((value?: string) => tData(t, value, lang), [t, lang]);


  const text = useCallback(
    (key: string, fallback: string) => (STRINGS[key] ? t(key) : fallback),
    [t],
  );

  const num = useCallback(
    (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value),
    [locale],
  );

  const value = useMemo<PreferencesValue>(
    () => ({ lang, dir, locale, setLang, theme, setTheme, toggleTheme, t, has, dataLabel, num, text }),
    [lang, dir, locale, setLang, theme, setTheme, toggleTheme, t, has, dataLabel, num, text],
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
