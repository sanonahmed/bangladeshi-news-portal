import { getAllAdminComments } from "@/actions/comments";
import { AdminCommentsClient } from "./AdminCommentsClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "পাঠক মন্তব্য ও প্রতিক্রিয়া মডারেশন | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটে প্রকাশিত সংবাদের পাঠকদের মন্তব্য ও মতামত অনুমোদন ও ব্যবস্থাপনা।",
};

export default async function AdminCommentsPage() {
  const features = await getFeatureFlags();
  if (features.admin_comments_moderation === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="পাঠক মন্তব্য ফিল্টার ও মডারেশন"
        featureNameEn="Comments Moderation Panel"
        categoryName="এডমিন টুলস"
      />
    );
  }

  const initialComments = await getAllAdminComments();

  return <AdminCommentsClient initialComments={initialComments} />;
}
