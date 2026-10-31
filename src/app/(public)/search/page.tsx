import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { searchArticles } from "@/lib/search";
import { getCategories } from "@/actions/categories";
import { formatRelativeBengali } from "@/lib/bengali-date";
import { Search, Filter, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "সংবাদ অনুসন্ধান | বাংলা নিউজ",
  description: "বাংলা নিউজের বিশাল আর্কাইভ থেকে আপনার প্রয়োজনীয় সংবাদ খুঁজে নিন।",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, cat, from, to, page } = await searchParams;
  const query = q?.trim() ?? "";
  const categorySlug = cat || undefined;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const categoriesList = await getCategories();

  let searchResult = null;
  if (query.length > 0) {
    searchResult = await searchArticles({
      query,
      categorySlug,
      dateFrom: from ? new Date(from) : undefined,
      dateTo: to ? new Date(to) : undefined,
      page: currentPage,
      pageSize: 15,
    });
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="border-b-2 border-[var(--color-primary)] pb-3 mb-8">
        <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
          <Search size={28} className="text-[var(--color-primary)]" />
          সংবাদ অনুসন্ধান
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          বাংলা বা ইংরেজিতে শিরোনাম অথবা বিষয়বস্তু লিখে খুঁজুন
        </p>
      </div>

      {/* Search Input Box & Filters Form */}
      <form method="GET" action="/search" className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 md:p-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="খবরের বিষয়, ব্যক্তি বা স্থান লিখুন... (যেমন: বাজেট, ক্রিকেট, মেট্রোরেল)"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] text-sm"
              autoFocus
            />
            <Search size={18} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-colors whitespace-nowrap"
          >
            অনুসন্ধান করুন
          </button>
        </div>

        {/* Filter Row: Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="block text-[var(--color-text-muted)] mb-1 font-semibold">
              বিভাগ নির্বাচন করুন:
            </label>
            <select
              name="cat"
              defaultValue={categorySlug ?? ""}
              className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">সকল বিভাগ</option>
              {categoriesList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-muted)] mb-1 font-semibold">
              শুরুর তারিখ:
            </label>
            <input
              type="date"
              name="from"
              defaultValue={from ?? ""}
              className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-[var(--color-text-muted)] mb-1 font-semibold">
              শেষ তারিখ:
            </label>
            <input
              type="date"
              name="to"
              defaultValue={to ?? ""}
              className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </form>

      {/* Results Output */}
      {query.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-text-muted)]">
          <Search size={48} className="mx-auto text-[var(--color-text-faint)] mb-3" />
          <p className="text-base font-semibold">অনুসন্ধানের জন্য কোনো কীওয়ার্ড লিখুন</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">
            উদাহরণ: অর্থনীতি, বিশ্বকাপ, সরকার, প্রযুক্তি
          </p>
        </div>
      ) : searchResult && searchResult.articles.length > 0 ? (
        <div className="space-y-6">
          <div className="text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2 flex justify-between items-center">
            <span>
              &ldquo;<strong>{query}</strong>&rdquo; এর জন্য <strong>{searchResult.total}</strong> টি সংবাদ পাওয়া গেছে
            </span>
            <span>পাতা {currentPage} এর {searchResult.totalPages}</span>
          </div>

          <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-bg)]">
            {searchResult.articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                {article.featuredImageUrl && (
                  <div className="relative w-full sm:w-36 h-24 flex-shrink-0 overflow-hidden bg-[var(--color-bg-secondary)]">
                    <Image
                      src={article.featuredImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="144px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {article.category && (
                    <span className="text-[11px] font-bold text-[var(--color-primary)] mb-1 block">
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="bengali-serif-headline text-base sm:text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mt-1.5 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                  {article.publishedAt && (
                    <span className="text-[11px] text-[var(--color-text-faint)] mt-2 block">
                      {formatRelativeBengali(article.publishedAt)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {searchResult.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {currentPage > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}${categorySlug ? `&cat=${categorySlug}` : ""}`}
                  className="px-3 py-1.5 text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                >
                  &larr; পূর্ববর্তী
                </Link>
              )}
              <span className="text-xs text-[var(--color-text-muted)] px-3">
                {currentPage} / {searchResult.totalPages}
              </span>
              {currentPage < searchResult.totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}${categorySlug ? `&cat=${categorySlug}` : ""}`}
                  className="px-3 py-1.5 text-xs font-bold border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                >
                  পরবর্তী &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-[var(--color-text-muted)] border border-[var(--color-border)]">
          <p className="text-base font-bold text-[var(--color-text)]">
            &ldquo;{query}&rdquo; এর সাথে মেলে এমন কোনো সংবাদ পাওয়া যায়নি
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">
            বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      )}
    </div>
  );
}
