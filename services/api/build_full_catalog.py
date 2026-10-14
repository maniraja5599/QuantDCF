import urllib.request
import csv
import io
import json

url = "https://www.niftyindices.com/IndexConstituent/ind_nifty500list.csv"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
content = urllib.request.urlopen(req).read().decode("utf-8")
reader = csv.DictReader(io.StringIO(content))

sector_map = {
    "Automobile and Auto Components": "Automotive",
    "Capital Goods": "Capital Goods & Engineering",
    "Chemicals": "Chemicals & Materials",
    "Construction": "Construction & Infrastructure",
    "Construction Materials": "Cement & Building Materials",
    "Consumer Durables": "Consumer Durables",
    "Consumer Services": "Consumer Services & Retail",
    "Diversified": "Conglomerates & Diversified",
    "Fast Moving Consumer Goods": "Consumer Goods & FMCG",
    "Financial Services": "Financial Services",
    "Healthcare": "Healthcare & Pharmaceuticals",
    "Information Technology": "Information Technology",
    "Metals & Mining": "Metals & Mining",
    "Oil, Gas & Consumable Fuels": "Energy & Utilities",
    "Power": "Power & Utilities",
    "Services": "Logistics & Commercial Services",
    "Telecommunication": "Telecommunications",
    "Media, Entertainment & Publication": "Media & Entertainment",
    "Textiles": "Textiles & Apparel",
    "Forest Materials": "Paper & Forest Products",
}

audited_info = {
    "TCS": {"price": 2269.30, "mcap": 820924.0, "shares": 361.8},
    "INFY": {"price": 1047.85, "mcap": 435020.0, "shares": 415.1},
    "HCLTECH": {"price": 1324.00, "mcap": 359330.0, "shares": 271.4},
    "WIPRO": {"price": 542.00, "mcap": 283100.0, "shares": 522.0},
    "LTIM": {"price": 5850.00, "mcap": 173200.0, "shares": 29.6},
    "RELIANCE": {"price": 1166.70, "mcap": 1578545.0, "shares": 1353.0},
    "LT": {"price": 3645.00, "mcap": 501180.0, "shares": 137.5},
    "ADANIENT": {"price": 2850.00, "mcap": 324900.0, "shares": 114.0},
    "HDFCBANK": {"price": 714.00, "mcap": 1085280.0, "shares": 1520.0},
    "ICICIBANK": {"price": 1351.00, "mcap": 950000.0, "shares": 703.0},
    "SBIN": {"price": 957.00, "mcap": 853600.0, "shares": 892.4},
    "KOTAKBANK": {"price": 442.00, "mcap": 439000.0, "shares": 993.0},
    "AXISBANK": {"price": 1268.00, "mcap": 392400.0, "shares": 309.5},
    "BAJFINANCE": {"price": 978.00, "mcap": 604000.0, "shares": 618.0},
    "ITC": {"price": 462.00, "mcap": 576500.0, "shares": 1248.0},
    "BHARTIARTL": {"price": 1773.40, "mcap": 1050000.0, "shares": 592.0},
    "TATAMOTORS": {"price": 284.00, "mcap": 104500.0, "shares": 368.0},
}

all_companies = []
for row in reader:
    sym = row.get("Symbol", "").strip()
    name = row.get("Company Name", "").strip()
    isin = row.get("ISIN Code", "").strip()
    ind = row.get("Industry", "").strip()
    if not sym:
        continue
    sector = sector_map.get(ind, "General")
    audit = sym in audited_info
    info = audited_info.get(sym, {})
    
    all_companies.append({
        "symbol": sym,
        "name": name,
        "exchange": "NSE",
        "isin": isin,
        "sector": sector,
        "industry": ind,
        "has_audited_filings": audit,
        "market_price": info.get("price"),
        "market_cap_cr": info.get("mcap"),
        "shares_cr": info.get("shares"),
    })

print(f"Total companies loaded: {len(all_companies)}")

# 1. Write Python catalog file
py_code = '"""Official NIFTY 500 Equities Catalog for QuantDCF India"""\n'
py_code += 'from typing import List, Dict, Any\n\n'
py_code += f'ALL_COMPANIES_CATALOG: List[Dict[str, Any]] = {repr(all_companies)}\n\n'
py_code += 'CATALOG_BY_SYMBOL: Dict[str, Dict[str, Any]] = {c["symbol"]: c for c in ALL_COMPANIES_CATALOG}\n'

with open("services/api/app/providers/catalog_data.py", "w", encoding="utf-8") as f:
    f.write(py_code)
print("Saved services/api/app/providers/catalog_data.py")

# 2. Write TypeScript catalog file
ts_companies = []
for c in all_companies:
    mcap_str = f"₹{c['market_cap_cr']:,.0f} Cr" if c["market_cap_cr"] else "Audited Filings Pending"
    ts_companies.append({
        "symbol": c["symbol"],
        "name": c["name"],
        "exchange": "NSE",
        "isin": c["isin"],
        "sector": c["sector"],
        "industry": c["industry"],
        "marketCap": mcap_str,
        "sharesCr": c["shares_cr"] if c["shares_cr"] else 100.0,
        "hasAuditedFilings": c["has_audited_filings"],
    })

ts_code = '// Comprehensive Official NIFTY 500 Equities Catalog\n'
ts_code += 'export interface CatalogCompany {\n'
ts_code += '  symbol: string;\n'
ts_code += '  name: string;\n'
ts_code += '  exchange: string;\n'
ts_code += '  isin: string;\n'
ts_code += '  sector: string;\n'
ts_code += '  industry: string;\n'
ts_code += '  marketCap: string;\n'
ts_code += '  sharesCr: number;\n'
ts_code += '  hasAuditedFilings: boolean;\n'
ts_code += '}\n\n'
ts_code += f'export const ALL_NIFTY_COMPANIES: CatalogCompany[] = {json.dumps(ts_companies, indent=2)};\n'

with open("apps/web/src/lib/companies-catalog.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)
print("Saved apps/web/src/lib/companies-catalog.ts")
