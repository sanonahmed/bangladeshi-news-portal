import Link from "next/link";
import { Lock, ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "নিবন্ধন সংরক্ষিত • Registration Closed | দৈনিক বাংলাদেশ বার্তা",
  description: "বার্তা কক্ষ ও অ্যাডমিন প্যানেলে পাবলিক নিবন্ধন বন্ধ আছে",
};

export default function RegisterClosedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4 py-12">
      <div className="max-w-md w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-8 shadow-sm rounded-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
          <Lock size={28} />
        </div>

        <div>
          <span
            className="text-2xl font-extrabold text-[var(--color-primary)] block mb-1"
            style={{ fontFamily: "var(--font-noto-bengali, sans-serif)" }}
          >
            দৈনিক বাংলাদেশ বার্তা
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mt-2 border border-amber-200 dark:border-amber-900/60">
            <ShieldAlert size={13} />
            <span>উন্মুক্ত নিবন্ধন বন্ধ আছে (Registration Closed)</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] leading-relaxed text-left space-y-2">
          <p>
            আমাদের ডিজিটাল বার্তাকক্ষ ও প্রকাশনা প্যানেলে কোনো উন্মুক্ত বা সাধারণ পাবলিক নিবন্ধনের সুবিধা নেই।
          </p>
          <p>
            সকল বিভাগীয় সম্পাদক, বিশেষ প্রতিনিধি, জেলা সংবাদদাতা ও স্টাফ সাংবাদিকদের অ্যাকাউন্ট শুধুমাত্র <strong>প্রধান বার্তা সম্পাদক (সুপার অ্যাডমিন)</strong> কর্তৃক অভ্যন্তরীণভাবে সুরক্ষিত উপায়ে তৈরি ও প্রদান করা হয়।
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <span>লগইন পেজে যান</span>
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold rounded-lg hover:bg-[var(--color-bg)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>পত্রিকার মূল পাতায় ফিরুন</span>
          </Link>
        </div>

        <p className="text-[11px] text-[var(--color-text-faint)] border-t border-[var(--color-border)] pt-4">
          আপনার যদি কোনো অ্যাকাউন্টের প্রয়োজন হয়, তবে সেন্ট্রাল বার্তা ডেস্কে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}
