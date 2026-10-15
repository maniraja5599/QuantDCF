"use client";

import { DCFCalculationOutput } from "@/lib/types";
import { formatCrore, formatPercentRaw } from "@/lib/formatters";

interface CashflowProjectionTableProps {
  output: DCFCalculationOutput;
}

export function CashflowProjectionTable({ output }: CashflowProjectionTableProps) {
  const years = output.forecast_years;

  return (
    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-colors">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Discounted Free Cash Flow Schedule (FCFF)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Explicit forecast discounting at {output.discount_rate_wacc_pct.toFixed(2)}% WACC. Figures in ₹ Crore.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">FCFF Component</th>
              {years.map((y) => (
                <th key={y.year_index} className="py-2.5 px-4 text-right font-semibold">
                  {y.year_label} (T+{y.year_index})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
            {/* Revenue */}
            <tr className="hover:bg-slate-100/60 dark:hover:bg-slate-800/20 font-bold text-slate-900 dark:text-slate-100">
              <td className="py-2.5 px-4 font-sans text-xs">
                <div>Projected Revenue</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Base year scaled by growth rate</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-sky-700 dark:text-sky-400 font-bold">
                  {formatCrore(y.revenue)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>Revenue Growth %</div>
                <div className="text-[10px] text-slate-500">Year-over-year top line expansion</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-900 dark:text-slate-200 font-semibold">
                  {formatPercentRaw(y.revenue_growth_pct)}
                </td>
              ))}
            </tr>

            {/* Operating Profit (EBIT) */}
            <tr className="hover:bg-slate-100/70 dark:hover:bg-slate-800/30 font-semibold text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/20">
              <td className="py-2.5 px-4 font-sans text-xs">
                <div>Operating Profit (EBIT)</div>
                <div className="text-[10px] text-slate-500 font-normal">Earnings before interest and taxes</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-bold">
                  {formatCrore(y.ebit)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>EBIT Margin %</div>
                <div className="text-[10px] text-slate-500">Operating profitability as % of revenue</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  {formatPercentRaw(y.ebit_margin_pct)}
                </td>
              ))}
            </tr>

            {/* Taxes & NOPAT */}
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>(-) Operating Taxes</div>
                <div className="text-[10px] text-slate-500">Statutory tax applied on operating profit</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-rose-700 dark:text-rose-400 font-medium">
                  ({formatCrore(y.operating_taxes)})
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/60 dark:hover:bg-slate-800/20 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/10">
              <td className="py-2.5 px-4 font-sans text-xs">
                <div>NOPAT (EBIT - Taxes)</div>
                <div className="text-[10px] text-slate-500 font-normal">Net operating profit after taxes</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-slate-900 dark:text-slate-100 font-bold">
                  {formatCrore(y.nopat)}
                </td>
              ))}
            </tr>

            {/* Non-cash & Reinvestment adjustments */}
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>(+) Depreciation & Amortization</div>
                <div className="text-[10px] text-slate-500">Non-cash charge added back to cash flow</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-800 dark:text-slate-300 font-medium">
                  +{formatCrore(y.depreciation_amortization)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>(-) Capital Expenditure (CapEx)</div>
                <div className="text-[10px] text-slate-500">Fixed assets & maintenance reinvestment</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-rose-700 dark:text-rose-400 font-medium">
                  -{formatCrore(y.capex)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400">
              <td className="py-2 px-4 font-sans text-xs">
                <div>(-) Change in Net Working Capital</div>
                <div className="text-[10px] text-slate-500">Operating liquidity requirement</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right text-slate-800 dark:text-slate-400">
                  -{formatCrore(y.change_in_nwc)}
                </td>
              ))}
            </tr>

            {/* Unlevered Free Cash Flow (FCFF) */}
            <tr className="hover:bg-sky-50 dark:hover:bg-sky-500/20 bg-sky-500/10 font-bold border-y border-sky-500/20">
              <td className="py-2.5 px-4 font-sans text-xs">
                <div className="text-sky-800 dark:text-sky-300 font-extrabold">Free Cash Flow to Firm (FCFF)</div>
                <div className="text-[10px] text-sky-700/80 dark:text-sky-400/80 font-normal">NOPAT + D&A - CapEx - ΔNWC</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2.5 px-4 text-right text-sky-800 dark:text-sky-300 font-extrabold text-sm">
                  {formatCrore(y.free_cash_flow)}
                </td>
              ))}
            </tr>

            {/* Discounting rows */}
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400 text-[11px]">
              <td className="py-2 px-4 font-sans">
                <div className="font-medium text-slate-800 dark:text-slate-300">Discount Period (t)</div>
                <div className="text-[10px] text-slate-500">
                  {years[0]?.discount_period % 1 !== 0
                    ? "Compounding period (mid-year adjusted, t - 0.5)"
                    : "Compounding period (end-of-year convention)"}
                </div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  {y.discount_period.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-400 text-[11px]">
              <td className="py-2 px-4 font-sans">
                <div className="font-medium text-slate-800 dark:text-slate-300">Discount Factor [1 / (1+WACC)^t]</div>
                <div className="text-[10px] text-slate-500">Present value multiplier at effective WACC</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-2 px-4 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  {y.discount_factor.toFixed(4)}
                </td>
              ))}
            </tr>

            {/* Present Value of Cash Flow */}
            <tr className="hover:bg-emerald-50 dark:hover:bg-emerald-500/20 bg-emerald-500/10 font-extrabold border-t border-emerald-500/20">
              <td className="py-3 px-4 font-sans text-xs">
                <div className="text-emerald-800 dark:text-emerald-300 font-extrabold">Present Value PV(FCFF)</div>
                <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-normal">FCFF × Discount Factor</div>
              </td>
              {years.map((y) => (
                <td key={y.year_index} className="py-3 px-4 text-right text-emerald-800 dark:text-emerald-400 font-extrabold text-sm">
                  {formatCrore(y.pv_fcf)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terminal Value Reconciliation Footer */}
      <div className="bg-slate-50 dark:bg-[#0b101c] p-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-sans">
            Explicit 5-Yr PV Cash Flows
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatCrore(output.cumulative_pv_fcf)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
            {(100 - output.tv_as_pct_of_ev).toFixed(1)}% of Enterprise Value
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-sans">
            Discounted Terminal Value
          </div>
          <div className="text-xl font-bold text-sky-700 dark:text-sky-400">
            {formatCrore(output.pv_terminal_value)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
            Gordon Growth: {output.terminal_growth_rate_pct.toFixed(2)}% perpetual g ({output.tv_as_pct_of_ev.toFixed(1)}% of EV)
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-sans">
            Total Implied Enterprise Value
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {formatCrore(output.enterprise_value)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
            Sum of Discounted Forecast + PV(Terminal Value)
          </div>
        </div>
      </div>
    </div>
  );
}
