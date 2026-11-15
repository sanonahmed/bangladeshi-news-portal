import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

const mocks = vi.hoisted(() => ({
  getSessionCookie: vi.fn(),
}));
vi.mock("better-auth/cookies", () => ({ getSessionCookie: mocks.getSessionCookie }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSessionCookie.mockReturnValue("stale-session-token");
});

it("does not treat a session cookie as validation or block the login form", async () => {
  for (const path of ["/login", "/login?notice=staff_only", "/login?callbackUrl=%2Fadmin"]) {
    const response = await proxy(new NextRequest(`https://news.example.com${path}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).not.toBe("https://news.example.com/");
  }
});

it("redirects anonymous staff requests to the preserved admin destination", async () => {
  mocks.getSessionCookie.mockReturnValue(undefined);
  const response = await proxy(new NextRequest("https://news.example.com/admin/users"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe(
    "https://news.example.com/login?callbackUrl=%2Fadmin%2Fusers",
  );
});

it("does not bypass the staff authorization boundary for cookie-bearing requests", async () => {
  const response = await proxy(new NextRequest("https://news.example.com/admin"));
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});
