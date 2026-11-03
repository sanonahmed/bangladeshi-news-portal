"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, X, ExternalLink, Film } from "lucide-react";
import { detectVideoPlatform, getVideoEmbedUrl } from "@/lib/video-embed";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  slug: string;
  youtubeVideoId?: string | null;
  youtubeUrl?: string;
  category?: string;
}

interface VideoSectionClientProps {
  videos: VideoItem[];
}

export function VideoSectionClient({ videos }: VideoSectionClientProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  if (!videos || videos.length === 0) return null;

  const featured = videos[0];
  const rest = videos.slice(1, 5);

  function openVideo(video: VideoItem) {
    if (video.youtubeUrl || video.youtubeVideoId) {
      setActiveVideo(video);
    }
  }

  const activeUrl = activeVideo ? activeVideo.youtubeUrl || activeVideo.youtubeVideoId || "" : "";
  const activePlatform = detectVideoPlatform(activeUrl);
  const activeEmbedSrc = activeVideo ? getVideoEmbedUrl(activeUrl, true) : "";

  return (
    <>
      <section className="mt-8 bg-zinc-950 text-white p-6 border-t-2 border-[var(--color-primary)] rounded-sm shadow-md">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
          <h2 className="bengali-headline text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
            ভিডিও সংবাদ
          </h2>
          <Link
            href="/videos"
            className="text-xs md:text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
          >
            <span>সব ভিডিও গ্যালারি</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Main Video: 7 Columns */}
          {featured && (
            <div className="lg:col-span-7">
              <div
                onClick={() => openVideo(featured)}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border border-zinc-800 rounded">
                  <Image
                    src={featured.thumbnail}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div
                      className={`w-16 h-16 rounded-full text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${
                        detectVideoPlatform(featured.youtubeUrl || "") === "facebook"
                          ? "bg-blue-600"
                          : "bg-[var(--color-primary)]"
                      }`}
                    >
                      <Play size={28} className="fill-white translate-x-0.5" />
                    </div>
                  </div>
                  {featured.category && (
                    <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                      {featured.category}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white text-xs px-2 py-0.5 font-mono rounded">
                    {featured.duration}
                  </span>
                </div>
                <h3 className="bengali-headline text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors mt-3 leading-snug">
                  {featured.title}
                </h3>
              </div>
            </div>
          )}

          {/* Supporting Video List: 5 Columns */}
          <div className="lg:col-span-5 space-y-4 divide-y divide-zinc-800">
            {rest.map((video) => (
              <div
                key={video.id}
                onClick={() => openVideo(video)}
                className="group flex gap-4 pt-4 first:pt-0 cursor-pointer"
              >
                <div className="relative w-36 aspect-video flex-shrink-0 overflow-hidden bg-zinc-900 border border-zinc-800 rounded">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="144px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/15 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow ${
                        detectVideoPlatform(video.youtubeUrl || "") === "facebook"
                          ? "bg-blue-600"
                          : "bg-[var(--color-primary)]"
                      }`}
                    >
                      <Play size={14} className="fill-white translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] px-1 font-mono rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {video.category && (
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                      {video.category}
                    </span>
                  )}
                  <h4 className="bengali-headline text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mt-0.5">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Video Player Modal (YouTube & Facebook) */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    activePlatform === "facebook" ? "bg-blue-500" : "bg-red-600"
                  }`}
                ></span>
                <h3 className="bengali-headline text-sm md:text-base font-bold text-white truncate">
                  {activeVideo.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {activeVideo.youtubeUrl && (
                  <a
                    href={activeVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 font-semibold ${
                      activePlatform === "facebook"
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                    title={activePlatform === "facebook" ? "ফেসবুকে দেখুন" : "ইউটিউবে দেখুন"}
                  >
                    <span>{activePlatform === "facebook" ? "Facebook" : "YouTube"}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeEmbedSrc}
                title={activeVideo.title}
                className="w-full h-full border-0"
                scrolling="no"
                style={{ border: "none", overflow: "hidden" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeVideo.category && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                    {activeVideo.category}
                  </span>
                )}
                <span className="text-xs text-zinc-400 font-mono">
                  সময়: {activeVideo.duration}
                </span>
              </div>
              <Link
                href="/videos"
                onClick={() => setActiveVideo(null)}
                className="text-xs font-semibold text-red-400 hover:underline"
              >
                সব ভিডিও দেখুন &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
