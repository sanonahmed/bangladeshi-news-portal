import Link from "next/link";
import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { user } from "@/db/schema/auth";
import { breakingNews } from "@/db/schema/breaking-news";
import { polls } from "@/db/schema/polls";
import { comments } from "@/db/schema/comments";
import { categories } from "@/db/schema/categories";
import { eq, desc, count } from "drizzle-orm";
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  Plus,
  Zap,
  Vote,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Bell,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  formatBengaliDateTime,
  toBengaliDigits,
  formatBengaliDate,
  formatBengaliDay,
  getDhakaDate,
} from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = getDhakaDate();

  let stats = {
    published: 0,
    drafts: 0,
    pending: 0,
    journalists: 0,
    activeBreaking: 0,
    activePolls: 0,
    pendingComments: 0,
  };

  let recentArticles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    viewCount: number;
    publishedAt: Date | null;
    createdAt: Date;
  }> = [];

  let pendingReviews: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
  }> = [];

  let activeBreakingList: Array<{
    id: string;
    headline: string;
    priority: number;
    createdAt: Date;
  }> = [];

  let featuredPoll: {
    id: string;
    question: string;
    options: any;
    votes: any;
    totalVotes: number;
  } | null = null;

  let categoryBreakdown: Array<{
    name: string;
    count: number;
  }> = [];

  try {
    const [
      publishedCount,
      draftsCount,
      pendingCount,
      journalistsCount,
      activeBreakingCount,
      activePollsCount,
      pendingCommentsCount,
      recents,
      pendingList,
      breakingItems,
      topPoll,
      categoriesData,
    ] = await Promise.all([
      db.select({ count: count() }).from(articles).where(eq(articles.status, "published")),
      db.select({ count: count() }).from(articles).where(eq(articles.status, "draft")),
      db.select({ count: count() }).from(articles).where(eq(articles.status, "pending_review")),
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(breakingNews).where(eq(breakingNews.isActive, true)),
      db.select({ count: count() }).from(polls).where(eq(polls.isActive, true)),
      db.select({ count: count() }).from(comments).where(eq(comments.status, "pending")),
      db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          status: articles.status,
          viewCount: articles.viewCount,
          publishedAt: articles.publishedAt,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .orderBy(desc(articles.createdAt))
        .limit(8),
      db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          status: articles.status,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .where(eq(articles.status, "pending_review"))
        .orderBy(desc(articles.createdAt))
        .limit(4),
      db
        .select({
          id: breakingNews.id,
          headline: breakingNews.headline,
          priority: breakingNews.priority,
          createdAt: breakingNews.createdAt,
        })
        .from(breakingNews)
        .where(eq(breakingNews.isActive, true))
        .orderBy(breakingNews.priority)
        .limit(3),
      db
        .select({
          id: polls.id,
          question: polls.question,
          options: polls.options,
          votes: polls.votes,
          totalVotes: polls.totalVotes,
        })
        .from(polls)
        .where(eq(polls.isActive, true))
        .orderBy(desc(polls.isFeatured), desc(polls.createdAt))
        .limit(1),
      db
        .select({
          name: categories.name,
          count: count(articleCategories.articleId),
        })
        .from(categories)
        .leftJoin(articleCategories, eq(categories.id, articleCategories.categoryId))
        .groupBy(categories.id, categories.name)
        .orderBy(desc(count(articleCategories.articleId)))
        .limit(6),
    ]);

    stats = {
      published: Number(publishedCount[0]?.count ?? 0),
      drafts: Number(draftsCount[0]?.count ?? 0),
      pending: Number(pendingCount[0]?.count ?? 0),
      journalists: Number(journalistsCount[0]?.count ?? 0),
      activeBreaking: Number(activeBreakingCount[0]?.count ?? 0),
      activePolls: Number(activePollsCount[0]?.count ?? 0),
      pendingComments: Number(pendingCommentsCount[0]?.count ?? 0),
    };

    recentArticles = recents;
    pendingReviews = pendingList;
    activeBreakingList = breakingItems;
    if (topPoll && topPoll.length > 0) {
      featuredPoll = topPoll[0] as any;
    }
    categoryBreakdown = categoriesData.map((c) => ({
      name: c.name,
      count: Number(c.count),
    }));
  } catch (error) {
    console.error("Could not query admin dashboard stats from DB:", error);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] tracking-tight">
            সম্পাদকীয় ড্যাশবোর্ড
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
            {formatBengaliDay(today)}, {formatBengaliDate(today)} &bull; ঢাকা ব্যুরো
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/breaking-news"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-xs font-medium text-[var(--color-text)] transition-colors rounded"
          >
            <Zap size={14} className="text-red-600" />
            <span>ব্রেকিং নিউজ</span>
          </Link>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors rounded shadow-xs"
          >
            <Plus size={15} />
            <span>নতুন সংবাদ</span>
          </Link>
        </div>
      </div>

      {/* Primary Newsroom Metric Cards (Clean, Human, Grounded) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Published */}
        <Link
          href="/admin/articles"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>প্রকাশিত সংবাদ</span>
            <FileText size={15} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {toBengaliDigits(stats.published)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              সব দেখুন <ArrowUpRight size={12} className="ml-0.5" />
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
              পর্যালোচনার অপেক্ষায়
            </span>
            <Clock size={15} className={stats.pending > 0 ? "text-amber-600" : "text-[var(--color-text-muted)]"} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {toBengaliDigits(stats.pending)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              {stats.pending > 0 ? "অনুমোদন করুন" : "হালনাগাদ"} <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Active Breaking News */}
        <Link
          href="/admin/breaking-news"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>চলমান ব্রেকিং নিউজ</span>
            <Zap size={15} className="text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {toBengaliDigits(stats.activeBreaking)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-red-600 flex items-center">
              ব্যবস্থাপনা <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>

        {/* Active Polls */}
        <Link
          href="/admin/polls"
          className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
            <span>সক্রিয় জনমত জরিপ</span>
            <Vote size={15} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              {toBengaliDigits(stats.activePolls)}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] flex items-center">
              ফলাফল <ArrowUpRight size={12} className="ml-0.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Main Workspace (Editorial Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Queue & Recent Stories (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pending Reviews Queue (Prioritized Action) */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[var(--color-primary)]" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                  অনুমোদনের অপেক্ষায় থাকা প্রতিবেদন ({toBengaliDigits(stats.pending)})
                </h2>
              </div>
              <Link
                href="/admin/reviews"
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                সবগুলো পর্যালোচনা করুন &rarr;
              </Link>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
                বর্তমানে পর্যালোচনার জন্য কোনো প্রতিবেদন জমা নেই।
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
                        জমার সময়: {formatBengaliDateTime(art.createdAt)}
                      </p>
                    </div>
                    <Link
                      href="/admin/reviews"
                      className="px-2.5 py-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[11px] font-semibold rounded flex-shrink-0 transition-colors"
                    >
                      রিভিউ
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
                  সাম্প্রতিক সংবাদ তালিকা
                </h2>
              </div>
              <Link
                href="/admin/articles"
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                সকল সংবাদ দেখুন &rarr;
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                কোনো সংবাদ পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                    <tr>
                      <th className="px-4 py-2.5">শিরোনাম</th>
                      <th className="px-3 py-2.5">অবস্থা</th>
                      <th className="px-3 py-2.5">তারিখ</th>
                      <th className="px-4 py-2.5 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {recentArticles.map((art) => (
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
                            {art.status === "published"
                              ? "প্রকাশিত"
                              : art.status === "draft"
                              ? "খসড়া"
                              : "রিভিউ"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-text-muted)] whitespace-nowrap">
                          {formatBengaliDate(art.publishedAt ?? art.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="text-[var(--color-primary)] hover:underline font-semibold"
                          >
                            সম্পাদনা
                          </Link>
                          {art.status === "published" && (
                            <Link
                              href={`/news/${art.slug}`}
                              target="_blank"
                              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                              title="পাবলিক পেজ দেখুন"
                            >
                              <ExternalLink size={12} className="inline ml-1" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
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
                  চলমান ব্রেকিং নিউজ
                </h3>
              </div>
              <Link
                href="/admin/breaking-news"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                সম্পাদনা
              </Link>
            </div>

            {activeBreakingList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                বর্তমানে কোনো ব্রেকিং নিউজ চলমান নেই।
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {activeBreakingList.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-1">
                    <p className="text-xs font-semibold text-[var(--color-text)] leading-snug">
                      {item.headline}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      অগ্রাধিকার ক্রম: {toBengaliDigits(item.priority)}
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
                  সক্রিয় জনমত জরিপ
                </h3>
              </div>
              <Link
                href="/admin/polls"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                সবগুলো
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
                              {toBengaliDigits(pct)}% ({toBengaliDigits(count)})
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
                  <span>মোট ভোট:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {toBengaliDigits(featuredPoll.totalVotes)}টি
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                কোনো সক্রিয় জরিপ নেই।
              </div>
            )}
          </div>

          {/* Section Distribution */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
                বিভাগভিত্তিক সংবাদ সংখ্যা
              </h3>
              <Link
                href="/admin/categories"
                className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold"
              >
                বিভাগ তালিকা
              </Link>
            </div>

            <div className="p-3.5 space-y-2">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text)] font-medium">{cat.name}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {toBengaliDigits(cat.count)}টি
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Quick Tools */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              নিয়মিত সরঞ্জাম
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/notifications"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <Bell size={13} className="text-[var(--color-primary)]" />
                <span>পুশ নোটিফিকেশন</span>
              </Link>
              <Link
                href="/admin/ai-assistant"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <Sparkles size={13} className="text-[var(--color-primary)]" />
                <span>এআই সহকারী</span>
              </Link>
              <Link
                href="/admin/fact-checks"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <ShieldCheck size={13} className="text-[var(--color-primary)]" />
                <span>ফ্যাক্ট-চেক</span>
              </Link>
              <Link
                href="/admin/comments"
                className="p-2 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] rounded flex items-center gap-1.5 transition-colors text-[var(--color-text)]"
              >
                <MessageSquare size={13} className="text-[var(--color-primary)]" />
                <span>মন্তব্য মডারেশন</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
