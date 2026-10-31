import { getNavigation } from "@/actions/navigation";
import { Compass, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminNavigationPage() {
  const items = await getNavigation();

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <Compass size={24} className="text-[var(--color-primary)]" />
          নেভিগেশন ও মেনু ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          প্রধান হেডার নেভিগেশন বার ও সাব-মেনুর লিংক নিয়ন্ত্রণ করুন
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          সক্রিয় নেভিগেশন আইটেম ({items.length}টি)
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--color-bg-secondary)]">
              <div>
                <span className="font-bold text-sm text-[var(--color-text)] mr-2">{item.label}</span>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{item.href}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                সক্রিয় (ক্রম: {item.sortOrder})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
