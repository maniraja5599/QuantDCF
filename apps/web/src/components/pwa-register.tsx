"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PWARegister() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Register Service Worker in production only, clean up in development
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
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

    // Intercept BeforeInstallPrompt for native PWA install experience
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt banner after a brief moment if not dismissed previously
      const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  // Auto-dismiss install banner after 6 seconds
  useEffect(() => {
    if (!showInstallBanner) return;
    const timer = setTimeout(() => {
      setShowInstallBanner(false);
      try {
        sessionStorage.setItem("pwa_install_dismissed", "true");
      } catch {}
    }, 6000);
    return () => clearTimeout(timer);
  }, [showInstallBanner]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem("pwa_install_dismissed", "true");
    } catch {}
  };

  if (!mounted || !showInstallBanner) return null;

  return (
    <aside
      aria-label="App installation prompt"
      className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm bg-[#111726]/95 border border-sky-500/40 backdrop-blur-md rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 relative overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
          <Download className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Install QuantDCF App</span>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">6s</span>
          </div>
          <div className="text-[10px] text-slate-400">Add to home screen for native offline performance</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 6-second auto-dismiss countdown line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div className="h-full bg-sky-400 w-full origin-left animate-shrink-6s" />
      </div>
    </aside>
  );
}
