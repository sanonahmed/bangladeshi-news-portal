import { Metadata } from "next";
import { getAudioNewsPlaylist } from "@/actions/audio-news";
import { AudioNewsHubClient } from "@/components/public/audio-news/AudioNewsHubClient";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "অডিও নিউজ ও পডকাস্ট হাব | দৈনিক বাংলাদেশ বার্তা",
  description:
    "কাজের ফাঁকে বা ভ্রমণের সময় একনাগাড়ে শুনুন আজকের সেরা সংবাদসমূহ। প্রতিটি সংবাদের অডিও বাচনভঙ্গি ও ধারাবাহিক প্লেলিস্ট।",
};

export const revalidate = 60; // 1 min ISR

export default async function AudioNewsPage() {
  const features = await getFeatureFlags();
  if (features.audio_news === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="অডিও সংবাদ ও পডকাস্ট হাব"
        featureNameEn="Audio News & Podcasts"
        categoryName="মাল্টিমিডিয়া"
      />
    );
  }

  const playlist = await getAudioNewsPlaylist();

  return (
    <main className="min-h-screen bg-[var(--color-bg-secondary)]/30 py-4">
      <AudioNewsHubClient initialPlaylist={playlist} />
    </main>
  );
}
