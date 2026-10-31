import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "ভিডিও গ্যালারি | বাংলা নিউজ",
  description: "জাতীয়, রাজনীতি, আন্তর্জাতিক ও খেলাধুলার বিশেষ ভিডিও প্রতিবেদন।",
};

const VIDEOS = [
  {
    id: "v-1",
    title: "মেট্রোরেলের নতুন রুটের সুবিধা ও যাত্রীদের প্রতিক্রিয়া",
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    duration: "৩:৪৫",
    slug: "metro-rail-new-route-reactions",
  },
  {
    id: "v-2",
    title: "জলবায়ু পরিবর্তনের ঝুঁকিতে উপকূলীয় অঞ্চল: বিশেষ প্রতিবেদন",
    thumbnail: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
    duration: "৫:২০",
    slug: "climate-change-coastal-special-report",
  },
  {
    id: "v-3",
    title: "জাতীয় ক্রিকেট দলের অধিনায়কের একান্ত সাক্ষাৎকার",
    thumbnail: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
    duration: "৭:১৫",
    slug: "national-cricket-captain-exclusive",
  },
  {
    id: "v-4",
    title: "বিশ্ববিদ্যালয় শিক্ষার্থীদের উদ্ভাবিত রোবট আন্তর্জাতিক প্রতিযোগিতায়",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    duration: "৪:১০",
    slug: "university-students-robotics-award",
  },
  {
    id: "v-5",
    title: "অর্থনৈতিক স্থিতিশীলতা ফিরিয়ে আনতে সরকারের ১০ দফা কর্মসূচি",
    thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    duration: "৬:৩০",
    slug: "economic-stability-ten-point-roadmap",
  },
  {
    id: "v-6",
    title: "সুন্দরবনের সংরক্ষিত বনাঞ্চলে ক্যামেরা ট্র্যাপে নতুন বাঘের সন্ধান",
    thumbnail: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80",
    duration: "৩:১০",
    slug: "sundarbans-tiger-camera-trap",
  },
];

export default function VideosPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
          ভিডিও সংবাদ
        </h1>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((video) => (
          <Link
            key={video.id}
            href={`/news/${video.slug}`}
            className="group block border border-[var(--color-border)] p-3 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 mb-3">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={20} className="fill-white translate-x-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 font-mono">
                {video.duration}
              </span>
            </div>
            <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
              {video.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
