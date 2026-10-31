import { CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <CheckSquare size={24} className="text-[var(--color-primary)]" />
          সম্পাদকীয় পর্যালোচনা ও অনুমোদন কিউ
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          সাংবাদিকদের প্রেরিত খসড়া সংবাদ প্রকাশের পূর্বে সম্পাদনা ও অনুমোদন করুন
        </p>
      </div>

      <div className="border border-[var(--color-border)] p-12 text-center bg-[var(--color-bg)]">
        <CheckSquare size={48} className="mx-auto text-emerald-600 mb-3" />
        <h3 className="font-bold text-base text-[var(--color-text)]">
          বর্তমানে পর্যালোচনার অপেক্ষায় কোনো সংবাদ নেই
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          সাংবাদিকরা নতুন কোনো সংবাদ পর্যালোচনার জন্য জমা দিলে এখানে প্রদর্শিত হবে।
        </p>
      </div>
    </div>
  );
}
