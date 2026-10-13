"""
Data Sources & Licensing Status Endpoints
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from ..providers.registry import provider_registry
from ..providers.base import ProviderInfo

router = APIRouter(prefix="/api/sources", tags=["Data Sources"])


@router.get("/list", response_model=List[ProviderInfo])
async def list_data_providers():
    """Lists registered market data and fundamental statement providers with legal compliance notices."""
    return provider_registry.list_providers()


@router.get("/health", response_model=Dict[str, Any])
async def check_providers_health():
    """Runs live connectivity and licensing health checks across all data adapters."""
    return await provider_registry.get_all_health_statuses()
