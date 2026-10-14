import { NextResponse } from "next/server";
import { getSourcesHealth } from "@/lib/serverless-engine";

export async function GET() {
  const health = getSourcesHealth();
  return NextResponse.json(health);
}
