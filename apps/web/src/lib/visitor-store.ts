export interface VisitorLog {
  id: string;
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
  timestamp: string;
}

// Global in-memory storage (persists across warm serverless requests)
const globalStore = global as unknown as {
  __QUANTDCF_VISITORS__?: VisitorLog[];
};

if (!globalStore.__QUANTDCF_VISITORS__) {
  const now = Date.now();
  // Initial activity log entries
  globalStore.__QUANTDCF_VISITORS__ = [
    {
      id: "v-seed-1",
      ip: "103.212.144.62",
      city: "Chennai",
      country: "IN",
      region: "Tamil Nadu",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
      deviceType: "Desktop",
      browser: "Chrome",
      os: "Windows 11",
      page: "/valuation/TCS",
      referrer: "Direct",
      timestamp: new Date(now - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "v-seed-2",
      ip: "49.207.218.15",
      city: "Bengaluru",
      country: "IN",
      region: "Karnataka",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15",
      deviceType: "Mobile",
      browser: "Mobile Safari",
      os: "iOS 17.6",
      page: "/screener",
      referrer: "https://t.co/",
      timestamp: new Date(now - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "v-seed-3",
      ip: "152.58.16.89",
      city: "Mumbai",
      country: "IN",
      region: "Maharashtra",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      deviceType: "Desktop",
      browser: "Chrome",
      os: "macOS Sonoma",
      page: "/valuation/RELIANCE",
      referrer: "https://www.google.com/",
      timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "v-seed-4",
      ip: "106.213.80.112",
      city: "Hyderabad",
      country: "IN",
      region: "Telangana",
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36",
      deviceType: "Mobile",
      browser: "Chrome Mobile",
      os: "Android 14",
      page: "/",
      referrer: "Direct",
      timestamp: new Date(now - 1000 * 60 * 24).toISOString(),
    },
  ];
}

export function recordVisitorLog(log: Omit<VisitorLog, "id">): VisitorLog {
  const fullLog: VisitorLog = {
    ...log,
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };

  const visitors = globalStore.__QUANTDCF_VISITORS__ || [];
  // Prepend newest first, maintain maximum 500 records
  visitors.unshift(fullLog);
  if (visitors.length > 500) {
    visitors.length = 500;
  }
  globalStore.__QUANTDCF_VISITORS__ = visitors;
  return fullLog;
}

export function getVisitorLogs(): VisitorLog[] {
  return globalStore.__QUANTDCF_VISITORS__ || [];
}

export function clearVisitorLogs(): void {
  globalStore.__QUANTDCF_VISITORS__ = [];
}

export function getVisitorStats() {
  const visitors = getVisitorLogs();
  const uniqueIps = new Set(visitors.map((v) => v.ip));
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const activeNow = visitors.filter(
    (v) => new Date(v.timestamp).getTime() > fiveMinutesAgo
  ).length;

  const pageCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
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
    totalVisits: visitors.length,
    uniqueIpsCount: uniqueIps.size,
    activeNow: Math.max(1, activeNow),
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
