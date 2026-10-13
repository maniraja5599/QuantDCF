"use client";

import { SensitivityMatrix as SensitivityType } from "@/lib/types";
import { formatINR } from "@/lib/formatters";
import { Grid3X3 } from "lucide-react";

interface SensitivityMatrixProps {
  data: SensitivityType | null;
}

export function SensitivityMatrixTable({ data }: SensitivityMatrixProps) {
  if (!data) return null;

  const { wacc_rates_pct, terminal_growth_rates_pct, matrix, base_wacc_pct, base_growth_pct, base_intrinsic_value } = data;

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-sky-400" />
            Intrinsic Value Sensitivity Matrix
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Intrinsic value per diluted share (₹) across varying WACC discount rates and perpetual terminal growth rates (g).
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
            <span className="text-slate-400 text-[10px]">Higher Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500/30 border border-sky-400"></span>
            <span className="text-slate-400 text-[10px]">Base Model</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40"></span>
            <span className="text-slate-400 text-[10px]">Lower Value</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-slate-800 bg-[#0c1220] text-slate-400 font-sans text-[11px] font-semibold text-left">
                WACC \ Growth (g)
              </th>
              {terminal_growth_rates_pct.map((g) => {
                const isBaseG = Math.abs(g - base_growth_pct) < 0.05;
                return (
                  <th
                    key={g}
                    className={`p-2 border border-slate-800 font-mono text-[11px] ${
                      isBaseG ? "bg-sky-500/20 text-sky-300 font-bold" : "bg-[#0c1220] text-slate-400"
                    }`}
                  >
                    {g.toFixed(2)}%
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="font-mono">
            {wacc_rates_pct.map((w, wIdx) => {
              const isBaseW = Math.abs(w - base_wacc_pct) < 0.05;
              return (
                <tr key={w}>
                  <td
                    className={`p-2 border border-slate-800 text-left font-bold text-[11px] ${
                      isBaseW ? "bg-sky-500/20 text-sky-300" : "bg-[#0c1220] text-slate-400"
                    }`}
                  >
                    {w.toFixed(2)}%
                  </td>
                  {terminal_growth_rates_pct.map((g, gIdx) => {
                    const val = matrix[wIdx]?.[gIdx];
                    const isBaseCell = isBaseW && Math.abs(g - base_growth_pct) < 0.05;

                    if (val === null || val === undefined) {
                      return (
                        <td key={g} className="p-2 border border-slate-800/80 bg-slate-900/40 text-slate-600 text-[10px]">
                          N/A (WACC≤g)
                        </td>
                      );
                    }

                    const diffPct = ((val - base_intrinsic_value) / base_intrinsic_value) * 100;
                    let cellColor = "bg-[#0e1424] text-slate-200";

                    if (isBaseCell) {
                      cellColor = "bg-sky-500/20 text-sky-300 font-extrabold ring-2 ring-sky-400 ring-inset";
                    } else if (diffPct > 5) {
                      cellColor = "bg-emerald-500/10 text-emerald-300";
                    } else if (diffPct < -5) {
                      cellColor = "bg-rose-500/10 text-rose-300";
                    }

                    return (
                      <td key={g} className={`p-2 border border-slate-800 text-[11px] transition-colors ${cellColor}`}>
                        {formatINR(val, 0)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
