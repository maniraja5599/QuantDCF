"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  Company,
  MarketQuote,
  HistoricalStatement,
  DCFCalculationInput,
  DCFCalculationOutput,
  WACCAssumptions,
  ForecastYearInput,
  SensitivityMatrix,
  ScenarioResult,
} from "@/lib/types";
import { ValuationSummaryCard } from "@/components/dcf/valuation-summary-card";
import { HistoricalFinancialsTable } from "@/components/dcf/historical-financials-table";
import { ForecastAssumptionsForm } from "@/components/dcf/forecast-assumptions-form";
import { WACCCalculatorModal } from "@/components/dcf/wacc-calculator-modal";
import { CashflowProjectionTable } from "@/components/dcf/cashflow-projection-table";
import { SensitivityMatrixTable } from "@/components/dcf/sensitivity-matrix";
import { ScenarioSelector } from "@/components/dcf/scenario-selector";
import { ValuationBridgeChart } from "@/components/dcf/bridge-chart";
import { CashflowTrajectoryChart } from "@/components/dcf/cashflow-chart";
import { StatementUploader } from "@/components/dcf/statement-uploader";
import { AuditFormulaPanel } from "@/components/dcf/audit-formula-panel";
import {
  Bookmark,
  FileDown,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatCrore, formatINR } from "@/lib/formatters";

