import { db } from "@/db";
import { user as usersTable } from "@/db/schema/auth";
import { count } from "drizzle-orm";
import { AdminRolesClient } from "./AdminRolesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roles & Permissions Matrix (RBAC) | Admin",
  description: "Role-based access control, security policies and authorization boundaries",
};

export default async function AdminRolesPage() {
  const counts = await db
    .select({
      role: usersTable.role,
      count: count(usersTable.id),
    })
    .from(usersTable)
    .groupBy(usersTable.role);

  const roleCounts: Record<string, number> = {
    super_admin: 0,
    admin: 0,
    editor: 0,
    journalist: 0,
    reader: 0,
  };

  for (const c of counts) {
    if (c.role) {
      roleCounts[c.role] = Number(c.count) || 0;
    }
  }

  return <AdminRolesClient roleCounts={roleCounts} />;
}
