import { Metadata } from "next";
import {
  getEventsForDate,
  get1971Timeline,
  getLiberationSectors,
  getBirSreshthoHeroes,
} from "@/actions/history";
import { HistoryHubClient } from "@/components/public/history/HistoryHubClient";
import { getDhakaDate } from "@/lib/bengali-date";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "ঐতিহাসিক এই দিনে ও স্বাধীনতা আর্কাইভ | দৈনিক বাংলাদেশ বার্তা",
  description:
    "ইতিহাসের স্মরণীয় ঘটনাপঞ্জি, ১৯৭১ সালের মুক্তিযুদ্ধের দিনলিপি, ১১টি সেক্টরের রণকৌশল ও ৭ জন বীরশ্রেষ্ঠের বীরত্বগাথা।",
};

export const revalidate = 60; // 1 min ISR

export default async function HistoryPage() {
  const features = await getFeatureFlags();
  if (features.history_archive === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="মুক্তিযুদ্ধ ও ইতিহাস আর্কাইভ"
        featureNameEn="1971 Liberation War & History"
        categoryName="ইতিহাস ও ঐতিহ্য"
      />
    );
  }

  const now = getDhakaDate();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // 1-12

  const [todayEvents, timelineEvents, sectors, birSreshthoList] =
    await Promise.all([
      getEventsForDate(currentDay, currentMonth),
      get1971Timeline(),
      getLiberationSectors(),
      getBirSreshthoHeroes(),
    ]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)]/30 py-4">
      <HistoryHubClient
        initialEvents={todayEvents}
        timelineEvents={timelineEvents}
        sectors={sectors}
        birSreshthoList={birSreshthoList}
        initialDay={currentDay}
        initialMonth={currentMonth}
      />
    </main>
  );
}
