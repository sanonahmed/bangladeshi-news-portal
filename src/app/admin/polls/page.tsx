import { getAllAdminPolls } from "@/actions/polls";
import { AdminPollsClient } from "./AdminPollsClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "অনলাইন ভোট ও পাঠক জরিপ | অ্যাডমিন প্যানেল",
  description: "ওয়েবসাইটে প্রকাশিত জনমত জরিপ তৈরি ও ফলাফল ব্যবস্থাপনা।",
};

export default async function AdminPollsPage() {
  const features = await getFeatureFlags();
  if (features.admin_polls_manager === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="পোল ও মতামত জরিপ ব্যবস্থাপনা"
        featureNameEn="Polls & Surveys Administration"
        categoryName="এডমিন টুলস"
      />
    );
  }

  const initialPolls = await getAllAdminPolls();

  return <AdminPollsClient initialPolls={initialPolls} />;
}
