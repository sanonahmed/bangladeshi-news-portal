import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { enforceRateLimit } from "@/lib/request-security";

const headers = new Headers({ "x-forwarded-for": "192.0.2.1, 10.0.0.1" });
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it("rejects missing production configuration without calling a limiter", async () => {
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  const limit = vi.fn();
  expect((await enforceRateLimit({ limit }, headers, "login"))?.status).toBe(503);
  expect(limit).not.toHaveBeenCalled();
});

it("rejects limiter outages in production", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const limit = vi.fn().mockRejectedValue(new Error("offline"));
  expect((await enforceRateLimit({ limit }, headers, "login"))?.status).toBe(503);
});

it("returns a retry interval when throttled", async () => {
  const limit = vi.fn().mockResolvedValue({ success: false, reset: Date.now() + 60000 });
  const response = await enforceRateLimit({ limit }, headers, "login");
  expect(response?.status).toBe(429);
  expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThan(0);
  expect(limit).toHaveBeenCalledWith("login:192.0.2.1");
});

it("allows successful requests and avoids dummy Redis in local development", async () => {
  const limit = vi.fn().mockResolvedValue({ success: true });
  expect(await enforceRateLimit({ limit }, headers, "login")).toBeNull();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  limit.mockClear();
  expect(await enforceRateLimit({ limit }, new Headers(), "login")).toBeNull();
  expect(limit).not.toHaveBeenCalled();
});


it("rejects Upstash's success-on-timeout fallback in production", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const limit = vi.fn().mockResolvedValue({ success: true, reason: "timeout" });
  expect((await enforceRateLimit({ limit }, headers, "login"))?.status).toBe(503);
});
