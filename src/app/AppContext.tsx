import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRoute, type RouteId } from "./router";

/* ------------------------------------------------------------------ *
 *  App-wide context: navigation + notifications.
 *  Sections only need `useApp()` — they stay decoupled from each other.
 * ------------------------------------------------------------------ */

export type Tone = "primary" | "teal" | "mint";

export type Toast = { id: number; text: string; tone: Tone };

type AppValue = {
  route: RouteId;
  navigate: (id: RouteId) => void;
  notify: (text: string, tone?: Tone) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
};

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { route, navigate } = useRoute();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (text: string, tone: Tone = "primary") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-2), { id, text, tone }]);
      window.setTimeout(() => dismiss(id), 2800);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ route, navigate, notify, toasts, dismiss }),
    [route, navigate, notify, toasts, dismiss],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
