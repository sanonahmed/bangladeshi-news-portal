import { NextResponse } from "next/server";

export type RateLimiter = {
  limit: (identifier: string) => Promise<{
    success: boolean;
    reset?: number;
    reason?: string;
  }>;
};

/** Handles registration at the auth boundary rather than relying on a blocked page. */
export function rejectPublicRegistration(
  method: string,
  pathname: string,
): NextResponse | null {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isEmailRegistration = normalizedPath === "/api/auth/sign-up/email";
  // Social and OAuth callbacks require the identity details fetched by Better
  // Auth before deciding whether this is an existing user. They cannot be
  // rejected here without also blocking legitimate existing-user login.
  if (method === "POST" && isEmailRegistration) {
    return NextResponse.json(
      { error: "Public registration is disabled. Contact a super administrator." },
      { status: 403 },
    );
  }
  return null;
}

/** Forwarded addresses are trusted only when the platform overwrites this header. */
export function getRequestIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function isProductionEnvironment(nodeEnv: string | undefined): boolean {
  return nodeEnv === "production";
}

export function isRedisConfigured(env: NodeJS.ProcessEnv): boolean {
  return Boolean(
    env.UPSTASH_REDIS_REST_URL &&
      env.UPSTASH_REDIS_REST_TOKEN &&
      env.UPSTASH_REDIS_REST_URL !== "https://mock-redis.upstash.io",
  );
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function rateLimitAvailable(): boolean {
  return !isProduction() || isRedisConfigured(process.env);
}

/** Null indicates that this source is invalid; no limiter should be called. */
export function ipRateLimitIdentifier(
  headers: Headers,
): string | null {
  if (isProduction() && !headers.get("x-forwarded-for")) return null;
  return getRequestIp(headers);
}

/** Keep development usable, but do not silently run an unthrottled production endpoint. */
export async function enforceRateLimit(
  limiter: RateLimiter,
  headers: Headers,
  prefix: string,
): Promise<NextResponse | null> {
  if (!rateLimitAvailable()) {
    return NextResponse.json(
      { error: "Request protection is unavailable. Configure Redis rate limiting." },
      { status: 503 },
    );
  }

  if (!isProduction() && !isRedisConfigured(process.env)) return null;

  const identifier = ipRateLimitIdentifier(headers);
  if (!identifier) {
    return NextResponse.json(
      { error: "Request forwarding information is required" },
      { status: 400 },
    );
  }

  try {
    const result = await limiter.limit(`${prefix}:${identifier}`);
    // Upstash's timeout fallback reports success=true. It must not bypass
    // protection on production endpoints when Redis cannot respond.
    if (result.reason === "timeout") throw new Error("Rate limiter timed out");
    if (!result.success) {
      const retryAfter = result.reset
        ? Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
        : 60;
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  } catch (error) {
    if (isProduction()) {
      console.error(`Rate limit unavailable for ${prefix}:`, error);
      return NextResponse.json(
        { error: "Request protection is temporarily unavailable" },
        { status: 503 },
      );
    }
  }
  return null;
}
