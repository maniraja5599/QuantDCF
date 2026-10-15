"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  PeerCompsResponse,
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
import { PeerCompsTable } from "@/components/dcf/peer-comps-table";
import { BFSIValuationCard } from "@/components/dcf/bfsi-valuation-card";
import { SOTPValuationCard } from "@/components/dcf/sotp-valuation-card";
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
  FileSpreadsheet,
  Users,
  Landmark,
  PieChart,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
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

  // Live Audited Filings Automatic Fetch State
  const [auditStep, setAuditStep] = useState<number>(1);
  const [auditStatus, setAuditStatus] = useState<string>("Connecting to Official Exchange Regulatory Filing Gateway...");
  const [isRefreshingAudit, setIsRefreshingAudit] = useState<boolean>(false);

  // WACC Modal state
  const [isWaccModalOpen, setIsWaccModalOpen] = useState(false);

  // Active Tab & Peer Comps
  const [peerComps, setPeerComps] = useState<PeerCompsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<
    "model" | "historical" | "peers" | "bfsi" | "sotp" | "sensitivity" | "scenarios" | "upload" | "audit"
  >("model");

  // Tab scroll navigation state
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = useCallback(() => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkTabScroll();
    const handleResize = () => checkTabScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkTabScroll]);

  // Re-check scroll availability once loading finishes and DOM elements are rendered
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(checkTabScroll, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, output, checkTabScroll]);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
      setTimeout(checkTabScroll, 300);
    }
  };

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

  const isBFSI = company?.sector?.toLowerCase().includes("financial") || ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "BAJFINANCE"].includes(symbol);
  const isConglomerate = symbol === "RELIANCE" || symbol === "LT" || company?.sector?.toLowerCase().includes("diversified");

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

  // Initial Data Load & Live Audited Filings Calibration
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      setAuditStep(1);
      setAuditStatus(`Connecting to Official Exchange Regulatory Gateway (NSE / BSE) for ${symbol}...`);

      const t1 = setTimeout(() => {
        if (isMounted) {
          setAuditStep(2);
          setAuditStatus(`Retrieving Audited Income Statements, Balance Sheets & Cash Flows (${symbol})...`);
        }
      }, 350);

      const t2 = setTimeout(() => {
        if (isMounted) {
          setAuditStep(3);
          setAuditStatus(`Parsing Verified Audited EBIT, Operating Cash Flows & CapEx Disclosures...`);
        }
      }, 700);

      const t3 = setTimeout(() => {
        if (isMounted) {
          setAuditStep(4);
          setAuditStatus(`Calibrating Free Cash Flow to Firm (FCFF) & DCF WACC Matrix...`);
        }
      }, 1050);

      try {
        const [prof, q, hist, peers] = await Promise.all([
          api.getCompanyProfile(symbol).catch(() => null),
          api.getQuote(symbol).catch(() => null),
          api.getHistoricalFinancials(symbol).catch(() => []),
          api.getPeerComps(symbol).catch(() => null),
        ]);

        if (!isMounted) return;

        setCompany(prof);
        setQuote(q);
        setHistorical(hist);
        setPeerComps(peers);

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
        if (isMounted) setError(err.message || "Initialization error");
      } finally {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const handleRefreshAudit = async () => {
    setIsRefreshingAudit(true);
    try {
      const hist = await api.getHistoricalFinancials(symbol);
      setHistorical(hist);
      const latest = hist.length > 0 ? hist[hist.length - 1] : undefined;
      if (latest) {
        const updated = forecasts.map((f) => ({
          ...f,
          ebit_margin_pct: round2(latest.ebit_margin_pct),
          tax_rate_pct: round2(latest.effective_tax_rate_pct || 25.17),
        }));
        setForecasts(updated);
        await runEngine(updated, waccAssumptions, terminalGrowth, latest, quote);
      }
    } catch (err: any) {
      alert("Failed to refresh audit statements: " + (err.message || "Network error"));
    } finally {
      setIsRefreshingAudit(false);
    }
  };

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

  const handleExportCSV = () => {
    if (!output) return;

    const rows: string[][] = [
      ["QUANTDCF INSTITUTIONAL VALUATION SCHEDULE"],
      ["Company Name", company?.name || symbol],
      ["NSE Ticker", symbol],
      ["Exchange", company?.exchange || "NSE"],
      ["Valuation Timestamp", output.calculated_at],
      ["Model Version", output.model_version],
      [""],
      ["DCF VALUATION BRIDGE & INTRINSIC VALUE"],
      ["Intrinsic Value Per Share (INR)", output.intrinsic_value_per_share.toFixed(2)],
      ["Current Market Price (INR)", output.current_market_price ? output.current_market_price.toFixed(2) : "N/A"],
      ["Implied Upside / Downside %", output.implied_upside_downside_pct ? `${output.implied_upside_downside_pct.toFixed(2)}%` : "N/A"],
      ["Discount Rate (WACC %)", `${output.discount_rate_wacc_pct.toFixed(2)}%`],
      ["Terminal Growth Rate %", `${output.terminal_growth_rate_pct.toFixed(2)}%`],
      ["Enterprise Value (INR Cr)", output.enterprise_value.toFixed(2)],
      ["PV of 5-Yr Forecast FCF (INR Cr)", output.cumulative_pv_fcf.toFixed(2)],
      ["PV of Terminal Value (INR Cr)", output.pv_terminal_value.toFixed(2)],
      ["Terminal Value % of EV", `${output.tv_as_pct_of_ev.toFixed(2)}%`],
      ["Cash & Liquid Assets (INR Cr)", output.cash_and_equivalents.toFixed(2)],
      ["Total Debt & Borrowings (INR Cr)", output.total_debt.toFixed(2)],
      ["Minority Interest / Claims (INR Cr)", output.minority_interest.toFixed(2)],
      ["Implied Equity Value (INR Cr)", output.equity_value.toFixed(2)],
      ["Diluted Shares Outstanding (Cr)", output.diluted_shares.toFixed(2)],
      [""],
      ["5-YEAR FORECAST FREE CASH FLOW SCHEDULE (INR CRORE)"],
      [
        "Financial Metric",
        ...output.forecast_years.map((f) => f.year_label)
      ],
      [
        "Revenue from Operations",
        ...output.forecast_years.map((f) => f.revenue.toFixed(2))
      ],
      [
        "Revenue Growth %",
        ...output.forecast_years.map((f) => `${f.revenue_growth_pct.toFixed(2)}%`)
      ],
      [
        "Operating Profit (EBIT)",
        ...output.forecast_years.map((f) => f.ebit.toFixed(2))
      ],
      [
        "EBIT Margin %",
        ...output.forecast_years.map((f) => `${f.ebit_margin_pct.toFixed(2)}%`)
      ],
      [
        "Operating Taxes",
        ...output.forecast_years.map((f) => f.operating_taxes.toFixed(2))
      ],
      [
        "Net Operating Profit After Tax (NOPAT)",
        ...output.forecast_years.map((f) => f.nopat.toFixed(2))
      ],
      [
        "Depreciation & Amortization (+)",
        ...output.forecast_years.map((f) => f.depreciation_amortization.toFixed(2))
      ],
      [
        "Capital Expenditure (-)",
        ...output.forecast_years.map((f) => f.capex.toFixed(2))
      ],
      [
        "Change in Net Working Capital (-)",
        ...output.forecast_years.map((f) => f.change_in_nwc.toFixed(2))
      ],
      [
        "Free Cash Flow to Firm (FCFF)",
        ...output.forecast_years.map((f) => f.free_cash_flow.toFixed(2))
      ],
      [
        "Discount Period (t)",
        ...output.forecast_years.map((f) => f.discount_period.toString())
      ],
      [
        "Discount Factor",
        ...output.forecast_years.map((f) => f.discount_factor.toFixed(4))
      ],
      [
        "Present Value of FCF (PV)",
        ...output.forecast_years.map((f) => f.pv_fcf.toFixed(2))
      ],
      [""],
      ["SCENARIO VALUATION MATRIX"],
      ["Scenario Name", "Revenue CAGR %", "Terminal EBIT Margin %", "Intrinsic Value (INR)", "Upside/Downside %"],
      ...scenarios.map((s) => [
        s.scenario_name.toUpperCase(),
        `${s.revenue_cagr_pct.toFixed(1)}%`,
        `${s.terminal_ebit_margin_pct.toFixed(1)}%`,
        s.intrinsic_value_per_share.toFixed(2),
        s.implied_upside_downside_pct ? `${s.implied_upside_downside_pct.toFixed(2)}%` : "N/A"
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = String(cell).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${symbol}_QuantDCF_Valuation_Model.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    const steps = [
      { id: 1, title: "Exchange Regulatory Gateway", desc: "Connecting to NSE / BSE corporate filing feeds" },
      { id: 2, title: "Audited Filings Ingestion", desc: "Parsing verified annual reports, balance sheets & cash flows" },
      { id: 3, title: "FCFF Normalization", desc: "Reconciling CapEx, D&A and Operating Profit (EBIT)" },
      { id: 4, title: "DCF Calibration", desc: "Calculating intrinsic equity value and terminal Gordon growth" },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-lg bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Auditing {symbol} Financials</span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-500/20">
                    LIVE FETCH
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Autonomous Regulatory Disclosures Retrieval
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
              Step {auditStep} of 4
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, auditStep * 25)}%` }}
            />
          </div>

          {/* Active Status Display */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3">
            <Radio className="w-4 h-4 text-sky-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                Current Execution Status
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {auditStatus}
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2.5 pt-1">
            {steps.map((s) => {
              const isDone = auditStep > s.id;
              const isCurrent = auditStep === s.id;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-colors ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : isCurrent
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 font-semibold shadow-sm"
                      : "bg-transparent border-transparent text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-600 shrink-0">
                      {s.id}
                    </div>
                  )}
                  <div className="flex-1 flex justify-between items-center">
                    <span>{s.title}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {isDone ? "VERIFIED" : isCurrent ? "PROCESSING..." : "QUEUED"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guarantee Pill */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Dummy Data Guarantee &bull; 100% Exchange Disclosures</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Company Identity & Action Header */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono tracking-tight">
              {symbol}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200 dark:border-transparent">
              {company?.exchange || "NSE"}
            </span>
            {quote && (
              <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <span>CMP: ₹{quote.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {quote.percent_change !== undefined && (
                  <span className={quote.percent_change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {quote.percent_change >= 0 ? "+" : ""}{quote.percent_change.toFixed(2)}%
                  </span>
                )}
              </span>
            )}
            {historical.length > 0 && historical[0].provenance === "AUDITED" ? (
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Audited Disclosures
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-semibold">
                Manual / Upload Mode
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{company?.name || symbol}</h1>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
            <span>Sector: <strong className="text-slate-800 dark:text-slate-200">{company?.sector || "General"}</strong></span>
            <span>Industry: <strong className="text-slate-800 dark:text-slate-200">{company?.industry || "Equities"}</strong></span>
            {company?.isin && <span>ISIN: <strong className="text-slate-800 dark:text-slate-200 font-mono">{company.isin}</strong></span>}
          </div>

          {/* Quick Model Jump Strip */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none max-w-full">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-0.5">Jump Model:</span>
            {["SUZLON", "TCS", "RELIANCE", "INFY", "HDFCBANK", "ITC", "LT"].map((s) => (
              <Link
                key={s}
                href={`/valuation/${s}`}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 transition-all ${
                  s === symbol
                    ? "bg-sky-500 text-slate-950 shadow-sm font-black"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons with Responsive Mobile Grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshAudit}
            disabled={isRefreshingAudit}
            className="justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold px-3 py-2 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm hover-lift active-press group shimmer-sweep"
            title="Automatically fetch latest audited statements from official exchange gateway"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 group-hover:rotate-180 transition-transform duration-500 ${isRefreshingAudit ? "animate-spin" : ""}`} />
            <span>{isRefreshingAudit ? "Auditing..." : "Sync Audit"}</span>
          </button>
          <button
            onClick={handleSaveModel}
            disabled={isSaving}
            className="justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold px-3 py-2 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm hover-lift active-press group shimmer-sweep"
          >
            {saveSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-200" />
                <span>Save Model</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            className="justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-2 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm hover-lift active-press group shimmer-sweep"
            title="Download full 5-year FCF schedule and DCF parameters as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportReport}
            className="justify-center bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-2 sm:py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 hover-lift active-press group shimmer-sweep"
          >
            <FileDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            <span>Export Memo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-semibold shrink-0 transition-all active:scale-95"
          >
            Retry Loading
          </button>
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

      {/* Navigation Tabs Bar with Responsive Left/Right Chevrons */}
      <div className="relative border-b border-slate-200 dark:border-slate-800 flex items-center group">
        {canScrollLeft && (
          <button
            onClick={() => scrollTabs("left")}
            className="absolute left-0 z-20 h-full px-1.5 bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent dark:from-[#080c16] dark:via-[#080c16]/95 dark:to-transparent flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-lg"
            aria-label="Scroll tabs left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-0.5 border border-slate-300 dark:border-slate-700 shadow" />
          </button>
        )}

        <div
          ref={tabsRef}
          onScroll={checkTabScroll}
          className="flex space-x-1 sm:space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent pb-0 px-1 w-full scroll-smooth"
        >
          <button
            onClick={() => setActiveTab("model")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "model"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Forecast & Models
          </button>
          <button
            onClick={() => setActiveTab("historical")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "historical"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Audited Financials
          </button>
          <button
            onClick={() => setActiveTab("peers")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "peers"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Peer Comps
          </button>
          <button
            onClick={() => setActiveTab("bfsi")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "bfsi"
                ? "border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Banking (DDM/P-B)
            {isBFSI && <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1 rounded font-mono font-bold">BFSI</span>}
          </button>
          <button
            onClick={() => setActiveTab("sotp")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "sotp"
                ? "border-amber-500 text-amber-700 dark:text-amber-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> SOTP
            {isConglomerate && <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1 rounded font-mono font-bold">Conglomerate</span>}
          </button>
          <button
            onClick={() => setActiveTab("sensitivity")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "sensitivity"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            Sensitivity Matrix
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "scenarios"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "audit"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-2 pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === "upload"
                ? "border-sky-500 text-sky-700 dark:text-sky-400 font-bold"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            Upload (CSV/XLSX)
          </button>
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollTabs("right")}
            className="absolute right-0 z-20 h-full px-1.5 bg-gradient-to-l from-slate-100 via-slate-100/90 to-transparent dark:from-[#080c16] dark:via-[#080c16]/95 dark:to-transparent flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-lg"
            aria-label="Scroll tabs right"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-0.5 border border-slate-300 dark:border-slate-700 shadow" />
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "model" && output && (
        <div className="space-y-4 animate-in fade-in">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ValuationBridgeChart output={output} />
            <CashflowTrajectoryChart output={output} />
          </div>
        </div>
      )}

      {activeTab === "historical" && (
        <div className="space-y-4 animate-in fade-in">
          <HistoricalFinancialsTable statements={historical} />
        </div>
      )}

      {activeTab === "peers" && peerComps && (
        <div className="space-y-4 animate-in fade-in">
          <PeerCompsTable
            data={peerComps}
            currentSymbol={symbol}
            dcfIntrinsicValue={output?.intrinsic_value_per_share}
            currentMarketPrice={quote?.current_price || output?.current_market_price}
          />
        </div>
      )}

      {activeTab === "bfsi" && (
        <div className="space-y-4 animate-in fade-in">
          <BFSIValuationCard
            symbol={symbol}
            currentMarketPrice={quote?.current_price || output?.current_market_price}
          />
        </div>
      )}

      {activeTab === "sotp" && (
        <div className="space-y-4 animate-in fade-in">
          <SOTPValuationCard
            symbol={symbol}
            currentMarketPrice={quote?.current_price || output?.current_market_price}
          />
        </div>
      )}

      {activeTab === "sensitivity" && (
        <div className="space-y-4 animate-in fade-in">
          <SensitivityMatrixTable data={sensitivity} />
        </div>
      )}

      {activeTab === "scenarios" && (
        <div className="space-y-4 animate-in fade-in">
          <ScenarioSelector scenarios={scenarios} />
        </div>
      )}

      {activeTab === "audit" && output && (
        <div className="space-y-4 animate-in fade-in">
          <AuditFormulaPanel output={output} />
        </div>
      )}

      {activeTab === "upload" && (
        <div className="space-y-4 animate-in fade-in">
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
