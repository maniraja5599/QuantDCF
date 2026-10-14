import { NextRequest, NextResponse } from "next/server";
import { getPeerComps } from "@/lib/serverless-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const { searchParams } = new URL(req.url);
  const eps = searchParams.get("eps") ? Number(searchParams.get("eps")) : undefined;
  const ebit = searchParams.get("ebit") ? Number(searchParams.get("ebit")) : undefined;
  const revenue = searchParams.get("revenue") ? Number(searchParams.get("revenue")) : undefined;

  const result = getPeerComps(symbol, { eps, ebit, revenue });
  return NextResponse.json(result);
}
