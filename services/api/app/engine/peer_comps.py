"""
Comparable Company Analysis (Peer Comps) Engine for Indian Equities
Calculates sector peer valuation multiples, median benchmarks, and implied equity value.
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel


class PeerMetric(BaseModel):
    symbol: str
    name: str
    current_price: float
    market_cap_cr: float
    forward_pe: float
    ev_ebit: float
    ev_sales: float
    price_to_book: float
    roic_pct: float
    ebit_margin_pct: float
    revenue_cagr_pct: float
    fcf_conversion_pct: float


class PeerCompsResponse(BaseModel):
    target_symbol: str
    sector: str
    peers: List[PeerMetric]
    sector_medians: Dict[str, float]
    implied_valuation: Dict[str, Optional[float]]
    valuation_spread_analysis: str


# Institutional Benchmark Dataset for Major Indian Equities
SECTOR_PEERS_DB: Dict[str, Dict[str, Any]] = {
    "IT": {
        "sector_name": "Information Technology / IT Services",
        "peers": [
            {
                "symbol": "TCS",
                "name": "Tata Consultancy Services",
                "current_price": 2269.0,
                "market_cap_cr": 820924.0,
                "forward_pe": 26.8,
                "ev_ebit": 21.2,
                "ev_sales": 5.25,
                "price_to_book": 11.8,
                "roic_pct": 54.2,
                "ebit_margin_pct": 24.6,
                "revenue_cagr_pct": 9.4,
                "fcf_conversion_pct": 82.5,
            },
            {
                "symbol": "INFY",
                "name": "Infosys Limited",
                "current_price": 1047.85,
                "market_cap_cr": 435020.0,
                "forward_pe": 23.4,
                "ev_ebit": 18.6,
                "ev_sales": 3.95,
                "price_to_book": 7.4,
                "roic_pct": 39.5,
                "ebit_margin_pct": 21.2,
                "revenue_cagr_pct": 8.8,
                "fcf_conversion_pct": 78.4,
            },
            {
                "symbol": "HCLTECH",
                "name": "HCL Technologies Limited",
                "current_price": 1324.0,
                "market_cap_cr": 359330.0,
                "forward_pe": 24.5,
                "ev_ebit": 17.8,
                "ev_sales": 3.80,
                "price_to_book": 6.8,
                "roic_pct": 32.1,
                "ebit_margin_pct": 18.2,
                "revenue_cagr_pct": 8.0,
                "fcf_conversion_pct": 85.0,
            },
            {
                "symbol": "WIPRO",
                "name": "Wipro Limited",
                "current_price": 542.0,
                "market_cap_cr": 283100.0,
                "forward_pe": 22.1,
                "ev_ebit": 16.4,
                "ev_sales": 3.10,
                "price_to_book": 3.9,
                "roic_pct": 18.4,
                "ebit_margin_pct": 16.1,
                "revenue_cagr_pct": 5.2,
                "fcf_conversion_pct": 72.0,
            },
            {
                "symbol": "LTIM",
                "name": "LTIMindtree Limited",
                "current_price": 5850.0,
                "market_cap_cr": 173200.0,
                "forward_pe": 31.2,
                "ev_ebit": 23.5,
                "ev_sales": 4.60,
                "price_to_book": 7.8,
                "roic_pct": 29.8,
                "ebit_margin_pct": 17.5,
                "revenue_cagr_pct": 11.2,
                "fcf_conversion_pct": 75.2,
            },
        ],
    },
    "CONGLOMERATE": {
        "sector_name": "Energy, Retail & Conglomerates",
        "peers": [
            {
                "symbol": "RELIANCE",
                "name": "Reliance Industries Limited",
                "current_price": 1166.7,
                "market_cap_cr": 1578545.0,
                "forward_pe": 22.5,
                "ev_ebit": 15.8,
                "ev_sales": 1.95,
                "price_to_book": 2.1,
                "roic_pct": 11.4,
                "ebit_margin_pct": 13.8,
                "revenue_cagr_pct": 12.5,
                "fcf_conversion_pct": 45.0,
            },
            {
                "symbol": "LT",
                "name": "Larsen & Toubro Limited",
                "current_price": 3645.0,
                "market_cap_cr": 501180.0,
                "forward_pe": 32.4,
                "ev_ebit": 24.2,
                "ev_sales": 2.30,
                "price_to_book": 5.2,
                "roic_pct": 16.2,
                "ebit_margin_pct": 10.4,
                "revenue_cagr_pct": 14.8,
                "fcf_conversion_pct": 58.0,
            },
            {
                "symbol": "ADANIENT",
                "name": "Adani Enterprises Limited",
                "current_price": 2850.0,
                "market_cap_cr": 324900.0,
                "forward_pe": 68.2,
                "ev_ebit": 32.5,
                "ev_sales": 3.10,
                "price_to_book": 7.9,
                "roic_pct": 9.2,
                "ebit_margin_pct": 8.5,
                "revenue_cagr_pct": 18.0,
                "fcf_conversion_pct": 32.0,
            },
            {
                "symbol": "TATACHEM",
                "name": "Tata Chemicals Limited",
                "current_price": 1080.0,
                "market_cap_cr": 27500.0,
                "forward_pe": 18.4,
                "ev_ebit": 12.1,
                "ev_sales": 1.65,
                "price_to_book": 1.4,
                "roic_pct": 8.5,
                "ebit_margin_pct": 14.2,
                "revenue_cagr_pct": 6.2,
                "fcf_conversion_pct": 52.0,
            },
        ],
    },
    "BFSI": {
        "sector_name": "Banking & Financial Services",
        "peers": [
            {
                "symbol": "HDFCBANK",
                "name": "HDFC Bank Limited",
                "current_price": 714.0,
                "market_cap_cr": 1085280.0,
                "forward_pe": 16.5,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 2.65,
                "roic_pct": 16.8,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 15.2,
                "fcf_conversion_pct": 0.0,
            },
            {
                "symbol": "ICICIBANK",
                "name": "ICICI Bank Limited",
                "current_price": 1351.0,
                "market_cap_cr": 950000.0,
                "forward_pe": 18.2,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 3.25,
                "roic_pct": 18.4,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 17.5,
                "fcf_conversion_pct": 0.0,
            },
            {
                "symbol": "SBIN",
                "name": "State Bank of India",
                "current_price": 957.0,
                "market_cap_cr": 853600.0,
                "forward_pe": 10.4,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 1.55,
                "roic_pct": 16.8,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 13.5,
                "fcf_conversion_pct": 0.0,
            },
            {
                "symbol": "KOTAKBANK",
                "name": "Kotak Mahindra Bank Limited",
                "current_price": 442.0,
                "market_cap_cr": 439000.0,
                "forward_pe": 19.8,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 2.50,
                "roic_pct": 14.8,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 13.5,
                "fcf_conversion_pct": 0.0,
            },
            {
                "symbol": "AXISBANK",
                "name": "Axis Bank Limited",
                "current_price": 1268.0,
                "market_cap_cr": 392400.0,
                "forward_pe": 13.5,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 1.75,
                "roic_pct": 17.2,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 14.8,
                "fcf_conversion_pct": 0.0,
            },
            {
                "symbol": "BAJFINANCE",
                "name": "Bajaj Finance Limited",
                "current_price": 978.0,
                "market_cap_cr": 604000.0,
                "forward_pe": 25.5,
                "ev_ebit": 0.0,
                "ev_sales": 0.0,
                "price_to_book": 4.50,
                "roic_pct": 21.5,
                "ebit_margin_pct": 0.0,
                "revenue_cagr_pct": 24.0,
                "fcf_conversion_pct": 0.0,
            },
        ],
    },
    "FMCG": {
        "sector_name": "Fast-Moving Consumer Goods (FMCG)",
        "peers": [
            {
                "symbol": "ITC",
                "name": "ITC Limited",
                "current_price": 462.0,
                "market_cap_cr": 576500.0,
                "forward_pe": 26.5,
                "ev_ebit": 19.5,
                "ev_sales": 7.70,
                "price_to_book": 7.8,
                "roic_pct": 34.5,
                "ebit_margin_pct": 34.5,
                "revenue_cagr_pct": 10.5,
                "fcf_conversion_pct": 84.0,
            },
            {
                "symbol": "HINDUNILVR",
                "name": "Hindustan Unilever Limited",
                "current_price": 2450.0,
                "market_cap_cr": 575000.0,
                "forward_pe": 54.0,
                "ev_ebit": 36.5,
                "ev_sales": 9.20,
                "price_to_book": 11.2,
                "roic_pct": 28.5,
                "ebit_margin_pct": 23.5,
                "revenue_cagr_pct": 7.5,
                "fcf_conversion_pct": 88.0,
            },
            {
                "symbol": "NESTLEIND",
                "name": "Nestle India Limited",
                "current_price": 2380.0,
                "market_cap_cr": 229000.0,
                "forward_pe": 68.0,
                "ev_ebit": 42.0,
                "ev_sales": 11.50,
                "price_to_book": 58.0,
                "roic_pct": 65.0,
                "ebit_margin_pct": 21.0,
                "revenue_cagr_pct": 8.8,
                "fcf_conversion_pct": 78.0,
            },
            {
                "symbol": "BRITANNIA",
                "name": "Britannia Industries Limited",
                "current_price": 5120.0,
                "market_cap_cr": 123000.0,
                "forward_pe": 52.0,
                "ev_ebit": 34.0,
                "ev_sales": 6.80,
                "price_to_book": 29.0,
                "roic_pct": 42.0,
                "ebit_margin_pct": 17.5,
                "revenue_cagr_pct": 9.2,
                "fcf_conversion_pct": 74.0,
            },
        ],
    },
    "AUTO": {
        "sector_name": "Automotive & Industrial Manufacturing",
        "peers": [
            {
                "symbol": "TATAMOTORS",
                "name": "Tata Motors Limited",
                "current_price": 284.0,
                "market_cap_cr": 104500.0,
                "forward_pe": 8.5,
                "ev_ebit": 5.2,
                "ev_sales": 0.65,
                "price_to_book": 1.85,
                "roic_pct": 18.5,
                "ebit_margin_pct": 10.5,
                "revenue_cagr_pct": 18.2,
                "fcf_conversion_pct": 65.0,
            },
            {
                "symbol": "MARUTI",
                "name": "Maruti Suzuki India Limited",
                "current_price": 12450.0,
                "market_cap_cr": 391000.0,
                "forward_pe": 28.5,
                "ev_ebit": 21.0,
                "ev_sales": 2.70,
                "price_to_book": 4.2,
                "roic_pct": 20.5,
                "ebit_margin_pct": 11.8,
                "revenue_cagr_pct": 12.0,
                "fcf_conversion_pct": 70.0,
            },
            {
                "symbol": "M&M",
                "name": "Mahindra & Mahindra Limited",
                "current_price": 2950.0,
                "market_cap_cr": 366000.0,
                "forward_pe": 27.0,
                "ev_ebit": 19.5,
                "ev_sales": 2.60,
                "price_to_book": 5.4,
                "roic_pct": 19.2,
                "ebit_margin_pct": 13.0,
                "revenue_cagr_pct": 16.5,
                "fcf_conversion_pct": 68.0,
            },
            {
                "symbol": "BHARTIARTL",
                "name": "Bharti Airtel Limited",
                "current_price": 1773.4,
                "market_cap_cr": 1050000.0,
                "forward_pe": 34.0,
                "ev_ebit": 18.5,
                "ev_sales": 6.80,
                "price_to_book": 9.2,
                "roic_pct": 16.5,
                "ebit_margin_pct": 35.0,
                "revenue_cagr_pct": 14.5,
                "fcf_conversion_pct": 52.0,
            },
        ],
    },
}


def get_peer_group_for_symbol(symbol: str) -> str:
    sym = symbol.upper()
    if sym in ["TCS", "INFY", "HCLTECH", "WIPRO", "LTIM", "TECHM"]:
        return "IT"
    elif sym in ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK", "BAJFINANCE"]:
        return "BFSI"
    elif sym in ["ITC", "HINDUNILVR", "NESTLEIND", "BRITANNIA"]:
        return "FMCG"
    elif sym in ["TATAMOTORS", "MARUTI", "M&M", "BHARTIARTL"]:
        return "AUTO"
    return "CONGLOMERATE"


def calculate_peer_comps(symbol: str, target_eps: Optional[float] = None, target_ebit: Optional[float] = None, target_revenue: Optional[float] = None) -> PeerCompsResponse:
    group_key = get_peer_group_for_symbol(symbol)
    data = SECTOR_PEERS_DB.get(group_key, SECTOR_PEERS_DB["IT"])
    peers_raw = data["peers"]
    peers = [PeerMetric(**p) for p in peers_raw]

    # Calculate medians
    def median(values: List[float]) -> float:
        valid = [v for v in values if v > 0]
        if not valid:
            return 0.0
        s = sorted(valid)
        n = len(s)
        mid = n // 2
        return (s[mid] if n % 2 != 0 else (s[mid - 1] + s[mid]) / 2.0)

    med_pe = median([p.forward_pe for p in peers])
    med_ev_ebit = median([p.ev_ebit for p in peers])
    med_ev_sales = median([p.ev_sales for p in peers])
    med_pb = median([p.price_to_book for p in peers])
    med_roic = median([p.roic_pct for p in peers])
    med_fcf_conv = median([p.fcf_conversion_pct for p in peers])

    medians = {
        "forward_pe": round(med_pe, 2),
        "ev_ebit": round(med_ev_ebit, 2),
        "ev_sales": round(med_ev_sales, 2),
        "price_to_book": round(med_pb, 2),
        "roic_pct": round(med_roic, 2),
        "fcf_conversion_pct": round(med_fcf_conv, 2),
    }

    # Implied value calculation if fundamentals provided
    implied: Dict[str, Optional[float]] = {
        "by_pe": round(target_eps * med_pe, 2) if target_eps and target_eps > 0 else None,
        "by_ev_ebit": round(target_ebit * med_ev_ebit, 2) if target_ebit and target_ebit > 0 else None,
        "by_ev_sales": round(target_revenue * med_ev_sales, 2) if target_revenue and target_revenue > 0 else None,
    }

    spread_text = (
        f"{symbol} benchmarks against {len(peers)} peers in {data['sector_name']}. "
        f"Sector Median P/E: {med_pe:.1f}x, EV/EBIT: {med_ev_ebit:.1f}x, ROIC: {med_roic:.1f}%."
    )

    return PeerCompsResponse(
        target_symbol=symbol.upper(),
        sector=data["sector_name"],
        peers=peers,
        sector_medians=medians,
        implied_valuation=implied,
        valuation_spread_analysis=spread_text,
    )
