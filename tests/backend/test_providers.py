"""
Tests for Provider Architecture, Licensing Gate, and Verified Statements
"""
import pytest
from services.api.app.providers.registry import provider_registry
from services.api.app.providers.nse_mcp import NSEMCPProvider


@pytest.mark.asyncio
async def test_licensing_gate_default_behavior():
    """Verify that by default NSE licensing gate prevents unauthorized requests"""
    nse = NSEMCPProvider()
    assert nse.license_approved is False
    
    # When license is not approved, quote returns None rather than fake numbers
    quote = await nse.get_latest_quote("TCS")
    assert quote is None

    # Health check reflects restricted licensing status
    health = await nse.health_check()
    assert health["status"] == "RESTRICTED"
    assert health["licensed"] is False


@pytest.mark.asyncio
async def test_verified_fundamental_filings():
    """Verify TCS has 5 years of verified audited financials"""
    periods = await provider_registry.get_historical_financials("TCS")
    assert len(periods) == 5
    
    # Check FY24 audited figures for TCS
    fy24 = next(p for p in periods if p.fiscal_year == 2024)
    assert fy24.revenue == 240893.0  # ₹2,40,893 Cr
    assert fy24.ebit == 58153.0      # ₹58,153 Cr
    assert fy24.provenance == "AUDITED"
    assert "TCS Integrated Annual Report" in fy24.source_document


@pytest.mark.asyncio
async def test_unverified_company_returns_empty_not_fake():
    """Verify that an unknown or unverified company does NOT receive fabricated data"""
    periods = await provider_registry.get_historical_financials("UNKNOWN_CORP_XYZ")
    assert periods == []


@pytest.mark.asyncio
async def test_company_search():
    results = await provider_registry.search_companies("TCS")
    assert len(results) >= 1
    assert results[0].symbol == "TCS"
    assert results[0].exchange == "NSE"
