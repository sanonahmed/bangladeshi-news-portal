import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { type UserRole, isRoleAtLeast } from "@/lib/permissions";
import { db } from "@/db";
import { user as usersTable, session as sessionsTable } from "@/db/schema/auth";
import { eq, and, gt } from "drizzle-orm";

async function verifySignedCookie(rawToken: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBuf = Buffer.from(signature, "base64");
    return await crypto.subtle.verify("HMAC", key, sigBuf, encoder.encode(rawToken));
  } catch {
    return false;
  }
}

export interface CurrentAdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  user: any;
}

export async function getCurrentAdminUser(): Promise<CurrentAdminUser | null> {
  try {
    let sessionToken: string | undefined;

    // 1. Try reading directly from cookies()
    try {
      const cookieStore = await cookies();
      const possibleCookieNames = [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
      ];
      for (const name of possibleCookieNames) {
        const c = cookieStore.get(name);
        if (c?.value) {
          sessionToken = c.value;
          break;
        }
      }
    } catch {
      // In case cookies() is called outside request context
    }

    // 2. Try reading from raw headers()
    let headerList: Headers | null = null;
    try {
      headerList = await headers();
      if (!sessionToken && headerList) {
        const rawCookieHeader = headerList.get("cookie") || "";
        for (const pair of rawCookieHeader.split(";")) {
          const [k, ...v] = pair.trim().split("=");
          const key = k?.trim();
          if (
            key === "better-auth.session_token" ||
            key === "__Secure-better-auth.session_token"
          ) {
            sessionToken = decodeURIComponent(v.join("=").trim());
            break;
          }
        }

        // Check Bearer authorization header
        if (!sessionToken) {
          const authHeader = headerList.get("authorization");
          if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
            sessionToken = authHeader.slice(7).trim();
          }
        }
      }
    } catch {
      // In case headers() fails
    }

    // 3. If session token was found, query database directly
    if (sessionToken) {
      const tokenParts = sessionToken.split(".");
      const rawToken = tokenParts[0]?.trim();

      if (rawToken) {
        // Cryptographic verification if cookie contains HMAC signature
        if (tokenParts.length > 1 && tokenParts[1]) {
          const secret =
            process.env.BETTER_AUTH_SECRET ||
            "default_dev_secret_at_least_32_characters_long_for_security";
          const isValid = await verifySignedCookie(rawToken, tokenParts[1], secret);
          if (!isValid) {
            console.warn("Session token cryptographic signature verification failed.");
            return null;
          }
        }

        const rows = await db
          .select({
            session: sessionsTable,
            user: usersTable,
          })
          .from(sessionsTable)
          .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
          .where(
            and(
              eq(sessionsTable.token, rawToken),
              gt(sessionsTable.expiresAt, new Date())
            )
          )
          .limit(1);

        const matched = rows[0];
        if (matched) {
          const { user } = matched;
          if (user.banned) {
            return null;
          }

          let effectiveRole = (user.role as UserRole) || "reader";

          // Guarantee Super Admin role for designated email
          if (user.email.toLowerCase() === "asawon800@gmail.com") {
            effectiveRole = "super_admin";
            if (user.role !== "super_admin") {
              await db
                .update(usersTable)
                .set({ role: "super_admin" })
                .where(eq(usersTable.id, user.id));
            }
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: effectiveRole,
            user: {
              ...user,
              role: effectiveRole,
            },
          };
        }
      }
    }

    // 4. Secondary fallback: Better Auth getSession
    if (headerList) {
      const session = await auth.api.getSession({ headers: headerList });
      if (session && session.user) {
        const dbUsers = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, session.user.id))
          .limit(1);

        const dbUser = dbUsers[0];
        if (dbUser?.banned) {
          return null;
        }

        let role =
          (dbUser?.role as UserRole) ||
          ((session.user as any)?.role as UserRole) ||
          "reader";

        if (session.user.email.toLowerCase() === "asawon800@gmail.com") {
          role = "super_admin";
          if (dbUser && dbUser.role !== "super_admin") {
            await db
              .update(usersTable)
              .set({ role: "super_admin" })
              .where(eq(usersTable.id, dbUser.id));
          }
        }

        return {
          id: session.user.id,
          name: dbUser?.name || session.user.name,
          email: session.user.email,
          role,
          user: {
            ...session.user,
            role,
            banned: dbUser?.banned ?? false,
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error("getCurrentAdminUser error:", error);
    return null;
  }
}

export async function checkRoleAccess(requiredRole: UserRole): Promise<{
  granted: boolean;
  currentUser: CurrentAdminUser | null;
}> {
  const currentUser = await getCurrentAdminUser();
  if (!currentUser) {
    return { granted: false, currentUser: null };
  }
  const granted = isRoleAtLeast(currentUser.role, requiredRole);
  return { granted, currentUser };
}
