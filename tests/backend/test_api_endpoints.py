"""
Integration Tests for FastAPI Endpoints
"""
import pytest
from httpx import AsyncClient, ASGITransport
from services.api.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "providers" in data


@pytest.mark.asyncio
async def test_company_search_and_profile_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Search
        resp = await client.get("/api/companies/search?q=INFY")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) >= 1
        assert results[0]["symbol"] == "INFY"

        # Profile
        resp2 = await client.get("/api/companies/INFY")
        assert resp2.status_code == 200
        profile = resp2.json()
        assert "Infosys" in profile["name"]


@pytest.mark.asyncio
async def test_financials_historical_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/financials/TCS/historical")
        assert resp.status_code == 200
        statements = resp.json()
        assert len(statements) == 5
        assert statements[-1]["fiscal_year"] == 2024


@pytest.mark.asyncio
async def test_valuation_calculation_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "symbol": "TCS",
            "reporting_currency": "INR",
            "reporting_unit": "crore",
            "base_revenue": 240893.0,
            "diluted_shares": 361.8,
            "cash_and_equivalents": 14782.0,
            "total_debt": 0.0,
            "minority_interest": 820.0,
            "other_senior_claims": 0.0,
            "terminal_growth_rate_pct": 5.0,
            "wacc_input": {
                "risk_free_rate_pct": 7.10,
                "equity_risk_premium_pct": 6.50,
                "beta": 1.0,
                "pre_tax_cost_of_debt_pct": 8.0,
                "effective_tax_rate_pct": 25.43,
                "weight_equity_pct": 95.0,
                "weight_debt_pct": 5.0
            },
            "forecasts": [
                {
                    "year_index": i,
                    "year_label": f"FY{24+i}E",
                    "revenue_growth_pct": 8.5,
                    "ebit_margin_pct": 24.5,
                    "tax_rate_pct": 25.4,
                    "capex_pct_of_rev": 1.5,
                    "dna_pct_of_rev": 2.1,
                    "nwc_change_pct_of_rev": 1.0
                }
                for i in range(1, 6)
            ],
            "current_market_price": 4125.50
        }
        resp = await client.post("/api/valuation/calculate", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["intrinsic_value_per_share"] > 0
        assert data["enterprise_value"] > 0
        assert "intermediate_formulas" in data


@pytest.mark.asyncio
async def test_saved_valuations_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/saved")
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) >= 2
