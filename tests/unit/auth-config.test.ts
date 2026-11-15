import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/resend", () => ({ sendVerificationEmail: vi.fn(), sendPasswordResetEmail: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-only-92e6b2e38ba44f6e88bc49d338c354b6");
  vi.stubEnv("BETTER_AUTH_URL", "https://example.com");
  vi.stubEnv("GOOGLE_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test-secret");
});
afterEach(() => vi.unstubAllEnvs());

it("fails production initialization when the secret is missing or short", async () => {
  for (const secret of ["", "short"]) {
    vi.resetModules();
    vi.stubEnv("BETTER_AUTH_SECRET", secret);
    await expect(import("@/lib/auth")).rejects.toThrow("BETTER_AUTH_SECRET");
  }
});

it("disables email signup in Better Auth itself, not just the HTTP wrapper", async () => {
  const { auth } = await import("@/lib/auth");
  expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
  expect(auth.options.socialProviders?.google).toMatchObject({ disableSignUp: true });
  await expect(auth.api.signUpEmail({ body: {
    name: "Uninvited", email: "uninvited@example.com", password: "test-only-password",
  } })).rejects.toMatchObject({ body: { code: "EMAIL_PASSWORD_SIGN_UP_DISABLED" } });
});
