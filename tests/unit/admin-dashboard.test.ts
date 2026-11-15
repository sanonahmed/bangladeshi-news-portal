import { describe, expect, it } from "vitest";
import {
  dashboardPercentage,
  filterDashboardArticles,
  type DashboardArticle,
} from "@/components/admin/dashboard/types";

const articles: DashboardArticle[] = [
  {
    id: "1",
    title: "Water taxi services expand",
    slug: "water",
    status: "published",
    viewCount: 120,
    createdAt: new Date(),
    publishedAt: new Date(),
  },
  {
    id: "2",
    title: "Pirojpur flood response",
    slug: "flood",
    status: "pending_review",
    viewCount: 75,
    createdAt: new Date(),
    publishedAt: null,
  },
  {
    id: "3",
    title: "Unpublished editorial notes",
    slug: "editorial",
    status: "draft",
    viewCount: 5,
    createdAt: new Date(),
    publishedAt: null,
  },
];

describe("dashboard helpers", () => {
  it("filters by title without changing the original list", () => {
    expect(
      filterDashboardArticles(articles, "  FLOOD ", "all").map(
        (article) => article.id,
      ),
    ).toEqual(["2"]);
    expect(
      filterDashboardArticles(articles, "", "draft").map(
        (article) => article.id,
      ),
    ).toEqual(["3"]);
    expect(
      filterDashboardArticles(articles, "water", "pending_review"),
    ).toEqual([]);
    expect(articles).toHaveLength(3);
  });

  it("calculates bounded percentages and handles zero totals", () => {
    expect(dashboardPercentage(25, 100)).toBe(25);
    expect(dashboardPercentage(1, 3)).toBe(33);
    expect(dashboardPercentage(-5, 100)).toBe(0);
    expect(dashboardPercentage(140, 100)).toBe(100);
    expect(dashboardPercentage(10, 0)).toBe(0);
  });
});
