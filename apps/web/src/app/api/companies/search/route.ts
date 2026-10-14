import { NextRequest, NextResponse } from "next/server";
import { searchCompanies } from "@/lib/serverless-engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const results = searchCompanies(q);
  return NextResponse.json(results);
}
