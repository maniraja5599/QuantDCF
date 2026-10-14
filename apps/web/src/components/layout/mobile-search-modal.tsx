"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowLeft,
  X,
  TrendingUp,
  ShieldCheck,
  History,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Company } from "@/lib/types";
import { LogoIcon } from "@/components/ui/logo";

const POPULAR_TICKERS = [
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Conglomerate" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "BFSI" },
  { symbol: "INFY", name: "Infosys", sector: "IT" },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "BFSI" },
  { symbol: "SBIN", name: "State Bank of India", sector: "BFSI" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom" },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG" },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra" },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto" },
];

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("quantdcf_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignored
    }
  }, [isOpen]);

  // Prevent background scroll and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);

      const handleGlobalEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleGlobalEsc);

      return () => {
        document.body.style.overflow = origOverflow;
        window.removeEventListener("keydown", handleGlobalEsc);
      };
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen, onClose]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchCompanies(query.trim());
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search error in mobile modal:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    // Save to recents
    try {
      const updated = [symbol, ...recentSearches.filter((s) => s !== symbol)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("quantdcf_recent_searches", JSON.stringify(updated));
    } catch {
      // Ignored
    }

    onClose();
    router.push(`/valuation/${symbol}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
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
      onClose();
    }
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("quantdcf_recent_searches");
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#080c16] flex flex-col text-slate-100 animate-in fade-in duration-150">
      {/* 1. Top Fixed Search Header Bar */}
      <div className="bg-[#0c1220] border-b border-slate-800 p-2.5 sm:p-3 flex items-center gap-2 safe-area-top shadow-lg shrink-0">
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative flex items-center min-w-0">
          <Search className="w-4 h-4 text-sky-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search stock by name or ticker... (↑↓ / Enter)"
            style={{ fontSize: "16px" }}
            className="w-full bg-[#121829] border border-slate-700/80 focus:border-sky-500 rounded-xl pl-9 pr-9 py-2.5 text-[16px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-sans"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear query"
              className="absolute right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-2 py-1.5 shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* 2. Scrollable Body: Fits entirely above the software keyboard */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4 pb-44">
        {/* State A: User is typing and search results returned */}
        {query.trim().length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-1">
              <span>Matching Equities</span>
              {loading && <span className="text-sky-400 font-mono text-[10px]">Searching...</span>}
            </div>

            {results.length === 0 && !loading ? (
              <div className="py-12 text-center space-y-2 bg-[#0c1220]/60 border border-slate-800/80 rounded-2xl p-6">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No stocks matching &quot;{query}&quot;</div>
                <p className="text-xs text-slate-500">
                  Try searching by ticker (TCS, INFY) or company name (Reliance, HDFC).
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {results.map((c, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={c.symbol}
                      onClick={() => handleSelect(c.symbol)}
                      className={`w-full text-left p-3 rounded-xl hover:bg-slate-800/80 border active:scale-[0.99] transition-all flex items-center justify-between gap-3 shadow-sm ${
                        isSelected
                          ? "bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50"
                          : "bg-[#0f172a] border-slate-800/90"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm font-mono tracking-tight ${isSelected ? "text-sky-300" : "text-sky-400"}`}>
                            {c.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {c.exchange}
                          </span>
                          {c.has_audited_filings && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-2.5 h-2.5" /> Audited
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-200 mt-1 truncate">
                          {c.name}
                        </div>
                        {c.sector && (
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {c.sector}
                          </div>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* State B: Query is empty — show Recent Searches & Popular Equities */}
        {query.trim().length === 0 && (
          <>
            {/* 3D Brand Emblem Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-emerald-500/10 border border-sky-500/20 shadow-md">
              <LogoIcon size="md" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-tight">
                  Quant<span className="text-sky-400">DCF</span> Indian Equities
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  501 NSE/BSE Listed Companies · Audited Ind AS
                </span>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" /> Recent Valuations
                  </span>
                  <button
                    onClick={handleClearRecents}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => handleSelect(sym)}
                      className="flex items-center gap-1.5 bg-[#121829] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold active:scale-95 transition-all"
                    >
                      <span>{sym}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Blue-Chip Equities Strip */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Popular Indian Leaders
              </div>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_TICKERS.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className="text-left p-3 rounded-xl bg-[#0f172a] hover:bg-slate-800/80 border border-slate-800/80 active:scale-[0.98] transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-sky-400 font-mono">
                        {item.symbol}
                      </span>
                      <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                        {item.sector}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-300 mt-1 truncate">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
