import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(canInstall: boolean) => void>();

/**
 * Registers the Service Worker and sets up PWA install event listeners.
 */
export function registerPwa() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.onupdatefound = () => {
          const worker = reg.installing;
          if (worker) {
            worker.onstatechange = () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available
                console.info("PWA: New version available");
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn("PWA: Service Worker registration error:", err);
      });
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    promptListeners.forEach((fn) => fn(false));
  });
}

/**
 * Hook to check PWA installation status and trigger the install prompt.
 */
export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(() => deferredPrompt !== null);

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
    const navStandalone =
      typeof navigator !== "undefined" &&
      Boolean((navigator as unknown as { standalone?: boolean }).standalone);
    return standaloneMedia || navStandalone;
  });

  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof navigator === "undefined" || !navigator.userAgent) return false;
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  });

  useEffect(() => {
    const update = (available: boolean) => setCanInstall(available);
    promptListeners.add(update);

    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return () => {
        promptListeners.delete(update);
      };
    }

    const mql = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => setIsInstalled(mql.matches);
    mql.addEventListener("change", checkInstalled);

    return () => {
      promptListeners.delete(update);
      mql.removeEventListener("change", checkInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredPrompt = null;
        setCanInstall(false);
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    }
    return false;
  };

  return { canInstall, isInstalled, isIOS, install };
}
