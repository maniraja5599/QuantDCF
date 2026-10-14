"use client";

import { useState, useEffect } from "react";
import { BFSIValuationInput, BFSIValuationOutput } from "@/lib/types";
import { api } from "@/lib/api-client";
import { formatINR, formatPercentRaw } from "@/lib/formatters";
import { Building2, ShieldCheck, TrendingUp, Sliders, Info, AlertCircle } from "lucide-react";

interface BFSIValuationCardProps {
  symbol: string;
  currentMarketPrice?: number;
}

const BFSI_PRESETS: Record<string, Partial<BFSIValuationInput>> = {
  HDFCBANK: {
    book_value_per_share: 320.0,
    eps: 45.0,
    sustainable_roe_pct: 16.5,
    cost_of_equity_ke_pct: 12.5,
    current_market_price: 714.0,
    net_interest_margin_pct: 3.85,
    gnpa_pct: 1.24,
    nnpa_pct: 0.33,
    provision_coverage_ratio_pct: 75.4,
    casa_ratio_pct: 38.5,
    tier1_crar_pct: 16.8,
  },
  ICICIBANK: {
    book_value_per_share: 418.0,
    eps: 75.0,
    sustainable_roe_pct: 18.2,
    cost_of_equity_ke_pct: 12.5,
    current_market_price: 1351.0,
    net_interest_margin_pct: 4.40,
    gnpa_pct: 2.15,
    nnpa_pct: 0.42,
    provision_coverage_ratio_pct: 80.3,
    casa_ratio_pct: 41.2,
    tier1_crar_pct: 16.5,
  },
  SBIN: {
    book_value_per_share: 485.0,
    eps: 78.0,
    sustainable_roe_pct: 16.8,
    cost_of_equity_ke_pct: 13.0,
    current_market_price: 957.0,
    net_interest_margin_pct: 3.25,
    gnpa_pct: 2.21,
    nnpa_pct: 0.57,
    provision_coverage_ratio_pct: 74.8,
    casa_ratio_pct: 40.8,
    tier1_crar_pct: 14.3,
  },
  KOTAKBANK: {
    book_value_per_share: 195.0,
    eps: 24.5,
    sustainable_roe_pct: 14.8,
    cost_of_equity_ke_pct: 12.0,
    current_market_price: 442.0,
    net_interest_margin_pct: 4.95,
    gnpa_pct: 1.39,
    nnpa_pct: 0.43,
    provision_coverage_ratio_pct: 73.2,
    casa_ratio_pct: 48.0,
    tier1_crar_pct: 20.8,
  },
  AXISBANK: {
    book_value_per_share: 520.0,
    eps: 86.0,
    sustainable_roe_pct: 17.2,
    cost_of_equity_ke_pct: 12.8,
    current_market_price: 1268.0,
    net_interest_margin_pct: 4.05,
    gnpa_pct: 1.43,
    nnpa_pct: 0.34,
    provision_coverage_ratio_pct: 77.0,
    casa_ratio_pct: 42.0,
    tier1_crar_pct: 16.6,
  },
  BAJFINANCE: {
    book_value_per_share: 185.0,
    eps: 32.0,
    sustainable_roe_pct: 21.5,
    cost_of_equity_ke_pct: 13.5,
    current_market_price: 978.0,
    net_interest_margin_pct: 10.20,
    gnpa_pct: 0.85,
    nnpa_pct: 0.38,
    provision_coverage_ratio_pct: 60.0,
    casa_ratio_pct: 0.0,
    tier1_crar_pct: 22.5,
  },
};

