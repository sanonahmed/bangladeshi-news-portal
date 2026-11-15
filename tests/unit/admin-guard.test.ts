import { beforeEach, expect, it, vi } from "vitest";

import { getCurrentAdminUser } from "@/lib/admin-guard";

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), select: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/db", () => ({ db: { select: mocks.select } }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.select.mockReturnValue({ from: () => ({ where: () => ({ limit: mocks.limit }) }) });
  mocks.getSession.mockResolvedValue({ user: { id: "staff", role: "super_admin" } });
});

it("does not query users when the session is invalid", async () => {
  mocks.getSession.mockResolvedValue(null);
  expect(await getCurrentAdminUser()).toBeNull();
  expect(mocks.select).not.toHaveBeenCalled();
});

it("uses the stored role rather than a stale session role", async () => {
  mocks.limit.mockResolvedValue([{ id: "staff", name: "Staff", email: "staff@example.com", role: "journalist", banned: false }]);
  expect(await getCurrentAdminUser()).toMatchObject({ role: "journalist" });
});

it("rejects banned and deleted users", async () => {
  mocks.limit.mockResolvedValue([{ id: "staff", role: "super_admin", banned: true }]);
  expect(await getCurrentAdminUser()).toBeNull();
  mocks.limit.mockResolvedValue([]);
  expect(await getCurrentAdminUser()).toBeNull();
});

it("fails closed for unknown roles and database failures", async () => {
  mocks.limit.mockResolvedValue([{ id: "staff", role: "unknown", banned: false }]);
  expect(await getCurrentAdminUser()).toMatchObject({ role: "reader" });
  mocks.limit.mockRejectedValue(new Error("unavailable"));
  expect(await getCurrentAdminUser()).toBeNull();
});
