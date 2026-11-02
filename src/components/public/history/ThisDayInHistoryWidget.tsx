"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Calendar, ArrowRight, Flag, Flame, Sparkles } from "lucide-react";
import { toBengaliDigits, BENGALI_MONTHS, getDhakaDate } from "@/lib/bengali-date";
import type { HistoricalEventItem } from "@/types/history";

interface ThisDayInHistoryWidgetProps {
  initialEvents: HistoricalEventItem[];
  className?: string;
}

export function ThisDayInHistoryWidget({
  initialEvents,
  className = "",
}: ThisDayInHistoryWidgetProps) {
  const [now] = useState<Date>(() => getDhakaDate());
  const currentDay = now.getDate();
  const currentMonthIdx = now.getMonth();
  const currentMonthName = BENGALI_MONTHS[currentMonthIdx] || "নভেম্বর";

  const event = initialEvents[0];

  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-stone-900 via-stone-800 to-red-950 p-5 text-white shadow-md relative overflow-hidden ${className}`}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
              <History size={16} />
            </span>
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                ইতিহাসের পাতা থেকে
              </span>
              <h3 className="text-sm font-extrabold text-white">
                আজকের এই দিনে ({toBengaliDigits(currentDay)} {currentMonthName})
              </h3>
            </div>
          </div>

          <Link
            href="/history"
            className="text-[11px] font-bold text-red-400 hover:text-white transition-colors flex items-center gap-0.5"
          >
            <span>আর্কাইভ</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Content */}
        {event ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-black text-white shadow-sm">
                {toBengaliDigits(event.year)}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/90">
                {event.category}
              </span>
              {event.is1971Related && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                  <Flag size={10} />
                  <span>মুক্তিযুদ্ধ</span>
                </span>
              )}
            </div>

            <Link href={`/history`} className="group">
              <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors leading-snug line-clamp-2">
                {event.title}
              </h4>
            </Link>

            <p className="mt-2 text-xs text-white/80 line-clamp-2 leading-relaxed">
              {event.description}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-white/60">
                {initialEvents.length > 1
                  ? `আরও ${toBengaliDigits(initialEvents.length - 1)}টি ঐতিহাসিক ঘটনা রয়েছে`
                  : "মুক্তিযুদ্ধ ও জাতীয় ইতিহাস"}
              </span>

              <Link
                href="/history"
                className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-white transition-colors"
              >
                <span>পুরো ঘটনা জানুন</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-white/70">
            <p>আজকের দিনের ঐতিহাসিক ঘটনাবলী পড়তে আর্কাইভ দেখুন।</p>
            <Link
              href="/history"
              className="mt-2 inline-block rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
            >
              টাইম মেশিন খুলুন
            </Link>
          </div>
        )}
      </div>

      {/* Decorative background watermark */}
      <History
        size={140}
        className="absolute -right-6 -bottom-8 text-white/5 pointer-events-none select-none"
      />
    </div>
  );
}
