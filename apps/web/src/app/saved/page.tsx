"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Calculator, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { SavedValuation } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/formatters";

export default function SavedValuationsPage() {
  const [valuations, setValuations] = useState<SavedValuation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.listSavedValuations();
        setValuations(res);
      } catch (err) {
        console.error("Failed to load saved valuations", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved valuation?")) return;
    try {
      await api.deleteSavedValuation(id);
      setValuations((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete saved valuation");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-sky-400" />
          Saved Valuation Models
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, compare, and reopen previously saved DCF equity models and customized assumptions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-sky-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : valuations.length === 0 ? (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Saved Valuations Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Launch any company in the valuation terminal, tweak your WACC or forecast assumptions, and click "Save Valuation".
          </p>
          <Link
            href="/valuation/TCS"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
          >
            <Calculator className="w-4 h-4" />
            <span>Launch Valuation Model</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valuations.map((v) => (
            <div
              key={v.id}
              className="bg-[#111726] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-extrabold text-sky-400">
                    {v.company_symbol}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 truncate">{v.title}</h3>
                <p className="text-[11px] text-slate-400">{v.company_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  Calculated Intrinsic Value
                </div>
                <div className="text-2xl font-extrabold text-slate-100 font-mono">
                  {formatINR(v.calculated_intrinsic_value)}
                </div>
                {v.implied_upside_downside_pct !== undefined && (
                  <div
                    className={`text-xs font-mono font-bold ${
                      v.implied_upside_downside_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatPercent(v.implied_upside_downside_pct)} Implied
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs"
                  title="Delete Valuation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/valuation/${v.company_symbol}`}
                  className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-sky-500/20 text-xs transition-all"
                >
                  <span>Reopen Model</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
