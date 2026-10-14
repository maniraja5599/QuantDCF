"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const sessionRef = useRef<{
    visitorUid: string;
    sessionId: string;
    sessionStartTime: number;
    visitCount: number;
    firstSeen: string;
  } | null>(null);

  // Initialize or restore persistent visitor profile
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Persistent Lifetime Visitor UID across browser sessions
    let vUid = localStorage.getItem("quantdcf_vuid");
    let visitCount = Number(localStorage.getItem("quantdcf_vcount") || "0");
    let firstSeen = localStorage.getItem("quantdcf_vfirst");

    if (!vUid) {
      vUid = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("quantdcf_vuid", vUid);
    }
    if (!firstSeen) {
      firstSeen = new Date().toISOString();
      localStorage.setItem("quantdcf_vfirst", firstSeen);
    }

    // 2. Active Session ID (sessionStorage)
    let sId = sessionStorage.getItem("quantdcf_session_id");
    let sStart = Number(sessionStorage.getItem("quantdcf_session_start"));

    if (!sId || !sStart || isNaN(sStart)) {
      sId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sStart = Date.now();
      visitCount += 1;
      localStorage.setItem("quantdcf_vcount", String(visitCount));
      sessionStorage.setItem("quantdcf_session_id", sId);
      sessionStorage.setItem("quantdcf_session_start", String(sStart));
    }

    sessionRef.current = {
      visitorUid: vUid,
      sessionId: sId,
      sessionStartTime: sStart,
      visitCount: Math.max(1, visitCount),
      firstSeen: firstSeen,
    };
  }, []);

  const sendBeacon = (page: string, isHeartbeat = false) => {
    if (typeof window === "undefined") return;

    const vUid = sessionRef.current?.visitorUid || localStorage.getItem("quantdcf_vuid") || `u_${Date.now()}`;
    const sId = sessionRef.current?.sessionId || sessionStorage.getItem("quantdcf_session_id") || `s_${Date.now()}`;
    const sStart = sessionRef.current?.sessionStartTime || Number(sessionStorage.getItem("quantdcf_session_start")) || Date.now();
    const visitCount = sessionRef.current?.visitCount || Number(localStorage.getItem("quantdcf_vcount") || "1");
    const firstSeen = sessionRef.current?.firstSeen || localStorage.getItem("quantdcf_vfirst") || new Date().toISOString();

    const sessionDuration = Math.max(0, Math.round((Date.now() - sStart) / 1000));
    
    // Accumulate lifetime time on site
    const prevLifetime = Number(localStorage.getItem("quantdcf_total_time") || "0");
    const totalDurationSeconds = prevLifetime + (isHeartbeat ? 15 : 0);
    if (isHeartbeat) {
      localStorage.setItem("quantdcf_total_time", String(totalDurationSeconds));
    }

    try {
      const payload = JSON.stringify({
        visitorUid: vUid,
        sessionId: sId,
        visitCount,
        firstSeen,
        page,
        durationSeconds: sessionDuration,
        totalDurationSeconds: Math.max(sessionDuration, totalDurationSeconds),
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
