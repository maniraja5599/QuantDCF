import { NextRequest, NextResponse } from "next/server";
import { calculateBFSI } from "@/lib/serverless-engine";
import { BFSIValuationInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: BFSIValuationInput = await req.json();
    const result = calculateBFSI(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "BFSI valuation failed" },
      { status: 400 }
    );
  }
}
