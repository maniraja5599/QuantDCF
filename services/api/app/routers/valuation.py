"""
Valuation Endpoints: DCF, WACC, Sensitivity Analysis, and Scenario Modeling
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from ..engine.models import (
    DCFCalculationInput,
    DCFCalculationOutput,
    WACCInput,
)
from ..engine.dcf import calculate_dcf
from ..engine.wacc import calculate_wacc
from ..engine.sensitivity import calculate_sensitivity_matrix
from ..engine.scenarios import calculate_scenarios

router = APIRouter(prefix="/api/valuation", tags=["Valuation Engine"])


@router.post("/calculate", response_model=DCFCalculationOutput)
async def run_dcf_valuation(payload: DCFCalculationInput):
    """
    Executes a mathematically verified DCF valuation.
    Enforces WACC > terminal growth rate and returns detailed cash flows, bridge, and audit flags.
    """
    try:
        result = calculate_dcf(payload)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation calculation error: {str(e)}")


@router.post("/wacc", response_model=Dict[str, Any])
async def calculate_wacc_endpoint(payload: WACCInput):
    """
    Computes Cost of Equity (CAPM), After-tax Cost of Debt, and overall WACC.
    """
    try:
        wacc_pct, details = calculate_wacc(payload)
        return {
            "effective_wacc_pct": wacc_pct,
            "details": details,
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))


@router.post("/sensitivity", response_model=Dict[str, Any])
async def run_sensitivity_analysis(payload: DCFCalculationInput):
    """
    Generates a 2D sensitivity matrix of Intrinsic Value across WACC and Terminal Growth rates.
    """
    try:
        return calculate_sensitivity_matrix(payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Sensitivity calculation failed: {str(e)}")


@router.post("/scenarios", response_model=List[Dict[str, Any]])
async def run_scenarios(payload: DCFCalculationInput):
    """
    Generates Bull, Base, and Bear cases with differentiated margins, growth rates, and risk premiums.
    """
    try:
        return calculate_scenarios(payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Scenario generation failed: {str(e)}")
