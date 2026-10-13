"""
National Stock Exchange of India (NSE) MCP Protocol Client & Provider Adapter
Adheres strictly to the NSE Data Policy & Licensing Compliance Gate.
"""
import os
import json
import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from .base import (
    MarketDataProvider,
    CompanySearchProvider,
    ProviderInfo,
    MarketQuoteResult,
    SearchResult,
)


class NSEMCPClient:
    """
    Client for Model Context Protocol (MCP) endpoints provided by NSE India.
    Implements JSON-RPC 2.0 specification over HTTP.
    """
    def __init__(
        self,
        cmmkt_endpoint: str = "https://mcp.nseindia.in/cmmkt/mcp",
        bhavcopy_endpoint: str = "https://mcp.nseindia.in/bhavcopy/cm/mcp",
        timeout_seconds: float = 10.0,
    ):
        self.cmmkt_endpoint = cmmkt_endpoint
        self.bhavcopy_endpoint = bhavcopy_endpoint
        self.timeout = timeout_seconds
        self._headers = {
            "Content-Type": "application/json",
            "User-Agent": "DCF-Valuation-Platform-MCP-Client/1.0",
            "Accept": "application/json",
        }

    async def list_tools(self, endpoint: str) -> Dict[str, Any]:
        """Discovers available tools dynamically via MCP 'tools/list' request."""
        payload = {
            "jsonrpc": "2.0",
            "id": "list-tools-req",
            "method": "tools/list",
            "params": {},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(endpoint, json=payload, headers=self._headers)
            resp.raise_for_status()
            return resp.json()

    async def call_tool(self, endpoint: str, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Invokes a specific MCP tool schema."""
        payload = {
            "jsonrpc": "2.0",
            "id": f"call-{name}-req",
            "method": "tools/call",
            "params": {
                "name": name,
                "arguments": arguments,
            },
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(endpoint, json=payload, headers=self._headers)
            resp.raise_for_status()
            return resp.json()


class NSEMCPProvider(MarketDataProvider, CompanySearchProvider):
    """
    NSE MCP Provider with mandatory licensing compliance gate.
    """
    def __init__(self):
        self.license_approved = os.getenv("NSE_DATA_LICENSE_APPROVED", "false").lower() == "true"
        self.cmmkt_url = os.getenv("NSE_MCP_CMMKT_URL", "https://mcp.nseindia.in/cmmkt/mcp")
        self.bhavcopy_url = os.getenv("NSE_MCP_BHAVCOPY_URL", "https://mcp.nseindia.in/bhavcopy/cm/mcp")
        self.client = NSEMCPClient(
            cmmkt_endpoint=self.cmmkt_url,
            bhavcopy_endpoint=self.bhavcopy_url,
            timeout_seconds=float(os.getenv("NSE_MCP_TIMEOUT_SECONDS", "10.0")),
        )

    def get_info(self) -> ProviderInfo:
        return ProviderInfo(
            id="nse_mcp",
            name="NSE India Official MCP Gateway",
            provider_type="MARKET_DATA",
            description="Official Model Context Protocol (MCP) endpoints for NSE Capital Market real-time and Bhavcopy quotes.",
            is_enabled=self.license_approved,
            is_license_approved=self.license_approved,
            compliance_notice=(
                "Commercial redistribution of NSE Market Data requires an active commercial licensing agreement with "
                "NSE Data & Analytics Limited under the NSE Data Policy (https://www.nseindia.com/static/market-data/nse-data-policy). "
                "If not verified, this provider remains strictly gated to prevent unauthorized commercial scraping."
            ),
            documentation_url="https://www.nseindia.com/nse-mcp",
            endpoint_url=self.cmmkt_url,
        )

    async def health_check(self) -> Dict[str, Any]:
        if not self.license_approved:
            return {
                "status": "RESTRICTED",
                "licensed": False,
                "message": (
                    "NSE MCP provider is locked by compliance gate. "
                    "Set NSE_DATA_LICENSE_APPROVED=true in backend environment after obtaining official approval."
                ),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        try:
            # Probe tool list from market MCP endpoint
            result = await self.client.list_tools(self.cmmkt_url)
            return {
                "status": "ONLINE",
                "licensed": True,
                "tools_discovered": result.get("result", {}).get("tools", []),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        except Exception as e:
            return {
                "status": "OFFLINE",
                "licensed": True,
                "error": str(e),
                "message": "Failed to connect to NSE MCP endpoint. Connection timed out or endpoint unreachable.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

    async def get_latest_quote(self, symbol: str) -> Optional[MarketQuoteResult]:
        if not self.license_approved:
            # Strictly enforce licensing gate: never return fabricated data silently
            return None

        try:
            # Dynamically call the MCP market tool discovered on the server
            resp = await self.client.call_tool(
                self.cmmkt_url,
                "get_quote",
                {"symbol": symbol.upper()}
            )
            data = resp.get("result", {}).get("content", [{}])[0].get("data", {})
            if not data:
                return None

            return MarketQuoteResult(
                symbol=symbol.upper(),
                current_price=float(data.get("lastPrice", 0.0)),
                change=float(data.get("change", 0.0)),
                percent_change=float(data.get("pChange", 0.0)),
                day_high=float(data.get("dayHigh", 0.0)),
                day_low=float(data.get("dayLow", 0.0)),
                fifty_two_week_high=float(data.get("high52", 0.0)),
                fifty_two_week_low=float(data.get("low52", 0.0)),
                volume=int(data.get("totalTradedVolume", 0)),
                timestamp=datetime.now(timezone.utc).isoformat(),
                source="NSE Official MCP (cmmkt)",
                is_verified=True,
                licensing_tier="COMMERCIAL_LICENSED",
                licensing_notice="Verified under active NSE Data Agreement",
            )
        except Exception:
            return None

    async def search_companies(self, query: str) -> List[SearchResult]:
        if not self.license_approved:
            return []

        try:
            resp = await self.client.call_tool(
                self.cmmkt_url,
                "search_symbol",
                {"query": query}
            )
            items = resp.get("result", {}).get("content", [{}])[0].get("data", [])
            results = []
            for item in items:
                results.append(
                    SearchResult(
                        symbol=item.get("symbol", ""),
                        name=item.get("companyName", item.get("symbol", "")),
                        exchange="NSE",
                        isin=item.get("isin"),
                        sector=item.get("sector"),
                        industry=item.get("industry"),
                        source="NSE MCP",
                    )
                )
            return results
        except Exception:
            return []
