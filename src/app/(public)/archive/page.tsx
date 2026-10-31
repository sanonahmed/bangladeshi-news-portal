import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Archive } from "lucide-react";
import { getPublishedArticles } from "@/actions/articles";
import { formatBengaliDate } from "@/lib/bengali-date";

export const metadata: Metadata = {
  title: "সংবাদ আর্কাইভ ও অতীতের সংখ্যা | বাংলা নিউজ",
  description: "নির্দিষ্ট তারিখের সকল প্রকাশিত সংবাদ ও প্রতিবেদন ব্রাউজ করুন।",
};

interface ArchivePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { date } = await searchParams;
  const targetDate = date ? new Date(date) : new Date();
  const articlesResult = await getPublishedArticles({ pageSize: 12 });

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <Archive size={28} className="text-[var(--color-primary)]" />
            সংবাদ আর্কাইভ
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            অতীতের যেকোনো দিনের প্রকাশিত সংবাদসমূহ খুঁজে নিন
          </p>
        </div>
        <Link href="/" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; প্রচ্ছদে ফিরুন
        </Link>
      </div>

      {/* Date Picker Form */}
      <form method="GET" action="/archive" className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)] whitespace-nowrap">
          <Calendar size={18} className="text-[var(--color-primary)]" />
          তারিখ নির্বাচন করুন:
        </div>
        <input
          type="date"
          name="date"
          defaultValue={date ?? new Date().toISOString().split("T")[0]}
          className="p-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-hover)] transition-colors whitespace-nowrap"
        >
          সংবাদ দেখুন
        </button>
      </form>

      <div className="text-sm font-bold text-[var(--color-text)] mb-4">
        {formatBengaliDate(targetDate)}-এর প্রকাশিত সংবাদসমূহ ({articlesResult.data.length}টি)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesResult.data.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group block border border-[var(--color-border)] p-4 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            {article.category && (
              <span className="text-[11px] font-bold text-[var(--color-primary)]">
                {article.category.name}
              </span>
            )}
            <h2 className="bengali-headline text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mt-1 leading-snug">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
