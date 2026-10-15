"use client";

import { useEffect, useState, useRef } from "react";
import { Download, X, CheckCircle2, Smartphone, Laptop, Sparkles, ExternalLink } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

export function PWARegister() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [installGuide, setInstallGuide] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // 1. Check if already installed & running standalone
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // 2. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("[PWA] Service Worker registration failed:", error);
          });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      }
    }

    // 3. Listen for native browser beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Native prompt captured
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Auto-trigger the popup on mobile and desktop after a short 600ms load delay
    const isDismissed = sessionStorage.getItem("quantdcf_pwa_dismissed");
    if (!standaloneMode && !isDismissed) {
      const openTimer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 700);

      return () => {
        clearTimeout(openTimer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // 5. Auto close in exactly 4 seconds (with pause on hover/interaction)
  useEffect(() => {
    if (!showInstallBanner || isPaused) return;

    // Countdown tick
    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 4-second auto close timer
    timerRef.current = setTimeout(() => {
      setShowInstallBanner(false);
      try {
        sessionStorage.setItem("quantdcf_pwa_dismissed", "true");
      } catch (_) {}
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showInstallBanner, isPaused]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("[PWA] User accepted the installation");
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      try {
        sessionStorage.setItem("quantdcf_pwa_dismissed", "true");
      } catch (_) {}
    } else {
      // Browser didn't supply deferredPrompt (iOS Safari, or Chrome address bar)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        setInstallGuide("iOS: Tap the Share button (⎙) in Safari and choose 'Add to Home Screen'");
        setIsPaused(true);
      } else {
        setInstallGuide("Click the Install icon (⊕) in your browser address bar to install");
        setIsPaused(true);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem("quantdcf_pwa_dismissed", "true");
    } catch (_) {}
  };

  if (!mounted || isStandalone || !showInstallBanner) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Official QuantDCF PWA App Installation Prompt"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      className="fixed z-50 bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[350px] max-w-sm mx-auto sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative rounded-2xl bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-xl border border-sky-500/40 dark:border-sky-500/35 p-3.5 sm:p-4 shadow-2xl shadow-sky-500/15 overflow-hidden transition-all group hover-glow-sky">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-sky-500/20 via-cyan-400/10 to-transparent rounded-full blur-xl pointer-events-none" />

        {/* Content Row */}
        <div className="flex items-start gap-3 relative z-10">
          {/* Official 3D Logo */}
          <div className="shrink-0 mt-0.5">
            <LogoIcon size="sm" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
                QuantDCF
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span>OFFICIAL</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
              Install official app for instant access, offline mode & native performance.
            </p>

            {installGuide && (
              <div className="mt-2 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-[10px] text-sky-700 dark:text-sky-300 leading-tight">
                {installGuide}
              </div>
            )}
          </div>

          {/* Close X Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close install popup"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block animate-pulse" />
            <span>Auto close in <strong className="text-sky-600 dark:text-sky-400 font-bold">{secondsLeft}s</strong></span>
          </div>

          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/25 active-press hover-lift transition-all shimmer-sweep shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>

        {/* 4-Second Progress Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 w-full animate-shrink-4s ${
              isPaused ? "opacity-40" : ""
            }`}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          />
        </div>
      </div>
    </aside>
  );
}
