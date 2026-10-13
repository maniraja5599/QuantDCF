"""
2D Sensitivity Analysis Engine for WACC vs Perpetual Terminal Growth Rate
"""
from typing import List, Dict, Any, Optional
from copy import deepcopy
from .models import DCFCalculationInput
from .dcf import calculate_dcf
from .wacc import calculate_wacc


def calculate_sensitivity_matrix(
    base_input: DCFCalculationInput,
    wacc_steps: Optional[List[float]] = None,
    growth_steps: Optional[List[float]] = None,
) -> Dict[str, Any]:
    """
    Computes an N x M matrix of Intrinsic Values per Share across varying WACC and Terminal Growth rates.
    Validates that WACC > g for every scenario.
    """
    base_wacc, _ = calculate_wacc(base_input.wacc_input)
    base_growth = base_input.terminal_growth_rate_pct

    # Default step spread around base values if not explicitly provided
    # e.g., Base WACC +/- 1.5% in 0.5% increments
    if wacc_steps is None:
        wacc_steps = [
            round(base_wacc - 1.5, 2),
            round(base_wacc - 1.0, 2),
            round(base_wacc - 0.5, 2),
            round(base_wacc, 2),
            round(base_wacc + 0.5, 2),
            round(base_wacc + 1.0, 2),
            round(base_wacc + 1.5, 2),
        ]

    if growth_steps is None:
        growth_steps = [
            round(base_growth - 1.5, 2),
            round(base_growth - 1.0, 2),
            round(base_growth - 0.5, 2),
            round(base_growth, 2),
            round(base_growth + 0.5, 2),
            round(base_growth + 1.0, 2),
            round(base_growth + 1.5, 2),
        ]

    # Ensure all step values are sorted ascending
    wacc_steps = sorted(wacc_steps)
    growth_steps = sorted(growth_steps)

    matrix: List[List[Optional[float]]] = []
    base_result = calculate_dcf(base_input)
    base_intrinsic = base_result.intrinsic_value_per_share

    for w_rate in wacc_steps:
        row: List[Optional[float]] = []
        for g_rate in growth_steps:
            if w_rate <= g_rate:
                # Mathematically invalid (WACC <= g)
                row.append(None)
                continue

            # Clone input and apply specific sensitivity overrides
            scenario_input = deepcopy(base_input)
            scenario_input.wacc_input.manual_wacc_override = w_rate
            scenario_input.wacc_input.override_reason = f"Sensitivity step {w_rate}%"
            scenario_input.terminal_growth_rate_pct = g_rate

            try:
                out = calculate_dcf(scenario_input)
                row.append(round(out.intrinsic_value_per_share, 2))
            except Exception:
                row.append(None)
        matrix.append(row)

    return {
        "base_wacc_pct": round(base_wacc, 2),
        "base_growth_pct": round(base_growth, 2),
        "base_intrinsic_value": round(base_intrinsic, 2),
        "wacc_rates_pct": wacc_steps,
        "terminal_growth_rates_pct": growth_steps,
        "matrix": matrix,
    }
