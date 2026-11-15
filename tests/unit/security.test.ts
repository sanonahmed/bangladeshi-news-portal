import { afterEach, describe, expect, it, vi } from "vitest";

import { rejectPublicRegistration } from "@/lib/request-security";
import { getR2Configuration } from "@/lib/r2";
import { isRoleAtLeast } from "@/lib/permissions";

afterEach(() => vi.unstubAllEnvs());

describe("security boundaries", () => {
  it("rejects email registration at the API, including trailing slashes", () => {
    for (const path of ["/api/auth/sign-up/email", "/api/auth/sign-up/email/"]) {
      expect(rejectPublicRegistration("POST", path)?.status).toBe(403);
    }
    expect(rejectPublicRegistration("POST", "/api/auth/sign-in/email")).toBeNull();
    expect(rejectPublicRegistration("POST", "/api/bootstrap")).toBeNull();
  });

  it("denies requested roles above the caller's authority", () => {
    expect(isRoleAtLeast("reader", "journalist")).toBe(false);
    expect(isRoleAtLeast("admin", "super_admin")).toBe(false);
  });

});

describe("media configuration", () => {
  it("uses the documented R2 environment and strips a trailing URL slash", () => {
    vi.stubEnv("R2_ACCOUNT_ID", "account");
    vi.stubEnv("R2_ACCESS_KEY_ID", "key");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret");
    vi.stubEnv("R2_BUCKET_NAME", "news");
    vi.stubEnv("R2_PUBLIC_URL", "https://media.example.com/");
    expect(getR2Configuration()).toMatchObject({
      bucket: "news",
      publicUrl: "https://media.example.com",
      publicHostname: "media.example.com",
    });
    vi.unstubAllEnvs();
  });

  it("does not accept insecure media origins", () => {
    vi.stubEnv("R2_BUCKET_NAME", "news");
    vi.stubEnv("R2_PUBLIC_URL", "http://localhost:3000");
    expect(() => getR2Configuration()).toThrow("HTTPS");
    vi.unstubAllEnvs();
  });

  it("requires real storage credentials instead of dummy defaults", () => {
    vi.stubEnv("R2_BUCKET_NAME", "");
    expect(() => getR2Configuration()).toThrow("R2_BUCKET_NAME");
  });
});
