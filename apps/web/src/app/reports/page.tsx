"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  FileText,
  Printer,
  Download,
  Eye,
  Search,
  ChevronDown,
  Check,
  Building2,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api-client";

import { ALL_NIFTY_COMPANIES } from "@/lib/companies-catalog";

interface CompanyOption {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

const CATALOG_COMPANIES: CompanyOption[] = ALL_NIFTY_COMPANIES.map((c) => ({
  symbol: c.symbol,
  name: c.name,
  sector: c.sector,
  exchange: c.exchange || "NSE",
}));

const SECTOR_FILTERS = ["All", "Information Technology", "Financial Services", "Automobile and Auto Components", "Fast Moving Consumer Goods", "Oil, Gas & Consumable Fuels", "Healthcare", "Metals & Mining", "Power", "Telecommunication"];

export default function ReportsPage() {
  const [symbol, setSymbol] = useState("TCS");
  const [generating, setGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  // Search & Combobox states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCompany = useMemo(
    () => CATALOG_COMPANIES.find((c) => c.symbol === symbol) || CATALOG_COMPANIES[0],
    [symbol]
  );

  // Filtered companies based on search input and sector filter across 501 companies
  const filteredCompanies = useMemo(() => {
    return CATALOG_COMPANIES.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === "All" ||
        item.sector === selectedSector ||
        item.sector.toLowerCase().includes(selectedSector.toLowerCase());

      return matchesQuery && matchesSector;
    });
  }, [searchQuery, selectedSector]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opening dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setSelectedSector("All");
    }
  }, [isDropdownOpen]);

  const handleSelect = (item: CompanyOption) => {
    setSymbol(item.symbol);
    setIsDropdownOpen(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setReportPreview(null);
    try {
      // 1. Fetch live quotes and audited filings
      const [quote, hist, comp] = await Promise.all([
        api.getQuote(symbol).catch(() => null),
        api.getHistoricalFinancials(symbol).catch(() => []),
        api.getCompanyProfile(symbol).catch(() => null),
      ]);

      const latest = hist.length > 0 ? hist[hist.length - 1] : undefined;
      const baseRev = latest
        ? latest.revenue
        : quote?.market_cap
        ? quote.market_cap * 0.35
        : 15000.0;
      const shares = latest
        ? latest.diluted_shares
        : quote?.diluted_shares
        ? quote.diluted_shares
        : (quote?.market_cap && quote?.current_price)
        ? Math.round(quote.market_cap / quote.current_price)
        : 100.0;
      const cash = latest ? latest.cash_and_equivalents : 0.0;
      const debt = latest ? latest.total_debt : 0.0;
      const minority = latest ? latest.minority_interest : 0.0;
      const cmp = quote?.current_price || 100.0;

      const ebitM = latest?.ebit_margin_pct ? Number(latest.ebit_margin_pct.toFixed(2)) : 22.5;
      const taxR = latest?.effective_tax_rate_pct ? Number(latest.effective_tax_rate_pct.toFixed(2)) : 25.17;

      const calcRes = await api.calculateDCF({
        symbol,
        reporting_currency: "INR",
        reporting_unit: "crore",
        base_revenue: baseRev,
        diluted_shares: shares,
        cash_and_equivalents: cash,
        total_debt: debt,
        minority_interest: minority,
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
        forecasts: [9.0, 9.0, 8.5, 8.0, 7.5].map((g, i) => ({
          year_index: i + 1,
          year_label: `FY${25 + i}E`,
          revenue_growth_pct: g,
          ebit_margin_pct: ebitM,
          tax_rate_pct: taxR,
          capex_pct_of_rev: 1.5,
          dna_pct_of_rev: 2.1,
          nwc_change_pct_of_rev: 1.0,
        })),
        current_market_price: cmp,
      });

      const report = await api.generateReport({
        company_name: comp?.name || selectedCompany.name,
        symbol,
        exchange: selectedCompany.exchange || "NSE",
        valuation_result: calcRes,
      });

      if (report?.html_document) {
        setReportPreview(report.html_document);
      } else {
        alert("Report generation returned an empty document.");
      }
    } catch (err: any) {
      alert("Failed to generate report: " + (err.message || "Unknown error"));
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
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Institutional Valuation Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generate print-ready equity research memoranda, audited valuation models, and exportable PDFs.
        </p>
      </div>

      {/* Entity Selector & Generator Card */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Searchable Entity Combobox */}
          <div className="flex-1 max-w-md relative" ref={dropdownRef}>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Select Entity (17 Indian Equities):
            </label>

            {/* Combobox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-xl px-3 py-2 text-left flex items-center justify-between gap-2 transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono font-bold text-xs text-sky-700 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 shrink-0">
                  {selectedCompany.symbol}
                </span>
                <span className="text-xs text-slate-900 dark:text-slate-200 font-semibold truncate">
                  {selectedCompany.name}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-sky-600 dark:text-sky-400" : ""
                }`}
              />
            </button>

            {/* Search Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0f1628] border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {/* Search Input Filter */}
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f1d] relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol, company name, or sector..."
                    className="w-full bg-white dark:bg-[#141b2d] border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                  />
                </div>

                {/* Quick Sector Filter Chips */}
                <div className="px-2.5 py-1.5 bg-slate-100/70 dark:bg-[#0d1322] border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                  {SECTOR_FILTERS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSector(sec)}
                      className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                        selectedSector === sec
                          ? "bg-sky-500 text-slate-950 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                {/* Company Options List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-1">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((comp) => {
                      const isSelected = comp.symbol === symbol;
                      return (
                        <button
                          key={comp.symbol}
                          type="button"
                          onClick={() => handleSelect(comp)}
                          className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                            isSelected
                              ? "bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-[11px] text-sky-700 dark:text-sky-400 w-14 shrink-0">
                              {comp.symbol}
                            </span>
                            <div className="truncate">
                              <div className="truncate text-xs font-medium text-slate-900 dark:text-slate-200">
                                {comp.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                                {comp.sector}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      No companies match "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-auto pt-2 md:pt-0">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-sky-500/20 hover-lift active-press shimmer-sweep group"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 group-hover:scale-115 transition-transform" />
                  <span>Generate Research Memo</span>
                </>
              )}
            </button>
            {reportPreview && (
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all hover-lift active-press shimmer-sweep group"
              >
                <Printer className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
                <span>Print / PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HTML Report Live Preview */}
      {reportPreview ? (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in">
          <iframe
            srcDoc={reportPreview}
            className="w-full h-[800px] border-none"
            title="Valuation Report Preview"
          />
        </div>
      ) : (
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-8 sm:p-10 text-center text-slate-400">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-slate-200">No Report Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Search or select any of the 17 blue-chip Indian equities above and click "Generate Research Memo" to view the complete institutional valuation report.
          </p>
        </div>
      )}
    </div>
  );
}
