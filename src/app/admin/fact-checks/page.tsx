import { getFactChecks, getFactCheckSubmissions } from "@/actions/fact-checks";
import { AdminFactChecksClient } from "./AdminFactChecksClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ফ্যাক্ট-চেক ও ভুয়া খবর প্রতিরোধ কর্নার | দৈনিক বাংলাদেশ বার্তা অ্যাডমিন",
  description: "সামাজিক মাধ্যমে ভাইরাল তথ্যের সত্যতা যাচাই ও পাঠক দাবি ইনবক্স",
};

export default async function AdminFactChecksPage() {
  const { granted, currentUser } = await checkRoleAccess("editor");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="editor"
        currentRole={currentUser?.role}
        pageTitleBn="ফ্যাক্ট-চেক ও অনুসন্ধান ডেস্ক"
        pageTitleEn="Fact-Check Desk Management"
      />
    );
  }

  const features = await getFeatureFlags();
  if (features.admin_fact_check_manager === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="ফ্যাক্ট-চেক সাবমিশন ও রিভিউ ডেস্ক"
        featureNameEn="Fact-Check Desk Administration"
        categoryName="এডমিন টুলস"
      />
    );
  }

  const [factChecks, submissions] = await Promise.all([
    getFactChecks(),
    getFactCheckSubmissions(),
  ]);

  return (
    <AdminFactChecksClient
      initialFactChecks={factChecks}
      initialSubmissions={submissions}
    />
  );
}
