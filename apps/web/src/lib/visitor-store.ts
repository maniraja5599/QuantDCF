export interface VisitorLog {
  id: string;
  sessionId: string;
  ip: string;
  city?: string;
  country?: string;
  region?: string;
  userAgent: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot";
  browser: string;
  os: string;
  page: string;
  pagesVisited: string[];
  pageViewsCount: number;
  referrer?: string;
  firstSeen: string;
  lastSeen: string;
  durationSeconds: number;
  isOnline: boolean;
  timestamp: string;
}

// Dynamic server-only file persistence
function getLogFilePath(): string | null {
  try {
    if (typeof window === "undefined") {
      const path = eval("require")("path");
      return process.env.VERCEL
        ? path.join("/tmp", "quantdcf_visitors.json")
        : path.join(process.cwd(), ".visitor_sessions.json");
    }
  } catch (_) {}
  return null;
}

function loadPersistedLogs(): VisitorLog[] {
  try {
    if (typeof window === "undefined") {
      const fs = eval("require")("fs");
      const filePath = getLogFilePath();
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (_) {}
  return [];
}

let saveTimeout: any = null;
function persistLogsDebounced(logs: VisitorLog[]) {
  if (typeof window !== "undefined") return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const fs = eval("require")("fs");
      const filePath = getLogFilePath();
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(logs.slice(0, 500)), "utf-8");
      }
    } catch (_) {}
  }, 1000);
}

// Global in-memory storage (persists across warm serverless requests)
const globalStore = global as unknown as {
  __QUANTDCF_VISITORS__?: VisitorLog[];
};

if (!globalStore.__QUANTDCF_VISITORS__) {
  // Pure live capture only - strictly zero dummy records
  globalStore.__QUANTDCF_VISITORS__ = loadPersistedLogs();
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "< 5s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
}

export function recordVisitorLog(data: {
  sessionId?: string;
  ip: string;
  city?: string;
  country?: string;
  region?: string;
  userAgent: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot";
  browser: string;
  os: string;
  page: string;
  referrer?: string;
  durationSeconds?: number;
}): VisitorLog {
  const visitors = globalStore.__QUANTDCF_VISITORS__ || [];
  const now = new Date().toISOString();
  const sId = data.sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Find existing session by sessionId or match IP if active in last 15 minutes
  const existingIdx = visitors.findIndex(
    (v) =>
      v.sessionId === sId ||
      (v.ip === data.ip &&
        Date.now() - new Date(v.lastSeen || v.timestamp).getTime() < 15 * 60 * 1000)
  );

  let result: VisitorLog;

  if (existingIdx !== -1) {
    const existing = visitors[existingIdx];
    const prevPages = Array.isArray(existing.pagesVisited) ? existing.pagesVisited : [existing.page];
    const newPages = prevPages.includes(data.page) ? prevPages : [...prevPages, data.page];

    const computedDuration = Math.max(
      existing.durationSeconds || 0,
      data.durationSeconds || 0,
      Math.round((Date.now() - new Date(existing.firstSeen || existing.timestamp).getTime()) / 1000)
    );

    result = {
      ...existing,
      sessionId: existing.sessionId || sId,
      page: data.page,
      pagesVisited: newPages,
      pageViewsCount: (existing.pageViewsCount || 1) + (existing.page !== data.page ? 1 : 0),
      lastSeen: now,
      timestamp: now,
      durationSeconds: computedDuration,
      isOnline: true,
      city: data.city || existing.city,
      country: data.country || existing.country,
      region: data.region || existing.region,
      deviceType: data.deviceType || existing.deviceType,
      browser: data.browser || existing.browser,
      os: data.os || existing.os,
    };

    // Move updated active session to front of the array
    visitors.splice(existingIdx, 1);
    visitors.unshift(result);
  } else {
    result = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sessionId: sId,
      ip: data.ip,
      city: data.city,
      country: data.country,
      region: data.region,
      userAgent: data.userAgent,
      deviceType: data.deviceType,
      browser: data.browser,
      os: data.os,
      page: data.page,
      pagesVisited: [data.page],
      pageViewsCount: 1,
      referrer: data.referrer,
      firstSeen: now,
      lastSeen: now,
      durationSeconds: data.durationSeconds || 0,
      isOnline: true,
      timestamp: now,
    };
    visitors.unshift(result);
  }

  // Prepend newest first, maintain maximum 500 records
  if (visitors.length > 500) {
    visitors.length = 500;
  }
  globalStore.__QUANTDCF_VISITORS__ = visitors;
  persistLogsDebounced(visitors);
  return result;
}

export function getVisitorLogs(): VisitorLog[] {
  const visitors = globalStore.__QUANTDCF_VISITORS__ || [];
  const ninetySecondsAgo = Date.now() - 90 * 1000;
  // Dynamically recalculate isOnline based on lastSeen
  return visitors.map((v) => ({
    ...v,
    isOnline: new Date(v.lastSeen || v.timestamp).getTime() > ninetySecondsAgo,
  }));
}

export function clearVisitorLogs(): void {
  globalStore.__QUANTDCF_VISITORS__ = [];
  try {
    if (typeof window === "undefined") {
      const fs = eval("require")("fs");
      const filePath = getLogFilePath();
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (_) {}
}

export function getVisitorStats() {
  const visitors = getVisitorLogs();
  const uniqueIps = new Set(visitors.map((v) => v.ip));
  const activeNow = visitors.filter((v) => v.isOnline).length;

  const totalPageviews = visitors.reduce((sum, v) => sum + (v.pageViewsCount || 1), 0);
  const totalDuration = visitors.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
  const avgDurationSeconds = visitors.length > 0 ? Math.round(totalDuration / visitors.length) : 0;

  const pageCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    (v.pagesVisited || [v.page]).forEach((p) => {
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
  });

  const sortedPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));

  const deviceCounts: Record<string, number> = {
    Desktop: 0,
    Mobile: 0,
    Tablet: 0,
  };
  visitors.forEach((v) => {
    if (v.deviceType in deviceCounts) {
      deviceCounts[v.deviceType]++;
    }
  });

  return {
    totalSessions: visitors.length,
    totalVisits: totalPageviews,
    uniqueIpsCount: uniqueIps.size,
    activeNow: activeNow,
    totalDurationSeconds: totalDuration,
    avgDurationSeconds: avgDurationSeconds,
    avgDurationFormatted: formatDuration(avgDurationSeconds),
    topPages: sortedPages,
    devices: deviceCounts,
  };
}

export function parseDeviceAndBrowser(userAgent: string): {
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot";
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();
  let deviceType: "Mobile" | "Desktop" | "Tablet" | "Bot" = "Desktop";
  if (ua.includes("bot") || ua.includes("crawl") || ua.includes("spider")) {
    deviceType = "Bot";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    deviceType = "Tablet";
  } else if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    deviceType = "Mobile";
  }

  let browser = "Chrome";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("opr/") || ua.includes("opera/")) browser = "Opera";

  let os = "Windows";
  if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("linux")) os = "Linux";

  return { deviceType, browser, os };
}
