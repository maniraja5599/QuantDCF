import { NextResponse } from "next/server";
import { getMarketLeaders } from "@/lib/serverless-engine";

export async function GET() {
  const leaders = await getMarketLeaders();
  return NextResponse.json(leaders);
}
