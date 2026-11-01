import type { Metadata } from "next";
import { getVideos } from "@/actions/videos";
import { VideosGalleryClient } from "./VideosGalleryClient";
import type { Video } from "@/db/schema/videos";

export const revalidate = 60; // ISR 60s

export const metadata: Metadata = {
  title: "ভিডিও সংবাদ ও মাল্টিমিডিয়া গ্যালারি | দৈনিক বাংলাদেশ বার্তা",
  description:
    "জাতীয়, রাজনীতি, আন্তর্জাতিক, অর্থনীতি ও খেলাধুলার বিশেষ ভিডিও প্রতিবেদন এবং সরাসরি ইউটিউব সংবাদ বুলেটিন।",
};

// Fallback sample data if DB query returns empty during initial setup
const SAMPLE_VIDEOS: Video[] = [
  {
    id: "sample-1",
    title: "মেট্রোরেলের নতুন রুট উদ্বোধন: যাত্রীদের উচ্ছ্বাস ও মতামত",
    slug: "metro-rail-new-route-reactions",
    description: "রাজধানীর নতুন রুটে দ্রুততম যাতায়াত সুবিধার ফলে সাধারণ মানুষের প্রতিক্রিয়া ও আনন্দঘন মুহূর্ত।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    duration: "৩:৪৫",
    category: "জাতীয়",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    viewCount: 1420,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-2",
    title: "জলবায়ু পরিবর্তনের ঝুঁকিতে উপকূলীয় জেলা: বিশেষ প্রতিবেদন",
    slug: "climate-change-coastal-special-report",
    description: "বাঁধ ভেঙে বিস্তীর্ণ এলাকা প্লাবিত, টেকসই বাঁধ নির্মাণের দাবিতে উপকূলবাসীর আকুতি।",
    youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    youtubeVideoId: "kJQP7kiw5Fk",
    thumbnailUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
    duration: "৫:২০",
    category: "পরিবেশ",
    isFeatured: false,
    isActive: true,
    sortOrder: 2,
    viewCount: 980,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-3",
    title: "জাতীয় ক্রিকেট দলের অধিনায়কের একান্ত সাক্ষাৎকার ও আসন্ন সিরিজ পরিকল্পনা",
    slug: "national-cricket-captain-exclusive",
    description: "আসন্ন বিশ্বকাপ ও সিরিজ নিয়ে বাংলাদেশ ক্রিকেট দলের অধিনায়কের রণকৌশল ও আশাবাদ।",
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    youtubeVideoId: "fJ9rUzIMcZQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
    duration: "৭:১৫",
    category: "খেলাধুলা",
    isFeatured: false,
    isActive: true,
    sortOrder: 3,
    viewCount: 2310,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sample-4",
    title: "বিশ্ববিদ্যালয় শিক্ষার্থীদের উদ্ভাবিত রোবট আন্তর্জাতিক প্রতিযোগিতায় প্রথম স্থান অর্জন",
    slug: "university-students-robotics-award",
    description: "কৃত্রিম বুদ্ধিমত্তা ও রোবোটিক্সে বাংলাদেশের তরুণদের আন্তর্জাতিক জয়জয়কার।",
    youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    youtubeVideoId: "9bZkp7q19f0",
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    duration: "৪:১০",
    category: "প্রযুক্তি",
    isFeatured: false,
    isActive: true,
    sortOrder: 4,
    viewCount: 875,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async function VideosPage() {
  let videosList: Video[] = SAMPLE_VIDEOS;

  try {
    const dbVideos = await getVideos();
    if (dbVideos && dbVideos.length > 0) {
      videosList = dbVideos;
    }
  } catch (error) {
    console.error("Failed to load videos for /videos:", error);
  }

  return <VideosGalleryClient initialVideos={videosList} />;
}
