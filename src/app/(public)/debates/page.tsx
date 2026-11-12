import type { Metadata } from "next";
import { getAllDebates } from "@/actions/debates";
import { DebatesDirectoryClient } from "./DebatesDirectoryClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "সাপ্তাহিক সম্পাদকীয় মতামত জরিপ ও লাইভ বিতর্ক ফোরাম | দৈনিক বাংলাদেশ বার্তা",
  description:
    "সমসাময়িক জাতীয়, রাজনৈতিক, অর্থনৈতিক ও সামাজিক নীতি-নির্ধারণী বিষয়ে উন্মুক্ত জনমত ও পাঠকদের যুক্তি-পাল্টা যুক্তি উপস্থাপনের কেন্দ্রবিন্দু।",
  openGraph: {
    title: "সাপ্তাহিক সম্পাদকীয় মতামত জরিপ ও লাইভ বিতর্ক ফোরাম | দৈনিক বাংলাদেশ বার্তা",
    description:
      "সমসাময়িক জাতীয় বিষয়ে উন্মুক্ত জনমত ও পাঠকদের যুক্তি-পাল্টা যুক্তি উপস্থাপনের কেন্দ্রবিন্দু।",
  },
};

export const dynamic = "force-dynamic";

export default async function DebatesPage() {
  const features = await getFeatureFlags();
  if (features.public_debates === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="উন্মুক্ত পাঠক বিতর্ক ও মতামত ফোরাম"
        featureNameEn="Public Debates & Perspectives"
        categoryName="মতামত ও বিতর্ক"
      />
    );
  }

  const debates = await getAllDebates();

  return <DebatesDirectoryClient initialDebates={debates} />;
}
