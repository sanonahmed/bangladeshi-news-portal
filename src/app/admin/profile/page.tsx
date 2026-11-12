import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";
import { getMyAuthorProfile } from "@/actions/profile";
import { AdminProfileClient } from "./AdminProfileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "আমার প্রোফাইল ও লেখক পরিচিতি | Admin",
  description: "লেখক ও বার্তা কর্মী প্রোফাইল, ছবি, বায়ো ও সামাজিক যোগাযোগ তথ্য পরিচালনা করুন",
};

export default async function AdminProfilePage() {
  const { granted, currentUser } = await checkRoleAccess("journalist");

  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="journalist"
        currentRole={currentUser?.role}
        pageTitleBn="আমার প্রোফাইল ও পরিচিতি"
        pageTitleEn="My Profile & Author Bio"
      />
    );
  }

  const profile = await getMyAuthorProfile();

  if (!profile) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
        প্রোফাইল তথ্য লোড করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
      </div>
    );
  }

  return <AdminProfileClient initialProfile={profile} />;
}
