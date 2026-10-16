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

      {/* Ind AS 115 Accounting Disclosure & Terminal Reconciliation Strip */}
      <div className="bg-slate-50 dark:bg-[#0b101c] p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Sleek Equation Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs bg-white dark:bg-[#111726] p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            <span className="font-sans font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
              Valuation Bridge:
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-900 dark:text-slate-100">
              PV Forecasts ({formatCrore(output.cumulative_pv_fcf)})
            </span>
            <span className="text-slate-400 font-bold">+</span>
            <span className="bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-500/20">
              PV Terminal ({formatCrore(output.pv_terminal_value)})
            </span>
            <span className="text-slate-400 font-bold">=</span>
            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded font-extrabold border border-emerald-500/30">
              EV: {formatCrore(output.enterprise_value)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
            <span className="text-slate-500 dark:text-slate-400">
              Terminal Weight: <strong className="text-amber-600 dark:text-amber-400 font-bold">{output.tv_as_pct_of_ev.toFixed(1)}%</strong> of EV
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-500 dark:text-slate-400">
              Perpetual g: <strong className="text-slate-800 dark:text-slate-200">{output.terminal_growth_rate_pct.toFixed(2)}%</strong>
            </span>
          </div>
        </div>

        {/* Sector Revenue Accounting Disclosure (Liquor / FMCG / Manufacturing) */}
        <div className="flex items-start gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed px-1">
          <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0 font-mono text-[10px] uppercase bg-sky-500/10 px-1.5 py-0.5 rounded">
            Ind AS 115
          </span>
          <span>
            <strong>Revenue Accounting Note:</strong> All revenue projections reflect <em>Net Revenue from Operations</em> (exclusive of State Excise Duty, Goods and Services Tax [GST], and trade rebates). For excise-heavy sectors (e.g., Alco-bev, Petroleum, Tobacco), gross revenues include statutory duties which distort operating margins if not adjusted.
          </span>
        </div>
      </div>
    </div>
  );
}
