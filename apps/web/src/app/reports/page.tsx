"use client";

import { useState } from "react";
import { FileText, Printer, Download, Eye, ExternalLink, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";

export default function ReportsPage() {
  const [symbol, setSymbol] = useState("TCS");
  const [generating, setGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setReportPreview(null);
    try {
      // 1. Fetch live calculation for symbol
      const [quote, hist] = await Promise.all([
        api.getQuote(symbol).catch(() => null),
        api.getHistoricalFinancials(symbol).catch(() => []),
      ]);
      const latest = hist.length > 0 ? hist[hist.length - 1] : undefined;
      const baseRev = latest ? latest.revenue : 240893.0;
      const shares = latest ? latest.diluted_shares : 361.8;
      const cash = latest ? latest.cash_and_equivalents : 14782.0;

      const calcRes = await api.calculateDCF({
        symbol,
        reporting_currency: "INR",
        reporting_unit: "crore",
        base_revenue: baseRev,
        diluted_shares: shares,
        cash_and_equivalents: cash,
        total_debt: 0.0,
        minority_interest: 820.0,
        other_senior_claims: 0.0,
        terminal_growth_rate_pct: 5.0,
        wacc_input: {
          risk_free_rate_pct: 7.10,
          equity_risk_premium_pct: 6.50,
          beta: 1.0,
          pre_tax_cost_of_debt_pct: 8.0,
          effective_tax_rate_pct: 25.17,
          weight_equity_pct: 90.0,
          weight_debt_pct: 10.0,
        },
        forecasts: [
          {
            year_index: 1,
            year_label: "FY25E",
            revenue_growth_pct: 9.0,
            ebit_margin_pct: 24.5,
            tax_rate_pct: 25.17,
            capex_pct_of_rev: 1.5,
            dna_pct_of_rev: 2.1,
            nwc_change_pct_of_rev: 1.0,
          },
          {
            year_index: 2,
            year_label: "FY26E",
            revenue_growth_pct: 9.0,
            ebit_margin_pct: 24.5,
            tax_rate_pct: 25.17,
            capex_pct_of_rev: 1.5,
            dna_pct_of_rev: 2.1,
            nwc_change_pct_of_rev: 1.0,
          },
          {
            year_index: 3,
            year_label: "FY27E",
            revenue_growth_pct: 8.5,
            ebit_margin_pct: 24.0,
            tax_rate_pct: 25.17,
            capex_pct_of_rev: 1.5,
            dna_pct_of_rev: 2.1,
            nwc_change_pct_of_rev: 1.0,
          },
          {
            year_index: 4,
            year_label: "FY28E",
            revenue_growth_pct: 8.0,
            ebit_margin_pct: 24.0,
            tax_rate_pct: 25.17,
            capex_pct_of_rev: 1.5,
            dna_pct_of_rev: 2.1,
            nwc_change_pct_of_rev: 1.0,
          },
          {
            year_index: 5,
            year_label: "FY29E",
            revenue_growth_pct: 7.5,
            ebit_margin_pct: 23.5,
            tax_rate_pct: 25.17,
            capex_pct_of_rev: 1.5,
            dna_pct_of_rev: 2.1,
            nwc_change_pct_of_rev: 1.0,
          },
        ],
        current_market_price: quote?.current_price || 4125.50,
      });

      const report = await api.generateReport({
        company_name: symbol === "TCS" ? "Tata Consultancy Services Limited" : symbol === "INFY" ? "Infosys Limited" : symbol,
        symbol,
        exchange: "NSE",
        valuation_result: calcRes,
      });

      setReportPreview(report.html_document);
    } catch (err: any) {
      alert("Failed to generate report: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportPreview) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportPreview);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" />
          Institutional Valuation Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate print-ready equity research memoranda, audited valuation models, and exportable PDFs.
        </p>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-slate-300">Select Entity:</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-[#0c1220] border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="TCS">TCS (Tata Consultancy Services)</option>
              <option value="INFY">INFY (Infosys Limited)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>{generating ? "Generating..." : "Generate Research Memo"}</span>
            </button>
            {reportPreview && (
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HTML Report Live Preview */}
      {reportPreview ? (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">
          <iframe
            srcDoc={reportPreview}
            className="w-full h-[800px] border-none"
            title="Valuation Report Preview"
          />
        </div>
      ) : (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Report Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Select a company symbol above and click "Generate Research Memo" to view the complete institutional valuation report.
          </p>
        </div>
      )}
    </div>
  );
}
