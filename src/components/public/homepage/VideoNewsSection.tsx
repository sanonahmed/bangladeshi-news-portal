import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoNewsItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  slug: string;
}

const DEMO_VIDEOS: VideoNewsItem[] = [
  {
    id: "vid-1",
    title: "মেট্রোরেলের নতুন রুটের সুবিধা ও যাত্রীদের প্রতিক্রিয়া",
    thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    duration: "৩:৪৫",
    slug: "metro-rail-new-route-reactions",
  },
  {
    id: "vid-2",
    title: "জলবায়ু পরিবর্তনের ঝুঁকিতে উপকূলীয় অঞ্চল: বিশেষ প্রতিবেদন",
    thumbnail: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
    duration: "৫:২০",
    slug: "climate-change-coastal-special-report",
  },
  {
    id: "vid-3",
    title: "জাতীয় ক্রিকেট দলের অধিনায়কের একান্ত সাক্ষাৎকার",
    thumbnail: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=800&q=80",
    duration: "৭:১৫",
    slug: "national-cricket-captain-exclusive",
  },
  {
    id: "vid-4",
    title: "বিশ্ববিদ্যালয় শিক্ষার্থীদের উদ্ভাবিত রোবট আন্তর্জাতিক প্রতিযোগিতায়",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    duration: "৪:১০",
    slug: "university-students-robotics-award",
  },
];

export function VideoNewsSection() {
  const [featured, ...rest] = DEMO_VIDEOS;

  return (
    <section className="mt-8 bg-zinc-900 text-white p-6 border-t-2 border-[var(--color-primary)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          ভিডিও সংবাদ
        </h2>
        <Link
          href="/videos"
          className="text-xs md:text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
        >
          সব ভিডিও &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Main Video: 7 Columns */}
        {featured && (
          <div className="lg:col-span-7">
            <Link href={`/news/${featured.slug}`} className="group block">
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={24} className="fill-white translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 font-mono">
                  {featured.duration}
                </span>
              </div>
              <h3 className="bengali-headline text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors mt-3 leading-snug">
                {featured.title}
              </h3>
            </Link>
          </div>
        )}

        {/* Supporting Video List: 5 Columns */}
        <div className="lg:col-span-5 space-y-4 divide-y divide-zinc-800">
          {rest.map((video) => (
            <Link
              key={video.id}
              href={`/news/${video.slug}`}
              className="group flex gap-4 pt-4 first:pt-0"
            >
              <div className="relative w-32 aspect-video flex-shrink-0 overflow-hidden bg-zinc-800">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="128px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/90 text-white flex items-center justify-center">
                    <Play size={12} className="fill-white translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 font-mono">
                  {video.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="bengali-headline text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {video.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
