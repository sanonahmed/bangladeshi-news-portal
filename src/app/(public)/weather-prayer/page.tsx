import type { Metadata } from "next";
import { getDivisionWeatherPrayer, getAllDivisionsWeatherSummary } from "@/actions/weather-prayer";
import { WeatherPrayerPageClient } from "./WeatherPrayerPageClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const revalidate = 60; // ISR 60 seconds

export const metadata: Metadata = {
  title: "দৈনিক আবহাওয়া ও নামাজের সময়সূচি | দৈনিক বাংলাদেশ বার্তা",
  description:
    "বাংলাদেশের ৮টি বিভাগ ও ৬৪ জেলার প্রতিদিনের রিয়েল-টাইম আবহাওয়া বার্তা, ৫ দিনের পূর্বাভাস এবং ইসলামিক ফাউন্ডেশন অনুমোদিত ওয়াক্তভিত্তিক নামাজের পূর্ণাঙ্গ সময়সূচি।",
};

export default async function WeatherPrayerPage() {
  const features = await getFeatureFlags();
  if (features.weather_prayer === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="আবহাওয়া ও নামাজের সময়সূচি"
        featureNameEn="Weather & Prayer Times Widget"
        categoryName="দৈনন্দিন সেবা"
      />
    );
  }

  const [initialData, allSummary] = await Promise.all([
    getDivisionWeatherPrayer("dhaka"),
    getAllDivisionsWeatherSummary(),
  ]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <WeatherPrayerPageClient
        initialData={initialData}
        allDivisionsSummary={allSummary}
      />
    </div>
  );
}
