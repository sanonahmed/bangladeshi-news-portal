import { getFeatureFlags } from "@/actions/features";
import { AdminFeaturesClient } from "./AdminFeaturesClient";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";

export const dynamic = "force-dynamic";

export default async function AdminFeaturesPage() {
  const { granted, currentUser } = await checkRoleAccess("super_admin");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="super_admin"
        currentRole={currentUser?.role}
        pageTitleBn="পোর্টাল ফিচার সেটিংস ও টগল"
        pageTitleEn="Feature Flags Management"
      />
    );
  }

  const flags = await getFeatureFlags();

  return <AdminFeaturesClient initialFlags={flags} />;
}
