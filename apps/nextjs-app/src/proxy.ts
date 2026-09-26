import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookies } from "@/lib/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard", "/create-job", "/jobs", "/applications"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const cookies = req.headers.get("cookie") || undefined;
    const token = getTokenFromCookies(cookies);

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "employer") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
