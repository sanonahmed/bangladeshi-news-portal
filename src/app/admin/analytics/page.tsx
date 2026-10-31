import { BarChart3, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <BarChart3 size={24} className="text-[var(--color-primary)]" />
          পাঠক বিশ্লেষণ ও মেট্রিক্স (Google Analytics 4)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          রিয়েল-টাইম পাঠক সংখ্যা, পেজ ভিউ ও বিভাগভিত্তিক দর্শকপ্রিয়তা
        </p>
      </div>

      {gaId ? (
        <div className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            গুগল অ্যানালিটিক্স ৪ সংযুক্ত রয়েছে
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            Measurement ID: {gaId}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            গুগল অ্যানালিটিক্স ডেটা সরাসরি ক্লাউডে রিয়েল-টাইমে ট্র্যাক হচ্ছে। বিশদ ভিজিটর ডেটাসেট ও ট্র্যাফিক সোর্স বিশ্লেষণের জন্য আপনার গুগল অ্যানালিটিক্স কনসোলে প্রবেশ করুন।
          </p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)] space-y-3">
          <AlertCircle size={44} className="mx-auto text-amber-500" />
          <h3 className="font-bold text-base text-[var(--color-text)]">
            গুগল অ্যানালিটিক্স এখনও কনফিগার করা হয়নি
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
            আপনার এনভায়রনমেন্ট ফাইলে <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> যুক্ত করলে স্বয়ংক্রিয়ভাবে লাইভ পাঠক ট্র্যাকিং চালু হবে।
          </p>
        </div>
      )}
    </div>
  );
}
