/**
 * Shared Type Definitions for DCF Valuation Platform
 */

export type Currency = 'INR' | 'USD';
export type Unit = 'crore' | 'lakh' | 'million' | 'billion' | 'absolute';

export interface Company {
  id: string;
  symbol: string; // e.g. "TCS", "INFY", "RELIANCE"
  name: string;
  isin?: string;
  sector?: string;
  industry?: string;
  exchange: 'NSE' | 'BSE';
  currency: Currency;
  reporting_unit: Unit;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketQuote {
  symbol: string;
  current_price: number;
  change: number;
  percent_change: number;
  day_high?: number;
  day_low?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  volume?: number;
  market_cap?: number;
  diluted_shares?: number;
  timestamp: string;
  source: string;
  verified: boolean;
  licensing_notice?: string;
}

export type ProvenanceType = 'AUDITED' | 'REPORTED' | 'ESTIMATED' | 'USER_ENTERED';

export interface HistoricalStatement {
  fiscal_year: number; // e.g. 2020, 2021, 2022, 2023, 2024
  fiscal_period: string; // e.g. "FY24"
  revenue: number;
  operating_expenses: number;
  ebit: number;
  ebit_margin_pct: number;
  tax_expense: number;
  effective_tax_rate_pct: number;
  depreciation_amortization: number;
  capex: number;
  working_capital: number;
  change_in_nwc: number;
  cash_and_equivalents: number;
  total_debt: number;
  minority_interest: number;
  diluted_shares: number;
  unit: Unit;
  currency: Currency;
  provenance: ProvenanceType;
  source_doc?: string;
  source_url?: string;
  retrieval_timestamp: string;
}

export interface WACCAssumptions {
  risk_free_rate_pct: number; // e.g. 7.10% (10-year Indian G-Sec yield)
  equity_risk_premium_pct: number; // e.g. 6.50%
  beta: number; // e.g. 1.05
  cost_of_equity_pct?: number; // Calculated: Rf + Beta * ERP
  pre_tax_cost_of_debt_pct: number; // e.g. 8.25%
  effective_tax_rate_pct: number; // e.g. 25.17% (Indian corporate tax rate)
  cost_of_debt_after_tax_pct?: number; // Calculated: Rd * (1 - T)
  weight_equity_pct: number; // e.g. 85.0%
  weight_debt_pct: number; // e.g. 15.0%
  calculated_wacc_pct?: number; // Calculated WACC
  manual_wacc_override?: number;
  override_reason?: string;
}

export interface ForecastYearAssumption {
  year_index: number; // 1 to 5+
  year_label: string; // e.g. "FY25E"
  revenue_growth_pct: number;
  ebit_margin_pct: number;
  tax_rate_pct: number;
  capex_pct_of_rev: number;
  dna_pct_of_rev: number;
  nwc_pct_of_rev: number;
}

export interface DCFForecastAssumptions {
  forecast_years: number; // default 5
  terminal_growth_rate_pct: number; // e.g. 5.0% for India
  wacc: WACCAssumptions;
  forecasts: ForecastYearAssumption[];
  shares_outstanding: number;
  cash_and_equivalents: number;
  total_debt: number;
  minority_interest: number;
  other_senior_claims: number;
}

export interface ProjectedYearCashFlow {
  year_index: number;
  year_label: string;
  revenue: number;
  revenue_growth_pct: number;
  ebit: number;
  ebit_margin_pct: number;
  operating_taxes: number;
  nopat: number;
  depreciation_amortization: number;
  capex: number;
  change_in_nwc: number;
  free_cash_flow: number;
  discount_period: number;
  discount_factor: number;
  pv_fcf: number;
}

export interface DCFValuationResult {
  model_version: string;
  calculated_at: string;
  forecast_years: ProjectedYearCashFlow[];
  cumulative_pv_fcf: number;
  terminal_fcf: number;
  terminal_growth_rate_pct: number;
  discount_rate_wacc_pct: number;
  terminal_value: number;
  pv_terminal_value: number;
  tv_as_pct_of_ev: number;
  enterprise_value: number;
  cash_and_equivalents: number;
  total_debt: number;
  minority_interest: number;
  other_senior_claims: number;
  equity_value: number;
  diluted_shares: number;
  intrinsic_value_per_share: number;
  current_market_price?: number;
  implied_upside_downside_pct?: number;
  flags: ValuationWarningFlag[];
  intermediate_formulas: Record<string, string>;
}

export interface ValuationWarningFlag {
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  code: string;
  message: string;
}

export interface SensitivityMatrix {
  wacc_rates_pct: number[];
  terminal_growth_rates_pct: number[];
  matrix: number[][]; // [wacc_index][growth_index] = intrinsic value
  base_wacc_pct: number;
  base_growth_pct: number;
  base_intrinsic_value: number;
}

export interface ScenarioResult {
  name: 'Bull Case' | 'Base Case' | 'Bear Case';
  terminal_growth_rate_pct: number;
  wacc_pct: number;
  revenue_cagr_pct: number;
  terminal_ebit_margin_pct: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
  upside_downside_pct?: number;
}

export interface ProviderStatus {
  id: string;
  name: string;
  type: 'MARKET_DATA' | 'FUNDAMENTALS' | 'SEARCH' | 'DOCUMENT_PARSER';
  status: 'ONLINE' | 'OFFLINE' | 'RESTRICTED' | 'MOCK_ONLY';
  licensing_approved: boolean;
  legal_notice: string;
  last_check_timestamp: string;
  endpoint_url?: string;
  rate_limit?: string;
}
