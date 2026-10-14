import { NextResponse } from "next/server";
import { listSources } from "@/lib/serverless-engine";

export async function GET() {
  const sources = listSources();
  return NextResponse.json(sources);
}
