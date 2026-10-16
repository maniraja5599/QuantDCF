"use client";

import { useState } from "react";
import { DCFCalculationOutput, MarketQuote, WACCAssumptions } from "@/lib/types";
import { formatINR, formatCrore, formatPercent, formatPercentRaw } from "@/lib/formatters";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  FileCheck,
  Calculator,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  HelpCircle,
  X,
  Target,
  Sparkles,
  BarChart3,
  Percent,
} from "lucide-react";

interface ValuationSummaryCardProps {
  output: DCFCalculationOutput;
  quote?: MarketQuote | null;
  waccAssumptions?: WACCAssumptions;
  onOpenWaccModal: () => void;
}

export function ValuationSummaryCard({ output, quote, waccAssumptions, onOpenWaccModal }: ValuationSummaryCardProps) {
  const [showWaccBreakdown, setShowWaccBreakdown] = useState(false);
  const [showExitMultiples, setShowExitMultiples] = useState(false);

  const intrinsicVal = output.intrinsic_value_per_share;
  const cmp = output.current_market_price || quote?.current_price;
  const upside = output.implied_upside_downside_pct;
  const isPositive = upside !== undefined && upside !== null && upside >= 0;

  // CAPM / WACC Parameter Calculation
  const rf = waccAssumptions?.risk_free_rate_pct ?? 7.10;
  const beta = waccAssumptions?.beta ?? 1.0;
  const erp = waccAssumptions?.equity_risk_premium_pct ?? 6.50;
  const ke = rf + beta * erp;
  const kdPre = waccAssumptions?.pre_tax_cost_of_debt_pct ?? 8.00;
  const taxRate = waccAssumptions?.effective_tax_rate_pct ?? 25.17;
  const kdPost = kdPre * (1 - taxRate / 100);
  const we = waccAssumptions?.weight_equity_pct ?? 90.0;
  const wd = waccAssumptions?.weight_debt_pct ?? 10.0;
  const calculatedWacc = (we / 100) * ke + (wd / 100) * kdPost;

  // Exit Multiple Triangulation Data
  const nYears = output.forecast_years.length;
  const finalYear = output.forecast_years[nYears - 1];
  const finalEbit = finalYear?.ebit || 0;
  const finalDna = finalYear?.depreciation_amortization || 0;
  const finalEbitda = finalEbit + finalDna;
  const discountFactorN = finalYear?.discount_factor || Math.pow(1 / (1 + output.discount_rate_wacc_pct / 100), nYears);

  const exitMultiples = [8, 10, 12, 14, 16, 18];
  const exitMultipleResults = exitMultiples.map((mult) => {
    const termValue = finalEbitda * mult;
    const pvTermValue = termValue * discountFactorN;
    const ev = output.cumulative_pv_fcf + pvTermValue;
    const eqVal = ev + output.cash_and_equivalents - output.total_debt - output.minority_interest;
    const pps = output.diluted_shares > 0 ? eqVal / output.diluted_shares : 0;
    const upsideVsCmp = cmp && cmp > 0 ? ((pps - cmp) / cmp) * 100 : null;
    return {
      multiple: mult,
      terminalValue: termValue,
      pvTerminalValue: pvTermValue,
      impliedEV: ev,
      impliedPerShare: pps,
      upsideVsCmp,
    };
  });

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
                  Gordon Growth (g)
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

          {/* 3. Valuation Parameters with WACC Breakdown Popover */}
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-0 sm:pr-4 xl:pr-5 flex flex-col justify-between relative">
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Discount & Terminal</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWaccBreakdown(!showWaccBreakdown)}
                    title="View Cost of Equity (Ke) and Cost of Debt (Kd) CAPM breakdown"
                    className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-0.5 font-semibold bg-sky-500/10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    <Info className="w-3 h-3" />
                    <span>Formula</span>
                  </button>
                  <button
                    onClick={onOpenWaccModal}
                    className="text-[10px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold underline underline-offset-2"
                  >
                    <Sliders className="w-2.5 h-2.5" /> Adjust
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                <div className="group/wacc cursor-pointer" onClick={() => setShowWaccBreakdown(!showWaccBreakdown)}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">WACC: </span>
                  <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono underline decoration-dotted decoration-sky-500/50 underline-offset-4">
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

            {/* WACC Breakdown Popover */}
            {showWaccBreakdown && (
              <div className="absolute top-full left-0 right-0 sm:left-auto sm:w-80 sm:-right-8 z-50 mt-2 p-3.5 bg-slate-900/95 text-white backdrop-blur-xl border border-sky-500/40 rounded-xl shadow-2xl text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>WACC Cost of Capital Breakdown</span>
                  </div>
                  <button
                    onClick={() => setShowWaccBreakdown(false)}
                    className="text-slate-400 hover:text-white p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase text-sky-400">
                      Cost of Equity (Ke) via CAPM
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ke = Rf + (β × ERP)</span>
                      <span className="font-bold text-white">{ke.toFixed(2)}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rf: {rf.toFixed(2)}% (10Y G-Sec) &bull; β: {beta.toFixed(2)} &bull; ERP: {erp.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase text-amber-400">
                      Cost of Debt (Kd) After Tax
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Kd = Pre-tax × (1 - Tax)</span>
                      <span className="font-bold text-white">{kdPost.toFixed(2)}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Pre-tax: {kdPre.toFixed(2)}% &bull; Tax: {taxRate.toFixed(2)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <div className="text-[10px] font-sans font-bold uppercase text-emerald-400">
                      Capital Structure Weightage
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Weight Equity (We):</span>
                      <span className="font-bold text-white">{we.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Weight Debt (Wd):</span>
                      <span className="font-bold text-white">{wd.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 flex justify-between items-center text-xs">
                    <span className="font-sans font-bold text-sky-300">Total Effective WACC:</span>
                    <span className="font-bold text-white text-sm">{calculatedWacc.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      setShowWaccBreakdown(false);
                      onOpenWaccModal();
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open Interactive WACC Calculator</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
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

        {/* Institutional Valuation Multiples & Cross-Check Controls Strip */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#0a0f1d]/60 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 rounded-b-none text-xs">
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

          <div className="flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Exit Multiples Check</span>
                <button
                  onClick={() => setShowExitMultiples(!showExitMultiples)}
                  className="text-[9px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 font-bold"
                >
                  {showExitMultiples ? "Hide" : "Compare"}
                  {showExitMultiples ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                </button>
              </div>
              <div className="font-extrabold text-xs text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                {finalEbitda > 0 ? `${(output.pv_terminal_value / (finalEbitda * discountFactorN)).toFixed(1)}x Implied Exit` : "—"}
              </div>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Terminal EV/EBITDA triangulation</div>
          </div>
        </div>

        {/* Valuation Multiple Cross-Check (Exit Multiple Method vs Gordon Growth) */}
        {showExitMultiples && (
          <div className="-mx-4 sm:-mx-5 px-4 sm:px-5 py-3.5 bg-slate-100/90 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  <span>Exit Multiple Method Cross-Check (EV / EBITDA)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Cross-validating Gordon Growth intrinsic value against institutional Terminal EV/EBITDA multiples (Final Year EBITDA: {formatCrore(finalEbitda)}).
                </p>
              </div>
              <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20 shrink-0">
                Gordon Growth Implied: ₹{intrinsicVal.toFixed(2)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-mono text-[10px] uppercase">
                    <th className="py-2 px-3 text-left">Exit Multiple</th>
                    <th className="py-2 px-3">Terminal Value</th>
                    <th className="py-2 px-3">Enterprise Value</th>
                    <th className="py-2 px-3">Implied Fair Value</th>
                    <th className="py-2 px-3">Vs Current CMP</th>
                    <th className="py-2 px-3">Vs Gordon Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
                  {exitMultipleResults.map((em) => {
                    const diffVsGordon = ((em.impliedPerShare - intrinsicVal) / intrinsicVal) * 100;
                    return (
                      <tr key={em.multiple} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-left font-bold text-sky-600 dark:text-sky-400 font-sans">
                          {em.multiple}x EV/EBITDA
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                          {formatCrore(em.terminalValue)}
                        </td>
                        <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-semibold">
                          {formatCrore(em.impliedEV)}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          ₹{em.impliedPerShare.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 font-semibold">
                          {em.upsideVsCmp !== null ? (
                            <span className={em.upsideVsCmp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                              {em.upsideVsCmp >= 0 ? "+" : ""}{em.upsideVsCmp.toFixed(1)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3 text-[10px]">
                          <span className={diffVsGordon >= 0 ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}>
                            {diffVsGordon >= 0 ? "+" : ""}{diffVsGordon.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reverse DCF Market-Implied Expectations Stat Card */}
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

          const modelG = output.terminal_growth_rate_pct;
          const growthSpread = marketImpliedG !== null ? marketImpliedG - modelG : null;

          return (
            <div className="mt-4 -mx-4 sm:-mx-5 px-4 sm:px-5 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-amber-500/[0.08] via-slate-50 dark:via-[#0c1220] to-sky-500/[0.08] dark:to-sky-500/[0.05]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      Reverse DCF &bull; Market Expectations Analysis
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      What the current stock price (₹{cmp.toFixed(2)}) requires the company to deliver indefinitely.
                    </p>
                  </div>
                </div>

                {growthSpread !== null && (
                  <div className="self-start md:self-auto">
                    {growthSpread > 2.0 ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Priced for High Growth (+{growthSpread.toFixed(1)}% vs Model)
                      </span>
                    ) : growthSpread < -1.0 ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        Subdued Market Hurdle ({growthSpread.toFixed(1)}% vs Model)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Aligned with Model Baseline ({growthSpread >= 0 ? "+" : ""}{growthSpread.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3 Metric Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="bg-white/80 dark:bg-[#111726]/90 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="text-[10px] font-sans font-bold uppercase text-slate-500 dark:text-slate-400">
                    Market Implied Terminal Growth (g)
                  </div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {marketImpliedG !== null ? `${marketImpliedG.toFixed(2)}%` : "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    Model assumes: <strong className="text-slate-700 dark:text-slate-300">{modelG.toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-[#111726]/90 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="text-[10px] font-sans font-bold uppercase text-slate-500 dark:text-slate-400">
                    Forward Free Cash Flow Yield
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {marketFcfYield !== null ? `${marketFcfYield.toFixed(2)}%` : "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    10Y G-Sec Hurdle: <strong className="text-slate-700 dark:text-slate-300">7.10%</strong>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-[#111726]/90 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="text-[10px] font-sans font-bold uppercase text-slate-500 dark:text-slate-400">
                    Current Market Enterprise Value
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCrore(marketEv)}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    Model EV: <strong className="text-slate-700 dark:text-slate-300">{formatCrore(output.enterprise_value)}</strong>
                  </div>
                </div>
              </div>

              {/* Actionable Executive Takeaway */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-100/80 dark:bg-[#080d1a] border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  {marketImpliedG !== null ? (
                    marketImpliedG > modelG ? (
                      <span>
                        <strong>Analyst Note:</strong> At CMP of ₹{cmp.toFixed(2)}, market is pricing in an aggressive <strong>{marketImpliedG.toFixed(2)}%</strong> perpetual cash growth rate (exceeding India&apos;s nominal GDP anchor of 5.5%). Fundamental safety margin requires either margin expansion or accelerating revenue.
                      </span>
                    ) : (
                      <span>
                        <strong>Analyst Note:</strong> At CMP of ₹{cmp.toFixed(2)}, market implies modest perpetual terminal growth of <strong>{marketImpliedG.toFixed(2)}%</strong>. This indicates market caution, providing fundamental investors with an attractive margin of safety against model baseline ({modelG.toFixed(1)}%).
                      </span>
                    )
                  ) : (
                    <span>Current market valuation implies cash generation exceeding explicit 5-year discounting capacity.</span>
                  )}
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
