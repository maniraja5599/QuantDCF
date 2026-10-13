"use client";

import { DCFCalculationOutput } from "@/lib/types";
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
} from "recharts";

interface CashflowChartProps {
  output: DCFCalculationOutput;
}

export function CashflowTrajectoryChart({ output }: CashflowChartProps) {
  const data = output.forecast_years.map((y) => ({
    period: y.year_label,
    Revenue: y.revenue,
    FCF: y.free_cash_flow,
    PV_FCF: y.pv_fcf,
  }));

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Forecast Revenue & Cash Flow Trajectory
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Projected operational cash generation and discounted values in ₹ Crore.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
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
                  return (
                    <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono space-y-1">
                      <div className="font-bold text-slate-200">{label}</div>
                      {payload.map((p: any) => (
                        <div key={p.name} style={{ color: p.color }}>
                          {p.name}: {formatCrore(p.value)}
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Bar yAxisId="left" dataKey="Revenue" fill="#0284c7" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar yAxisId="right" dataKey="FCF" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="PV_FCF" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
