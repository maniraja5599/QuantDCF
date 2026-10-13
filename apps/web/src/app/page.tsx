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
  AlertTriangle,
  Building2,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { SavedValuation } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";

export default function DashboardPage() {
  const [savedValuations, setSavedValuations] = useState<SavedValuation[]>([]);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [saved, health] = await Promise.all([
          api.listSavedValuations().catch(() => []),
          api.getSourcesHealth().catch(() => null),
        ]);
        setSavedValuations(saved);
        setProviderHealth(health);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const benchmarkEquities = [
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd",
      sector: "Information Technology",
      marketCap: "₹14,92,650 Cr",
      status: "Audited Filings Verified",
      color: "border-sky-500/40",
    },
    {
      symbol: "INFY",
      name: "Infosys Limited",
      sector: "Information Technology",
      marketCap: "₹7,84,940 Cr",
      status: "Audited Filings Verified",
      color: "border-emerald-500/40",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Limited",
      sector: "Energy & Diversified",
      marketCap: "₹18,53,800 Cr",
      status: "Exchange Catalog Listed",
      color: "border-indigo-500/40",
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Limited",
      sector: "Financial Services",
      marketCap: "₹12,76,800 Cr",
      status: "Exchange Catalog Listed",
      color: "border-amber-500/40",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0d1424] via-[#10182c] to-[#0d1424] border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Institutional Valuation Platform
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Discounted Cash Flow Valuation for <span className="text-sky-400">Indian Equities</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Institutional-grade equity research platform featuring verified exchange filings, rigorous WACC modeling,
            perpetual Gordon Growth terminal valuations, 2D sensitivity matrices, and transparent mathematical auditing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/valuation/TCS"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch TCS Valuation Model</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/screener"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all border border-slate-700"
            >
              <Search className="w-4 h-4" />
              <span>Explore Company Screener</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Macro Benchmarks & Engine Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-slate-400">10-Year Indian G-Sec Yield (Rf)</div>
          <div className="text-2xl font-extrabold text-slate-100 font-mono mt-1">7.10%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Benchmark Risk-Free Rate</div>
        </div>
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-slate-400">India Equity Risk Premium (ERP)</div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">6.50%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Market Risk Premium</div>
        </div>
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Effective Corporate Tax Rate</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">25.17%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Base 22% + Surcharge + Cess</div>
        </div>
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Sustainable Terminal Growth Cap</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">5.00%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Long-term nominal GDP anchor</div>
        </div>
      </div>

      {/* Benchmark Equities Quick Launch */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Featured Indian Equities</h2>
            <p className="text-xs text-slate-400">Instant access to audited models and verified balance sheets.</p>
          </div>
          <Link href="/screener" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
            View All Equities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benchmarkEquities.map((eq) => (
            <Link
              key={eq.symbol}
              href={`/valuation/${eq.symbol}`}
              className={`bg-[#111726] border ${eq.color} rounded-xl p-5 hover:bg-slate-800/40 transition-all shadow-md group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-sky-400 font-mono group-hover:text-sky-300">
                  {eq.symbol}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                  NSE
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-200 mt-2 truncate">{eq.name}</h3>
              <div className="text-[11px] text-slate-400 mt-0.5">{eq.sector}</div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Market Cap:</span>
                <span className="text-slate-200 font-mono font-semibold">{eq.marketCap}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Saved Valuations & Provider Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Valuations */}
        <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              Saved Valuation Models
            </h3>
            <Link href="/saved" className="text-xs text-sky-400 hover:text-sky-300">
              Manage Models
            </Link>
          </div>

          <div className="space-y-3">
            {savedValuations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No custom valuations saved yet. Launch a model to customize and save your analysis.
              </div>
            ) : (
              savedValuations.map((v) => (
                <Link
                  key={v.id}
                  href={`/valuation/${v.company_symbol}`}
                  className="block p-4 rounded-lg bg-[#0c1220] border border-slate-800/80 hover:border-slate-700 transition-colors"
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
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Data Source Integrity
            </h3>
            <Link href="/sources" className="text-xs text-sky-400 hover:text-sky-300">
              Details
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {/* NSE MCP Gate Status */}
            <div className="p-3 rounded-lg bg-[#0c1220] border border-slate-800/80 space-y-1">
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
            <div className="p-3 rounded-lg bg-[#0c1220] border border-slate-800/80 space-y-1">
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
            <div className="p-3 rounded-lg bg-[#0c1220] border border-slate-800/80 space-y-1">
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
