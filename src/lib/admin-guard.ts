import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type UserRole, isRoleAtLeast } from "@/lib/permissions";
import { db } from "@/db";
import { user as usersTable } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export interface CurrentAdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  user: any;
}

export async function getCurrentAdminUser(): Promise<CurrentAdminUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return null;
    }

    // Always query authoritative role directly from the database
    const dbUsers = await db
      .select({
        role: usersTable.role,
        banned: usersTable.banned,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    const dbUser = dbUsers[0];
    const role = (dbUser?.role as UserRole) || ((session.user as any)?.role as UserRole) || "reader";

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
