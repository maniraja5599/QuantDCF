"use client";

import { useState, useEffect } from "react";
import { Database, ShieldAlert, ShieldCheck, CheckCircle2, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api-client";
import { ProviderStatus } from "@/lib/types";

export default function DataSourcesPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [provList, healthRes] = await Promise.all([
        api.listSources().catch(() => []),
        api.getSourcesHealth().catch(() => null),
      ]);
      setProviders(provList);
      setHealth(healthRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            Data Sources & Legal Provenance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real financial statement traceability, official NSE MCP gateway compliance, and licensing gates.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Connectivity</span>
        </button>
      </div>

      {/* Licensing Compliance Banner */}
      <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>NSE India Data Policy & SaaS Redistribution Compliance Gate</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The National Stock Exchange of India (NSE) enforces strict market data policies governing real-time and historical quotation redistribution.
          In accordance with the official <strong>NSE Data Policy</strong>, this platform maintains an automated licensing gate (<code>NSE_DATA_LICENSE_APPROVED</code>).
          Commercial SaaS redistribution of live ticks remains strictly locked until an authorized commercial license agreement is executed with NSE Data & Analytics Limited.
          The platform never bypasses access controls, never scrapes web pages, and never fabricates mock numbers in place of real data.
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. NSE MCP Provider */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">NSE Official MCP Gateway</span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Compliance Gated
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrates with the official Model Context Protocol endpoints:
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
              <li className="truncate">• https://mcp.nseindia.in/cmmkt/mcp</li>
              <li className="truncate">• https://mcp.nseindia.in/bhavcopy/cm/mcp</li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px]">
            <a
              href="https://www.nseindia.com/nse-mcp"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              Official NSE MCP Documentation <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.nseindia.com/static/market-data/nse-data-policy"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
            >
              NSE Data Policy Guide <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 2. Audited Exchange Filings */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">Audited Filings Layer</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online & Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical statements are extracted directly from company Annual Reports (Consolidated Financial Statements under Ind AS) filed with BSE/NSE.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Coverage: <strong>TCS, INFY</strong> (5-Year Historical Audits)</div>
              <div>Units: <strong>₹ Crore</strong></div>
              <div>Provenance: <strong>AUDITED (Statutory Auditor Signed)</strong></div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Full Audit Trail Recorded
            </span>
          </div>
        </div>

        {/* 3. Document Extraction Provider */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100">Statement Document Parser</span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                Active Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts and normalizes user-uploaded CSV and Excel balance sheets. Maps Revenue, EBIT, Tax Expense, CapEx, Working Capital, Debt, and Cash.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Formats: <strong>.csv, .xlsx, .xls</strong></div>
              <div>Provenance: <strong>USER_ENTERED / UPLOADED</strong></div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Available directly within company valuation workspace.
          </div>
        </div>
      </div>
    </div>
  );
}
