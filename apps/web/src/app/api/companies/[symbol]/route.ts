import { NextRequest, NextResponse } from "next/server";
import { getCompany } from "@/lib/serverless-engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;
  const company = getCompany(symbol);
  if (!company) {
    return NextResponse.json({ detail: "Company not found" }, { status: 404 });
  }
  return NextResponse.json(company);
}
