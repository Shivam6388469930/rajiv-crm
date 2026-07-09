// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // This is a lightweight, non-sensitive flag set by setToken() in
  // auth.service.ts — NOT the JWT itself. It only tells middleware whether
  // to let the request through; the actual API routes must still validate
  // the real access token on every request.
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "1";

  if (!isLoggedIn) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("authView", "login");
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};