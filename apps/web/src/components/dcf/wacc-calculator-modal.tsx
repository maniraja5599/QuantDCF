"use client";

import { useState } from "react";
import { WACCAssumptions } from "@/lib/types";
import { X, Sliders, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatPercentRaw } from "@/lib/formatters";

interface WACCCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assumptions: WACCAssumptions;
  onApply: (updated: WACCAssumptions) => void;
}

export function WACCCalculatorModal({
  isOpen,
  onClose,
  assumptions,
  onApply,
}: WACCCalculatorModalProps) {
  const [waccState, setWaccState] = useState<WACCAssumptions>({ ...assumptions });
  const [overrideEnabled, setOverrideEnabled] = useState(waccState.manual_wacc_override !== undefined);

  if (!isOpen) return null;

  // Real-time local calculation
  const rf = waccState.risk_free_rate_pct;
  const erp = waccState.equity_risk_premium_pct;
  const beta = waccState.beta;
  const costOfEquity = rf + beta * erp;

  const kdPreTax = waccState.pre_tax_cost_of_debt_pct;
  const taxRate = waccState.effective_tax_rate_pct;
  const costOfDebtAfterTax = kdPreTax * (1.0 - taxRate / 100.0);

  const we = waccState.weight_equity_pct / 100.0;
  const wd = waccState.weight_debt_pct / 100.0;
  const calculatedWacc = we * costOfEquity + wd * costOfDebtAfterTax;

  const effectiveWacc = overrideEnabled && waccState.manual_wacc_override ? waccState.manual_wacc_override : calculatedWacc;

  const handleWeightEquityChange = (equityWeight: number) => {
    const debtWeight = Math.max(0, Math.min(100, 100 - equityWeight));
    setWaccState((prev) => ({
      ...prev,
      weight_equity_pct: equityWeight,
      weight_debt_pct: debtWeight,
    }));
  };

  const handleSave = () => {
    const finalPayload: WACCAssumptions = {
      ...waccState,
      manual_wacc_override: overrideEnabled ? waccState.manual_wacc_override : undefined,
      override_reason: overrideEnabled ? waccState.override_reason : undefined,
    };
    onApply(finalPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111726] border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Cost of Capital & WACC Modeling
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-[#090d18] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Effective Model Discount Rate
              </div>
              <div className="text-3xl font-extrabold text-sky-400 font-mono mt-0.5">
                {formatPercentRaw(effectiveWacc)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Cost of Equity: <span className="text-slate-200 font-semibold">{formatPercentRaw(costOfEquity)}</span> | After-tax Debt: <span className="text-slate-200 font-semibold">{formatPercentRaw(costOfDebtAfterTax)}</span>
              </div>
            </div>
            {overrideEnabled ? (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                Manual Override Active
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> CAPM Verified
              </span>
            )}
          </div>

          {/* CAPM Cost of Equity Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1">
              1. Cost of Equity (CAPM)
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Risk-Free Rate (Rf %)</label>
                <input
                  type="number"
                  step="0.05"
                  value={waccState.risk_free_rate_pct}
                  onChange={(e) => setWaccState({ ...waccState, risk_free_rate_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">10Y G-Sec: ~7.10%</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Equity Risk Premium (ERP %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waccState.equity_risk_premium_pct}
                  onChange={(e) => setWaccState({ ...waccState, equity_risk_premium_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">India ERP: ~6.50%</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Beta (Levered)</label>
                <input
                  type="number"
                  step="0.05"
                  value={waccState.beta}
                  onChange={(e) => setWaccState({ ...waccState, beta: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Market Beta = 1.0</span>
              </div>
            </div>
          </div>

          {/* Cost of Debt Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1">
              2. Cost of Debt & Corporate Taxes
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Pre-Tax Borrowing Rate (Kd %)</label>
                <input
                  type="number"
                  step="0.25"
                  value={waccState.pre_tax_cost_of_debt_pct}
                  onChange={(e) => setWaccState({ ...waccState, pre_tax_cost_of_debt_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Effective Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={waccState.effective_tax_rate_pct}
                  onChange={(e) => setWaccState({ ...waccState, effective_tax_rate_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">India Corp Tax: 25.17%</span>
              </div>
            </div>
          </div>

          {/* Capital Structure Weights */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-1">
              3. Capital Structure Weighting
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Weight Equity:</span>
                  <span className="font-bold text-slate-200">{waccState.weight_equity_pct.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={waccState.weight_equity_pct}
                  onChange={(e) => handleWeightEquityChange(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Weight Debt:</span>
                  <span className="font-bold text-slate-200">{waccState.weight_debt_pct.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={waccState.weight_debt_pct}
                  onChange={(e) => handleWeightEquityChange(100 - parseFloat(e.target.value))}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Manual Override & Audit Section */}
          <div className="border border-slate-800 rounded-lg p-4 bg-[#090d18] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideEnabled}
                  onChange={(e) => setOverrideEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                />
                <span>Enable Manual WACC Override</span>
              </label>
            </div>

            {overrideEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Overridden WACC Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.5"
                    value={waccState.manual_wacc_override || ""}
                    onChange={(e) =>
                      setWaccState({
                        ...waccState,
                        manual_wacc_override: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full bg-[#0c1220] border border-amber-500/40 rounded px-3 py-1.5 text-xs text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Audit Justification (Required for Audit Trail)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="State reason for overriding calculated WACC..."
                    value={waccState.override_reason || ""}
                    onChange={(e) =>
                      setWaccState({ ...waccState, override_reason: e.target.value })
                    }
                    className="w-full bg-[#0c1220] border border-slate-800 rounded p-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-[#0d1322]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-lg shadow-sky-500/20"
          >
            Apply WACC Assumptions
          </button>
        </div>
      </div>
    </div>
  );
}
