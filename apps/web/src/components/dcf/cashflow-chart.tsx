"use client";

import { DCFCalculationOutput, HistoricalStatement } from "@/lib/types";
import { formatCrore } from "@/lib/formatters";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

interface CashflowChartProps {
  output: DCFCalculationOutput;
  historical?: HistoricalStatement[];
}

export function CashflowTrajectoryChart({ output, historical }: CashflowChartProps) {
  // Extract up to 3 latest historical actual periods
  const recentHistory = (historical || [])
    .slice(-3)
    .filter((h) => h.revenue > 0);

  const histData = recentHistory.map((h) => {
    const historicalFcf =
      h.ebit -
      (h.tax_expense || 0) +
      (h.depreciation_amortization || 0) -
      (h.capex || 0) -
      (h.change_in_nwc || 0);

    return {
      period: `FY${String(h.fiscal_year).slice(-2)}A`,
      isHistorical: true,
      "Actual Revenue": h.revenue,
      "Projected Revenue": null,
      "Actual FCF": historicalFcf,
      "Projected FCF": null,
      "Revenue Trend (All)": h.revenue,
      "PV of FCF": null,
    };
  });

  const forecastData = output.forecast_years.map((y) => ({
    period: y.year_label,
    isHistorical: false,
    "Actual Revenue": null,
    "Projected Revenue": y.revenue,
    "Actual FCF": null,
    "Projected FCF": y.free_cash_flow,
    "Revenue Trend (All)": y.revenue,
    "PV of FCF": y.pv_fcf,
  }));

  // Bridge point: connect trendline seamlessly between last actual and first forecast
  const combinedData = [...histData, ...forecastData];
  const firstForecastLabel = output.forecast_years[0]?.year_label;

  return (
    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 sm:p-6 transition-colors">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            Historical Actuals vs Projected Trendline
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Past verified audited numbers vs 5-year explicit FCFF trajectory in ₹ Crore.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            Historical Actuals
          </span>
          <span className="text-slate-400">&rarr;</span>
          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold">
            Model Forecast
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k Cr`}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k Cr`}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const isHist = payload[0]?.payload?.isHistorical;
                  return (
                    <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-lg shadow-2xl text-xs font-mono space-y-1 z-50">
                      <div className="flex items-center justify-between gap-3 font-bold text-slate-200 border-b border-slate-700 pb-1">
                        <span>{label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                          isHist ? "bg-slate-700 text-slate-300" : "bg-sky-500/30 text-sky-300"
                        }`}>
                          {isHist ? "AUDITED ACTUAL" : "DCF PROJECTION"}
                        </span>
                      </div>
                      {payload
                        .filter((p: any) => p.value !== null && p.value !== undefined)
                        .map((p: any) => (
                          <div key={p.name} className="flex items-center justify-between gap-3" style={{ color: p.color }}>
                            <span>{p.name}:</span>
                            <span className="font-bold">{formatCrore(p.value)}</span>
                          </div>
                        ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />

            {/* Vertical demarcation between actuals and forecast */}
            {firstForecastLabel && (
              <ReferenceLine
                yAxisId="left"
                x={firstForecastLabel}
                stroke="#0ea5e9"
                strokeDasharray="3 3"
                label={{
                  value: "Forecast Start",
                  position: "top",
                  fill: "#38bdf8",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Historical Actuals (Monochrome / Slate shades) */}
            <Bar
              yAxisId="left"
              dataKey="Actual Revenue"
              fill="#64748b"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Bar
              yAxisId="right"
              dataKey="Actual FCF"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              opacity={0.9}
            />

            {/* DCF Projections (Institutional Sky / Cyan / Brand Blue shades) */}
            <Bar
              yAxisId="left"
              dataKey="Projected Revenue"
              fill="#0284c7"
              radius={[4, 4, 0, 0]}
              opacity={0.9}
            />
            <Bar
              yAxisId="right"
              dataKey="Projected FCF"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              opacity={0.95}
            />

            {/* Dotted Trendline spanning entire timeline */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Revenue Trend (All)"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: "#38bdf8" }}
            />

            {/* Discounted PV Line for forecast */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PV of FCF"
              stroke="#818cf8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#818cf8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
