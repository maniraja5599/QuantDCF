import { NextRequest, NextResponse } from "next/server";
import { recordVisitorLog, parseDeviceAndBrowser } from "@/lib/visitor-store";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    // 1. Extract Real IP Address from headers (works on Vercel, Cloudflare, proxies)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");

    let ip = "127.0.0.1";
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    } else if (cfConnectingIp) {
      ip = cfConnectingIp.trim();
    }

    // Sanitize local loopback if forwarded is empty
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "127.0.0.1";
    }

    // 2. Extract Geolocation from Vercel Edge Headers
    const city = req.headers.get("x-vercel-ip-city") || body.city || "Unknown";
    const country = req.headers.get("x-vercel-ip-country") || body.country || "IN";
    const region = req.headers.get("x-vercel-ip-country-region") || body.region || "IN";

    // 3. User-Agent parsing
    const userAgent = req.headers.get("user-agent") || body.userAgent || "Unknown Browser";
    const { deviceType, browser, os } = parseDeviceAndBrowser(userAgent);

    const page = body.page || "/";
    const referrer = body.referrer || req.headers.get("referer") || "Direct";

    const logged = recordVisitorLog({
      ip,
      city: city !== "Unknown" ? decodeURIComponent(city) : undefined,
      country,
      region,
      userAgent,
      deviceType,
      browser,
      os,
      page,
      referrer,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id: logged.id, ip: logged.ip });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
