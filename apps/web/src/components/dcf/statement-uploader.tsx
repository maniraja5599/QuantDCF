"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { HistoricalStatement } from "@/lib/types";

interface StatementUploaderProps {
  onStatementsUploaded: (statements: HistoricalStatement[]) => void;
}

export function StatementUploader({ onStatementsUploaded }: StatementUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessCount(null);

    try {
      const parsed = await api.uploadStatement(file);
      setSuccessCount(parsed.length);
      onStatementsUploaded(parsed);
    } catch (err: any) {
      setError(err.message || "Failed to parse audited statements file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            Upload Audited Financial Statements
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Import verified company annual reports or Excel model statements (.xlsx, .csv).
          </p>
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700/80 hover:border-sky-500/60 rounded-xl p-8 text-center cursor-pointer transition-all bg-[#0c1220]/60 hover:bg-slate-800/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-sky-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold">Parsing audited statement line items...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-500" />
            <div className="text-xs font-semibold text-slate-300">
              Click to select or drag and drop financial statements
            </div>
            <div className="text-[11px] text-slate-500">
              Supports CSV & Excel (.xlsx) formats. Automatically normalizes Revenue, EBIT, CapEx, NWC & Cash.
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successCount && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Successfully extracted and normalized {successCount} audited fiscal periods.</span>
        </div>
      )}
    </div>
  );
}
