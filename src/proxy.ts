import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { enforceRateLimit, rejectPublicRegistration } from "@/lib/request-security";
import { searchRatelimit } from "@/lib/redis";

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const registrationRejection = rejectPublicRegistration(request.method, pathname);
  if (registrationRejection) return registrationRejection;

  if (pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/login?notice=registration_disabled", request.url));
  }

  const limiter = pathname === "/search" && request.nextUrl.searchParams.has("q")
    ? searchRatelimit
    : null;
  if (limiter) {
    const rejection = await enforceRateLimit(limiter, request.headers, pathname.slice(1));
    if (rejection) return rejection;
  }

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie && AUTH_ROUTES.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/search",
    "/api/auth/sign-in/email",
    "/api/auth/sign-in/social",
    "/api/auth/sign-up/email",
  ],
};
