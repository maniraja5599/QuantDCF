"""
Unit tests for Institutional Modules: Peer Comps, BFSI Valuation, and SOTP
"""
import pytest
from services.api.app.engine.peer_comps import calculate_peer_comps
from services.api.app.engine.bfsi import (
    BFSIValuationInput,
    calculate_bfsi_valuation,
)
from services.api.app.engine.sotp import (
    SOTPValuationInput,
    SOTPSegmentInput,
    calculate_sotp,
)


def test_peer_comps_tcs():
    res = calculate_peer_comps("TCS", target_eps=125.0, target_ebit=58000.0, target_revenue=240000.0)
    assert res.target_symbol == "TCS"
    assert len(res.peers) >= 4
    assert res.sector_medians["forward_pe"] > 15.0
    assert res.implied_valuation["by_pe"] is not None
    assert res.implied_valuation["by_pe"] > 2000.0


def test_peer_comps_hdfc_bank():
    res = calculate_peer_comps("HDFCBANK")
    assert res.target_symbol == "HDFCBANK"
    assert "Banking" in res.sector
    assert res.sector_medians["price_to_book"] > 1.0


def test_bfsi_valuation_calculation():
    inp = BFSIValuationInput(
        symbol="HDFCBANK",
        book_value_per_share=320.0,
        eps=45.0,
        dividend_payout_ratio_pct=20.0,
        sustainable_roe_pct=16.5,
        cost_of_equity_ke_pct=12.5,
        perpetual_growth_rate_pct=5.5,
        current_market_price=714.0,
        net_interest_margin_pct=3.8,
        gnpa_pct=1.24,
        nnpa_pct=0.33,
    )
    out = calculate_bfsi_valuation(inp)
    assert out.justified_pb_multiple > 1.0
    # Justified PB = (16.5 - 5.5) / (12.5 - 5.5) = 11.0 / 7.0 = 1.5714
    assert round(out.justified_pb_multiple, 2) == 1.57
    assert out.implied_price_justified_pb > 320.0
    assert out.d1_dividend > 0.0
    assert out.blended_intrinsic_value_per_share > 0.0
    assert out.economic_spread_pct == 4.0  # 16.5 - 12.5 = 4.0%
    assert "STRONG" in out.health_rating


def test_bfsi_convergence_validation():
    inp = BFSIValuationInput(
        symbol="TESTBANK",
        book_value_per_share=100.0,
        eps=15.0,
        sustainable_roe_pct=12.0,
        cost_of_equity_ke_pct=5.0,
        perpetual_growth_rate_pct=6.0,  # Ke <= g should fail
    )
    with pytest.raises(ValueError, match="strictly greater than Perpetual Growth"):
        calculate_bfsi_valuation(inp)


def test_sotp_reliance_valuation():
    inp = SOTPValuationInput(
        conglomerate_symbol="RELIANCE",
        company_name="Reliance Industries Limited",
        segments=[
            SOTPSegmentInput(
                segment_name="Oil to Chemicals (O2C)",
                valuation_metric_label="EBITDA",
                metric_value_cr=65000.0,
                target_multiple=7.5,
                ownership_stake_pct=100.0,
            ),
            SOTPSegmentInput(
                segment_name="Reliance Retail",
                valuation_metric_label="EBITDA",
                metric_value_cr=25000.0,
                target_multiple=28.0,
                ownership_stake_pct=85.0,  # ~85% owned by RIL
            ),
            SOTPSegmentInput(
                segment_name="Jio Platforms (Telecom & Digital)",
                valuation_metric_label="EBITDA",
                metric_value_cr=55000.0,
                target_multiple=15.0,
                ownership_stake_pct=67.0,  # ~67% owned by RIL
            ),
            SOTPSegmentInput(
                segment_name="Green Energy & New Materials",
                valuation_metric_label="Book Value",
                metric_value_cr=95000.0,
                target_multiple=1.0,
                ownership_stake_pct=100.0,
            ),
        ],
        consolidated_net_debt_cr=115000.0,
        holding_company_discount_pct=15.0,
        diluted_shares_cr=1353.0,
        current_market_price=1166.7,
    )
    out = calculate_sotp(inp)
    assert out.gross_enterprise_value_cr > 1500000.0
    assert len(out.segments) == 4
    assert out.net_equity_value_cr > 1000000.0
    assert out.intrinsic_value_per_share > 500.0
