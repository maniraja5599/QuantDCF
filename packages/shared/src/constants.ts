/**
 * Indian Equity Macro & Valuation Benchmarks
 */

export const INDIAN_MARKET_BENCHMARKS = {
  // Benchmark 10-Year Indian Government Securities (G-Sec) Yield (approx ~7.10%)
  DEFAULT_RISK_FREE_RATE_PCT: 7.10,
  
  // Historical Equity Risk Premium (ERP) for Indian Equities
  DEFAULT_EQUITY_RISK_PREMIUM_PCT: 6.50,
  
  // Standard Indian Corporate Tax Rate (Base 22% + Surcharge 10% + Cess 4% = 25.17%)
  DEFAULT_CORPORATE_TAX_RATE_PCT: 25.17,
  
  // Sustainable long-term nominal GDP growth rate cap for India (terminal growth rate default)
  DEFAULT_TERMINAL_GROWTH_RATE_PCT: 5.0,
  
  // Max realistic terminal growth rate without triggering macroeconomic warning
  MAX_RECOMMENDED_TERMINAL_GROWTH_RATE_PCT: 6.5,
  
  // Standard forecast horizon in years
  DEFAULT_FORECAST_HORIZON_YEARS: 5,
};

export const VALUATION_DISCLAIMER = 
  "DISCLAIMER: This DCF Valuation model is an analytical tool built for educational and financial research purposes. " +
  "Intrinsic value calculations are mathematical projections derived from user-specified or extracted historical assumptions " +
  "and do NOT constitute an investment recommendation, financial advice, buy/sell rating, or guaranteed target price. " +
  "Past financial performance does not guarantee future results.";
