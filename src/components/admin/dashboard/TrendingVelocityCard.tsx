"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Pin,
  Bell,
  Eye,
  Clock,
  ExternalLink,
  Flame,
  Activity,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  SlidersHorizontal,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { formatRelativeBengali } from "@/lib/bengali-date";
import {
  setArticleAsHomepageLead,
  sendArticleToBreakingTicker,
  type TrendingStoryItem,
  type TrendingVelocityData,
} from "@/actions/articles";

interface TrendingVelocityCardProps {
  initialData: TrendingVelocityData;
}

export function TrendingVelocityCard({ initialData }: TrendingVelocityCardProps) {
  const { language, formatNumber } = useAdminLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"velocity" | "today" | "allTime">("velocity");
  const [data, setData] = useState<TrendingVelocityData>(initialData);
  const [activeReaders, setActiveReaders] = useState<number>(initialData.activeReaders);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [featuredId, setFeaturedId] = useState<string | null>(
    initialData.trendingStories.find((s) => s.isFeatured)?.id || null
  );

  // Background telemetry synchronization (every 15 seconds)
  const fetchRealtimeData = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/realtime", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as TrendingVelocityData;
        setData(fresh);
        setActiveReaders(fresh.activeReaders);
        setLastSyncTime(new Date());
        setSecondsAgo(0);
      }
    } catch (err) {
      console.warn("Real-time telemetry poll failed:", err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchRealtimeData, 15000);
    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  // Seconds counter since last sync
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Extract unique categories from stories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    for (const story of data.trendingStories) {
      if (story.categoryName) set.add(story.categoryName);
    }
    return Array.from(set);
  }, [data.trendingStories]);

  // Find maximum velocity for relative momentum bar scaling
  const maxVelocity = useMemo(() => {
    return Math.max(1, ...data.trendingStories.map((s) => s.velocityPerHour || 0));
  }, [data.trendingStories]);

  // Filter and sort stories
  const displayedStories = useMemo(() => {
    let list = [...data.trendingStories];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.categoryName?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      list = list.filter((s) => s.categoryName === selectedCategory);
    }

    // Sort according to active tab
    return list.sort((a, b) => {
      if (activeTab === "today" || activeTab === "allTime") {
        return b.viewCount - a.viewCount;
      }
      return (b.velocityPerHour || 0) - (a.velocityPerHour || 0);
    });
  }, [data.trendingStories, searchQuery, selectedCategory, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  async function handleMakeLead(story: TrendingStoryItem) {
    setActionLoading(`lead-${story.id}`);
    try {
      const res = await setArticleAsHomepageLead(story.id);
      if (res.success) {
        setFeaturedId(story.id);
        showToast(
          isEn
            ? `"${story.title.slice(0, 32)}..." pinned as Homepage Lead`
            : `"${story.title.slice(0, 32)}..." প্রধান লিড সংবাদ হিসেবে পিন করা হয়েছে`
        );
      } else {
        showToast(res.error || "Failed to set lead story");
      }
    } catch {
      showToast("Error setting lead story");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePushBreaking(story: TrendingStoryItem) {
    setActionLoading(`breaking-${story.id}`);
    try {
      const res = await sendArticleToBreakingTicker(story.id);
      if (res.success) {
        showToast(
          isEn
            ? "Pushed to live Breaking News Ticker"
            : "সংবাদটি সরাসরি ব্রেকিং নিউজ টিকারে যুক্ত করা হয়েছে"
        );
      } else {
        showToast(res.error || "Failed to push to breaking news");
      }
    } catch {
      showToast("Error pushing to breaking news");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
      {/* A quiet live pulse complements, rather than replaces, status text. */}
      {toastMessage && (
        <div className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-xl dark:border-emerald-400/20 dark:bg-slate-900 dark:text-slate-200" role="status">
          <CheckCircle2 size={14} className="text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] bg-slate-50/50 px-5 py-5 dark:bg-white/[0.025] sm:flex-row sm:items-center sm:px-6">
        {/* Left: Terminal Identity & Live Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
            <Activity size={16} />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{isEn ? "Audience intelligence" : "পাঠকের তথ্য"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-bold tracking-tight text-[var(--color-text)]">
                {isEn ? "Real-Time Traffic & Velocity" : "রিয়েল-টাইম ট্রাফিক ও সংবাদ ভেলোসিটি"}
              </h2>
              {/* Live Network Pulse */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
                <span className={`relative inline-flex size-2 rounded-full ${isRefreshing ? "bg-slate-400" : "bg-emerald-500"}`}></span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">
              <span>
                {isEn ? "Telemetry sync:" : "টেলিমেট্রি সিঙ্ক:"} {secondsAgo}s {isEn ? "ago" : "আগে"}
              </span>
              <span>•</span>
              {/* Velocity Momentum Pill */}
              {data.trafficVelocityRating === "viral" ? (
                <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <Flame size={12} />
                  <span>{isEn ? "Viral Surge Active" : "উচ্চ ভাইরাল বেগ"}</span>
                </span>
              ) : data.trafficVelocityRating === "surging" ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>{isEn ? "Traffic Surging" : "ঊর্ধ্বমুখী গতি"}</span>
                </span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  {isEn ? "Normal Baseline" : "স্বাভাবিক প্রবাহ"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Manual Refresh & Tab Sort */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Sort Controls */}
          <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-0.5 text-xs" role="tablist" aria-label={isEn ? "Sort trending stories" : "ট্রেন্ডিং সংবাদ সাজান"} onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const tabs = ["velocity", "today", "allTime"] as const;
            const current = tabs.indexOf(activeTab);
            const next = (event.key === "ArrowLeft" ? (current + 2) % 3 : event.key === "ArrowRight" ? (current + 1) % 3 : 0) as 0 | 1 | 2;
            const newTab = tabs[next];
            setActiveTab(newTab);
            document.getElementById(`tab-${newTab}`)?.focus();
          }}>
            <button
            role="tab"
            aria-selected={activeTab === "velocity"}
            aria-controls="trending-panel"
            id="tab-velocity"
            tabIndex={activeTab === "velocity" ? 0 : -1}
            type="button"
              onClick={() => setActiveTab("velocity")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === "velocity"
                  ? "bg-[var(--color-primary)] text-white shadow-2xs font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "Velocity" : "গতিবেগ"}
            </button>
            <button
              role="tab"
              id="tab-today"
              aria-controls="trending-panel"
              aria-selected={activeTab === "today"}
              tabIndex={activeTab === "today" ? 0 : -1}
              type="button"
              onClick={() => setActiveTab("today")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === "today"
                  ? "bg-[var(--color-primary)] text-white shadow-2xs font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "24h Top" : "আজকের সেরা"}
            </button>
            <button
              id="tab-allTime"
              role="tab"
              aria-controls="trending-panel"
              aria-selected={activeTab === "allTime"}
              tabIndex={activeTab === "allTime" ? 0 : -1}
              type="button"
              onClick={() => setActiveTab("allTime")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                activeTab === "allTime"
                  ? "bg-[var(--color-primary)] text-white shadow-2xs font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "Popular" : "জনপ্রিয়"}
            </button>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={async () => {
              setIsRefreshing(true);
              await fetchRealtimeData();
              setTimeout(() => setIsRefreshing(false), 400);
            }}
            disabled={isRefreshing}
            className="p-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            title={isEn ? "Force refresh telemetry" : "টেলিমেট্রি রিফ্রেশ করুন"}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[var(--color-primary)]" : ""} />
          </button>
        </div>
      </div>

      {/* Integrated Editorial Telemetry Strip (Monospace Data Bar) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 divide-x divide-[var(--color-border)]">
        {/* 1. Concurrent Active Readers */}
        <div className="p-3 sm:px-4 sm:py-2.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>{isEn ? "Active Readers" : "অনলাইনে সক্রিয়"}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-[var(--color-text)] tabular-nums">
              {formatNumber(activeReaders)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {isEn ? "concurrent" : "জন সরাসরি"}
            </span>
          </div>
        </div>

        {/* 2. Velocity Multiplier */}
        <div className="p-3 sm:px-4 sm:py-2.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>{isEn ? "Velocity Momentum" : "গতির সূচক"}</span>
            <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
              {data.trafficVelocityRating}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {data.trafficMultiplier}x
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {isEn ? "vs baseline" : "স্বাভাবিকের তুলনায়"}
            </span>
          </div>
        </div>

        {/* 3. Total Views Today */}
        <div className="p-3 sm:px-4 sm:py-2.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>{isEn ? "24h Impressions" : "২৪ ঘণ্টার মোট ভিউ"}</span>
            <Eye size={12} className="text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-[var(--color-text)] tabular-nums">
              {formatNumber(data.todayTotalViews)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {isEn ? "reads" : "প্রদর্শনী"}
            </span>
          </div>
        </div>

        {/* 4. Output Target Progress */}
        <div className="p-3 sm:px-4 sm:py-2.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>{isEn ? "Editorial Output" : "আজকের প্রকাশনা"}</span>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)]">Target: 15</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-[var(--color-text)] tabular-nums">
              {formatNumber(data.todayPublishedCount)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              / {formatNumber(15)} {isEn ? "stories" : "টি সংবাদ"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Filter Bar (Search + Category Filter) */}
      <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Filter stories by headline or desk..." : "সংবাদের শিরোনাম বা বিভাগ দিয়ে ফিল্টার করুন..."}
            className="w-full pl-8 pr-3 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        {/* Category Filter & Count */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {categoriesList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-[var(--color-text-muted)]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-2 py-1 text-xs text-[var(--color-text)] focus:outline-hidden cursor-pointer"
              >
                <option value="all">{isEn ? "All Desks" : "সকল বিভাগ"}</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
            {formatNumber(displayedStories.length)} {isEn ? "stories" : "টি সংবাদ"}
          </span>
        </div>
      </div>

      {/* Stories Feed (High-Density Newsroom Rows) */}
      <div className="divide-y divide-[var(--color-border)]">
        {displayedStories.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] space-y-1">
            <p className="font-semibold">
              {searchQuery || selectedCategory !== "all"
                ? isEn
                  ? "No stories matched your filter criteria."
                  : "কোনো সংবাদ পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
                : isEn
                ? "No trending stories recorded yet."
                : "বর্তমানে কোনো সক্রিয় ট্রেন্ডিং সংবাদ নেই।"}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-[var(--color-primary)] hover:underline font-mono text-xs cursor-pointer"
              >
                {isEn ? "Clear filters" : "সব ফিল্টার মুছে ফেলুন"}
              </button>
            )}
          </div>
        ) : (
          displayedStories.map((story, idx) => {
            const rank = idx + 1;
            const isStoryLead = featuredId === story.id || story.isFeatured;
            const velocity = story.velocityPerHour || 0;
            const momentumPercent = Math.min(100, Math.round((velocity / maxVelocity) * 100));

            return (
              <div
                key={story.id}
                className={`p-3 sm:px-4 sm:py-3 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                  isStoryLead
                    ? "bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                    : "hover:bg-[var(--color-bg-secondary)]/60"
                }`}
              >
                {/* Left Column: Rank Index, Headline & Metadata */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Monospace Rank Index */}
                  <div className="w-6 shrink-0 pt-0.5 text-center">
                    <span
                      className={`font-mono text-xs font-black tabular-nums ${
                        rank === 1
                          ? "text-rose-600 dark:text-rose-400"
                          : rank <= 3
                          ? "text-[var(--color-text)]"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      #{rank < 10 ? `0${rank}` : rank}
                    </span>
                  </div>

                  {/* Story Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Metadata Header Line */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {/* Desk / Category Badge */}
                      <span className="font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono">
                        {story.categoryName}
                      </span>

                      {/* Lead Story Status Badge */}
                      {isStoryLead && (
                        <span className="inline-flex items-center gap-1 font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white shadow-2xs">
                          <Pin size={9} />
                          <span>{isEn ? "Lead Story" : "প্রধান লিড"}</span>
                        </span>
                      )}

                      {/* Breaking Story Status Badge */}
                      {story.isBreaking && (
                        <span className="inline-flex items-center gap-1 font-bold px-1.5 py-0.2 rounded bg-red-600 text-white shadow-2xs">
                          <Zap size={9} />
                          <span>{isEn ? "Breaking" : "ব্রেকিং"}</span>
                        </span>
                      )}

                      {/* Velocity Metric Badge */}
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400">
                        <TrendingUp size={11} />
                        <span>+{formatNumber(velocity)}/hr</span>
                      </span>

                      {/* Active Concurrent Readers on this specific Story */}
                      {story.activeReaders && story.activeReaders > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>
                            {formatNumber(story.activeReaders)} {isEn ? "reading" : "জন সক্রিয়"}
                          </span>
                        </span>
                      ) : null}

                      {/* Published relative time */}
                      {story.publishedAt && (
                        <span className="text-[var(--color-text-muted)] font-mono ml-auto sm:ml-0">
                          {formatRelativeBengali(new Date(story.publishedAt))}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <Link
                      href={`/news/${story.slug}`}
                      target="_blank"
                      className="text-xs sm:text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 block leading-snug tracking-tight"
                    >
                      {story.title}
                    </Link>

                    {/* Precision Momentum Meter Strip */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="w-24 sm:w-36 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                        <div
                          className={`h-full transition-all duration-300 ${
                            rank === 1
                              ? "bg-rose-600"
                              : rank <= 3
                              ? "bg-amber-500"
                              : "bg-[var(--color-primary)]"
                          }`}
                          style={{ width: `${Math.max(6, momentumPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {formatNumber(story.viewCount)} {isEn ? "views" : "পাঠক"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editorial Control Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] justify-end">
                  {/* Pin as Lead Story Button */}
                  <button
                    type="button"
                    onClick={() => handleMakeLead(story)}
                    disabled={actionLoading !== null || isStoryLead}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border transition-all cursor-pointer ${
                      isStoryLead
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 cursor-default"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-amber-500 text-[var(--color-text)] hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                    }`}
                    title={isEn ? "Pin as Lead Story on Homepage" : "হোমপেজের প্রধান লিড সংবাদ হিসেবে পিন করুন"}
                  >
                    <Pin size={11} className={isStoryLead ? "text-amber-600 fill-amber-600" : ""} />
                    <span>
                      {actionLoading === `lead-${story.id}`
                        ? "..."
                        : isStoryLead
                        ? isEn
                          ? "Current Lead"
                          : "শীর্ষ লিড"
                        : isEn
                        ? "Make Lead"
                        : "লিড বানান"}
                    </span>
                  </button>

                  {/* Push to Breaking Ticker Button */}
                  <button
                    type="button"
                    onClick={() => handlePushBreaking(story)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-red-500 text-[var(--color-text)] hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    title={isEn ? "Push headline to active Breaking Ticker" : "ব্রেকিং নিউজ টিকারে যুক্ত করুন"}
                  >
                    <Zap size={11} className="text-red-600" />
                    <span>{actionLoading === `breaking-${story.id}` ? "..." : isEn ? "Breaking" : "ব্রেকিং"}</span>
                  </button>

                  {/* Icon Buttons Group */}
                  <div className="flex items-center border-l border-[var(--color-border)] pl-1 ml-0.5">
                    {/* Send Notification */}
                    <Link
                      href={`/admin/notifications?title=${encodeURIComponent(story.title)}&url=${encodeURIComponent(`/news/${story.slug}`)}`}
                      className="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-blue-600 transition-colors"
                      title={isEn ? "Compose notification for this story" : "পুশ নোটিফিকেশন পাঠান"}
                    >
                      <Bell size={12} />
                    </Link>

                    {/* Edit Story in CMS */}
                    <Link
                      href={`/admin/articles/${story.id}/edit`}
                      className="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      title={isEn ? "Edit story in CMS" : "নিউজরুমে সম্পাদনা করুন"}
                    >
                      <Edit3 size={12} />
                    </Link>

                    {/* View Live Article */}
                    <Link
                      href={`/news/${story.slug}`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      title={isEn ? "Open live article" : "লাইভ প্রতিবেদন দেখুন"}
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
