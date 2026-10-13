"""
Unit Tests for DCF Engine, WACC, and Sensitivity Analysis
"""
import pytest
from services.api.app.engine.models import (
    WACCInput,
    ForecastYearInput,
    DCFCalculationInput,
)
from services.api.app.engine.wacc import calculate_wacc
from services.api.app.engine.dcf import calculate_dcf
from services.api.app.engine.sensitivity import calculate_sensitivity_matrix
from services.api.app.engine.scenarios import calculate_scenarios


def test_wacc_calculation():
    """
    Test standard WACC calculation:
    Rf = 7.10%, Beta = 1.0, ERP = 6.50% -> Ke = 13.60%
    Kd pre-tax = 8.50%, Tax = 25.17% -> Kd after-tax = 6.36055%
    We = 80%, Wd = 20%
    WACC = 0.8 * 13.60 + 0.2 * 6.36055 = 10.88 + 1.27211 = 12.1521%
    """
    wacc_in = WACCInput(
        risk_free_rate_pct=7.10,
        equity_risk_premium_pct=6.50,
        beta=1.0,
        pre_tax_cost_of_debt_pct=8.50,
        effective_tax_rate_pct=25.17,
        weight_equity_pct=80.0,
        weight_debt_pct=20.0,
    )
    wacc_pct, details = calculate_wacc(wacc_in)
    assert abs(wacc_pct - 12.1521) < 0.01
    assert details["is_overridden"] is False
    assert details["cost_of_equity_pct"] == 13.60


def test_wacc_manual_override():
    wacc_in = WACCInput(
        risk_free_rate_pct=7.10,
        equity_risk_premium_pct=6.50,
        beta=1.0,
        pre_tax_cost_of_debt_pct=8.50,
        effective_tax_rate_pct=25.17,
        weight_equity_pct=80.0,
        weight_debt_pct=20.0,
        manual_wacc_override=11.5,
        override_reason="Analyst adjustment for low debt risk",
    )
    wacc_pct, details = calculate_wacc(wacc_in)
    assert wacc_pct == 11.5
    assert details["is_overridden"] is True
    assert details["override_reason"] == "Analyst adjustment for low debt risk"


def test_wacc_weight_sum_validation():
    with pytest.raises(ValueError, match="Capital structure weights must sum to 100%"):
        WACCInput(
            risk_free_rate_pct=7.10,
            equity_risk_premium_pct=6.50,
            beta=1.0,
            weight_equity_pct=70.0,
            weight_debt_pct=20.0,  # Sums to 90%, should fail
        )


def test_dcf_complete_workflow():
    """
    Test complete 5-year forecast DCF calculation on known verified figures
    """
    wacc_in = WACCInput(
        risk_free_rate_pct=7.10,
        equity_risk_premium_pct=6.50,
        beta=1.0,
        pre_tax_cost_of_debt_pct=8.0,
        effective_tax_rate_pct=25.0,
        weight_equity_pct=90.0,
        weight_debt_pct=10.0,
    )
    
    # 5-year forecast inputs
    forecasts = [
        ForecastYearInput(
            year_index=1,
            year_label="FY25E",
            revenue_growth_pct=10.0,
            ebit_margin_pct=25.0,
            tax_rate_pct=25.0,
            capex_pct_of_rev=3.0,
            dna_pct_of_rev=2.5,
            nwc_change_pct_of_rev=1.0,
        ),
        ForecastYearInput(
            year_index=2,
            year_label="FY26E",
            revenue_growth_pct=10.0,
            ebit_margin_pct=25.0,
            tax_rate_pct=25.0,
            capex_pct_of_rev=3.0,
            dna_pct_of_rev=2.5,
            nwc_change_pct_of_rev=1.0,
        ),
        ForecastYearInput(
            year_index=3,
            year_label="FY27E",
            revenue_growth_pct=9.0,
            ebit_margin_pct=24.5,
            tax_rate_pct=25.0,
            capex_pct_of_rev=3.0,
            dna_pct_of_rev=2.5,
            nwc_change_pct_of_rev=1.0,
        ),
        ForecastYearInput(
            year_index=4,
            year_label="FY28E",
            revenue_growth_pct=8.0,
            ebit_margin_pct=24.0,
            tax_rate_pct=25.0,
            capex_pct_of_rev=3.0,
            dna_pct_of_rev=2.5,
            nwc_change_pct_of_rev=1.0,
        ),
        ForecastYearInput(
            year_index=5,
            year_label="FY29E",
            revenue_growth_pct=8.0,
            ebit_margin_pct=24.0,
            tax_rate_pct=25.0,
            capex_pct_of_rev=3.0,
            dna_pct_of_rev=2.5,
            nwc_change_pct_of_rev=1.0,
        ),
    ]

    dcf_in = DCFCalculationInput(
        symbol="TCS",
        reporting_currency="INR",
        reporting_unit="crore",
        base_revenue=240000.0,  # ₹2,40,000 Cr
        diluted_shares=361.8,    # 361.8 Cr shares
        cash_and_equivalents=15000.0,
        total_debt=0.0,
        minority_interest=0.0,
        other_senior_claims=0.0,
        terminal_growth_rate_pct=5.0,
        wacc_input=wacc_in,
        forecasts=forecasts,
        current_market_price=4100.0,
    )

    result = calculate_dcf(dcf_in)

    assert result.symbol == "TCS"
    assert len(result.forecast_years) == 5
    assert result.cumulative_pv_fcf > 0
    assert result.terminal_value > 0
    assert result.enterprise_value > result.cumulative_pv_fcf
    assert result.equity_value == result.enterprise_value + 15000.0
    assert result.intrinsic_value_per_share > 0
    assert result.implied_upside_downside_pct is not None


