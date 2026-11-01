import { Suspense } from "react";
import { getPublishedArticles, getLatestArticles, getPopularArticles } from "@/actions/articles";
import { getDivisionsWithDistricts, getRegionalArticles } from "@/actions/geography";
import { getDivisionWeatherPrayer } from "@/actions/weather-prayer";
import { LeadStoryGrid } from "@/components/public/homepage/LeadStoryGrid";
import { LatestNewsSection } from "@/components/public/homepage/LatestNewsSection";
import { MostReadSection } from "@/components/public/homepage/MostReadSection";
import { CategorySection } from "@/components/public/homepage/CategorySection";
import { DivisionNewsSection } from "@/components/public/homepage/DivisionNewsSection";
import { VideoNewsSection } from "@/components/public/homepage/VideoNewsSection";
import { OpinionSection } from "@/components/public/homepage/OpinionSection";
import { LivePollSection } from "@/components/public/homepage/LivePollSection";
import { PhotoGallerySection } from "@/components/public/homepage/PhotoGallerySection";
import { WeatherPrayerWidget } from "@/components/public/homepage/WeatherPrayerWidget";
import { AdSlot } from "@/components/public/homepage/AdSlot";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: 60 seconds

export const metadata: Metadata = {
  title: "প্রচ্ছদ | বাংলা নিউজ",
  description: "বাংলাদেশের অগ্রণী জাতীয় অনলাইন সংবাদপত্র - সর্বশেষ তাজা খবর, রাজনীতি, অর্থনীতি ও খেলাধুলা।",
};

export default async function HomePage() {
  const [featuredResult, latestArticles, popularArticles, divisionsData, weatherPrayerData] = await Promise.all([
    getPublishedArticles({ pageSize: 5 }),
    getLatestArticles(8),
    getPopularArticles(6),
    getDivisionsWithDistricts(),
    getDivisionWeatherPrayer("dhaka"),
  ]);

  const defaultDivSlug = divisionsData[0]?.slug || "dhaka";
  const initialRegionalArticles = await getRegionalArticles({
    divisionSlug: defaultDivSlug,
    pageSize: 4,
  });

  const featuredList = featuredResult.data;
  const leadStory = featuredList[0];
  const supportingStories = featuredList.slice(1, 4);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-6">
      {/* Top Homepage Leaderboard Ad */}
      <AdSlot placement="homepage_leaderboard" />

      {/* Section A & C: Lead News Grid with Most Read Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <LeadStoryGrid lead={leadStory} supporting={supportingStories} />
        </div>
        <div className="lg:col-span-3">
          <MostReadSection articles={popularArticles} />
        </div>
      </div>

      {/* Section B: Latest News */}
      <LatestNewsSection articles={latestArticles} />

      {/* Mid-page Banner Ad */}
      <AdSlot placement="between_sections" />

      {/* Section D: National (জাতীয়) */}
      <CategorySection title="জাতীয় সংবাদ" categorySlug="national" />

      {/* Section E: Politics (রাজনীতি) & Section K: Economy (অর্থনীতি) Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategorySection title="রাজনীতি" categorySlug="politics" />
        <CategorySection title="অর্থনীতি ও বাণিজ্য" categorySlug="economy" />
      </div>

      {/* Section G: Bangladesh Districts (সারাদেশ) */}
      <DivisionNewsSection
        initialDivisions={divisionsData}
        initialArticles={initialRegionalArticles.articles}
      />

      {/* Daily Weather & Islamic Prayer Times Widget (দৈনিক আবহাওয়া ও নামাজের সময়সূচি) */}
      <WeatherPrayerWidget initialData={weatherPrayerData} />

      {/* Section F: International (আন্তর্জাতিক) */}
      <CategorySection title="আন্তর্জাতিক সংবাদ" categorySlug="international" />

      {/* Section L: Video News (ভিডিও) */}
      <VideoNewsSection />

      {/* Section H: Sports (খেলাধুলা) & Section I: Entertainment (বিনোদন) Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategorySection title="খেলাধুলা" categorySlug="sports" />
        <CategorySection title="বিনোদন" categorySlug="entertainment" />
      </div>

      {/* Section J: Technology (প্রযুক্তি) */}
      <CategorySection title="তথ্যপ্রযুক্তি" categorySlug="technology" />

      {/* Live Reader Poll & Survey Section */}
      <LivePollSection />

      {/* Section M: Opinion (মতামত) */}
      <OpinionSection />

      {/* Section N: Photo Gallery (ছবিঘর) */}
      <PhotoGallerySection />

      {/* Bottom Footer Ad */}
      <AdSlot placement="footer" />
    </div>
  );
}
