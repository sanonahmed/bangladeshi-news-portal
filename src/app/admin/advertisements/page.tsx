import { getAllAdminAds } from "@/actions/advertisements";
import { AdminAdsClient } from "./AdminAdsClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";
import { checkRoleAccess } from "@/lib/admin-guard";
import { AccessDeniedNotice } from "@/components/admin/AccessDeniedNotice";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "বিজ্ঞাপন ব্যানার ও স্পন্সরশিপ স্লট ম্যানেজার | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটে প্রদর্শিত ব্যানার বিজ্ঞাপন, গুগল অ্যাডসেন্স ও ক্লিক-ইম্প্রেশন ট্র্যাকিং পরিচালনা।",
};

export default async function AdminAdvertisementsPage() {
  const { granted, currentUser } = await checkRoleAccess("admin");
  if (!granted) {
    return (
      <AccessDeniedNotice
        requiredRole="admin"
        currentRole={currentUser?.role}
        pageTitleBn="বিজ্ঞাপন ব্যানার ও স্লট পরিচালনা"
        pageTitleEn="Advertisement Management"
      />
    );
  }

  const features = await getFeatureFlags();
  if (features.admin_ads_manager === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="বিজ্ঞাপন ও মনিটাইজেশন কন্ট্রোল"
        featureNameEn="Advertisement Management"
        categoryName="এডমিন টুলস"
      />
    );
  }

  const allAds = await getAllAdminAds();

  return <AdminAdsClient initialAds={allAds} />;
}
