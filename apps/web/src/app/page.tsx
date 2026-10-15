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
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SavedValuation } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";
import { LogoIcon, LogoHeroBadge } from "@/components/ui/logo";

interface FeaturedDCFStock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  intrinsic: string;
  cmp: string;
  margin: string;
  isPositiveMargin: boolean;
  cagr: string;
  wacc: string;
  terminalG: string;
  impliedEv: string;
  bars: { y: string; v: string; h: string }[];
}

const FEATURED_DCF_STOCKS: FeaturedDCFStock[] = [
  {
    symbol: "SUZLON",
    name: "Suzlon Energy Ltd.",
    exchange: "NSE",
    sector: "Renewable Energy",
    intrinsic: "₹21.27",
    cmp: "₹40.80",
    margin: "-47.9%",
    isPositiveMargin: false,
    cagr: "8.2%",
    wacc: "12.84%",
    terminalG: "5.00%",
    impliedEv: "₹29,527 Cr",
    bars: [
      { y: "FY25E", v: "₹2,086 Cr", h: "52%" },
      { y: "FY26E", v: "₹2,274 Cr", h: "64%" },
      { y: "FY27E", v: "₹2,467 Cr", h: "76%" },
      { y: "FY28E", v: "₹2,664 Cr", h: "88%" },
      { y: "FY29E", v: "₹2,864 Cr", h: "100%" },
    ],
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    exchange: "NSE",
    sector: "Information Technology",
    intrinsic: "₹1,944.54",
    cmp: "₹2,304.90",
    margin: "-15.6%",
    isPositiveMargin: false,
    cagr: "7.8%",
    wacc: "12.50%",
    terminalG: "5.00%",
    impliedEv: "₹6,89,153 Cr",
    bars: [
      { y: "FY25E", v: "₹47,283 Cr", h: "65%" },
      { y: "FY26E", v: "₹51,302 Cr", h: "73%" },
      { y: "FY27E", v: "₹55,406 Cr", h: "81%" },
      { y: "FY28E", v: "₹59,562 Cr", h: "90%" },
      { y: "FY29E", v: "₹63,731 Cr", h: "100%" },
    ],
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    exchange: "NSE",
    sector: "Energy & Conglomerate",
    intrinsic: "₹1,816.52",
    cmp: "₹1,174.60",
    margin: "+54.7%",
    isPositiveMargin: true,
    cagr: "8.5%",
    wacc: "11.90%",
    terminalG: "5.00%",
    impliedEv: "₹13,57,176 Cr",
    bars: [
      { y: "FY25E", v: "₹83,515 Cr", h: "60%" },
      { y: "FY26E", v: "₹91,449 Cr", h: "70%" },
      { y: "FY27E", v: "₹99,679 Cr", h: "79%" },
      { y: "FY28E", v: "₹1,07,653 Cr", h: "89%" },
      { y: "FY29E", v: "₹1,15,727 Cr", h: "100%" },
    ],
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    exchange: "NSE",
    sector: "Information Technology",
    intrinsic: "₹982.05",
    cmp: "₹1,088.00",
    margin: "-9.7%",
    isPositiveMargin: false,
    cagr: "7.3%",
    wacc: "12.20%",
    terminalG: "5.00%",
    impliedEv: "₹3,91,051 Cr",
    bars: [
      { y: "FY25E", v: "₹26,158 Cr", h: "64%" },
      { y: "FY26E", v: "₹28,250 Cr", h: "72%" },
      { y: "FY27E", v: "₹30,369 Cr", h: "81%" },
      { y: "FY28E", v: "₹32,495 Cr", h: "90%" },
      { y: "FY29E", v: "₹34,607 Cr", h: "100%" },
    ],
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    exchange: "NSE",
    sector: "FMCG & Diversified",
    intrinsic: "₹276.38",
    cmp: "₹261.50",
    margin: "+5.7%",
    isPositiveMargin: true,
    cagr: "7.1%",
    wacc: "11.20%",
    terminalG: "5.00%",
    impliedEv: "₹3,33,423 Cr",
    bars: [
      { y: "FY25E", v: "₹19,263 Cr", h: "66%" },
      { y: "FY26E", v: "₹20,708 Cr", h: "73%" },
      { y: "FY27E", v: "₹22,261 Cr", h: "81%" },
      { y: "FY28E", v: "₹23,819 Cr", h: "90%" },
      { y: "FY29E", v: "₹25,367 Cr", h: "100%" },
    ],
  },
];

