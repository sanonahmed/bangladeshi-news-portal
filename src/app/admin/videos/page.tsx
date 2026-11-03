"use client";

import { useState, useEffect } from "react";
import {
  getAllAdminVideos,
  createVideo,
  deleteVideo,
  toggleVideoFeatured,
} from "@/actions/videos";
import {
  detectVideoPlatform,
  cleanFacebookUrl,
  cleanYouTubeUrl,
  extractYouTubeId,
  extractFacebookVideoId,
  getFacebookEmbedUrl,
  getYouTubeEmbedUrl,
  getVideoEmbedUrl,
  type VideoPlatform,
} from "@/lib/video-embed";
import type { Video } from "@/db/schema/videos";
import {
  Video as VideoIcon,
  Play,
  PlusCircle,
  Trash2,
  Star,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

const CATEGORY_MAP: Record<string, { en: string; bn: string }> = {
  "জাতীয়": { en: "National", bn: "জাতীয়" },
  "National": { en: "National", bn: "জাতীয়" },
  "রাজনীতি": { en: "Politics", bn: "রাজনীতি" },
  "Politics": { en: "Politics", bn: "রাজনীতি" },
  "আন্তর্জাতিক": { en: "International", bn: "আন্তর্জাতিক" },
  "International": { en: "International", bn: "আন্তর্জাতিক" },
  "খেলাধুলা": { en: "Sports", bn: "খেলাধুলা" },
  "Sports": { en: "Sports", bn: "খেলাধুলা" },
  "বিনোদন": { en: "Entertainment", bn: "বিনোদন" },
  "Entertainment": { en: "Entertainment", bn: "বিনোদন" },
  "প্রযুক্তি": { en: "Technology", bn: "প্রযুক্তি" },
  "Technology": { en: "Technology", bn: "প্রযুক্তি" },
  "পরিবেশ": { en: "Environment", bn: "পরিবেশ" },
  "Environment": { en: "Environment", bn: "পরিবেশ" },
};

export default function AdminVideosPage() {
  const { isEn, formatNumber } = useAdminLanguage();
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("03:45");
  const [category, setCategory] = useState("জাতীয়");
  const [isFeatured, setIsFeatured] = useState(false);

  // Platform detection & Computed preview
  const platform = detectVideoPlatform(videoUrl);
  const ytId = platform === "youtube" ? extractYouTubeId(videoUrl) : null;
  const fbId = platform === "facebook" ? extractFacebookVideoId(videoUrl) : null;
  const isValidVideo = (platform === "youtube" && Boolean(ytId)) || (platform === "facebook" && Boolean(fbId));

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    try {
      const data = await getAllAdminVideos();
      setVideoList(data);
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleUrlChange(val: string) {
    const trimmed = val.trim();
    // If user pasted an iframe code or raw URL
    if (trimmed.includes("<iframe") || trimmed.includes("&lt;iframe")) {
      const p = detectVideoPlatform(trimmed);
      if (p === "facebook") {
        setVideoUrl(cleanFacebookUrl(trimmed));
        return;
      }
      if (p === "youtube") {
        setVideoUrl(cleanYouTubeUrl(trimmed));
        return;
      }
    }
    setVideoUrl(trimmed);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError(isEn ? "Video headline is required" : "ভিডিও শিরোনাম আবশ্যক");
      return;
    }
    if (!videoUrl.trim() || !isValidVideo) {
      setError(
        isEn
          ? "Please provide a valid YouTube (youtube.com/watch?v=...) or Facebook (facebook.com/watch/?v=...) video link"
          : "অনুগ্রহ করে একটি বৈধ ইউটিউব বা ফেসবুক ভিডিওর লিংক দিন"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createVideo({
        title: title.trim(),
        youtubeUrl: videoUrl.trim(),
        customThumbnailUrl: customThumbnailUrl.trim() || undefined,
        description: description.trim() || undefined,
        duration: duration.trim() || "03:45",
        category,
        isFeatured,
      });

      if (!res.success) {
        setError(res.error || (isEn ? "Failed to save video story" : "ভিডিও সংরক্ষণ ব্যর্থ হয়েছে"));
      } else {
        setSuccess(
          isEn
            ? `${platform === "facebook" ? "Facebook" : "YouTube"} video story published successfully!`
            : `${platform === "facebook" ? "ফেসবুক" : "ইউটিউব"} ভিডিও সফলভাবে প্রকাশিত হয়েছে!`
        );
        setTitle("");
        setVideoUrl("");
        setCustomThumbnailUrl("");
        setDescription("");
        setIsFeatured(false);
        setShowAddForm(false);
        await loadVideos();
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isEn ? "Are you sure you want to delete this video story?" : "আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?")) return;
    try {
      const res = await deleteVideo(id);
      if (res.success) {
        setVideoList((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  async function handleToggleFeatured(id: string, current: boolean) {
    try {
      const res = await toggleVideoFeatured(id, !current);
      if (res.success) {
        await loadVideos();
      }
    } catch (err) {
      console.error("Toggle featured failed:", err);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <VideoIcon size={24} className="text-[var(--color-primary)]" />
            {isEn ? "Video Stories & Multimedia Desk (YouTube & Facebook)" : "ভিডিও সংবাদ ও মাল্টিমিডিয়া ডেস্ক (ইউটিউব ও ফেসবুক)"}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {isEn
              ? "Publish and curate multimedia journalism with YouTube and Facebook video embeds, featureds and thumbnail controls"
              : "ইউটিউব ও ফেসবুক ভিডিও লিংক দিয়ে ভিডিও প্রতিবেদন প্রকাশনা, হোমপেজ ফিচার এবং থাম্বনেইল নিয়ন্ত্রণ"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/videos"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold rounded text-[var(--color-text)]"
          >
            <Eye size={14} />
            {isEn ? "View on Portal" : "পোর্টালে দেখুন"}
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer rounded"
          >
            <PlusCircle size={16} />
            {showAddForm
              ? isEn
                ? "Close Form"
                : "ফর্ম বন্ধ করুন"
              : isEn
              ? "Add New Video"
              : "নতুন ভিডিও যুক্ত করুন"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Video Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] rounded space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="bengali-headline text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <PlusCircle size={18} className="text-[var(--color-primary)]" />
              {isEn ? "New Video Report Details" : "নতুন ভিডিও সংবাদ তথ্য"}
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span> YouTube &nbsp;
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span> Facebook
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[var(--color-text-muted)]">
                    {isEn ? "Video URL (YouTube, Facebook, or Embed Code) *" : "ভিডিও লিংক বা এম্বেড কোড (ইউটিউব বা ফেসবুক) *"}
                  </label>
                  {platform !== "unknown" && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded font-mono ${
                        platform === "facebook"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {platform === "facebook" ? "🔵 Facebook Video" : "🔴 YouTube Video"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder={
                    isEn
                      ? "Paste link (https://facebook.com/watch/?v=... or https://youtube.com/watch?v=...) or <iframe> code"
                      : "ভিডিওর লিংক (https://facebook.com/... বা https://youtube.com/...) অথবা <iframe> এম্বেড কোড দিন"
                  }
                  className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                />

                {/* Facebook Video Guidance Checklist */}
                {platform === "facebook" && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                      <Info size={14} />
                      <span>{isEn ? "Important Facebook Video Guidelines:" : "ফেসবুক ভিডিওর জন্য জরুরি নিয়মাবলী:"}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[10px] text-blue-950 dark:text-blue-200/90 leading-relaxed">
                      <li>
                        <strong>{isEn ? "Privacy MUST be Public (🌐):" : "ভিডিওটি অবশ্যই 'Public' (🌐) হতে হবে:"}</strong>{" "}
                        {isEn
                          ? "Facebook prohibits embedding videos from private groups or personal accounts set to 'Friends only'."
                          : "ফেসবুকের নিরাপত্তা নীতি অনুযায়ী কোনো প্রাইভেট গ্রুপ বা ফ্রেন্ডস-অনলি ভিডিও অন্য সাইটে এম্বেড করা যায় না।"}
                      </li>
                      <li>
                        <strong>{isEn ? "Watch Permalinks:" : "সঠিক লিংক ফরম্যাট:"}</strong>{" "}
                        {isEn
                          ? "Best format: https://www.facebook.com/watch/?v=VIDEO_ID or use Facebook's full <iframe> embed code."
                          : "সবচেয়ে নির্ভরযোগ্য ফরম্যাট: https://www.facebook.com/watch/?v=ভিডিও_আইডি অথবা ফেসবুকের সম্পূর্ণ <iframe> কোড।"}
                      </li>
                      <li>
                        {isEn
                          ? "If Facebook displays 'Video Unavailable', verify that the video has no age (18+) or country restrictions."
                          : "যদি 'Video Unavailable' বার্তা আসে, তবে নিশ্চিত করুন ভিডিওতে বয়সসীমা (১৮+) বা লোকেশন রেস্ট্রিকশন নেই।"}
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Story Headline *" : "সংবাদের শিরোনাম *"}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isEn
                      ? "Enter engaging news headline for this video..."
                      : "ভিডিওর মূল আকর্ষণীয় সংবাদ শিরোনাম..."
                  }
                  className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] bengali-headline rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Custom Thumbnail URL (Optional)" : "কাস্টম থাম্বনেইল ছবির লিংক (ঐচ্ছিক)"}
                </label>
                <input
                  type="url"
                  value={customThumbnailUrl}
                  onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                  placeholder={
                    isEn
                      ? "https://... (Leave empty to use automatic poster)"
                      : "https://... (ফাঁকা রাখলে স্বয়ংক্রিয় পোস্টার ব্যবহার হবে)"
                  }
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Brief Description (Optional)" : "সংক্ষিপ্ত বিবরণী (ঐচ্ছিক)"}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isEn
                      ? "Write 1-2 lines summarizing the video report..."
                      : "ভিডিও প্রতিবেদন সম্পর্কে ২/১ লাইন লিখুন..."
                  }
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Duration" : "সময়কাল (Duration)"}
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={isEn ? "e.g. 03:45 or 05:20" : "e.g. ০৩:৪৫ বা ০৫:২০"}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Video Category" : "ভিডিও বিভাগ (Category)"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                  >
                    <option value="জাতীয়">{isEn ? "National" : "জাতীয়"}</option>
                    <option value="রাজনীতি">{isEn ? "Politics" : "রাজনীতি"}</option>
                    <option value="আন্তর্জাতিক">{isEn ? "International" : "আন্তর্জাতিক"}</option>
                    <option value="খেলাধুলা">{isEn ? "Sports" : "খেলাধুলা"}</option>
                    <option value="বিনোদন">{isEn ? "Entertainment" : "বিনোদন"}</option>
                    <option value="প্রযুক্তি">{isEn ? "Technology" : "প্রযুক্তি"}</option>
                    <option value="পরিবেশ">{isEn ? "Environment" : "পরিবেশ"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>
                    {isEn
                      ? "Set as Homepage Lead Featured Video"
                      : "হোমপেজের প্রধান বড় ভিডিও (Lead Featured Video) হিসেবে দেখান"}
                  </span>
                </label>
              </div>
            </div>

            {/* Live Interactive Embed Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--color-border)] lg:pl-6 pt-4 lg:pt-0">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="block text-xs font-bold text-[var(--color-text-muted)]">
                    {isEn ? "Live Video Player Embed Preview" : "লাইভ প্রিভিউ (Player Embed)"}
                  </span>
                  {isValidVideo && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{isEn ? "Test Link Directly" : "সরাসরি টেস্ট করুন"}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>

                {isValidVideo ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video w-full rounded overflow-hidden border border-zinc-800 bg-black shadow">
                      {platform === "youtube" && ytId && (
                        <iframe
                          src={getYouTubeEmbedUrl(ytId)}
                          title="YouTube video player"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                      {platform === "facebook" && (
                        <iframe
                          src={getFacebookEmbedUrl(videoUrl)}
                          title="Facebook video player"
                          className="w-full h-full border-0"
                          scrolling="no"
                          style={{ border: "none", overflow: "hidden" }}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                    <div
                      className={`text-[11px] font-mono flex items-center justify-between gap-1 font-semibold ${
                        platform === "facebook"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {platform === "facebook"
                          ? isEn
                            ? "Facebook Video verified"
                            : "ফেসবুক ভিডিও ভেরিফায়েড"
                          : isEn
                          ? `YouTube ID: ${ytId}`
                          : `ইউটিউব আইডি: ${ytId}`}
                      </span>

                      {platform === "facebook" && (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] underline font-sans text-blue-500"
                        >
                          {isEn ? "Open in Facebook app/web" : "ফেসবুক অ্যাপে খুলুন"}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] p-4 text-center">
                    <Play size={32} className="text-zinc-400 mb-2" />
                    <span>
                      {isEn
                        ? "Enter YouTube or Facebook video URL to see live player preview here"
                        : "ইউটিউব বা ফেসবুক ভিডিও লিংক দিলে এখানে লাইভ প্লেয়ার প্রিভিউ হবে"}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg-secondary)] rounded cursor-pointer"
                >
                  {isEn ? "Cancel" : "বাতিল"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValidVideo}
                  className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm rounded cursor-pointer"
                >
                  {isSubmitting
                    ? isEn
                      ? "Saving..."
                      : "সংরক্ষণ হচ্ছে..."
                    : isEn
                    ? "Publish Video"
                    : "ভিডিও প্রকাশ করুন"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Videos List Grid */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
        <div className="p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--color-text)]">
            {isEn
              ? `Total Videos: ${formatNumber(videoList.length)}`
              : `মোট ভিডিও: ${formatNumber(videoList.length)} টি`}
          </span>
          <button
            onClick={loadVideos}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            {isEn ? "Refresh" : "রিফ্রেশ"}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            {isEn ? "Loading videos..." : "ভিডিও লোড হচ্ছে..."}
          </div>
        ) : videoList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            {isEn
              ? "No video stories published yet. Click \"Add New Video\" above to add one."
              : "এখনও কোনো ভিডিও সংবাদ যুক্ত করা হয়নি। উপরে \"নতুন ভিডিও যুক্ত করুন\" বাটনে ক্লিক করুন।"}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {videoList.map((v) => {
              const itemPlatform = detectVideoPlatform(v.youtubeUrl);

              return (
                <div
                  key={v.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Thumbnail with duration */}
                    <div className="relative w-36 aspect-video flex-shrink-0 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow ${
                            itemPlatform === "facebook" ? "bg-blue-600" : "bg-[var(--color-primary)]"
                          }`}
                        >
                          <Play size={14} className="fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 font-mono rounded">
                        {v.duration}
                      </span>
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Platform Badge */}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            itemPlatform === "facebook"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300"
                          }`}
                        >
                          {itemPlatform === "facebook" ? "Facebook" : "YouTube"}
                        </span>

                        <span className="px-2 py-0.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-[10px] font-bold text-[var(--color-text-muted)]">
                          {(v.category ? CATEGORY_MAP[v.category]?.[isEn ? "en" : "bn"] || v.category : (isEn ? "General" : "সাধারণ"))}
                        </span>

                        {v.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Star size={10} className="fill-amber-500 text-amber-500" />
                            {isEn ? "Homepage Featured" : "হোমপেজ ফিচারড"}
                          </span>
                        )}
                      </div>

                      <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] leading-snug">
                        {v.title}
                      </h3>

                      {v.description && (
                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                          {v.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-faint)]">
                        <a
                          href={v.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`hover:underline flex items-center gap-1 font-medium ${
                            itemPlatform === "facebook" ? "text-blue-600 dark:text-blue-400" : "text-red-600"
                          }`}
                        >
                          {itemPlatform === "facebook"
                            ? isEn
                              ? "Watch on Facebook"
                              : "ফেসবুকে দেখুন"
                            : isEn
                            ? "Watch on YouTube"
                            : "ইউটিউবে দেখুন"}{" "}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(v.id, v.isFeatured)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                        v.isFeatured
                          ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                      }`}
                      title={
                        v.isFeatured
                          ? isEn
                            ? "Remove homepage featured status"
                            : "হোমপেজ ফিচার বাতিল করুন"
                          : isEn
                          ? "Set as homepage lead featured video"
                          : "হোমপেজের প্রধান ভিডিও হিসেবে সেট করুন"
                      }
                    >
                      <Star size={12} className={v.isFeatured ? "fill-amber-500 text-amber-500" : ""} />
                      {v.isFeatured
                        ? isEn
                          ? "Featured"
                          : "ফিচারড"
                        : isEn
                        ? "Feature"
                        : "ফিচার করুন"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                      title={isEn ? "Delete video" : "ভিডিও মুছুন"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
