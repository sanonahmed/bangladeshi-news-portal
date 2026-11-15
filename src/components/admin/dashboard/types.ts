import type { TrendingVelocityData } from "@/actions/articles";

export interface DashboardArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: Date | string | null;
  createdAt: Date | string;
}

export interface AdminDashboardProps {
  trendingData: TrendingVelocityData;
  features?: Record<string, boolean>;
  dataUnavailable?: boolean;
  stats: {
    published: number;
    drafts: number;
    pending: number;
    journalists: number;
    activeBreaking: number;
    activePolls: number;
    pendingComments: number;
  };
  recentArticles: DashboardArticle[];
  pendingReviews: Pick<DashboardArticle, "id" | "title" | "slug" | "status" | "createdAt">[];
  activeBreakingList: { id: string; headline: string; priority: number; createdAt: Date | string }[];
  featuredPoll: { id: string; question: string; options: string[]; votes: number[]; totalVotes: number } | null;
  categoryBreakdown: { name: string; count: number }[];
}

export function filterDashboardArticles(articles: DashboardArticle[], query: string, status: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return articles.filter((article) =>
    (status === "all" || article.status === status) &&
    (!normalized || article.title.toLocaleLowerCase().includes(normalized)),
  );
}

export function dashboardPercentage(value: number, total: number) {
  return total > 0 ? Math.min(100, Math.max(0, Math.round((value / total) * 100))) : 0;
}
