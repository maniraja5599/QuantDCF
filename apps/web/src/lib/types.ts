export type Currency = 'INR' | 'USD';
export type Unit = 'crore' | 'lakh' | 'million' | 'billion' | 'absolute';

export interface Company {
  symbol: string;
  name: string;
  exchange: string;
  isin?: string;
  sector?: string;
  industry?: string;
  has_audited_filings: boolean;
  reporting_currency: string;
  reporting_unit: string;
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
  is_verified: boolean;
  licensing_tier: string;
  licensing_notice: string;
}

export interface HistoricalStatement {
  fiscal_year: number;
  fiscal_period: string;
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
  reporting_unit: string;
  reporting_currency: string;
  provenance: 'AUDITED' | 'REPORTED' | 'ESTIMATED' | 'USER_ENTERED';
  source_document?: string;
  source_url?: string;
  retrieval_timestamp: string;
}

export interface WACCAssumptions {
  risk_free_rate_pct: number;
  equity_risk_premium_pct: number;
  beta: number;
  pre_tax_cost_of_debt_pct: number;
  effective_tax_rate_pct: number;
  weight_equity_pct: number;
  weight_debt_pct: number;
  manual_wacc_override?: number;
  override_reason?: string;
}

export interface ForecastYearInput {
  year_index: number;
  year_label: string;
  revenue_growth_pct: number;
  ebit_margin_pct: number;
  tax_rate_pct: number;
  capex_pct_of_rev: number;
  dna_pct_of_rev: number;
  nwc_change_pct_of_rev: number;
}

export interface DCFCalculationInput {
  symbol: string;
  reporting_currency: string;
  reporting_unit: string;
  base_revenue: number;
  diluted_shares: number;
  cash_and_equivalents: number;
  total_debt: number;
  minority_interest: number;
  other_senior_claims: number;
  terminal_growth_rate_pct: number;
  wacc_input: WACCAssumptions;
  forecasts: ForecastYearInput[];
  current_market_price?: number;
  use_mid_year_convention?: boolean;
}

export interface ProjectedYearResult {
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

export interface WarningFlag {
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  code: string;
  message: string;
}

export interface DCFCalculationOutput {
  model_version: string;
  symbol: string;
  reporting_currency: string;
  reporting_unit: string;
  calculated_at: string;
  forecast_years: ProjectedYearResult[];
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
  flags: WarningFlag[];
  intermediate_formulas: Record<string, string>;
}

export interface SensitivityMatrix {
  base_wacc_pct: number;
  base_growth_pct: number;
  base_intrinsic_value: number;
  wacc_rates_pct: number[];
  terminal_growth_rates_pct: number[];
  matrix: (number | null)[][];
}

export interface ScenarioResult {
  scenario_name: string;
  description: string;
  wacc_pct: number;
  terminal_growth_rate_pct: number;
  revenue_cagr_pct: number;
  terminal_ebit_margin_pct: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
  implied_upside_downside_pct?: number;
}

export interface ProviderStatus {
  id: string;
  name: string;
  provider_type: string;
  description: string;
  is_enabled: boolean;
  is_license_approved: boolean;
  compliance_notice: string;
  documentation_url?: string;
  endpoint_url?: string;
}

export interface SavedValuation {
  id: string;
  title: string;
  company_symbol: string;
  company_name: string;
  calculated_intrinsic_value: number;
  market_price_at_calc?: number;
  implied_upside_downside_pct?: number;
  model_inputs: any;
  model_outputs: any;
  created_at: string;
  updated_at: string;
}
