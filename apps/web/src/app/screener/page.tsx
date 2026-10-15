"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Building2,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react";
import { ALL_NIFTY_COMPANIES, CatalogCompany } from "@/lib/companies-catalog";

const PAGE_SIZE = 25;

export default function ScreenerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [auditedOnly, setAuditedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const auditedCount = useMemo(() => {
    return ALL_NIFTY_COMPANIES.filter((c) => c.hasAuditedFilings).length;
  }, []);

  const filtered = useMemo(() => {
    return ALL_NIFTY_COMPANIES.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q);
      const matchesSector = sectorFilter === "ALL" || c.sector === sectorFilter;
      const matchesAudited = !auditedOnly || c.hasAuditedFilings;
      return matchesSearch && matchesSector && matchesAudited;
    });
  }, [searchTerm, sectorFilter, auditedOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const sectors = useMemo(() => {
    return ["ALL", ...Array.from(new Set(ALL_NIFTY_COMPANIES.map((c) => c.sector))).sort()];
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleSectorChange = (val: string) => {
    setSectorFilter(val);
    setCurrentPage(1);
  };

  const handleToggleAudited = () => {
    setAuditedOnly((prev) => !prev);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Indian Equities Screener</span>
            <span className="text-xs font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
              {ALL_NIFTY_COMPANIES.length} Equities Indexed
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse listed equities across NIFTY 500, review verified Ind AS disclosure status, and launch institutional DCF valuation models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/valuation/SUZLON"
            className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all hover-lift active-press"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Featured: SUZLON DCF</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Universe</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">501</div>
          <div className="text-[10px] text-slate-500 mt-0.5">NIFTY 500 Equities</div>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Audited Filings</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{auditedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">100% Provenance Verified</div>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Sectors Covered</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">20</div>
          <div className="text-[10px] text-slate-500 mt-0.5">NSE Official Taxonomy</div>
        </div>

        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm transition-colors">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Market Feeds</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">NSE Bhavcopy</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero Synthetic Quotes</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol (e.g. TCS, RELIANCE, SUZLON) or industry..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
            />
          </div>

          {/* Sector Dropdown & Count */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">Sector:</span>
              <select
                value={sectorFilter}
                onChange={(e) => handleSectorChange(e.target.value)}
                className="bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === "ALL" ? "All Sectors (500+)" : sec}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleToggleAudited}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                auditedOnly
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audited Only ({auditedCount})</span>
            </button>
          </div>
        </div>

        {/* Quick Sector Shortcuts & Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-1">Quick:</span>
            {["ALL", "Information Technology", "Financial Services", "Automobile and Auto Components", "Energy", "Consumer Goods"].map((sec) => {
              const isSelected = sectorFilter === sec;
              return (
                <button
                  key={sec}
                  onClick={() => handleSectorChange(sec)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-sky-500 text-slate-950 font-bold"
                      : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {sec === "ALL" ? "All" : sec.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
            Showing {filtered.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      </div>

      {/* Desktop Screener Table (hidden on mobile, visible on sm and above) */}
      <div className="hidden sm:block bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <table className="w-full min-w-[860px] text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 text-left uppercase font-mono text-[10px]">
                <th className="py-3.5 px-4 font-semibold">
                  <div>Symbol</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">NSE Ticker</div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div>Company Name</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Official ISIN ID</div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div>Exchange</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Feed Origin</div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div>Sector / Industry</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">NSE Taxonomy</div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div>Market Cap</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">INR Valuation</div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div>Filings Status</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Ind AS Audit Trail</div>
                </th>
                <th className="py-3.5 px-4 text-right font-semibold">
                  <div>Action</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Valuation Engine</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {paginated.map((c) => (
                <tr
                  key={c.symbol}
                  className="hover:bg-slate-50 dark:hover:bg-sky-500/[0.04] transition-colors duration-150 group"
                >
                  <td className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400 text-sm group-hover:text-sky-500 transition-colors">
                    <Link href={`/valuation/${c.symbol}`} className="hover:underline">
                      {c.symbol}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                    <div className="group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{c.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ISIN: {c.isin}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/80 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-slate-300 transition-colors">
                      {c.exchange}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                    <div className="font-medium">{c.sector}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{c.industry}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-slate-200 font-semibold">
                    {c.marketCap}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    {c.hasAuditedFilings ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-semibold group-hover:border-emerald-500/40 transition-colors">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Audited Filings Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 px-2 py-0.5 rounded text-[10px]">
                        Upload Statement Required
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/valuation/${c.symbol}`}
                      className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-slate-950 dark:text-sky-400 dark:hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-sky-500/20 hover:border-sky-400 transition-all text-xs hover-lift active-press shimmer-sweep"
                    >
                      <Calculator className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
                      <span>Model DCF</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans">
                    No companies matching "{searchTerm}". Try another symbol or sector.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-[#0c1220] border-t border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View (Visible on screens < sm) */}
      <div className="sm:hidden space-y-3">
        {paginated.map((c) => (
          <div
            key={c.symbol}
            className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-sky-600 dark:text-sky-400">
                    {c.symbol}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-1.5 py-0.2 rounded font-bold">
                    {c.exchange}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                  {c.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Market Cap</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{c.marketCap}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{c.sector}</span>
              {c.hasAuditedFilings ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Audited
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Statement Req.</span>
              )}
            </div>

            <Link
              href={`/valuation/${c.symbol}`}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active-press hover-lift"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Model {c.symbol} DCF</span>
            </Link>
          </div>
        ))}

        {paginated.length === 0 && (
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No companies matching "{searchTerm}". Try another symbol or sector.
          </div>
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active-press transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active-press transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
