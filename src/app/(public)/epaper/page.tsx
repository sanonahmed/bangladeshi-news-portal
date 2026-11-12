import type { Metadata } from "next";
import { getEpaperEdition } from "@/lib/epaper-data";
import { EpaperReaderClient } from "./EpaperReaderClient";
import { formatBengaliDate, getDhakaDate } from "@/lib/bengali-date";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

interface EpaperPageProps {
  searchParams: Promise<{
    date?: string;
    page?: string;
    edition?: "dhaka" | "chattogram" | "national";
  }>;
}

export async function generateMetadata({ searchParams }: EpaperPageProps): Promise<Metadata> {
  const { date, edition = "dhaka" } = await searchParams;
  const targetDate = date ? new Date(date) : getDhakaDate();
  const dateFormatted = formatBengaliDate(targetDate);

  const editionNames = {
    dhaka: "ঢাকা মূল সংস্করণ",
    chattogram: "চট্টগ্রাম ব্যুরো সংস্করণ",
    national: "জাতীয় সংস্করণ",
  };

  return {
    title: `ই-পেপার • ${dateFormatted} (${editionNames[edition]}) | দৈনিক বাংলাদেশ বার্তা`,
    description: `দৈনিক বাংলাদেশ বার্তার মুদ্রিত দৈনিকের অনলাইন ই-পেপার প্রতিচ্ছবি। পৃষ্ঠা উল্টে পড়ুন এবং সংবাদ ক্লিপিং দেখুন।`,
    openGraph: {
      title: `ই-পেপার • ${dateFormatted} (${editionNames[edition]}) | দৈনিক বাংলাদেশ বার্তা`,
      description: `মুদ্রিত দৈনিক পত্রিকার ডিজিটাল সংস্করণ।`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function EpaperPage({ searchParams }: EpaperPageProps) {
  const features = await getFeatureFlags();
  if (features.epaper === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="ডিজিটাল ই-পেপার সংস্করণ"
        featureNameEn="Digital E-Paper Archive"
        categoryName="মুদ্রিত সংস্করণ"
      />
    );
  }

  const { date, page, edition = "dhaka" } = await searchParams;
  const editionData = getEpaperEdition(date, edition);
  const pageNumber = Number(page) || 1;

  return (
    <EpaperReaderClient
      initialEdition={editionData}
      initialPageNumber={pageNumber}
    />
  );
}
