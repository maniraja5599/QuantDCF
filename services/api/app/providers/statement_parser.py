"""
Audited Financial Statement Parser for User-Uploaded CSV and Excel (.xlsx) Files
Handles Indian number formatting, fiscal period alignment, and schema normalization.
"""
import io
import re
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .base import NormalizedFinancialPeriod, DocumentExtractionProvider, ProviderInfo


# Standard aliases for normalizing financial statement line items
FIELD_SYNONYMS = {
    "revenue": [
        "revenue", "revenue from operations", "sales", "net sales",
        "total income", "turnover", "gross revenue"
    ],
    "operating_expenses": [
        "operating expenses", "total expenses", "operating costs",
        "opex", "cost of sales", "total expenditure"
    ],
    "ebit": [
        "ebit", "operating profit", "operating profit (ebit)", "profit before interest and tax",
        "pbit", "operating income"
    ],
    "tax_expense": [
        "tax expense", "provision for tax", "taxes", "current tax",
        "income tax", "tax"
    ],
    "depreciation_amortization": [
        "depreciation and amortization", "depreciation", "d&a",
        "depreciation & amortisation", "depreciation and amortisation expenses"
    ],
    "capex": [
        "capex", "capital expenditure", "purchase of property plant and equipment",
        "additions to fixed assets", "capital expenditures"
    ],
    "working_capital": [
        "working capital", "net working capital", "current assets less current liabilities", "nwc"
    ],
    "change_in_nwc": [
        "change in working capital", "change in nwc", "working capital change",
        "increase decrease in working capital"
    ],
    "cash_and_equivalents": [
        "cash and cash equivalents", "cash and bank balances", "cash",
        "liquid funds", "marketable securities"
    ],
    "total_debt": [
        "total debt", "borrowings", "short term and long term debt",
        "long term debt", "total borrowings"
    ],
    "minority_interest": [
        "minority interest", "non-controlling interest", "non controlling interests"
    ],
    "diluted_shares": [
        "diluted shares", "shares outstanding", "weighted average number of equity shares",
        "number of shares", "shares"
    ],
}


def clean_numeric(val: Any) -> float:
    """Cleans currency strings, parentheses for negative numbers, and Indian commas."""
    if pd.isna(val) or val is None or val == "":
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace("₹", "").replace("$", "").replace(",", "")
    # Check for parentheses indicating negative: (100) -> -100
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    try:
        return float(s)
    except ValueError:
        return 0.0


def extract_year_from_header(header: str) -> Optional[int]:
    """Finds 4-digit or 2-digit fiscal year from header strings like 'FY2024', 'FY24', '2024'."""
    header = str(header).upper()
    # Match FY2024, FY24, 2024
    m4 = re.search(r"20\d{2}", header)
    if m4:
        return int(m4.group(0))
    m2 = re.search(r"FY(\d{2})", header)
    if m2:
        return 2000 + int(m2.group(1))
    return None


