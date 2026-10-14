import { NextRequest, NextResponse } from "next/server";
import { HistoricalStatement } from "@/lib/types";

function parseNumeric(val: string | undefined): number {
  if (!val) return 0;
  let s = val.trim().replace(/[₹$,]/g, "");
  if (s.startsWith("(") && s.endsWith(")")) {
    s = "-" + s.slice(1, -1);
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json(
        { detail: "Uploaded CSV must contain a header row and at least one data row" },
        { status: 400 }
      );
    }

    // Split headers
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const findCol = (aliases: string[]) => {
      return headers.findIndex((h) => aliases.some((a) => h.includes(a)));
    };

    const yrIdx = findCol(["year", "fiscal_year", "period", "fy"]);
    const revIdx = findCol(["revenue", "sales", "turnover", "total income"]);
    const opexIdx = findCol(["operating_expenses", "opex", "expenses", "costs"]);
    const ebitIdx = findCol(["ebit", "operating profit", "operating income"]);
    const taxIdx = findCol(["tax", "tax_expense", "provision for tax"]);
    const dnaIdx = findCol(["depreciation", "dna", "amortization", "d&a"]);
    const capexIdx = findCol(["capex", "capital expenditure"]);
    const wcIdx = findCol(["working_capital", "nwc", "net working capital"]);
    const nwcChangeIdx = findCol(["change_in_nwc", "change in working capital"]);
    const cashIdx = findCol(["cash", "cash_and_equivalents", "bank"]);
    const debtIdx = findCol(["debt", "total_debt", "borrowings"]);
    const minorityIdx = findCol(["minority", "minority_interest"]);
    const sharesIdx = findCol(["shares", "diluted_shares"]);

    const statements: HistoricalStatement[] = [];
    const now = new Date().toISOString();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length < 2) continue;

      const yrRaw = yrIdx >= 0 ? parts[yrIdx] : `${2020 + i - 1}`;
      const yrMatch = yrRaw.match(/\d{4}/);
      const fiscalYear = yrMatch ? parseInt(yrMatch[0], 10) : 2020 + i - 1;

      const rev = revIdx >= 0 ? parseNumeric(parts[revIdx]) : 0;
      const opex = opexIdx >= 0 ? parseNumeric(parts[opexIdx]) : 0;
      const ebit = ebitIdx >= 0 ? parseNumeric(parts[ebitIdx]) : rev - opex;
      const tax = taxIdx >= 0 ? parseNumeric(parts[taxIdx]) : ebit * 0.25;
      const dna = dnaIdx >= 0 ? parseNumeric(parts[dnaIdx]) : 0;
      const capex = capexIdx >= 0 ? parseNumeric(parts[capexIdx]) : 0;
      const wc = wcIdx >= 0 ? parseNumeric(parts[wcIdx]) : 0;
      const nwcChange = nwcChangeIdx >= 0 ? parseNumeric(parts[nwcChangeIdx]) : 0;
      const cash = cashIdx >= 0 ? parseNumeric(parts[cashIdx]) : 0;
      const debt = debtIdx >= 0 ? parseNumeric(parts[debtIdx]) : 0;
      const minority = minorityIdx >= 0 ? parseNumeric(parts[minorityIdx]) : 0;
      const shares = sharesIdx >= 0 ? parseNumeric(parts[sharesIdx]) : 100;

      statements.push({
        fiscal_year: fiscalYear,
        fiscal_period: `FY${String(fiscalYear).slice(-2)}`,
        revenue: rev,
        operating_expenses: opex,
        ebit: ebit,
        ebit_margin_pct: rev > 0 ? Number(((ebit / rev) * 100).toFixed(2)) : 0,
        tax_expense: tax,
        effective_tax_rate_pct: ebit > 0 ? Number(((tax / ebit) * 100).toFixed(2)) : 25.0,
        depreciation_amortization: dna,
        capex: capex,
        working_capital: wc,
        change_in_nwc: nwcChange,
        cash_and_equivalents: cash,
        total_debt: debt,
        minority_interest: minority,
        diluted_shares: shares,
        reporting_unit: "crore",
        reporting_currency: "INR",
        provenance: "USER_ENTERED",
        source_document: file.name,
        retrieval_timestamp: now,
      });
    }

    if (!statements.length) {
      return NextResponse.json(
        { detail: "No valid financial statement records found in uploaded file" },
        { status: 400 }
      );
    }

    return NextResponse.json(statements);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to parse statement file" },
      { status: 400 }
    );
  }
}
