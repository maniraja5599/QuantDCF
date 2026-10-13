"""
WACC (Weighted Average Cost of Capital) Calculation Module
Implements standard Capital Asset Pricing Model (CAPM) and weighted structure.
"""
from typing import Dict, Any, Tuple
from .models import WACCInput


def calculate_wacc(wacc_input: WACCInput) -> Tuple[float, Dict[str, Any]]:
    """
    Computes Cost of Equity (CAPM), After-tax Cost of Debt, and WACC.
    
    Formula:
      Ke = Rf + Beta * ERP
      Kd_after_tax = Kd_pre_tax * (1 - Effective_Tax_Rate)
      WACC = (We * Ke) + (Wd * Kd_after_tax)
      
    Returns:
      (effective_wacc_pct, details_dict)
    """
    rf = wacc_input.risk_free_rate_pct
    erp = wacc_input.equity_risk_premium_pct
    beta = wacc_input.beta
    kd_pre_tax = wacc_input.pre_tax_cost_of_debt_pct
    tax_rate = wacc_input.effective_tax_rate_pct
    we = wacc_input.weight_equity_pct / 100.0
    wd = wacc_input.weight_debt_pct / 100.0

    # 1. Cost of Equity (CAPM)
    cost_of_equity_pct = rf + (beta * erp)

    # 2. After-tax Cost of Debt
    tax_factor = 1.0 - (tax_rate / 100.0)
    cost_of_debt_after_tax_pct = kd_pre_tax * tax_factor

    # 3. Weighted Average Cost of Capital
    calculated_wacc_pct = (we * cost_of_equity_pct) + (wd * cost_of_debt_after_tax_pct)

    # Manual override check
    if wacc_input.manual_wacc_override is not None:
        effective_wacc_pct = wacc_input.manual_wacc_override
        is_overridden = True
    else:
        effective_wacc_pct = calculated_wacc_pct
        is_overridden = False

    details = {
        "risk_free_rate_pct": round(rf, 4),
        "equity_risk_premium_pct": round(erp, 4),
        "beta": round(beta, 4),
        "cost_of_equity_pct": round(cost_of_equity_pct, 4),
        "pre_tax_cost_of_debt_pct": round(kd_pre_tax, 4),
        "effective_tax_rate_pct": round(tax_rate, 4),
        "after_tax_cost_of_debt_pct": round(cost_of_debt_after_tax_pct, 4),
        "weight_equity_pct": round(wacc_input.weight_equity_pct, 4),
        "weight_debt_pct": round(wacc_input.weight_debt_pct, 4),
        "calculated_wacc_pct": round(calculated_wacc_pct, 4),
        "effective_wacc_pct": round(effective_wacc_pct, 4),
        "is_overridden": is_overridden,
        "override_reason": wacc_input.override_reason if is_overridden else None,
        "capm_formula": f"{rf:.2f}% + ({beta:.2f} × {erp:.2f}%) = {cost_of_equity_pct:.2f}%",
        "wacc_formula": (
            f"({wacc_input.weight_equity_pct:.1f}% × {cost_of_equity_pct:.2f}%) + "
            f"({wacc_input.weight_debt_pct:.1f}% × {cost_of_debt_after_tax_pct:.2f}%) = "
            f"{calculated_wacc_pct:.2f}%"
        ),
    }

    return round(effective_wacc_pct, 4), details
