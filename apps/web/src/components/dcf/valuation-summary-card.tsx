"use client";

import { DCFCalculationOutput, MarketQuote } from "@/lib/types";
import { formatINR, formatCrore, formatPercent, formatPercentRaw } from "@/lib/formatters";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  FileCheck,
} from "lucide-react";

interface ValuationSummaryCardProps {
  output: DCFCalculationOutput;
  quote?: MarketQuote | null;
  onOpenWaccModal: () => void;
}

export function ValuationSummaryCard({ output, quote, onOpenWaccModal }: ValuationSummaryCardProps) {
  const intrinsicVal = output.intrinsic_value_per_share;
  const cmp = output.current_market_price || quote?.current_price;
  const upside = output.implied_upside_downside_pct;
  const isPositive = upside !== undefined && upside !== null && upside >= 0;

  return (
    <div className="space-y-4">
      {/* Warning / Audit Flags Banner */}
      {output.flags && output.flags.length > 0 && (
        <div className="space-y-2">
          {output.flags.map((flag, idx) => {
            const isWarn = flag.level === "WARNING";
            const isCrit = flag.level === "CRITICAL";
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-start gap-3 text-xs ${
                  isCrit
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : isWarn
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-sky-500/10 border-sky-500/30 text-sky-300"
                }`}
              >
                {isCrit || isWarn ? (
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] mr-2">
                    [{flag.code}]
                  </span>
                  {flag.message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main KPI Card */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover-glow-sky hover-lift rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 group-hover:bg-sky-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-500" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Intrinsic Value */}
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-0 sm:pr-4 xl:pr-5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Intrinsic Value / Share</span>
                <span className="text-[9px] font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-bold">
                  FCFF Model
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono mt-1">
                {formatINR(intrinsicVal)}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Equity Value: <span className="text-slate-900 dark:text-slate-100 font-bold">{formatCrore(output.equity_value)}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1.5 border-t border-slate-200 dark:border-slate-800/50">
              Discounted fair value of future cash flows per share
            </div>
          </div>

          {/* 2. Current Market Price & Implied Spread */}
          <div className="space-y-1.5 border-b sm:border-b-0 xl:border-r border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-0 sm:pr-0 xl:pr-5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Market Price (CMP)</span>
                {quote?.is_verified && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Bhavcopy
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-200 tracking-tight font-mono mt-1">
                {cmp ? formatINR(cmp) : "—"}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {upside !== undefined && upside !== null ? (
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{formatPercent(upside)} Implied Margin</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">Market price unavailable</span>
                )}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1.5 border-t border-slate-200 dark:border-slate-800/50">
              Latest official market quote from NSE feed
            </div>
          </div>

          {/* 3. Valuation Parameters */}
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-0 sm:pr-4 xl:pr-5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Discount & Terminal</span>
                <button
                  onClick={onOpenWaccModal}
                  className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-semibold underline underline-offset-2"
                >
                  <Sliders className="w-2.5 h-2.5" /> Adjust WACC
                </button>
              </div>
              <div className="flex items-baseline gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">WACC: </span>
                  <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono">
                    {formatPercentRaw(output.discount_rate_wacc_pct)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">g: </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-200 font-mono">
                    {formatPercentRaw(output.terminal_growth_rate_pct)}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Terminal: <span className="text-slate-900 dark:text-slate-200 font-bold">{formatCrore(output.terminal_value)}</span> (
                <span className="text-amber-600 dark:text-amber-400 font-bold">{output.tv_as_pct_of_ev.toFixed(1)}% of EV</span>)
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1.5 border-t border-slate-200 dark:border-slate-800/50">
              Cost of capital hurdle vs perpetual Indian GDP anchor
            </div>
          </div>

          {/* 4. Enterprise Value Bridge */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Enterprise Value
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono mt-1">
                {formatCrore(output.enterprise_value)}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Cash: <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatCrore(output.cash_and_equivalents)}</span> | Debt:{" "}
                <span className="text-rose-600 dark:text-rose-400 font-bold">-{formatCrore(output.total_debt)}</span>
                {output.minority_interest > 0 && (
                  <>
                    {" "}| Minority: <span className="text-amber-600 dark:text-amber-400 font-bold">-{formatCrore(output.minority_interest)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1.5 border-t border-slate-200 dark:border-slate-800/50">
              Total operating asset value: PV(FCFF) + PV(Terminal Value)
            </div>
          </div>
        </div>

        {/* Institutional Valuation Multiples & Margin of Safety Strip */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#0a0f1d]/60 -mx-4 sm:-mx-5 px-4 sm:px-5 -mb-1 py-3 rounded-b-xl text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Margin of Safety</div>
            <div className="font-bold text-xs mt-0.5 flex items-center gap-1.5">
              {upside !== undefined && upside !== null ? (
                upside > 15 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Deep Value (+{upside.toFixed(1)}%)
                  </span>
                ) : upside >= -10 ? (
                  <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Fairly Valued ({upside >= 0 ? "+" : ""}{upside.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Premium / Overvalued ({upside.toFixed(1)}%)
                  </span>
                )
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Spread between fair value & CMP</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Implied Forward EV/EBIT</div>
            <div className="font-extrabold text-xs text-slate-900 dark:text-slate-200 font-mono mt-0.5">
              {output.forecast_years[0]?.ebit > 0
                ? `${(output.enterprise_value / output.forecast_years[0].ebit).toFixed(1)}x`
                : "—"}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Multiple on 1Y operating earnings</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Implied EV/Sales (FY25E)</div>
            <div className="font-extrabold text-xs text-slate-900 dark:text-slate-200 font-mono mt-0.5">
              {output.forecast_years[0]?.revenue > 0
                ? `${(output.enterprise_value / output.forecast_years[0].revenue).toFixed(2)}x`
                : "—"}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Valuation on 1Y forward revenue</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">FCF Conversion %</div>
            <div className="font-extrabold text-xs text-sky-600 dark:text-sky-400 font-mono mt-0.5">
              {output.forecast_years[0]?.ebit > 0
                ? `${((output.forecast_years[0].free_cash_flow / output.forecast_years[0].ebit) * 100).toFixed(1)}%`
                : "—"}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Share of EBIT turning into free cash</div>
          </div>
        </div>

        {/* Reverse DCF Market-Implied Expectations Strip */}
        {(() => {
          if (!cmp || cmp <= 0 || output.diluted_shares <= 0) return null;
          const marketCap = cmp * output.diluted_shares;
          const marketEv = marketCap + output.total_debt - output.cash_and_equivalents + output.minority_interest;
          const fcf1 = output.forecast_years[0]?.free_cash_flow;
          const marketFcfYield = fcf1 && marketCap > 0 ? (fcf1 / marketCap) * 100 : null;

          const n = output.forecast_years.length;
          const fcfn = output.forecast_years[n - 1]?.free_cash_flow;
          const wacc = output.discount_rate_wacc_pct / 100;
          const pvFcf = output.cumulative_pv_fcf;

          let marketImpliedG: number | null = null;
          if (fcfn && fcfn > 0 && wacc > 0 && marketEv > pvFcf) {
            const pvTermTarget = (marketEv - pvFcf) * Math.pow(1 + wacc, n);
            const impliedG = (pvTermTarget * wacc - fcfn) / (pvTermTarget + fcfn);
            if (!isNaN(impliedG) && impliedG > -0.2 && impliedG < wacc) {
              marketImpliedG = impliedG * 100;
            }
          }

          return (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-100/70 dark:bg-slate-900/40 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  Reverse DCF
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  Current Market Price implies:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
                {marketImpliedG !== null && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Implied Terminal Growth (g): </span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">{marketImpliedG.toFixed(2)}%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">(vs Model {output.terminal_growth_rate_pct.toFixed(1)}%)</span>
                  </div>
                )}
                {marketFcfYield !== null && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Forward FCF Yield: </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{marketFcfYield.toFixed(2)}%</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Market EV: </span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{formatCrore(marketEv)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Regulatory Disclosure Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>
              Engine Model: <strong className="text-slate-800 dark:text-slate-300">v{output.model_version}</strong> | Calculated:{" "}
              <span suppressHydrationWarning className="font-mono text-slate-700 dark:text-slate-400">{new Date(output.calculated_at).toLocaleString()}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xl">
            Mathematical projection derived from specified assumptions. Not an investment advisory target.
          </div>
        </div>
      </div>
    </div>
  );
}
