import { beforeEach, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { verifyPassword } from "better-auth/crypto";
import { provisionCredentialAccount } from "@/lib/account-provisioning";

const mocks = vi.hoisted(() => ({ execute: vi.fn(), batch: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({ db: mocks }));
const input = { name: " Staff ", email: "STAFF@example.com", password: "test-password-123", role: "journalist" as const };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.execute.mockImplementation((statement) => statement);
  mocks.batch.mockResolvedValue([{ rows: [] }, { rows: [{ id: "new-user" }] }, { rows: [] }]);
});

it("atomically provisions a credential account with a Better Auth compatible hash", async () => {
  const { id } = await provisionCredentialAccount(input);
  expect(mocks.batch).toHaveBeenCalledTimes(1);
  const statements = mocks.batch.mock.calls[0]![0].map((statement: Parameters<PgDialect["sqlToQuery"]>[0]) => new PgDialect().sqlToQuery(statement));
  expect(statements).toHaveLength(3);
  expect(statements[0].sql).toContain('LOCK TABLE "user"');
  expect(statements[1].params).toEqual([id, "Staff", "staff@example.com", "journalist", "staff@example.com", false]);
  expect(statements[2].sql).toContain("'credential'");
  const hash = statements[2].params[1] as string;
  expect(hash).not.toBe(input.password);
  expect(await verifyPassword({ hash, password: input.password })).toBe(true);
});

it("checks bootstrap under the same lock and refuses an existing super admin", async () => {
  mocks.batch.mockResolvedValue([{ rows: [] }, { rows: [] }, { rows: [] }]);
  await expect(provisionCredentialAccount({ ...input, role: "super_admin" }, true)).rejects.toThrow("Initial admin already exists");
  const query = new PgDialect().sqlToQuery(mocks.execute.mock.calls[1]![0]);
  expect(query.params.at(-1)).toBe(true);
  expect(query.sql).toContain("WHERE role = 'super_admin'");
});

it("validates account input and bootstrap role before any writes", async () => {
  await expect(provisionCredentialAccount({ ...input, password: "short" })).rejects.toThrow();
  await expect(provisionCredentialAccount(input, true)).rejects.toThrow("Invalid bootstrap role");
  expect(mocks.batch).not.toHaveBeenCalled();
});

it("propagates batch failure without retrying or issuing separate writes", async () => {
  mocks.batch.mockRejectedValue(new Error("transaction rolled back"));
  await expect(provisionCredentialAccount(input)).rejects.toThrow("transaction rolled back");
  expect(mocks.batch).toHaveBeenCalledTimes(1);
});
