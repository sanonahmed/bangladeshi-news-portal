import { getVideos } from "@/actions/videos";
import { VideoSectionClient } from "./VideoSectionClient";

const DEMO_VIDEOS = [
  {
    id: "vid-1",
    title: "মেট্রোরেলের নতুন রুটের সুবিধা ও যাত্রীদের প্রতিক্রিয়া",
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    duration: "৩:৪৫",
    slug: "metro-rail-new-route-reactions",
    youtubeVideoId: "dQw4w9WgXcQ",
    category: "জাতীয়",
  },
  {
    id: "vid-2",
    title: "জলবায়ু পরিবর্তনের ঝুঁকিতে উপকূলীয় অঞ্চল: বিশেষ প্রতিবেদন",
    thumbnail: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
    duration: "৫:২০",
    slug: "climate-change-coastal-special-report",
    youtubeVideoId: "kJQP7kiw5Fk",
    category: "পরিবেশ",
  },
  {
    id: "vid-3",
    title: "জাতীয় ক্রিকেট দলের অধিনায়কের একান্ত সাক্ষাৎকার",
    thumbnail: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
    duration: "৭:১৫",
    slug: "national-cricket-captain-exclusive",
    youtubeVideoId: "fJ9rUzIMcZQ",
    category: "খেলাধুলা",
  },
  {
    id: "vid-4",
    title: "বিশ্ববিদ্যালয় শিক্ষার্থীদের উদ্ভাবিত রোবট আন্তর্জাতিক প্রতিযোগিতায়",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    duration: "৪:১০",
    slug: "university-students-robotics-award",
    youtubeVideoId: "9bZkp7q19f0",
    category: "প্রযুক্তি",
  },
];

export async function VideoNewsSection() {
  let displayVideos = DEMO_VIDEOS;

  try {
    const dbVideos = await getVideos();
    if (dbVideos && dbVideos.length > 0) {
      displayVideos = dbVideos.map((v) => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`,
        duration: v.duration || "৩:৪৫",
        slug: v.slug,
        youtubeVideoId: v.youtubeVideoId,
        youtubeUrl: v.youtubeUrl,
        category: v.category || "জাতীয়",
      }));
    }
  } catch (error) {
    console.error("Failed to load videos for homepage section:", error);
  }

  return <VideoSectionClient videos={displayVideos} />;
}
