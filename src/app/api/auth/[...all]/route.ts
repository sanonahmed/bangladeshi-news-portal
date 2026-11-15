import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";
import { rejectPublicRegistration } from "@/lib/request-security";

const handlers = toNextJsHandler(auth.handler);
export const GET = handlers.GET;

export async function POST(request: NextRequest): Promise<Response> {
  const rejection = rejectPublicRegistration(request.method, request.nextUrl.pathname);
  if (rejection) return rejection;
  // Better Auth enforces its own rate limits without an external Redis service.
  return handlers.POST(request);
}
