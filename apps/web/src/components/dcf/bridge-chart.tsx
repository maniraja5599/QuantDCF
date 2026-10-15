"use client";

import { DCFCalculationOutput } from "@/lib/types";
import { formatCrore } from "@/lib/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface BridgeChartProps {
  output: DCFCalculationOutput;
}

export function ValuationBridgeChart({ output }: BridgeChartProps) {
  const data = [
    {
      name: "PV(FCF)",
      amount: output.cumulative_pv_fcf,
      fill: "#0284c7", // Sky
    },
    {
      name: "PV(Terminal)",
      amount: output.pv_terminal_value,
      fill: "#38bdf8", // Light Sky
    },
    {
      name: "Enterprise Val",
      amount: output.enterprise_value,
      fill: "#6366f1", // Indigo
    },
    {
      name: "(+) Cash",
      amount: output.cash_and_equivalents,
      fill: "#10b981", // Emerald
    },
    {
      name: "(-) Debt",
      amount: -output.total_debt,
      fill: "#f43f5e", // Rose
    },
    ...(output.minority_interest > 0
      ? [
          {
            name: "(-) Minority",
            amount: -output.minority_interest,
            fill: "#f59e0b", // Amber
          },
        ]
      : []),
    {
      name: "Equity Value",
      amount: output.equity_value,
      fill: "#10b981", // Emerald
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg p-6 transition-colors">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Enterprise to Equity Value Bridge
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Step-by-step balance sheet reconciliation in ₹ Crore.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k Cr`}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
                      <div className="font-bold text-slate-200">{d.name}</div>
                      <div className="text-sky-400 mt-1">{formatCrore(Math.abs(d.amount))}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
