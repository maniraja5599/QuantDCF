"""
Financial Statements Endpoints (Audited Filings & Statement Upload)
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from ..providers.registry import provider_registry
from ..providers.base import NormalizedFinancialPeriod

router = APIRouter(prefix="/api/financials", tags=["Financial Statements"])


@router.get("/{symbol}/historical", response_model=List[NormalizedFinancialPeriod])
async def get_historical_financials(symbol: str):
    """
    Returns normalized audited historical statements with provenance metadata.
    Returns empty list if no verified filings are on record (never silently returns fake numbers).
    """
    statements = await provider_registry.get_historical_financials(symbol)
    return statements


@router.post("/upload", response_model=List[NormalizedFinancialPeriod])
async def upload_financial_statement(file: UploadFile = File(...)):
    """
    Parses user-uploaded audited financial statement (CSV or XLSX).
    Extracts and normalizes revenue, EBIT, taxes, D&A, CapEx, debt, cash, and diluted shares.
    """
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a .csv or .xlsx audited statement file."
        )

    try:
        content = await file.read()
        parsed_periods = await provider_registry.parse_uploaded_statement(content, file.filename)
        return parsed_periods
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse statement: {str(e)}")
