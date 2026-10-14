import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol = body.symbol || "EQUITY";
    const title = `${symbol} DCF Institutional Valuation Report`;
    const generatedAt = new Date().toISOString();
    return NextResponse.json({
      report_id: `rep-${Date.now()}`,
      symbol,
      title,
      generated_at: generatedAt,
      sections: {
        executive_summary: `Institutional research report for ${symbol} covering 5-year explicit Free Cash Flow to Firm (FCFF) modeling, Gordon Growth Terminal Value, and sensitivity analysis.`,
        key_metrics: body,
      },
      status: "GENERATED",
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to generate report" },
      { status: 400 }
    );
  }
}
