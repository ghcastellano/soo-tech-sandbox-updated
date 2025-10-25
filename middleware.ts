import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "ALLOWALL");
  res.headers.set("Content-Security-Policy", "frame-ancestors *;");
  return res;
}

export const config = {
  matcher: ["/:path*"]
};
