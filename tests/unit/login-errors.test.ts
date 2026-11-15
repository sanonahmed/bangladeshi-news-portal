import { expect, it } from "vitest";
import { getLoginErrorMessage } from "@/lib/login-errors";

it("only reports invalid credentials for credential errors", () => {
  expect(getLoginErrorMessage({ status: 401 })).toBe("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
  expect(getLoginErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
});

it("distinguishes rate limits, server outages and network errors", () => {
  expect(getLoginErrorMessage({ status: 429 })).toContain("অপেক্ষা");
  for (const status of [500, 502, 503]) {
    expect(getLoginErrorMessage({ status })).toContain("অনুপলব্ধ");
  }
  expect(getLoginErrorMessage()).not.toContain("পাসওয়ার্ড সঠিক নয়");
  expect(getLoginErrorMessage({})).not.toContain("পাসওয়ার্ড সঠিক নয়");
  expect(getLoginErrorMessage({ status: 403, message: "Access denied" })).toBe("Access denied");
});
