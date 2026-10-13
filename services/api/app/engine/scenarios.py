"""
Scenario Analysis Engine: Bull, Base, and Bear Case Projections
"""
from typing import List, Dict, Any, Optional
from copy import deepcopy
from .models import DCFCalculationInput
from .dcf import calculate_dcf
from .wacc import calculate_wacc


def calculate_scenarios(
    base_input: DCFCalculationInput,
    bull_growth_delta_pct: float = 3.0,
    bull_margin_delta_pct: float = 2.0,
    bull_wacc_delta_pct: float = -0.5,
    bull_terminal_g_delta_pct: float = 0.5,
    bear_growth_delta_pct: float = -3.0,
    bear_margin_delta_pct: float = -2.5,
    bear_wacc_delta_pct: float = 1.0,
    bear_terminal_g_delta_pct: float = -1.0,
) -> List[Dict[str, Any]]:
    """
    Constructs Bull, Base, and Bear scenarios based on differentiated growth, margin, and cost of capital expectations.
    """
    scenarios: List[Dict[str, Any]] = []

    # 1. Base Case
    base_out = calculate_dcf(base_input)
    base_wacc, _ = calculate_wacc(base_input.wacc_input)
    base_avg_growth = sum(f.revenue_growth_pct for f in base_input.forecasts) / len(base_input.forecasts)
    base_terminal_margin = base_input.forecasts[-1].ebit_margin_pct

    scenarios.append({
        "scenario_name": "Base Case",
        "description": "Consensus baseline projections reflecting management guidance and normalized historical margins.",
        "wacc_pct": round(base_wacc, 2),
        "terminal_growth_rate_pct": round(base_input.terminal_growth_rate_pct, 2),
        "revenue_cagr_pct": round(base_avg_growth, 2),
        "terminal_ebit_margin_pct": round(base_terminal_margin, 2),
        "enterprise_value": round(base_out.enterprise_value, 2),
        "equity_value": round(base_out.equity_value, 2),
        "intrinsic_value_per_share": round(base_out.intrinsic_value_per_share, 2),
        "implied_upside_downside_pct": base_out.implied_upside_downside_pct,
    })

    # 2. Bull Case
    bull_input = deepcopy(base_input)
    for f in bull_input.forecasts:
        f.revenue_growth_pct = round(f.revenue_growth_pct + bull_growth_delta_pct, 2)
        f.ebit_margin_pct = round(f.ebit_margin_pct + bull_margin_delta_pct, 2)
    bull_input.terminal_growth_rate_pct = round(bull_input.terminal_growth_rate_pct + bull_terminal_g_delta_pct, 2)
    bull_wacc = max(4.0, round(base_wacc + bull_wacc_delta_pct, 2))
    bull_input.wacc_input.manual_wacc_override = bull_wacc
    bull_input.wacc_input.override_reason = "Bull case lower risk premium"

    try:
        bull_out = calculate_dcf(bull_input)
        bull_avg_growth = sum(f.revenue_growth_pct for f in bull_input.forecasts) / len(bull_input.forecasts)
        scenarios.insert(0, {
            "scenario_name": "Bull Case",
            "description": "Accelerated volume expansion, market share gain, operating leverage margin expansion, and lower country risk premium.",
            "wacc_pct": round(bull_wacc, 2),
            "terminal_growth_rate_pct": round(bull_input.terminal_growth_rate_pct, 2),
            "revenue_cagr_pct": round(bull_avg_growth, 2),
            "terminal_ebit_margin_pct": round(bull_input.forecasts[-1].ebit_margin_pct, 2),
            "enterprise_value": round(bull_out.enterprise_value, 2),
            "equity_value": round(bull_out.equity_value, 2),
            "intrinsic_value_per_share": round(bull_out.intrinsic_value_per_share, 2),
            "implied_upside_downside_pct": bull_out.implied_upside_downside_pct,
        })
    except Exception as e:
        pass

    # 3. Bear Case
    bear_input = deepcopy(base_input)
    for f in bear_input.forecasts:
        f.revenue_growth_pct = round(max(-20.0, f.revenue_growth_pct + bear_growth_delta_pct), 2)
        f.ebit_margin_pct = round(max(0.5, f.ebit_margin_pct + bear_margin_delta_pct), 2)
    bear_input.terminal_growth_rate_pct = round(max(1.0, bear_input.terminal_growth_rate_pct + bear_terminal_g_delta_pct), 2)
    bear_wacc = round(base_wacc + bear_wacc_delta_pct, 2)
    bear_input.wacc_input.manual_wacc_override = bear_wacc
    bear_input.wacc_input.override_reason = "Bear case elevated risk premium"

    try:
        bear_out = calculate_dcf(bear_input)
        bear_avg_growth = sum(f.revenue_growth_pct for f in bear_input.forecasts) / len(bear_input.forecasts)
        scenarios.append({
            "scenario_name": "Bear Case",
            "description": "Cyclical slowdown, input cost inflation, competitive margin contraction, and higher interest rate environment.",
            "wacc_pct": round(bear_wacc, 2),
            "terminal_growth_rate_pct": round(bear_input.terminal_growth_rate_pct, 2),
            "revenue_cagr_pct": round(bear_avg_growth, 2),
            "terminal_ebit_margin_pct": round(bear_input.forecasts[-1].ebit_margin_pct, 2),
            "enterprise_value": round(bear_out.enterprise_value, 2),
            "equity_value": round(bear_out.equity_value, 2),
            "intrinsic_value_per_share": round(bear_out.intrinsic_value_per_share, 2),
            "implied_upside_downside_pct": bear_out.implied_upside_downside_pct,
        })
    except Exception as e:
        pass

    return scenarios
