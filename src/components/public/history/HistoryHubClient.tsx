"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Flag,
  Calendar,
  Share2,
  Check,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  Info,
} from "lucide-react";
import { TimeMachineCalendar } from "./TimeMachineCalendar";
import { LiberationWarArchiveView } from "./LiberationWarArchiveView";
import { toBengaliDigits, BENGALI_MONTHS, getDhakaDate } from "@/lib/bengali-date";
import type { HistoricalEventItem, SectorItem, BirSreshthoItem } from "@/types/history";
import { getEventsForDate } from "@/actions/history";

interface HistoryHubClientProps {
  initialEvents: HistoricalEventItem[];
  timelineEvents: HistoricalEventItem[];
  sectors: SectorItem[];
  birSreshthoList: BirSreshthoItem[];
  initialDay: number;
  initialMonth: number;
}

export function HistoryHubClient({
  initialEvents,
  timelineEvents,
  sectors,
  birSreshthoList,
  initialDay,
  initialMonth,
}: HistoryHubClientProps) {
  const [activeTab, setActiveTab] = useState<"this_day" | "liberation_war">("this_day");
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [events, setEvents] = useState<HistoricalEventItem[]>(initialEvents);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Month name
  const monthName = BENGALI_MONTHS[selectedMonth - 1] || "নভেম্বর";

  // Handle date change from time machine
  const handleDateChange = async (day: number, month: number) => {
    setSelectedDay(day);
    setSelectedMonth(month);
    setIsLoadingEvents(true);

    try {
      const fetched = await getEventsForDate(day, month);
      setEvents(fetched);
    } catch (err) {
      console.warn("Date change fetch error:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleShare = (ev: HistoricalEventItem) => {
    const text = `${ev.title} (${toBengaliDigits(ev.year)}) | দৈনিক বাংলাদেশ বার্তা ইতিহাস`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} - https://bangladeshi-news-portal.onrender.com/history`);
      setCopiedId(ev.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          হোম
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold">ঐতিহাসিক এই দিনে ও স্বাধীনতা আর্কাইভ</span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 p-6 sm:p-10 text-white shadow-xl mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-red-300 border border-red-500/30 mb-3">
            <Flag size={14} className="text-red-400" />
            <span>বাংলাদেশ বার্তা ডিজিটাল হেরিটেজ ও হিস্ট্রি ডেস্ক</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            ঐতিহাসিক এই দিনে ও স্বাধীনতা আর্কাইভ
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            ইতিহাসের স্মরণীয় ঘটনাপঞ্জি, ১৯৭১ সালের রক্তক্ষয়ী মুক্তিযুদ্ধের দিনলিপি, ১১টি সেক্টরের রণকৌশল ও ৭ জন বীরশ্রেষ্ঠের বীরত্বগাথা নিয়ে আমাদের বিশেষ ডিজিটাল আর্কাইভ।
          </p>

          {/* Quick tab switcher inside hero */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("this_day")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
                activeTab === "this_day"
                  ? "bg-red-600 text-white ring-2 ring-white/20"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <History size={16} />
              <span>আজকের এই দিনে ({toBengaliDigits(selectedDay)} {monthName})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("liberation_war")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
                activeTab === "liberation_war"
                  ? "bg-red-600 text-white ring-2 ring-white/20"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Award size={16} />
              <span>১৯৭১ মুক্তিযুদ্ধ ও বীরশ্রেষ্ঠ আর্কাইভ</span>
            </button>
          </div>
        </div>

        <History
          size={320}
          className="absolute -right-12 -bottom-20 text-white/5 pointer-events-none select-none"
        />
      </div>

      {/* TAB 1: THIS DAY IN HISTORY */}
      {activeTab === "this_day" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main events list (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                  ইতিহাসের টাইম মেশিন
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)]">
                  {toBengaliDigits(selectedDay)} {monthName}-এর ঐতিহাসিক ঘটনাবলী
                </h2>
              </div>
              <span className="text-xs text-[var(--color-text-muted)] font-semibold">
                {toBengaliDigits(events.length)} টি ঘটনা সংরক্ষিত
              </span>
            </div>

            {isLoadingEvents ? (
              <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
                ইতিহাসের পাতা উন্মোচিত হচ্ছে...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-center text-xs text-[var(--color-text-muted)]">
                এই নির্দিষ্ট তারিখে কোনো ঐতিহাসিক ঘটনা নথিবদ্ধ নেই। অনুগ্রহ করে অন্য দিন নির্বাচন করুন।
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm hover:shadow-md transition-all"
                  >
                    {item.imageUrl && (
                      <div className="relative h-60 sm:h-72 w-full bg-stone-900">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-black text-white shadow">
                            {toBengaliDigits(item.year)} সাল
                          </span>
                          <span className="rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
                            {item.category}
                          </span>
                        </div>
                        {item.imageCaption && (
                          <div className="absolute bottom-2 left-2 right-2 text-[11px] text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded">
                            {item.imageCaption}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5 sm:p-6">
                      {!item.imageUrl && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-black text-white shadow">
                            {toBengaliDigits(item.year)} সাল
                          </span>
                          <span className="rounded-lg bg-[var(--color-bg-secondary)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-border)]">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <h3 className="text-lg sm:text-xl font-extrabold text-[var(--color-text)] leading-snug">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-xs sm:text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>

                      {item.significance && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20 text-xs">
                          <strong className="text-red-600 dark:text-red-400 font-bold block mb-1">
                            ঐতিহাসিক গুরুত্ব ও প্রভাব:
                          </strong>
                          <p className="text-[var(--color-text)] leading-relaxed">
                            {item.significance}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:underline"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Share2 size={12} />
                              <span>শেয়ার করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Time Machine Date Picker (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <TimeMachineCalendar
              selectedDay={selectedDay}
              selectedMonth={selectedMonth}
              onDateChange={handleDateChange}
            />

            {/* Educational Info Card */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-text)]">
                <BookOpen size={15} className="text-[var(--color-primary)]" />
                <span>ইতিহাস আর্কাইভ তথ্য</span>
              </div>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                বাঙালি জাতির হাজার বছরের ঐতিহ্য, ১৯৫২-এর ভাষা আন্দোলন, ১৯৭১-এর মহান মুক্তিযুদ্ধ এবং স্বাধীন বাংলাদেশের গুরুত্বপূর্ণ বাঁকসমূহের ঐতিহাসিক প্রামাণ্য দলিল সংরক্ষণ করা আমাদের অঙ্গীকার।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIBERATION WAR & BIR SRESHTHO ARCHIVE */}
      {activeTab === "liberation_war" && (
        <LiberationWarArchiveView
          timelineEvents={timelineEvents}
          sectors={sectors}
          birSreshthoList={birSreshthoList}
        />
      )}
    </div>
  );
}
