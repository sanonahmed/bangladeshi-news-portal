import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type UserRole, isRoleAtLeast } from "@/lib/permissions";
import { db } from "@/db";
import { user as usersTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

const USER_ROLES: readonly string[] = ["super_admin", "admin", "editor", "journalist", "reader"];

export interface CurrentAdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  user: { image?: string | null; banned?: boolean | null };
}

export async function getCurrentAdminUser(): Promise<CurrentAdminUser | null> {
  try {
    // Better Auth verifies the signed cookie and session expiry. Never trust
    // a raw cookie, caller-supplied role, or email allowlist.
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) return null;
    // Read current permissions so bans and demotions apply immediately.
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, session.user.id)).limit(1);
    if (!user || user.banned) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: USER_ROLES.includes(user.role) ? user.role as UserRole : "reader",
      user: { image: user.image, banned: user.banned },
    };
  } catch {
    return null;
  }
}

export async function checkRoleAccess(requiredRole: UserRole): Promise<{
  granted: boolean;
  currentUser: CurrentAdminUser | null;
}> {
  const currentUser = await getCurrentAdminUser();
  return {
    granted: currentUser !== null && isRoleAtLeast(currentUser.role, requiredRole),
    currentUser,
  };
}
