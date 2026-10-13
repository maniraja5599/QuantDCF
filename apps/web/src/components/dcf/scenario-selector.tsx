"use client";

import { ScenarioResult } from "@/lib/types";
import { formatINR, formatCrore, formatPercent, formatPercentRaw } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Minus, Layers } from "lucide-react";

interface ScenarioSelectorProps {
  scenarios: ScenarioResult[];
  activeScenario?: string;
  onSelectScenario?: (name: string) => void;
}

export function ScenarioSelector({ scenarios }: ScenarioSelectorProps) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Scenario Modeling: Bull, Base & Bear Cases
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Differentiated assumptions for revenue trajectory, operating leverage margins, and cost of capital.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const isBull = sc.scenario_name.toLowerCase().includes("bull");
          const isBear = sc.scenario_name.toLowerCase().includes("bear");
          const isBase = sc.scenario_name.toLowerCase().includes("base");

          const borderColor = isBull
            ? "border-emerald-500/40 hover:border-emerald-400"
            : isBear
            ? "border-rose-500/40 hover:border-rose-400"
            : "border-sky-500/40 hover:border-sky-400";

          const badgeColor = isBull
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : isBear
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
            : "bg-sky-500/10 text-sky-400 border-sky-500/20";

          return (
            <div
              key={sc.scenario_name}
              className={`bg-[#0c1220] border ${borderColor} rounded-xl p-5 space-y-4 transition-all shadow-md relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${badgeColor}`}>
                  {sc.scenario_name}
                </span>
                {sc.implied_upside_downside_pct !== undefined && sc.implied_upside_downside_pct !== null && (
                  <span
                    className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                      sc.implied_upside_downside_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {sc.implied_upside_downside_pct >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {formatPercent(sc.implied_upside_downside_pct)}
                  </span>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  Implied Intrinsic Value
                </div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono mt-0.5">
                  {formatINR(sc.intrinsic_value_per_share)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Equity Value: <span className="text-slate-200 font-semibold">{formatCrore(sc.equity_value)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Revenue CAGR:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    {formatPercentRaw(sc.revenue_cagr_pct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Terminal EBIT Margin:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    {formatPercentRaw(sc.terminal_ebit_margin_pct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">WACC / Terminal g:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    {formatPercentRaw(sc.wacc_pct)} / {formatPercentRaw(sc.terminal_growth_rate_pct)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/40">
                {sc.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
