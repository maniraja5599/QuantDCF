"""
BFSI (Banking & Financial Services) Valuation Engine for Indian Equities
Implements Justified P/B vs Sustainable ROE, Dividend Discount Model (DDM),
Residual Income Model, and banking prudence metrics for Banks and NBFCs.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class BFSIValuationInput(BaseModel):
    symbol: str = Field(..., description="Banking ticker symbol, e.g. HDFCBANK, ICICIBANK, SBIN")
    book_value_per_share: float = Field(..., gt=0, description="Reported or estimated Book Value per Share (BVPS) in ₹")
    eps: float = Field(..., gt=0, description="Trailing or 1-Yr Forward Earnings Per Share (EPS) in ₹")
    dividend_payout_ratio_pct: float = Field(default=20.0, ge=0, le=100, description="Dividend Payout Ratio %")
    sustainable_roe_pct: float = Field(default=16.5, gt=0, description="Sustainable Return on Equity (ROE) %")
    cost_of_equity_ke_pct: float = Field(default=12.5, gt=0, description="Cost of Equity Ke % (via CAPM)")
    perpetual_growth_rate_pct: float = Field(default=5.5, gt=0, description="Long-term Terminal Growth Rate g %")
    current_market_price: Optional[float] = Field(None, gt=0, description="Current market price (CMP) in ₹")
    # Regulatory Banking Health Metrics
    net_interest_margin_pct: Optional[float] = Field(default=3.8, description="Net Interest Margin (NIM) %")
    gnpa_pct: Optional[float] = Field(default=1.25, description="Gross NPA %")
    nnpa_pct: Optional[float] = Field(default=0.35, description="Net NPA %")
    provision_coverage_ratio_pct: Optional[float] = Field(default=74.5, description="PCR %")
    casa_ratio_pct: Optional[float] = Field(default=38.2, description="CASA Deposit Ratio %")
    tier1_crar_pct: Optional[float] = Field(default=16.8, description="Tier-1 Capital Adequacy Ratio %")


class BFSIValuationOutput(BaseModel):
    symbol: str
    book_value_per_share: float
    sustainable_roe_pct: float
    cost_of_equity_ke_pct: float
    perpetual_growth_rate_pct: float
    # 1. Justified P/B Model
    justified_pb_multiple: float
    implied_price_justified_pb: float
    # 2. Dividend Discount Model (DDM)
    d1_dividend: float
    implied_price_ddm: float
    # 3. Residual Income Estimate
    economic_spread_pct: float  # ROE - Ke
    implied_price_residual_income: float
    # Weighted Consensus Valuation
    blended_intrinsic_value_per_share: float
    current_market_price: Optional[float]
    implied_upside_downside_pct: Optional[float]
    # Prudence & Health Diagnostic
    health_rating: str
    banking_metrics: Dict[str, Any]
    formula_audit: Dict[str, str]


def calculate_bfsi_valuation(inp: BFSIValuationInput) -> BFSIValuationOutput:
    ke = inp.cost_of_equity_ke_pct / 100.0
    g = inp.perpetual_growth_rate_pct / 100.0
    roe = inp.sustainable_roe_pct / 100.0

    if ke <= g:
        raise ValueError(
            f"Cost of Equity Ke ({inp.cost_of_equity_ke_pct}%) must be strictly greater than Perpetual Growth g ({inp.perpetual_growth_rate_pct}%) for convergence."
        )

    # 1. Justified Price to Book: (ROE - g) / (Ke - g)
    justified_pb = (roe - g) / (ke - g)
    price_pb = justified_pb * inp.book_value_per_share

    # 2. Gordon DDM: D1 / (Ke - g)
    payout = inp.dividend_payout_ratio_pct / 100.0
    d0 = inp.eps * payout
    d1 = d0 * (1.0 + g)
    price_ddm = d1 / (ke - g)

    # 3. Residual Income 1-Stage Approximation
    # Value = BV0 + (ROE - Ke) * BV0 / (Ke - g)
    economic_spread = (roe - ke) * 100.0
    ri_premium = ((roe - ke) * inp.book_value_per_share) / (ke - g)
    price_ri = inp.book_value_per_share + ri_premium

    # Blended intrinsic value (40% Justified PB, 30% DDM, 30% Residual Income)
    blended = (0.40 * price_pb) + (0.30 * price_ddm) + (0.30 * price_ri)

    upside = None
    if inp.current_market_price and inp.current_market_price > 0:
        upside = round(((blended - inp.current_market_price) / inp.current_market_price) * 100.0, 2)

    # Prudence Diagnostic
    rating = "STRONG (Tier-1 Asset Quality)"
    if (inp.gnpa_pct or 0) > 3.0 or (inp.nnpa_pct or 0) > 1.0:
        rating = "MODERATE RISK (Elevated Stressed Assets)"
    elif (inp.tier1_crar_pct or 15.0) < 11.5:
        rating = "CAPITAL CONSTRAINED (Regulatory Buffer Low)"

    formulas = {
        "justified_pb": "Justified P/B = (Sustainable ROE - g) / (Cost of Equity Ke - g)",
        "ddm": "DDM Intrinsic Price = D1 / (Ke - g) = (EPS * Payout * (1 + g)) / (Ke - g)",
        "residual_income": "Residual Income Price = BV0 + [ (ROE - Ke) * BV0 / (Ke - g) ]",
        "economic_spread": f"Economic Profit Spread = Sustainable ROE ({inp.sustainable_roe_pct}%) - Ke ({inp.cost_of_equity_ke_pct}%) = {economic_spread:.2f}%",
    }

    metrics = {
        "net_interest_margin_pct": inp.net_interest_margin_pct,
        "gnpa_pct": inp.gnpa_pct,
        "nnpa_pct": inp.nnpa_pct,
        "provision_coverage_ratio_pct": inp.provision_coverage_ratio_pct,
        "casa_ratio_pct": inp.casa_ratio_pct,
        "tier1_crar_pct": inp.tier1_crar_pct,
    }

    return BFSIValuationOutput(
        symbol=inp.symbol.upper(),
        book_value_per_share=round(inp.book_value_per_share, 2),
        sustainable_roe_pct=round(inp.sustainable_roe_pct, 2),
        cost_of_equity_ke_pct=round(inp.cost_of_equity_ke_pct, 2),
        perpetual_growth_rate_pct=round(inp.perpetual_growth_rate_pct, 2),
        justified_pb_multiple=round(justified_pb, 2),
        implied_price_justified_pb=round(price_pb, 2),
        d1_dividend=round(d1, 2),
        implied_price_ddm=round(price_ddm, 2),
        economic_spread_pct=round(economic_spread, 2),
        implied_price_residual_income=round(price_ri, 2),
        blended_intrinsic_value_per_share=round(blended, 2),
        current_market_price=inp.current_market_price,
        implied_upside_downside_pct=upside,
        health_rating=rating,
        banking_metrics=metrics,
        formula_audit=formulas,
    )
