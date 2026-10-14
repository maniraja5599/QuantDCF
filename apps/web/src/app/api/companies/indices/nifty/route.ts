import { NextResponse } from "next/server";
import { getNiftyQuote } from "@/lib/serverless-engine";

export async function GET() {
  const quote = await getNiftyQuote();
  return NextResponse.json(quote);
}
