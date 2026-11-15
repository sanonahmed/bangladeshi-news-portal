"use client";

import { useEffect, useState } from "react";
import { AdminDashboardClient } from "@/app/admin/AdminDashboardClient";
import type { AdminDashboardProps } from "@/components/admin/dashboard/types";

const articles: AdminDashboardProps["recentArticles"] = [
  {
    id: "1",
    title:
      "Pirojpur launches water taxi service, easing travel during monsoon season",
    slug: "weather-taxi-pirojpur",
    status: "published",
    viewCount: 8470,
    createdAt: "2026-11-15T08:30:00Z",
    publishedAt: "2026-11-15T10:30:00Z",
  },
  {
    id: "2",
    title:
      "Bangladesh's emerging technology hubs attract new international investment",
    slug: "technology-investment",
    status: "pending_review",
    viewCount: 4120,
    createdAt: "2026-11-15T07:30:00Z",
    publishedAt: null,
  },
  {
    id: "3",
    title:
      "Youth-led community initiative brings resilient farming to coastal districts",
    slug: "resilient-farming",
    status: "draft",
    viewCount: 0,
    createdAt: "2026-11-14T09:00:00Z",
    publishedAt: null,
  },
  {
    id: "4",
    title:
      "National football squad prepares for a decisive regional championship",
    slug: "regional-football",
    status: "published",
    viewCount: 12525,
    createdAt: "2026-11-14T06:00:00Z",
    publishedAt: "2026-11-14T11:00:00Z",
  },
];

export function DashboardPreview() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);
  const trendingData: AdminDashboardProps["trendingData"] = {
    activeReaders: 247,
    trafficVelocityRating: "surging",
    trafficMultiplier: 1.8,
    todayTotalViews: 42015,
    todayPublishedCount: 14,
    trendingStories: articles
      .slice(0, 3)
      .map((article, index) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        viewCount: article.viewCount,
        publishedAt: article.publishedAt,
        categoryName: "National",
        categorySlug: "national",
        isFeatured: index === 0,
        isBreaking: index === 1,
        velocityPerHour: Math.round(48 / (index + 1)),
        momentumPercent: 180 - index * 40,
        activeReaders: 50 - index * 10,
      })),
  };
  const stats = {
    published: 248,
    drafts: 12,
    pending: 7,
    journalists: 24,
    activeBreaking: 2,
    activePolls: 3,
    pendingComments: 18,
  };
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900 dark:bg-[#0d1119] dark:text-white">
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xs font-semibold">
          Isolated dashboard preview · sample content
        </span>
        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="rounded-lg border px-3 py-2 text-xs"
        >
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </div>
      <main className="p-4 sm:p-6 lg:p-8">
        <AdminDashboardClient
          dataUnavailable={false}
          features={{}}
          stats={stats}
          recentArticles={articles}
          pendingReviews={articles.filter((a) => a.status === "pending_review")}
          activeBreakingList={[
            {
              id: "1",
              headline:
                "Coastal ferry operations resume after improved weather",
              priority: 1,
              createdAt: "2026-11-15T10:00:00Z",
            },
            {
              id: "2",
              headline: "Live updates: Parliament budget session underway",
              priority: 2,
              createdAt: "2026-11-15T10:30:00Z",
            },
          ]}
          featuredPoll={{
            id: "1",
            question:
              "What is the most important priority for Bangladesh's digital future?",
            options: ["Infrastructure", "Media literacy", "Innovation"],
            votes: [480, 260, 120],
            totalVotes: 860,
          }}
          categoryBreakdown={[
            { name: "National", count: 90 },
            { name: "World", count: 68 },
            { name: "Sports", count: 53 },
            { name: "Technology", count: 37 },
          ]}
          trendingData={trendingData}
        />
      </main>
    </div>
  );
}
