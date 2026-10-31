import { Tag, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminTagsPage() {
  const sampleTags = [
    { name: "বাজেট ২০২৬", count: "১২" },
    { name: "জাতীয় নির্বাচন", count: "২৫" },
    { name: "মেট্রোরেল", count: "১৮" },
    { name: "আইসিসি বিশ্বকাপ", count: "৩০" },
    { name: "জলবায়ু সম্মেলন", count: "১৪" },
    { name: "কৃত্রিম বুদ্ধিমত্তা", count: "৯" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Tag size={24} className="text-[var(--color-primary)]" />
          সংবাদ ট্যাগ ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          সম্পর্কিত সংবাদগুলোকে সহজে খুঁজে পেতে বিষয়ভিত্তিক ট্যাগ
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          সর্বাধিক ব্যবহৃত ট্যাগসমূহ
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {sampleTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-text)]"
            >
              <span>#{tag.name}</span>
              <span className="text-[10px] bg-[var(--color-border)] px-1.5 py-0.5 rounded-full text-[var(--color-text-muted)]">
                {tag.count}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
