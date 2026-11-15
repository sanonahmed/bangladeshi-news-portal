import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/[...all]/route";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: {} }));
vi.mock("better-auth/next-js", () => ({ toNextJsHandler: () => ({ POST: mocks.post, GET: vi.fn() }) }));
// Importing Redis into the login route would reintroduce the configuration dependency.
vi.mock("@/lib/redis", () => { throw new Error("Auth must not load Redis"); });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  mocks.post.mockResolvedValue(Response.json({ success: true }));
});
afterEach(() => vi.unstubAllEnvs());

function request(path: string) {
  return new NextRequest(`https://example.com/api/auth/${path}`, { method: "POST" });
}

it("blocks signup before invoking the authentication handler", async () => {
  for (const path of ["sign-up/email", "sign-up/email/"]) expect((await POST(request(path))).status).toBe(403);
  expect(mocks.post).not.toHaveBeenCalled();
});

it("lets Better Auth handle login, reset and sign-out without Redis", async () => {
  for (const path of ["sign-in/email", "sign-in/email/", "sign-in/social", "request-password-reset", "sign-out"]) {
    expect((await POST(request(path))).status).toBe(200);
  }
  expect(mocks.post).toHaveBeenCalledTimes(5);
});

it("preserves Better Auth's throttling response and retry header", async () => {
  mocks.post.mockResolvedValue(Response.json({ message: "Too many requests" }, {
    status: 429, headers: { "X-Retry-After": "900" },
  }));
  const response = await POST(request("sign-in/email"));
  expect(response.status).toBe(429);
  expect(response.headers.get("X-Retry-After")).toBe("900");
});

it("does not let invalid Redis settings interfere with authentication", async () => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-redis.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "invalid-token");
  expect((await POST(request("sign-in/email"))).status).toBe(200);
});
