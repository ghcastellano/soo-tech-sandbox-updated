import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Permitir embed do Framer
  res.headers.set(
    "Content-Security-Policy",
    "frame-ancestors https://*.framer.app https://*.framer.website https://framer.com https://www.framer.com 'self';"
  );

  // X-Frame-Options para compatibilidade
  res.headers.set("X-Frame-Options", "ALLOW-FROM https://*.framer.app");

  return res;
}

export const config = {
  matcher: "/:path*"
};
