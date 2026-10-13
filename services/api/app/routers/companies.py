"""
Company Search and Profile Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..providers.registry import provider_registry, VERIFIED_COMPANIES_CATALOG
from ..providers.base import SearchResult, MarketQuoteResult

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get("/search", response_model=List[SearchResult])
async def search_companies(q: str = Query(..., min_length=1, description="Company symbol or name")):
    """Searches for Indian equities across exchange catalog and MCP provider."""
    return await provider_registry.search_companies(q)


@router.get("/indices/nifty", response_model=dict)
async def get_nifty_quote():
    """Returns official real-time or Bhavcopy NIFTY 50 index level."""
    return await provider_registry.get_nifty_quote()


@router.get("/{symbol}", response_model=dict)
async def get_company_profile(symbol: str):
    """Returns official profile, sector, ISIN, and market data status for a company."""
    sym = symbol.strip().upper()
    for c in VERIFIED_COMPANIES_CATALOG:
        if c["symbol"] == sym:
            return {
                "symbol": c["symbol"],
                "name": c["name"],
                "exchange": c["exchange"],
                "isin": c.get("isin"),
                "sector": c.get("sector"),
                "industry": c.get("industry"),
                "has_audited_filings": c.get("has_audited_filings", False),
                "reporting_currency": "INR",
                "reporting_unit": "crore",
            }
    # If not in catalog, return minimal profile indicating unindexed
    return {
        "symbol": sym,
        "name": f"{sym} (User Query)",
        "exchange": "NSE",
        "isin": None,
        "sector": "Unclassified",
        "industry": "General",
        "has_audited_filings": False,
        "reporting_currency": "INR",
        "reporting_unit": "crore",
    }


@router.get("/{symbol}/quote", response_model=Optional[MarketQuoteResult])
async def get_company_quote(symbol: str):
    """Retrieves verified market quote snapshot from Bhavcopy or licensed MCP feed."""
    quote = await provider_registry.get_market_quote(symbol)
    if not quote:
        raise HTTPException(
            status_code=404,
            detail=f"Market quote snapshot not available for symbol '{symbol}'. Live MCP data requires commercial licensing approval."
        )
    return quote
