import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Determine the real external URL (tunnel/proxy aware)
  const cfVisitor = request.headers.get("cf-visitor"); // Cloudflare sets this
  const forwardedProto = request.headers.get("x-forwarded-proto") || 
    (cfVisitor ? JSON.parse(cfVisitor).scheme : null) || "http";
  const forwardedHost = request.headers.get("x-forwarded-host") || 
    request.headers.get("cf-connecting-ip") ? request.headers.get("host") : null;
  
  // Build the external base URL
  // Cloudflare tunnel: host header = tunnel domain, but proto might be wrong
  const host = request.headers.get("host") || "localhost:3000";
  const proto = host.includes("trycloudflare.com") || host.includes("railway.app") 
    ? "https" 
    : forwardedProto;
  const baseUrl = `${proto}://${host}`;

  const { pathname } = request.nextUrl;

  // Skip API and static routes
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoginPage = pathname.startsWith("/login");

  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(baseUrl + pathname)}`, baseUrl));
  }

  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
