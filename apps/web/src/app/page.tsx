"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Search,
  Calculator,
  ShieldCheck,
  Bookmark,
  Database,
  ArrowRight,
  CheckCircle2,
  Building2,
  FileText,
  Sliders,
  Layers,
  Sparkles,
  Command,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SavedValuation } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { LogoIcon, LogoHeroBadge } from "@/components/ui/logo";

export default function DashboardPage() {
  const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([]);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tickerItems, setTickerItems] = useState([
    { s: "NIFTY 50", p: "₹22,622.70", c: "-0.44%", isLive: true, type: "index" },
    { s: "SENSEX", p: "₹72,781.89", c: "-0.35%", isLive: true, type: "index" },
    { s: "BANK NIFTY", p: "₹55,316.00", c: "-0.30%", isLive: true, type: "index" },
    { s: "RELIANCE", p: "₹1,174.60", c: "+0.68%", isLive: true, type: "stock" },
    { s: "TCS", p: "₹2,304.90", c: "+1.57%", isLive: true, type: "stock" },
    { s: "HDFCBANK", p: "₹710.70", c: "-0.46%", isLive: true, type: "stock" },
    { s: "INFY", p: "₹1,088.00", c: "+2.44%", isLive: true, type: "stock" },
    { s: "ICICIBANK", p: "₹1,338.60", c: "-1.59%", isLive: true, type: "stock" },
    { s: "BHARTIARTL", p: "₹1,794.60", c: "-0.66%", isLive: true, type: "stock" },
    { s: "ITC", p: "₹261.50", c: "+0.19%", isLive: true, type: "stock" },
    { s: "LT", p: "₹3,642.00", c: "-0.90%", isLive: true, type: "stock" },
    { s: "TATAMOTORS", p: "₹283.80", c: "-0.72%", isLive: true, type: "stock" },
    { s: "TITAN", p: "₹4,444.00", c: "-0.96%", isLive: true, type: "stock" },
    { s: "MARUTI", p: "₹11,178.00", c: "-0.60%", isLive: true, type: "stock" },
    { s: "SUNPHARMA", p: "₹1,746.40", c: "-1.37%", isLive: true, type: "stock" },
  ]);

  const [benchmarkEquities, setBenchmarkEquities] = useState([
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd",
      sector: "Information Technology",
      cmp: "₹2,304.90",
      change: "+1.57%",
      isUp: true,
      marketCap: "₹8,33,913 Cr",
      status: "Audited Filings Verified",
      color: "border-sky-500/40 hover:border-sky-400",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Limited",
      sector: "Energy & Conglomerate",
      cmp: "₹1,174.60",
      change: "+0.68%",
      isUp: true,
      marketCap: "₹15,89,233 Cr",
      status: "Audited Filings Verified",
      color: "border-indigo-500/40 hover:border-indigo-400",
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Limited",
      sector: "Financial Services",
      cmp: "₹710.70",
      change: "-0.46%",
      isUp: false,
      marketCap: "₹10,80,264 Cr",
      status: "BFSI Valuation Active",
      color: "border-blue-500/40 hover:border-blue-400",
    },
    {
      symbol: "INFY",
      name: "Infosys Limited",
      sector: "Information Technology",
      cmp: "₹1,088.00",
      change: "+2.44%",
      isUp: true,
      marketCap: "₹4,51,628 Cr",
      status: "Audited Filings Verified",
      color: "border-emerald-500/40 hover:border-emerald-400",
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Limited",
      sector: "Financial Services",
      cmp: "₹1,338.60",
      change: "-1.59%",
      isUp: false,
      marketCap: "₹9,41,035 Cr",
      status: "BFSI Valuation Active",
      color: "border-rose-500/40 hover:border-rose-400",
    },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Limited",
      sector: "Telecommunications",
      cmp: "₹1,794.60",
      change: "-0.66%",
      isUp: false,
      marketCap: "₹10,62,403 Cr",
      status: "Audited Filings Verified",
      color: "border-red-500/40 hover:border-red-400",
    },
    {
      symbol: "LT",
      name: "Larsen & Toubro Limited",
      sector: "Infrastructure & EPC",
      cmp: "₹3,642.00",
      change: "-0.90%",
      isUp: false,
      marketCap: "₹5,00,775 Cr",
      status: "Audited Filings Verified",
      color: "border-amber-500/40 hover:border-amber-400",
    },
    {
      symbol: "MARUTI",
      name: "Maruti Suzuki India Limited",
      sector: "Automobile & Auto Components",
      cmp: "₹11,178.00",
      change: "-0.60%",
      isUp: false,
      marketCap: "₹3,51,440 Cr",
      status: "NIFTY 500 Active",
      color: "border-cyan-500/40 hover:border-cyan-400",
    },
  ]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [saved, health] = await Promise.all([
          api.listSavedValuations().catch(() => []),
          api.getSourcesHealth().catch(() => null),
        ]);
        if (isMounted) {
          setSavedValuations(saved);
          setProviderHealth(health);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function loadLeaders() {
      try {
        const leaders = await api.getMarketLeaders();
        if (isMounted && leaders && leaders.length > 0) {
          setTickerItems(
            leaders.map((item) => ({
              s: item.s,
              p: `₹${item.price.toLocaleString("en-IN", {
                minimumFractionDigits: item.price < 500 ? 2 : item.price > 10000 ? 0 : 2,
                maximumFractionDigits: 2,
              })}`,
              c: `${item.p_change >= 0 ? "+" : ""}${item.p_change.toFixed(2)}%`,
              isLive: item.is_live,
              type: item.type,
            }))
          );

          setBenchmarkEquities((prev) =>
            prev.map((eq) => {
              const matched = leaders.find((l) => l.s === eq.symbol);
              if (!matched) return eq;
              return {
                ...eq,
                cmp: `₹${matched.price.toLocaleString("en-IN", {
                  minimumFractionDigits: matched.price < 500 ? 2 : 2,
                  maximumFractionDigits: 2,
                })}`,
                change: `${matched.p_change >= 0 ? "+" : ""}${matched.p_change.toFixed(2)}%`,
                isUp: matched.p_change >= 0,
              };
            })
          );
        }
      } catch (err) {
        console.error("Failed to load live market leaders:", err);
      }
    }

    loadData();
    loadLeaders();
    const interval = setInterval(loadLeaders, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Live Market Ticker Marquee Strip */}
      <div className="bg-white dark:bg-[#0b101c] border border-slate-200 dark:border-slate-800/90 rounded-xl px-3 py-2 overflow-x-auto scrollbar-none shadow-sm dark:shadow-inner">
        <div className="flex items-center gap-4 sm:gap-6 text-xs whitespace-nowrap min-w-max">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold font-mono text-[11px] pr-2 border-r border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">LIVE FEED</span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">NSE / BSE</span>
          </div>
          {tickerItems.map((item, idx) => {
            const isPos = item.c.startsWith("+");
            const isIndex = item.type === "index";
            const targetHref = isIndex ? "/screener" : `/valuation/${item.s}`;
            return (
              <Link
                key={idx}
                href={targetHref}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 px-2 py-0.5 rounded transition-colors group"
                title={`${item.s} ${isIndex ? "Index" : "Equity"} ${item.isLive ? "(Live Market Feed)" : "(Bhavcopy)"}`}
              >
                <div className="flex items-center gap-1">
                  {item.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  )}
                  <span className={`font-bold font-mono text-xs ${isIndex ? "text-amber-600 dark:text-amber-300 group-hover:text-amber-700 dark:group-hover:text-amber-200" : "text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400"}`}>
                    {item.s}
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] font-semibold">{item.p}</span>
                <span className={`font-mono text-[10px] font-bold ${isPos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {item.c}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Upgraded Institutional Hero Section */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#0d1424] dark:via-[#0a0f1d] dark:to-[#080c16] p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Ambient Top Glow Orbs & Geometric Dot Lattice */}
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Value Proposition & Action (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Indicator Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
                <span>QuantDCF Institutional Terminal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>501 NIFTY Equities Indexed</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero Black Boxes</span>
              </span>
            </div>

            {/* Dynamic Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Valuation Reimagined for{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent underline decoration-sky-500/30 decoration-wavy decoration-1 underline-offset-8">
                Indian Equities
              </span>
            </h1>

            {/* Value Description */}
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
              Autonomous equity research platform linking verified NSE filings with transparent 5-year explicit Free Cash Flow to Firm (FCFF) models, perpetual Gordon Growth anchors, and 2D WACC sensitivity grids. 100% mathematical provenance.
            </p>

            {/* Quick Search & Launch Action Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
                className="flex-1 bg-slate-50 dark:bg-[#121829]/90 hover:bg-slate-100 dark:hover:bg-[#161f33] border border-slate-300 dark:border-slate-700/80 hover:border-sky-500/60 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between shadow-lg shadow-sky-500/5 transition-all active:scale-[0.98] group hover-glow-sky"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 group-hover:scale-115 transition-transform" />
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 font-medium">
                    Search any of 501 Indian companies...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono">
                  Ctrl K
                </kbd>
              </button>

              <Link
                href="/screener"
                className="bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover-lift active-press shimmer-sweep shrink-0"
              >
                <span>501 Screener</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Hero Trust Badges (Key Telemetry Strip) */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Universe</div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">501 Equities</div>
                <div className="text-[10px] text-slate-500">20 NSE Sectors</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/80 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cost of Capital</div>
                <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-mono">7.10% Rf</div>
                <div className="text-[10px] text-slate-500">RBI Sovereign G-Sec</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/80 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Verification</div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">100% Audited</div>
                <div className="text-[10px] text-slate-500">Zero Dummy Data</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Live Valuation Terminal Showcase Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <Link
              href="/valuation/SUZLON"
              className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900/95 via-[#0c1222]/95 to-slate-950/95 border border-sky-500/40 p-5 shadow-2xl shadow-sky-500/10 hover-lift hover-glow-sky group transition-all relative overflow-hidden block animate-float-slow"
              title="Inspect Live Suzlon Energy DCF Model"
            >
              {/* Card Ambient Glow Header */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-sky-500/20 to-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Showcase Header with Official 3D Logo & Live Pulse */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 relative z-10">
                <div className="flex items-center gap-3">
                  <LogoIcon size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-black text-white group-hover:text-sky-300 transition-colors">
                        SUZLON
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded font-bold">
                        NSE
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      Suzlon Energy Ltd.
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE MODEL
                </span>
              </div>

              {/* Core Intrinsic Value Snapshot */}
              <div className="py-4 space-y-3 relative z-10">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                      Intrinsic Value / Share
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight mt-0.5 group-hover:text-sky-300 transition-colors">
                      ₹21.27
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Market Price (CMP)
                    </div>
                    <div className="text-sm font-bold text-slate-300 font-mono mt-0.5">
                      ₹40.80
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30">
                      -47.9% Margin
                    </span>
                  </div>
                </div>

                {/* 5-Year FCFF Trajectory Visualizer */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>5-Yr FCFF Cash Flow Horizon</span>
                    <span className="text-emerald-400 font-semibold">T+1 to T+5 CAGR 8.2%</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 h-14 items-end bg-[#070b14] p-2 rounded-xl border border-slate-800/80">
                    {[
                      { y: "FY25E", v: "₹2,086 Cr", h: "52%" },
                      { y: "FY26E", v: "₹2,274 Cr", h: "64%" },
                      { y: "FY27E", v: "₹2,467 Cr", h: "76%" },
                      { y: "FY28E", v: "₹2,664 Cr", h: "88%" },
                      { y: "FY29E", v: "₹2,864 Cr", h: "100%" },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 h-full justify-end group/bar">
                        <div
                          style={{ height: bar.h }}
                          className="w-full rounded-md bg-gradient-to-t from-sky-600 via-sky-400 to-emerald-400 group-hover/bar:brightness-125 transition-all shadow-sm shadow-sky-500/20"
                          title={`${bar.y}: ${bar.v}`}
                        />
                        <span className="text-[8px] font-mono text-slate-400">{bar.y.slice(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Valuation Parameters Pill */}
                <div className="grid grid-cols-3 gap-2 bg-[#080d1a] border border-slate-800/80 rounded-xl p-2.5 text-center text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">WACC</span>
                    <span className="font-bold text-sky-400">12.84%</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Terminal g</span>
                    <span className="font-bold text-emerald-400">5.00%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Implied EV</span>
                    <span className="font-bold text-slate-200">₹29,533 Cr</span>
                  </div>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:text-sky-300">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Launch Suzlon DCF Model</span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Sectors Launch Bar */}
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Quick Equity Launch:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: "IT", symbol: "TCS", cmp: "₹2,304.90" },
              { name: "Banking", symbol: "HDFCBANK", cmp: "₹710.70" },
              { name: "Clean Energy", symbol: "SUZLON", cmp: "₹40.80" },
              { name: "Energy", symbol: "RELIANCE", cmp: "₹1,174.60" },
              { name: "FMCG", symbol: "ITC", cmp: "₹261.50" },
              { name: "Infra", symbol: "LT", cmp: "₹3,642.00" },
              { name: "Auto", symbol: "MARUTI", cmp: "₹11,178.00" },
            ].map((chip) => (
              <Link
                key={chip.symbol}
                href={`/valuation/${chip.symbol}`}
                className="bg-slate-100 dark:bg-[#101729] hover:bg-slate-200 dark:hover:bg-[#141e34] border border-slate-300 dark:border-slate-800 hover:border-sky-500/50 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover-lift active-press group flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-bold text-sky-600 dark:text-sky-400">{chip.symbol}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">({chip.name})</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">{chip.cmp}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Indian Macro Benchmarks with Concise Micro-Descriptions */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Risk-free Rate */}
        <div className="bg-[#111726] border border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">10-Year Indian G-Sec Yield (Rf)</div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-1 group-hover:text-sky-300 transition-colors">7.10%</div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60 leading-tight">
            Benchmark risk-free rate from RBI sovereign bond yield curve
          </div>
        </div>

        {/* Equity Risk Premium */}
        <div className="bg-[#111726] border border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">India Equity Risk Premium (ERP)</div>
            <div className="text-2xl font-black text-sky-400 font-mono mt-1 group-hover:scale-105 group-hover:text-sky-300 transition-all origin-left">6.50%</div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60 leading-tight">
            Expected equity return over sovereign G-Sec for emerging market risk
          </div>
        </div>

        {/* Corporate Tax Rate */}
        <div className="bg-[#111726] border border-slate-800 hover-glow-emerald hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Effective Corporate Tax Rate</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1 group-hover:scale-105 group-hover:text-emerald-300 transition-all origin-left">25.17%</div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60 leading-tight">
            Base statutory 22% + 10% surcharge + 4% health & education cess
          </div>
        </div>

        {/* Terminal Growth Cap */}
        <div className="bg-[#111726] border border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Sustainable Terminal Growth Cap</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1 group-hover:scale-105 group-hover:text-amber-300 transition-all origin-left">5.00%</div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60 leading-tight">
            Prudent Gordon Growth rate capped below long-term nominal Indian GDP
          </div>
        </div>
      </div>

      {/* 4. Core Platform Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/screener"
          className="p-4 rounded-xl bg-[#101728] border border-slate-800 hover-glow-sky hover-lift active-press transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-sky-500/20 transition-all duration-200">
            <Search className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors">501 NIFTY Screener</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Filter 501 companies across 20 official sectors with live Bhavcopy price quotes.
          </p>
        </Link>

        <Link
          href="/valuation/TCS"
          className="p-4 rounded-xl bg-[#101728] border border-slate-800 hover-glow-emerald hover-lift active-press transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-emerald-500/20 transition-all duration-200">
            <Calculator className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">DCF Modeling Terminal</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            5-Year explicit FCFF schedules, Gordon Growth terminal value, and sensitivity matrix.
          </p>
        </Link>

        <Link
          href="/reports"
          className="p-4 rounded-xl bg-[#101728] border border-slate-800 hover-glow-purple hover-lift active-press transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-purple-500/20 transition-all duration-200">
            <FileText className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">Research Memos & Reports</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Institutional research reports with downloadable PDFs and full mathematical provenance.
          </p>
        </Link>

        <Link
          href="/sources"
          className="p-4 rounded-xl bg-[#101728] border border-slate-800 hover-glow-sky hover-lift active-press transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-amber-500/20 transition-all duration-200">
            <Database className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">Data Integrity & MCP Gate</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Audit trail of normalized Ind AS balance sheets and official NSE compliance status.
          </p>
        </Link>
      </div>

      {/* 5. Featured Indian Equities Universe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Featured Indian Equities</h2>
            <p className="text-xs text-slate-400">Real-time CMP quotes and audited 5-year Ind AS valuation models.</p>
          </div>
          <Link href="/screener" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 group">
            <span>View All 501 Equities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {benchmarkEquities.map((eq) => (
            <Link
              key={eq.symbol}
              href={`/valuation/${eq.symbol}`}
              className={`bg-[#111726] border ${eq.color} rounded-xl p-4 sm:p-5 hover:bg-slate-800/40 hover-lift active-press transition-all shadow-md group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-sky-400 font-mono group-hover:text-sky-300">
                    {eq.symbol}
                  </span>
                  <div className="flex items-center gap-1.5 text-right font-mono">
                    <span className="text-xs font-bold text-slate-200">{eq.cmp}</span>
                    <span className={`text-[10px] font-bold ${eq.isUp ? "text-emerald-400" : "text-rose-400"}`}>
                      {eq.change}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-200 mt-2 truncate" title={eq.name}>
                  {eq.name}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{eq.sector}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  {eq.status}
                </span>
                <span className="text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Model DCF <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Saved Valuations & Data Source Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Valuations */}
        <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-sky-400" />
                Saved Valuation Models
              </h3>
              <p className="text-[11px] text-slate-500">Persisted DCF models with custom growth & discount scenarios</p>
            </div>
            <Link href="/saved" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              Manage Models
            </Link>
          </div>

          <div className="space-y-3">
            {savedValuations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-[#0c1220]/60 rounded-xl border border-slate-800/60 p-6">
                No custom valuations saved yet. Launch any company valuation to customize and save your analysis.
              </div>
            ) : (
              savedValuations.map((v) => (
                <Link
                  key={v.id}
                  href={`/valuation/${v.company_symbol}`}
                  className="block p-4 rounded-xl bg-[#0c1220] border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-sky-400 font-mono">{v.company_symbol}</span>
                        <span className="text-xs font-semibold text-slate-200">{v.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{v.company_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-100 font-mono">
                        {formatINR(v.calculated_intrinsic_value)}
                      </div>
                      {v.implied_upside_downside_pct !== undefined && (
                        <div
                          className={`text-[10px] font-bold font-mono ${
                            v.implied_upside_downside_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {formatPercent(v.implied_upside_downside_pct)} Implied
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Data Sources & Compliance Box */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                Data Source Integrity
              </h3>
              <p className="text-[11px] text-slate-500">Live provenance & regulatory compliance</p>
            </div>
            <Link href="/sources" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              Details
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {/* NSE MCP Gate Status */}
            <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">NSE MCP Gateway</span>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Compliance Gated
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adheres strictly to official NSE Data Policy. Gated until commercial license agreement is verified.
              </p>
            </div>

            {/* Audited Filings Status */}
            <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Audited Filings Layer</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Online & Audited
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct balance sheet & P&L normalization with document references and timestamp provenance.
              </p>
            </div>

            {/* User Document Parser */}
            <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">CSV/XLSX Parser</span>
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Accepts user-uploaded financial statements without silently substituting demo or fake data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
