"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calculator, ShieldCheck, ArrowRight, Building2, Upload } from "lucide-react";

const CATALOG_COMPANIES = [
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Limited",
    exchange: "NSE",
    isin: "INE467B01029",
    sector: "Information Technology",
    industry: "IT Services & Consulting",
    marketCap: "₹14,92,650 Cr",
    sharesCr: 361.8,
    hasAuditedFilings: true,
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    exchange: "NSE",
    isin: "INE009A01021",
    sector: "Information Technology",
    industry: "IT Services & Consulting",
    marketCap: "₹7,84,940 Cr",
    sharesCr: 415.1,
    hasAuditedFilings: true,
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    exchange: "NSE",
    isin: "INE002A01018",
    sector: "Energy & Diversified",
    industry: "Oil, Gas, Retail & Telecom",
    marketCap: "₹18,53,800 Cr",
    sharesCr: 676.5,
    hasAuditedFilings: true,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    isin: "INE040A01034",
    sector: "Financial Services",
    industry: "Private Banking",
    marketCap: "₹12,76,800 Cr",
    sharesCr: 760.0,
    hasAuditedFilings: false,
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    isin: "INE090A01021",
    sector: "Financial Services",
    industry: "Private Banking",
    marketCap: "₹8,75,200 Cr",
    sharesCr: 703.0,
    hasAuditedFilings: false,
  },
  {
    symbol: "LT",
    name: "Larsen & Toubro Limited",
    exchange: "NSE",
    isin: "INE018A01030",
    sector: "Capital Goods & Infrastructure",
    industry: "Engineering & Construction",
    marketCap: "₹4,84,000 Cr",
    sharesCr: 137.5,
    hasAuditedFilings: true,
  },
];

export default function ScreenerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  const filtered = CATALOG_COMPANIES.filter((c) => {
    const matchesSearch =
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === "ALL" || c.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sectors = ["ALL", ...Array.from(new Set(CATALOG_COMPANIES.map((c) => c.sector)))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Indian Equities Screener
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse listed equities, review audited financial disclosure status, and launch valuation models.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by symbol or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c1220] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400">Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#0c1220] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec === "ALL" ? "All Sectors" : sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#0c1220] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold">Symbol</th>
                <th className="py-3 px-4 font-semibold">Company Name</th>
                <th className="py-3 px-4 font-semibold">Exchange</th>
                <th className="py-3 px-4 font-semibold">Sector / Industry</th>
                <th className="py-3 px-4 font-semibold">Market Cap</th>
                <th className="py-3 px-4 font-semibold">Filings Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((c) => (
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
                      <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
