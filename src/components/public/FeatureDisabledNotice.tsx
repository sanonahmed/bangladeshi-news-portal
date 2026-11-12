import Link from "next/link";
import { SlidersHorizontal, ArrowLeft, Home, ShieldAlert } from "lucide-react";

interface FeatureDisabledNoticeProps {
  featureNameBn: string;
  featureNameEn?: string;
  categoryName?: string;
}

export function FeatureDisabledNotice({
  featureNameBn,
  featureNameEn,
  categoryName,
}: FeatureDisabledNoticeProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[var(--color-bg)]">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
          <SlidersHorizontal size={26} />
        </div>

        <div className="space-y-1.5">
          {categoryName && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
              {categoryName}
            </span>
          )}
          <h1 className="text-xl font-black text-[var(--color-text)]">
            {featureNameBn} সাময়িকভাবে নিষ্ক্রিয়
          </h1>
          {featureNameEn && (
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              {featureNameEn} is temporarily disabled
            </p>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          পোর্টাল প্রশাসনের কেন্দ্রীয় সেটিংস থেকে এই ফিচারটির কার্যক্রম সাময়িকভাবে বন্ধ রাখা হয়েছে। যেকোনো অনুসন্ধানের জন্য আমাদের সম্পাদকীয় দপ্তরে যোগাযোগ করুন।
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Home size={14} />
            <span>মূল পাতায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
