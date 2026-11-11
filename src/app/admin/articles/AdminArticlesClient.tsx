"use client";

import Link from "next/link";
import { PlusCircle, Search, Clock, ExternalLink } from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminArticlesClientProps {
  articleList: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  q?: string;
  status?: string;
  handleDelete: (formData: FormData) => Promise<void>;
  handleProcessScheduled: () => Promise<void>;
}

export function AdminArticlesClient({
  articleList,
  totalCount,
  totalPages,
  currentPage,
  q,
  status,
  handleDelete,
  handleProcessScheduled,
}: AdminArticlesClientProps) {
  const { language, formatNumber, formatDateString, formatDateTimeString } = useAdminLanguage();
  const isEn = language === "en";

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            {isEn ? "Article & News Management" : "সংবাদ ও প্রতিবেদন ব্যবস্থাপনা"}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isEn
              ? "Manage drafts, articles pending editorial review, scheduled items, and published stories"
              : "সকল খসড়া, পর্যালোচনার অপেক্ষায় থাকা ও প্রকাশিত সংবাদের তালিকা"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={handleProcessScheduled} className="inline">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-bold transition-colors cursor-pointer rounded"
              title={isEn ? "Immediately process and publish due scheduled articles" : "বর্তমান সময় পার হওয়া শিডিউলকৃত সংবাদগুলো অবিলম্বে প্রকাশ করুন"}
            >
              <Clock size={14} />
              {isEn ? "Process Schedule" : "শিডিউল প্রসেস করুন"}
            </button>
          </form>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors shadow-sm rounded"
          >
            <PlusCircle size={16} />
            {isEn ? "Create New Article" : "নতুন সংবাদ তৈরি করুন"}
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form method="GET" action="/admin/articles" className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder={isEn ? "Search by title or slug..." : "শিরোনাম বা স্লাগ লিখে খুঁজুন..."}
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
        </div>
        <select
          name="status"
          defaultValue={status ?? "all"}
          className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-primary)] rounded"
        >
          <option value="all">{isEn ? "All Status" : "সকল অবস্থা"}</option>
          <option value="published">{isEn ? "Published" : "প্রকাশিত"}</option>
          <option value="approved">{isEn ? "Approved / Scheduled" : "শিডিউলকৃত / অনুমোদিত"}</option>
          <option value="draft">{isEn ? "Draft" : "খসড়া"}</option>
          <option value="pending_review">{isEn ? "Pending Review" : "পর্যালোচনাধীন"}</option>
          <option value="archived">{isEn ? "Archived" : "আর্কাইভকৃত"}</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors rounded cursor-pointer"
        >
          {isEn ? "Filter" : "ফিল্টার করুন"}
        </button>
      </form>

      {/* Articles Table */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden shadow-2xs">
        {articleList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
            {isEn ? "No articles found." : "কোনো সংবাদ পাওয়া যায়নি।"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">{isEn ? "Title" : "শিরোনাম"}</th>
                  <th className="p-3">{isEn ? "Category" : "বিভাগ"}</th>
                  <th className="p-3">{isEn ? "Author" : "লেখক"}</th>
                  <th className="p-3">{isEn ? "Status" : "অবস্থা"}</th>
                  <th className="p-3">{isEn ? "Date" : "তারিখ"}</th>
                  <th className="p-3 text-right">{isEn ? "Actions" : "পদক্ষেপ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {articleList.map((art) => (
                  <tr key={art.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--color-text)] max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{art.title}</span>
                        {art.abTestStatus === "active" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-white shrink-0 animate-pulse" title="Headline A/B test active">
                            ⚡ A/B
                          </span>
                        )}
                        {art.abTestStatus === "completed_b" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white shrink-0" title="Variant B won test">
                            🏆 B Won
                          </span>
                        )}
                        {art.abTestStatus === "completed_a" && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white shrink-0" title="Variant A won test">
                            🏆 A Won
                          </span>
                        )}
                      </div>
                      {art.focusKeyword && (
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          KW: {art.focusKeyword}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {art.categoryName ?? "—"}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">
                      {art.authorName ?? "—"}
                    </td>
                    <td className="p-3">
                      {art.status === "published" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {isEn ? "Published" : "প্রকাশিত"}
                        </span>
                      ) : art.scheduledAt && new Date(art.scheduledAt).getTime() > Date.now() ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          <Clock size={10} /> {isEn ? "Scheduled" : "শিডিউলকৃত"}
                        </span>
                      ) : art.status === "draft" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {isEn ? "Draft" : "খসড়া"}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                          {art.status === "pending_review" ? (isEn ? "Pending Review" : "পর্যালোচনাধীন") : art.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)] whitespace-nowrap">
                      {art.scheduledAt && new Date(art.scheduledAt).getTime() > Date.now() ? (
                        <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          <span>{isEn ? "Scheduled: " : "শিডিউল: "}</span>
                          <span>{formatDateTimeString(art.scheduledAt)}</span>
                        </div>
                      ) : (
                        formatDateString(art.publishedAt ?? art.createdAt)
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="text-[var(--color-primary)] hover:underline font-semibold"
                      >
                        {isEn ? "Edit" : "সম্পাদনা"}
                      </Link>
                      {art.status === "published" && (
                        <Link
                          href={`/news/${art.slug}`}
                          target="_blank"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                          title={isEn ? "View live article" : "সংবাদটি দেখুন"}
                        >
                          <ExternalLink size={12} className="inline ml-1" />
                        </Link>
                      )}
                      <form action={handleDelete} className="inline ml-2">
                        <input type="hidden" name="articleId" value={art.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 hover:underline cursor-pointer font-semibold ml-1"
                        >
                          {isEn ? "Delete" : "মুছুন"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-2">
          <span>{isEn ? `Total ${formatNumber(totalCount)} articles` : `মোট ${formatNumber(totalCount)}টি সংবাদ`}</span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/articles?page=${currentPage - 1}${q ? `&q=${q}` : ""}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded"
              >
                {isEn ? "← Previous" : "← পূর্ববর্তী"}
              </Link>
            )}
            <span className="px-2 py-1">
              {isEn ? `Page ${formatNumber(currentPage)} of ${formatNumber(totalPages)}` : `পাতা ${formatNumber(currentPage)} / ${formatNumber(totalPages)}`}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/articles?page=${currentPage + 1}${q ? `&q=${q}` : ""}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded"
              >
                {isEn ? "Next →" : "পরবর্তী →"}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
