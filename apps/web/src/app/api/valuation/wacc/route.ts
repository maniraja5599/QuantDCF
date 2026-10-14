import { NextRequest, NextResponse } from "next/server";
import { calculateWACC } from "@/lib/serverless-engine";
import { WACCAssumptions } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: WACCAssumptions = await req.json();
    const result = calculateWACC(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "WACC calculation failed" },
      { status: 400 }
    );
  }
}
