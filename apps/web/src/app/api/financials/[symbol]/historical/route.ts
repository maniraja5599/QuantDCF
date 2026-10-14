import { NextRequest, NextResponse } from "next/server";
import { getHistoricalFinancials } from "@/lib/serverless-engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const financials = await getHistoricalFinancials(symbol);
  return NextResponse.json(financials);
}
