import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Verify bootstrap secret
  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    return NextResponse.json({ error: "Bootstrap is disabled" }, { status: 403 });
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

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const { name, email, password } = body;

  if (!name || !email || !password || password.length < 12) {
    return NextResponse.json(
      { error: "name, email, and password (min 12 chars) are required" },
      { status: 400 }
    );
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create user" }, { status: 500 });
  }

  // Elevate to super_admin
  await db.update(users).set({ role: "super_admin" }).where(eq(users.email, email));

  return NextResponse.json({
    success: true,
    message:
      "Super Admin created. Remove ADMIN_BOOTSTRAP_SECRET from environment variables now.",
    email,
  });
}
