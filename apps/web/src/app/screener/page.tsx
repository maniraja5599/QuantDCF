"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calculator, ShieldCheck, ArrowRight, Building2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_NIFTY_COMPANIES, CatalogCompany } from "@/lib/companies-catalog";

const PAGE_SIZE = 25;

export default function ScreenerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return ALL_NIFTY_COMPANIES.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q);
      const matchesSector = sectorFilter === "ALL" || c.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, sectorFilter]);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Indian Equities Screener</span>
            <span className="text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
              {ALL_NIFTY_COMPANIES.length} Listed Companies
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse listed equities across NIFTY 500, review audited Ind AS disclosure status, and launch institutional DCF valuation models.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol, company name or industry..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => handleSectorChange(e.target.value)}
              className="bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === "ALL" ? "All Sectors (500+)" : sec}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Showing {filtered.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <table className="w-full min-w-[860px] text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 text-left uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">
                  <div>Symbol</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">NSE Ticker</div>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <div>Company Name</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Official ISIN ID</div>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <div>Exchange</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Feed Origin</div>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <div>Sector / Industry</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">NSE Taxonomy</div>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <div>Market Cap</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">INR Valuation</div>
                </th>
                <th className="py-3 px-4 font-semibold">
                  <div>Filings Status</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Ind AS Audit Trail</div>
                </th>
                <th className="py-3 px-4 text-right font-semibold">
                  <div>Action</div>
                  <div className="text-[9px] text-slate-400 normal-case font-sans">Valuation Engine</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginated.map((c) => (
                <tr key={c.symbol} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-sky-400 text-sm">
                    {c.symbol}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ISIN: {c.isin}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                      {c.exchange}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300">
                    <div>{c.sector}</div>
                    <div className="text-[10px] text-slate-500">{c.industry}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-semibold">
                    {c.marketCap}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    {c.hasAuditedFilings ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" /> Audited Filings Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-800/80 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded text-[10px]">
                        Upload Statement Required
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/valuation/${c.symbol}`}
                      className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-sky-500/20 transition-all text-xs"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Model DCF</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    No companies matching "{searchTerm}". Try another symbol or sector.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-[#0c1220] border-t border-slate-800 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1 transition-all"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
