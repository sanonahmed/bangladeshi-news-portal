import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema/articles";
import { user } from "@/db/schema/auth";
import { breakingNews } from "@/db/schema/breaking-news";
import { polls } from "@/db/schema/polls";
import { comments } from "@/db/schema/comments";
import { categories } from "@/db/schema/categories";
import { eq, desc, count } from "drizzle-orm";
import { getTrendingArticlesWithVelocity, type TrendingVelocityData } from "@/actions/articles";
import { getFeatureFlags } from "@/actions/features";
import { type FeatureFlags, getDefaultFeatureFlags } from "@/lib/features";
import { AdminDashboardClient } from "./AdminDashboardClient";

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

  let trendingData: TrendingVelocityData = {
    activeReaders: 0,
    trafficVelocityRating: "steady",
    trafficMultiplier: 1.0,
    todayTotalViews: 0,
    todayPublishedCount: 0,
    trendingStories: [],
  };

  let features: FeatureFlags = getDefaultFeatureFlags();

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
      trendingRes,
      featuresResult,
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
      getTrendingArticlesWithVelocity(),
      getFeatureFlags(),
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
    trendingData = trendingRes;
    features = featuresResult;

    return (
      <AdminDashboardClient
        stats={stats}
        recentArticles={recentArticles}
        pendingReviews={pendingReviews}
        activeBreakingList={activeBreakingList}
        featuredPoll={featuredPoll}
        categoryBreakdown={categoryBreakdown}
        trendingData={trendingData}
        features={features}
      />
    );
  } catch (error) {
    console.error("Could not query admin dashboard stats from DB:", error);
  }

  return (
    <AdminDashboardClient
      stats={stats}
      recentArticles={recentArticles}
      pendingReviews={pendingReviews}
      activeBreakingList={activeBreakingList}
      featuredPoll={featuredPoll}
      categoryBreakdown={categoryBreakdown}
      trendingData={trendingData}
      features={features}
    />
  );
}
