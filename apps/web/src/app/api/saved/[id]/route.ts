import { NextRequest, NextResponse } from "next/server";
import { getSavedValuation, deleteSavedValuation } from "@/lib/serverless-engine";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const item = getSavedValuation(id);
  if (!item) {
    return NextResponse.json({ detail: "Saved valuation not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const success = deleteSavedValuation(id);
  if (!success) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
