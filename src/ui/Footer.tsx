import { useContext } from "react";
import { PreferencesContext } from "../app/PreferencesContext";
import { cn } from "../lib/cn";

export function Footer({ className }: { className?: string }) {
  const ctx = useContext(PreferencesContext);
  const dir = ctx?.dir ?? "rtl";
  const copyrightText = ctx ? ctx.t("footer.copyright") : "کپی رایت محفوظه";
  const developerText = ctx ? ctx.t("footer.developer") : "توسعه دهنده HYDRO team";

  return (
    <footer
      dir={dir}
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center font-display text-[12px] font-medium text-ink-muted select-none pointer-events-none",
        className,
      )}
    >
      <span>© FAIMESS</span>
      <span className="opacity-40" aria-hidden="true">•</span>
      <span>{copyrightText}</span>
      <span className="opacity-40" aria-hidden="true">•</span>
      <span className="font-semibold text-ink-body">{developerText}</span>
    </footer>
  );
}
