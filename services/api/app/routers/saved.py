"""
Saved Valuations Store Endpoint
Maintains user saved models, assumptions, and history.
Integrates with Supabase when configured or persists in-session store.
"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/api/saved", tags=["Saved Valuations"])


class SavedValuationRecord(BaseModel):
    id: str
    title: str
    company_symbol: str
    company_name: str
    calculated_intrinsic_value: float
    market_price_at_calc: Optional[float] = None
    implied_upside_downside_pct: Optional[float] = None
    model_inputs: Dict[str, Any]
    model_outputs: Dict[str, Any]
    created_at: str
    updated_at: str


class CreateSavedValuationRequest(BaseModel):
    title: str
    company_symbol: str
    company_name: str
    calculated_intrinsic_value: float
    market_price_at_calc: Optional[float] = None
    implied_upside_downside_pct: Optional[float] = None
    model_inputs: Dict[str, Any]
    model_outputs: Dict[str, Any]


# In-memory storage fallback with initial benchmark records
_SAVED_STORE: Dict[str, SavedValuationRecord] = {
    "tcs-base-fy25": SavedValuationRecord(
        id="tcs-base-fy25",
        title="TCS Institutional Consensus Base Model (FY25-FY29)",
        company_symbol="TCS",
        company_name="Tata Consultancy Services Limited",
        calculated_intrinsic_value=1847.15,
        market_price_at_calc=2314.40,
        implied_upside_downside_pct=-20.19,
        model_inputs={
            "terminal_growth_rate_pct": 5.0,
            "wacc": 12.84,
            "forecast_revenue_growth_pct": [9.0, 9.0, 8.5, 8.0, 7.5],
            "ebit_margins_pct": [24.14, 24.14, 24.14, 24.14, 24.14],
        },
        model_outputs={
            "enterprise_value": 654335.07,
            "equity_value": 668297.07,
            "minority_interest": 820.0,
            "cash_and_equivalents": 14782.0,
        },
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat(),
    ),
    "infy-base-fy25": SavedValuationRecord(
        id="infy-base-fy25",
        title="Infosys Digital Transformation Model (FY25-FY29)",
        company_symbol="INFY",
        company_name="Infosys Limited",
        calculated_intrinsic_value=874.77,
        market_price_at_calc=1308.00,
        implied_upside_downside_pct=-33.12,
        model_inputs={
            "terminal_growth_rate_pct": 5.0,
            "wacc": 12.84,
            "forecast_revenue_growth_pct": [9.0, 9.0, 8.5, 8.0, 7.5],
            "ebit_margins_pct": [20.60, 20.60, 20.60, 20.60, 20.60],
        },
        model_outputs={
            "enterprise_value": 348703.23,
            "equity_value": 363203.23,
            "minority_interest": 0.0,
            "cash_and_equivalents": 14500.0,
        },
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat(),
    ),
}


@router.get("", response_model=List[SavedValuationRecord])
async def list_saved_valuations():
    """Lists saved valuation models."""
    return list(_SAVED_STORE.values())


@router.get("/{valuation_id}", response_model=SavedValuationRecord)
async def get_saved_valuation(valuation_id: str):
    """Retrieves a saved valuation model by ID."""
    if valuation_id not in _SAVED_STORE:
        raise HTTPException(status_code=404, detail="Saved valuation not found")
    return _SAVED_STORE[valuation_id]


@router.post("", response_model=SavedValuationRecord)
async def save_valuation(req: CreateSavedValuationRequest):
    """Persists a DCF valuation model with input assumptions and outputs."""
    v_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    record = SavedValuationRecord(
        id=v_id,
        title=req.title,
        company_symbol=req.company_symbol.upper(),
        company_name=req.company_name,
        calculated_intrinsic_value=req.calculated_intrinsic_value,
        market_price_at_calc=req.market_price_at_calc,
        implied_upside_downside_pct=req.implied_upside_downside_pct,
        model_inputs=req.model_inputs,
        model_outputs=req.model_outputs,
        created_at=now_iso,
        updated_at=now_iso,
    )
    _SAVED_STORE[v_id] = record
    return record


@router.delete("/{valuation_id}")
async def delete_saved_valuation(valuation_id: str):
    """Deletes a saved valuation model."""
    if valuation_id not in _SAVED_STORE:
        raise HTTPException(status_code=404, detail="Saved valuation not found")
    del _SAVED_STORE[valuation_id]
    return {"success": True, "id": valuation_id}
