import Link from "next/link";
import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { user } from "@/db/schema/auth";
import { breakingNews } from "@/db/schema/breaking-news";
import { polls } from "@/db/schema/polls";
import { comments } from "@/db/schema/comments";
import { categories } from "@/db/schema/categories";
import { eq, desc, count, and, sql } from "drizzle-orm";
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Eye,
  PlusCircle,
  Zap,
  Vote,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Radio,
  BarChart2,
  FolderTree,
  AlertCircle,
  Bell,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { formatBengaliDateTime, toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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

  // KPI stat cards configuration
  const statCards = [
    {
      title: "প্রকাশিত সংবাদ",
      value: toBengaliDigits(stats.published),
      subtitle: "সরাসরি ওয়েবসাইটে লাইভ",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
      href: "/admin/articles",
    },
    {
      title: "পর্যালোচনার অপেক্ষায়",
      value: toBengaliDigits(stats.pending),
      subtitle: stats.pending > 0 ? "জরুরি অনুমোদন প্রয়োজন" : "সব ড্রাফট অনুমোদিত",
      icon: Clock,
      color: stats.pending > 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
      bg: stats.pending > 0
        ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 animate-pulse"
        : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60",
      href: "/admin/reviews",
    },
    {
      title: "খসড়া (Drafts)",
      value: toBengaliDigits(stats.drafts),
      subtitle: "অসম্পূর্ণ বা পর্যালোচনাধীন",
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      href: "/admin/articles",
    },
    {
      title: "সক্রিয় ব্রেকিং নিউজ",
      value: toBengaliDigits(stats.activeBreaking),
      subtitle: "হোমপেজের হেডারে চলমান",
      icon: Zap,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60",
      href: "/admin/breaking-news",
    },
    {
      title: "সক্রিয় জনমত জরিপ",
      value: toBengaliDigits(stats.activePolls),
      subtitle: "পাঠক ভোট গ্রহণ চলছে",
      icon: Vote,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
      href: "/admin/polls",
    },
    {
      title: "সাংবাদিক ও কর্মী",
      value: toBengaliDigits(stats.journalists),
      subtitle: "নিউজ রুমের সক্রিয় সদস্য",
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
      href: "/admin/users",
    },
  ];

  // Quick Action Buttons
  const quickActions = [
    {
      label: "নতুন সংবাদ রচনা",
      href: "/admin/articles/new",
      icon: PlusCircle,
      primary: true,
    },
    {
      label: "ব্রেকিং নিউজ ফ্ল্যাশ",
      href: "/admin/breaking-news",
      icon: Zap,
    },
    {
      label: "পুশ নোটিফিকেশন",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      label: "এআই সহকারী",
      href: "/admin/ai-assistant",
      icon: Sparkles,
    },
    {
      label: "অনলাইন ভোট তৈরি",
      href: "/admin/polls",
      icon: Vote,
    },
    {
      label: "ফ্যাক্ট-চেক যোগ",
      href: "/admin/fact-checks",
      icon: ShieldCheck,
    },
    {
      label: "মন্তব্য মডারেশন",
      href: "/admin/comments",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Newsroom Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              নিউজ রুম কমান্ড সেন্টার • লাইভ সিঙ্ক
            </span>
          </div>
          <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] mt-1">
            দৈনিক বাংলাদেশ বার্তা সম্পাদকীয় ড্যাশবোর্ড
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            আজকের সার্বিক প্রকাশনা গতি, ব্রেকিং নিউজ মনিটর এবং সাংবাদিক দলের কার্যক্রম
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded shadow-xs transition-colors"
          >
            <PlusCircle size={15} />
            <span>নতুন সংবাদ তৈরি করুন</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded transition-colors"
          >
            <span>পাবলিক সাইট</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Action Bar (অ্যাকশন হাব) */}
      <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-1 mb-2 flex items-center gap-1.5">
          <Activity size={12} className="text-[var(--color-primary)]" />
          <span>দ্রুত সম্পাদকীয় পদক্ষেপ (Quick Launchpad)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <Link
                key={qa.href}
                href={qa.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  qa.primary
                    ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-2xs font-bold"
                    : "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)]"
                }`}
              >
                <Icon size={14} className={qa.primary ? "text-white" : "text-[var(--color-primary)]"} />
                <span>{qa.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Core KPI Metrics Grid (৬টি কার্ড) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-4 border rounded-lg flex flex-col justify-between hover:shadow-sm transition-all group ${card.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors">
                  {card.title}
                </span>
                <Icon size={16} className={card.color} />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reviews & Recent Articles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Editorial Reviews Queue Widget */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
                  পর্যালোচনা ও অনুমোদনের অপেক্ষায় ({toBengaliDigits(stats.pending)}টি)
                </h3>
              </div>
              <Link
                href="/admin/reviews"
                className="text-xs text-[var(--color-primary)] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>সকল রিভিউ</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="p-6 text-center bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  সকল প্রতিবেদন অনুমোদিত ও হালনাগাদ রয়েছে
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
                  সাংবাদিকরা কোনো নতুন খসড়া পর্যালোচনার জন্য জমা দিলে তা সরাসরি এখানে দেখা যাবে।
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {pendingReviews.map((art) => (
                  <div key={art.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <div className="min-w-0 pr-3">
                      <h4 className="text-xs font-bold text-[var(--color-text)] truncate">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        জমা: {formatBengaliDateTime(art.createdAt)}
                      </p>
                    </div>
                    <Link
                      href="/admin/reviews"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded transition-colors flex-shrink-0"
                    >
                      রিভিউ করুন
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Editorial Articles Table */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-primary)]" />
                <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)]">
                  সাম্প্রতিক প্রকাশিত সংবাদ ও খসড়া
                </h3>
              </div>
              <Link
                href="/admin/articles"
                className="text-xs text-[var(--color-primary)] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>সকল সংবাদ</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">
                এখনও কোনো সংবাদ তৈরি হয়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold">
                    <tr>
                      <th className="p-3">শিরোনাম</th>
                      <th className="p-3">অবস্থা</th>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {recentArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="p-3 font-semibold text-[var(--color-text)] max-w-xs truncate">
                          {art.title}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              art.status === "published"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : art.status === "draft"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {art.status === "published" ? "প্রকাশিত" : art.status === "draft" ? "খসড়া" : "রিভিউ"}
                          </span>
                        </td>
                        <td className="p-3 text-[var(--color-text-muted)] font-mono text-[11px]">
                          {formatBengaliDate(art.publishedAt ?? art.createdAt)}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="text-[var(--color-primary)] hover:underline font-bold"
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

        {/* Right Column: Live Tickers, Polls & Category Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Breaking News Monitor */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[var(--color-border)] bg-red-50 dark:bg-red-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                <Radio size={15} className="animate-pulse" />
                <span>চলমান ব্রেকিং নিউজ ({toBengaliDigits(stats.activeBreaking)}টি)</span>
              </div>
              <Link
                href="/admin/breaking-news"
                className="text-[11px] font-bold text-red-700 dark:text-red-300 hover:underline"
              >
                ব্যবস্থাপনা
              </Link>
            </div>

            {activeBreakingList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                বর্তমানে কোনো সক্রিয় ব্রেকিং নিউজ নেই।
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {activeBreakingList.map((item) => (
                  <div key={item.id} className="p-3 space-y-1 hover:bg-[var(--color-bg-secondary)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
                        অগ্রাধিকার: {toBengaliDigits(item.priority)}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatBengaliDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[var(--color-text)] leading-snug">
                      {item.headline}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Live Poll Snapshot */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote size={15} className="text-purple-600" />
                <h3 className="bengali-headline text-xs font-bold text-[var(--color-text)]">
                  হোমপেজের প্রধান জরিপ (Live Poll)
                </h3>
              </div>
              <Link
                href="/admin/polls"
                className="text-[11px] font-bold text-[var(--color-primary)] hover:underline"
              >
                সব জরিপ
              </Link>
            </div>

            {featuredPoll ? (
              <div className="p-4 space-y-3">
                <h4 className="bengali-headline text-xs font-bold text-[var(--color-text)] leading-relaxed">
                  {featuredPoll.question}
                </h4>

                <div className="space-y-2">
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
                            <span className="text-[var(--color-text-muted)] font-medium truncate max-w-[180px]">
                              {opt}
                            </span>
                            <span className="font-mono font-bold text-[var(--color-text)]">
                              {toBengaliDigits(pct)}% ({toBengaliDigits(count)})
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden border border-[var(--color-border)]">
                            <div
                              className="h-full bg-[var(--color-primary)] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                  <span>মোট সংগৃহীত ভোট:</span>
                  <span className="font-mono font-bold text-[var(--color-text)]">
                    {toBengaliDigits(featuredPoll.totalVotes)}টি
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                কোনো সক্রিয় জরিপ নেই।
              </div>
            )}
          </div>

          {/* Category Distribution Breakdown */}
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree size={15} className="text-emerald-600" />
                <h3 className="bengali-headline text-xs font-bold text-[var(--color-text)]">
                  বিভাগভিত্তিক সংবাদ সংখ্যা
                </h3>
              </div>
              <Link
                href="/admin/categories"
                className="text-[11px] font-bold text-[var(--color-primary)] hover:underline"
              >
                বিভাগসমূহ
              </Link>
            </div>

            <div className="p-3.5 space-y-2.5">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)]">{cat.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] font-mono font-bold text-[var(--color-text-muted)]">
                    {toBengaliDigits(cat.count)}টি
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System & Architecture Status */}
          <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs space-y-2 shadow-2xs">
            <div className="font-bold text-[var(--color-text)] flex items-center justify-between">
              <span>সিস্টেম ও পরিকাঠামো স্ট্যাটাস</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="space-y-1.5 text-[11px] text-[var(--color-text-muted)] font-mono">
              <div className="flex justify-between">
                <span>ডাটাবেজ:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">PostgreSQL Neon (Active)</span>
              </div>
              <div className="flex justify-between">
                <span>সার্ভার ইঞ্জিন:</span>
                <span>Next.js 16 (Turbopack)</span>
              </div>
              <div className="flex justify-between">
                <span>সিডিএন ক্যাশ:</span>
                <span>Edge ISR (30s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
