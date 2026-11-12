"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle } from "@/actions/articles";
import { getCategories, type CategoryItem } from "@/actions/categories";
import { getDivisionsWithDistricts, type DivisionWithDistricts } from "@/actions/geography";
import { TiptapEditor } from "@/components/admin/editor/TiptapEditor";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Calendar,
  Save,
  RotateCcw,
  Trash2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AiEditorAssistantModal } from "@/components/admin/editor/AiEditorAssistantModal";
import { SeoQualityScorecard } from "@/components/admin/editor/SeoQualityScorecard";
import { HeadlineAbTestingPanel } from "@/components/admin/editor/HeadlineAbTestingPanel";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

const AUTOSAVE_STORAGE_KEY = "barta_draft_article_new";

export default function NewArticlePage() {
  const router = useRouter();
  const { language, formatNumber, formatDateString } = useAdminLanguage();
  const isEn = language === "en";

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [status, setStatus] = useState<"draft" | "pending_review" | "approved" | "published" | "scheduled">("published");
  const [scheduledAt, setScheduledAt] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [newsLocation, setNewsLocation] = useState("Dhaka");
  const [divisionsList, setDivisionsList] = useState<DivisionWithDistricts[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [headlineB, setHeadlineB] = useState("");
  const [isAbTestingEnabled, setIsAbTestingEnabled] = useState(false);
  const [abTestDurationMinutes, setAbTestDurationMinutes] = useState(30);

  const imageAltInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch(() => {});
  }, []);

  // Autosave states
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedDraftFound, setSavedDraftFound] = useState<{
    title: string;
    savedAt: string;
    data: any;
  } | null>(null);

  // Load categories and divisions
  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategoriesList(cats);
        if (cats.length > 0 && cats[0]?.id && !categoryId) {
          setCategoryId(cats[0].id);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));

    getDivisionsWithDistricts()
      .then((divs) => {
        setDivisionsList(divs);
      })
      .catch((err) => console.error("Error loading divisions:", err));
  }, []);

  // Check for existing autosaved draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.title || parsed.content) {
          const dateStr = parsed.savedAt
            ? new Date(parsed.savedAt).toLocaleTimeString(isEn ? "en-US" : "bn-BD", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : (isEn ? "Moments ago" : "কিছুক্ষণ আগে");
          setSavedDraftFound({
            title: parsed.title,
            savedAt: dateStr,
            data: parsed,
          });
        }
      }
    } catch (e) {
      console.warn("Could not check local draft:", e);
    }
  }, [isEn]);

  // Set default schedule time to current time + 2 hours
  useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setScheduledAt(localIso);
  }, []);

  // Autosave timer: every 20 seconds
  useEffect(() => {
    if (!title && !content) return;

    const timer = setInterval(() => {
      saveDraftLocally();
    }, 20000);

    return () => clearInterval(timer);
  }, [
    title,
    titleEn,
    slug,
    excerpt,
    content,
    categoryId,
    featuredImageUrl,
    featuredImageAlt,
    newsLocation,
    isBreaking,
    isFeatured,
    seoTitle,
    seoDescription,
    scheduledAt,
    status,
  ]);

  function saveDraftLocally() {
    if (!title.trim() && !content.trim()) return;
    try {
      const draftPayload = {
        title,
        titleEn,
        slug,
        excerpt,
        content,
        categoryId,
        featuredImageUrl,
        featuredImageAlt,
        newsLocation,
        isBreaking,
        isFeatured,
        seoTitle,
        seoDescription,
        focusKeyword,
        headlineB,
        isAbTestingEnabled,
        abTestDurationMinutes,
        scheduledAt,
        status,
        savedAt: Date.now(),
      };
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftPayload));
      const nowStr = new Date().toLocaleTimeString(isEn ? "en-US" : "bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedTime(nowStr);
      setHasUnsavedChanges(false);
    } catch (e) {
      console.warn("Autosave failed:", e);
    }
  }

  function restoreDraft() {
    if (!savedDraftFound?.data) return;
    const d = savedDraftFound.data;
    if (d.title) setTitle(d.title);
    if (d.titleEn) setTitleEn(d.titleEn);
    if (d.slug) setSlug(d.slug);
    if (d.excerpt) setExcerpt(d.excerpt);
    if (d.content) setContent(d.content);
    if (d.categoryId) setCategoryId(d.categoryId);
    if (d.featuredImageUrl) setFeaturedImageUrl(d.featuredImageUrl);
    if (d.featuredImageAlt) setFeaturedImageAlt(d.featuredImageAlt);
    if (d.newsLocation) setNewsLocation(d.newsLocation);
    if (d.isBreaking !== undefined) setIsBreaking(d.isBreaking);
    if (d.isFeatured !== undefined) setIsFeatured(d.isFeatured);
    if (d.seoTitle) setSeoTitle(d.seoTitle);
    if (d.seoDescription) setSeoDescription(d.seoDescription);
    if (d.focusKeyword) setFocusKeyword(d.focusKeyword);
    if (d.headlineB) setHeadlineB(d.headlineB);
    if (d.isAbTestingEnabled !== undefined) setIsAbTestingEnabled(d.isAbTestingEnabled);
    if (d.abTestDurationMinutes) setAbTestDurationMinutes(d.abTestDurationMinutes);
    if (d.scheduledAt) setScheduledAt(d.scheduledAt);
    if (d.status) setStatus(d.status);

    setSavedDraftFound(null);
    setLastSavedTime(isEn ? "Draft restored" : "রিস্টোর করা হয়েছে");
  }

  function discardDraft() {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch {}
    setSavedDraftFound(null);
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    setHasUnsavedChanges(true);
    if (!slug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated || `news-${Date.now()}`);
    }
  }

  function handleTitleEnChange(val: string) {
    setTitleEn(val);
    setHasUnsavedChanges(true);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (generated) {
      setSlug(generated);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!title.trim()) {
      setError(isEn ? "Article headline is required" : "সংবাদের মূল শিরোনাম আবশ্যক");
      return;
    }
    if (!content.trim()) {
      setError(isEn ? "Article body content is required" : "সংবাদের বিস্তারিত বিষয়বস্তু লিখুন");
      return;
    }

    let parsedScheduledDate: Date | undefined = undefined;
    let actualStatus: "draft" | "pending_review" | "approved" | "published" =
      status === "scheduled" ? "approved" : (status as any);

    if (status === "scheduled") {
      if (!scheduledAt) {
        setError(isEn ? "Please pick schedule date & time" : "শিডিউল প্রকাশের জন্য তারিখ ও সময় নির্বাচন করুন");
        return;
      }
      parsedScheduledDate = new Date(scheduledAt);
      if (isNaN(parsedScheduledDate.getTime())) {
        setError(isEn ? "Invalid schedule date & time" : "সঠিক শিডিউল তারিখ ও সময় দিন");
        return;
      }
      if (parsedScheduledDate.getTime() <= Date.now()) {
        setError(isEn ? "Schedule time must be in the future" : "শিডিউল প্রকাশের সময় বর্তমান সময়ের পরবর্তী হতে হবে");
        return;
      }
    }

    setLoading(true);
    try {
      const finalSlug = slug.trim() || `barta-${Date.now()}`;
      const res = await createArticle({
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        slug: finalSlug,
        excerpt: excerpt.trim() || undefined,
        content,
        categoryId: categoryId || undefined,
        status: actualStatus,
        scheduledAt: parsedScheduledDate,
        featuredImageUrl: featuredImageUrl.trim() || undefined,
        featuredImageAlt: featuredImageAlt.trim() || undefined,
        newsLocation: newsLocation.trim() || undefined,
        divisionId: selectedDivisionId || undefined,
        districtId: selectedDistrictId || undefined,
        isBreaking,
        isFeatured,
        seoTitle: seoTitle.trim() || title.trim(),
        seoDescription: seoDescription.trim() || excerpt.trim(),
        language: "bn",
        focusKeyword: focusKeyword.trim() || undefined,
        headlineB: isAbTestingEnabled && headlineB.trim() ? headlineB.trim() : undefined,
        abTestStatus: isAbTestingEnabled && headlineB.trim() ? "active" : "none",
        abTestDurationMinutes,
      });

      if (!res.success) {
        setError(res.error || (isEn ? "Failed to save article" : "সংবাদ সংরক্ষণ ব্যর্থ হয়েছে"));
      } else {
        try {
          localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
        } catch {}

        if (res.isScheduled) {
          setSuccess(
            isEn
              ? `Story successfully scheduled for publication at ${parsedScheduledDate?.toLocaleString("en-US")}!`
              : `সংবাদটি সফলভাবে শিডিউল করা হয়েছে! এটি নির্ধারিত সময়ে (${parsedScheduledDate?.toLocaleString("bn-BD")}) স্বয়ংক্রিয়ভাবে লাইভ হবে।`
          );
        } else if (actualStatus === "draft") {
          setSuccess(isEn ? "Draft saved successfully!" : "খসড়া সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!");
        } else {
          setSuccess(isEn ? "Story published successfully! Redirecting..." : "সংবাদ সফলভাবে প্রকাশিত হয়েছে! সংবাদ তালিকায় রিডাইরেক্ট করা হচ্ছে...");
        }

        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
              {isEn ? "Create New Story" : "নতুন সংবাদ তৈরি করুন"}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
              <span>{isEn ? "Draft and publish national & global news reporting" : "জাতীয় ও আন্তর্জাতিক প্রতিবেদন রচনা ও প্রকাশনা"}</span>
              {lastSavedTime && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isEn ? `Autosaved: ${lastSavedTime}` : `অটোসেভ: ${lastSavedTime}`}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
            title={isEn ? "Open AI Editorial Assistant" : "এআই বাংলা সম্পাদকীয় সহকারী খুলুন"}
          >
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>{isEn ? "AI Assistant" : "এআই সহকারী"}</span>
          </button>

          <button
            type="button"
            onClick={saveDraftLocally}
            className="px-3 py-2 border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] flex items-center gap-1.5 cursor-pointer"
            title={isEn ? "Save draft to browser" : "ব্রাউজারে খসড়া সংরক্ষণ করুন"}
          >
            <Save size={13} />
            <span>{isEn ? "Save Draft" : "খসড়া সেভ"}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer ${
              status === "scheduled"
                ? "bg-blue-600 hover:bg-blue-700"
                : status === "draft"
                ? "bg-zinc-700 hover:bg-zinc-800"
                : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
            }`}
          >
            {status === "scheduled" ? (
              <>
                <Clock size={14} />
                {loading ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Schedule Publish" : "শিডিউল প্রকাশ করুন")}
              </>
            ) : status === "draft" ? (
              <>
                <Save size={14} />
                {loading ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Save Draft" : "খসড়া সংরক্ষণ")}
              </>
            ) : (
              <>
                <Send size={14} />
                {loading ? (isEn ? "Publishing..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Publish Now" : "সরাসরি প্রকাশ করুন")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recover Draft Banner if previous draft was found */}
      {savedDraftFound && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-amber-600 flex-shrink-0" />
            <span>
              {isEn
                ? `Previous autosaved draft found (Saved: ${savedDraftFound.savedAt})`
                : `পূর্বের অসম্পূর্ণ খসড়া পাওয়া গেছে (সংরক্ষণ: ${savedDraftFound.savedAt})`}
              {savedDraftFound.title ? ` — "${savedDraftFound.title.slice(0, 40)}..."` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition-colors cursor-pointer"
            >
              {isEn ? "Restore Draft" : "খসড়া রিস্টোর করুন"}
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors cursor-pointer"
            >
              {isEn ? "Discard" : "মুছে ফেলুন"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor: 8 Columns */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                {isEn ? "Article Headline *" : "সংবাদের মূল শিরোনাম (বাংলা) *"}
              </label>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-[11px] font-bold transition-all cursor-pointer"
                title={isEn ? "Generate smart headline with AI" : "এআই দিয়ে স্মার্ট শিরোনাম তৈরি করুন"}
              >
                <Sparkles size={12} className="text-purple-600 dark:text-purple-400" />
                <span>{isEn ? "AI Headline Ideas" : "এআই দিয়ে শিরোনাম তৈরি"}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isEn ? "Enter compelling and objective headline..." : "আকর্ষণীয় ও বস্তুনিষ্ঠ শিরোনাম লিখুন..."}
              className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] text-base font-bold focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Headline A/B Testing Engine */}
          {features.admin_ab_testing_panel !== false && (
            <HeadlineAbTestingPanel
              headlineA={title}
              headlineB={headlineB}
              onHeadlineBChange={(val) => {
                setHeadlineB(val);
                setHasUnsavedChanges(true);
              }}
              isEnabled={isAbTestingEnabled}
              onToggleEnabled={(enabled) => {
                setIsAbTestingEnabled(enabled);
                setHasUnsavedChanges(true);
              }}
              durationMinutes={abTestDurationMinutes}
              onDurationChange={(mins) => {
                setAbTestDurationMinutes(mins);
                setHasUnsavedChanges(true);
              }}
              status="none"
            />
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              {isEn ? "English Title (for URL Slug)" : "ইংরেজি শিরোনাম (English Title / Slug Generator)"}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              placeholder={isEn ? "e.g. Bangladesh wins series opener at Mirpur..." : "e.g. Bangladesh wins series opener at Mirpur..."}
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                {isEn ? "Short Summary (Excerpt)" : "সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)"}
              </label>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                <Sparkles size={11} />
                <span>{isEn ? "Generate with AI" : "এআই দিয়ে সারাংশ তৈরি"}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder={isEn ? "Core takeaway in 2-3 concise sentences..." : "সংবাদের মূল প্রতিপাদ্য ২/৩ লাইনে লিখুন..."}
              className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              {isEn ? "Article Body Content *" : "বিস্তারিত সংবাদ বিষয়বস্তু (Rich Article Body) *"}
            </label>
            <TiptapEditor
              content={content}
              onChange={(html) => {
                setContent(html);
                setHasUnsavedChanges(true);
              }}
              placeholder={isEn ? "Write your full news story here..." : "এখানে বিস্তারিত সংবাদ লিখুন..."}
            />
          </div>

          {/* Real-Time SEO & Headline SERP Preview Scorecard */}
          {features.admin_seo_scorecard !== false && (
            <SeoQualityScorecard
              title={title}
              seoTitle={seoTitle}
              slug={slug}
              excerpt={excerpt}
              seoDescription={seoDescription}
              content={content}
              featuredImageUrl={featuredImageUrl}
              featuredImageAlt={featuredImageAlt}
              categoryName={categoriesList.find((c) => c.id === categoryId)?.name || "জাতীয়"}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={(val) => {
                setFocusKeyword(val);
                setHasUnsavedChanges(true);
              }}
              onJumpToImageAlt={() => {
                imageAltInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                imageAltInputRef.current?.focus();
              }}
            />
          )}
        </div>

        {/* Sidebar Settings: 4 Columns */}
        <div className="lg:col-span-4 space-y-4">
          {/* Publishing Controls */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center justify-between">
              <span>{isEn ? "Publishing Settings" : "প্রকাশনা সেটিংস"}</span>
              {status === "scheduled" && (
                <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded font-bold">
                  {isEn ? "Schedule Mode" : "শিডিউল মোড"}
                </span>
              )}
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Publication Status" : "প্রকাশের ধরন (Publication Type)"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
              >
                <option value="published">{isEn ? "🚀 Publish Now" : "🚀 সরাসরি প্রকাশ (Publish Now)"}</option>
                <option value="scheduled">{isEn ? "⏱️ Schedule for Later" : "⏱️ শিডিউল প্রকাশ (Schedule for Later)"}</option>
                <option value="draft">{isEn ? "📝 Save as Draft" : "📝 খসড়া হিসেবে রাখুন (Save Draft)"}</option>
                <option value="pending_review">{isEn ? "🔍 Submit for Review" : "🔍 অনুমোদনের জন্য জমা (Submit for Review)"}</option>
              </select>
            </div>

            {/* Scheduled Date Time Picker */}
            {status === "scheduled" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded space-y-2">
                <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{isEn ? "Scheduled Date & Time (Dhaka Time) *" : "প্রকাশের তারিখ ও সময় (ঢাকা সময়) *"}</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 bg-[var(--color-bg)] border border-blue-300 dark:border-blue-700 text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                  {isEn
                    ? "💡 Once this scheduled time arrives, the article will automatically go live on the public website."
                    : "💡 নির্ধারিত সময় পার হওয়া মাত্র সংবাদটি স্বয়ংক্রিয়ভাবে মূল পোর্টালে লাইভ হয়ে যাবে।"}
                </p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Category *" : "সংবাদ বিভাগ (Category) *"}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] font-medium"
              >
                {categoriesList.length === 0 ? (
                  <option value="">{isEn ? "Loading..." : "লোড হচ্ছে..."}</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Location / Byline" : "সংবাদের অবস্থান (টেক্সট)"}
              </label>
              <input
                type="text"
                value={newsLocation}
                onChange={(e) => setNewsLocation(e.target.value)}
                placeholder={isEn ? "Dhaka / Chattogram / Sylhet / Rajshahi..." : "ঢাকা / চট্টগ্রাম / সিলেট / রাজশাহী..."}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Division" : "বিভাগ (Division)"}
                </label>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => {
                    setSelectedDivisionId(e.target.value);
                    setSelectedDistrictId("");
                  }}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">{isEn ? "-- None --" : "-- বিভাগ নেই --"}</option>
                  {divisionsList.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "District" : "জেলা (District)"}
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  disabled={!selectedDivisionId}
                  className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                >
                  <option value="">{isEn ? "-- None --" : "-- জেলা নেই --"}</option>
                  {divisionsList
                    .find((d) => d.id === selectedDivisionId)
                    ?.districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-[var(--color-border)]">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>{isEn ? "Show in Breaking News Ticker" : "ব্রেকিং নিউজ টিকার-এ দেখান"}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[var(--color-primary)]"
                />
                <span>{isEn ? "Homepage Lead Story (Featured)" : "হোমপেজের শীর্ষ খবর (Lead Story)"}</span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[var(--color-primary)]" />
              <span>{isEn ? "Featured Image" : "মূল ছবি (Featured Image)"}</span>
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Image URL (Unsplash / CDN link)" : "ছবির URL (Unsplash / CDN / R2 লিংক)"}
              </label>
              <input
                type="url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            {featuredImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-secondary)]">
                <img
                  src={featuredImageUrl}
                  alt={featuredImageAlt || (isEn ? "News image preview" : "সংবাদ ছবি প্রিভিউ")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "Caption & Image Credit" : "ছবির ক্যাপশন ও ক্রেডিট"}
              </label>
              <input
                ref={imageAltInputRef}
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder={isEn ? "Photo: Staff Photographer / File" : "ছবি: নিজস্ব আলোকচিত্রী / সংগৃহীত"}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* URL Slug & SEO */}
          <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
              {isEn ? "SEO & URL Slug" : "এসইও ও ইউআরএল (SEO)"}
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "URL Slug *" : "ইউআরএল স্লাগ (URL Slug) *"}
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. bd-economic-stability-roadmap"
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary)]"
              />
              <p className="text-[10px] text-[var(--color-text-faint)] mt-1">
                {isEn ? "Public URL: " : "লিংক হবে: "}/news/{slug || "slug"}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                {isEn ? "SEO Meta Title" : "এসইও শিরোনাম (SEO Title)"}
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={isEn ? "Headline shown in Google search" : "গুগল সার্চে প্রদর্শিত শিরোনাম"}
                className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Bengali Editorial Assistant Copilot Modal */}
      <AiEditorAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        currentTitle={title}
        currentContent={content}
        onApplyTitle={(newTitle, newTitleEn, newSlug) => {
          setTitle(newTitle);
          if (newTitleEn) setTitleEn(newTitleEn);
          if (newSlug) setSlug(newSlug);
          setHasUnsavedChanges(true);
        }}
        onApplyExcerpt={(newExcerpt) => {
          setExcerpt(newExcerpt);
          setHasUnsavedChanges(true);
        }}
        onApplyLocation={(districtName) => {
          setNewsLocation(districtName);
          for (const div of divisionsList) {
            const dist = div.districts.find((d) => d.name === districtName);
            if (dist) {
              setSelectedDivisionId(div.id);
              setSelectedDistrictId(dist.id);
              break;
            }
          }
          setHasUnsavedChanges(true);
        }}
        onApplyCleanedContent={(cleaned) => {
          setContent(cleaned);
          setHasUnsavedChanges(true);
        }}
      />
    </form>
  );
}
