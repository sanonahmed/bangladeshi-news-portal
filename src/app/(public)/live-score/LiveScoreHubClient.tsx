"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Activity,
  Calendar,
  MapPin,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Radio,
} from "lucide-react";
import { INITIAL_MATCHES, type LiveMatch, type SportType, type MatchStatus } from "@/lib/sports-data";
import { toBengaliDigits } from "@/lib/bengali-date";

interface LiveScoreHubClientProps {
  initialMatches: LiveMatch[];
}

export function LiveScoreHubClient({ initialMatches }: LiveScoreHubClientProps) {
  const [matches, setMatches] = useState<LiveMatch[]>(initialMatches);
  const [sportFilter, setSportFilter] = useState<"all" | SportType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("এইমাত্র");

  const fetchLiveMatches = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/live-score");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
          setLastRefreshed("এইমাত্র");
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLiveMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesSport = sportFilter === "all" || m.sport === sportFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSport && matchesStatus;
  });

  const totalLive = matches.filter((m) => m.status === "live").length;
  const totalCricket = matches.filter((m) => m.sport === "cricket").length;
  const totalFootball = matches.filter((m) => m.sport === "football").length;

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[var(--color-text-muted)] flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold">লাইভ স্পোর্টস স্কোরবোর্ড</span>
        </div>

        <Link
          href="/category/sports"
          className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          <span>সকল খেলাধুলার সংবাদ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Main Header Card */}
      <div className="bg-[#0f1115] text-white border-2 border-zinc-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>লাইভ স্পোর্টস হাব</span>
            </div>
            <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              লাইভ ক্রিকেট ও ফুটবল স্কোরবোর্ড
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              বাংলাদেশ জাতীয় দল, এনসিএল, আন্তর্জাতিক ক্রিকেট এবং বিশ্ব ফুটবলের লাইভ রান, ওভার, কমেন্ট্রি ও রিয়েল-টাইম বল-বাই-বল ট্র্যাকার।
            </p>
            <div className="flex items-center gap-3 pt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                <span>রিয়েলটাইম ওপেন স্পোর্টস এপিআই সংযুক্ত</span>
              </span>
              <button
                onClick={fetchLiveMatches}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold border border-zinc-700 transition cursor-pointer"
              >
                <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
                <span>তাজা করুন</span>
              </button>
            </div>
          </div>

          {/* Quick Aggregate Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 text-center min-w-[100px]">
              <span className="text-[11px] text-zinc-400 block">লাইভ ম্যাচ</span>
              <span className="text-lg font-bold text-red-500 font-mono">
                {toBengaliDigits(totalLive)} টি
              </span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 text-center min-w-[100px]">
              <span className="text-[11px] text-zinc-400 block">ক্রিকেট</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {toBengaliDigits(totalCricket)} টি
              </span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 text-center min-w-[100px]">
              <span className="text-[11px] text-zinc-400 block">ফুটবল</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {toBengaliDigits(totalFootball)} টি
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        {/* Sport Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSportFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              sportFilter === "all"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            সকল খেলা ({toBengaliDigits(matches.length)})
          </button>
          <button
            onClick={() => setSportFilter("cricket")}
            className={`px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              sportFilter === "cricket"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            🏏 ক্রিকেট ({toBengaliDigits(totalCricket)})
          </button>
          <button
            onClick={() => setSportFilter("football")}
            className={`px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              sportFilter === "football"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            ⚽ ফুটবল ({toBengaliDigits(totalFootball)})
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 text-xs font-semibold ${
              statusFilter === "all"
                ? "text-[var(--color-primary)] font-bold underline"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            সব স্ট্যাটাস
          </button>
          <span className="text-[var(--color-border-strong)]">|</span>
          <button
            onClick={() => setStatusFilter("live")}
            className={`px-2.5 py-1 text-xs font-semibold ${
              statusFilter === "live"
                ? "text-red-600 font-bold underline"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            🔴 লাইভ
          </button>
          <span className="text-[var(--color-border-strong)]">|</span>
          <button
            onClick={() => setStatusFilter("upcoming")}
            className={`px-2.5 py-1 text-xs font-semibold ${
              statusFilter === "upcoming"
                ? "text-amber-600 font-bold underline"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            আসন্ন
          </button>
          <span className="text-[var(--color-border-strong)]">|</span>
          <button
            onClick={() => setStatusFilter("recent")}
            className={`px-2.5 py-1 text-xs font-semibold ${
              statusFilter === "recent"
                ? "text-zinc-600 font-bold underline"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            ফলাফল
          </button>
        </div>
      </div>

      {/* MATCH CARDS GRID */}
      {filteredMatches.length === 0 ? (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-12 text-center text-xs text-[var(--color-text-muted)]">
          নির্বাচিত ক্যাটাগরিতে এই মুহূর্তে কোনো ম্যাচ পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((m) => (
            <Link
              key={m.id}
              href={`/live-score/${m.id}`}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] p-5 transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Top Card Bar */}
                <div className="flex items-center justify-between text-xs mb-3 border-b border-[var(--color-border)] pb-2.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] uppercase">
                      {m.sport === "cricket" ? "🏏 ক্রিকেট" : "⚽ ফুটবল"}
                    </span>
                    <span className="font-semibold text-[11px] text-[var(--color-text-muted)] truncate">
                      {m.tournament}
                    </span>
                  </div>

                  {m.status === "live" ? (
                    <span className="bg-red-600 text-white font-mono font-extrabold text-[9px] px-1.5 py-0.5 rounded animate-pulse">
                      🔴 LIVE
                    </span>
                  ) : m.status === "upcoming" ? (
                    <span className="bg-amber-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                      {m.startTime}
                    </span>
                  ) : (
                    <span className="bg-zinc-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                      সমাপ্ত
                    </span>
                  )}
                </div>

                {/* Teams & Scores */}
                <div className="space-y-3 my-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{m.team1.flag}</span>
                      <span className="font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {m.team1.name}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-sm text-[var(--color-text)]">
                        {m.team1.score || "—"}
                      </span>
                      {m.team1.overs && (
                        <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
                          {m.team1.overs}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{m.team2.flag}</span>
                      <span className="font-bold text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {m.team2.name}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {m.team2.score || "—"}
                      </span>
                      {m.team2.overs && (
                        <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
                          {m.team2.overs}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Note */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-2 text-xs text-[var(--color-text-muted)] rounded-none mb-3">
                  <span className="text-amber-600 dark:text-amber-400 font-bold block truncate">
                    {m.statusNote}
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="border-t border-[var(--color-border)] pt-3 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 truncate max-w-[170px]">
                  <MapPin className="w-3 h-3 text-[var(--color-primary)] shrink-0" />
                  <span className="truncate">{m.venue.split(",")[0]}</span>
                </span>

                <span className="font-bold text-[var(--color-primary)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>লাইভ ট্র্যাকার</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
