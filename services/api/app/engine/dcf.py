"""
Core Discounted Cash Flow (DCF) Calculation Engine
Implements FCFF (Free Cash Flow to Firm), Gordon Growth Terminal Value,
and Enterprise-to-Equity reconciliation.
"""
from datetime import datetime, timezone
from typing import List, Dict, Tuple
from .models import (
    DCFCalculationInput,
    DCFCalculationOutput,
    ProjectedYearResult,
    WarningFlag,
)
from .wacc import calculate_wacc


MODEL_VERSION = "1.0.0"


def calculate_dcf(params: DCFCalculationInput) -> DCFCalculationOutput:
    """
    Executes a verifiable, mathematically rigorous DCF valuation.
    """
    # 1. Compute effective WACC
    wacc_pct, wacc_details = calculate_wacc(params.wacc_input)
    wacc_decimal = wacc_pct / 100.0
    terminal_g_decimal = params.terminal_growth_rate_pct / 100.0

    # Strict financial validation: WACC must be strictly greater than terminal growth
    if wacc_decimal <= terminal_g_decimal:
        raise ValueError(
            f"Invalid valuation parameters: WACC ({wacc_pct:.2f}%) must be strictly greater than "
            f"the perpetual terminal growth rate ({params.terminal_growth_rate_pct:.2f}%). "
            f"When WACC <= g, the Gordon Growth Model diverges to infinity or negative numbers."
        )

    # 2. Forecast Cash Flows
    forecast_results: List[ProjectedYearResult] = []
    flags: List[WarningFlag] = []
    
    current_rev = params.base_revenue
    negative_fcf_years = []

    for f_input in params.forecasts:
        # Revenue_t = Revenue_{t-1} * (1 + growth)
        rev_growth_decimal = f_input.revenue_growth_pct / 100.0
        projected_rev = current_rev * (1.0 + rev_growth_decimal)
        current_rev = projected_rev

        # EBIT_t = Revenue_t * ebit_margin
        ebit_margin_decimal = f_input.ebit_margin_pct / 100.0
        ebit = projected_rev * ebit_margin_decimal

        # Operating taxes = max(0, EBIT) * tax_rate
        tax_rate_decimal = f_input.tax_rate_pct / 100.0
        operating_taxes = max(0.0, ebit) * tax_rate_decimal

        # NOPAT = EBIT - Operating Taxes
        nopat = ebit - operating_taxes

        # D&A, CapEx, NWC Changes
        dna = projected_rev * (f_input.dna_pct_of_rev / 100.0)
        capex = projected_rev * (f_input.capex_pct_of_rev / 100.0)
        change_nwc = projected_rev * (f_input.nwc_change_pct_of_rev / 100.0)

        # Free Cash Flow to Firm (FCFF)
        # FCF = NOPAT + D&A - CapEx - Change_in_NWC
        fcf = nopat + dna - capex - change_nwc

        if fcf < 0:
            negative_fcf_years.append(f_input.year_label)

        # Discount Factor
        discount_period = (
            (f_input.year_index - 0.5)
            if params.use_mid_year_convention
            else float(f_input.year_index)
        )
        discount_factor = 1.0 / ((1.0 + wacc_decimal) ** discount_period)
        pv_fcf = fcf * discount_factor

        forecast_results.append(
            ProjectedYearResult(
                year_index=f_input.year_index,
                year_label=f_input.year_label,
                revenue=round(projected_rev, 2),
                revenue_growth_pct=round(f_input.revenue_growth_pct, 2),
                ebit=round(ebit, 2),
                ebit_margin_pct=round(f_input.ebit_margin_pct, 2),
                operating_taxes=round(operating_taxes, 2),
                nopat=round(nopat, 2),
                depreciation_amortization=round(dna, 2),
                capex=round(capex, 2),
                change_in_nwc=round(change_nwc, 2),
                free_cash_flow=round(fcf, 2),
                discount_period=round(discount_period, 2),
                discount_factor=round(discount_factor, 6),
                pv_fcf=round(pv_fcf, 2),
            )
        )

    # Cumulative PV of explicit forecast cash flows
    cumulative_pv_fcf = sum(item.pv_fcf for item in forecast_results)

    # 3. Terminal Value Calculation using Gordon Growth Model
    last_year_fcf = forecast_results[-1].free_cash_flow
    n_years = len(forecast_results)

    # TV = FCF_n * (1 + g) / (WACC - g)
    terminal_fcf = last_year_fcf * (1.0 + terminal_g_decimal)
    terminal_value = terminal_fcf / (wacc_decimal - terminal_g_decimal)

    # Discount TV to PV
    # Discount TV using N years from base date
    tv_discount_factor = 1.0 / ((1.0 + wacc_decimal) ** n_years)
    pv_terminal_value = terminal_value * tv_discount_factor

    # 4. Enterprise Value
    enterprise_value = cumulative_pv_fcf + pv_terminal_value

    # Terminal Value Dependency Ratio
    tv_as_pct_of_ev = (
        (pv_terminal_value / enterprise_value * 100.0)
        if enterprise_value > 0
        else 0.0
    )

    # 5. Equity Value Bridge
    # Equity Value = Enterprise Value + Cash - Debt - Minority Interest - Senior Claims
    equity_value = (
        enterprise_value
        + params.cash_and_equivalents
        - params.total_debt
        - params.minority_interest
        - params.other_senior_claims
    )

    # 6. Intrinsic Value Per Diluted Share
    if params.diluted_shares <= 0:
        raise ValueError("Diluted shares outstanding must be greater than zero.")

    intrinsic_value_per_share = equity_value / params.diluted_shares

    # 7. Implied Upside/Downside vs Market Price
    upside_downside_pct = None
    if params.current_market_price and params.current_market_price > 0:
        upside_downside_pct = (
            (intrinsic_value_per_share - params.current_market_price)
            / params.current_market_price
        ) * 100.0

    # 8. Financial Auditing and Sanity Flags
    if params.terminal_growth_rate_pct > 6.5:
        flags.append(
            WarningFlag(
                level="WARNING",
                code="HIGH_TERMINAL_GROWTH",
                message=(
                    f"Terminal growth rate of {params.terminal_growth_rate_pct:.2f}% exceeds the long-term "
                    f"sustainable Indian nominal GDP expansion rate cap (~5.0% - 6.5%)."
                ),
            )
        )

    if tv_as_pct_of_ev > 80.0:
        flags.append(
            WarningFlag(
                level="WARNING",
                code="HIGH_TV_DEPENDENCE",
                message=(
                    f"Terminal Value constitutes {tv_as_pct_of_ev:.1f}% of total Enterprise Value. "
                    f"This indicates significant valuation sensitivity to perpetual growth and discount assumptions."
                ),
            )
        )

    if negative_fcf_years:
        flags.append(
            WarningFlag(
                level="INFO",
                code="NEGATIVE_FCF_PERIODS",
                message=f"Negative projected Free Cash Flow detected in period(s): {', '.join(negative_fcf_years)}.",
            )
        )

    if equity_value < 0:
        flags.append(
            WarningFlag(
                level="CRITICAL",
                code="NEGATIVE_EQUITY_VALUE",
                message=(
                    "Calculated Equity Value is negative. Net debt and senior claims exceed the enterprise "
                    "operating asset valuation under current assumptions."
                ),
            )
        )

    # Document intermediate formulas for auditability
    intermediate_formulas = {
        "cost_of_equity": wacc_details["capm_formula"],
        "wacc": wacc_details["wacc_formula"],
        "terminal_value": (
            f"({last_year_fcf:,.2f} × (1 + {params.terminal_growth_rate_pct:.2f}%)) / "
            f"({wacc_pct:.2f}% - {params.terminal_growth_rate_pct:.2f}%) = {terminal_value:,.2f}"
        ),
        "pv_terminal_value": f"{terminal_value:,.2f} / (1 + {wacc_pct:.2f}%)^{n_years} = {pv_terminal_value:,.2f}",
        "enterprise_value": f"PV(FCFs) [{cumulative_pv_fcf:,.2f}] + PV(TV) [{pv_terminal_value:,.2f}] = {enterprise_value:,.2f}",
        "equity_value": (
            f"EV [{enterprise_value:,.2f}] + Cash [{params.cash_and_equivalents:,.2f}] - "
            f"Debt [{params.total_debt:,.2f}] - Minority [{params.minority_interest:,.2f}] - "
            f"Senior [{params.other_senior_claims:,.2f}] = {equity_value:,.2f}"
        ),
        "ev_reconciliation": (
            f"Equity Value [{equity_value:,.2f}] - Cash [{params.cash_and_equivalents:,.2f}] + "
            f"Debt [{params.total_debt:,.2f}] + Minority [{params.minority_interest:,.2f}] + "
            f"Senior [{params.other_senior_claims:,.2f}] = {enterprise_value:,.2f} [Balanced]"
        ),
        "intrinsic_value_per_share": (
            f"Equity Value [{equity_value:,.2f}] / Diluted Shares [{params.diluted_shares:,.2f}] = "
            f"₹{intrinsic_value_per_share:,.2f}"
        ),
    }

    return DCFCalculationOutput(
        model_version=MODEL_VERSION,
        symbol=params.symbol,
        reporting_currency=params.reporting_currency,
        reporting_unit=params.reporting_unit,
        calculated_at=datetime.now(timezone.utc).isoformat(),
        forecast_years=forecast_results,
        cumulative_pv_fcf=round(cumulative_pv_fcf, 2),
        terminal_fcf=round(terminal_fcf, 2),
        terminal_growth_rate_pct=round(params.terminal_growth_rate_pct, 2),
        discount_rate_wacc_pct=round(wacc_pct, 2),
        terminal_value=round(terminal_value, 2),
        pv_terminal_value=round(pv_terminal_value, 2),
        tv_as_pct_of_ev=round(tv_as_pct_of_ev, 2),
        enterprise_value=round(enterprise_value, 2),
        cash_and_equivalents=round(params.cash_and_equivalents, 2),
        total_debt=round(params.total_debt, 2),
        minority_interest=round(params.minority_interest, 2),
        other_senior_claims=round(params.other_senior_claims, 2),
        equity_value=round(equity_value, 2),
        diluted_shares=round(params.diluted_shares, 4),
        intrinsic_value_per_share=round(intrinsic_value_per_share, 2),
        current_market_price=round(params.current_market_price, 2) if params.current_market_price else None,
        implied_upside_downside_pct=round(upside_downside_pct, 2) if upside_downside_pct is not None else None,
        flags=flags,
        intermediate_formulas=intermediate_formulas,
    )
