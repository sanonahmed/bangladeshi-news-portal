import { beforeEach, expect, it, vi } from "vitest";
import { createStaffMember, getAdminUsersList, updateUserRole } from "@/actions/users";

const mocks = vi.hoisted(() => ({ actor: vi.fn(), select: vi.fn(), limit: vi.fn(), provision: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({ getCurrentAdminUser: mocks.actor }));
vi.mock("@/lib/account-provisioning", () => ({ provisionCredentialAccount: mocks.provision }));
vi.mock("@/db", () => ({ db: { select: mocks.select, update: mocks.update } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const input = { name: "Staff", email: "staff@example.com", password: "test-password-123", role: "super_admin", designation: "Editor", isBureauChief: false };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.select.mockReturnValue({ from: () => ({ where: () => ({ limit: mocks.limit }) }) });
  mocks.limit.mockResolvedValue([]);
});

it("denies unauthenticated and non-administrator account creation", async () => {
  for (const actor of [null, { id: "reader", role: "reader" }, { id: "editor", role: "editor" }]) {
    mocks.actor.mockResolvedValue(actor);
    expect((await createStaffMember(input)).success).toBe(false);
  }
  expect(mocks.select).not.toHaveBeenCalled();
  expect(mocks.provision).not.toHaveBeenCalled();
});

it("does not allow an administrator to provision a super administrator", async () => {
  mocks.actor.mockResolvedValue({ id: "admin", role: "admin" });
  expect(await createStaffMember(input)).toMatchObject({ success: false, error: "Only a Super Admin can create another Super Admin" });
  expect(mocks.provision).not.toHaveBeenCalled();
});

it("does not allow administrators to grant or revoke the super administrator role", async () => {
  mocks.actor.mockResolvedValue({ id: "admin", role: "admin" });
  mocks.limit.mockResolvedValue([{ id: "target", role: "editor" }]);
  expect((await updateUserRole("target", "super_admin")).success).toBe(false);
  mocks.limit.mockResolvedValue([{ id: "target", role: "super_admin" }]);
  expect((await updateUserRole("target", "editor")).success).toBe(false);
  expect(mocks.update).not.toHaveBeenCalled();
});

it("rejects invalid roles before writing", async () => {
  mocks.actor.mockResolvedValue({ id: "admin", role: "super_admin" });
  mocks.limit.mockResolvedValue([{ id: "target", role: "editor" }]);
  expect(await updateUserRole("target", "unknown")).toMatchObject({ success: false, error: "Invalid role" });
  expect(mocks.update).not.toHaveBeenCalled();
});

it("does not disclose the staff directory to readers or anonymous visitors", async () => {
  for (const actor of [null, { id: "reader", role: "reader" }]) {
    mocks.actor.mockResolvedValue(actor);
    expect(await getAdminUsersList()).toEqual([]);
  }
  expect(mocks.select).not.toHaveBeenCalled();
});
