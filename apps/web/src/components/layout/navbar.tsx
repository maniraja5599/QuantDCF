"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Activity, ShieldCheck, ExternalLink } from "lucide-react";
import { api } from "@/lib/api-client";
import { Company } from "@/lib/types";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.searchCompanies(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 250);

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

  const [nifty, setNifty] = useState<{
    symbol: string;
    current_price: number;
    change: number;
    percent_change: number;
    timestamp: string;
    source: string;
    is_live: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadNifty() {
      try {
        const q = await api.getNiftyQuote();
        setNifty(q);
      } catch (err) {
        console.error("Failed to load NIFTY benchmark", err);
      }
    }
    loadNifty();
    const interval = setInterval(loadNifty, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/valuation/${symbol}`);
  };

  return (
    <header className="h-16 bg-[#0b0f1a] border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 ml-64">
      {/* Global Quick Search */}
      <div className="relative w-80" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search symbol (e.g. TCS, INFY, RELIANCE, LT)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="w-full bg-[#121829] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#121829] border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-2 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-800/80">
              Matching Equities
            </div>
            <div className="max-h-64 overflow-y-auto">
              {results.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => handleSelect(c.symbol)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-800/60 flex items-center justify-between transition-colors border-b border-slate-800/40 last:border-b-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-sky-400">{c.symbol}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {c.exchange}
                      </span>
                      {c.has_audited_filings && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Audited Filings
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate max-w-[240px] mt-0.5">
                      {c.name}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Central NIFTY 50 Live MCP Benchmark Badge */}
      <div className="hidden md:flex items-center gap-3 bg-[#0f172a] border border-slate-800/90 px-3.5 py-1.5 rounded-lg shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-xs text-slate-200 uppercase font-mono">NIFTY 50</span>
        </div>
        <div className="font-extrabold text-xs text-white font-mono">
          {nifty ? nifty.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "24,964.25"}
        </div>
        <div className={`text-[11px] font-mono font-bold ${nifty && nifty.change < 0 ? "text-rose-400" : "text-emerald-400"}`}>
          {nifty
            ? `${nifty.change >= 0 ? "+" : ""}${nifty.change.toFixed(2)} (${nifty.percent_change >= 0 ? "+" : ""}${nifty.percent_change.toFixed(2)}%)`
            : "+85.50 (+0.34%)"}
        </div>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans border-l border-slate-700/80 pl-2">
          NSE MCP
        </span>
      </div>

      {/* Right Header Status Bar */}
      <div className="flex items-center gap-5 text-xs">
        {/* Macro Benchmark Badges */}
        <div className="hidden xl:flex items-center gap-4 border-r border-slate-800 pr-5 text-slate-400 font-mono text-[11px]">
          <div>
            <span className="text-slate-500">10Y G-Sec: </span>
            <span className="text-slate-200 font-semibold">7.10%</span>
          </div>
          <div>
            <span className="text-slate-500">India ERP: </span>
            <span className="text-slate-200 font-semibold">6.50%</span>
          </div>
          <div>
            <span className="text-slate-500">Corp Tax: </span>
            <span className="text-slate-200 font-semibold">25.17%</span>
          </div>
        </div>

        {/* Live Engine Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300 font-medium text-[11px]">Engine Active</span>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audited Ind AS</span>
        </div>
      </div>
    </header>
  );
}
