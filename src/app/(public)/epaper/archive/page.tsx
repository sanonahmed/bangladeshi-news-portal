import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Archive,
  ArrowRight,
  BookOpen,
  Newspaper,
  Layers,
} from "lucide-react";
import { formatBengaliDate, toBengaliDigits, getDhakaDate } from "@/lib/bengali-date";
import { EDITIONS_LIST } from "@/lib/epaper-data";

export const metadata: Metadata = {
  title: "ই-পেপার আর্কাইভ ও অতীতের সংখ্যাসমূহ | দৈনিক বাংলাদেশ বার্তা",
  description: "বিগত দিনের মুদ্রিত পত্রিকার ডিজিটাল সংখ্যা ও ই-পেপার আর্কাইভ ব্রাউজ করুন।",
};

interface EpaperArchivePageProps {
  searchParams: Promise<{ date?: string; edition?: string }>;
}

export const dynamic = "force-dynamic";

export default async function EpaperArchivePage({ searchParams }: EpaperArchivePageProps) {
  const { date, edition = "dhaka" } = await searchParams;
  const today = getDhakaDate();

  // Generate list of the past 14 days editions
  const pastDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    return {
      dateObj: d,
      dateStr,
      bengaliFormatted: formatBengaliDate(d),
      isToday: i === 0,
      isYesterday: i === 1,
    };
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[var(--color-text-muted)] flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--color-primary)]">প্রচ্ছদ</Link>
          <span>/</span>
          <Link href="/epaper" className="hover:text-[var(--color-primary)]">ই-পেপার</Link>
          <span>/</span>
          <span className="text-[var(--color-text)] font-semibold">আর্কাইভ</span>
        </div>

        <Link
          href="/epaper"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>আজকের ই-পেপার পড়ুন</span>
        </Link>
      </nav>

      {/* Header Banner */}
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">
          <Archive className="w-4 h-4" />
          <span>মুদ্রিত পত্রিকার ডিজিটাল সংগ্রহশালা</span>
        </div>
        <h1 className="bengali-serif-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)]">
          ই-পেপার আর্কাইভ ও অতীতের সংখ্যাসমূহ
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl">
          অতীতের যেকোনো তারিখের মুদ্রিত দৈনিক বাংলাদেশ বার্তার পূর্ণাঙ্গ প্রতিচ্ছবি, পাতা ও সংবাদ ক্লিপিং অনলাইনে খুঁজুন।
        </p>
      </div>

      {/* Date & Edition Filter Form */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-6 shadow-xs">
        <h3 className="bengali-headline text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
          <span>নির্দিষ্ট তারিখ ও সংস্করণ নির্বাচন করুন</span>
        </h3>

        <form method="GET" action="/epaper" className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              তারিখ নির্বাচন:
            </label>
            <input
              type="date"
              name="date"
              defaultValue={date || today.toISOString().split("T")[0]}
              className="w-full p-2.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              সংস্করণ:
            </label>
            <select
              name="edition"
              defaultValue={edition}
              className="w-full p-2.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
            >
              {EDITIONS_LIST.map((ed) => (
                <option key={ed.key} value={ed.key}>
                  {ed.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>ই-পেপার খুলুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* RECENT EDITIONS CARDS */}
      <div>
        <h3 className="bengali-headline text-lg sm:text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[var(--color-primary)]" />
          <span>সাম্প্রতিক দিনসমূহের প্রকাশিত সংখ্যাসমূহ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pastDays.map((day) => (
            <Link
              key={day.dateStr}
              href={`/epaper?date=${day.dateStr}&edition=${edition}&page=1`}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] p-4 transition-all group flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-[var(--color-primary)]">
                    {day.isToday ? "আজকের সংখ্যা" : day.isYesterday ? "গতকালকের সংখ্যা" : "মুদ্রিত সংস্করণ"}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {toBengaliDigits(8)} পাতা
                  </span>
                </div>

                {/* Simulated Thumbnail */}
                <div className="aspect-[4/3] w-full bg-[#fbfbf8] dark:bg-zinc-800 border border-[#d5ccb8] dark:border-zinc-700 p-2 mb-3 flex flex-col justify-between shadow-xs">
                  <div className="border-b border-zinc-400 pb-1 text-center">
                    <span className="text-[9px] font-black tracking-tight block">
                      দৈনিক বাংলাদেশ বার্তা
                    </span>
                  </div>
                  <div className="py-2 text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {day.bengaliFormatted}
                  </div>
                  <div className="text-[8px] text-zinc-500 text-center border-t border-zinc-300 pt-0.5">
                    ঢাকা মূল সংস্করণ
                  </div>
                </div>

                <h4 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {day.bengaliFormatted}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-primary)]">
                <span>পাতা উল্টে পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
