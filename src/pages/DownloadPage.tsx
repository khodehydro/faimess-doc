import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { useApp } from "../app/AppContext";
import { spring, staggerParent, popChild } from "../lib/motion";
import { forwardIcon } from "../lib/rtl";
import { usePreferences } from "../app/PreferencesContext";
import { usePwaInstall } from "../lib/pwa";
import { usePlayer } from "../app/PlayerContext";
import { QUEUE } from "../data/player";
import { downloadFapPackage, pickFapPackageFile } from "../lib/fapSecurity";

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
  const { t, dir, lang } = usePreferences();
  const player = usePlayer();
  const { canInstall, isInstalled, isIOS, isAndroid, isSecure, install } = usePwaInstall();
  const [downloadingDemo, setDownloadingDemo] = useState(false);

  const handleTestFapFile = () => {
    pickFapPackageFile(
      (result) => {
        player.play(result.track);
        notify(
          lang === "fa"
            ? `پکیج «${result.metadata.title}» با موفقیت رمزگشایی شد و در حال پخش است.`
            : `Decrypted and playing "${result.metadata.title}" (.fap).`,
          "mint",
        );
      },
      (err) => {
        notify(err, "primary");
      },
    );
  };

  const handleDownloadLeadFap = async () => {
    const lead = QUEUE[0];
    if (!lead) return;
    setDownloadingDemo(true);
    try {
      const res = await downloadFapPackage(lead);
      notify(
        lang === "fa"
          ? `پکیج رمزنگاری‌شده «${res.filename}» دانلود شد.`
          : `Downloaded secure package "${res.filename}".`,
        "mint",
      );
    } catch {
      notify(
        lang === "fa" ? "خطا در دانلود پکیج .fap" : "Failed to download .fap",
        "primary",
      );
    } finally {
      setDownloadingDemo(false);
    }
  };

  const handlePwaInstall = async () => {
    if (isInstalled) {
      notify(t("pwa.installed"), "primary");
      return;
    }
    if (canInstall) {
      const ok = await install();
      if (ok) notify(t("pwa.installedToast"), "mint");
    } else if (isIOS) {
      notify(t("pwa.iosGuide"), "primary");
    } else if (isAndroid) {
      if (!isSecure) {
        notify(t("pwa.insecureNotice"), "primary");
      } else {
        notify(t("pwa.androidGuide"), "primary");
      }
    } else {
      notify(t("pwa.installPrompt"), "primary");
    }
  };

  return (
    /* content only: the Shell owns the card and its scrollbar */
    <div className="p-4 lg:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
          <Icon name="download" size={17} strokeWidth={2.1} />
        </span>
        <div>
          <h2 className="font-display text-[19px] font-bold leading-tight tracking-[-0.018em] text-ink lg:text-[26px]">
            {t("download.title")}
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted lg:mt-1.5 lg:text-[13.5px]">
            {t("download.subtitle")}
          </p>
        </div>
      </div>

      {/* hero */}
      <div className="mt-5 grid gap-3 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-4">
        <div className="rounded-panel bg-shell/70 p-4 ring-1 ring-black/[0.02] lg:p-6 dark:ring-white/[0.04]">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <div>
              <p className="font-display text-[16px] font-bold text-ink lg:text-[18px]">{t("download.appName")}</p>
              <p className="text-[12px] text-ink-muted lg:text-[13px]">{t("download.meta")}</p>
            </div>
          </div>

          <p className="mt-3.5 max-w-[520px] text-[12.5px] leading-relaxed text-ink-body lg:mt-4 lg:text-[13.5px]">
            {t("download.body")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 lg:mt-5 lg:gap-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={handlePwaInstall}
              className="flex items-center gap-2 rounded-[13px] bg-primary px-3.5 py-2.5 text-[12.5px] font-bold text-white shadow-primary transition-colors hover:bg-primary-deep lg:rounded-[14px] lg:px-4 lg:py-3 lg:text-[13.5px]"
            >
              <Icon name={isInstalled ? "check" : "bolt"} size={16} strokeWidth={2.2} />
              <span>{isInstalled ? t("pwa.installed") : t("pwa.installButton")}</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={() => notify(t("download.buildStore"), "primary")}
              className="flex items-center gap-2 rounded-[13px] bg-ink px-3 py-2 text-white shadow-float lg:rounded-[14px] lg:px-3.5 lg:py-2.5"
            >
              <Icon name="play" size={16} strokeWidth={2.2} />
              <span className="text-start leading-tight">
                <span className="block text-[12px] font-semibold uppercase tracking-wider text-white/70">{t("download.getItOn")}</span>
                <span className="block text-[14px] font-bold">{t("download.googlePlay")}</span>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              onClick={() => notify(t("download.buildApk"), "primary")}
              className="flex items-center gap-2 rounded-[13px] border border-line-strong bg-surface px-3.5 py-2.5 text-[12.5px] font-bold text-ink-body transition-colors hover:border-primary/30 hover:text-primary-deep lg:rounded-[14px] lg:px-4 lg:py-3 lg:text-[13.5px]"
            >
              <Icon name="download" size={16} strokeWidth={2.1} />
              {t("download.apk")}
            </motion.button>

            <button
              onClick={() => navigate("home")}
              className="ms-auto flex items-center gap-1.5 text-[13px] font-bold text-ink-muted transition-colors hover:text-primary-deep"
            >
              <Icon name={forwardIcon(dir)} size={15} strokeWidth={2} />
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
              className="flex gap-2.5 rounded-panel border border-line/80 bg-surface p-2.5 lg:gap-3 lg:p-3"
            >
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-faint text-primary-deep">
                <Icon name={f.icon} size={15} strokeWidth={2.1} />
              </span>
              <span>
                <span className="block text-[12.5px] font-bold text-ink lg:text-[13.5px]">{t(f.title)}</span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-muted lg:mt-1 lg:text-[12.5px]">{t(f.body)}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* FAIMESS Package (.fap) Proprietary DRM Container Section */}
      <div className="mt-5 rounded-panel border-2 border-primary/20 bg-surface p-4 sm:p-5 lg:mt-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-primary">
              <Icon name="sparkle" size={20} strokeWidth={2.4} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[15.5px] font-black text-ink lg:text-[17px]">
                  {lang === "fa"
                    ? "فرمت اختصاصی پلتفرم: FAIMESS Package (.fap)"
                    : "Proprietary Format: FAIMESS Package (.fap)"}
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[12px] font-black text-emerald-600">
                  DRM 2.0
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                {lang === "fa"
                  ? "رمزنگاری چندلایه‌ای قطعات برای جلوگیری از سرقت و بازپخش غیرمجاز؛ پخش منحصراً درون موتور پلتفرم فیمس"
                  : "Multi-layered encrypted audio container; unplayable by external third-party software."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              type="button"
              onClick={handleTestFapFile}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-subtle px-3 py-2 text-[12px] font-bold text-ink transition hover:border-primary/40 hover:bg-surface"
            >
              <Icon name="play" size={14} strokeWidth={2.2} />
              <span>{t("fap.testButton")}</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              type="button"
              onClick={handleDownloadLeadFap}
              disabled={downloadingDemo}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-bold text-white shadow-primary transition hover:bg-primary-deep disabled:opacity-50"
            >
              <Icon name="download" size={14} strokeWidth={2.2} />
              <span>
                {downloadingDemo
                  ? lang === "fa"
                    ? "در حال رمزنگاری..."
                    : "Encrypting..."
                  : lang === "fa"
                    ? "دانلود نمونه .fap"
                    : "Sample .fap"}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