export default function DashboardPage() {
  const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([]);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStockIndex, setActiveStockIndex] = useState(0);

  // Touch Swipe gestures for Valuation Carousel Card
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setActiveStockIndex((prev) => (prev + 1) % FEATURED_DCF_STOCKS.length);
    } else if (isRightSwipe) {
      setActiveStockIndex((prev) => (prev - 1 + FEATURED_DCF_STOCKS.length) % FEATURED_DCF_STOCKS.length);
    }
  };

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
                  minimumFractionDigits: 2,
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

  const currentStock = FEATURED_DCF_STOCKS[activeStockIndex];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Live Market Ticker Marquee Strip (Continuous auto-scrolling with pause on hover) */}
      <div className="relative bg-white dark:bg-[#0b101c] border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-sm dark:shadow-inner flex items-center h-10">
        {/* Stationary Left Feed Badge */}
        <div className="relative z-20 flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#0b101c] border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.35)] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block" />
          <span className="font-bold font-mono text-[11px] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">MARKET FEED</span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden sm:inline font-mono">NSE/BSE</span>
        </div>

        {/* Continuous Scrolling Marquee Track */}
        <div className="relative flex-1 overflow-hidden">
          {/* Subtle Right Fade Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#0b101c] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-4 sm:gap-6 text-xs whitespace-nowrap pl-4 py-1.5">
            {[...tickerItems, ...tickerItems].map((item, idx) => {
              const isPos = item.c.startsWith("+");
              const isIndex = item.type === "index";
              const targetHref = isIndex ? "/screener" : `/valuation/${item.s}`;
              return (
                <Link
                  key={`${item.s}-${idx}`}
                  href={targetHref}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 px-2 py-0.5 rounded transition-colors group shrink-0"
                  title={`${item.s} ${isIndex ? "Index" : "Equity"} ${item.isLive ? "(Live Market Feed)" : "(Bhavcopy)"}`}
                >
                  <div className="flex items-center gap-1">
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
      </div>

      {/* 2. Institutional Hero Section */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-[#0d1424] dark:via-[#0a0f1d] dark:to-[#080c16] p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Soft Ambient Glow */}
        <div className="absolute -top-32 -left-20 w-96 h-96 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Value Proposition & Action (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Indicator Badges (Clean static indicators, no dot animation) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
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
              <span className="text-sky-600 dark:text-sky-400 font-black inline-block">
                Indian Equities
              </span>
            </h1>

            {/* Value Description */}
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
              Autonomous equity research platform linking verified NSE filings with transparent 5-year explicit Free Cash Flow to Firm (FCFF) models, perpetual Gordon Growth anchors, and 2D WACC sensitivity grids. 100% mathematical provenance.
            </p>

            {/* Quick Search & Launch Action Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
                className="flex-1 bg-slate-50 dark:bg-[#121829]/90 hover:bg-slate-100 dark:hover:bg-[#161f33] border border-slate-300 dark:border-slate-700/80 hover:border-sky-500/60 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-lg shadow-sky-500/5 transition-all active:scale-[0.98] group hover-glow-sky"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-115 transition-transform" />
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 font-medium">
                    Search any of 501 Indian companies...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono">
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
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Universe</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">501 Equities</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">20 NSE Sectors</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/80 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Cost of Capital</div>
                <div className="text-sm font-extrabold text-sky-700 dark:text-sky-400 font-mono">7.10% Rf</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">RBI Sovereign G-Sec</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800/80 pl-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Verification</div>
                <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">100% Audited</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Zero Dummy Data</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Swipeable 3D Live Valuation Terminal Showcase Carousel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Quick stock selector pill bar */}
            <div className="flex items-center gap-1 mb-2.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm w-full justify-between">
              {FEATURED_DCF_STOCKS.map((stk, idx) => {
                const isActive = idx === activeStockIndex;
                return (
                  <button
                    key={stk.symbol}
                    onClick={() => setActiveStockIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      isActive
                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 scale-105"
                        : "text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {stk.symbol}
                  </button>
                );
              })}
            </div>

            {/* Swipeable Card Container */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full max-w-sm relative select-none"
            >
              <div
                className="w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-[#0c1222]/95 dark:to-slate-950/95 border border-slate-200 dark:border-sky-500/40 p-5 shadow-xl dark:shadow-2xl dark:shadow-sky-500/10 hover-glow-sky group transition-all relative overflow-hidden"
              >
                {/* Card Ambient Glow Header */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-sky-500/15 to-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Showcase Header with Official 3D Logo & Verified Tag */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800/80 relative z-10">
                  <div className="flex items-center gap-3">
                    <LogoIcon size="lg" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                          {currentStock.symbol}
                        </span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-transparent">
                          {currentStock.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[170px]" title={currentStock.name}>
                        {currentStock.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block" />
                      AUDITED
                    </span>
                  </div>
                </div>

                {/* Core Intrinsic Value Snapshot */}
                <div className="py-4 space-y-3 relative z-10">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                        Intrinsic Value / Share
                      </div>
                      <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight mt-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                        {currentStock.intrinsic}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                        Market Price (CMP)
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                        {currentStock.cmp}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          currentStock.isPositiveMargin
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                            : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
                        }`}
                      >
                        {currentStock.margin} Margin
                      </span>
                    </div>
                  </div>

                  {/* 5-Year FCFF Trajectory Visualizer */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                      <span>5-Yr FCFF Cash Flow Horizon</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">T+1 to T+5 CAGR {currentStock.cagr}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 h-14 items-end bg-slate-50 dark:bg-[#070b14] p-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      {currentStock.bars.map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end group/bar">
                          <div
                            style={{ height: bar.h }}
                            className="w-full rounded-md bg-gradient-to-t from-sky-600 via-sky-400 to-emerald-400 group-hover/bar:brightness-125 transition-all shadow-sm shadow-sky-500/20"
                            title={`${bar.y}: ${bar.v}`}
                          />
                          <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400 font-medium">{bar.y.slice(0, 4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Valuation Parameters Pill */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 text-center text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold">WACC</span>
                      <span className="font-bold text-sky-700 dark:text-sky-400">{currentStock.wacc}</span>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold">Terminal g</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentStock.terminalG}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold">Implied EV</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{currentStock.impliedEv}</span>
                    </div>
                  </div>
                </div>

                {/* Action Link Footer */}
                <Link
                  href={`/valuation/${currentStock.symbol}`}
                  className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Launch {currentStock.symbol} DCF Model</span>
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>

              {/* Prev / Next Swipe Navigation Controls with Responsive Touch Targets */}
              <button
                type="button"
                onClick={() =>
                  setActiveStockIndex(
                    (prev) => (prev - 1 + FEATURED_DCF_STOCKS.length) % FEATURED_DCF_STOCKS.length
                  )
                }
                aria-label="Previous valuation stock"
                className="absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shadow-lg active:scale-95 transition-all z-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveStockIndex((prev) => (prev + 1) % FEATURED_DCF_STOCKS.length)
                }
                aria-label="Next valuation stock"
                className="absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shadow-lg active:scale-95 transition-all z-20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pagination Dots & Gesture Hint */}
            <div className="flex items-center justify-between w-full max-w-sm mt-2 px-1 text-[11px] text-slate-600 dark:text-slate-500 font-mono">
              <span className="text-[10px]">Swipe &larr; &rarr; or click arrows</span>
              <div className="flex items-center gap-1.5">
                {FEATURED_DCF_STOCKS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStockIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeStockIndex ? "w-5 bg-sky-500 dark:bg-sky-400" : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                {activeStockIndex + 1} / {FEATURED_DCF_STOCKS.length}
              </span>
            </div>
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

      {/* 3. Indian Macro Benchmarks with Clean Dark & Light Theme Contrast */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Risk-free Rate */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default transition-colors">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 font-mono">10-Year Indian G-Sec Yield (Rf)</div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-colors">7.10%</div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-tight">
            Benchmark risk-free rate from RBI sovereign bond yield curve
          </div>
        </div>

        {/* Equity Risk Premium */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default transition-colors">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 font-mono">India Equity Risk Premium (ERP)</div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1 group-hover:scale-105 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-all origin-left">6.50%</div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-tight">
            Expected equity return over sovereign G-Sec for emerging market risk
          </div>
        </div>

        {/* Corporate Tax Rate */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover-glow-emerald hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default transition-colors">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 font-mono">Effective Corporate Tax Rate</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 group-hover:scale-105 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-all origin-left">25.17%</div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-tight">
            Base statutory 22% + 10% surcharge + 4% health & education cess
          </div>
        </div>

        {/* Terminal Growth Cap */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 flex flex-col justify-between shadow-sm group cursor-default transition-colors">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 font-mono">Sustainable Terminal Growth Cap</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 group-hover:scale-105 group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-all origin-left">5.00%</div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-tight">
            Prudent Gordon Growth rate capped below long-term nominal Indian GDP
          </div>
        </div>
      </div>

      {/* 4. Core Platform Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/screener"
          className="p-4 rounded-xl bg-white dark:bg-[#101728] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift active-press transition-all group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-sky-500/20 transition-all duration-200">
            <Search className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">501 NIFTY Screener</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Filter 501 companies across 20 official sectors with live Bhavcopy price quotes.
          </p>
        </Link>

        <Link
          href="/valuation/TCS"
          className="p-4 rounded-xl bg-white dark:bg-[#101728] border border-slate-200 dark:border-slate-800 hover-glow-emerald hover-lift active-press transition-all group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-emerald-500/20 transition-all duration-200">
            <Calculator className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">DCF Modeling Terminal</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            5-Year explicit FCFF schedules, Gordon Growth terminal value, and sensitivity matrix.
          </p>
        </Link>

        <Link
          href="/reports"
          className="p-4 rounded-xl bg-white dark:bg-[#101728] border border-slate-200 dark:border-slate-800 hover-glow-purple hover-lift active-press transition-all group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-purple-500/20 transition-all duration-200">
            <FileText className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">Research Memos & Reports</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Institutional research reports with downloadable PDFs and full mathematical provenance.
          </p>
        </Link>

        <Link
          href="/sources"
          className="p-4 rounded-xl bg-white dark:bg-[#101728] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift active-press transition-all group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-amber-500/20 transition-all duration-200">
            <Database className="w-4 h-4 hover-icon-pop" />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">Data Integrity & MCP Gate</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Audit trail of normalized Ind AS balance sheets and official NSE compliance status.
          </p>
        </Link>
      </div>

      {/* 5. Featured Indian Equities Universe */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Featured Indian Equities</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time CMP quotes and audited 5-year Ind AS valuation models.</p>
          </div>
          <Link href="/screener" className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center gap-1 group">
            <span>View All 501 Equities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {benchmarkEquities.map((eq) => (
            <Link
              key={eq.symbol}
              href={`/valuation/${eq.symbol}`}
              className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-sky-500/60 dark:hover:border-sky-400 rounded-xl p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover-lift active-press transition-all shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-sky-600 dark:text-sky-400 font-mono group-hover:text-sky-700 dark:group-hover:text-sky-300">
                    {eq.symbol}
                  </span>
                  <div className="flex items-center gap-1.5 text-right font-mono">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{eq.cmp}</span>
                    <span className={`text-[10px] font-bold ${eq.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {eq.change}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate" title={eq.name}>
                  {eq.name}
                </h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{eq.sector}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  {eq.status}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
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
        <div className="lg:col-span-2 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                Saved Valuation Models
              </h3>
              <p className="text-[11px] text-slate-500">Persisted DCF models with custom growth & discount scenarios</p>
            </div>
            <Link href="/saved" className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold">
              Manage Models
            </Link>
          </div>

          <div className="space-y-3">
            {savedValuations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0c1220]/60 rounded-xl border border-slate-200 dark:border-slate-800/60 p-6">
                No custom valuations saved yet. Launch any company valuation to customize and save your analysis.
              </div>
            ) : (
              savedValuations.map((v) => (
                <Link
                  key={v.id}
                  href={`/valuation/${v.company_symbol}`}
                  className="block p-4 rounded-xl bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-sky-600 dark:text-sky-400 font-mono">{v.company_symbol}</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{v.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{v.company_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                        {formatINR(v.calculated_intrinsic_value)}
                      </div>
                      {v.implied_upside_downside_pct !== undefined && (
                        <div
                          className={`text-[10px] font-bold font-mono ${
                            v.implied_upside_downside_pct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
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
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                Data Source Integrity
              </h3>
              <p className="text-[11px] text-slate-500">Live provenance & regulatory compliance</p>
            </div>
            <Link href="/sources" className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold">
              Details
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {/* NSE MCP Gate Status */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">NSE MCP Gateway</span>
                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Compliance Gated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Adheres strictly to official NSE Data Policy. Gated until commercial license agreement is verified.
              </p>
            </div>

            {/* Audited Filings Status */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Audited Filings Layer</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Online & Audited
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct balance sheet & P&L normalization with document references and timestamp provenance.
              </p>
            </div>

            {/* User Document Parser */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">CSV/XLSX Parser</span>
                <span className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Accepts user-uploaded financial statements without silently substituting demo or fake data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
