import type { Metadata } from "next";
import { getDivisionsWithDistricts, getRegionalArticles } from "@/actions/geography";
import { SaradeshExplorerClient } from "./SaradeshExplorerClient";

export const revalidate = 60; // ISR 60 seconds

export const metadata: Metadata = {
  title: "সারাদেশ - বিভাগ ও জেলা ভিত্তিক সংবাদ | দৈনিক বাংলাদেশ বার্তা",
  description:
    "বাংলাদেশের ৮টি বিভাগ ও ৬৪ জেলার প্রতিদিনের তাজা খবর, তৃণমূলের সমস্যা ও উন্নয়ন, রাজনীতি, অর্থনীতি ও সামাজিক প্রতিবেদন।",
};

export default async function SaradeshPage() {
  const [divisions, regionalResult] = await Promise.all([
    getDivisionsWithDistricts(),
    getRegionalArticles({ page: 1, pageSize: 12 }),
  ]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <SaradeshExplorerClient
        divisions={divisions}
        initialArticles={regionalResult.articles}
        initialTotal={regionalResult.total}
      />
    </div>
  );
}
