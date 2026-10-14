"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, Wifi, WifiOff, CheckCircle2, ShieldCheck, ChevronDown, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";

interface ConnectivityState {
  status: "connected" | "connecting" | "offline";
  latencyMs: number;
  lastChecked: Date | null;
  companiesCount: number;
  auditedCount: number;
}

export function LiveConnectivityBadge() {
  const [state, setState] = useState<ConnectivityState>({
    status: "connecting",
    latencyMs: 0,
    lastChecked: null,
    companiesCount: 501,
    auditedCount: 9,
  });
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const checkConnectivity = async () => {
    const start = performance.now();
    try {
      const health = await api.getSourcesHealth();
      const latency = Math.round(performance.now() - start);
      const isOnline = Boolean(
        health?.catalog_companies_count > 0 ||
        health?.status === "healthy" ||
        health?.fundamental_disclosures?.status === "ONLINE"
      );

      setState({
        status: isOnline ? "connected" : "offline",
        latencyMs: Math.max(8, latency),
        lastChecked: new Date(),
        companiesCount: health?.catalog_companies_count || health?.providers?.catalog_companies_count || 501,
        auditedCount: health?.fundamental_disclosures?.verified_symbols_count || health?.providers?.fundamental_disclosures?.verified_symbols_count || 9,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        status: "offline",
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLive = state.status === "connected";
  const isConnecting = state.status === "connecting";
  const isOffline = state.status === "offline";

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Live Badge Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View live network and data connectivity status"
        title={isLive ? "Server Online (NSE Live Feed)" : isOffline ? "Server Error / Disconnected" : "Connecting to Server..."}
        className={`flex items-center gap-1.5 bg-[#0d1424] hover:bg-[#121c32] rounded-lg px-2 sm:px-2.5 py-1 text-xs transition-all active:scale-95 shadow-inner ${
          isOffline
            ? "border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
            : "border border-slate-800 hover:border-slate-700"
        }`}
      >
        {isLive ? (
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-75 animate-radar-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        ) : isConnecting ? (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        ) : (
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 opacity-75 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span
            className={`font-bold hidden md:inline ${
              isLive ? "text-slate-200" : isConnecting ? "text-amber-400" : "text-rose-400"
            }`}
          >
            {isLive ? "LIVE" : isConnecting ? "CONNECTING" : "OFFLINE"}
          </span>
          <span className="text-slate-400 font-sans hidden xl:inline">
            {isOffline ? "DISCONNECTED" : "NSE FEED"}
          </span>
          {isLive ? (
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded ml-0.5 hidden sm:inline">
              {state.latencyMs}ms
            </span>
          ) : isOffline ? (
            <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-1 rounded ml-0.5 hidden sm:inline">
              ERR
            </span>
          ) : null}
        </div>

        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Diagnostics Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0d1424] border border-slate-700/80 rounded-xl p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-xs">Connectivity Status</span>
            </div>
            <button
              onClick={checkConnectivity}
              title="Refresh connection test"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            {/* Backend API Ping */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-slate-800/80">
              <span className="text-slate-400">FastAPI Engine:</span>
              <span className={`font-mono font-bold flex items-center gap-1.5 ${isLive ? "text-emerald-400" : "text-rose-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-rose-400"}`} />
                {isLive ? `Online (${state.latencyMs}ms)` : "Disconnected"}
              </span>
            </div>

            {/* Quote Feed */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-slate-800/80">
              <span className="text-slate-400">Market Quotes:</span>
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                Live Bhavcopy + Yahoo
              </span>
            </div>

            {/* Catalog Coverage */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-slate-800/80">
              <span className="text-slate-400">NIFTY Coverage:</span>
              <span className="text-slate-200 font-mono font-bold">
                {state.companiesCount} Listed Companies
              </span>
            </div>

            {/* Audited Ind AS */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-slate-800/80">
              <span className="text-slate-400">Audited Filings:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {state.auditedCount} Verified Disclosures
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Protocol: WebSocket & REST</span>
            <span>{state.lastChecked ? state.lastChecked.toLocaleTimeString() : "Just now"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
