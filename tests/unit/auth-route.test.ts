import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/[...all]/route";

const mocks = vi.hoisted(() => ({ post: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: {} }));
vi.mock("better-auth/next-js", () => ({ toNextJsHandler: () => ({ POST: mocks.post, GET: vi.fn() }) }));
vi.mock("@/lib/redis", () => ({ loginRatelimit: { limit: mocks.limit } }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  mocks.limit.mockResolvedValue({ success: true });
  mocks.post.mockResolvedValue(Response.json({ success: true }));
});
afterEach(() => vi.unstubAllEnvs());

function request(path: string) {
  return new NextRequest(`https://example.com/api/auth/${path}`, {
    method: "POST", headers: { "x-forwarded-for": "192.0.2.1" },
  });
}

it("blocks signup before invoking the authentication handler", async () => {
  for (const path of ["sign-up/email", "sign-up/email/"]) expect((await POST(request(path))).status).toBe(403);
  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.limit).not.toHaveBeenCalled();
});

it("throttles password login, social login and password-reset requests", async () => {
  mocks.limit.mockResolvedValue({ success: false });
  for (const path of ["sign-in/email", "sign-in/social", "request-password-reset"]) {
    expect((await POST(request(path))).status).toBe(429);
  }
  expect(mocks.post).not.toHaveBeenCalled();
});

it("forwards allowed login requests and leaves sign-out available", async () => {
  expect((await POST(request("sign-in/email"))).status).toBe(200);
  expect(mocks.limit).toHaveBeenCalledTimes(1);
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  expect((await POST(request("sign-out"))).status).toBe(200);
  expect(mocks.post).toHaveBeenCalledTimes(2);
});
