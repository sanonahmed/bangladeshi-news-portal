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
import { updateArticle } from "@/actions/articles";

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
  };
}

export function AdminEditArticleClient({ article }: AdminEditArticleClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [content, setContent] = useState(article.content || "");
  const [correctionNote, setCorrectionNote] = useState(article.correctionNote || "");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateArticle({
        id: article.id,
        title,
        excerpt,
        content,
        correctionNote: correctionNote || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "সংবাদ হালনাগাদ করা সম্ভব হয়নি।");
      }

      setSuccess("সংবাদটি সফলভাবে হালনাগাদ করা হয়েছে!");
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "হালনাগাদে ত্রুটি দেখা দিয়েছে");
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
            <h1 className="bengali-headline text-xl font-bold text-[var(--color-text)]">
              সংবাদ সম্পাদনা ও এআই পরিমার্জন
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
              <span>স্লাগ:</span>
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
            title="এআই সম্পাদকীয় সহকারী"
          >
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>এআই সহকারী</span>
          </button>

          <Link
            href={`/news/${article.slug}`}
            target="_blank"
            className="px-3 py-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold text-[var(--color-text-muted)] rounded flex items-center gap-1.5"
            title="লাইভ সংবাদ দেখুন"
          >
            <Eye size={13} />
            <span>লাইভ দেখুন</span>
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
              শিরোনাম (বাংলা) *
            </label>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
            >
              <Sparkles size={12} className="text-purple-600 dark:text-purple-400" />
              <span>এআই দিয়ে শিরোনাম পরিবর্তন</span>
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-base font-bold focus:outline-none focus:border-[var(--color-primary)] bengali-headline rounded"
          />
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              সারসংক্ষেপ (Excerpt)
            </label>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles size={11} />
              <span>এআই সারসংক্ষেপ তৈরি</span>
            </button>
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
            placeholder="সংবাদের মূল প্রতিপাদ্য ২/৩ লাইনে লিখুন..."
          />
        </div>

        {/* Content with Tiptap */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            বিস্তারিত বিষয়বস্তু (Article Body) *
          </label>
          <TiptapEditor
            content={content}
            onChange={(html) => setContent(html)}
            placeholder="এখানে বিস্তারিত সংবাদ লিখুন..."
          />
        </div>

        {/* Correction Note */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1">
            সংশোধনী বিজ্ঞপ্তি (Correction Note)
          </label>
          <input
            type="text"
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            placeholder="পূর্ববর্তী তথ্যের কোনো অসঙ্গতি সংশোধন করা হলে তা এখানে লিখুন..."
            className="w-full p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
          />
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            সংশোধনী যুক্ত করলে সংবাদ পৃষ্ঠায় সময়সহ একটি স্বচ্ছ নোটিশ প্রদর্শিত হবে।
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
            <span>{loading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
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
