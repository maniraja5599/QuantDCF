import { NextRequest, NextResponse } from "next/server";
import { calculateSOTP } from "@/lib/serverless-engine";
import { SOTPValuationInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: SOTPValuationInput = await req.json();
    const result = calculateSOTP(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "SOTP valuation failed" },
      { status: 400 }
    );
  }
}
