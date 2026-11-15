"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileEdit,
  FileText,
  Newspaper,
  Plus,
  Sparkles,
  ShieldCheck,
  Bell,
  BarChart3,
  TriangleAlert,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { TrendingVelocityCard } from "@/components/admin/dashboard/TrendingVelocityCard";
import { type AdminDashboardProps } from "@/components/admin/dashboard/types";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import { RecentStories } from "@/components/admin/dashboard/RecentStories";
import { DashboardSidebar } from "@/components/admin/dashboard/DashboardSidebar";
import { DashboardInsights } from "@/components/admin/dashboard/DashboardInsights";

export function AdminDashboardClient({
  trendingData,
  features,
  dataUnavailable = false,
  stats,
  recentArticles,
  pendingReviews,
  activeBreakingList,
  featuredPoll,
  categoryBreakdown,
}: AdminDashboardProps) {
  const { t, formatNumber, formatDateString, formatDayString, language } =
    useAdminLanguage();
  const isEn = language === "en";
  const now = new Date();
  const quickTools = [
    {
      href: "/admin/ai-assistant",
      icon: Sparkles,
      label: t("widget.ai"),
      flag: "admin_ai_assistant",
    },
    {
      href: "/admin/fact-checks",
      icon: ShieldCheck,
      label: t("widget.factCheck"),
      flag: "admin_fact_check_manager",
    },
    {
      href: "/admin/notifications",
      icon: Bell,
      label: t("widget.push"),
      flag: null,
    },
    {
      href: "/admin/analytics",
      icon: BarChart3,
      label: isEn ? "Analytics" : "বিশ্লেষণ",
      flag: null,
    },
  ].filter((tool) => !tool.flag || features?.[tool.flag] !== false);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-6">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500"
          >
            <span>{isEn ? "Workspace" : "ওয়ার্কস্পেস"}</span>
            <ChevronRight size={12} />
            <span className="text-indigo-600 dark:text-indigo-400">
              {isEn ? "Overview" : "ওভারভিউ"}
            </span>
          </nav>
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.035em] text-[var(--color-text)] sm:text-[2rem]">
            {t("dash.title")}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={14} className="text-slate-400" />
            <span>
              {formatDayString(now)}, {formatDateString(now)}
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span>{t("dash.bureau")}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07]"
          >
            <Newspaper size={15} />
            {isEn ? "View website" : "ওয়েবসাইট দেখুন"}
            <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-[0_5px_12px_-5px_rgba(79,70,229,0.7)] transition-colors hover:bg-indigo-700"
          >
            <Plus size={16} />
            {t("dash.btnNewArticle")}
          </Link>
        </div>
      </header>

      {dataUnavailable && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
        >
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {isEn
                ? "Newsroom metrics are unavailable"
                : "নিউজরুমের তথ্য পাওয়া যাচ্ছে না"}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              {isEn
                ? "Refresh to retry. Zeros or empty lists below may not reflect the newsroom."
                : "আবার চেষ্টা করতে পেজটি রিফ্রেশ করুন। নিচের শূন্য বা খালি তালিকা সঠিক নাও হতে পারে।"}
            </p>
          </div>
        </div>
      )}

      <section
        aria-label={isEn ? "Newsroom summary" : "নিউজরুমের সারসংক্ষেপ"}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      >
        <MetricCard
          href="/admin/analytics"
          icon={Activity}
          accent
          label={isEn ? "Readers online" : "সক্রিয় পাঠক"}
          value={formatNumber(trendingData.activeReaders)}
          detail={
            isEn ? "Active in the last 2 min" : "সর্বশেষ ২ মিনিটে সক্রিয়"
          }
        />
        <MetricCard
          href="/admin/articles"
          icon={FileText}
          label={t("stat.published")}
          value={formatNumber(stats.published)}
          detail={`${formatNumber(trendingData.todayPublishedCount)} ${isEn ? "published today" : "আজ প্রকাশিত"}`}
        />
        <MetricCard
          href="/admin/reviews"
          icon={Clock3}
          label={t("stat.pending")}
          value={formatNumber(stats.pending)}
          detail={
            stats.pending
              ? isEn
                ? "Waiting for an editor"
                : "সম্পাদকের পর্যালোচনায়"
              : t("stat.updated")
          }
        />
        <MetricCard
          href="/admin/articles?status=draft"
          icon={FileEdit}
          label={isEn ? "Work in progress" : "চলমান খসড়া"}
          value={formatNumber(stats.drafts)}
          detail={`${formatNumber(stats.journalists)} ${isEn ? "newsroom members" : "নিউজরুম সদস্য"}`}
        />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <TrendingVelocityCard initialData={trendingData} />
          <RecentStories articles={recentArticles} />
        </div>
        <DashboardSidebar
          pending={pendingReviews}
          stats={stats}
          breaking={activeBreakingList}
          tools={quickTools}
          enabledComments={features?.admin_comments_moderation !== false}
        />
      </div>
      <DashboardInsights
        poll={featuredPoll}
        categories={categoryBreakdown}
        enabledPolls={features?.admin_polls_manager !== false}
      />
    </div>
  );
}
