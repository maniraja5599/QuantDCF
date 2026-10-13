"""
DCF Valuation Platform - FastAPI Application Main Entrypoint
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.api.app.routers import (
    companies_router,
    financials_router,
    valuation_router,
    sources_router,
    reports_router,
    saved_router,
)
from services.api.app.providers.registry import provider_registry

app = FastAPI(
    title="Indian Equities DCF Valuation Platform API",
    description=(
        "Production-grade DCF calculation engine, verified fundamental financial statement "
        "normalization, and Model Context Protocol (MCP) market data gateway for Indian equities."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(companies_router)
app.include_router(financials_router)
app.include_router(valuation_router)
app.include_router(sources_router)
app.include_router(reports_router)
app.include_router(saved_router)


@app.get("/health", tags=["System"])
async def health_check():
    """System health check for hosting container probes (Railway, Render, Docker)."""
    providers_health = await provider_registry.get_all_health_statuses()
    return {
        "status": "healthy",
        "service": "dcf-valuation-api",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "providers": providers_health,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("services.api.main:app", host=host, port=port, reload=True)
