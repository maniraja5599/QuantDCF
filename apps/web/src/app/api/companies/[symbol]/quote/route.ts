import { NextRequest, NextResponse } from "next/server";
import { getMarketQuote } from "@/lib/serverless-engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const quote = await getMarketQuote(symbol);
  if (!quote) {
    return NextResponse.json({ detail: "Quote not found" }, { status: 404 });
  }
  return NextResponse.json(quote);
}
