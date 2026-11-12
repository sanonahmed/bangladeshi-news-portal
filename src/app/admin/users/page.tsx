import { getAdminUsersList } from "@/actions/users";
import { AdminUsersClient } from "./AdminUsersClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff & Newsroom Roles | Admin",
  description: "Role-based access control, journalists, bureau chiefs and staff management",
};

export default async function AdminUsersPage() {
  const { granted, currentUser } = await checkRoleAccess("admin");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="admin"
        currentRole={currentUser?.role}
        pageTitleBn="কর্মী ও সাংবাদিক ব্যবস্থাপনা"
        pageTitleEn="Staff & Users Management"
      />
    );
  }

  const users = await getAdminUsersList();
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <AdminUsersClient
      initialUsers={users}
      currentUserEmail={session?.user?.email}
      currentUserRole={(session?.user as any)?.role}
    />
  );
}
