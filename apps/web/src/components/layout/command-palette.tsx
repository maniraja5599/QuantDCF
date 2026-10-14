"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Layers, Bookmark, Database, Sliders, ArrowRight, CornerDownLeft, X } from "lucide-react";
import { ALL_NIFTY_COMPANIES } from "@/lib/companies-catalog";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Tickers" | "Navigation" | "Actions";
  href: string;
}

const NAVIGATION_COMMANDS: CommandItem[] = [
  { id: "nav-dash", title: "Dashboard", subtitle: "Institutional market overview & macro indicators", category: "Navigation", href: "/" },
  { id: "nav-screen", title: "Company Screener", subtitle: "Filter 500+ Indian equities by sector & market cap", category: "Navigation", href: "/screener" },
  { id: "nav-terminal", title: "Valuation Terminal", subtitle: "DCF modeling engine, sensitivity & scenarios", category: "Navigation", href: "/valuation/TCS" },
  { id: "nav-saved", title: "Saved Valuations", subtitle: "Inspect user-saved models & assumption snapshots", category: "Navigation", href: "/saved" },
  { id: "nav-reports", title: "Research Reports", subtitle: "Institutional research memos & valuation summaries", category: "Navigation", href: "/reports" },
  { id: "nav-sources", title: "Data Sources & MCP Gateway", subtitle: "NSE MCP status & audited disclosure registry", category: "Navigation", href: "/sources" },
  { id: "nav-settings", title: "Settings", subtitle: "Configure WACC parameters & terminal bounds", category: "Navigation", href: "/settings" },
];

const TICKER_COMMANDS: CommandItem[] = ALL_NIFTY_COMPANIES.map((c) => ({
  id: `ticker-${c.symbol.toLowerCase()}`,
  title: c.symbol,
  subtitle: `${c.name} (${c.sector})`,
  category: "Tickers" as const,
  href: `/valuation/${c.symbol}`,
}));

const ALL_COMMANDS: CommandItem[] = [...NAVIGATION_COMMANDS, ...TICKER_COMMANDS];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default initial view: show navigation + top popular blue chips
      return ALL_COMMANDS.slice(0, 15);
    }

    const exactMatches: CommandItem[] = [];
    const prefixMatches: CommandItem[] = [];
    const otherMatches: CommandItem[] = [];

    for (const c of ALL_COMMANDS) {
      const titleLower = c.title.toLowerCase();
      const subLower = c.subtitle.toLowerCase();
      if (titleLower === q) {
        exactMatches.push(c);
      } else if (titleLower.startsWith(q)) {
        prefixMatches.push(c);
      } else if (titleLower.includes(q) || subLower.includes(q)) {
        otherMatches.push(c);
      }
    }

    return [...exactMatches, ...prefixMatches, ...otherMatches].slice(0, 25);
  }, [query]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 safe-area-top">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a company name, NSE ticker (e.g. MARUTI, TITAN, TCS) or command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto py-2 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-4 transition-colors ${
                    isSelected ? "bg-sky-500/10 text-white" : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.category === "Tickers"
                          ? isSelected
                            ? "bg-sky-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-sky-400 font-mono font-semibold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.category === "Tickers" ? (
                        <span className="text-[10px] font-mono font-bold tracking-tighter">EQ</span>
                      ) : (
                        <Layers className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category === "Tickers" && (
                          <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1 py-0.2 rounded font-mono">
                            NSE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching companies or commands for "{query}". Try another stock symbol or sector.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-[#0b1120] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">↑</kbd>
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-sky-400/80 font-bold">{ALL_NIFTY_COMPANIES.length} Indian Equities Indexed</span>
        </div>
      </div>
    </div>
  );
}
