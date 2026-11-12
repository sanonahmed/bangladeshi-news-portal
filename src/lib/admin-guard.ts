import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type UserRole, isRoleAtLeast } from "@/lib/permissions";

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
    const role = ((session.user as any)?.role as UserRole) || "reader";
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
      user: session.user,
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
