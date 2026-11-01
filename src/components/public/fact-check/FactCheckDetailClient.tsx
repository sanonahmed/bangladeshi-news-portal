"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  Eye,
  Share2,
  Check,
  ArrowLeft,
  AlertTriangle,
  FileSearch,
  ExternalLink,
} from "lucide-react";
import { FacebookIcon, TwitterXIcon, WhatsAppIcon } from "@/components/ui/icons";
import { FactCheckBadge, VERDICT_METADATA } from "./FactCheckBadge";
import { toBengaliDigits, formatBengaliDate } from "@/lib/bengali-date";
import type { FactCheckItem } from "@/types/fact-check";

interface FactCheckDetailClientProps {
  factCheck: FactCheckItem;
  relatedFactChecks: FactCheckItem[];
}

export function FactCheckDetailClient({
  factCheck,
  relatedFactChecks,
}: FactCheckDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const verdictConfig = VERDICT_METADATA[factCheck.verdict] || VERDICT_METADATA.false;

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://bangladeshi-news-portal.onrender.com/fact-check/${factCheck.slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = encodeURIComponent(`${factCheck.title} | দৈনিক বাংলাদেশ বার্তা সত্যসন্ধান`);
  const encodedUrl = encodeURIComponent(currentUrl);

  return (
    <article className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          হোম
        </Link>
        <span>/</span>
        <Link href="/fact-check" className="hover:text-[var(--color-primary)]">
          ফ্যাক্ট-চেক
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text)] font-semibold truncate max-w-[200px] sm:max-w-none">
          {factCheck.category}
        </span>
      </div>

      {/* Back Button */}
      <Link
        href="/fact-check"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline mb-4"
      >
        <ArrowLeft size={14} />
        <span>সকল ফ্যাক্ট-চেক প্রতিবেদনে ফিরুন</span>
      </Link>

      {/* Category Pill & Verification Badge */}
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <span className="rounded bg-[var(--color-primary)] px-2.5 py-1 text-xs font-bold text-white">
          {factCheck.category}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck size={14} />
          <span>যাচাইকৃত সত্যসন্ধান প্রতিবেদন</span>
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] leading-tight">
        {factCheck.title}
      </h1>

      {/* Meta Bar */}
      <div className="mt-4 pt-3 pb-4 border-y border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[var(--color-text)]">অনুসন্ধান দল: </span>
            <span>দৈনিক বাংলাদেশ বার্তা সত্যসন্ধান ডেস্ক</span>
          </div>
          <span className="text-[var(--color-border)]">•</span>
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            <span>প্রকাশ: {formatBengaliDate(new Date(factCheck.createdAt))}</span>
          </div>
          <span className="text-[var(--color-border)]">•</span>
          <div className="flex items-center gap-1">
            <Eye size={13} />
            <span>{toBengaliDigits(factCheck.viewCount)} বার পঠিত</span>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--color-text)] hidden sm:inline">
            শেয়ার করুন:
          </span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
            title="ফেসবুকে শেয়ার করুন"
          >
            <FacebookIcon size={13} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
            title="X-এ শেয়ার করুন"
          >
            <TwitterXIcon size={13} />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
            title="হোয়াটসঅ্যাপে শেয়ার করুন"
          >
            <WhatsAppIcon size={14} />
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex h-7 px-2.5 items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[11px] font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] transition-colors"
            title="লিংক কপি করুন"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
            <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
          </button>
        </div>
      </div>

      {/* Claim & Verdict Hero Box */}
      <div className="my-6 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-5 sm:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div>
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              দাবিকারী ও উৎস:
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--color-text)] mt-0.5">
              {factCheck.claimant}
            </h3>
          </div>
          <div className="self-start sm:self-auto">
            <FactCheckBadge verdict={factCheck.verdict} size="stamp" />
          </div>
        </div>

        {/* The Claim */}
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-500 uppercase tracking-wide">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>ভাইরাল সামাজিক মাধ্যমে উত্থাপিত দাবি:</span>
          </div>
          <p className="mt-1 text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200 italic leading-relaxed">
            "{factCheck.claim}"
          </p>
        </div>

        {/* The Verdict */}
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wide">
            <ShieldCheck size={15} />
            <span>আমাদের সত্যসন্ধান ও সিদ্ধান্ত:</span>
          </div>
          <p className="mt-1 text-sm sm:text-base font-semibold text-[var(--color-text)] leading-relaxed">
            {factCheck.verdictSummary}
          </p>
        </div>
      </div>

      {/* Visual Evidence / Media Comparison Box */}
      {(factCheck.originalMediaUrl || factCheck.debunkedMediaUrl) && (
        <div className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-6">
          <h3 className="text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <FileSearch size={18} className="text-[var(--color-primary)]" />
            <span>ভিজ্যুয়াল প্রমাণ ও মিডিয়া বিশ্লেষণ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Viral Media */}
            {factCheck.originalMediaUrl && (
              <div className="overflow-hidden rounded-xl border border-red-300 dark:border-red-900 bg-stone-900">
                <div className="relative h-56 w-full">
                  <img
                    src={factCheck.originalMediaUrl}
                    alt="ভাইরাল সম্পাদিত মাধ্যম"
                    className="w-full h-full object-cover object-center opacity-85"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                      ভাইরাল দাবি / বিভ্রান্তিকর মাধ্যম
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                  সোশ্যাল মিডিয়ায় ছড়িয়ে পড়া স্ক্রিনশট বা সম্পাদিত কন্টেন্ট
                </div>
              </div>
            )}

            {/* Debunked / Authentic Media */}
            {factCheck.debunkedMediaUrl && (
              <div className="overflow-hidden rounded-xl border border-emerald-300 dark:border-emerald-900 bg-stone-900">
                <div className="relative h-56 w-full">
                  <img
                    src={factCheck.debunkedMediaUrl}
                    alt="আসল উৎস ও যাচাইকৃত প্রমাণ"
                    className="w-full h-full object-cover object-center opacity-90"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                      আসল উৎস / যাচাইকৃত প্রমাণ
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                  আমাদের অনুসন্ধানে উদ্ধার হওয়া মূল ফুটেজ বা আসল নথিপত্র
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Investigation Details & Context */}
      <div className="my-8 space-y-6 text-sm text-[var(--color-text)] leading-relaxed">
        {/* Context */}
        {factCheck.context && (
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span>পটভূমি ও সামাজিক মাধ্যমে প্রচার</span>
            </h2>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-[var(--color-text)] leading-relaxed whitespace-pre-line">
              {factCheck.context}
            </div>
          </div>
        )}

        {/* Investigation Details */}
        {factCheck.investigationDetails && (
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span>অনুসন্ধান প্রক্রিয়া ও তথ্যের ব্যবচ্ছেদ</span>
            </h2>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-[var(--color-text)] leading-relaxed space-y-2 whitespace-pre-line">
              {factCheck.investigationDetails}
            </div>
          </div>
        )}

        {/* Fact Conclusion */}
        {factCheck.factConclusion && (
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>সারসংক্ষেপ ও সত্যসন্ধান ডেস্কের পরামর্শ</span>
            </h2>
            <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/30 p-5 text-[var(--color-text)] leading-relaxed">
              <p className="font-medium text-emerald-900 dark:text-emerald-100">
                {factCheck.factConclusion}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {factCheck.tags && factCheck.tags.length > 0 && (
        <div className="my-6 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[var(--color-text-muted)]">ট্যাগসমূহ:</span>
          {factCheck.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-[var(--color-bg-secondary)] px-2.5 py-1 text-[var(--color-text)] border border-[var(--color-border)] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reader Advisory Callout */}
      <div className="my-8 rounded-2xl border border-amber-300/80 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30 p-5 text-xs text-amber-900 dark:text-amber-200">
        <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
          <span>পাঠকদের প্রতি সচেতনতামূলক বার্তা</span>
        </h4>
        <p className="leading-relaxed mt-1">
          সামাজিক যোগাযোগ মাধ্যমে কোনো উত্তেজনাপূর্ণ তথ্য, ছবি বা ভিডিও দেখলে বিশ্বাস করার আগে মূলধারার নির্ভরযোগ্য গণমাধ্যমে যাচাই করে নিন। কোনো সন্দেহজনক তথ্য আপনার নজরে এলে আমাদের ফ্যাক্ট-চেক ডেস্কে রিপোর্ট করুন।
        </p>
      </div>

      {/* Related Fact Checks */}
      {relatedFactChecks.length > 0 && (
        <div className="my-10 pt-8 border-t border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
            আরও ফ্যাক্ট-চেক ও যাচাইকৃত প্রতিবেদন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedFactChecks.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/fact-check/${item.slug}`}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-2">
                  <FactCheckBadge verdict={item.verdict} size="sm" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                  {item.verdictSummary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
