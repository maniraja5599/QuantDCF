"""
Abstract Base Classes for Financial Data Providers
Enforces clean separation between data ingestion and DCF valuation calculations.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class ProviderInfo(BaseModel):
    id: str
    name: str
    provider_type: str  # MARKET_DATA, FUNDAMENTALS, SEARCH, DOCUMENT_PARSER
    description: str
    is_enabled: bool
    is_license_approved: bool
    compliance_notice: str
    documentation_url: Optional[str] = None
    endpoint_url: Optional[str] = None


class SearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    isin: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    source: str


class MarketQuoteResult(BaseModel):
    symbol: str
    current_price: float
    change: float
    percent_change: float
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    diluted_shares: Optional[float] = None
    timestamp: str
    source: str
    is_verified: bool
    licensing_tier: str
    licensing_notice: str


class NormalizedFinancialPeriod(BaseModel):
    fiscal_year: int
    fiscal_period: str  # e.g. "FY24"
    period_end_date: Optional[str] = None
    revenue: float
    operating_expenses: float
    ebit: float
    ebit_margin_pct: float
    tax_expense: float
    effective_tax_rate_pct: float
    depreciation_amortization: float
    capex: float
    working_capital: float
    change_in_nwc: float
    cash_and_equivalents: float
    total_debt: float
    minority_interest: float
    diluted_shares: float
    reporting_unit: str  # crore, lakh, million, etc.
    reporting_currency: str  # INR, USD
    provenance: str  # AUDITED, REPORTED, ESTIMATED, USER_ENTERED
    source_document: Optional[str] = None
    source_url: Optional[str] = None
    retrieval_timestamp: str


class CompanySearchProvider(ABC):
    @abstractmethod
    async def search_companies(self, query: str) -> List[SearchResult]:
        pass

    @abstractmethod
    def get_info(self) -> ProviderInfo:
        pass


class MarketDataProvider(ABC):
    @abstractmethod
    async def get_latest_quote(self, symbol: str) -> Optional[MarketQuoteResult]:
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_info(self) -> ProviderInfo:
        pass


class FundamentalDataProvider(ABC):
    @abstractmethod
    async def get_historical_financials(self, symbol: str) -> List[NormalizedFinancialPeriod]:
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_info(self) -> ProviderInfo:
        pass


class DocumentExtractionProvider(ABC):
    @abstractmethod
    async def extract_from_file(self, file_bytes: bytes, filename: str) -> List[NormalizedFinancialPeriod]:
        pass

    @abstractmethod
    def get_info(self) -> ProviderInfo:
        pass
