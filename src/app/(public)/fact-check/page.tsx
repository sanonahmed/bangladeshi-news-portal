import { Metadata } from "next";
import { getFactChecks } from "@/actions/fact-checks";
import { FactCheckHubClient } from "@/components/public/fact-check/FactCheckHubClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "ফ্যাক্ট-চেক ও ভুয়া খবর প্রতিরোধ কর্নার | দৈনিক বাংলাদেশ বার্তা",
  description:
    "সামাজিক যোগাযোগ মাধ্যম ও ইন্টারনেটে ভাইরাল সংবাদের নিরপেক্ষ তথ্য যাচাই, গুজব খণ্ডন ও ডিজিটাল ফরেনসিক রিপোর্ট।",
};

export const revalidate = 60; // 1 min ISR

export default async function FactCheckPage() {
  const features = await getFeatureFlags();
  if (features.fact_checking === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="ফ্যাক্ট-চেক সত্যতা যাচাই কর্নার"
        featureNameEn="Fact-Check Verification Desk"
        categoryName="সত্যসন্ধান"
      />
    );
  }

  const items = await getFactChecks();

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)]/30 py-4">
      <FactCheckHubClient initialFactChecks={items} />
    </main>
  );
}
