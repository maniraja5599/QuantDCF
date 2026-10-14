import { NextRequest, NextResponse } from "next/server";
import { getVisitorLogs, getVisitorStats, clearVisitorLogs } from "@/lib/visitor-store";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("quantdcf_admin_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken;

  return Boolean(token && token.startsWith("adm_"));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ detail: "Unauthorized Admin Access" }, { status: 401 });
  }

  const visitors = getVisitorLogs();
  const stats = getVisitorStats();

  return NextResponse.json({ visitors, stats, timestamp: new Date().toISOString() });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ detail: "Unauthorized Admin Access" }, { status: 401 });
  }

  clearVisitorLogs();
  return NextResponse.json({ success: true, message: "Visitor logs cleared successfully." });
}