export default function CompanyValuationPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string || "TCS").toUpperCase();

  const [company, setCompany] = useState<Company | null>(null);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [historical, setHistorical] = useState<HistoricalStatement[]>([]);
  const [output, setOutput] = useState<DCFCalculationOutput | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityMatrix | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WACC Modal state
  const [isWaccModalOpen, setIsWaccModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"model" | "historical" | "sensitivity" | "scenarios" | "upload" | "audit">("model");

  // Save Modal state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Forecast state
  const [terminalGrowth, setTerminalGrowth] = useState<number>(5.0);
  const [waccAssumptions, setWaccAssumptions] = useState<WACCAssumptions>({
    risk_free_rate_pct: 7.10,
    equity_risk_premium_pct: 6.50,
    beta: 1.0,
    pre_tax_cost_of_debt_pct: 8.0,
    effective_tax_rate_pct: 25.17,
    weight_equity_pct: 90.0,
    weight_debt_pct: 10.0,
  });

  const [forecasts, setForecasts] = useState<ForecastYearInput[]>([
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
  ]);

  // Execute Calculation Engine
  const runEngine = useCallback(
    async (
      fInputs: ForecastYearInput[],
      wInput: WACCAssumptions,
      tGrowth: number,
      latestStmt?: HistoricalStatement,
      mQuote?: MarketQuote | null
    ) => {
      setRecalculating(true);
      setError(null);
      try {
        const baseRev = latestStmt
          ? latestStmt.revenue
          : mQuote?.market_cap
          ? mQuote.market_cap * 0.35
          : 50000.0;
        const shares = latestStmt
          ? latestStmt.diluted_shares
          : mQuote?.diluted_shares || 100.0;
        const cash = latestStmt ? latestStmt.cash_and_equivalents : 0.0;
        const debt = latestStmt ? latestStmt.total_debt : 0.0;
        const minority = latestStmt ? latestStmt.minority_interest : 0.0;
        const cmp = mQuote ? mQuote.current_price : undefined;

        const payload: DCFCalculationInput = {
          symbol,
          reporting_currency: "INR",
          reporting_unit: "crore",
          base_revenue: baseRev,
          diluted_shares: shares,
          cash_and_equivalents: cash,
          total_debt: debt,
          minority_interest: minority,
          other_senior_claims: 0.0,
          terminal_growth_rate_pct: tGrowth,
          wacc_input: wInput,
          forecasts: fInputs,
          current_market_price: cmp,
        };

        const [dcfRes, sensRes, scenRes] = await Promise.all([
          api.calculateDCF(payload),
          api.calculateSensitivity(payload).catch(() => null),
          api.calculateScenarios(payload).catch(() => []),
        ]);

        setOutput(dcfRes);
        setSensitivity(sensRes);
        setScenarios(scenRes);
      } catch (err: any) {
        setError(err.message || "Failed to execute DCF calculation");
      } finally {
        setRecalculating(false);
      }
    },
    [symbol]
  );

  // Initial Data Load
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [prof, q, hist] = await Promise.all([
          api.getCompanyProfile(symbol).catch(() => null),
          api.getQuote(symbol).catch(() => null),
          api.getHistoricalFinancials(symbol).catch(() => []),
        ]);

        setCompany(prof);
        setQuote(q);
        setHistorical(hist);

        const latest = hist.length > 0 ? hist[hist.length - 1] : undefined;

        // Auto-seed forecasts from latest historical margins if available
        let initForecasts = forecasts;
        if (latest) {
          initForecasts = forecasts.map((f) => ({
            ...f,
            ebit_margin_pct: round2(latest.ebit_margin_pct),
            tax_rate_pct: round2(latest.effective_tax_rate_pct || 25.17),
          }));
          setForecasts(initForecasts);
        }

        await runEngine(initForecasts, waccAssumptions, terminalGrowth, latest, q);
      } catch (err: any) {
        setError(err.message || "Initialization error");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [symbol]);

  const handleUpdateForecast = (index: number, field: keyof ForecastYearInput, value: number) => {
    setForecasts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplyWacc = (updated: WACCAssumptions) => {
    setWaccAssumptions(updated);
    const latest = historical.length > 0 ? historical[historical.length - 1] : undefined;
    runEngine(forecasts, updated, terminalGrowth, latest, quote);
  };

  const handleStatementsUploaded = (statements: HistoricalStatement[]) => {
    setHistorical(statements);
    setActiveTab("historical");
    const latest = statements[statements.length - 1];
    runEngine(forecasts, waccAssumptions, terminalGrowth, latest, quote);
  };

  const handleSaveModel = async () => {
    if (!output) return;
    setIsSaving(true);
    try {
      await api.saveValuation({
        title: `${symbol} DCF Model (${terminalGrowth}% g)`,
        company_symbol: symbol,
        company_name: company?.name || symbol,
        calculated_intrinsic_value: output.intrinsic_value_per_share,
        market_price_at_calc: output.current_market_price,
        implied_upside_downside_pct: output.implied_upside_downside_pct,
        model_inputs: {
          wacc: waccAssumptions,
          forecasts,
          terminal_growth: terminalGrowth,
        },
        model_outputs: output,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save valuation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportReport = async () => {
    if (!output) return;
    try {
      const res = await api.generateReport({
        company_name: company?.name || symbol,
        symbol,
        exchange: company?.exchange || "NSE",
        valuation_result: output,
        scenarios,
      });
      // Open print window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(res.html_document);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      alert("Report export failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-sky-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-semibold tracking-wider font-mono uppercase">
          Synthesizing Audited Statements & Computing DCF Model...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Company Identity & Action Header */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-sky-400 font-mono tracking-tight">
              {symbol}
            </span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono font-bold">
              {company?.exchange || "NSE"}
            </span>
            {historical.length > 0 && historical[0].provenance === "AUDITED" ? (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Audited Annual Disclosures
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded font-semibold">
                Manual / Upload Mode
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-100">{company?.name || symbol}</h1>
          <div className="text-xs text-slate-400 flex items-center gap-4">
            <span>Sector: <strong className="text-slate-300">{company?.sector || "General"}</strong></span>
            <span>Industry: <strong className="text-slate-300">{company?.industry || "Equities"}</strong></span>
            {company?.isin && <span>ISIN: <strong className="text-slate-300 font-mono">{company.isin}</strong></span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveModel}
            disabled={isSaving}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all"
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Model Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Valuation</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportReport}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Institutional Memo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main KPI Summary Card */}
      {output && (
        <ValuationSummaryCard
          output={output}
          quote={quote}
          onOpenWaccModal={() => setIsWaccModalOpen(true)}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab("model")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "model"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" /> DCF Forecast & Visualizations
        </button>
        <button
          onClick={() => setActiveTab("historical")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "historical"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" /> Audited Historical Statements
        </button>
        <button
          onClick={() => setActiveTab("sensitivity")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "sensitivity"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Sensitivity Matrix (WACC vs g)
        </button>
        <button
          onClick={() => setActiveTab("scenarios")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "scenarios"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Bull / Base / Bear Scenarios
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Mathematical Audit Trail
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "upload"
              ? "border-sky-400 text-sky-400"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          Upload Statements (CSV/XLSX)
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "model" && output && (
        <div className="space-y-8 animate-in fade-in">
          {/* Forecast Assumptions Form */}
          <ForecastAssumptionsForm
            forecasts={forecasts}
            terminalGrowthPct={terminalGrowth}
            onUpdateForecast={handleUpdateForecast}
            onUpdateTerminalGrowth={(val) => {
              setTerminalGrowth(val);
              const latest = historical.length > 0 ? historical[historical.length - 1] : undefined;
              runEngine(forecasts, waccAssumptions, val, latest, quote);
            }}
            onRecalculate={() => {
              const latest = historical.length > 0 ? historical[historical.length - 1] : undefined;
              runEngine(forecasts, waccAssumptions, terminalGrowth, latest, quote);
            }}
            isLoading={recalculating}
          />

          {/* Cashflow Projection Table */}
          <CashflowProjectionTable output={output} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValuationBridgeChart output={output} />
            <CashflowTrajectoryChart output={output} />
          </div>
        </div>
      )}

      {activeTab === "historical" && (
        <div className="space-y-8 animate-in fade-in">
          <HistoricalFinancialsTable statements={historical} />
        </div>
      )}

      {activeTab === "sensitivity" && (
        <div className="space-y-8 animate-in fade-in">
          <SensitivityMatrixTable data={sensitivity} />
        </div>
      )}

      {activeTab === "scenarios" && (
        <div className="space-y-8 animate-in fade-in">
          <ScenarioSelector scenarios={scenarios} />
        </div>
      )}

      {activeTab === "audit" && output && (
        <div className="space-y-8 animate-in fade-in">
          <AuditFormulaPanel output={output} />
        </div>
      )}

      {activeTab === "upload" && (
        <div className="space-y-8 animate-in fade-in">
          <StatementUploader onStatementsUploaded={handleStatementsUploaded} />
        </div>
      )}

      {/* WACC Calculator Modal */}
      <WACCCalculatorModal
        isOpen={isWaccModalOpen}
        onClose={() => setIsWaccModalOpen(false)}
        assumptions={waccAssumptions}
        onApply={handleApplyWacc}
      />
    </div>
  );
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}
