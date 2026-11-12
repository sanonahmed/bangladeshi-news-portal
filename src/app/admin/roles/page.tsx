import { db } from "@/db";
import { user as usersTable } from "@/db/schema/auth";
import { count } from "drizzle-orm";
import { AdminRolesClient } from "./AdminRolesClient";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roles & Permissions Matrix (RBAC) | Admin",
  description: "Role-based access control, security policies and authorization boundaries",
};

export default async function AdminRolesPage() {
  const { granted, currentUser } = await checkRoleAccess("super_admin");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="super_admin"
        currentRole={currentUser?.role}
        pageTitleBn="ইউজার রোল ও পারমিশন ম্যাট্রিক্স"
        pageTitleEn="Role-Based Access Control"
      />
    );
  }

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
