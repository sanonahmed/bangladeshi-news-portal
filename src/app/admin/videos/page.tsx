"use client";

import { useState, useEffect } from "react";
import {
  getAllAdminVideos,
  createVideo,
  deleteVideo,
  toggleVideoFeatured,
} from "@/actions/videos";
import { extractYouTubeId } from "@/lib/youtube";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminVideosPage() {
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("৩:৪৫");
  const [category, setCategory] = useState("জাতীয়");
  const [isFeatured, setIsFeatured] = useState(false);

  // Computed preview
  const extractedId = extractYouTubeId(youtubeUrl);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("ভিডিও শিরোনাম আবশ্যক");
      return;
    }
    if (!youtubeUrl.trim() || !extractedId) {
      setError("সঠিক ইউটিউব ভিডিও লিংক দিন");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createVideo({
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        description: description.trim() || undefined,
        duration: duration.trim() || "৩:৪৫",
        category,
        isFeatured,
      });

      if (!res.success) {
        setError(res.error || "ভিডিও সংরক্ষণ ব্যর্থ হয়েছে");
      } else {
        setSuccess("ভিডিও সফলভাবে সংরক্ষিত হয়েছে!");
        setTitle("");
        setYoutubeUrl("");
        setDescription("");
        setIsFeatured(false);
        setShowAddForm(false);
        await loadVideos();
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার এরর ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?")) return;
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
            ভিডিও সংবাদ ও ইউটিউব এম্বেড ম্যানেজার
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ইউটিউব লিংক দিয়ে ভিডিও সংবাদ প্রকাশ, হোমপেজ ফিচার এবং মাল্টিমিডিয়া কিউরেশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/videos"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold rounded text-[var(--color-text)]"
          >
            <Eye size={14} />
            পোর্টালে দেখুন
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer rounded"
          >
            <PlusCircle size={16} />
            {showAddForm ? "ফর্ম বন্ধ করুন" : "নতুন ভিডিও যুক্ত করুন"}
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
              নতুন ভিডিও সংবাদ তথ্য
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              ইউটিউব লিংক দিলেই স্বয়ংক্রিয়ভাবে ভিডিও আইডি ও থাম্বনেইল সনাক্ত হবে
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  ইউটিউব ভিডিও লিংক (YouTube URL) *
                </label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... বা https://youtu.be/..."
                  className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)] rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  সংবাদের শিরোনাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ভিডিওর মূল আকর্ষণীয় সংবাদ শিরোনাম..."
                  className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] bengali-headline rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  সংক্ষিপ্ত বিবরণী (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ভিডিও প্রতিবেদন সম্পর্কে ২/১ লাইন লিখুন..."
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    সময়কাল (Duration)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. ০৩:৪৫ বা ০৫:২০"
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                    ভিডিও বিভাগ (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
                  >
                    <option value="জাতীয়">জাতীয়</option>
                    <option value="রাজনীতি">রাজনীতি</option>
                    <option value="আন্তর্জাতিক">আন্তর্জাতিক</option>
                    <option value="খেলাধুলা">খেলাধুলা</option>
                    <option value="বিনোদন">বিনোদন</option>
                    <option value="প্রযুক্তি">প্রযুক্তি</option>
                    <option value="পরিবেশ">পরিবেশ</option>
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
                  <span>হোমপেজের প্রধান বড় ভিডিও (Lead Featured Video) হিসেবে দেখান</span>
                </label>
              </div>
            </div>

            {/* Live YouTube Embed Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--color-border)] lg:pl-6 pt-4 lg:pt-0">
              <div>
                <span className="block text-xs font-bold text-[var(--color-text-muted)] mb-2">
                  লাইভ প্রিভিউ (Live YouTube Embed)
                </span>

                {extractedId ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video w-full rounded overflow-hidden border border-zinc-800 bg-black shadow">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractedId}`}
                        title="YouTube video player"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      ভিডিও আইডি: {extractedId}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] p-4 text-center">
                    <Play size={32} className="text-zinc-400 mb-2" />
                    <span>ইউটিউব লিংক দিলে এখানে লাইভ প্লেয়ার প্রিভিউ হবে</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg-secondary)] rounded cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !extractedId}
                  className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm rounded cursor-pointer"
                >
                  {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "ভিডিও প্রকাশ করুন"}
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
            মোট ভিডিও: {videoList.length} টি
          </span>
          <button
            onClick={loadVideos}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            রিফ্রেশ
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            ভিডিও লোড হচ্ছে...
          </div>
        ) : videoList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            এখনও কোনো ভিডিও সংবাদ যুক্ত করা হয়নি। উপরে "নতুন ভিডিও যুক্ত করুন" বাটনে ক্লিক করুন।
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {videoList.map((v) => (
              <div
                key={v.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail with duration */}
                  <div className="relative w-36 aspect-video flex-shrink-0 bg-zinc-900 rounded overflow-hidden">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow">
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
                      <span className="px-2 py-0.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-[10px] font-bold text-[var(--color-text-muted)]">
                        {v.category}
                      </span>
                      {v.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          হোমপেজ ফিচারড
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
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        ইউটিউব লিংক <ExternalLink size={10} />
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
                    title={v.isFeatured ? "হোমপেজ ফিচার বাতিল করুন" : "হোমপেজের প্রধান ভিডিও হিসেবে সেট করুন"}
                  >
                    <Star size={12} className={v.isFeatured ? "fill-amber-500 text-amber-500" : ""} />
                    {v.isFeatured ? "ফিচারড" : "ফিচার করুন"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                    title="ভিডিও মুছুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
