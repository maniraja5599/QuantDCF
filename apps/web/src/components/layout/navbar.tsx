"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ExternalLink, Menu, TrendingUp, PanelLeftClose, PanelLeftOpen, HelpCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { Company } from "@/lib/types";
import { Logo } from "@/components/ui/logo";
import { MobileSearchModal } from "./mobile-search-modal";
import { LiveConnectivityBadge } from "./live-connectivity-badge";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Navbar({ onToggleMobileMenu, isCollapsed = false, onToggleCollapse }: NavbarProps) {
  const router = useRouter();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts: "/" to focus search, "?" to toggle shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (!isInput) {
        if (e.key === "/") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.searchCompanies(query);
        setResults(res);
        setSelectedIndex(0);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [serverError, setServerError] = useState<boolean>(false);
  const [nifty, setNifty] = useState<{
    symbol: string;
    current_price: number;
    change: number;
    percent_change: number;
    day_high?: number;
    day_low?: number;
    timestamp: string;
    source: string;
    is_live: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadNifty() {
      try {
        const q = await api.getNiftyQuote();
        if (isMounted && q) {
          setNifty(q);
          setServerError(false);
        }
      } catch (err) {
        console.error("Failed to load NIFTY benchmark", err);
        if (isMounted) {
          setServerError(true);
        }
      }
    }
    loadNifty();
    const interval = setInterval(loadNifty, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/valuation/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
      } else if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex].symbol);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const niftyPrice = nifty
    ? nifty.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "22,622.70";
  const niftyChangeText = nifty
    ? `${nifty.change >= 0 ? "+" : ""}${nifty.change.toFixed(2)} (${nifty.percent_change >= 0 ? "+" : ""}${nifty.percent_change.toFixed(2)}%)`
    : "-99.25 (-0.44%)";
  const niftyCompactChange = nifty
    ? `${nifty.percent_change >= 0 ? "+" : ""}${nifty.percent_change.toFixed(1)}%`
    : "-0.4%";
  const isPositive = nifty ? nifty.change >= 0 : false;

  return (
    <header className="h-16 bg-white dark:bg-[#0b0f1a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 w-full transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Desktop Sidebar Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={`${isCollapsed ? "Expand" : "Collapse"} Sidebar (Ctrl+B)`}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-transform duration-100 shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-sky-500 dark:text-sky-400" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

        {/* Mobile Hamburger Drawer Trigger - 44px Touch Target with Smooth Minimal Feedback */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open Navigation Drawer"
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 transition-transform duration-100 focus:outline-none shrink-0 border border-slate-200 dark:border-slate-800/80"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Logo Branding */}
        <div className="lg:hidden flex items-center shrink-0">
          <Logo size="sm" showBadge={false} />
        </div>

        {/* Global Quick Search (Desktop: sm and above) */}
        <div className="hidden sm:block relative w-full sm:max-w-xs md:max-w-sm group" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:scale-110 absolute left-2.5 sm:left-3 pointer-events-none transition-all duration-200" />
            <input
              ref={inputRef}
              id="global-search-input"
              name="search"
              type="text"
              placeholder="Search TCS, INFY, RELIANCE... (Press /)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              className="w-full bg-slate-100 dark:bg-[#121829] border border-slate-300 dark:border-slate-800 hover:border-sky-500/50 rounded-lg pl-8 sm:pl-9 pr-14 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all font-sans hover:shadow-md hover:shadow-sky-500/5"
            />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="hidden sm:flex items-center absolute right-2 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-sky-400 hover:border-sky-500/40 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono tracking-wide cursor-pointer active-press hover:scale-105 transition-all duration-150"
              title="Open Command Palette (Ctrl+K)"
            >
              Ctrl K
            </button>
          </div>

          {/* Dropdown Results with Keyboard Arrow Selection */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-100">
              <div className="p-2 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Matching Equities</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">↑↓ to navigate · ↵ select</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.map((c, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={c.symbol}
                      onClick={() => handleSelect(c.symbol)}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 ${
                        isSelected
                          ? "bg-sky-50 dark:bg-sky-500/20 text-sky-900 dark:text-white font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs ${isSelected ? "text-sky-700 dark:text-sky-300" : "text-sky-700 dark:text-sky-400"}`}>
                            {c.symbol}
                          </span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-transparent">
                            {c.exchange}
                          </span>
                          {c.has_audited_filings && (
                            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Audited
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-800 dark:text-slate-300 truncate max-w-[180px] sm:max-w-[240px] mt-0.5 font-medium">
                          {c.name}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Central / Right Indicators: Live Feed & NIFTY 50 Benchmark Badge */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Animated Live Network Connectivity Badge (Desktop: sm and above) */}
        <div className="hidden sm:block">
          <LiveConnectivityBadge />
        </div>

        {/* Full Desktop Nifty Badge (sm and above) */}
        {serverError ? (
          <div
            className="hidden sm:flex items-center gap-2 bg-[#190c12] border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)] px-2.5 sm:px-3 py-1 rounded-lg transition-colors cursor-default"
            title="FastAPI Backend Disconnected / Server Error - Retrying connection..."
          >
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 opacity-75 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            </div>
            <span className="font-bold text-xs text-rose-300 font-mono uppercase tracking-wide">SERVER ERROR</span>
            <span className="text-[9px] bg-rose-500/20 text-rose-300 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/40">
              OFFLINE
            </span>
          </div>
        ) : (
          <div
            className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-[#0f172a] hover:bg-slate-200 dark:hover:bg-[#131d35] border border-slate-300 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 px-2.5 sm:px-3 py-1 rounded-lg shadow-inner transition-all duration-200 group cursor-default hover-lift"
            title={`NIFTY 50 Live Benchmark\nStatus: ${nifty?.is_live ? "Live Real-Time Market Feed" : "Official Bhavcopy Snapshot"}\nDay High: ₹${nifty?.day_high?.toLocaleString("en-IN") || "--"}\nDay Low: ₹${nifty?.day_low?.toLocaleString("en-IN") || "--"}\nFeed: ${nifty?.source || "NSE"}`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${nifty?.is_live ? "bg-emerald-500 dark:bg-emerald-400 animate-ping" : "bg-emerald-500 dark:bg-emerald-400 animate-pulse"}`} />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase font-mono group-hover:text-emerald-400 transition-colors">NIFTY 50</span>
              {nifty?.is_live && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold px-1 py-0.2 rounded border border-emerald-500/30">
                  LIVE
                </span>
              )}
            </div>
            <div suppressHydrationWarning className="font-extrabold text-xs text-slate-900 dark:text-white font-mono group-hover:scale-105 transition-transform duration-150">
              ₹{niftyPrice}
            </div>
            <div suppressHydrationWarning className={`text-[11px] font-mono font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {niftyChangeText}
            </div>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans border-l border-slate-300 dark:border-slate-800 pl-2 hidden md:inline">
              {nifty?.is_live ? "NSE LIVE" : "NSE MCP"}
            </span>
          </div>
        )}

        {/* Mobile: Compact NIFTY Pill (Visible on screens >= 420px) */}
        {!serverError && (
          <div
            className="hidden min-[420px]:flex sm:hidden items-center gap-1.5 bg-slate-100 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-800 px-2 py-1 rounded-md text-[10px] font-mono shrink-0 hover-lift active-press"
            title={`NIFTY 50: ₹${niftyPrice} (${niftyCompactChange})`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${nifty?.is_live ? "bg-emerald-500 dark:bg-emerald-400 animate-ping" : "bg-emerald-500 dark:bg-emerald-400"}`} />
            <span suppressHydrationWarning className="font-extrabold text-slate-900 dark:text-white">₹{niftyPrice}</span>
            <span suppressHydrationWarning className={`font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {niftyCompactChange}
            </span>
          </div>
        )}

        {/* Mobile: Server Error Dot (when offline) */}
        {serverError && (
          <div
            className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/40 shrink-0"
            title="Server Offline / Disconnected"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
          </div>
        )}

        {/* Mobile: Search Icon Trigger Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Search Indian Equities"
          title="Search Equities (Ctrl+K)"
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-[#121829] hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 transition-all shrink-0 hover-lift active-press"
        >
          <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 hover-icon-pop" />
        </button>

        {/* Theme Mode Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Keyboard Shortcuts Trigger Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }))}
          title="Keyboard Shortcuts (?)"
          aria-label="View Keyboard Shortcuts"
          className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg bg-slate-800/80 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-700/80 hover:border-sky-500/40 transition-all duration-150 text-xs font-mono hover-lift active-press"
        >
          ?
        </button>
      </div>

      {/* Mobile Full-Screen Stock Search Modal */}
      <MobileSearchModal
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </header>
  );
}
