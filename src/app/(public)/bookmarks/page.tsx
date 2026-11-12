import type { Metadata } from "next";
import { getPersonalizedArticles } from "@/actions/bookmarks";
import { BookmarksListClient } from "./BookmarksListClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "সংরক্ষিত সংবাদ ও রিডিং লিস্ট | দৈনিক বাংলাদেশ বার্তা",
  description:
    "আপনার সুবিধামতো পরবর্তীতে পড়ার জন্য নির্বাচিত সংবাদসমূহের ব্যক্তিগত রিডিং লিস্ট ও পছন্দের ক্যাটাগরি ভিত্তিক খবর।",
  openGraph: {
    title: "সংরক্ষিত সংবাদ ও রিডিং লিস্ট | দৈনিক বাংলাদেশ বার্তা",
    description: "আপনার সুবিধামতো পরবর্তীতে পড়ার জন্য নির্বাচিত সংবাদসমূহের সংগ্রহশালা।",
  },
};

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const features = await getFeatureFlags();
  if (features.reader_bookmarks === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="সংবাদ বুকমার্ক ও সংরক্ষণ"
        featureNameEn="Reader Bookmarks & Saved Stories"
        categoryName="ব্যক্তিগত সেবা"
      />
    );
  }

  const initialRecommendations = await getPersonalizedArticles(
    ["national", "politics", "economy", "sports"],
    8
  );

  return <BookmarksListClient initialRecommendations={initialRecommendations} />;
}
