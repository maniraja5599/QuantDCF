"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const sessionRef = useRef<{
    id: string;
    startTime: number;
  } | null>(null);

  // Initialize or restore session
  useEffect(() => {
    if (typeof window === "undefined") return;

    let sId = sessionStorage.getItem("quantdcf_session_id");
    let sStart = Number(sessionStorage.getItem("quantdcf_session_start"));

    if (!sId || !sStart || isNaN(sStart)) {
      sId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sStart = Date.now();
      sessionStorage.setItem("quantdcf_session_id", sId);
      sessionStorage.setItem("quantdcf_session_start", String(sStart));
    }

    sessionRef.current = {
      id: sId,
      startTime: sStart,
    };
  }, []);

  const sendBeacon = (page: string, isHeartbeat = false) => {
    if (typeof window === "undefined") return;

    let sId = sessionRef.current?.id || sessionStorage.getItem("quantdcf_session_id");
    let sStart = sessionRef.current?.startTime || Number(sessionStorage.getItem("quantdcf_session_start"));

    if (!sId || !sStart) {
      sId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sStart = Date.now();
      sessionStorage.setItem("quantdcf_session_id", sId);
      sessionStorage.setItem("quantdcf_session_start", String(sStart));
      sessionRef.current = { id: sId, startTime: sStart };
    }

    const durationSeconds = Math.max(0, Math.round((Date.now() - sStart) / 1000));

    try {
      const payload = JSON.stringify({
        sessionId: sId,
        page,
        durationSeconds,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        isHeartbeat,
      });

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/admin/track", blob);
      } else {
        fetch("/api/admin/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
  };

  // 1. Trigger beacon on page transition
  useEffect(() => {
    sendBeacon(pathname, false);
  }, [pathname]);

  // 2. Periodic heartbeat every 15 seconds while user is active on tab
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        sendBeacon(pathname, true);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendBeacon(pathname, true);
      }
    };

    const handleBeforeUnload = () => {
      sendBeacon(pathname, true);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
