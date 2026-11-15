import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { hashPassword } from "better-auth/crypto";
import type { MemoryDB } from "better-auth/adapters/memory";

// Exercise the real production auth configuration and HTTP handlers. Only the
// database and email delivery are replaced; no external accounts are changed.
type AuthTestDB = Record<"user" | "account" | "session" | "verification", MemoryDB[string]>;
const fixtures = vi.hoisted(() => ({ db: { user: [], account: [], session: [], verification: [] } as AuthTestDB }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("better-auth/adapters/drizzle", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory");
  return { drizzleAdapter: () => memoryAdapter(fixtures.db) };
});
vi.mock("@/lib/resend", () => ({ sendVerificationEmail: vi.fn(), sendPasswordResetEmail: vi.fn() }));
vi.mock("@/lib/redis", () => { throw new Error("Auth must not load Redis"); });

let route: typeof import("@/app/api/auth/[...all]/route");
const email = "login-regression@example.com";
const password = "test-only-login-password-123";

beforeAll(async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-only-92e6b2e38ba44f6e88bc49d338c354b6");
  vi.stubEnv("BETTER_AUTH_URL", "https://example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("GOOGLE_CLIENT_ID", "");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
  fixtures.db.user.push({
    id: "login-test-user", name: "Test Staff", email, emailVerified: true,
    role: "super_admin", banned: false, createdAt: new Date(), updatedAt: new Date(),
  });
  fixtures.db.account.push({
    id: "login-test-account", userId: "login-test-user", accountId: "login-test-user",
    providerId: "credential", password: await hashPassword(password),
    createdAt: new Date(), updatedAt: new Date(),
  });
  route = await import("@/app/api/auth/[...all]/route");
});
afterAll(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

function request(path: string, body: object, ip = "192.0.2.10") {
  return new NextRequest(`https://example.com/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.com", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

it("logs a staff user in and issues a usable secure session with no Redis configuration", async () => {
  const response = await route.POST(request("sign-in/email", { email, password }));
  expect(response.status).toBe(200);
  expect((await response.json()).user.role).toBe("super_admin");
  const cookie = response.headers.getSetCookie().find((value) => value.startsWith("__Secure-better-auth.session_token="));
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("Secure");
  const sessionResponse = await route.GET(new NextRequest("https://example.com/api/auth/get-session", {
    headers: { cookie: cookie!.split(";")[0]!, "x-forwarded-for": "192.0.2.10" },
  }));
  expect(sessionResponse.status).toBe(200);
  expect((await sessionResponse.json()).user.id).toBe("login-test-user");
});

it("still rejects an incorrect password rather than bypassing authentication", async () => {
  const response = await route.POST(request("sign-in/email", { email, password: "wrong-password" }, "192.0.2.11"));
  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" });
});

it("throttles concurrent login requests without Redis and allows retry after the window", async () => {
  // Malformed credentials exercise the limiter without hashing eleven passwords.
  const responses = await Promise.all(Array.from({ length: 11 }, () =>
    route.POST(request("sign-in/email", {}, "192.0.2.12")),
  ));
  expect(responses.filter((response) => response.status === 400)).toHaveLength(10);
  const limited = responses.find((response) => response.status === 429);
  expect(limited).toBeDefined();
  expect(Number(limited!.headers.get("X-Retry-After"))).toBeGreaterThan(0);
  // A different IP still has its own allowance.
  expect((await route.POST(request("sign-in/email", {}, "192.0.2.13"))).status).toBe(400);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.now() + 901000);
  expect((await route.POST(request("sign-in/email", {}, "192.0.2.12"))).status).toBe(400);
  vi.useRealTimers();
});

it("also limits password-reset requests without an external service", async () => {
  const responses = await Promise.all(Array.from({ length: 4 }, () =>
    route.POST(request("request-password-reset", {}, "192.0.2.14")),
  ));
  expect(responses.filter((response) => response.status === 400)).toHaveLength(3);
  expect(responses.filter((response) => response.status === 429)).toHaveLength(1);
});


it("allows login without a forwarded IP and throttles the shared fallback bucket", async () => {
  const login = request("sign-in/email", { email, password });
  login.headers.delete("x-forwarded-for");
  expect((await route.POST(login)).status).toBe(200);
  for (let attempt = 1; attempt <= 10; attempt++) {
    const login = request("sign-in/email", {});
    login.headers.delete("x-forwarded-for");
    expect((await route.POST(login)).status).toBe(attempt < 10 ? 400 : 429);
  }
});
