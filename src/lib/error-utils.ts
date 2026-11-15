export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error && error.code === "23505") return true;
  const cause = "cause" in error ? error.cause : null;
  return Boolean(cause && typeof cause === "object" && "code" in cause && cause.code === "23505");
}

export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : fallback;
}

/** Do not expose driver errors or SQL parameters to public API responses. */
export function publishableErrorMessage(error: unknown, fallback: string): string {
  if (isUniqueConstraintViolation(error)) return "An account with this email already exists";
  if (error instanceof Error && [
    "Invalid bootstrap role",
    "Initial admin already exists",
    "An account with this email already exists",
  ].includes(error.message)) return error.message;
  return fallback;
}
