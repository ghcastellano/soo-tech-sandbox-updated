import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_: NextRequest) {
  const res = NextResponse.next();

  // CSP permitindo embed. Restrinja se preferir:
  // "frame-ancestors https://*.framer.app https://*.framer.website https://www.framer.com 'self';"
  res.headers.set("Content-Security-Policy", "frame-ancestors *;");

  // Compatibilidade com navegadores antigos
  res.headers.set("X-Frame-Options", "ALLOWALL");

  return res;
}

export const config = {
  matcher: ["/:path*"]
};
