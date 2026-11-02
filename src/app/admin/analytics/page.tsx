import { BarChart3, AlertCircle } from "lucide-react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const isEn = cookieStore.get("admin_lang")?.value !== "bn";

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2 tracking-tight">
          <BarChart3 size={24} className="text-[var(--color-primary)]" />
          <span>{isEn ? "Reader Analytics & Traffic Metrics (Google Analytics 4)" : "পাঠক বিশ্লেষণ ও মেট্রিক্স (Google Analytics 4)"}</span>
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {isEn
            ? "Real-time readership counts, page views, engagement time and category popularity metrics"
            : "রিয়েল-টাইম পাঠক সংখ্যা, পেজ ভিউ ও বিভাগভিত্তিক দর্শকপ্রিয়তা"}
        </p>
      </div>

      {gaId ? (
        <div className="border border-[var(--color-border)] p-6 bg-[var(--color-bg)] space-y-4 rounded">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{isEn ? "Google Analytics 4 Connected & Active" : "গুগল অ্যানালিটিক্স ৪ সংযুক্ত রয়েছে"}</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            Measurement ID: {gaId}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {isEn
              ? "Readership telemetry and traffic data are tracked in real-time in your Google Analytics dashboard. For detailed traffic sources, demographics, and cohort analysis, access your Google Analytics 4 console."
              : "গুগল অ্যানালিটিক্স ডেটা সরাসরি ক্লাউডে রিয়েল-টাইমে ট্র্যাক হচ্ছে। বিশদ ভিজিটর ডেটাসেট ও ট্র্যাফিক সোর্স বিশ্লেষণের জন্য আপনার গুগল অ্যানালিটিক্স কনসোলে প্রবেশ করুন।"}
          </p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)] space-y-3 rounded">
          <AlertCircle size={44} className="mx-auto text-amber-500" />
          <h3 className="font-bold text-base text-[var(--color-text)]">
            {isEn ? "Google Analytics 4 is not configured yet" : "গুগল অ্যানালিটিক্স এখনও কনফিগার করা হয়নি"}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
            {isEn
              ? "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables to enable automated reader traffic telemetry."
              : "আপনার এনভায়রনমেন্ট ফাইলে NEXT_PUBLIC_GA_MEASUREMENT_ID যুক্ত করলে স্বয়ংক্রিয়ভাবে লাইভ পাঠক ট্র্যাকিং চালু হবে।"}
          </p>
        </div>
      )}
    </div>
  );
}