class StatementParser(DocumentExtractionProvider):
    def get_info(self) -> ProviderInfo:
        return ProviderInfo(
            id="statement_parser",
            name="Audited Statement Document Parser",
            provider_type="DOCUMENT_PARSER",
            description="Normalized extraction engine for audited balance sheets and profit & loss statements in CSV and XLSX format.",
            is_enabled=True,
            is_license_approved=True,
            compliance_notice="Parses verified user-supplied financial statements with provenance tracking.",
            documentation_url=None,
            endpoint_url=None,
        )

    async def extract_from_file(self, file_bytes: bytes, filename: str) -> List[NormalizedFinancialPeriod]:
        """
        Parses uploaded file and returns normalized historical periods sorted by fiscal year.
        Supports:
        - Matrix layout (Row 1: Line Item, Row 2+: Years in columns)
        - Columnar layout (Year, Revenue, EBIT, etc.)
        """
        if filename.lower().endswith(".xlsx") or filename.lower().endswith(".xls"):
            df = pd.read_excel(io.BytesIO(file_bytes), sheet_name=0)
        elif filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        else:
            raise ValueError(f"Unsupported file format: {filename}. Supported formats are .csv and .xlsx")

        df = df.dropna(how="all")
        if df.empty:
            raise ValueError("Uploaded file is empty.")

        # Determine orientation: Is the first column line items or years?
        first_col_values = df.iloc[:, 0].astype(str).str.lower().tolist()
        has_metric_names_in_col0 = any(
            any(syn in val for syn in ["revenue", "sales", "ebit", "profit", "tax"])
            for val in first_col_values
        )

        records: List[NormalizedFinancialPeriod] = []
        retrieval_ts = datetime.now(timezone.utc).isoformat()

        if has_metric_names_in_col0:
            # MATRIX FORMAT: Column 0 is metric name, Columns 1..N are years
            metric_col = df.columns[0]
            year_cols = [c for c in df.columns[1:] if extract_year_from_header(str(c)) is not None]
            
            if not year_cols:
                raise ValueError("Could not detect fiscal year columns (e.g. FY23, FY24, 2023, 2024) in file header.")

            # Map line items
            row_map: Dict[str, str] = {}
            for idx, row in df.iterrows():
                row_label = str(row[metric_col]).strip().lower()
                for field, synonyms in FIELD_SYNONYMS.items():
                    if field not in row_map and any(syn == row_label or syn in row_label for syn in synonyms):
                        row_map[field] = idx

            for col in year_cols:
                f_year = extract_year_from_header(str(col))
                if not f_year:
                    continue

                def get_val(field_name: str) -> float:
                    if field_name in row_map:
                        idx = row_map[field_name]
                        return clean_numeric(df.at[idx, col])
                    return 0.0

                rev = get_val("revenue")
                ebit = get_val("ebit")
                tax = get_val("tax_expense")
                opex = get_val("operating_expenses") or max(0.0, rev - ebit)
                dna = get_val("depreciation_amortization")
                capex = get_val("capex")
                wc = get_val("working_capital")
                chg_nwc = get_val("change_in_nwc")
                cash = get_val("cash_and_equivalents")
                debt = get_val("total_debt")
                minority = get_val("minority_interest")
                shares = get_val("diluted_shares")

                ebit_margin = (ebit / rev * 100.0) if rev > 0 else 0.0
                tax_rate = (tax / ebit * 100.0) if ebit > 0 else 25.17

                records.append(
                    NormalizedFinancialPeriod(
                        fiscal_year=f_year,
                        fiscal_period=f"FY{str(f_year)[-2:]}",
                        revenue=rev,
                        operating_expenses=opex,
                        ebit=ebit,
                        ebit_margin_pct=round(ebit_margin, 2),
                        tax_expense=tax,
                        effective_tax_rate_pct=round(tax_rate, 2),
                        depreciation_amortization=dna,
                        capex=capex,
                        working_capital=wc,
                        change_in_nwc=chg_nwc,
                        cash_and_equivalents=cash,
                        total_debt=debt,
                        minority_interest=minority,
                        diluted_shares=shares if shares > 0 else 1.0,
                        reporting_unit="crore",
                        reporting_currency="INR",
                        provenance="USER_ENTERED",
                        source_document=filename,
                        retrieval_timestamp=retrieval_ts,
                    )
                )
        else:
            # COLUMNAR FORMAT: Each row is a year
            # Lowercase columns for fuzzy mapping
            col_lookup = {str(c).lower().strip(): c for c in df.columns}
            for _, row in df.iterrows():
                # Detect year from first column or named year column
                year_val = None
                for ycol in ["year", "fiscal year", "fy", "period", df.columns[0]]:
                    if str(ycol).lower() in col_lookup:
                        extracted = extract_year_from_header(str(row[col_lookup[str(ycol).lower()]]))
                        if extracted:
                            year_val = extracted
                            break
                if not year_val:
                    continue

                def get_col_val(field_name: str) -> float:
                    for syn in FIELD_SYNONYMS[field_name]:
                        for col_name, orig_col in col_lookup.items():
                            if syn == col_name or syn in col_name:
                                return clean_numeric(row[orig_col])
                    return 0.0

                rev = get_col_val("revenue")
                ebit = get_col_val("ebit")
                tax = get_col_val("tax_expense")
                opex = get_col_val("operating_expenses") or max(0.0, rev - ebit)
                dna = get_col_val("depreciation_amortization")
                capex = get_col_val("capex")
                wc = get_col_val("working_capital")
                chg_nwc = get_col_val("change_in_nwc")
                cash = get_col_val("cash_and_equivalents")
                debt = get_col_val("total_debt")
                minority = get_col_val("minority_interest")
                shares = get_col_val("diluted_shares")

                ebit_margin = (ebit / rev * 100.0) if rev > 0 else 0.0
                tax_rate = (tax / ebit * 100.0) if ebit > 0 else 25.17

                records.append(
                    NormalizedFinancialPeriod(
                        fiscal_year=year_val,
                        fiscal_period=f"FY{str(year_val)[-2:]}",
                        revenue=rev,
                        operating_expenses=opex,
                        ebit=ebit,
                        ebit_margin_pct=round(ebit_margin, 2),
                        tax_expense=tax,
                        effective_tax_rate_pct=round(tax_rate, 2),
                        depreciation_amortization=dna,
                        capex=capex,
                        working_capital=wc,
                        change_in_nwc=chg_nwc,
                        cash_and_equivalents=cash,
                        total_debt=debt,
                        minority_interest=minority,
                        diluted_shares=shares if shares > 0 else 1.0,
                        reporting_unit="crore",
                        reporting_currency="INR",
                        provenance="USER_ENTERED",
                        source_document=filename,
                        retrieval_timestamp=retrieval_ts,
                    )
                )

        # Sort chronologically
        records.sort(key=lambda r: r.fiscal_year)
        if not records:
            raise ValueError("No valid financial periods could be extracted. Please check file format.")

        return records
