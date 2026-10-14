"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track if pathname changed
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    // Send tracking beacon asynchronously without blocking UI
    try {
      fetch("/api/admin/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      }).catch(() => {
        // Silently ignore tracking errors so application is never affected
      });
    } catch (_) {}
  }, [pathname]);

  return null;
}
