"use client";

import { ForecastYearInput } from "@/lib/types";
import { Sliders, RefreshCw, AlertCircle } from "lucide-react";

interface ForecastAssumptionsFormProps {
  forecasts: ForecastYearInput[];
  terminalGrowthPct: number;
  onUpdateForecast: (index: number, field: keyof ForecastYearInput, value: number) => void;
  onUpdateTerminalGrowth: (value: number) => void;
  onRecalculate: () => void;
  onApplyPreset?: (preset: "bear" | "base" | "bull") => void;
  activePreset?: "bear" | "base" | "bull" | "custom";
  isLoading: boolean;
}

export function ForecastAssumptionsForm({
  forecasts,
  terminalGrowthPct,
  onUpdateForecast,
  onUpdateTerminalGrowth,
  onRecalculate,
  onApplyPreset,
  activePreset,
  isLoading,
}: ForecastAssumptionsFormProps) {
  return (
    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-colors">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            Forecast Assumptions (5-Year Horizon)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Adjust growth rates, operating margins, capital intensity, and perpetual growth rate.
          </p>
        </div>
        <button
          onClick={onRecalculate}
          disabled={isLoading}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Recalculating..." : "Recalculate DCF"}</span>
        </button>
      </div>

      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Pre-set Scenario Toggles (Bull / Base / Bear) */}
        <div className="bg-slate-50 dark:bg-[#0b101c] p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Quick Scenario Presets
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.2 rounded font-semibold border border-sky-500/20">
                1-Click Model Calibration
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instantly toggle between conservative downside, base consensus, and aggressive upside assumptions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onApplyPreset?.("bear")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreset === "bear"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>🐻</span>
              <span>Conservative (Bear)</span>
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset?.("base")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreset === "base"
                  ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>⚖️</span>
              <span>Base Case</span>
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset?.("bull")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activePreset === "bull"
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>🐂</span>
              <span>Aggressive (Bull)</span>
            </button>
          </div>
        </div>

        {/* Terminal Growth Slider */}
        <div className="bg-slate-50 dark:bg-[#0b101c] p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Perpetual Terminal Growth Rate (g)
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                Gordon Growth
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Long-term sustainable nominal Indian GDP growth benchmark is typically between 4.5% - 6.0%.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="range"
              min="2.0"
              max="7.0"
              step="0.25"
              value={terminalGrowthPct}
              onChange={(e) => onUpdateTerminalGrowth(parseFloat(e.target.value))}
              className="w-48 accent-sky-500 cursor-pointer"
            />
            <div className="text-base font-extrabold text-sky-600 dark:text-sky-400 font-mono w-16 text-right">
              {terminalGrowthPct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Forecast Table Inputs */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Forecast Period</th>
                <th className="py-2.5 px-3 font-semibold">Rev Growth %</th>
                <th className="py-2.5 px-3 font-semibold">EBIT Margin %</th>
                <th className="py-2.5 px-3 font-semibold">Tax Rate %</th>
                <th className="py-2.5 px-3 font-semibold">CapEx % of Rev</th>
                <th className="py-2.5 px-3 font-semibold">D&A % of Rev</th>
                <th className="py-2.5 px-3 font-semibold">Δ NWC % of Rev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
              {forecasts.map((f, idx) => (
                <tr key={f.year_index} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20">
                  <td className="py-2.5 px-3 font-sans font-bold text-sky-700 dark:text-sky-400 text-xs">
                    {f.year_label}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.5"
                      value={f.revenue_growth_pct}
                      onChange={(e) => onUpdateForecast(idx, "revenue_growth_pct", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-slate-200 text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.5"
                      value={f.ebit_margin_pct}
                      onChange={(e) => onUpdateForecast(idx, "ebit_margin_pct", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-emerald-700 dark:text-emerald-400 font-bold text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.5"
                      value={f.tax_rate_pct}
                      onChange={(e) => onUpdateForecast(idx, "tax_rate_pct", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-slate-800 dark:text-slate-300 text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.25"
                      value={f.capex_pct_of_rev}
                      onChange={(e) => onUpdateForecast(idx, "capex_pct_of_rev", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-slate-800 dark:text-slate-300 text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.25"
                      value={f.dna_pct_of_rev}
                      onChange={(e) => onUpdateForecast(idx, "dna_pct_of_rev", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-slate-800 dark:text-slate-300 text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.25"
                      value={f.nwc_change_pct_of_rev}
                      onChange={(e) => onUpdateForecast(idx, "nwc_change_pct_of_rev", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-white dark:bg-[#090d18] border border-slate-300 dark:border-slate-800 rounded px-2 py-1 text-slate-800 dark:text-slate-300 text-right focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
