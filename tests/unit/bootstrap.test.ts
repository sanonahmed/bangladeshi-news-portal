import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/bootstrap/route";

const mocks = vi.hoisted(() => ({ select: vi.fn(), limit: vi.fn(), provision: vi.fn() }));
vi.mock("@/db", () => ({ db: { select: mocks.select } }));
vi.mock("@/lib/account-provisioning", () => ({ provisionCredentialAccount: mocks.provision }));
const secret = "bootstrap-test-secret-with-32-characters";
const body = { name: "Admin", email: "admin@example.com", password: "test-password-123" };

function request(payload: unknown = body, token = secret) {
  return new NextRequest("https://example.com/api/bootstrap", {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ADMIN_BOOTSTRAP_SECRET", secret);
  mocks.select.mockReturnValue({ from: () => ({ where: () => ({ limit: mocks.limit }) }) });
  mocks.limit.mockResolvedValue([]);
  mocks.provision.mockResolvedValue({ id: "new-admin" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it("rejects missing configuration and wrong secrets before database access", async () => {
  expect((await POST(request(body, "incorrect"))).status).toBe(401);
  for (const token of ["", "short"]) {
    vi.stubEnv("ADMIN_BOOTSTRAP_SECRET", token);
    expect((await POST(request())).status).toBe(503);
  }
  expect(mocks.select).not.toHaveBeenCalled();
  expect(mocks.provision).not.toHaveBeenCalled();
});

it("rejects an already bootstrapped database", async () => {
  mocks.limit.mockResolvedValue([{ id: "existing-admin" }]);
  expect((await POST(request())).status).toBe(409);
  expect(mocks.provision).not.toHaveBeenCalled();
});

it("validates input before creating accounts", async () => {
  for (const payload of [null, {}, { ...body, password: "short" }, { ...body, email: "invalid" }]) {
    expect((await POST(request(payload))).status).toBe(400);
  }
  expect(mocks.provision).not.toHaveBeenCalled();
});

it("uses the locked provisioning path and normalizes account data", async () => {
  const result = await POST(request({ ...body, name: " Admin ", email: "ADMIN@example.com" }));
  expect(result.status).toBe(200);
  expect(mocks.provision).toHaveBeenCalledWith({ ...body, role: "super_admin" }, true);
  expect(await result.json()).toMatchObject({ success: true });
});

it("reports a concurrent bootstrap conflict without exposing database errors", async () => {
  mocks.provision.mockRejectedValueOnce(new Error("Initial admin already exists"));
  expect((await POST(request())).status).toBe(409);
  mocks.provision.mockRejectedValueOnce(new Error("driver SQL parameters with confidential data"));
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Failed to create user" });
});
