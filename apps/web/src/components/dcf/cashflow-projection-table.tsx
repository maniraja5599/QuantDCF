"use client";

import { DCFCalculationOutput } from "@/lib/types";
import { formatCrore, formatPercentRaw } from "@/lib/formatters";

interface CashflowProjectionTableProps {
  output: DCFCalculationOutput;
}

export function CashflowProjectionTable({ output }: CashflowProjectionTableProps) {
  const years = output.forecast_years;

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Discounted Free Cash Flow Schedule (FCFF)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Explicit forecast discounting at {output.discount_rate_wacc_pct.toFixed(2)}% WACC. Figures in ₹ Crore.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#0c1220] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-3 px-4 font-semibold text-slate-300">FCFF Component</th>
              {years.map((y) => (
                <th key={y.year_index} className="py-3 px-4 text-right font-semibold">
                  {y.year_label} (T+{y.year_index})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {/* Revenue */}
            <tr className="hover:bg-slate-800/20 font-bold text-slate-100">
              <td className="py-2.5 px-4 font-sans text-xs">Projected Revenue</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-sky-400">
                  {formatCrore(y.revenue)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">Revenue Growth %</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-300">
                  {formatPercentRaw(y.revenue_growth_pct)}
                </td>
              ))}
            </tr>

            {/* Operating Profit (EBIT) */}
            <tr className="hover:bg-slate-800/20 font-semibold text-slate-200 bg-slate-800/10">
              <td className="py-2.5 px-4 font-sans text-xs">Operating Profit (EBIT)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-emerald-400">
                  {formatCrore(y.ebit)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">EBIT Margin %</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-300">
                  {formatPercentRaw(y.ebit_margin_pct)}
                </td>
              ))}
            </tr>

            {/* Taxes & NOPAT */}
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">(-) Operating Taxes</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-400">
                  ({formatCrore(y.operating_taxes)})
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 font-bold text-slate-200">
              <td className="py-2.5 px-4 font-sans text-xs">NOPAT (EBIT - Taxes)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-slate-100">
                  {formatCrore(y.nopat)}
                </td>
              ))}
            </tr>

            {/* Non-cash & Reinvestment adjustments */}
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">(+) Depreciation & Amortization</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-300">
                  +{formatCrore(y.depreciation_amortization)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">(-) Capital Expenditure (CapEx)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-rose-400">
                  -{formatCrore(y.capex)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">(-) Change in Net Working Capital</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-400">
                  -{formatCrore(y.change_in_nwc)}
                </td>
              ))}
            </tr>

            {/* Unlevered Free Cash Flow (FCFF) */}
            <tr className="hover:bg-slate-800/20 bg-sky-500/10 font-bold text-sky-400">
              <td className="py-2.5 px-4 font-sans text-xs">Free Cash Flow to Firm (FCFF)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-sky-300 font-bold">
                  {formatCrore(y.free_cash_flow)}
                </td>
              ))}
            </tr>

            {/* Discounting rows */}
            <tr className="hover:bg-slate-800/20 text-slate-400 text-[11px]">
              <td className="py-2 px-4 font-sans">Discount Period (t)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right">
                  {y.discount_period.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-800/20 text-slate-400 text-[11px]">
              <td className="py-2 px-4 font-sans">Discount Factor [1 / (1+WACC)^t]</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-300">
                  {y.discount_factor.toFixed(4)}
                </td>
              ))}
            </tr>

            {/* Present Value of Cash Flow */}
            <tr className="hover:bg-slate-800/20 bg-emerald-500/10 font-extrabold text-emerald-400">
              <td className="py-3 px-4 font-sans text-xs">Present Value PV(FCFF)</td>
              {years.map((y) => (
                <td key={y.year_index} className="py-3 px-4 text-right text-emerald-400">
                  {formatCrore(y.pv_fcf)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terminal Value Reconciliation Footer */}
      <div className="bg-[#0b101c] p-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
            Explicit 5-Yr PV Cash Flows
          </div>
          <div className="text-xl font-bold text-slate-100">
            {formatCrore(output.cumulative_pv_fcf)}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            {(100 - output.tv_as_pct_of_ev).toFixed(1)}% of Enterprise Value
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
            Discounted Terminal Value
          </div>
          <div className="text-xl font-bold text-sky-400">
            {formatCrore(output.pv_terminal_value)}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Gordon Growth: {output.terminal_growth_rate_pct.toFixed(2)}% perpetual g ({output.tv_as_pct_of_ev.toFixed(1)}% of EV)
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
            Total Implied Enterprise Value
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatCrore(output.enterprise_value)}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            Sum of Discounted Forecast + PV(Terminal Value)
          </div>
        </div>
      </div>
    </div>
  );
}
