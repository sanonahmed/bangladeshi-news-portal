"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Globe,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Smartphone,
  Monitor,
  FileText,
  KeyRound,
  Eye,
  Camera,
  Layers,
} from "lucide-react";
import { TwitterXIcon } from "@/components/ui/icons";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface SeoQualityScorecardProps {
  title: string;
  seoTitle?: string;
  slug: string;
  excerpt?: string;
  seoDescription?: string;
  content: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  categoryName?: string;
  focusKeyword: string;
  onFocusKeywordChange: (val: string) => void;
  onApplySeoTitle?: (val: string) => void;
  onApplySeoDescription?: (val: string) => void;
  onJumpToImageAlt?: () => void;
}

export function SeoQualityScorecard({
  title,
  seoTitle,
  slug,
  excerpt,
  seoDescription,
  content,
  featuredImageUrl,
  featuredImageAlt,
  categoryName = "জাতীয়",
  focusKeyword,
  onFocusKeywordChange,
  onApplySeoTitle,
  onApplySeoDescription,
  onJumpToImageAlt,
}: SeoQualityScorecardProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"google" | "facebook" | "twitter">("google");
  const [googleDevice, setGoogleDevice] = useState<"mobile" | "desktop">("mobile");

  // Effective display texts
  const displayTitle = (seoTitle || title || "").trim();
  const displayDesc = (seoDescription || excerpt || "").trim();
  const displaySlug = (slug || "").trim() || "news-slug";
  const siteDomain = "barta24.com";
  const siteName = isEn ? "Daily Bangladesh Barta" : "দৈনিক বাংলাদেশ বার্তা";

  // Strip HTML from content for word counting & keyword search
  const plainTextContent = useMemo(() => {
    if (!content) return "";
    return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [content]);

  // Word count & Reading time
  const wordCount = useMemo(() => {
    if (!plainTextContent) return 0;
    return plainTextContent.split(/\s+/).filter(Boolean).length;
  }, [plainTextContent]);

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Character lengths
  const titleCharCount = displayTitle.length;
  const descCharCount = displayDesc.length;

  // Title length analysis (Google mobile truncates around 60-65 chars)
  const titleStatus = useMemo(() => {
    if (titleCharCount === 0) return { status: "empty", label: isEn ? "Empty" : "শিরোনাম অনুপস্থিত", color: "text-zinc-400" };
    if (titleCharCount < 30) return { status: "short", label: isEn ? "Too short" : "অপেক্ষাকৃত ছোট", color: "text-amber-500" };
    if (titleCharCount <= 65) return { status: "good", label: isEn ? "Optimal for Google" : "গুগলের জন্য আদর্শ", color: "text-emerald-500" };
    return { status: "long", label: isEn ? "May get truncated in SERP" : "গুগল সার্চে আংশিক কেটে যেতে পারে", color: "text-amber-500" };
  }, [titleCharCount, isEn]);

  // Meta description analysis (Google truncates around 155-160 chars)
  const descStatus = useMemo(() => {
    if (descCharCount === 0) return { status: "empty", label: isEn ? "Empty" : "বিবরণ অনুপস্থিত", color: "text-zinc-400" };
    if (descCharCount < 70) return { status: "short", label: isEn ? "Too short" : "সংক্ষিপ্ত বিবরণ", color: "text-amber-500" };
    if (descCharCount <= 160) return { status: "good", label: isEn ? "Optimal length" : "আদর্শ দৈর্ঘ্য", color: "text-emerald-500" };
    return { status: "long", label: isEn ? "Exceeds 160 chars (truncated)" : "১৬০ অক্ষরের বেশি (কেটে যাবে)", color: "text-amber-500" };
  }, [descCharCount, isEn]);

  // Focus Keyword Density and checks
  const keywordAnalysis = useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    if (!kw) {
      return {
        hasKeyword: false,
        inTitle: false,
        inDesc: false,
        inLead: false,
        inSlug: false,
        countInBody: 0,
        densityPercent: 0,
        densityRating: "none" as const,
      };
    }

    const lowerTitle = displayTitle.toLowerCase();
    const lowerDesc = displayDesc.toLowerCase();
    const lowerSlug = displaySlug.toLowerCase().replace(/[-_]/g, " ");

    const inTitle = lowerTitle.includes(kw);
    const inDesc = lowerDesc.includes(kw);
    const inSlug = lowerSlug.includes(kw) || displaySlug.toLowerCase().includes(kw.replace(/\s+/g, "-"));

    // Check first 100 words (lead paragraph)
    const first100Words = plainTextContent.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
    const inLead = first100Words.includes(kw);

    // Count occurrences in body
    let countInBody = 0;
    if (plainTextContent) {
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = plainTextContent.match(regex);
      countInBody = matches ? matches.length : 0;
    }

    const wordsInKeyword = kw.split(/\s+/).filter(Boolean).length;
    const densityPercent = wordCount > 0 ? ((countInBody * wordsInKeyword) / wordCount) * 100 : 0;

    let densityRating: "low" | "optimal" | "high" | "none" = "none";
    if (countInBody === 0) densityRating = "low";
    else if (densityPercent >= 0.5 && densityPercent <= 2.5) densityRating = "optimal";
    else if (densityPercent > 2.5) densityRating = "high";
    else densityRating = "low";

    return {
      hasKeyword: true,
      inTitle,
      inDesc,
      inLead,
      inSlug,
      countInBody,
      densityPercent: Math.round(densityPercent * 10) / 10,
      densityRating,
    };
  }, [focusKeyword, displayTitle, displayDesc, displaySlug, plainTextContent, wordCount]);

  // Check subheadings in content
  const hasSubheadings = useMemo(() => {
    return /<h[2-4][^>]*>/i.test(content);
  }, [content]);

  // Image Alt text check
  const hasImage = !!featuredImageUrl?.trim();
  const hasImageAlt = hasImage && !!featuredImageAlt?.trim();

  // Dynamic Overall SEO Score calculation (0 - 100)
  const seoScore = useMemo(() => {
    let score = 0;

    // Title length (0-20 pts)
    if (titleCharCount >= 30 && titleCharCount <= 65) score += 20;
    else if (titleCharCount > 0) score += 10;

    // Meta description length (0-15 pts)
    if (descCharCount >= 70 && descCharCount <= 160) score += 15;
    else if (descCharCount > 0) score += 8;

    // Focus keyword checks (0-30 pts)
    if (keywordAnalysis.hasKeyword) {
      if (keywordAnalysis.inTitle) score += 8;
      if (keywordAnalysis.inDesc) score += 7;
      if (keywordAnalysis.inLead) score += 5;
      if (keywordAnalysis.inSlug) score += 5;
      if (keywordAnalysis.densityRating === "optimal") score += 5;
      else if (keywordAnalysis.countInBody > 0) score += 2;
    } else {
      score += 5; // Default baseline if no keyword specified
    }

    // Image alt text (0-15 pts)
    if (hasImage && hasImageAlt) score += 15;
    else if (!hasImage) score += 10; // No image is neutral

    // Content length & structure (0-20 pts)
    if (wordCount >= 250) score += 12;
    else if (wordCount >= 100) score += 6;

    if (hasSubheadings) score += 8;

    return Math.min(100, Math.max(0, score));
  }, [titleCharCount, descCharCount, keywordAnalysis, hasImage, hasImageAlt, wordCount, hasSubheadings]);

  const scoreBadge = useMemo(() => {
    if (seoScore >= 80) return { label: isEn ? "Excellent SEO" : "চমৎকার এসইও", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950/50" };
    if (seoScore >= 55) return { label: isEn ? "Good (Minor Tweaks)" : "সন্তোষজনক মান", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", border: "border-amber-300 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-950/50" };
    return { label: isEn ? "Needs Attention" : "উন্নতির সুযোগ আছে", color: "bg-rose-500", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-800", bg: "bg-rose-50 dark:bg-rose-950/50" };
  }, [seoScore, isEn]);

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs space-y-0">
      {/* Top Header with SEO Score */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Search size={16} />
            </span>
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              {isEn ? "Real-Time SEO & Headline SERP Simulator" : "রিয়েল-টাইম এসইও ও সার্চ প্রিভিউ স্কোরকার্ড"}
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? "Live Google, Facebook & X SERP preview with keyword density & editorial checklist"
              : "গুগল সার্চ ও সোশ্যাল ফিডে কীভাবে প্রদর্শিত হবে এবং সার্চ ইঞ্জিন অপ্টিমাইজেশন বিশ্লেষণ"}
          </p>
        </div>

        {/* Live SEO Score Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${scoreBadge.border} ${scoreBadge.bg}`}>
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${scoreBadge.color} animate-pulse`} />
          </div>
          <div className="text-right">
            <div className={`text-xs font-black ${scoreBadge.text} flex items-center gap-1`}>
              <span>{isEn ? `SEO Score: ${seoScore}/100` : `এসইও স্কোর: ${formatNumber(seoScore)}/১০০`}</span>
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)] font-medium">
              {scoreBadge.label}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* SERP Preview Section with Tabs */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("google")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === "google"
                    ? "bg-[var(--color-bg)] border-t-2 border-blue-600 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <Search size={13} />
                <span>Google Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("facebook")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === "facebook"
                    ? "bg-[var(--color-bg)] border-t-2 border-[#1877F2] text-[#1877F2] shadow-2xs font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <Share2 size={13} />
                <span>Facebook Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("twitter")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  activeTab === "twitter"
                    ? "bg-[var(--color-bg)] border-t-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <TwitterXIcon size={12} />
                <span>X / Twitter</span>
              </button>
            </div>

            {/* Google Device Toggle */}
            {activeTab === "google" && (
              <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] p-0.5 rounded border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setGoogleDevice("mobile")}
                  className={`p-1 rounded text-xs flex items-center gap-1 ${
                    googleDevice === "mobile"
                      ? "bg-[var(--color-bg)] text-[var(--color-primary)] font-bold shadow-2xs"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                  title={isEn ? "Google Mobile SERP" : "গুগল মোবাইল সার্চ"}
                >
                  <Smartphone size={13} />
                  <span className="text-[11px]">Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleDevice("desktop")}
                  className={`p-1 rounded text-xs flex items-center gap-1 ${
                    googleDevice === "desktop"
                      ? "bg-[var(--color-bg)] text-[var(--color-primary)] font-bold shadow-2xs"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                  title={isEn ? "Google Desktop SERP" : "গুগল ডেস্কটপ সার্চ"}
                >
                  <Monitor size={13} />
                  <span className="text-[11px]">Desktop</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Google SERP Preview Box */}
          {activeTab === "google" && (
            <div
              className={`p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all ${
                googleDevice === "mobile" ? "max-w-md mx-auto shadow-md" : "w-full"
              }`}
            >
              <div className="space-y-1.5">
                {/* Google Site identifier & breadcrumbs */}
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-[10px] flex-shrink-0">
                    ব
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      {siteName}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      https://{siteDomain} › news › {displaySlug}
                    </span>
                  </div>
                </div>

                {/* Google Clickable Headline (Blue) */}
                <h4 className="text-[18px] sm:text-[19px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-normal cursor-pointer leading-snug line-clamp-2">
                  {displayTitle || (isEn ? "Untitled Article Headline - Please enter story title" : "শিরোনামহীন সংবাদ - অনুগ্রহ করে শিরোনাম দিন")}
                  {titleCharCount > 65 && " ..."}
                </h4>

                {/* Meta Description snippet */}
                <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                  <span className="text-zinc-400 dark:text-zinc-500 text-[11px] mr-1">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} —
                  </span>
                  {displayDesc || (isEn ? "No meta description provided. Google will automatically generate a snippet from your article body." : "কোনো মেটা বিবরণ দেওয়া হয়নি। গুগল স্বয়ংক্রিয়ভাবে সংবাদের প্রথম অংশ থেকে বিবরণ তৈরি করবে।")}
                  {descCharCount > 160 && " ..."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Facebook Card Preview */}
          {activeTab === "facebook" && (
            <div className="max-w-md mx-auto rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-md">
              <div className="relative aspect-[1.91/1] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {featuredImageUrl ? (
                  <img
                    src={featuredImageUrl}
                    alt={featuredImageAlt || displayTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1.5 p-4 text-center">
                    <Camera size={24} />
                    <span className="text-xs font-medium">
                      {isEn ? "No Featured Image (Standard card will show)" : "মূল ছবি নেই (ডিফল্ট লোগো দেখাবে)"}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#F0F2F5] dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-700 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  {siteDomain.toUpperCase()}
                </span>
                <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                  {displayTitle || (isEn ? "Bengali News Headline" : "সংবাদের মূল শিরোনাম")}
                </h4>
                <p className="text-[12px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                  {displayDesc || excerpt || (isEn ? "Read the full story on Barta24" : "বিস্তারিত পড়ুন দৈনিক বাংলাদেশ বার্তা পোর্টালে...")}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: X / Twitter Card Preview */}
          {activeTab === "twitter" && (
            <div className="max-w-md mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-md">
              <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {featuredImageUrl ? (
                  <img
                    src={featuredImageUrl}
                    alt={featuredImageAlt || displayTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                    <TwitterXIcon size={22} />
                    <span className="text-xs">{isEn ? "16:9 Summary Large Image" : "টুইটার সামারি লার্জ ইমেজ"}</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-mono">
                  {siteDomain}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                  {displayTitle || (isEn ? "Headline on X / Twitter" : "টুইটার কার্ডের শিরোনাম")}
                </h4>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {displayDesc || (isEn ? "Short description snippet of the news" : "সংবাদের সংক্ষিপ্তসার")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Character Meters: Headline & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Title Gauge */}
          <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                <FileText size={13} className="text-blue-500" />
                <span>{isEn ? "Headline Length" : "শিরোনামের দৈর্ঘ্য (Title)"}</span>
              </span>
              <span className={`font-mono text-xs font-bold ${titleStatus.color}`}>
                {isEn ? `${titleCharCount} / 65 chars` : `${formatNumber(titleCharCount)} / ৬৫ অক্ষর`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  titleCharCount < 30
                    ? "bg-amber-500"
                    : titleCharCount <= 65
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, (titleCharCount / 65) * 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span>{titleStatus.label}</span>
              {titleCharCount > 65 && (
                <span className="text-rose-500 font-semibold">
                  {isEn ? `+${titleCharCount - 65} truncated` : `+${formatNumber(titleCharCount - 65)} অক্ষর বেশি`}
                </span>
              )}
            </p>
          </div>

          {/* Description Gauge */}
          <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                <FileText size={13} className="text-purple-500" />
                <span>{isEn ? "Meta Description Length" : "মেটা বিবরণের দৈর্ঘ্য"}</span>
              </span>
              <span className={`font-mono text-xs font-bold ${descStatus.color}`}>
                {isEn ? `${descCharCount} / 160 chars` : `${formatNumber(descCharCount)} / ১৬০ অক্ষর`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  descCharCount < 70
                    ? "bg-amber-500"
                    : descCharCount <= 160
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, (descCharCount / 160) * 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span>{descStatus.label}</span>
              {descCharCount > 160 && (
                <span className="text-rose-500 font-semibold">
                  {isEn ? `+${descCharCount - 160} truncated` : `+${formatNumber(descCharCount - 160)} অক্ষর বেশি`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Focus Keyword & Density Analyzer */}
        <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <KeyRound size={15} className="text-amber-500" />
              <label className="text-xs font-bold text-[var(--color-text)]">
                {isEn ? "Focus Keyword Analyzer (Target Search Query)" : "ফোকাস কি-ওয়ার্ড ও ডেনসিটি এনালাইজার"}
              </label>
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {isEn ? "e.g., Bangladesh Bank, Cricket, Election" : "যেমন: বাংলাদেশ ব্যাংক, মূল্যস্ফীতি, নির্বাচন"}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              placeholder={isEn ? "Enter focus search keyword here..." : "মূল ফোকাস কি-ওয়ার্ড লিখুন..."}
              className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
            />
            {focusKeyword && (
              <button
                type="button"
                onClick={() => onFocusKeywordChange("")}
                className="absolute right-2 top-2 text-xs text-zinc-400 hover:text-zinc-600 px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {/* Real-Time Keyword Presence Checklist */}
          {keywordAnalysis.hasKeyword ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
                {keywordAnalysis.inTitle ? (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" />
                )}
                <span className={keywordAnalysis.inTitle ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-zinc-500"}>
                  {isEn ? "In Headline" : "শিরোনামে কি-ওয়ার্ড"}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
                {keywordAnalysis.inDesc ? (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" />
                )}
                <span className={keywordAnalysis.inDesc ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-zinc-500"}>
                  {isEn ? "In Meta Desc" : "মেটা বর্ণনায় কি-ওয়ার্ড"}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
                {keywordAnalysis.inLead ? (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                )}
                <span className={keywordAnalysis.inLead ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-zinc-500"}>
                  {isEn ? "In Lead Paragraph" : "প্রথম প্যারায় (Lead)"}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
                {keywordAnalysis.inSlug ? (
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-zinc-400 flex-shrink-0" />
                )}
                <span className={keywordAnalysis.inSlug ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-zinc-500"}>
                  {isEn ? "In URL Slug" : "ইউআরএল স্লাগে"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[var(--color-text-muted)] italic">
              {isEn
                ? "Tip: Enter a focus keyword to verify search engine relevance and keyword density."
                : "পরামর্শ: গুগলে যে শব্দ দিয়ে সংবাদটি সহজে খুঁজে পাওয়া উচিত, সেই ফোকাস কি-ওয়ার্ডটি এখানে লিখুন।"}
            </p>
          )}

          {/* Keyword Density Score */}
          {keywordAnalysis.hasKeyword && (
            <div className="flex items-center justify-between p-2 rounded bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                {isEn
                  ? `Keyword Density in Article: ${keywordAnalysis.densityPercent}% (${keywordAnalysis.countInBody} occurrences)`
                  : `কনটেন্টে কি-ওয়ার্ডের ঘনত্ব: ${formatNumber(keywordAnalysis.densityPercent)}% (মোট ${formatNumber(keywordAnalysis.countInBody)} বার ব্যবহৃত)`}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {isEn ? "Optimal: 0.5% - 2.5%" : "প্রস্তাবিত মাত্রা: ০.৫% - ২.৫%"}
              </span>
            </div>
          )}
        </div>

        {/* Pre-Publication Editorial Checklist & Alerts */}
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-secondary)] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>{isEn ? "Pre-Publication Editorial Quality Checklist" : "প্রকাশনার পূর্ববর্তী সম্পাদকীয় গুণগত চেকলিস্ট"}</span>
          </h4>

          <div className="space-y-2 text-xs">
            {/* Missing Alt Text Alert */}
            {hasImage && !hasImageAlt ? (
              <div className="flex items-start gap-2 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">
                    {isEn ? "Missing Featured Image Caption & Alt Text!" : "সতর্কবার্তা: মূল ছবির ক্যাপশন ও অল্টার টেক্সট খালি!"}
                  </span>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                    {isEn
                      ? "Search engines and screen-readers require image descriptions for SEO ranking and accessibility."
                      : "গুগল ইমেজ সার্চ এবং দৃষ্টিপ্রতিবন্ধী পাঠকদের স্ক্রিনরিডারের জন্য ছবির বিবরণ ও আলোকচিত্রীর ক্রেডিট দেওয়া আবশ্যক।"}
                  </p>
                  {onJumpToImageAlt && (
                    <button
                      type="button"
                      onClick={onJumpToImageAlt}
                      className="mt-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 underline hover:no-underline"
                    >
                      {isEn ? "→ Jump to caption field" : "→ ছবির ক্যাপশন লিখতে ক্লিক করুন"}
                    </button>
                  )}
                </div>
              </div>
            ) : hasImage && hasImageAlt ? (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>{isEn ? "Featured image has proper caption & attribution" : "মূল ছবির সঠিক ক্যাপশন ও ক্রেডিট প্রদান করা হয়েছে"}</span>
              </div>
            ) : null}

            {/* Word count check */}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <FileText size={13} />
                <span>{isEn ? `Article Length: ${wordCount} words (~${readingTimeMinutes} min read)` : `সংবাদের কলেবর: ${formatNumber(wordCount)} শব্দ (প্রায় ${formatNumber(readingTimeMinutes)} মিনিট পাঠকাল)`}</span>
              </span>
              {wordCount >= 200 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {isEn ? "Good depth" : "পর্যাপ্ত তথ্যবহুল"}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Info size={12} /> {isEn ? "Short brief" : "সংক্ষিপ্ত সংবাদ"}
                </span>
              )}
            </div>

            {/* Subheadings check */}
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <Layers size={13} />
                <span>{isEn ? "Subheadings (H2/H3 for readability)" : "উপ-শিরোনাম (Subheadings H2/H3)"}</span>
              </span>
              {hasSubheadings ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {isEn ? "Included" : "যুক্ত আছে"}
                </span>
              ) : (
                <span className="text-zinc-500 flex items-center gap-1">
                  <Info size={12} /> {isEn ? "Optional for longer pieces" : "বড় সংবাদের জন্য প্রস্তাবিত"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
