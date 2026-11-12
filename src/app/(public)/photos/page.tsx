import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";
import { getFeatureFlags } from "@/actions/features";
import { FeatureDisabledNotice } from "@/components/public/FeatureDisabledNotice";

export const metadata: Metadata = {
  title: "ছবিঘর | বাংলা নিউজ",
  description: "ক্যামেরার লেন্সে দেশ ও বিদেশের আলোচিত ঘটনা, প্রকৃতি ও জীবনযাত্রার স্থিরচিত্র।",
};

const PHOTOS = [
  {
    id: "p-1",
    title: "কুয়াশাচ্ছন্ন ভোরে পদ্মা নদীর বুকে জেলেদের ব্যস্ত জীবন",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    photographer: "আহমেদ হাসান",
    location: "মুন্সীগঞ্জ",
  },
  {
    id: "p-2",
    title: "শরতের নীল আকাশে কাশফুলের দোলা",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    photographer: "সৌরভ দাশ",
    location: "দিয়া Nicholas",
  },
  {
    id: "p-3",
    title: "ঐতিহাসিক লালবাগ কেল্লায় দর্শনার্থীদের পদচারণা",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    photographer: "নাসরিন আক্তার",
    location: "ঢাকা",
  },
  {
    id: "p-4",
    title: "বঙ্গোপসাগরে সূর্যোদয়ের অপরূপ দৃশ্য",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    photographer: "তানভীর আহমেদ",
    location: "কুয়াকাটা",
  },
  {
    id: "p-5",
    title: "শ্রীমঙ্গলের সবুজ চা বাগানে পাতা তোলার দৃশ্য",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    photographer: "রাকিবুল হাসান",
    location: "মৌলভীবাজার",
  },
  {
    id: "p-6",
    title: "শীতের সকালে খেজুরের রস সংগ্রহের ঐতিহ্যবাহী দৃশ্য",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    photographer: "ফারুক হোসেন",
    location: "যশোর",
  },
];

export default async function PhotosPage() {
  const features = await getFeatureFlags();
  if (features.photo_gallery === false) {
    return (
      <FeatureDisabledNotice
        featureNameBn="ফটো গ্যালারি ও চিত্রশালা"
        featureNameEn="Photo Gallery"
        categoryName="আলোকচিত্র"
      />
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <Camera size={28} className="text-[var(--color-primary)]" />
          ছবিঘর
        </h1>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHOTOS.map((photo) => (
          <div
            key={photo.id}
            className="border border-[var(--color-border)] p-3 bg-[var(--color-bg)]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
              <Image
                src={photo.image}
                alt={photo.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] leading-snug">
              {photo.title}
            </h2>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-faint)] mt-2 pt-2 border-t border-[var(--color-border)]">
              <span>ছবি: {photo.photographer}</span>
              <span>📍 {photo.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
