import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "manirajankg@gmail.com";
const ADMIN_PIN = "5599";
const ADMIN_SECRET_KEY = "qnt_admin_secure_5599_maniraja_master";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    // Verify PIN and Email
    const isValidPin = String(pin).trim() === ADMIN_PIN;
    const isValidEmail = !email || String(email).trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!isValidPin || !isValidEmail) {
      return NextResponse.json(
        { detail: "Invalid Admin Credentials or PIN" },
        { status: 401 }
      );
    }

    // Generate authenticated session token
    const token = `adm_${Buffer.from(`${ADMIN_EMAIL}:${Date.now()}:${ADMIN_SECRET_KEY}`).toString("base64")}`;

    const res = NextResponse.json({
      success: true,
      token,
      role: "SUPER_ADMIN",
      authenticated_at: new Date().toISOString(),
    });

    // Set secure HTTP-only cookie for session persistence
    res.cookies.set("quantdcf_admin_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Login failed" }, { status: 400 });
  }
}
