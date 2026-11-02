"use client";

import { useState } from "react";
import { Calendar, Sparkles, History, ArrowRight } from "lucide-react";
import { toBengaliDigits, BENGALI_MONTHS } from "@/lib/bengali-date";

interface TimeMachineCalendarProps {
  selectedDay: number;
  selectedMonth: number;
  onDateChange: (day: number, month: number) => void;
}

const MOMENTOUS_DATES = [
  { day: 2, month: 11, label: "২ নভেম্বর (আজকের দিন)" },
  { day: 3, month: 11, label: "৩ নভেম্বর (জেল হত্যা দিবস)" },
  { day: 7, month: 11, label: "৭ নভেম্বর (জাতীয় বিপ্লব ও সংহতি)" },
  { day: 7, month: 3, label: "৭ মার্চ (ঐতিহাসিক ভাষণ)" },
  { day: 25, month: 3, label: "২৫ মার্চ (গণহত্যা ও কালরাত)" },
  { day: 26, month: 3, label: "২৬ মার্চ (স্বাধীনতা দিবস)" },
  { day: 17, month: 4, label: "১৭ এপ্রিল (মুজিবনগর সরকার)" },
  { day: 21, month: 2, label: "২১ ফেব্রুয়ারি (মাতৃভাষা দিবস)" },
  { day: 14, month: 12, label: "১৪ ডিসেম্বর (শহীদ বুদ্ধিজীবী)" },
  { day: 16, month: 12, label: "১৬ ডিসেম্বর (মহান বিজয় দিবস)" },
];

export function TimeMachineCalendar({
  selectedDay,
  selectedMonth,
  onDateChange,
}: TimeMachineCalendarProps) {
  const [day, setDay] = useState(selectedDay);
  const [month, setMonth] = useState(selectedMonth);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onDateChange(day, month);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
          <History size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">
            টাইম মেশিন ক্যালেন্ডার
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            বছরের যেকোনো দিন নির্বাচন করে সেদিনের ঐতিহাসিক ঘটনা উন্মোচন করুন
          </p>
        </div>
      </div>

      {/* Date Picker Form */}
      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
            দিন নির্বাচন করুন
          </label>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {toBengaliDigits(d)} তারিখ
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">
            মাস নির্বাচন করুন
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
          >
            {BENGALI_MONTHS.map((mName, idx) => (
              <option key={mName} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition-opacity"
          >
            খুঁজুন
          </button>
        </div>
      </form>

      {/* Quick Momentous Jump Chips */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] block mb-2">
          উল্লেখযোগ্য ঐতিহাসিক দিবসসমূহ (Quick Jump):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MOMENTOUS_DATES.map((m) => {
            const isSelected = selectedDay === m.day && selectedMonth === m.month;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  setDay(m.day);
                  setMonth(m.month);
                  onDateChange(m.day, m.month);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  isSelected
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:border-red-400 hover:text-[var(--color-text)]"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
