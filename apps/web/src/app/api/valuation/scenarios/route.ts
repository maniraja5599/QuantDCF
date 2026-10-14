import { NextRequest, NextResponse } from "next/server";
import { calculateScenarios } from "@/lib/serverless-engine";
import { DCFCalculationInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: DCFCalculationInput = await req.json();
    const result = calculateScenarios(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Scenario calculation failed" },
      { status: 400 }
    );
  }
}
