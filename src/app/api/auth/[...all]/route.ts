import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";
import { enforceRateLimit, rejectPublicRegistration } from "@/lib/request-security";
import { loginRatelimit } from "@/lib/redis";

const handlers = toNextJsHandler(auth.handler);
export const GET = handlers.GET;

export async function POST(request: NextRequest): Promise<Response> {
  const rejection = rejectPublicRegistration(request.method, request.nextUrl.pathname);
  if (rejection) return rejection;
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "");
  if (["/api/auth/sign-in/email", "/api/auth/sign-in/social", "/api/auth/request-password-reset"].includes(pathname)) {
    const limited = await enforceRateLimit(loginRatelimit, request.headers, "auth");
    if (limited) return limited;
  }
  return handlers.POST(request);
}
