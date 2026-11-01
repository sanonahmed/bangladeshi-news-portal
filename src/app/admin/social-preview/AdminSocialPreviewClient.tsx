"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Smartphone,
  Globe,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

interface ArticleOption {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  categoryName?: string | null;
  featuredImageUrl?: string | null;
  authorName?: string | null;
}

interface AdminSocialPreviewClientProps {
  articles: ArticleOption[];
}

export function AdminSocialPreviewClient({ articles }: AdminSocialPreviewClientProps) {
  const defaultArticle = articles[0];

  const [selectedArticleId, setSelectedArticleId] = useState<string>(defaultArticle?.id || "");
  const [title, setTitle] = useState(defaultArticle?.title || "ঢাকায় আধুনিক গণপরিবহন ব্যবস্থার সম্প্রসারণে নতুন প্রকল্প অনুমোদন");
  const [category, setCategory] = useState(defaultArticle?.categoryName || "জাতীয় সংবাদ");
  const [imageUrl, setImageUrl] = useState(defaultArticle?.featuredImageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80");
  const [author, setAuthor] = useState(defaultArticle?.authorName || "বিশেষ প্রতিবেদক");
  const [activePlatform, setActivePlatform] = useState<"facebook" | "twitter" | "whatsapp" | "raw">("facebook");
  const [copied, setCopied] = useState(false);

  // Generate dynamic OG image URL
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&image=${encodeURIComponent(imageUrl)}&author=${encodeURIComponent(author)}`;

  function handleSelectArticle(articleId: string) {
    setSelectedArticleId(articleId);
    const found = articles.find((a) => a.id === articleId);
    if (found) {
      setTitle(found.title);
      setCategory(found.categoryName || "জাতীয় সংবাদ");
      setImageUrl(found.featuredImageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80");
      setAuthor(found.authorName || "বিশেষ প্রতিবেদক");
    }
  }

  function handleCopyOgUrl() {
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}${ogImageUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Share2 size={26} className="text-[#C8102E]" />
            সোশ্যাল কার্ড ও ওপেন গ্রাফ (OG) প্রিভিউ জেনারেটর
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            ফেসবুক, এক্স (টুইটার), হোয়াটসঅ্যাপ ও লিঙ্কডইনে সংবাদ শেয়ারের সময় আকর্ষণীয় ভিজ্যুয়াল প্রিভিউ পরীক্ষা করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyOgUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text)] rounded transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? "লিংক কপি সম্পন্ন!" : "কার্ড ইমেজ লিংক কপি"}</span>
          </button>

          <a
            href={ogImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] hover:bg-red-700 text-white text-xs font-bold rounded transition-colors"
          >
            <ExternalLink size={14} />
            <span>পূর্ণাঙ্গ ছবি দেখুন</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Customizer (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[var(--color-border)] p-5 bg-[var(--color-bg)] rounded space-y-4 shadow-sm">
            <h3 className="bengali-headline font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#C8102E]" />
              কার্ডের তথ্য ও উপাদান নির্ধারণ
            </h3>

            {/* Quick Article Picker */}
            {articles.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  প্রকাশিত সংবাদ থেকে নির্বাচন করুন
                </label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => handleSelectArticle(e.target.value)}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[#C8102E]"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.title.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                সংবাদের শিরোনাম (Title) *
              </label>
              <textarea
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="সোশ্যাল কার্ডে প্রদর্শিত আকর্ষণীয় শিরোনাম..."
                className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-bold focus:outline-none focus:border-[#C8102E] rounded bengali-headline"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                {title.length} অক্ষর (সোশ্যাল মিডিয়ার জন্য ৫০-৮০ অক্ষর আদর্শ)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  বিভাগ / ক্যাটাগরি
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="যেমন: জাতীয় সংবাদ"
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                  প্রতিবেদকের নাম (Author)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="যেমন: নিজস্ব প্রতিবেদক"
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
                পটভূমি ছবির লিংক (Image URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../photo.jpg"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono rounded focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>
        </div>

        {/* Right Area: Multi-Platform Simulators (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Platform Tab Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-2">
            <button
              type="button"
              onClick={() => setActivePlatform("facebook")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activePlatform === "facebook"
                  ? "bg-[#1877F2] text-white shadow-xs"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              Facebook ফিড প্রিভিউ
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform("twitter")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activePlatform === "twitter"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              X (Twitter) কার্ড
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform("whatsapp")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activePlatform === "whatsapp"
                  ? "bg-[#25D366] text-white shadow-xs"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              WhatsApp চ্যাট প্রিভিউ
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform("raw")}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                activePlatform === "raw"
                  ? "bg-[#C8102E] text-white shadow-xs"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              মূল OG কার্ড (১২০০ × ৬৩০)
            </button>
          </div>

          {/* SIMULATOR: Facebook */}
          {activePlatform === "facebook" && (
            <div className="bg-white dark:bg-[#242526] text-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden shadow-md max-w-xl mx-auto">
              {/* FB Post Header */}
              <div className="p-3.5 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-sm">
                  বা
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm leading-tight">
                    <span>দৈনিক বাংলাদেশ বার্তা</span>
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full text-white text-[9px] flex items-center justify-center">
                      ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    এখনই • 🌐
                  </span>
                </div>
              </div>

              <div className="px-3.5 pb-2.5 text-xs">
                সর্বশেষ তাজা খবর ও বিস্তারিত প্রতিবেদন পড়ুন...
              </div>

              {/* Dynamic Image Card */}
              <div className="relative aspect-[1200/630] w-full bg-zinc-950">
                <img
                  key={ogImageUrl}
                  src={ogImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* FB Link Strip */}
              <div className="p-3 bg-zinc-100 dark:bg-[#3a3b3c]/50 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block font-mono">
                  bangladeshi-news-portal.onrender.com
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug line-clamp-1 mt-0.5">
                  {title}
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-1 mt-0.5">
                  {category} • দৈনিক বাংলাদেশ বার্তা অনলাইন সংস্করণ
                </p>
              </div>
            </div>
          )}

          {/* SIMULATOR: Twitter / X */}
          {activePlatform === "twitter" && (
            <div className="bg-black text-white border border-zinc-800 rounded-2xl overflow-hidden shadow-md max-w-xl mx-auto p-4 space-y-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-sm">
                  বা
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm">
                    <span>দৈনিক বাংলাদেশ বার্তা</span>
                    <span className="text-zinc-400 font-normal text-xs">@BangladeshBarta • ১ মি.</span>
                  </div>
                </div>
              </div>

              <p className="text-sm">
                {title.slice(0, 100)}...
              </p>

              {/* X Large Image Card */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden relative group">
                <div className="relative aspect-[1200/630] w-full bg-zinc-950">
                  <img
                    key={ogImageUrl}
                    src={ogImageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono">
                    bangladeshi-news-portal.onrender.com
                  </div>
                </div>
                <div className="p-3 bg-zinc-950">
                  <span className="text-xs font-bold text-zinc-300 line-clamp-1">
                    {title}
                  </span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1">
                    {category} • পড়ুন বিস্তারিত প্রতিবেদনে
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: WhatsApp */}
          {activePlatform === "whatsapp" && (
            <div className="bg-[#0b141a] p-6 rounded-lg max-w-md mx-auto shadow-md">
              <div className="bg-[#005c4b] text-white rounded-lg rounded-tr-none p-2 space-y-1.5 shadow-sm max-w-sm ml-auto">
                {/* Thumbnail */}
                <div className="relative aspect-[1200/630] w-full rounded overflow-hidden bg-black">
                  <img
                    key={ogImageUrl}
                    src={ogImageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="px-1">
                  <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                    {title}
                  </h4>
                  <span className="text-[10px] text-zinc-300 font-mono block mt-0.5">
                    bangladeshi-news-portal.onrender.com
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-300 pt-0.5">
                  <span>৭:৩৮ অপরাহ্ন</span>
                  <span className="text-blue-400">✓✓</span>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: Raw 1200x630 Card */}
          {activePlatform === "raw" && (
            <div className="space-y-3">
              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-black shadow-lg">
                <img
                  key={ogImageUrl}
                  src={ogImageUrl}
                  alt={title}
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-center text-xs text-[var(--color-text-muted)] font-mono">
                রেজোলিউশন: ১২০০ × ৬৩০ পিক্সেল (আদর্শ হাই-রেজ সোশ্যাল মেটাডাটা ব্যানার)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
