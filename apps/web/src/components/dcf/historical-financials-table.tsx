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
    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-colors">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            Historical Financial Statements
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" /> Audited Ind AS
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            All figures reported in ₹ Crore as filed in Annual Reports with BSE/NSE (Net Revenue from Operations per Ind AS 115, excluding State Excise Duty & GST).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">Financial Metric</th>
              {sorted.map((s) => (
                <th key={s.fiscal_year} className="py-2.5 px-3 text-right font-semibold">
                  {s.fiscal_period} ({s.fiscal_year})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 font-bold text-slate-900 dark:text-slate-100">
              <td className="py-2.5 px-4 font-sans text-xs">Revenue from Operations</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2 px-4 text-right text-sky-700 dark:text-sky-400 font-bold">
                  {formatCrore(s.revenue)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Operating Expenses</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  {formatCrore(s.operating_expenses)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/70 dark:hover:bg-slate-800/30 font-semibold text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/20">
              <td className="py-2.5 px-4 font-sans text-xs">Operating Profit (EBIT)</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                  {formatCrore(s.ebit)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">EBIT Margin %</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  {formatPercentRaw(s.ebit_margin_pct)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Effective Tax Rate %</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  {formatPercentRaw(s.effective_tax_rate_pct)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Depreciation & Amortization</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  {formatCrore(s.depreciation_amortization)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Capital Expenditure (CapEx)</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-rose-700 dark:text-rose-400 font-medium">
                  -{formatCrore(s.capex)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Change in Net Working Capital</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-800 dark:text-slate-400">
                  -{formatCrore(s.change_in_nwc)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border-t border-b border-emerald-500/20">
              <td className="py-2.5 px-4 font-sans text-xs font-bold">Audited Free Cash Flow (FCFF)</td>
              {sorted.map((s) => {
                const nopat = s.ebit * (1 - s.effective_tax_rate_pct / 100);
                const fcf = nopat + s.depreciation_amortization - s.capex - s.change_in_nwc;
                return (
                  <td key={s.fiscal_year} className="py-2.5 px-4 text-right font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                    {formatCrore(fcf)}
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 bg-emerald-500/5">
              <td className="py-2.5 px-4 font-sans text-xs font-medium">FCF Conversion % (FCF / EBIT)</td>
              {sorted.map((s) => {
                const nopat = s.ebit * (1 - s.effective_tax_rate_pct / 100);
                const fcf = nopat + s.depreciation_amortization - s.capex - s.change_in_nwc;
                const conversion = s.ebit > 0 ? (fcf / s.ebit) * 100 : 0;
                return (
                  <td key={s.fiscal_year} className="py-2.5 px-4 text-right font-bold text-sky-700 dark:text-sky-400">
                    {conversion.toFixed(1)}%
                  </td>
                );
              })}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/10">
              <td className="py-2.5 px-4 font-sans text-xs">Cash & Liquid Investments</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                  {formatCrore(s.cash_and_equivalents)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Total Debt</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-rose-700 dark:text-rose-400 font-semibold">
                  {formatCrore(s.total_debt)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2.5 px-4 font-sans text-xs">Diluted Shares Outstanding</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right text-slate-900 dark:text-slate-200 font-bold">
                  {formatNumberIN(s.diluted_shares)} Cr
                </td>
              ))}
            </tr>
            {/* Provenance Disclosure Row */}
            <tr className="bg-slate-50 dark:bg-[#0b101c] text-slate-600 dark:text-slate-400 text-[10px] border-t border-slate-200 dark:border-slate-800">
              <td className="py-2.5 px-4 font-sans uppercase font-bold text-slate-700 dark:text-slate-300">Provenance / Filing</td>
              {sorted.map((s) => (
                <td key={s.fiscal_year} className="py-2.5 px-4 text-right">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                    {s.provenance}
                  </span>
                  {s.source_url && (
                    <a
                      href={s.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 text-[9px] mt-1 truncate max-w-[120px] ml-auto font-medium"
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
