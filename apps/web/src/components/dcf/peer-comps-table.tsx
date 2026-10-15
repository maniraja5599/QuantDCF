"use client";

import { PeerCompsResponse } from "@/lib/types";
import { formatCrore, formatINR, formatNumberIN } from "@/lib/formatters";
import { BarChart3, TrendingUp, Layers, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PeerCompsTableProps {
  data: PeerCompsResponse;
  currentSymbol: string;
  dcfIntrinsicValue?: number;
  currentMarketPrice?: number;
}

export function PeerCompsTable({
  data,
  currentSymbol,
  dcfIntrinsicValue,
  currentMarketPrice,
}: PeerCompsTableProps) {
  const { peers, sector_medians, implied_valuation, sector } = data;

  return (
    <div className="space-y-6">
      {/* Header and Context */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Sector Benchmarks
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sector}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
            Comparable Company Analysis (Peer Comps)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional peer valuation matrix comparing trading multiples, profitability margins, and capital efficiency.
          </p>
        </div>

        {/* Median Multiples Pill Strip */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#0a0f1d] px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Median P/E</div>
            <div className="text-sm font-bold text-sky-700 dark:text-sky-400 font-mono">
              {sector_medians.forward_pe > 0 ? `${sector_medians.forward_pe}x` : "—"}
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Median EV/EBIT</div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {sector_medians.ev_ebit > 0 ? `${sector_medians.ev_ebit}x` : "—"}
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Median ROIC</div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
              {sector_medians.roic_pct > 0 ? `${sector_medians.roic_pct}%` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Peer Multiples Table */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#0c1220] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-300">Company / Ticker</th>
                <th className="py-3 px-3 text-right">CMP (₹)</th>
                <th className="py-3 px-3 text-right">Market Cap (₹ Cr)</th>
                <th className="py-3 px-3 text-right text-sky-400">Fwd P/E</th>
                <th className="py-3 px-3 text-right text-emerald-400">EV/EBIT</th>
                <th className="py-3 px-3 text-right">EV/Sales</th>
                <th className="py-3 px-3 text-right">P/B</th>
                <th className="py-3 px-3 text-right text-amber-400">ROIC %</th>
                <th className="py-3 px-3 text-right">EBIT Margin %</th>
                <th className="py-3 px-4 text-right">FCF Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {peers.map((peer) => {
                const isTarget = peer.symbol.toUpperCase() === currentSymbol.toUpperCase();
                return (
                  <tr
                    key={peer.symbol}
                    className={`hover:bg-slate-800/20 transition-colors ${
                      isTarget
                        ? "bg-sky-500/10 font-bold border-l-2 border-l-sky-400"
                        : "text-slate-300"
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans flex items-center gap-2">
                      <Link
                        href={`/valuation/${peer.symbol}`}
                        className="text-sky-400 hover:text-sky-300 font-bold font-mono flex items-center gap-1 group"
                      >
                        {peer.symbol}
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {peer.name}
                      </span>
                      {isTarget && (
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 rounded font-mono font-semibold">
                          Target
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {formatINR(peer.current_price)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {formatCrore(peer.market_cap_cr)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-sky-400">
                      {peer.forward_pe > 0 ? `${peer.forward_pe.toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                      {peer.ev_ebit > 0 ? `${peer.ev_ebit.toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {peer.ev_sales > 0 ? `${peer.ev_sales.toFixed(2)}x` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {peer.price_to_book > 0 ? `${peer.price_to_book.toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-300">
                      {peer.roic_pct > 0 ? `${peer.roic_pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {peer.ebit_margin_pct > 0 ? `${peer.ebit_margin_pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right text-sky-300 font-semibold">
                      {peer.fcf_conversion_pct > 0 ? `${peer.fcf_conversion_pct.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}

              {/* Sector Median Benchmark Summary Row */}
              <tr className="bg-[#0b101d] font-bold text-slate-100 border-t-2 border-slate-700">
                <td className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-400" /> Sector Median
                </td>
                <td className="py-3 px-3 text-right text-slate-400">—</td>
                <td className="py-3 px-3 text-right text-slate-400">—</td>
                <td className="py-3 px-3 text-right text-sky-400">
                  {sector_medians.forward_pe > 0 ? `${sector_medians.forward_pe}x` : "—"}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400">
                  {sector_medians.ev_ebit > 0 ? `${sector_medians.ev_ebit}x` : "—"}
                </td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {sector_medians.ev_sales > 0 ? `${sector_medians.ev_sales}x` : "—"}
                </td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {sector_medians.price_to_book > 0 ? `${sector_medians.price_to_book}x` : "—"}
                </td>
                <td className="py-3 px-3 text-right text-amber-400">
                  {sector_medians.roic_pct > 0 ? `${sector_medians.roic_pct}%` : "—"}
                </td>
                <td className="py-3 px-3 text-right text-slate-400">—</td>
                <td className="py-3 px-4 text-right text-sky-400">
                  {sector_medians.fcf_conversion_pct > 0 ? `${sector_medians.fcf_conversion_pct}%` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Triangulation Bridge (DCF vs Peer Comps vs Market Price) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            DCF Intrinsic Value (FCFF)
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">
            {dcfIntrinsicValue ? formatINR(dcfIntrinsicValue) : "—"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            5-Yr forecast + Gordon Growth perpetual terminal value
          </div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Implied Value by Median P/E
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {implied_valuation.by_pe ? formatINR(implied_valuation.by_pe) : "Benchmark"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Applied {sector_medians.forward_pe}x Sector Median P/E to EPS
          </div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] uppercase font-semibold text-slate-400">
            Current Market Price (Bhavcopy)
          </div>
          <div className="text-2xl font-black text-slate-200 font-mono mt-1">
            {currentMarketPrice ? formatINR(currentMarketPrice) : "—"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Official exchange closing price benchmark
          </div>
        </div>
      </div>
    </div>
  );
}
