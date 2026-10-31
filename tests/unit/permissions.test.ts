import { describe, it, expect } from "vitest";
import { hasPermission, requirePermission } from "@/lib/permissions";

describe("Role-Based Access Control (RBAC)", () => {
  it("allows super_admin to perform all administrative actions", () => {
    expect(hasPermission("super_admin", "article:create")).toBe(true);
    expect(hasPermission("super_admin", "article:publish")).toBe(true);
    expect(hasPermission("super_admin", "site:settings")).toBe(true);
    expect(hasPermission("super_admin", "user:manage")).toBe(true);
  });

  it("restricts journalist from publishing without review", () => {
    expect(hasPermission("journalist", "article:create")).toBe(true);
    expect(hasPermission("journalist", "article:submit_review")).toBe(true);
    expect(hasPermission("journalist", "article:publish")).toBe(false);
    expect(hasPermission("journalist", "site:settings")).toBe(false);
  });

  it("allows editor to review, approve and publish articles", () => {
    expect(hasPermission("editor", "article:approve")).toBe(true);
    expect(hasPermission("editor", "article:publish")).toBe(true);
    expect(hasPermission("editor", "site:settings")).toBe(false);
  });

  it("prevents readers from creating or modifying articles", () => {
    expect(hasPermission("reader", "article:create")).toBe(false);
    expect(hasPermission("reader", "article:publish")).toBe(false);
    expect(hasPermission("reader", "media:upload")).toBe(false);
  });

  it("throws exception on requirePermission failure", () => {
    expect(() => requirePermission("reader", "article:publish")).toThrow();
    expect(() => requirePermission(null, "article:create")).toThrow();
    expect(() => requirePermission("editor", "article:publish")).not.toThrow();
  });
});
