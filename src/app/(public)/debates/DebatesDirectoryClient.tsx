"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Vote,
  MessageSquare,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import type { DebateSummaryItem } from "@/actions/debates";
import { toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";

interface DebatesDirectoryClientProps {
  initialDebates: DebateSummaryItem[];
}

export function DebatesDirectoryClient({ initialDebates }: DebatesDirectoryClientProps) {
  const [debates, setDebates] = useState<DebateSummaryItem[]>(initialDebates);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(debates.map((d) => d.category)));

  const filteredDebates = debates.filter((d) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && d.isActive) ||
      (statusFilter === "archived" && !d.isActive);

    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const featuredDebate = debates.find((d) => d.isFeatured && d.isActive) || debates[0];

  const totalVotesAcrossAll = debates.reduce((acc, curr) => acc + curr.totalVotes, 0);
  const totalArgumentsAcrossAll = debates.reduce((acc, curr) => acc + curr.argumentsCount, 0);

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
        <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">মতামত ও বিতর্ক ফোরাম</span>
      </nav>

      {/* Main Page Header */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>জনমত ও গণতন্ত্র কর্নার</span>
            </div>
            <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)]">
              সাপ্তাহিক সম্পাদকীয় মতামত জরিপ ও লাইভ বিতর্ক ফোরাম
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl leading-relaxed">
              সমসাময়িক জাতীয়, রাজনৈতিক, অর্থনৈতিক ও সামাজিক নীতি-নির্ধারণী বিষয়ে পাঠকদের সরাসরি ভোট ও যুক্তি-পাল্টা যুক্তি উপস্থাপনের মুক্ত নাগরিক প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Aggregate Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 text-center min-w-[110px]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">মোট বিতর্ক</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {toBengaliDigits(debates.length)} টি
              </span>
            </div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 text-center min-w-[120px]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">সংগৃহীত ভোট</span>
              <span className="text-lg font-bold text-[var(--color-text)]">
                {toBengaliDigits(totalVotesAcrossAll)}
              </span>
            </div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3.5 text-center min-w-[120px]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">উপস্থাপিত যুক্তি</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliDigits(totalArgumentsAcrossAll)} টি
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED WEEKLY DEBATE HERO BANNER */}
      {featuredDebate && (
        <div className="border-2 border-[var(--color-primary)] bg-[var(--color-bg)] p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              সাপ্তাহিক প্রধান বিতর্ক
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-[var(--color-primary)]">
              {featuredDebate.category}
            </span>
          </div>

          <h2 className="bengali-serif-headline text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors mb-3 leading-snug">
            <Link href={`/debates/${featuredDebate.slug || featuredDebate.id}`}>
              {featuredDebate.question}
            </Link>
          </h2>

          {featuredDebate.description && (
            <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-3xl leading-relaxed">
              {featuredDebate.description}
            </p>
          )}

          {/* Quick Vote Breakdown Bar */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-bold">
              {featuredDebate.options.map((opt, i) => (
                <span key={i} className="text-[var(--color-text)]">
                  {opt}: <strong className="font-mono">{toBengaliDigits(featuredDebate.percentages[i] || 0)}%</strong>
                </span>
              ))}
            </div>
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 flex overflow-hidden">
              {featuredDebate.options.map((opt, i) => {
                const colors = ["bg-emerald-600", "bg-red-600", "bg-amber-600"];
                const pct = featuredDebate.percentages[i] || 0;
                return (
                  <div
                    key={i}
                    className={`${colors[i % colors.length]} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${opt}: ${pct}%`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1 font-semibold text-[var(--color-text)]">
                <Users className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                মোট {toBengaliDigits(featuredDebate.totalVotes)} ভোটার
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[var(--color-text)]">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                {toBengaliDigits(featuredDebate.argumentsCount)} টি যুক্তি উপস্থাপিত
              </span>
            </div>

            <Link
              href={`/debates/${featuredDebate.slug || featuredDebate.id}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              <span>বিতর্কে অংশ নিন ও পূর্ণাঙ্গ যুক্তি পড়ুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-[var(--color-border)] pb-2 md:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            সকল বিতর্ক ({toBengaliDigits(debates.length)})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "active"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            চলমান বিতর্ক ({toBengaliDigits(debates.filter((d) => d.isActive).length)})
          </button>
          <button
            onClick={() => setStatusFilter("archived")}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "archived"
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            সম্পন্ন বিতর্ক ({toBengaliDigits(debates.filter((d) => !d.isActive).length)})
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="বিতর্কের বিষয় দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none w-56"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-1 text-xs font-semibold whitespace-nowrap border ${
                categoryFilter === "all"
                  ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              সব বিভাগ
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-semibold whitespace-nowrap border ${
                  categoryFilter === cat
                    ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DEBATES LISTING */}
      {filteredDebates.length === 0 ? (
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-12 text-center">
          <MessageSquare className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base text-[var(--color-text)] mb-1">
            কোনো বিতর্ক পাওয়া যায়নি
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            অন্য কোনো কিওয়ার্ড বা ফিল্টার ব্যবহার করে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDebates.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] p-6 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-[var(--color-primary)]">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                        item.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {item.isActive ? "● চলমান" : "○ সম্পন্ন"}
                    </span>
                  </div>

                  <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {formatBengaliDate(new Date(item.createdAt))}
                  </span>
                </div>

                <h3 className="bengali-serif-headline text-lg sm:text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug mb-3">
                  <Link href={`/debates/${item.slug || item.id}`}>{item.question}</Link>
                </h3>

                {item.description && (
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Percentage preview bars */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-text-muted)]">
                    <span>{item.options[0]}: {toBengaliDigits(item.percentages[0] || 0)}%</span>
                    <span>{item.options[1]}: {toBengaliDigits(item.percentages[1] || 0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 flex overflow-hidden">
                    <div
                      className="bg-emerald-600"
                      style={{ width: `${item.percentages[0] || 0}%` }}
                    />
                    <div
                      className="bg-red-600"
                      style={{ width: `${item.percentages[1] || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Metadata & Link */}
              <div className="border-t border-[var(--color-border)] pt-3 mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    {toBengaliDigits(item.totalVotes)} ভোট
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {toBengaliDigits(item.argumentsCount)} টি যুক্তি
                  </span>
                </div>

                <Link
                  href={`/debates/${item.slug || item.id}`}
                  className="font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                >
                  <span>বিতর্ক পড়ুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
