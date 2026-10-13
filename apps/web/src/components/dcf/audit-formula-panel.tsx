"use client";

import { DCFCalculationOutput } from "@/lib/types";
import { Calculator, CheckCircle2 } from "lucide-react";

interface AuditFormulaPanelProps {
  output: DCFCalculationOutput;
}

export function AuditFormulaPanel({ output }: AuditFormulaPanelProps) {
  const formulas = output.intermediate_formulas || {};

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            Mathematical Audit Trail & Step-by-Step Transparency
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Explicit intermediate steps, mathematical formulas, and reconciliation proofs.
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          Model Engine: v{output.model_version}
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {Object.entries(formulas).map(([key, formula]) => (
          <div
            key={key}
            className="p-3 bg-[#0c1220] rounded-lg border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2"
          >
            <span className="font-sans font-semibold uppercase text-[11px] text-slate-400">
              {key.replace(/_/g, " ")}:
            </span>
            <span className="text-sky-300 font-bold bg-[#080d18] px-3 py-1 rounded border border-slate-800/60 overflow-x-auto text-[11px]">
              {formula}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
