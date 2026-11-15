import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { provisionCredentialAccount } from "@/lib/account-provisioning";
import { publishableErrorMessage } from "@/lib/error-utils";

export async function POST(request: NextRequest) {
  // Verify bootstrap secret
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrapSecret || bootstrapSecret.length < 32) {
    return NextResponse.json({ error: "Bootstrap is not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${bootstrapSecret}`) {
    return NextResponse.json({ error: "Invalid bootstrap secret" }, { status: 401 });
  }

  // Check if any super_admin already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.role, "super_admin"))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Super admin already exists. Bootstrap is one-time use." },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const parsed = z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(320).toLowerCase(),
    password: z.string().min(12).max(128),
  }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid name, email, and password (12–128 chars) are required" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  try {
    await provisionCredentialAccount({ name, email, password, role: "super_admin" }, true);
  } catch (error: unknown) {
    const message = publishableErrorMessage(error, "Failed to create user");
    console.error("Bootstrap failed:", message);
    const conflict = error instanceof Error && error.message.includes("already exists");
    return NextResponse.json(
      { error: message },
      { status: conflict ? 409 : 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Super Admin created. Remove ADMIN_BOOTSTRAP_SECRET from environment variables now.",
    email,
  });
}
