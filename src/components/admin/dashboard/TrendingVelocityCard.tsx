"use client";

import { useState, useEffect, useCallback } from "react";
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
  Sparkles,
  ArrowUpRight,
  Edit3,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
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
  const [data, setData] = useState(initialData);
  const [activeReaders, setActiveReaders] = useState(initialData.activeReaders);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featuredId, setFeaturedId] = useState<string | null>(
    initialData.trendingStories.find((s) => s.isFeatured)?.id || null
  );

  // Authentic live polling from database telemetry (every 15 seconds)
  const fetchRealtimeData = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/realtime", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as TrendingVelocityData;
        setData(fresh);
        setActiveReaders(fresh.activeReaders);
      }
    } catch (err) {
      console.warn("Real-time telemetry poll failed:", err);
    }
  }, []);

  useEffect(() => {
    // 15-second background synchronization with database
    const interval = setInterval(fetchRealtimeData, 15000);
    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  // Filter or sort stories based on active tab
  const displayedStories = [...data.trendingStories].sort((a, b) => {
    if (activeTab === "today" || activeTab === "allTime") {
      return b.viewCount - a.viewCount;
    }
    return b.velocityPerHour - a.velocityPerHour;
  });

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
            ? `"${story.title.slice(0, 30)}..." is now pinned as Homepage Lead Story!`
            : `"${story.title.slice(0, 30)}..." সফলভাবে হোমপেজের শীর্ষে (Lead Story) পিন করা হয়েছে!`
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
            ? `Pushed to live Breaking News Ticker!`
            : `সংবাদটি সরাসরি ব্রেকিং নিউজ টিকারে যুক্ত করা হয়েছে!`
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
    <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded-xl overflow-hidden shadow-xs space-y-0 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2 px-3.5 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={15} className="text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Section: Real-Time Traffic Velocity Radar */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Flame size={18} className="animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <span>{isEn ? "Trending Stories & Real-Time Traffic Velocity" : "ট্রেন্ডিং সংবাদ ও রিয়েল-টাইম ট্র্যাফিক ভেলোসিটি"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  LIVE RADAR
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setIsRefreshing(true);
                    await fetchRealtimeData();
                    setTimeout(() => setIsRefreshing(false), 500);
                  }}
                  disabled={isRefreshing}
                  className="p-1 rounded-md hover:bg-[var(--color-bg)] border border-transparent hover:border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                  title={isEn ? "Refresh live telemetry" : "লাইভ ডাটা রিফ্রেশ করুন"}
                >
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin text-rose-600" : ""} />
                </button>
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {isEn
                  ? "Chartbeat-style audience momentum radar with 1-click editorial distribution actions"
                  : "লাইভ পাঠক স্পীড, দ্রুততম গতিতে পড়া সংবাদ ও এক-ক্লিকে হোমপেজ লিড নির্ধারণ"}
              </p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[var(--color-bg)] p-1 rounded-lg border border-[var(--color-border)] shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("velocity")}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                activeTab === "velocity"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "Hourly Speed" : "ঘণ্টার গতি"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                activeTab === "today"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "Today's Top" : "আজকের সেরা"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("allTime")}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                activeTab === "allTime"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isEn ? "Popular" : "জনপ্রিয়"}
            </button>
          </div>
        </div>

        {/* Live Traffic Metric Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Active Concurrent Readers */}
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                {isEn ? "Live Active Readers" : "অনলাইনে সক্রিয় পাঠক"}
              </span>
              <Activity size={13} className="text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[var(--color-text)] font-mono">
              {formatNumber(activeReaders)}
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)]">
              {isEn ? "Concurrent visitors right now" : "এই মুহূর্তে পোর্টাল পড়ছেন"}
            </div>
          </div>

          {/* Traffic Velocity Surge Multiplier */}
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <Flame size={13} />
                {isEn ? "Velocity Momentum" : "গতির সূচক (Surge)"}
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-600">
                {data.trafficVelocityRating}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {data.trafficMultiplier}x
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)]">
              {isEn ? "Above normal baseline" : "স্বাভাবিকের চেয়ে গতি বৃদ্ধি"}
            </div>
          </div>

          {/* Today's Total News Views */}
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">
                {isEn ? "24h Total Views" : "২৪ ঘণ্টার মোট ভিউ"}
              </span>
              <Eye size={13} className="text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[var(--color-text)] font-mono">
              {formatNumber(data.todayTotalViews)}
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)]">
              {isEn ? "Article impressions" : "মোট পেজ প্রদর্শনী"}
            </div>
          </div>

          {/* Today's News Output Target */}
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">
                {isEn ? "Today's Output" : "আজকের প্রকাশনা"}
              </span>
              <Layers size={13} className="text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[var(--color-text)] font-mono">
              {formatNumber(data.todayPublishedCount)} / {formatNumber(15)}
            </div>
            <div className="text-[10px] text-[var(--color-text-muted)]">
              {isEn ? "Target: 15 stories daily" : "দৈনিক টার্গেটের অগ্রগতি"}
            </div>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="divide-y divide-[var(--color-border)]">
        {displayedStories.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            {isEn ? "No trending stories recorded yet." : "বর্তমানে কোনো ট্রেন্ডিং সংবাদ নেই।"}
          </div>
        ) : (
          displayedStories.map((story, idx) => {
            const isTopRank = idx === 0;
            const rankNumber = idx + 1;
            const isStoryLead = featuredId === story.id || story.isFeatured;

            return (
              <div
                key={story.id}
                className="p-3.5 sm:p-4 hover:bg-[var(--color-bg-secondary)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Left: Rank & Title & Meta */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      rankNumber === 1
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs"
                        : rankNumber === 2
                        ? "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-xs"
                        : rankNumber === 3
                        ? "bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-xs"
                        : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {rankNumber === 1 ? <Flame size={14} /> : rankNumber}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {story.categoryName}
                      </span>

                      {isStoryLead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                          <Pin size={10} />
                          {isEn ? "Homepage Lead" : "হোমপেজ শীর্ষ খবর"}
                        </span>
                      )}

                      {story.isBreaking && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                          <Zap size={10} />
                          {isEn ? "Breaking" : "ব্রেকিং"}
                        </span>
                      )}

                      {/* Velocity Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400 font-mono">
                        <TrendingUp size={12} />
                        {isEn
                          ? `+${story.velocityPerHour} views/hr`
                          : `+${formatNumber(story.velocityPerHour)} ভিউ/ঘণ্টা`}
                      </span>

                      {/* Active Concurrent Readers on this specific Story */}
                      {story.activeReaders && story.activeReaders > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {isEn
                            ? `${story.activeReaders} reading now`
                            : `${formatNumber(story.activeReaders)} জন লাইভ পড়ছেন`}
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={`/news/${story.slug}`}
                      target="_blank"
                      className="text-xs sm:text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 block leading-snug"
                    >
                      {story.title}
                    </Link>

                    {/* Relative Momentum Bar */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="w-32 sm:w-44 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            rankNumber === 1
                              ? "bg-rose-500"
                              : rankNumber === 2
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.max(10, story.momentumPercent)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {formatNumber(story.viewCount)} {isEn ? "views" : "পাঠক"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: 1-Click Editorial Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] justify-end">
                  {/* Make Lead Story Button */}
                  <button
                    type="button"
                    onClick={() => handleMakeLead(story)}
                    disabled={actionLoading !== null || isStoryLead}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                      isStoryLead
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 cursor-default"
                        : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-amber-500 text-[var(--color-text)] hover:text-amber-600"
                    }`}
                    title={isEn ? "Promote this trending story to Homepage Lead" : "হোমপেজের প্রধান লিড সংবাদ হিসেবে পিন করুন"}
                  >
                    <Pin size={12} className={isStoryLead ? "text-amber-600" : ""} />
                    <span>
                      {actionLoading === `lead-${story.id}`
                        ? "..."
                        : isStoryLead
                        ? isEn
                          ? "Current Lead"
                          : "বর্তমান লিড"
                        : isEn
                        ? "Make Lead"
                        : "লিড বানান"}
                    </span>
                  </button>

                  {/* Push to Breaking Ticker */}
                  <button
                    type="button"
                    onClick={() => handlePushBreaking(story)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-red-500 text-[var(--color-text)] hover:text-red-600 transition-colors cursor-pointer"
                    title={isEn ? "Send headline to active Breaking News Ticker" : "ব্রেকিং নিউজ টিকারে যুক্ত করুন"}
                  >
                    <Zap size={12} className="text-red-600" />
                    <span>{actionLoading === `breaking-${story.id}` ? "..." : isEn ? "Breaking" : "ব্রেকিং"}</span>
                  </button>

                  {/* Send Push Notification shortcut */}
                  <Link
                    href={`/admin/notifications?title=${encodeURIComponent(story.title)}&url=${encodeURIComponent(`/news/${story.slug}`)}`}
                    className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-blue-600 transition-colors"
                    title={isEn ? "Compose Push Notification" : "পুশ নোটিফিকেশন পাঠান"}
                  >
                    <Bell size={13} />
                  </Link>

                  {/* Edit Story */}
                  <Link
                    href={`/admin/articles/${story.id}/edit`}
                    className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    title={isEn ? "Edit Story" : "সম্পাদনা করুন"}
                  >
                    <Edit3 size={13} />
                  </Link>

                  {/* View Live */}
                  <Link
                    href={`/news/${story.slug}`}
                    target="_blank"
                    className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    title={isEn ? "View live article" : "লাইভ সংবাদ দেখুন"}
                  >
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
