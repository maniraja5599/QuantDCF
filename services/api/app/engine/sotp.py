"""
Sum-of-the-Parts (SOTP) Valuation Engine for Indian Conglomerates (Reliance, L&T, Tata Sons entities)
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SOTPSegmentInput(BaseModel):
    segment_name: str
    valuation_metric_label: str  # e.g., "EBITDA", "Revenue", "Book Value"
    metric_value_cr: float  # Value in ₹ Cr
    target_multiple: float  # e.g. 7.5x EV/EBITDA
    ownership_stake_pct: float = Field(default=100.0, ge=0, le=100)


class SOTPValuationInput(BaseModel):
    conglomerate_symbol: str
    company_name: str
    segments: List[SOTPSegmentInput]
    consolidated_net_debt_cr: float
    holding_company_discount_pct: float = Field(default=15.0, ge=0, le=50)
    diluted_shares_cr: float
    current_market_price: Optional[float] = None


class SOTPSegmentResult(BaseModel):
    segment_name: str
    metric_value_cr: float
    target_multiple: float
    enterprise_value_cr: float
    effective_value_cr: float
    share_of_total_ev_pct: float


class SOTPValuationOutput(BaseModel):
    conglomerate_symbol: str
    company_name: str
    segments: List[SOTPSegmentResult]
    gross_enterprise_value_cr: float
    consolidated_net_debt_cr: float
    holding_company_discount_pct: float
    discount_amount_cr: float
    net_equity_value_cr: float
    diluted_shares_cr: float
    intrinsic_value_per_share: float
    current_market_price: Optional[float]
    implied_upside_downside_pct: Optional[float]


def calculate_sotp(inp: SOTPValuationInput) -> SOTPValuationOutput:
    gross_ev = 0.0
    seg_evs = []

    for seg in inp.segments:
        ev = seg.metric_value_cr * seg.target_multiple
        effective = ev * (seg.ownership_stake_pct / 100.0)
        seg_evs.append(effective)
        gross_ev += effective

    segment_results: List[SOTPSegmentResult] = []
    for seg, eff in zip(inp.segments, seg_evs):
        pct = (eff / gross_ev * 100.0) if gross_ev > 0 else 0.0
        segment_results.append(
            SOTPSegmentResult(
                segment_name=seg.segment_name,
                metric_value_cr=seg.metric_value_cr,
                target_multiple=seg.target_multiple,
                enterprise_value_cr=round(seg.metric_value_cr * seg.target_multiple, 2),
                effective_value_cr=round(eff, 2),
                share_of_total_ev_pct=round(pct, 2),
            )
        )

    # Apply holding company discount on enterprise value or equity
    hcd_amount = gross_ev * (inp.holding_company_discount_pct / 100.0)
    equity_val = gross_ev - inp.consolidated_net_debt_cr - hcd_amount

    if inp.diluted_shares_cr <= 0:
        raise ValueError("Diluted shares outstanding must be greater than zero.")

    intrinsic_per_share = max(0.0, equity_val / inp.diluted_shares_cr)

    upside = None
    if inp.current_market_price and inp.current_market_price > 0:
        upside = round(((intrinsic_per_share - inp.current_market_price) / inp.current_market_price) * 100.0, 2)

    return SOTPValuationOutput(
        conglomerate_symbol=inp.conglomerate_symbol.upper(),
        company_name=inp.company_name,
        segments=segment_results,
        gross_enterprise_value_cr=round(gross_ev, 2),
        consolidated_net_debt_cr=round(inp.consolidated_net_debt_cr, 2),
        holding_company_discount_pct=inp.holding_company_discount_pct,
        discount_amount_cr=round(hcd_amount, 2),
        net_equity_value_cr=round(equity_val, 2),
        diluted_shares_cr=inp.diluted_shares_cr,
        intrinsic_value_per_share=round(intrinsic_per_share, 2),
        current_market_price=inp.current_market_price,
        implied_upside_downside_pct=upside,
    )
