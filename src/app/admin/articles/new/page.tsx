"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Sparkles,
  Zap,
  Pin,
  MapPin,
  Globe,
  Tag,
  Search,
  ExternalLink,
  SlidersHorizontal,
  X,
  FileText,
} from "lucide-react";
import { AiEditorAssistantModal } from "@/components/admin/editor/AiEditorAssistantModal";
import { SeoQualityScorecard } from "@/components/admin/editor/SeoQualityScorecard";
import { HeadlineAbTestingPanel } from "@/components/admin/editor/HeadlineAbTestingPanel";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { authClient } from "@/lib/auth-client";
import { hasPermission } from "@/lib/permissions";

const AUTOSAVE_STORAGE_KEY = "barta_draft_article_new";

export default function NewArticlePage() {
  const router = useRouter();
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const { data: session } = authClient.useSession();
  const userRole = ((session?.user as any)?.role as string) || "admin";
  const canPublishDirectly = hasPermission(userRole as any, "article:publish");

  // Editorial content states
  const [kicker, setKicker] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  // Settings & metadata
  const [categoryId, setCategoryId] = useState("");
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [status, setStatus] = useState<"draft" | "pending_review" | "approved" | "published" | "scheduled">("published");
  const [scheduledAt, setScheduledAt] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [newsLocation, setNewsLocation] = useState("ঢাকা");
  const [divisionsList, setDivisionsList] = useState<DivisionWithDistricts[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO & A/B testing
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [headlineB, setHeadlineB] = useState("");
  const [isAbTestingEnabled, setIsAbTestingEnabled] = useState(false);
  const [abTestDurationMinutes, setAbTestDurationMinutes] = useState(30);

  const imageAltInputRef = useRef<HTMLInputElement>(null);

  // Status & modal states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  // Autosave states
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedDraftFound, setSavedDraftFound] = useState<{
    title: string;
    savedAt: string;
    data: any;
  } | null>(null);

  // Live word count & reading time calculation
  const wordCount = useMemo(() => {
    const plainText = content.replace(/<[^>]+>/g, " ").trim();
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, [content]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  useEffect(() => {
    fetch("/api/features")
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch(() => {});
  }, []);

  // Load categories and regional divisions
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

  // Autosave timer: every 20 seconds if changes exist
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
        kicker,
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
    if (d.kicker) setKicker(d.kicker);
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
    setLastSavedTime(isEn ? "Restored" : "রিস্টোর করা হয়েছে");
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
      setError(isEn ? "Article headline is required" : "সংবাদের মূল শিরোনাম দেওয়া আবশ্যক");
      return;
    }
    if (!content.trim()) {
      setError(isEn ? "Article body content is required" : "সংবাদের বিস্তারিত বিষয়বস্তু লিখুন");
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
              : `সংবাদটি সফলভাবে শিডিউল করা হয়েছে! নির্ধারিত সময়ে (${parsedScheduledDate?.toLocaleString("bn-BD")}) এটি স্বয়ংক্রিয়ভাবে লাইভ হবে।`
          );
        } else if (actualStatus === "draft") {
          setSuccess(isEn ? "Draft saved successfully!" : "খসড়া সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!");
        } else {
          setSuccess(isEn ? "Story published successfully! Redirecting..." : "সংবাদ সফলভাবে প্রকাশিত হয়েছে! রিডাইরেক্ট করা হচ্ছে...");
        }

        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1400);
      }
    } catch (err: any) {
      setError(err?.message || (isEn ? "Server error occurred" : "সার্ভার এরর ঘটেছে"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen pb-20 font-sans">
      {/* Sticky Editorial Command Bar */}
      <div className="sticky top-0 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-2.5 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] mb-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Navigation, Breadcrumb & Live Writing Telemetry */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/articles"
              className="p-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
              title={isEn ? "Back to Articles" : "সংবাদ তালিকায় ফিরুন"}
            >
              <ArrowLeft size={15} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  {isEn ? "Newsroom Composer" : "নিউজরুম এডিটর"}
                </span>
                <span className="text-[var(--color-border)]">•</span>
                {/* Live Publishing Mode Badge */}
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                    status === "published"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : status === "scheduled"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                      : status === "draft"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {status === "published"
                    ? isEn ? "Live Publish" : "সরাসরি প্রকাশ"
                    : status === "scheduled"
                    ? isEn ? "Scheduled" : "শিডিউলড"
                    : status === "draft"
                    ? isEn ? "Draft Mode" : "খসড়া মোড"
                    : isEn ? "Pending Review" : "পর্যালোচনাধীন"}
                </span>
              </div>

              {/* Live Editorial Metrics Ribbon */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--color-text-muted)] mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-[var(--color-text)]">
                  <FileText size={11} className="text-zinc-400" />
                  <span>{formatNumber(wordCount)} {isEn ? "words" : "শব্দ"}</span>
                </span>
                <span>•</span>
                <span>~{formatNumber(readingTimeMinutes)} {isEn ? "min read" : "মিনিট পড়ার সময়"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
                  <span>
                    {hasUnsavedChanges
                      ? isEn ? "Unsaved changes" : "অসংরক্ষিত পরিবর্তন"
                      : lastSavedTime
                      ? isEn ? `Autosaved: ${lastSavedTime}` : `অটোসেভ: ${lastSavedTime}`
                      : isEn ? "Autosave ready" : "অটোসেভ সক্রিয়"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Clean Editorial Actions Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* AI Assistant Button (Clean Newsroom Tool, No Rainbow Slop) */}
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-purple-200 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isEn ? "Open AI Editorial Assistant" : "এআই সম্পাদকীয় সহকারী খুলুন"}
            >
              <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
              <span>{isEn ? "AI Copilot" : "সম্পাদকীয় এআই"}</span>
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              onClick={saveDraftLocally}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isEn ? "Save draft locally" : "ব্রাউজারে খসড়া সংরক্ষণ করুন"}
            >
              <Save size={13} className="text-zinc-400" />
              <span>{isEn ? "Save Draft" : "খসড়া সেভ"}</span>
            </button>

            {/* Primary Action Button (Publish / Schedule / Submit) */}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-1.5 text-white text-xs font-bold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${
                status === "scheduled"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : status === "draft"
                  ? "bg-zinc-700 hover:bg-zinc-800"
                  : status === "pending_review"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              }`}
            >
              {loading ? (
                <>
                  <Clock size={13} className="animate-spin" />
                  <span>{isEn ? "Processing..." : "সংরক্ষণ হচ্ছে..."}</span>
                </>
              ) : status === "scheduled" ? (
                <>
                  <Calendar size={13} />
                  <span>{isEn ? "Schedule Story" : "শিডিউল প্রকাশ"}</span>
                </>
              ) : status === "draft" ? (
                <>
                  <Save size={13} />
                  <span>{isEn ? "Save to Database" : "খসড়া ডাটাবেসে সেভ"}</span>
                </>
              ) : status === "pending_review" ? (
                <>
                  <Send size={13} />
                  <span>{isEn ? "Submit for Review" : "অনুমোদনে পাঠান"}</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>{isEn ? "Publish Now" : "সরাসরি প্রকাশ করুন"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Autosave Recovery Banner */}
        {savedDraftFound && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <RotateCcw size={15} className="text-amber-600 flex-shrink-0" />
              <span>
                {isEn
                  ? `Previous autosaved draft found (${savedDraftFound.savedAt})`
                  : `পূর্বের অসম্পূর্ণ খসড়া পাওয়া গেছে (${savedDraftFound.savedAt})`}
                {savedDraftFound.title ? ` — "${savedDraftFound.title.slice(0, 45)}..."` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Restore Draft" : "খসড়া রিস্টোর"}
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded font-semibold text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Discard" : "মুছে ফেলুন"}
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 rounded-r">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 rounded-r">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Main Grid: Left 8 Cols (Writing Canvas) + Right 4 Cols (Newsroom Settings) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Writing Canvas (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Headline & Kicker Block */}
            <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              {/* Optional Editorial Kicker / Shoulder */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {isEn ? "Shoulder / Kicker (Optional)" : "শোল্ডার / কিকার (ঐচ্ছিক বিষয় বা সাব-হেড)"}
                  </label>
                  <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
                    যেমন: বিশেষ প্রতিবেদন • জাতীয় নির্বাচন • বাণিজ্য বার্তা
                  </span>
                </div>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => {
                    setKicker(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder={isEn ? "e.g. Special Report, Election 2026, Economy & Finance..." : "যেমন: বিশেষ প্রতিবেদন, জাতীয় নির্বাচন, অর্থনীতি ও বাজেট..."}
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs font-semibold text-[var(--color-primary)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              {/* Main Bangla Headline */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                    {isEn ? "Main Headline (Bangla) *" : "সংবাদের মূল শিরোনাম (বাংলা) *"}
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Character length guide */}
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        title.length >= 40 && title.length <= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : title.length > 90
                          ? "text-amber-600"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {formatNumber(title.length)}/১০০ {isEn ? "chars" : "অক্ষর"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>{isEn ? "AI Suggestions" : "এআই প্রস্তাবনা"}</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={isEn ? "Enter authoritative and objective headline..." : "আকর্ষণীয় ও বস্তুনিষ্ঠ প্রধান শিরোনাম লিখুন..."}
                  className="w-full p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xl sm:text-2xl font-black text-[var(--color-text)] placeholder-[var(--color-text-faint)] leading-snug tracking-tight focus:outline-hidden focus:border-[var(--color-primary)] transition-colors"
                  style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
                />
              </div>

              {/* English Headline & Slug Generator */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {isEn ? "English Title (Generates SEO Slug)" : "ইংরেজি শিরোনাম (URL স্লাগ তৈরির জন্য)"}
                  </label>
                  <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
                    /news/{slug || "slug"}
                  </span>
                </div>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => handleTitleEnChange(e.target.value)}
                  placeholder={isEn ? "e.g. Bangladesh foreign exchange reserves rise to new peak..." : "e.g. Bangladesh foreign exchange reserves rise to new peak..."}
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] font-mono placeholder-[var(--color-text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Standfirst / Summary Block */}
            <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                  {isEn ? "Standfirst / Core Summary (Excerpt)" : "সংক্ষিপ্ত সারসংক্ষেপ ও ভূমিকা (Standfirst / Excerpt)"}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {formatNumber(excerpt.length)}/২০০ {isEn ? "chars" : "অক্ষর"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>{isEn ? "AI Summary" : "এআই সারাংশ"}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder={isEn ? "Core takeaway in 2-3 concise sentences for homepage cards and social shares..." : "সংবাদের মূল প্রতিপাদ্য ও গুরুত্বপূর্ণ তথ্য ২-৩ বাক্যে লিখুন (যা হোমপেজ ও সোশ্যাল মিডিয়ায় প্রদর্শিত হবে)..."}
                className="w-full p-3 bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] rounded text-xs leading-relaxed text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {/* Rich Article Body Content */}
            <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[var(--color-primary)]" />
                  <label className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                    {isEn ? "Full Article Body *" : "বিস্তারিত সংবাদ প্রতিবেদন (Rich Body) *"}
                  </label>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--color-text-muted)]">
                  <span>{formatNumber(wordCount)} {isEn ? "words" : "শব্দ"}</span>
                  <span>•</span>
                  <span>~{formatNumber(readingTimeMinutes)} {isEn ? "mins" : "মিনিট"}</span>
                </div>
              </div>

              <TiptapEditor
                content={content}
                onChange={(html) => {
                  setContent(html);
                  setHasUnsavedChanges(true);
                }}
                placeholder={isEn ? "Compose the full news story with paragraphs, quotes, and embeds..." : "এখানে সংবাদের বিস্তারিত প্রতিবেদন লিখুন (প্যারাগ্রাফ, উক্তি, হেডিং ও ছবি সংযুক্ত করতে পারেন)..."}
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
                onApplySeoTitle={(val) => {
                  setSeoTitle(val);
                  setHasUnsavedChanges(true);
                }}
                onApplySeoDescription={(val) => {
                  setSeoDescription(val);
                  setHasUnsavedChanges(true);
                }}
                onJumpToImageAlt={() => {
                  imageAltInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  imageAltInputRef.current?.focus();
                }}
              />
            )}
          </div>

          {/* Right Column: Newsroom Settings Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Publication Workflow Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <Send size={13} className="text-[var(--color-primary)]" />
                  <span>{isEn ? "Publication Workflow" : "প্রকাশনা ও সময়সূচি"}</span>
                </h3>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  {canPublishDirectly ? (isEn ? "Authorized" : "অনুমোদিত") : (isEn ? "Review Required" : "অনুমোদন আবশ্যক")}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Publication Status" : "প্রকাশনার ধরন (Publishing Action)"}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] font-semibold focus:outline-hidden focus:border-[var(--color-primary)] cursor-pointer"
                >
                  {canPublishDirectly && (
                    <>
                      <option value="published">🚀 {isEn ? "Publish Immediately" : "সরাসরি প্রকাশ (Publish Now)"}</option>
                      <option value="scheduled">⏱️ {isEn ? "Schedule for Later" : "শিডিউল প্রকাশ (Schedule for Later)"}</option>
                    </>
                  )}
                  <option value="pending_review">🔍 {isEn ? "Submit for Editorial Review" : "অনুমোদনের জন্য জমা (Submit for Review)"}</option>
                  <option value="draft">📝 {isEn ? "Save as Internal Draft" : "খসড়া হিসেবে সংরক্ষণ (Save Draft)"}</option>
                </select>
              </div>

              {/* Scheduled Date Time Picker */}
              {status === "scheduled" && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded space-y-2">
                  <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{isEn ? "Scheduled Time (Dhaka Time) *" : "প্রকাশের তারিখ ও সময় (ঢাকা সময়) *"}</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => {
                      setScheduledAt(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2 bg-[var(--color-bg)] border border-blue-300 dark:border-blue-700 rounded text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                    {isEn
                      ? "💡 System cron will automatically publish this story at the designated time."
                      : "💡 নির্ধারিত সময় পার হওয়া মাত্র সংবাদটি স্বয়ংক্রিয়ভাবে মূল পোর্টালে লাইভ হয়ে যাবে।"}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Desk & Geographic Coverage Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <Tag size={13} className="text-[var(--color-primary)]" />
                  <span>{isEn ? "Desk & Geography" : "ডেস্ক ও ভৌগোলিক অবস্থান"}</span>
                </h3>
              </div>

              {/* Primary News Desk / Category */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Primary News Desk (Category) *" : "মূল সংবাদ বিভাগ (Category) *"}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] font-semibold focus:outline-hidden focus:border-[var(--color-primary)] cursor-pointer"
                >
                  {categoriesList.length === 0 ? (
                    <option value="">{isEn ? "Loading desks..." : "বিভাগ লোড হচ্ছে..."}</option>
                  ) : (
                    categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Byline Location String */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                  <MapPin size={11} className="text-red-500" />
                  <span>{isEn ? "Byline Location" : "সংবাদ প্রকাশের স্থান (Byline City)"}</span>
                </label>
                <input
                  type="text"
                  value={newsLocation}
                  onChange={(e) => setNewsLocation(e.target.value)}
                  placeholder={isEn ? "Dhaka / Chattogram / Sylhet / London..." : "ঢাকা / চট্টগ্রাম / সিলেট / রাজশাহী..."}
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] focus:outline-hidden focus:border-[var(--color-primary)]"
                />
              </div>

              {/* Regional Division & District (Saradesh) */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "Division" : "প্রশাসনিক বিভাগ"}
                  </label>
                  <select
                    value={selectedDivisionId}
                    onChange={(e) => {
                      setSelectedDivisionId(e.target.value);
                      setSelectedDistrictId("");
                    }}
                    className="w-full px-2 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] focus:outline-hidden cursor-pointer"
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
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[var(--color-text-muted)] mb-1">
                    {isEn ? "District" : "জেলা"}
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    disabled={!selectedDivisionId}
                    className="w-full px-2 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] focus:outline-hidden cursor-pointer disabled:opacity-50"
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
            </div>

            {/* 3. Featured Image & Visual Asset Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-[var(--color-primary)]" />
                  <span>{isEn ? "Lead Visual Asset" : "প্রধান সংবাদ ছবি (Lead Visual)"}</span>
                </h3>
                <Link
                  href="/admin/media"
                  target="_blank"
                  className="text-[10px] text-[var(--color-primary)] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{isEn ? "Media Library" : "মিডিয়া লাইব্রেরি"}</span>
                  <ExternalLink size={10} />
                </Link>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Image URL (CDN / Upload Link)" : "ছবির URL (CDN / R2 / আনস্প্ল্যাশ লিঙ্ক)"}
                </label>
                <input
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs font-mono text-[var(--color-text)] focus:outline-hidden focus:border-[var(--color-primary)]"
                />
              </div>

              {/* 16:9 Live Visual Preview */}
              {featuredImageUrl && (
                <div className="relative aspect-16/9 w-full rounded border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-secondary)] group">
                  <img
                    src={featuredImageUrl}
                    alt={featuredImageAlt || (isEn ? "News preview" : "সংবাদ ছবি")}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImageUrl("")}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded text-xs transition-colors cursor-pointer"
                    title={isEn ? "Remove Image" : "ছবিটি মুছুন"}
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1.5 left-2 text-[9px] font-mono bg-black/70 text-white px-1.5 py-0.2 rounded">
                    16:9 Ratio
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Caption & Photo Credit" : "ছবির ক্যাপশন ও আলোকচিত্রী ক্রেডিট"}
                </label>
                <input
                  ref={imageAltInputRef}
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder={isEn ? "Photo: Staff Photographer / File" : "ছবি: নিজস্ব আলোকচিত্রী / ফাইল ছবি"}
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] focus:outline-hidden focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* 4. Editorial Highlights & Distribution Flags */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[var(--color-primary)]" />
                  <span>{isEn ? "Editorial Flags" : "সম্পাদকীয় প্রাধান্য ও ফ্ল্যাগস"}</span>
                </h3>
              </div>

              {/* Breaking News Ticker Toggle */}
              <label className="flex items-start gap-2.5 p-2 rounded bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                    <Zap size={13} className="text-red-600 fill-red-600" />
                    <span>{isEn ? "Breaking News Ticker" : "ব্রেকিং নিউজ টিকার"}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-tight">
                    {isEn ? "Pushes headline immediately to live header ticker" : "হেডার টিকারে তাৎক্ষণিক জরুরি ব্রেকিং হিসেবে ঘুরবে"}
                  </p>
                </div>
              </label>

              {/* Lead Story Toggle */}
              <label className="flex items-start gap-2.5 p-2 rounded bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
                    <Pin size={13} className="text-amber-600 fill-amber-600" />
                    <span>{isEn ? "Homepage Lead Story" : "হোমপেজ প্রধান লিড সংবাদ"}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-tight">
                    {isEn ? "Pins as the primary hero story on homepage" : "হোমপেজের এক নম্বর মূল লিড কার্ড হিসেবে প্রদর্শিত হবে"}
                  </p>
                </div>
              </label>
            </div>

            {/* 5. URL Slug & Canonical SEO Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <Globe size={13} className="text-[var(--color-primary)]" />
                  <span>{isEn ? "Slug & Search Engine Meta" : "স্লাগ ও সার্চ ইঞ্জিন মেটা"}</span>
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "URL Slug *" : "ইউআরএল স্লাগ (Canonical Slug) *"}
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. bangladesh-economy-export-growth"
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs font-mono text-[var(--color-text)] focus:outline-hidden focus:border-[var(--color-primary)]"
                />
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-1 break-all">
                  /news/{slug || "slug"}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
                  {isEn ? "Custom SEO Meta Title" : "গুগল সার্চ মেটা শিরোনাম (SEO Title)"}
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={isEn ? "Headline displayed in Google search" : "গুগলে প্রদর্শিত কাস্টম শিরোনাম (ঐচ্ছিক)"}
                  className="w-full px-3 py-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] focus:outline-hidden focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Newsroom Assistant Copilot Modal */}
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
