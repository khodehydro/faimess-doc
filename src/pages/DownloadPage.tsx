import { motion } from "framer-motion";
import { SurfaceCard } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { useApp } from "../app/AppContext";
import { spring, staggerParent, popChild } from "../lib/motion";
import { usePreferences } from "../app/PreferencesContext";

/* ------------------------------------------------------------------ *
 *  Get the app (#/download) — where the player's download button sends
 *  people. The web build streams; offline saves are an Android feature,
 *  so this page is the honest dead-end for that button.
 * ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: "download",
    title: "download.offline",
    body: "download.offlineBody",
  },
  {
    icon: "waveform",
    title: "download.masters",
    body: "download.mastersBody",
  },
  {
    icon: "headphones",
    title: "download.background",
    body: "download.backgroundBody",
  },
  {
    icon: "mic",
    title: "download.liveLyrics",
    body: "download.liveLyricsBody",
  },
] as const;

export function DownloadPage() {
  const { notify, navigate } = useApp();
  const { t, dir } = usePreferences();

  return (
    <SurfaceCard dir={dir} className="min-h-0">
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
          <Icon name="download" size={17} strokeWidth={2.1} />
        </span>
        <div>
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.018em] text-ink">
            {t("download.title")}
          </h2>
          <p className="mt-0.5 text-[13.5px] text-ink-muted">
            {t("download.subtitle")}
          </p>
        </div>
      </div>

      {/* hero */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-panel bg-shell/70 p-5 ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <div>
              <p className="font-display text-[18px] font-bold text-ink">{t("download.appName")}</p>
              <p className="text-[13px] text-ink-muted">{t("download.meta")}</p>
            </div>
          </div>

          <p className="mt-3.5 max-w-[520px] text-[13.5px] leading-relaxed text-ink-body">
            {t("download.body")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={() => notify(t("download.buildStore"), "primary")}
              className="flex items-center gap-2 rounded-[14px] bg-ink px-3.5 py-2.5 text-white shadow-float"
            >
              <Icon name="play" size={16} strokeWidth={2.2} />
              <span className="text-start leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/70">{t("download.getItOn")}</span>
                <span className="block text-[14px] font-bold">{t("download.googlePlay")}</span>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={() => notify(t("download.buildApk"), "primary")}
              className="flex items-center gap-2 rounded-[14px] border border-line-strong bg-surface px-4 py-3 text-[13.5px] font-bold text-ink-body transition-colors hover:border-primary/30 hover:text-primary-deep"
            >
              <Icon name="download" size={16} strokeWidth={2.1} />
              {t("download.apk")}
            </motion.button>

            <button
              onClick={() => navigate("home")}
              className="ms-auto flex items-center gap-1.5 text-[13px] font-bold text-ink-muted transition-colors hover:text-primary-deep"
            >
              <Icon name="arrowLeft" size={15} strokeWidth={2} />
              {t("download.back")}
            </button>
          </div>
        </div>

        {/* what the app adds */}
        <motion.ul
          variants={staggerParent(0.05)}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-2.5"
        >
          {FEATURES.map((f) => (
            <motion.li
              key={f.title}
              variants={popChild}
              className="flex gap-3 rounded-panel border border-line/80 bg-surface p-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-faint text-primary-deep">
                <Icon name={f.icon} size={15} strokeWidth={2.1} />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold text-ink">{t(f.title)}</span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">{t(f.body)}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      </div>
    </SurfaceCard>
  );
}
