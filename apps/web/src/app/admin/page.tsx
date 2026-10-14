"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Lock,
  Users,
  Globe2,
  Activity,
  Laptop,
  Smartphone,
  RefreshCw,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  LogOut,
  MapPin,
  Clock,
  ShieldCheck,
  Timer,
  Eye,
} from "lucide-react";
import type { VisitorLog } from "@/lib/visitor-store";

function formatDuration(seconds: number): string {
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "DESKTOP" | "MOBILE">("ALL");
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Check existing session token on mount
  useEffect(() => {
    const savedToken =
      sessionStorage.getItem("quantdcf_admin_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("quantdcf_admin_token="))
        ?.split("=")[1];

    if (savedToken && savedToken.startsWith("adm_")) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (enteredPin: string) => {
    setIsVerifying(true);
    setPinError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "manirajankg@gmail.com",
          pin: enteredPin,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("quantdcf_admin_token", data.token);
        setIsAuthenticated(true);
        setPin("");
      } else {
        setPinError(data.detail || "Incorrect PIN code. Access denied.");
        setPin("");
      }
    } catch (_) {
      setPinError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("quantdcf_admin_token");
    document.cookie =
      "quantdcf_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setVisitors([]);
    setStats(null);
  };

  // Load persistent local log cache immediately on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("quantdcf_admin_stored_visitors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisitors(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // Fetch visitors and merge with persistent history
  const fetchVisitors = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("quantdcf_admin_token");
      const res = await fetch("/api/admin/visitors", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const incoming: VisitorLog[] = data.visitors || [];
        setVisitors((prev) => {
          const map = new Map<string, VisitorLog>();
          prev.forEach((v) => {
            const key = v.visitorUid || v.id || v.sessionId || v.ip;
            map.set(key, v);
          });
          incoming.forEach((v: VisitorLog) => {
            const key = v.visitorUid || v.id || v.sessionId || v.ip;
            const existing = map.get(key);
            map.set(key, { ...existing, ...v });
          });
          const merged = Array.from(map.values()).sort(
            (a, b) =>
              new Date(b.lastSeen || b.timestamp).getTime() -
              new Date(a.lastSeen || a.timestamp).getTime()
          );
          try {
            localStorage.setItem("quantdcf_admin_stored_visitors", JSON.stringify(merged.slice(0, 500)));
          } catch (_) {}
          return merged;
        });
        setStats(data.stats || null);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVisitors();
    }
  }, [isAuthenticated, fetchVisitors]);

  // Auto-refresh interval (5 seconds)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchVisitors();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, fetchVisitors]);

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all recorded visitor activity logs?")) {
      return;
    }
    const token = sessionStorage.getItem("quantdcf_admin_token");
    try {
      const res = await fetch("/api/admin/visitors", {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        setVisitors([]);
        try {
          localStorage.removeItem("quantdcf_admin_stored_visitors");
        } catch (_) {}
        setStats({
          totalSessions: 0,
          totalVisits: 0,
          uniqueIpsCount: 0,
          activeNow: 0,
          avgDurationSeconds: 0,
          avgDurationFormatted: "< 5s",
          topPages: [],
          devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
        });
      }
    } catch (_) {}
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleExportCsv = () => {
    if (!visitors.length) return;
    const headers = [
      "Session_ID",
      "Visitor_UID",
      "IP_Address",
      "Visits_Count",
      "Session_Time_Seconds",
      "Session_Time_Formatted",
      "Total_Time_Seconds",
      "Total_Time_Formatted",
      "Status",
      "First_Seen",
      "Last_Seen",
      "Location",
      "Device",
      "OS",
      "Browser",
      "Latest_Page",
      "Pages_Browsed",
    ];
    const rows = visitors.map((v) => [
      `"${v.sessionId || v.id}"`,
      `"${v.visitorUid || ""}"`,
      `"${v.ip}"`,
      `"${v.visitCount || 1}"`,
      `"${v.durationSeconds || 0}"`,
      `"${formatDuration(v.durationSeconds || 0)}"`,
      `"${v.totalDurationSeconds || v.durationSeconds || 0}"`,
      `"${formatDuration(v.totalDurationSeconds || v.durationSeconds || 0)}"`,
      `"${v.isOnline ? "Online" : "Offline"}"`,
      `"${v.firstSeen || v.timestamp}"`,
      `"${v.lastSeen || v.timestamp}"`,
      `"${v.city || ""}, ${v.country || ""}"`,
      `"${v.deviceType}"`,
      `"${v.os}"`,
      `"${v.browser}"`,
      `"${v.page}"`,
      `"${(v.pagesVisited || [v.page]).join(" -> ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quantdcf_visitor_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered visitor list
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        v.ip.toLowerCase().includes(q) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        v.page.toLowerCase().includes(q) ||
        (v.pagesVisited && v.pagesVisited.some((p) => p.toLowerCase().includes(q))) ||
        v.browser.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "ONLINE") return v.isOnline;
      if (statusFilter === "DESKTOP") return v.deviceType === "Desktop";
      if (statusFilter === "MOBILE") return v.deviceType === "Mobile";
      return true;
    });
  }, [visitors, searchQuery, statusFilter]);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    if (!timestamp) return "Just now";
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 15) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 1. PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-xs rounded-2xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-12 h-12 mx-auto rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-base font-bold text-white tracking-tight">
            QuantDCF Telemetry PIN
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Enter 4-digit code to access visitor logs
          </p>

          {/* PIN Digits */}
          <div className="flex justify-center items-center gap-2.5 my-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  pin.length > i
                    ? "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] scale-110"
                    : "border-2 border-slate-700 bg-slate-900"
                }`}
              />
            ))}
          </div>

          {pinError && (
            <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md py-1.5 px-2 mb-3">
              {pinError}
            </div>
          )}

          {/* Compact Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                disabled={isVerifying}
                className="h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 active:bg-sky-500/20 border border-slate-700/60 text-white font-semibold text-base transition-all active:scale-95"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPin("");
                setPinError("");
              }}
              className="h-10 rounded-lg bg-slate-800/30 hover:bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              disabled={isVerifying}
              className="h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 active:bg-sky-500/20 border border-slate-700/60 text-white font-semibold text-base transition-all active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-10 rounded-lg bg-slate-800/30 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-all flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. High-Density Compact Admin Dashboard
  return (
    <div className="space-y-3 pb-8 max-w-7xl mx-auto">
      {/* Compact Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#0b0f19] border border-slate-800/90 px-3.5 py-2.5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Visitor Telemetry & Time Spent Terminal
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Real-time capture of Visitor IP, Geolocation, Pages browsed, and exact Time Spent.
            </p>
          </div>
        </div>

        {/* Compact Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 ${
              autoRefresh
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800/60 text-slate-400 border-slate-700"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${autoRefresh ? "animate-spin" : ""}`} />
            <span>{autoRefresh ? "Auto (5s)" : "Manual"}</span>
          </button>

          <button
            onClick={fetchVisitors}
            disabled={loading}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!visitors.length}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* 4 Ultra-Compact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Active Now */}
        <div className="rounded-xl bg-[#0b0f19] border border-slate-800/90 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Active Now</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              {stats?.activeNow ?? visitors.filter((v) => v.isOnline).length}
            </div>
            <p className="text-[10px] text-slate-500">Live in last 90 seconds</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Unique IP Addresses */}
        <div className="rounded-xl bg-[#0b0f19] border border-slate-800/90 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Unique Visitors</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {stats?.uniqueIpsCount ?? new Set(visitors.map((v) => v.ip)).size}
            </div>
            <p className="text-[10px] text-slate-500">Distinct IP addresses</p>
          </div>
          <Users className="w-4 h-4 text-sky-400" />
        </div>

        {/* Avg Time & Total Time Spent */}
        <div className="rounded-xl bg-[#0b0f19] border border-slate-800/90 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Time Spent</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
              {stats?.avgDurationFormatted ?? formatDuration(stats?.avgDurationSeconds || 0)}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Total: {formatDuration(visitors.reduce((acc, v) => acc + (v.totalDurationSeconds || v.durationSeconds || 0), 0))}
            </p>
          </div>
          <Timer className="w-4 h-4 text-amber-400" />
        </div>

        {/* Total Pageviews */}
        <div className="rounded-xl bg-[#0b0f19] border border-slate-800/90 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Pageviews</div>
            <div className="text-xl font-black text-purple-400 font-mono mt-0.5">
              {stats?.totalVisits ?? visitors.reduce((acc, v) => acc + (v.pageViewsCount || 1), 0)}
            </div>
            <p className="text-[10px] text-slate-500">Across {visitors.length} sessions</p>
          </div>
          <Eye className="w-4 h-4 text-purple-400" />
        </div>
      </div>

      {/* Compact Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#0b0f19] px-3 py-2 rounded-xl border border-slate-800/90">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IP, city, or page..."
            className="w-full pl-8 pr-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[10px]">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "ONLINE", label: "🟢 Online" },
                { id: "DESKTOP", label: "Desktop" },
                { id: "MOBILE", label: "Mobile" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  statusFilter === tab.id
                    ? "bg-sky-500 text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearLogs}
            title="Clear all logs"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dense Institutional Visitor Table */}
      <div className="rounded-xl bg-[#0b0f19] border border-slate-800/90 overflow-hidden shadow-md">
        <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Live Visitor Sessions</span>
            <span className="text-slate-400 font-mono text-[10px]">
              ({filteredVisitors.length} of {visitors.length} recorded)
            </span>
          </div>
          <span className="text-slate-500 text-[10px] hidden sm:inline">
            Persisted logs with live heartbeat duration
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Time Spent (Duration)</th>
                <th className="py-2 px-3">Visitor IP</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Pages Browsed</th>
                <th className="py-2 px-3">Device & Browser</th>
                <th className="py-2 px-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-sans text-xs">
                    {visitors.length === 0
                      ? "No visitors tracked yet. Live visits will appear here automatically."
                      : "No visitor sessions match your search filter."}
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => {
                  const durationText = formatDuration(v.durationSeconds || 0);
                  const isLongSession = (v.durationSeconds || 0) >= 120;

                  return (
                    <tr
                      key={v.id || v.sessionId}
                      className="hover:bg-slate-800/40 transition-colors group text-slate-300 text-[11px]"
                    >
                      {/* 1. Status & Visits */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {v.isOnline ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              Offline
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                              v.visitCount && v.visitCount > 1
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-sans"
                                : "bg-slate-800/80 text-slate-400 border border-slate-700/50 font-sans"
                            }`}
                          >
                            {v.visitCount && v.visitCount > 1 ? `🔥 ${v.visitCount} visits` : "1st visit"}
                          </span>
                        </div>
                      </td>

                      {/* 2. Time Spent (Duration) */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Timer className={`w-3.5 h-3.5 ${isLongSession ? "text-amber-400" : "text-sky-400"}`} />
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              isLongSession
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                            }`}
                          >
                            {durationText}
                          </span>
                          {v.totalDurationSeconds && v.totalDurationSeconds > (v.durationSeconds || 0) && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                              Total: {formatDuration(v.totalDurationSeconds)}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 block mt-0.5 font-sans">
                          Started: {new Date(v.firstSeen || v.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* 3. IP Address */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50 font-mono text-[11px]">
                            {v.ip}
                          </span>
                          <button
                            onClick={() => handleCopyIp(v.ip)}
                            title="Copy IP"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          >
                            {copiedIp === v.ip ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 4. Location */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap font-sans">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 font-medium text-[11px]">
                            {v.city ? `${v.city}, ` : ""}
                            {v.country === "IN" ? "India 🇮🇳" : v.country || "India 🇮🇳"}
                          </span>
                        </div>
                        {v.region && v.region !== "IN" && (
                          <span className="text-[9px] text-slate-500 block ml-4">
                            {v.region}
                          </span>
                        )}
                      </td>

                      {/* 5. Pages Browsed */}
                      <td className="py-1.5 px-2.5 font-sans">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700 font-mono truncate max-w-[150px]">
                            {v.page}
                          </span>
                          {v.pagesVisited && v.pagesVisited.length > 1 && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              +{v.pagesVisited.length - 1} ({v.pageViewsCount} hits)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Device & Browser */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap font-sans">
                        <div className="flex items-center gap-1 text-slate-300 text-[11px]">
                          {v.deviceType === "Mobile" ? (
                            <Smartphone className="w-3 h-3 text-pink-400 shrink-0" />
                          ) : (
                            <Laptop className="w-3 h-3 text-sky-400 shrink-0" />
                          )}
                          <span className="font-medium text-slate-200">{v.os}</span>
                          <span className="text-slate-500 text-[10px]">
                            • {v.browser}
                          </span>
                        </div>
                      </td>

                      {/* 7. Last Active */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-sans">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-slate-300 font-medium text-[11px]">
                            {getRelativeTime(v.lastSeen || v.timestamp)}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                          {new Date(v.lastSeen || v.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
