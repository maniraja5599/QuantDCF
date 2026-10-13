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
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Intrinsic Value */}
          <div className="space-y-1 border-r border-slate-800/80 pr-6">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Intrinsic Value / Share</span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                FCFF Model
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {formatINR(intrinsicVal)}
            </div>
            <div className="text-[11px] text-slate-400">
              Equity Value: <span className="text-slate-200 font-semibold">{formatCrore(output.equity_value)}</span>
            </div>
          </div>

          {/* 2. Current Market Price & Implied Spread */}
          <div className="space-y-1 border-r border-slate-800/80 pr-6">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Market Price (CMP)</span>
              {quote?.is_verified && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Bhavcopy
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-slate-200 tracking-tight font-mono">
              {cmp ? formatINR(cmp) : "—"}
            </div>
            <div className="flex items-center gap-2">
              {upside !== undefined && upside !== null ? (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{formatPercent(upside)} Implied Margin</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Market price unavailable</span>
              )}
            </div>
          </div>

          {/* 3. Valuation Parameters */}
          <div className="space-y-1 border-r border-slate-800/80 pr-6">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Discount & Terminal</span>
              <button
                onClick={onOpenWaccModal}
                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 underline underline-offset-2"
              >
                <Sliders className="w-3 h-3" /> Adjust WACC
              </button>
            </div>
            <div className="flex items-baseline gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-400">WACC: </span>
                <span className="text-xl font-bold text-sky-400 font-mono">
                  {formatPercentRaw(output.discount_rate_wacc_pct)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400">g: </span>
                <span className="text-xl font-bold text-slate-200 font-mono">
                  {formatPercentRaw(output.terminal_growth_rate_pct)}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Terminal Value: <span className="text-slate-200 font-semibold">{formatCrore(output.terminal_value)}</span> (
              <span className="text-amber-400">{output.tv_as_pct_of_ev.toFixed(1)}% of EV</span>)
            </div>
          </div>

          {/* 4. Enterprise Value Bridge */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Enterprise Value
            </div>
            <div className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
              {formatCrore(output.enterprise_value)}
            </div>
            <div className="text-[11px] text-slate-400">
              Cash: <span className="text-emerald-400">+{formatCrore(output.cash_and_equivalents)}</span> | Debt:{" "}
              <span className="text-rose-400">-{formatCrore(output.total_debt)}</span>
            </div>
          </div>
        </div>

        {/* Regulatory Discloser Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Engine Model: <strong className="text-slate-300">v{output.model_version}</strong> | Calculated:{" "}
              <span className="font-mono text-slate-400">{new Date(output.calculated_at).toLocaleString()}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 max-w-xl">
            Mathematical projection derived from specified assumptions. Not an investment advisory target.
          </div>
        </div>
      </div>
    </div>
  );
}
