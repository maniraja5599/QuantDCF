"""
Tests for StatementParser (CSV & Excel uploads)
"""
import pytest
from services.api.app.providers.statement_parser import StatementParser


@pytest.mark.asyncio
async def test_parse_csv_matrix_format():
    parser = StatementParser()
    csv_content = """Line Item,FY22,FY23,FY24
Revenue from Operations,10000,12000,14500
Operating Expenses,7500,9000,10500
Operating Profit (EBIT),2500,3000,4000
Tax Expense,625,750,1000
Depreciation and Amortization,400,500,600
Capital Expenditure,500,600,700
Net Working Capital,2000,2400,2900
Cash and Cash Equivalents,1200,1500,1800
Total Debt,300,250,200
Diluted Shares,100,100,100
"""
    file_bytes = csv_content.encode("utf-8")
    periods = await parser.extract_from_file(file_bytes, "audited_sample.csv")

    assert len(periods) == 3
    assert periods[0].fiscal_year == 2022
    assert periods[0].revenue == 10000.0
    assert periods[2].fiscal_year == 2024
    assert periods[2].revenue == 14500.0
    assert periods[2].ebit == 4000.0
    assert periods[2].provenance == "USER_ENTERED"
    assert periods[2].source_document == "audited_sample.csv"