def test_dcf_wacc_must_exceed_terminal_growth():
    """
    Financial validation: WACC <= g must be rejected
    """
    wacc_in = WACCInput(
        risk_free_rate_pct=5.0,
        equity_risk_premium_pct=4.0,
        beta=0.5,
        pre_tax_cost_of_debt_pct=5.0,
        effective_tax_rate_pct=25.0,
        weight_equity_pct=50.0,
        weight_debt_pct=50.0,
        manual_wacc_override=5.0,  # WACC is 5.0%
    )
    
    forecasts = [
        ForecastYearInput(
            year_index=i,
            year_label=f"FY{24+i}E",
            revenue_growth_pct=5.0,
            ebit_margin_pct=20.0,
        )
        for i in range(1, 4)
    ]

    dcf_in = DCFCalculationInput(
        symbol="TEST",
        base_revenue=1000.0,
        diluted_shares=10.0,
        terminal_growth_rate_pct=5.0,  # g == WACC == 5.0%
        wacc_input=wacc_in,
        forecasts=forecasts,
    )

    with pytest.raises(ValueError, match="WACC .* must be strictly greater than"):
        calculate_dcf(dcf_in)


def test_dcf_warning_flags():
    """
    Test warning flags for high terminal growth (> 6.5%)
    """
    wacc_in = WACCInput(
        risk_free_rate_pct=8.0,
        equity_risk_premium_pct=6.0,
        beta=1.2,
        weight_equity_pct=100.0,
        weight_debt_pct=0.0,
    )
    forecasts = [
        ForecastYearInput(
            year_index=i,
            year_label=f"FY{24+i}E",
            revenue_growth_pct=10.0,
            ebit_margin_pct=15.0,
        )
        for i in range(1, 4)
    ]
    dcf_in = DCFCalculationInput(
        symbol="TEST_GROWTH",
        base_revenue=1000.0,
        diluted_shares=10.0,
        terminal_growth_rate_pct=7.5,  # Unusually high terminal growth
        wacc_input=wacc_in,
        forecasts=forecasts,
    )

    result = calculate_dcf(dcf_in)
    codes = [f.code for f in result.flags]
    assert "HIGH_TERMINAL_GROWTH" in codes


def test_sensitivity_matrix():
    wacc_in = WACCInput(
        risk_free_rate_pct=7.0,
        equity_risk_premium_pct=6.0,
        beta=1.0,
        weight_equity_pct=90.0,
        weight_debt_pct=10.0,
    )
    forecasts = [
        ForecastYearInput(
            year_index=i,
            year_label=f"FY{24+i}E",
            revenue_growth_pct=8.0,
            ebit_margin_pct=20.0,
        )
        for i in range(1, 4)
    ]
    dcf_in = DCFCalculationInput(
        symbol="TEST_SENS",
        base_revenue=1000.0,
        diluted_shares=10.0,
        terminal_growth_rate_pct=5.0,
        wacc_input=wacc_in,
        forecasts=forecasts,
    )

    sens = calculate_sensitivity_matrix(dcf_in)
    assert "matrix" in sens
    assert len(sens["wacc_rates_pct"]) == 7
    assert len(sens["terminal_growth_rates_pct"]) == 7
    assert sens["base_intrinsic_value"] > 0


def test_scenario_analysis():
    wacc_in = WACCInput(
        risk_free_rate_pct=7.0,
        equity_risk_premium_pct=6.0,
        beta=1.0,
        weight_equity_pct=90.0,
        weight_debt_pct=10.0,
    )
    forecasts = [
        ForecastYearInput(
            year_index=i,
            year_label=f"FY{24+i}E",
            revenue_growth_pct=8.0,
            ebit_margin_pct=20.0,
        )
        for i in range(1, 4)
    ]
    dcf_in = DCFCalculationInput(
        symbol="TEST_SCEN",
        base_revenue=1000.0,
        diluted_shares=10.0,
        terminal_growth_rate_pct=5.0,
        wacc_input=wacc_in,
        forecasts=forecasts,
        current_market_price=100.0,
    )

    scenarios = calculate_scenarios(dcf_in)
    assert len(scenarios) == 3
    names = [s["scenario_name"] for s in scenarios]
    assert "Bull Case" in names
    assert "Base Case" in names
    assert "Bear Case" in names
    
    bull = next(s for s in scenarios if s["scenario_name"] == "Bull Case")
    base = next(s for s in scenarios if s["scenario_name"] == "Base Case")
    bear = next(s for s in scenarios if s["scenario_name"] == "Bear Case")
    assert bull["intrinsic_value_per_share"] > base["intrinsic_value_per_share"]
    assert base["intrinsic_value_per_share"] > bear["intrinsic_value_per_share"]
