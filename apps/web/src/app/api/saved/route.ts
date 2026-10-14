import { NextRequest, NextResponse } from "next/server";
import { getSavedValuations, saveValuation } from "@/lib/serverless-engine";

export async function GET() {
  const items = getSavedValuations();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = saveValuation(body);
    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to save valuation" },
      { status: 400 }
    );
  }
}
