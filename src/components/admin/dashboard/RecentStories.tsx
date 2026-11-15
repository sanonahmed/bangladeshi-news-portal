"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  FileEdit,
  FileText,
  Newspaper,
  Search,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { filterDashboardArticles, type DashboardArticle } from "./types";
import { StatusBadge, SURFACE } from "./DashboardPrimitives";

export function RecentStories({ articles }: { articles: DashboardArticle[] }) {
  const { t, formatNumber, formatDateString, language } = useAdminLanguage();
  const isEn = language === "en";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visible = filterDashboardArticles(articles, query, status);

  return (
    <section className={`overflow-hidden ${SURFACE}`}>
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />
            <h2 className="text-sm font-bold text-[var(--color-text)]">
              {t("section.recentArticles")}
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? "Your latest stories and their publishing status"
              : "সাম্প্রতিক প্রতিবেদন ও প্রকাশনার অবস্থা"}
          </p>
        </div>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1 sm:w-44">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <span className="sr-only">
              {isEn ? "Search recent stories" : "সাম্প্রতিক সংবাদ খুঁজুন"}
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isEn ? "Search stories" : "সংবাদ খুঁজুন"}
              className="h-9 w-full rounded-lg border border-slate-200 bg-[var(--color-bg)] pl-8 pr-2 text-xs text-[var(--color-text)] outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10"
            />
          </label>
          <select
            aria-label={isEn ? "Filter by status" : "অবস্থা অনুযায়ী ফিল্টার"}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-400 dark:border-white/10"
          >
            <option value="all">{isEn ? "All statuses" : "সব অবস্থা"}</option>
            <option value="published">{t("status.published")}</option>
            <option value="draft">{t("status.draft")}</option>
            <option value="pending_review">{t("status.pending_review")}</option>
          </select>
        </div>
      </div>
      {visible.length ? (
        <div className="divide-y divide-[var(--color-border)]">
          {visible.map((article) => (
            <article
              key={article.id}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.025] sm:px-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="line-clamp-2 text-[13px] font-semibold leading-relaxed text-[var(--color-text)] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                >
                  {article.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                  <StatusBadge
                    status={article.status}
                    label={t(`status.${article.status}`, article.status)}
                  />
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {formatNumber(article.viewCount)}
                  </span>
                  <time>
                    {formatDateString(article.publishedAt ?? article.createdAt)}
                  </time>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  aria-label={`${t("action.edit")}: ${article.title}`}
                  href={`/admin/articles/${article.id}/edit`}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-white/10"
                >
                  <FileEdit size={14} />
                </Link>
                {article.status === "published" && (
                  <Link
                    aria-label={`${t("action.viewPublic")}: ${article.title}`}
                    href={`/news/${article.slug}`}
                    target="_blank"
                    className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-indigo-600 hover:shadow-sm dark:hover:bg-white/10"
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-5 py-12 text-center">
          <FileText size={24} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {t("section.noArticles")}
          </p>
          {(query || status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {isEn ? "Clear filters" : "ফিল্টার মুছে ফেলুন"}
            </button>
          )}
        </div>
      )}
      <div className="border-t border-[var(--color-border)] bg-slate-50/60 px-5 py-3 dark:bg-white/[0.025] sm:px-6">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {isEn ? "Open publishing desk" : "সকল সংবাদ দেখুন"}
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
