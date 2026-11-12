import { getCurrentAdminUser } from "@/lib/admin-guard";
import { isRoleAtLeast } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/layout/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentAdminUser();

  // If not signed in, redirect to login
  if (!currentUser) {
    redirect("/login?callbackUrl=/admin");
  }

  // Readers are strictly prohibited from the staff newsroom admin panel
  if (!isRoleAtLeast(currentUser.role, "journalist")) {
    redirect("/login?notice=staff_only");
  }

  return <AdminShell>{children}</AdminShell>;
}
