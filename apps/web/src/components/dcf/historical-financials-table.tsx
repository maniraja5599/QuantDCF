"use client";

import { HistoricalStatement } from "@/lib/types";
import { formatCrore, formatPercentRaw, formatNumberIN } from "@/lib/formatters";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";

interface HistoricalFinancialsTableProps {
  statements: HistoricalStatement[];
}

export function HistoricalFinancialsTable({ statements }: HistoricalFinancialsTableProps) {
  if (!statements || statements.length === 0) {
    return (
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">Audited Financial Statements Unavailable</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          No regulatory-filed statements have been ingested for this entity yet. You can upload audited balance sheets/P&L (.csv or .xlsx) or enter reported figures below.
        </p>
      </div>
    );
  }

  // Sort statements chronologically
  const sorted = [...statements].sort((a, b) => a.fiscal_year - b.fiscal_year);

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            Historical Financial Statements
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Audited Ind AS
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            All figures reported in ₹ Crore as filed in Annual Reports with BSE/NSE.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#0c1220] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-3 px-4 font-semibold text-slate-300">Financial Metric</th>
              {sorted.map((s) => (
                <th key={s.fiscal_year} className="py-3 px-4 text-right font-semibold">
                  {s.fiscal_period} ({s.fiscal_year})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            <tr className="hover:bg-slate-800/20 font-bold text-slate-100">
              <td className="py-2.5 px-4 font-sans text-xs">Revenue from Operations</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-sky-400">
                  {formatCrore(s.revenue)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Operating Expenses</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-400">
                  {formatCrore(s.operating_expenses)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 font-semibold text-slate-200 bg-slate-800/10">
              <td className="py-2.5 px-4 font-sans text-xs">Operating Profit (EBIT)</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-emerald-400">
                  {formatCrore(s.ebit)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">EBIT Margin %</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-300">
                  {formatPercentRaw(s.ebit_margin_pct)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Effective Tax Rate %</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-400">
                  {formatPercentRaw(s.effective_tax_rate_pct)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Depreciation & Amortization</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-400">
                  {formatCrore(s.depreciation_amortization)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Capital Expenditure (CapEx)</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-400">
                  {formatCrore(s.capex)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Change in Net Working Capital</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-400">
                  {formatCrore(s.change_in_nwc)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400 bg-slate-800/10">
              <td className="py-2.5 px-4 font-sans text-xs">Cash & Liquid Investments</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-emerald-400 font-semibold">
                  {formatCrore(s.cash_and_equivalents)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Total Debt</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-rose-400">
                  {formatCrore(s.total_debt)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Diluted Shares Outstanding</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-300">
                  {formatNumberIN(s.diluted_shares)} Cr
                </td>
              ))}
            </tr>
            {/* Provenance Disclosure Row */}
            <tr className="bg-[#0b101c] text-slate-500 text-[10px]">
              <td className="py-2.5 px-4 font-sans uppercase font-bold text-slate-400">Provenance / Filing</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                    {s.provenance}
                  </span>
                  {s.source_url && (
                    <a
                      href={s.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-slate-400 hover:text-sky-400 text-[9px] mt-1 truncate max-w-[120px] ml-auto"
                      title={s.source_document || s.source_url}
                    >
                      Source Filing <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