export function BFSIValuationCard({ symbol, currentMarketPrice }: BFSIValuationCardProps) {
  const sym = symbol.toUpperCase();
  const preset = BFSI_PRESETS[sym] || {};

  const [inputs, setInputs] = useState<BFSIValuationInput>({
    symbol,
    book_value_per_share: preset.book_value_per_share ?? 450.0,
    eps: preset.eps ?? 65.0,
    dividend_payout_ratio_pct: 20.0,
    sustainable_roe_pct: preset.sustainable_roe_pct ?? 16.5,
    cost_of_equity_ke_pct: preset.cost_of_equity_ke_pct ?? 12.5,
    perpetual_growth_rate_pct: 5.5,
    current_market_price: currentMarketPrice || preset.current_market_price || 1000.0,
    net_interest_margin_pct: preset.net_interest_margin_pct ?? 3.85,
    gnpa_pct: preset.gnpa_pct ?? 1.50,
    nnpa_pct: preset.nnpa_pct ?? 0.40,
    provision_coverage_ratio_pct: preset.provision_coverage_ratio_pct ?? 75.0,
    casa_ratio_pct: preset.casa_ratio_pct ?? 38.0,
    tier1_crar_pct: preset.tier1_crar_pct ?? 16.5,
  });

  const [output, setOutput] = useState<BFSIValuationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (vals: BFSIValuationInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.calculateBFSI(vals);
      setOutput(res);
    } catch (err: any) {
      setError(err.message || "Failed to calculate BFSI valuation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate(inputs);
  }, [symbol]);

  const handleInputChange = (field: keyof BFSIValuationInput, value: number) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    calculate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Dedicated BFSI Framework
            </span>
            <span className="text-xs text-slate-400 font-medium">Banks & NBFC Lending Model</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1">
            Banking Intrinsic Valuation (Justified P/BV, DDM & Residual Income)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            For financial lenders, customer deposits and borrowings are operational inventory, not debt capital. Valuation is anchored on sustainable Return on Equity (ROE), Cost of Equity (Ke), and loan book prudence.
          </p>
        </div>

        {output && (
          <div className="bg-[#0a0f1d] px-4 py-3 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Blended Intrinsic Value</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {formatINR(output.blended_intrinsic_value_per_share)}
            </div>
            {output.implied_upside_downside_pct !== undefined && output.implied_upside_downside_pct !== null && (
              <div className="text-xs font-bold text-emerald-400">
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

      {/* 3 Core Valuation Models Grid */}
      {output && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Model 1: Justified P/BV */}
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">1. Justified Price-to-Book</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                P/B: {output.justified_pb_multiple}x
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {formatINR(output.implied_price_justified_pb)}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Formula: <code className="text-sky-300 font-mono">(ROE - g) / (Ke - g) * BVPS</code>.
              Reflects fair premium above net book value when ROE exceeds Cost of Equity.
            </p>
          </div>

          {/* Model 2: Dividend Discount Model */}
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">2. Dividend Discount (DDM)</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                D1: ₹{output.d1_dividend}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {formatINR(output.implied_price_ddm)}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Formula: <code className="text-emerald-300 font-mono">D1 / (Ke - g)</code>.
              Capital returned to equity shareholders discounted at Cost of Equity.
            </p>
          </div>

          {/* Model 3: Residual Income Model */}
          <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">3. Residual Income Model</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Spread: +{output.economic_spread_pct}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {formatINR(output.implied_price_residual_income)}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Formula: <code className="text-amber-300 font-mono">BV0 + Economic Value Added / (Ke - g)</code>.
              Captures value created beyond capital charge.
            </p>
          </div>
        </div>
      )}

      {/* Editable Assumption Controls */}
      <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-sky-400" /> Banking & Capital Assumptions
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Book Value / Share (BVPS ₹)
            </label>
            <input
              type="number"
              value={inputs.book_value_per_share}
              onChange={(e) => handleInputChange("book_value_per_share", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              EPS (Trailing / Fwd ₹)
            </label>
            <input
              type="number"
              value={inputs.eps}
              onChange={(e) => handleInputChange("eps", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Sustainable ROE %
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.sustainable_roe_pct}
              onChange={(e) => handleInputChange("sustainable_roe_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Cost of Equity Ke %
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.cost_of_equity_ke_pct}
              onChange={(e) => handleInputChange("cost_of_equity_ke_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-sky-400 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Terminal Growth g %
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.perpetual_growth_rate_pct}
              onChange={(e) => handleInputChange("perpetual_growth_rate_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Dividend Payout %
            </label>
            <input
              type="number"
              value={inputs.dividend_payout_ratio_pct}
              onChange={(e) => handleInputChange("dividend_payout_ratio_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Net Interest Margin (NIM %)
            </label>
            <input
              type="number"
              step="0.05"
              value={inputs.net_interest_margin_pct}
              onChange={(e) => handleInputChange("net_interest_margin_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
              Gross NPA (GNPA %)
            </label>
            <input
              type="number"
              step="0.05"
              value={inputs.gnpa_pct}
              onChange={(e) => handleInputChange("gnpa_pct", parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0a0f1d] border border-slate-800 rounded px-2.5 py-1.5 text-rose-400 focus:outline-none focus:border-rose-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Asset Quality & Regulatory Health Diagnostics Strip */}
      {output && (
        <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Prudence Rating:</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
              {output.health_rating}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400">
            <span>Net NPA: <strong className="text-slate-200">{output.banking_metrics.nnpa_pct}%</strong></span>
            <span>PCR: <strong className="text-emerald-400">{output.banking_metrics.provision_coverage_ratio_pct}%</strong></span>
            <span>CASA: <strong className="text-sky-400">{output.banking_metrics.casa_ratio_pct}%</strong></span>
            <span>Tier-1 CRAR: <strong className="text-slate-200">{output.banking_metrics.tier1_crar_pct}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
