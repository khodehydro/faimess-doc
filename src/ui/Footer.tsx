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
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center font-display text-[12px] font-normal text-ink-muted/70 select-none pointer-events-none scale-[0.82] origin-center tracking-tight",
        className,
      )}
    >
      <span>© FAIMESS</span>
      <span className="opacity-30" aria-hidden="true">•</span>
      <span>{copyrightText}</span>
      <span className="opacity-30" aria-hidden="true">•</span>
      <span className="font-medium text-ink-muted/90">{developerText}</span>
    </footer>
  );
}
