import type { Metadata } from "next";
import { getLiveSportsMatches } from "@/lib/sports-data";
import { LiveScoreHubClient } from "./LiveScoreHubClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড | দৈনিক বাংলাদেশ বার্তা",
  description:
    "বাংলাদেশ জাতীয় দল, এনসিএল, আন্তর্জাতিক ক্রিকেট এবং বিশ্ব ফুটবলের লাইভ রান, ওভার, কমেন্ট্রি ও রিয়েল-টাইম বল-বাই-বল ট্র্যাকার।",
  openGraph: {
    title: "লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড | দৈনিক বাংলাদেশ বার্তা",
    description: "রিয়েল-টাইম বল-বাই-বল কমেন্ট্রি ও স্কোরবোর্ড ট্র্যাকার।",
  },
};

export const dynamic = "force-dynamic";

export default async function LiveScorePage() {
  const features = await getFeatureFlags();
  if (features.live_score === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড"
        featureNameEn="Live Sports Scorecard"
        categoryName="খেলাধুলা"
      />
    );
  }

  const matches = await getLiveSportsMatches();
  return <LiveScoreHubClient initialMatches={matches} />;
}
