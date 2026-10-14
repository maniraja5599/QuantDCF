"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Users,
  Globe2,
  Activity,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  LogOut,
  MapPin,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { VisitorLog } from "@/lib/visitor-store";

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
  const [deviceFilter, setDeviceFilter] = useState<string>("ALL");
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

  // Fetch visitors
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
        setVisitors(data.visitors || []);
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
        setStats({
          totalVisits: 0,
          uniqueIpsCount: 0,
          activeNow: 0,
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
    const headers = ["Timestamp", "IP_Address", "Location", "Device", "OS", "Browser", "Page", "Referrer"];
    const rows = visitors.map((v) => [
      `"${v.timestamp}"`,
      `"${v.ip}"`,
      `"${v.city || ""}, ${v.country || ""}"`,
      `"${v.deviceType}"`,
      `"${v.os}"`,
      `"${v.browser}"`,
      `"${v.page}"`,
      `"${v.referrer || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quantdcf_visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered visitor list
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch =
        searchQuery === "" ||
        v.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.city && v.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.browser.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDevice =
        deviceFilter === "ALL" || v.deviceType.toUpperCase() === deviceFilter;

      return matchesSearch && matchesDevice;
    });
  }, [visitors, searchQuery, deviceFilter]);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 10) return "Just now";
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
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-[#0d1322] border border-slate-800 shadow-2xl p-6 md:p-8 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shield Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-emerald-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-lg font-bold text-white tracking-tight">
            QuantDCF Admin Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter 4-digit security PIN to access visitor logs
          </p>

          {/* PIN Digits Dots */}
          <div className="flex justify-center items-center gap-3 my-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > i
                    ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] scale-110"
                    : "border-2 border-slate-700 bg-slate-900"
                }`}
              />
            ))}
          </div>

          {pinError && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-2 px-3 mb-4 animate-shake">
              {pinError}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                disabled={isVerifying}
                className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-sky-500/20 border border-slate-700/50 hover:border-sky-500/30 text-white font-semibold text-lg transition-all duration-150 active:scale-95 shadow-sm"
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
              className="h-12 rounded-xl bg-slate-800/30 hover:bg-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              disabled={isVerifying}
              className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 active:bg-sky-500/20 border border-slate-700/50 text-white font-semibold text-lg transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-800/30 hover:bg-slate-800 text-slate-400 text-sm font-semibold transition-all active:scale-95 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <div className="mt-6 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit Encrypted Session</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard Screen
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white tracking-tight">
                Visitor Telemetry & IP Monitor
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time monitoring of users, IP addresses, geolocations, and pages viewed.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              autoRefresh
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800/60 text-slate-400 border-slate-700"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
            <span>{autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}</span>
          </button>

          <button
            onClick={fetchVisitors}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!visitors.length}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="rounded-xl bg-[#0d1322] border border-slate-800/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Pageviews</span>
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.totalVisits ?? visitors.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Logged requests recorded</p>
        </div>

        {/* Unique IP Addresses */}
        <div className="rounded-xl bg-[#0d1322] border border-slate-800/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Unique IP Addresses</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats?.uniqueIpsCount ?? new Set(visitors.map((v) => v.ip)).size}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Distinct visitors tracked</p>
        </div>

        {/* Active Sessions */}
        <div className="rounded-xl bg-[#0d1322] border border-slate-800/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Active (Last 5m)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats?.activeNow ?? 1}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Live active sessions</p>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-xl bg-[#0d1322] border border-slate-800/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Device Ratio</span>
            <Laptop className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-white flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-slate-300">
              <Laptop className="w-3.5 h-3.5 text-sky-400" />
              {stats?.devices?.Desktop ?? 0}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              {stats?.devices?.Mobile ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Desktop vs Mobile visits</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d1322] p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IP, city, or page URL..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            {["ALL", "DESKTOP", "MOBILE"].map((type) => (
              <button
                key={type}
                onClick={() => setDeviceFilter(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  deviceFilter === type
                    ? "bg-sky-500 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearLogs}
            title="Clear all logs"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visitor Log Table */}
      <div className="rounded-2xl bg-[#0d1322] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Live Visitor Stream</span>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredVisitors.length} of {visitors.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Auto-detects IP, City, OS & Terminal Path
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Page Viewed</th>
                <th className="py-3 px-4">Device & OS</th>
                <th className="py-3 px-4">Browser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                    No visitor activity matches your search criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-800/40 transition-colors group text-slate-300"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-200">
                          {getRelativeTime(v.timestamp)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        {new Date(v.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* IP Address */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {v.ip}
                        </span>
                        <button
                          onClick={() => handleCopyIp(v.ip)}
                          title="Copy IP"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        >
                          {copiedIp === v.ip ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 font-medium">
                          {v.city ? `${v.city}, ` : ""}
                          {v.country === "IN" ? "India 🇮🇳" : v.country || "India 🇮🇳"}
                        </span>
                      </div>
                      {v.region && v.region !== "IN" && (
                        <span className="text-[10px] text-slate-400 block ml-5">
                          {v.region}
                        </span>
                      )}
                    </td>

                    {/* Page Viewed */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700/80">
                        {v.page}
                      </span>
                    </td>

                    {/* Device & OS */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {v.deviceType === "Mobile" ? (
                          <Smartphone className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        )}
                        <span>{v.os}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({v.deviceType})
                        </span>
                      </div>
                    </td>

                    {/* Browser */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans text-slate-400">
                      <span>{v.browser}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
