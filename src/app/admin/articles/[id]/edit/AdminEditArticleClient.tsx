"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/editor/TiptapEditor";
import { AiEditorAssistantModal } from "@/components/admin/editor/AiEditorAssistantModal";
import { SeoQualityScorecard } from "@/components/admin/editor/SeoQualityScorecard";
import { HeadlineAbTestingPanel } from "@/components/admin/editor/HeadlineAbTestingPanel";
import { updateArticle, finalizeAbTest, resetAbTest } from "@/actions/articles";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminEditArticleClientProps {
  article: {
    id: string;
    title: string;
    titleEn?: string | null;
    slug: string;
    excerpt?: string | null;
    content: string;
    correctionNote?: string | null;
    status: string;
    publishedAt?: Date | null;
    focusKeyword?: string | null;
    headlineB?: string | null;
    abTestStatus?: string | null;
    abTestStartedAt?: Date | string | null;
    abTestDurationMinutes?: number | null;
    abTestImpressionsA?: number;
    abTestImpressionsB?: number;
    abTestClicksA?: number;
    abTestClicksB?: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    featuredImageUrl?: string | null;
    featuredImageAlt?: string | null;
    categoryName?: string | null;
  };
}

export function AdminEditArticleClient({ article }: AdminEditArticleClientProps) {
  const router = useRouter();
  const { language } = useAdminLanguage();
  const isEn = language === "en";

  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [content, setContent] = useState(article.content || "");
  const [correctionNote, setCorrectionNote] = useState(article.correctionNote || "");
  const [focusKeyword, setFocusKeyword] = useState(article.focusKeyword || "");
  const [headlineB, setHeadlineB] = useState(article.headlineB || "");
  const [abTestStatus, setAbTestStatus] = useState<any>(article.abTestStatus || "none");
  const [abTestDurationMinutes, setAbTestDurationMinutes] = useState(article.abTestDurationMinutes || 30);
  const [seoTitle, setSeoTitle] = useState(article.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(article.seoDescription || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(article.featuredImageAlt || "");
  const [isAbTestingEnabled, setIsAbTestingEnabled] = useState(
    !!article.headlineB || article.abTestStatus === "active"
  );

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDeclareWinner(winner: "a" | "b") {
    try {
      const res = await finalizeAbTest(article.id, winner);
      if (res.success) {
        if (winner === "b" && headlineB) {
          setTitle(headlineB);
        }
        setAbTestStatus(winner === "b" ? "completed_b" : "completed_a");
        setSuccess(
          isEn
            ? `Variant ${winner.toUpperCase()} declared as the permanent winner!`
            : `ভ্যারিয়েন্ট ${winner.toUpperCase()} সফলভাবে বিজয়ী ঘোষিত হয়েছে!`
        );
        router.refresh();
      } else {
        setError(res.error || "Failed to declare winner");
      }
    } catch (e: any) {
      setError(e?.message);
    }
  }

  async function handleResetTest() {
    try {
      const res = await resetAbTest(article.id);
      if (res.success) {
        setAbTestStatus("none");
        setIsAbTestingEnabled(false);
        setHeadlineB("");
        setSuccess(isEn ? "A/B test has been reset." : "এ/বি টেস্ট রিসেট করা হয়েছে।");
        router.refresh();
      } else {
        setError(res.error || "Failed to reset test");
      }
    } catch (e: any) {
      setError(e?.message);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isNowActive = isAbTestingEnabled && !!headlineB.trim();
      const statusToSave = isNowActive && abTestStatus === "none" ? "active" : abTestStatus;

      const res = await updateArticle({
        id: article.id,
        title,
        excerpt,
        content,
        correctionNote: correctionNote || undefined,
        focusKeyword: focusKeyword.trim() || undefined,
        headlineB: headlineB.trim() || undefined,
        abTestStatus: statusToSave,
        abTestDurationMinutes,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        featuredImageAlt: featuredImageAlt.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || (isEn ? "Failed to update article." : "সংবাদ হালনাগাদ করা সম্ভব হয়নি।"));
      }

      setSuccess(isEn ? "Story updated successfully!" : "সংবাদটি সফলভাবে হালনাগাদ করা হয়েছে!");
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || (isEn ? "An error occurred while updating" : "হালনাগাদে ত্রুটি দেখা দিয়েছে"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
              {isEn ? "Edit Story & AI Refinement" : "সংবাদ সম্পাদনা ও এআই পরিমার্জন"}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
              <span>{isEn ? "Slug:" : "স্লাগ:"}</span>
              <code className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                {article.slug}
              </code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
            title={isEn ? "Open AI Editorial Assistant" : "এআই সম্পাদকীয় সহকারী"}
          >
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>{isEn ? "AI Assistant" : "এআই সহকারী"}</span>
          </button>

          <Link
            href={`/news/${article.slug}`}
            target="_blank"
            className="px-3 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text-muted)] rounded flex items-center gap-1.5"
            title={isEn ? "View live article" : "লাইভ সংবাদ দেখুন"}
          >
            <Eye size={13} />
            <span>{isEn ? "View Live" : "লাইভ দেখুন"}</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] space-y-5 rounded-xl shadow-xs">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isEn ? "Story Headline *" : "শিরোনাম (বাংলা) *"}
            </label>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
            >
              <Sparkles size={12} className="text-purple-600 dark:text-purple-400" />
              <span>{isEn ? "Refine with AI" : "এআই দিয়ে শিরোনাম পরিবর্তন"}</span>
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-base font-bold focus:outline-none focus:border-[var(--color-primary)] rounded"
          />
        </div>

        {/* Headline A/B Testing Engine */}
        <HeadlineAbTestingPanel
          headlineA={title}
          headlineB={headlineB}
          onHeadlineBChange={(val) => setHeadlineB(val)}
          isEnabled={isAbTestingEnabled}
          onToggleEnabled={(enabled) => setIsAbTestingEnabled(enabled)}
          durationMinutes={abTestDurationMinutes}
          onDurationChange={(mins) => setAbTestDurationMinutes(mins)}
          status={abTestStatus}
          startedAt={article.abTestStartedAt}
          impressionsA={article.abTestImpressionsA || 0}
          impressionsB={article.abTestImpressionsB || 0}
          clicksA={article.abTestClicksA || 0}
          clicksB={article.abTestClicksB || 0}
          onDeclareWinner={handleDeclareWinner}
          onResetTest={handleResetTest}
        />

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isEn ? "Summary (Excerpt)" : "সারসংক্ষেপ (Excerpt)"}
            </label>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={11} />
              <span>{isEn ? "Generate with AI" : "এআই সারসংক্ষেপ তৈরি"}</span>
            </button>
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
            placeholder={isEn ? "Core takeaway in 2-3 concise sentences..." : "সংবাদের মূল প্রতিপাদ্য ২/৩ লাইনে লিখুন..."}
          />
        </div>

        {/* Content with Tiptap */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            {isEn ? "Story Content (Article Body) *" : "বিস্তারিত বিষয়বস্তু (Article Body) *"}
          </label>
          <TiptapEditor
            content={content}
            onChange={(html) => setContent(html)}
            placeholder={isEn ? "Write your full news story here..." : "এখানে বিস্তারিত সংবাদ লিখুন..."}
          />
        </div>

        {/* Real-Time SEO & Headline SERP Preview Scorecard */}
        <SeoQualityScorecard
          title={title}
          seoTitle={seoTitle}
          slug={article.slug}
          excerpt={excerpt}
          seoDescription={seoDescription}
          content={content}
          featuredImageUrl={article.featuredImageUrl || undefined}
          featuredImageAlt={featuredImageAlt}
          categoryName={article.categoryName || "জাতীয়"}
          focusKeyword={focusKeyword}
          onFocusKeywordChange={(val) => setFocusKeyword(val)}
        />

        {/* SEO Meta Title & Description Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isEn ? "SEO Meta Title (Google Search)" : "এসইও মেটা শিরোনাম (গুগল সার্চ)"}
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
              {isEn ? "Featured Image Alt Text / Caption" : "ছবির ক্যাপশন ও ক্রেডিট (Alt Text)"}
            </label>
            <input
              type="text"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              placeholder={isEn ? "Photo credit & description" : "ছবির ক্রেডিট ও অল্টার টেক্সট"}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs rounded"
            />
          </div>
        </div>

        {/* Correction Note */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
            {isEn ? "Editorial Correction Note" : "সংশোধনী বিজ্ঞপ্তি (Correction Note)"}
          </label>
          <input
            type="text"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder={
              isEn
                ? "If any factual errors in the earlier version were corrected, specify transparently here..."
                : "পূর্ববর্তী তথ্যের কোনো অসঙ্গতি সংশোধন করা হলে তা এখানে লিখুন..."
            }
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
          />
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            {isEn
              ? "When a correction note is added, a transparent timestamped disclaimer is displayed on the story page."
              : "সংশোধনী যুক্ত করলে সংবাদ পৃষ্ঠায় সময়সহ একটি স্বচ্ছ নোটিশ প্রদর্শিত হবে।"}
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm rounded cursor-pointer"
          >
            <Save size={14} />
            <span>{loading ? (isEn ? "Saving..." : "সংরক্ষণ হচ্ছে...") : (isEn ? "Save Changes" : "পরিবর্তন সংরক্ষণ করুন")}</span>
          </button>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <AiEditorAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        currentTitle={title}
        currentContent={content}
        onApplyTitle={(newTitle) => setTitle(newTitle)}
        onApplyExcerpt={(newExcerpt) => setExcerpt(newExcerpt)}
        onApplyCleanedContent={(cleaned) => setContent(cleaned)}
      />
    </div>
  );
}
