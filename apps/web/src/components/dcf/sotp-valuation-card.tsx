"use client";

import { useState, useEffect } from "react";
import { SOTPValuationInput, SOTPValuationOutput, SOTPSegmentInput } from "@/lib/types";
import { api } from "@/lib/api-client";
import { formatCrore, formatINR } from "@/lib/formatters";
import { Layers, Sliders, AlertCircle, PieChart, TrendingUp, CheckCircle } from "lucide-react";

interface SOTPValuationCardProps {
  symbol: string;
  currentMarketPrice?: number;
}

export function SOTPValuationCard({ symbol, currentMarketPrice }: SOTPValuationCardProps) {
  const [segments, setSegments] = useState<SOTPSegmentInput[]>([
    {
      segment_name: "Oil to Chemicals (O2C)",
      valuation_metric_label: "EBITDA",
      metric_value_cr: 65000.0,
      target_multiple: 7.5,
      ownership_stake_pct: 100.0,
    },
    {
      segment_name: "Reliance Retail Limited",
      valuation_metric_label: "EBITDA",
      metric_value_cr: 25000.0,
      target_multiple: 28.0,
      ownership_stake_pct: 85.0,
    },
    {
      segment_name: "Jio Platforms (Telecom & Digital)",
      valuation_metric_label: "EBITDA",
      metric_value_cr: 55000.0,
      target_multiple: 15.0,
      ownership_stake_pct: 67.0,
    },
    {
      segment_name: "Green Energy & New Materials",
      valuation_metric_label: "Book Value",
      metric_value_cr: 95000.0,
      target_multiple: 1.0,
      ownership_stake_pct: 100.0,
    },
  ]);

  const [netDebtCr, setNetDebtCr] = useState<number>(115000.0);
  const [discountPct, setDiscountPct] = useState<number>(15.0);
  const [dilutedSharesCr, setDilutedSharesCr] = useState<number>(1353.0); // Post 1:1 bonus

  const [output, setOutput] = useState<SOTPValuationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (
    segs: SOTPSegmentInput[],
    debt: number,
    disc: number,
    shares: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.calculateSOTP({
        conglomerate_symbol: symbol,
        company_name: symbol === "RELIANCE" ? "Reliance Industries Limited" : `${symbol} Conglomerate`,
        segments: segs,
        consolidated_net_debt_cr: debt,
        holding_company_discount_pct: disc,
        diluted_shares_cr: shares,
        current_market_price: currentMarketPrice || 1166.7,
      });
      setOutput(res);
    } catch (err: any) {
      setError(err.message || "Failed to calculate SOTP valuation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate(segments, netDebtCr, discountPct, dilutedSharesCr);
  }, [symbol]);

  const handleMultipleChange = (index: number, multiple: number) => {
    const updated = [...segments];
    updated[index].target_multiple = multiple;
    setSegments(updated);
    calculate(updated, netDebtCr, discountPct, dilutedSharesCr);
  };

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Conglomerate Analysis
            </span>
            <span className="text-xs text-slate-400 font-medium">Segment-by-Segment Valuation</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1">
            Sum-of-the-Parts (SOTP) Valuation Model
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Values individual standalone business verticals (Retail, Telecom, Refining, Green Energy) with peer multiples, deducts consolidated net debt, and applies an institutional holding company discount.
          </p>
        </div>

        {output && (
          <div className="bg-[#0a0f1d] px-4 py-3 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-500">SOTP Intrinsic Value</div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatINR(output.intrinsic_value_per_share)}
            </div>
            {output.implied_upside_downside_pct !== undefined && output.implied_upside_downside_pct !== null && (
              <div className="text-xs font-bold text-amber-400">
                {output.implied_upside_downside_pct >= 0 ? "+" : ""}
                {output.implied_upside_downside_pct}% Implied Margin
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Segment Breakdown Grid */}
      {output && (
        <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0c1220] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4 font-semibold text-slate-300">Business Segment</th>
                  <th className="py-3 px-3 text-right">Annual Metric (₹ Cr)</th>
                  <th className="py-3 px-3 text-right text-amber-400">Target Multiple</th>
                  <th className="py-3 px-3 text-right">Enterprise Value (₹ Cr)</th>
                  <th className="py-3 px-3 text-right font-semibold text-emerald-400">Effective EV (₹ Cr)</th>
                  <th className="py-3 px-4 text-right">% of Total EV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {output.segments.map((seg, idx) => (
                  <tr key={seg.segment_name} className="hover:bg-slate-800/20 text-slate-300">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {seg.segment_name}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCrore(seg.metric_value_cr)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="0.5"
                        value={segments[idx].target_multiple}
                        onChange={(e) => handleMultipleChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-[#0a0f1d] border border-slate-700 rounded px-1.5 py-0.5 text-right text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-slate-500 text-[10px] ml-1">x</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCrore(seg.enterprise_value_cr)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {formatCrore(seg.effective_value_cr)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-sky-400">
                      {seg.share_of_total_ev_pct}%
                    </td>
                  </tr>
                ))}

                {/* SOTP Bridge Total Row */}
                <tr className="bg-[#0b101d] font-bold text-slate-100 border-t-2 border-slate-700">
                  <td className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-amber-400">
                    Gross Consolidated Enterprise Value
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">—</td>
                  <td className="py-3 px-3 text-right text-slate-400">—</td>
                  <td className="py-3 px-3 text-right text-slate-400">—</td>
                  <td className="py-3 px-3 text-right text-amber-400 text-sm">
                    {formatCrore(output.gross_enterprise_value_cr)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SOTP Waterfall Capital Structure Bridge */}
      {output && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Gross Enterprise Value</div>
            <div className="text-xl font-black text-slate-100 font-mono mt-1">
              {formatCrore(output.gross_enterprise_value_cr)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Sum of all standalone business units</div>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Consolidated Net Debt (-)</div>
            <div className="text-xl font-black text-rose-400 font-mono mt-1">
              -{formatCrore(output.consolidated_net_debt_cr)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Total Borrowings minus liquid cash</div>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-[10px] uppercase font-semibold text-slate-500">
              Holding Co. Discount ({output.holding_company_discount_pct}%)
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              -{formatCrore(output.discount_amount_cr)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Institutional liquidity & tax haircut</div>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Net Implied Equity Value</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              {formatCrore(output.net_equity_value_cr)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Across {output.diluted_shares_cr} Cr diluted shares</div>
          </div>
        </div>
      )}
    </div>
  );
}
