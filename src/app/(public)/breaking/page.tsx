import type { Metadata } from "next";
import Link from "next/link";
import { getBreakingNews } from "@/actions/breaking-news";
import { Zap, Clock, ExternalLink, ArrowLeft } from "lucide-react";

export const revalidate = 30; // ISR 30s

export const metadata: Metadata = {
  title: "ব্রেকিং নিউজ আর্কাইভ ও জরুরি সংবাদ | দৈনিক বাংলাদেশ বার্তা",
  description: "জরুরি, তাৎক্ষণিক ও তাজা ব্রেকিং সংবাদসমূহের পূর্ণাঙ্গ তালিকা।",
};

export default async function BreakingPage() {
  const items = await getBreakingNews();

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-[#C8102E] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/" className="hover:text-[var(--color-primary)]">
              প্রচ্ছদ
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)] font-semibold">ব্রেকিং নিউজ</span>
          </div>
          <h1 className="bengali-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <Zap size={28} className="text-[#C8102E] fill-[#C8102E]" />
            ব্রেকিং নিউজ আর্কাইভ ও জরুরি বুলেটিন
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8102E] hover:underline"
        >
          <ArrowLeft size={14} />
          প্রচ্ছদে ফিরুন
        </Link>
      </div>

      {/* Breaking News Feed */}
      <div className="border border-[var(--color-border)] bg-[var(--color-bg)] rounded overflow-hidden shadow-sm">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-[var(--color-border)] flex items-center justify-between">
          <span className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E] animate-ping" />
            বর্তমানে সক্রিয় জরুরি সংবাদ ({items.length}টি)
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">তাৎক্ষণিক আপডেট</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">
            বর্তমানে কোনো ব্রেকিং নিউজ সক্রিয় নেই।
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-[var(--color-bg-secondary)] transition-colors flex items-start gap-3 sm:gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/80 text-[#C8102E] font-mono text-xs font-bold border border-red-200 dark:border-red-900">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                      অগ্রাধিকার {item.priority}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Clock size={11} />
                      ব্রেকিং বুলেটিন
                    </span>
                  </div>

                  {item.isExternal ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bengali-headline text-base sm:text-lg font-bold text-[var(--color-text)] hover:text-[#C8102E] transition-colors leading-snug flex items-baseline gap-1.5"
                    >
                      <span>{item.headline}</span>
                      <ExternalLink size={14} className="text-[var(--color-text-muted)] inline flex-shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href={item.url}
                      className="bengali-headline text-base sm:text-lg font-bold text-[var(--color-text)] hover:text-[#C8102E] transition-colors leading-snug block"
                    >
                      {item.headline}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
