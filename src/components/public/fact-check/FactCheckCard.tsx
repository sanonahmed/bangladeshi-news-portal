import Link from "next/link";
import Image from "next/image";
import { Eye, ArrowRight, ShieldCheck, Share2 } from "lucide-react";
import { FactCheckBadge, VERDICT_METADATA } from "./FactCheckBadge";
import { toBengaliDigits, formatRelativeBengali } from "@/lib/bengali-date";
import type { FactCheckItem } from "@/types/fact-check";

interface FactCheckCardProps {
  item: FactCheckItem;
  featured?: boolean;
}

export function FactCheckCard({ item, featured = false }: FactCheckCardProps) {
  const verdictConfig = VERDICT_METADATA[item.verdict] || VERDICT_METADATA.false;

  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-md hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Image Side */}
          <div className="relative md:col-span-5 h-64 md:h-auto min-h-[260px] bg-stone-900 overflow-hidden">
            {item.originalMediaUrl ? (
              <img
                src={item.originalMediaUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
                <ShieldCheck size={48} className="opacity-50" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <FactCheckBadge verdict={item.verdict} size="stamp" />
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <span>দাবিকারী: {item.claimant}</span>
              <span>{formatRelativeBengali(new Date(item.createdAt))}</span>
            </div>
          </div>

          {/* Content Side */}
          <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.category}
                </span>
                <span className="text-[11px] text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  প্রধান সত্যসন্ধান রিপোর্ট
                </span>
              </div>

              <Link href={`/fact-check/${item.slug}`} className="group">
                <h2 className="text-lg sm:text-xl font-extrabold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                  {item.title}
                </h2>
              </Link>

              {/* Claim Box */}
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                  ভাইরাল দাবি:
                </span>
                <p className="mt-0.5 text-xs text-stone-700 dark:text-stone-300 font-medium italic">
                  "{item.claim}"
                </p>
              </div>

              {/* Verdict Summary */}
              <p className="mt-3 text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
                <strong className="text-[var(--color-text)] font-bold">ফ্যাক্ট-চেক সিদ্ধান্ত: </strong>
                {item.verdictSummary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  <span>{toBengaliDigits(item.viewCount)} ভিউ</span>
                </span>
              </div>

              <Link
                href={`/fact-check/${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:opacity-90 transition-opacity"
              >
                <span>তদন্তের বিস্তারিত</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Card
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm hover:shadow-md transition-all duration-300">
      <div>
        {/* Thumbnail with stamp/badge */}
        <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
          {item.originalMediaUrl ? (
            <img
              src={item.originalMediaUrl}
              alt={item.title}
              className="w-full h-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
              <ShieldCheck size={36} className="opacity-40" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <FactCheckBadge verdict={item.verdict} size="md" />
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
            <span>{item.category}</span>
            <span>{formatRelativeBengali(new Date(item.createdAt))}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link href={`/fact-check/${item.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h3>
          </Link>

          {/* Claim Box */}
          <div className="mt-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              দাবি:
            </span>
            <p className="mt-0.5 text-[11px] text-[var(--color-text)] italic line-clamp-2">
              "{item.claim}"
            </p>
          </div>

          <p className="mt-2.5 text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {item.verdictSummary}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
            <Eye size={12} />
            <span>{toBengaliDigits(item.viewCount)}</span>
          </span>

          <Link
            href={`/fact-check/${item.slug}`}
            className="inline-flex items-center gap-1 font-bold text-[var(--color-primary)] hover:underline"
          >
            <span>সম্পূর্ণ পড়ুন</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
