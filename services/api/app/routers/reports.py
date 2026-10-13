"""
Report Generation & Export Endpoints
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])


class ReportRequest(BaseModel):
    company_name: str
    symbol: str
    exchange: str
    valuation_result: Dict[str, Any]
    scenarios: Optional[List[Dict[str, Any]]] = None
    provenance_sources: Optional[List[str]] = None
    analyst_notes: Optional[str] = None


@router.post("/generate")
async def generate_valuation_report(req: ReportRequest):
    """
    Generates a structured institutional valuation memorandum with data provenance,
    breakdown formulas, sensitivity tables, and print-ready HTML.
    """
    res = req.valuation_result
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Construct print-ready executive memo HTML
    html_report = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>DCF Valuation Memorandum - {req.symbol}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }}
  .header {{ border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }}
  .title {{ font-size: 26px; font-weight: bold; margin: 0 0 6px 0; color: #0f172a; }}
  .subtitle {{ font-size: 14px; color: #64748b; }}
  .badge {{ display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }}
  .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }}
  .card {{ border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #f8fafc; }}
  .metric-label {{ font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }}
  .metric-value {{ font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 4px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }}
  th, td {{ padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; }}
  th {{ background: #f1f5f9; font-weight: 600; color: #334155; }}
  th:first-child, td:first-child {{ text-align: left; }}
  .disclaimer {{ margin-top: 40px; padding: 16px; border-left: 4px solid #f59e0b; background: #fef3c7; font-size: 11px; color: #92400e; }}
</style>
</head>
<body>
  <div class="header">
    <div class="badge">Institutional DCF Equity Research</div>
    <h1 class="title">{req.company_name} ({req.symbol})</h1>
    <div class="subtitle">Exchange: {req.exchange} | Valuation Timestamp: {generated_at} | Model: {res.get('model_version', '1.0.0')}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="metric-label">Intrinsic Value / Share</div>
      <div class="metric-value">₹{res.get('intrinsic_value_per_share', 0):,.2f}</div>
    </div>
    <div class="card">
      <div class="metric-label">Enterprise Value</div>
      <div class="metric-value">₹{res.get('enterprise_value', 0):,.2f} Cr</div>
    </div>
    <div class="card">
      <div class="metric-label">Discount Rate (WACC)</div>
      <div class="metric-value">{res.get('discount_rate_wacc_pct', 0):.2f}%</div>
    </div>
  </div>

  <h3>Projected Free Cash Flow Schedule (₹ Crore)</h3>
  <table>
    <thead>
      <tr>
        <th>Period</th>
        <th>Revenue</th>
        <th>EBIT</th>
        <th>NOPAT</th>
        <th>CapEx</th>
        <th>FCFF</th>
        <th>PV(FCFF)</th>
      </tr>
    </thead>
    <tbody>
"""
    for y in res.get("forecast_years", []):
        html_report += f"""      <tr>
        <td>{y.get('year_label')}</td>
        <td>₹{y.get('revenue', 0):,.2f}</td>
        <td>₹{y.get('ebit', 0):,.2f}</td>
        <td>₹{y.get('nopat', 0):,.2f}</td>
        <td>₹{y.get('capex', 0):,.2f}</td>
        <td>₹{y.get('free_cash_flow', 0):,.2f}</td>
        <td>₹{y.get('pv_fcf', 0):,.2f}</td>
      </tr>
"""

    html_report += f"""    </tbody>
  </table>

  <h3>Enterprise Value to Equity Value Reconciliation</h3>
  <table>
    <tbody>
      <tr><td>Cumulative PV of 5-Yr Cash Flows</td><td>₹{res.get('cumulative_pv_fcf', 0):,.2f} Cr</td></tr>
      <tr><td>Present Value of Terminal Value ({res.get('tv_as_pct_of_ev', 0):.1f}% of EV)</td><td>₹{res.get('pv_terminal_value', 0):,.2f} Cr</td></tr>
      <tr><td><strong>Enterprise Value</strong></td><td><strong>₹{res.get('enterprise_value', 0):,.2f} Cr</strong></td></tr>
      <tr><td>(+) Cash & Liquid Investments</td><td>₹{res.get('cash_and_equivalents', 0):,.2f} Cr</td></tr>
      <tr><td>(-) Total Outstanding Debt</td><td>₹{res.get('total_debt', 0):,.2f} Cr</td></tr>
      <tr><td>(-) Minority Interest & Senior Claims</td><td>₹{res.get('minority_interest', 0) + res.get('other_senior_claims', 0):,.2f} Cr</td></tr>
      <tr><td><strong>Implied Equity Value</strong></td><td><strong>₹{res.get('equity_value', 0):,.2f} Cr</strong></td></tr>
      <tr><td>Diluted Shares Outstanding</td><td>{res.get('diluted_shares', 0):,.2f} Cr shares</td></tr>
      <tr><td><strong>Intrinsic Value Per Diluted Share</strong></td><td><strong>₹{res.get('intrinsic_value_per_share', 0):,.2f}</strong></td></tr>
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>REGULATORY DISCLAIMER & LIMITATIONS:</strong>
    This automated valuation model is strictly for analytical, research, and educational purposes.
    It does not constitute an investment recommendation or financial advisory opinion.
    Calculations depend upon user-specified and historically reported inputs.
  </div>
</body>
</html>
"""

    return {
        "symbol": req.symbol,
        "company_name": req.company_name,
        "generated_at": generated_at,
        "summary": {
            "intrinsic_value_per_share": res.get("intrinsic_value_per_share"),
            "enterprise_value": res.get("enterprise_value"),
            "equity_value": res.get("equity_value"),
            "wacc_pct": res.get("discount_rate_wacc_pct"),
            "terminal_growth_pct": res.get("terminal_growth_rate_pct"),
        },
        "html_document": html_report,
    }
