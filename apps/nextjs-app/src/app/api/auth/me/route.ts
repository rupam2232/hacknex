import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const cookies = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookies(cookies);

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: decoded });
}
