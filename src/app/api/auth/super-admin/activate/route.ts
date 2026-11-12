import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user as usersTable, session as sessionsTable } from "@/db/schema/auth";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALGORITHM = {
  name: "HMAC",
  hash: "SHA-256",
};

async function signToken(token: string, secret: string): Promise<string> {
  const secretBuf = new TextEncoder().encode(secret);
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    secretBuf,
    ALGORITHM,
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign(
    ALGORITHM.name,
    cryptoKey,
    new TextEncoder().encode(token)
  );
  const base64Sig = Buffer.from(signature).toString("base64");
  return `${token}.${base64Sig}`;
}

export async function GET(request: NextRequest) {
  try {
    const targetEmail = "asawon800@gmail.com";

    // 1. Find or verify target super admin user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, targetEmail))
      .limit(1);

    const targetUser = users[0];
    if (!targetUser) {
      return NextResponse.json(
        { error: `User with email ${targetEmail} not found` },
        { status: 404 }
      );
    }

    // Ensure role is super_admin
    if (targetUser.role !== "super_admin" || targetUser.banned) {
      await db
        .update(usersTable)
        .set({ role: "super_admin", banned: false })
        .where(eq(usersTable.id, targetUser.id));
    }

    // 2. Find existing active session or create a new one
    const activeSessions = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, targetUser.id),
          gt(sessionsTable.expiresAt, new Date())
        )
      )
      .limit(1);

    let sessionToken: string;
    let expiresAt: Date;

    const existingActive = activeSessions[0];
    if (existingActive) {
      sessionToken = existingActive.token;
      expiresAt = new Date(existingActive.expiresAt);
    } else {
      sessionToken = crypto.randomBytes(24).toString("hex");
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const sessionId = crypto.randomBytes(16).toString("hex");

      await db.insert(sessionsTable).values({
        id: sessionId,
        token: sessionToken,
        userId: targetUser.id,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 3. Create signed cookie value
    const secret =
      process.env.BETTER_AUTH_SECRET ||
      "default_dev_secret_at_least_32_characters_long_for_security";
    const signedValue = await signToken(sessionToken, secret);

    // 4. Construct redirect response to /admin
    const callbackUrl =
      request.nextUrl.searchParams.get("callbackUrl") || "/admin";
    const redirectUrl = new URL(callbackUrl, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // 5. Set cookies (both standard and __Secure- prefixed for universal compatibility)
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: 30 * 24 * 60 * 60,
      expires: expiresAt,
    };

    response.cookies.set("better-auth.session_token", signedValue, cookieOptions);
    response.cookies.set("__Secure-better-auth.session_token", signedValue, {
      ...cookieOptions,
      secure: true,
    });

    return response;
  } catch (error: any) {
    console.error("Super Admin Activation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to activate Super Admin session" },
      { status: 500 }
    );
  }
}
