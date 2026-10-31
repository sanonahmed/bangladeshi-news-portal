import { Layers, ArrowUpDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminHomepageBuilderPage() {
  const sections = [
    { title: "শীর্ষ সংবাদ গ্রিড (Lead News Area)", type: "lead", active: true },
    { title: "সর্বাধিক পঠিত পার্শ্ববার (Most Read)", type: "popular", active: true },
    { title: "সর্বশেষ সংবাদ (Latest News)", type: "latest", active: true },
    { title: "জাতীয় সংবাদ (National)", type: "category", active: true },
    { title: "রাজনীতি (Politics)", type: "category", active: true },
    { title: "সারাদেশ (Districts News)", type: "geography", active: true },
    { title: "আন্তর্জাতিক (International)", type: "category", active: true },
    { title: "ভিডিও সংবাদ (Video News)", type: "videos", active: true },
    { title: "খেলাধুলা ও বিনোদন (Sports & Entertainment)", type: "category", active: true },
    { title: "তথ্যপ্রযুক্তি (Technology)", type: "category", active: true },
    { title: "মতামত ও সম্পাদকীয় (Opinion)", type: "opinion", active: true },
    { title: "ছবিঘর (Photo Gallery)", type: "photos", active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Layers size={24} className="text-[var(--color-primary)]" />
          হোমপেজ লেআউট ও সেকশন বিল্ডার
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          হোমপেজের বিভিন্ন সেকশনের ক্রম, সক্রিয়তা ও বিন্যাস নিয়ন্ত্রণ
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          হোমপেজে সক্রিয় সেকশনসমূহ ({sections.length}টি)
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {sections.map((sec, idx) => (
            <div
              key={sec.title}
              className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[var(--color-text-faint)] w-6">
                  #{idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)]">{sec.title}</h3>
                  <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    ধরন: {sec.type}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                সক্রিয়
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
