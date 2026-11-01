"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  Video as VideoIcon,
} from "lucide-react";
import type { Video } from "@/db/schema/videos";

const CATEGORIES = [
  "সব",
  "জাতীয়",
  "রাজনীতি",
  "আন্তর্জাতিক",
  "খেলাধুলা",
  "বিনোদন",
  "প্রযুক্তি",
  "পরিবেশ",
];

interface VideosGalleryClientProps {
  initialVideos: Video[];
}

export function VideosGalleryClient({ initialVideos }: VideosGalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(
    initialVideos.length > 0 && initialVideos[0] ? initialVideos[0] : null
  );
  const [copied, setCopied] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const filteredVideos =
    selectedCategory === "সব"
      ? initialVideos
      : initialVideos.filter((v) => v.category === selectedCategory);

  function handleSelectVideo(video: Video) {
    setCurrentVideo(video);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCopyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-8">
      {/* Header Breadcrumb & Title */}
      <div className="border-b-2 border-[var(--color-primary)] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/" className="hover:text-[var(--color-primary)]">
              প্রচ্ছদ
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)] font-semibold">ভিডিও গ্যালারি</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <span className="w-3 h-3 bg-[var(--color-primary)] inline-block"></span>
            ভিডিও সংবাদ ও মাল্টিমিডিয়া গ্যালারি
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-100 dark:bg-red-950/60 text-[var(--color-primary)] font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
            মোট ভিডিও: {initialVideos.length} টি
          </span>
        </div>
      </div>

      {/* Main Interactive Video Player Hero Section */}
      {currentVideo && (
        <div
          ref={playerRef}
          className="bg-zinc-950 text-white rounded-lg overflow-hidden border border-zinc-800 shadow-xl"
        >
          <div className="relative aspect-video w-full bg-black">
            <iframe
              key={currentVideo.youtubeVideoId}
              src={`https://www.youtube.com/embed/${currentVideo.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="p-5 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2.5 py-0.5 rounded shadow">
                {currentVideo.category || "জাতীয়"}
              </span>
              <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                <Clock size={13} />
                {currentVideo.duration}
              </span>
              {currentVideo.isFeatured && (
                <span className="text-amber-400 text-xs font-semibold flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                  <Sparkles size={12} />
                  প্রধান ভিডিও
                </span>
              )}
            </div>

            <h2 className="bengali-headline text-xl md:text-2xl lg:text-3xl font-bold text-white leading-snug">
              {currentVideo.title}
            </h2>

            {currentVideo.description && (
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-4xl">
                {currentVideo.description}
              </p>
            )}

            {/* Social Share & External Links */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-semibold flex items-center gap-1">
                  <Share2 size={14} /> শেয়ার করুন:
                </span>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `${currentVideo.title} - দৈনিক বাংলাদেশ বার্তা`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors font-medium"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    currentVideo.youtubeUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors font-medium"
                >
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? "কপি হয়েছে!" : "লিংক কপি"}</span>
                </button>
              </div>

              {currentVideo.youtubeUrl && (
                <a
                  href={currentVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  <span>ইউটিউবে দেখুন</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <h3 className="bengali-headline text-lg md:text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <VideoIcon size={20} className="text-[var(--color-primary)]" />
            সব ভিডিও তালিকা
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            যেকোনো ভিডিওতে ক্লিক করে সরাসরি উপরে উপভোগ করুন
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-lg">
          <VideoIcon size={36} className="mx-auto text-[var(--color-text-muted)] mb-2" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">
            এই বিভাগে বর্তমানে কোনো ভিডিও সংবাদ নেই।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => {
            const isSelected = currentVideo?.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className={`group block border p-3 rounded bg-[var(--color-bg)] cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 mb-2.5 rounded">
                  <Image
                    src={
                      video.thumbnailUrl ||
                      `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`
                    }
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                        isSelected ? "bg-red-600 text-white" : "bg-[var(--color-primary)] text-white"
                      }`}
                    >
                      <Play size={18} className="fill-white translate-x-0.5" />
                    </div>
                  </div>
                  {video.category && (
                    <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {video.category}
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[11px] px-1.5 py-0.5 font-mono rounded">
                    {video.duration}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
