"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  Plus,
  Zap,
  Vote,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface AdminDashboardClientProps {
  stats: {
    published: number;
    drafts: number;
    pending: number;
    journalists: number;
    activeBreaking: number;
    activePolls: number;
    pendingComments: number;
  };
  recentArticles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    viewCount: number;
    publishedAt: Date | string | null;
    createdAt: Date | string;
  }>;
  pendingReviews: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date | string;
  }>;
  activeBreakingList: Array<{
    id: string;
    headline: string;
    priority: number;
    createdAt: Date | string;
  }>;
  featuredPoll: {
    id: string;
    question: string;
    options: any;
    votes: any;
    totalVotes: number;
  } | null;
  categoryBreakdown: Array<{
    name: string;
    count: number;
  }>;
}

export function AdminDashboardClient({
  stats,
  recentArticles,
  pendingReviews,
  activeBreakingList,
  featuredPoll,
  categoryBreakdown,
}: AdminDashboardClientProps) {
  const {
    t,
    formatNumber,
    formatDateString,
    formatDateTimeString,
    formatDayString,
    language,
  } = useAdminLanguage();

  const today = new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--color-text)] tracking-tight"
            style={language === "bn" ? { fontFamily: "var(--font-noto-bengali, sans-serif)" } : undefined}
          >
            {t("dash.title")}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
            {formatDayString(today)}, {formatDateString(today)} &bull; {t("dash.bureau")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/breaking-news"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-medium text-[var(--color-text)] transition-colors rounded"
          >
            <Zap size={14} className="text-red-600" />
            <span>{t("dash.btnBreaking")}</span>
          </Link>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors rounded shadow-xs"
          >
            <Plus size={15} />
            <span>{t("dash.btnNewArticle")}</span>
          </Link>
        </div>
      </div>

      {/* Primary Newsroom Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Published */}
        <Link
          href="/admin/articles"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>{t("stat.published")}</span>
            <FileText size={15} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {formatNumber(stats.published)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              {t("stat.viewAll")} <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Pending Reviews */}
        <Link
          href="/admin/reviews"
          className={`p-4 border rounded transition-colors group ${
            stats.pending > 0
              ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80"
              : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={stats.pending > 0 ? "text-amber-800 dark:text-amber-300 font-bold" : "text-[var(--color-text-muted)]"}>
              {t("stat.pending")}
            </span>
            <Clock size={15} className={stats.pending > 0 ? "text-amber-600" : "text-[var(--color-text-muted)]"} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {formatNumber(stats.pending)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              {stats.pending > 0 ? t("stat.approve") : t("stat.updated")} <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Active Breaking News */}
        <Link
          href="/admin/breaking-news"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>{t("stat.breaking")}</span>
            <Zap size={15} className="text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {formatNumber(stats.activeBreaking)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-red-600 flex items-center">
              {t("stat.manage")} <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Active Polls */}
        <Link
          href="/admin/polls"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>{t("stat.polls")}</span>
            <Vote size={15} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {formatNumber(stats.activePolls)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              {t("stat.results")} <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Main Workspace (Editorial Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Queue & Recent Stories (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pending Reviews Queue */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[var(--color-primary)]" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                  {t("section.pendingQueue")} ({formatNumber(stats.pending)})
                </h2>
              </div>
              <Link
                href="/admin/reviews"
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                {t("section.reviewAll")}
              </Link>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
                {t("section.noPending")}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {pendingReviews.map((art) => (
                  <div
                    key={art.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[var(--color-text)] truncate">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {t("label.submittedAt")}: {formatDateTimeString(art.createdAt)}
                      </p>
                    </div>
                    <Link
                      href="/admin/reviews"
                      className="px-2.5 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[11px] font-semibold rounded flex-shrink-0 transition-colors"
                    >
                      {t("action.review")}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Editorial Stories Table */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[var(--color-text-muted)]" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                  {t("section.recentArticles")}
                </h2>
              </div>
              <Link
                href="/admin/articles"
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                {t("section.viewAllArticles")}
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                {t("section.noArticles")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                    <tr>
                      <th className="px-4 py-2.5">{t("th.title")}</th>
                      <th className="px-3 py-2.5">{t("th.status")}</th>
                      <th className="px-3 py-2.5">{t("th.date")}</th>
                      <th className="px-4 py-2.5 text-right">{t("th.action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {recentArticles.map((art) => {
                      const statusKey = `status.${art.status}`;
                      const statusLabel = t(statusKey, art.status);

                      return (
                        <tr key={art.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[var(--color-text)] max-w-sm truncate">
                            {art.title}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                art.status === "published"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : art.status === "draft"
                                  ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[var(--color-text-muted)] whitespace-nowrap">
                            {formatDateString(art.publishedAt ?? art.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="text-[var(--color-primary)] hover:underline font-semibold"
                            >
                              {t("action.edit")}
                            </Link>
                            {art.status === "published" && (
                              <Link
                                href={`/news/${art.slug}`}
                                target="_blank"
                                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                                title={t("action.viewPublic")}
                              >
                                <ExternalLink size={12} className="inline ml-1" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Breaking News, Live Poll & Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Breaking Headlines */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-red-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                  {t("widget.activeBreaking")}
                </h3>
              </div>
              <Link
                href="/admin/breaking-news"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                {t("action.edit")}
              </Link>
            </div>

            {activeBreakingList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                {t("widget.noBreaking")}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {activeBreakingList.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-1">
                    <p className="text-xs font-semibold text-[var(--color-text)] leading-snug">
                      {item.headline}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {t("widget.priority")}: {formatNumber(item.priority)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Poll Overview */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote size={14} className="text-[var(--color-text-muted)]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                  {t("widget.activePoll")}
                </h3>
              </div>
              <Link
                href="/admin/polls"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                {t("widget.allPolls")}
              </Link>
            </div>

            {featuredPoll ? (
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-[var(--color-text)] leading-relaxed">
                  {featuredPoll.question}
                </p>

                <div className="space-y-2 pt-1">
                  {Array.isArray(featuredPoll.options) &&
                    featuredPoll.options.map((opt: string, idx: number) => {
                      const count = Array.isArray(featuredPoll?.votes)
                        ? (featuredPoll?.votes[idx] as number) || 0
                        : 0;
                      const total = featuredPoll?.totalVotes || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--color-text-muted)] truncate max-w-[160px]">
                              {opt}
                            </span>
                            <span className="font-semibold text-[var(--color-text)]">
                              {formatNumber(pct)}% ({formatNumber(count)})
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-primary)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex justify-between">
                  <span>{t("widget.totalVotes")}:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {formatNumber(featuredPoll.totalVotes)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                {t("widget.noPolls")}
              </div>
            )}
          </div>

          {/* Section Distribution */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                {t("widget.categories")}
              </h3>
              <Link
                href="/admin/categories"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                {t("widget.categoryList")}
              </Link>
            </div>

            <div className="p-3.5 space-y-2">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text)] font-medium">{cat.name}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {formatNumber(cat.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Quick Tools */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              {t("widget.quickTools")}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/notifications"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <Bell size={13} className="text-[var(--color-primary)]" />
                <span>{t("widget.push")}</span>
              </Link>
              <Link
                href="/admin/ai-assistant"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <Sparkles size={13} className="text-[var(--color-primary)]" />
                <span>{t("widget.ai")}</span>
              </Link>
              <Link
                href="/admin/fact-checks"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <ShieldCheck size={13} className="text-[var(--color-primary)]" />
                <span>{t("widget.factCheck")}</span>
              </Link>
              <Link
                href="/admin/comments"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <MessageSquare size={13} className="text-[var(--color-primary)]" />
                <span>{t("widget.comments")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
