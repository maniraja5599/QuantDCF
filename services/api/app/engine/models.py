"""
Pydantic Schemas and Validation Models for DCF Valuation Engine
"""
from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class WACCInput(BaseModel):
    risk_free_rate_pct: float = Field(
        ...,
        description="Risk-free rate (e.g. 10Y Indian G-Sec Yield, ~7.1%)",
        ge=0.0,
        le=30.0
    )
    equity_risk_premium_pct: float = Field(
        ...,
        description="Market equity risk premium (ERP) for Indian equities (~6.0-7.0%)",
        ge=0.0,
        le=30.0
    )
    beta: float = Field(
        ...,
        description="Levered Beta of the stock",
        ge=0.0,
        le=5.0
    )
    pre_tax_cost_of_debt_pct: float = Field(
        default=8.5,
        description="Effective borrowing interest rate or pre-tax cost of debt",
        ge=0.0,
        le=40.0
    )
    effective_tax_rate_pct: float = Field(
        default=25.17,
        description="Corporate tax rate (India base + surcharge + cess is 25.17%)",
        ge=0.0,
        le=50.0
    )
    weight_equity_pct: float = Field(
        ...,
        description="Equity percentage of capital structure",
        ge=0.0,
        le=100.0
    )
    weight_debt_pct: float = Field(
        ...,
        description="Debt percentage of capital structure",
        ge=0.0,
        le=100.0
    )
    manual_wacc_override: Optional[float] = Field(
        default=None,
        description="Manual override for final WACC %",
        ge=1.0,
        le=40.0
    )
    override_reason: Optional[str] = Field(
        default=None,
        description="Audit justification for manual override"
    )

    @model_validator(mode="after")
    def validate_weights(self):
        total_weights = self.weight_equity_pct + self.weight_debt_pct
        if abs(total_weights - 100.0) > 0.05:
            raise ValueError(f"Capital structure weights must sum to 100%. Given sum: {total_weights:.2f}%")
        return self


class ForecastYearInput(BaseModel):
    year_index: int = Field(..., ge=1, le=20, description="Forecast year index (1 to N)")
    year_label: str = Field(..., description="Forecast period label, e.g. FY25E")
    revenue_growth_pct: float = Field(..., description="Projected revenue growth rate %", ge=-90.0, le=200.0)
    ebit_margin_pct: float = Field(..., description="Projected EBIT margin %", ge=-100.0, le=100.0)
    tax_rate_pct: float = Field(default=25.17, description="Projected effective tax rate %", ge=0.0, le=60.0)
    capex_pct_of_rev: float = Field(default=4.0, description="CapEx as % of revenue", ge=0.0, le=100.0)
    dna_pct_of_rev: float = Field(default=3.0, description="D&A as % of revenue", ge=0.0, le=100.0)
    nwc_change_pct_of_rev: float = Field(
        default=1.0,
        description="Change in Net Working Capital as % of revenue",
        ge=-50.0,
        le=50.0
    )


class DCFCalculationInput(BaseModel):
    symbol: str = Field(..., description="Stock symbol (e.g. TCS, INFY, RELIANCE)")
    reporting_currency: Literal["INR", "USD"] = Field(default="INR")
    reporting_unit: Literal["crore", "lakh", "million", "billion", "absolute"] = Field(default="crore")
    
    # Base year financial figures (Year 0 / latest reported FY)
    base_revenue: float = Field(..., gt=0.0, description="Base Year (T-0) Revenue in reporting units")
    diluted_shares: float = Field(..., gt=0.0, description="Diluted shares outstanding in reporting units or count")
    
    # Balance sheet adjustments for Enterprise Value -> Equity Value bridge
    cash_and_equivalents: float = Field(default=0.0, ge=0.0, description="Cash, cash equivalents and marketable securities")
    total_debt: float = Field(default=0.0, ge=0.0, description="Total short-term and long-term debt")
    minority_interest: float = Field(default=0.0, ge=0.0, description="Minority interest / non-controlling claims")
    other_senior_claims: float = Field(default=0.0, ge=0.0, description="Preferred stock, unfunded pensions, legal liabilities")
    
    # Valuation parameters
    terminal_growth_rate_pct: float = Field(
        default=5.0,
        ge=-2.0,
        le=12.0,
        description="Perpetual terminal growth rate % (Gordon Growth Model)"
    )
    wacc_input: WACCInput
    forecasts: List[ForecastYearInput] = Field(..., min_length=3, max_length=15)
    
    # Optional market price for valuation comparison
    current_market_price: Optional[float] = Field(default=None, ge=0.0)
    use_mid_year_convention: bool = Field(default=False, description="Discount using mid-year convention (t - 0.5)")

    @field_validator("forecasts")
    @classmethod
    def validate_forecast_sequence(cls, forecasts: List[ForecastYearInput]):
        indices = [f.year_index for f in forecasts]
        if indices != list(range(1, len(forecasts) + 1)):
            raise ValueError("Forecast year indices must be consecutive starting from 1")
        return forecasts


class ProjectedYearResult(BaseModel):
    year_index: int
    year_label: str
    revenue: float
    revenue_growth_pct: float
    ebit: float
    ebit_margin_pct: float
    operating_taxes: float
    nopat: float
    depreciation_amortization: float
    capex: float
    change_in_nwc: float
    free_cash_flow: float
    discount_period: float
    discount_factor: float
    pv_fcf: float


class WarningFlag(BaseModel):
    level: Literal["INFO", "WARNING", "CRITICAL"]
    code: str
    message: str


class DCFCalculationOutput(BaseModel):
    model_version: str = "1.0.0"
    symbol: str
    reporting_currency: str
    reporting_unit: str
    calculated_at: str
    
    # Forecast schedule
    forecast_years: List[ProjectedYearResult]
    cumulative_pv_fcf: float
    
    # Terminal value breakdown
    terminal_fcf: float
    terminal_growth_rate_pct: float
    discount_rate_wacc_pct: float
    terminal_value: float
    pv_terminal_value: float
    tv_as_pct_of_ev: float
    
    # Valuation Bridge
    enterprise_value: float
    cash_and_equivalents: float
    total_debt: float
    minority_interest: float
    other_senior_claims: float
    equity_value: float
    diluted_shares: float
    intrinsic_value_per_share: float
    
    # Comparison
    current_market_price: Optional[float] = None
    implied_upside_downside_pct: Optional[float] = None
    
    # Audit & Formulas
    flags: List[WarningFlag]
    intermediate_formulas: Dict[str, str]
