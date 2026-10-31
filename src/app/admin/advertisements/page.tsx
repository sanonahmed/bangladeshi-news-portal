import { db } from "@/db";
import { advertisements } from "@/db/schema/advertisements";
import { DollarSign, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAdvertisementsPage() {
  let adList: any[] = [];
  try {
    adList = await db.select().from(advertisements);
  } catch (error) {
    console.warn("Could not query advertisements:", error);
  }

  const standardSlots = [
    { name: "হেডার ব্যানার (Header Banner)", placement: "header_banner", size: "৭২৮ × ৯০" },
    { name: "হোমপেজ লিডারবোর্ড (Leaderboard)", placement: "homepage_leaderboard", size: "৯৭০ × ৯০" },
    { name: "সেকশন মধ্যবর্তী ব্যানার", placement: "between_sections", size: "৭২৮ × ৯০" },
    { name: "সংবাদ পার্শ্ববার (Sidebar Rectangle)", placement: "sidebar", size: "৩০০ × ২৫০" },
    { name: "সংবাদের অভ্যন্তরস্থ বিজ্ঞাপন (In-Article)", placement: "article_inline", size: "৩৩৬ × ২৮০" },
    { name: "মোবাইল ব্যানার (Mobile Banner)", placement: "mobile_slot", size: "৩২০ × ১০০" },
    { name: "ফুটার ব্যানার (Footer Banner)", placement: "footer", size: "৭২৮ × ৯০" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="bengali-headline text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <DollarSign size={24} className="text-[var(--color-primary)]" />
          বিজ্ঞাপন ও আর্থিক আয় ব্যবস্থাপনা
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          গুগল অ্যাডসেন্স ও প্রত্যক্ষ বাণিজ্যিক ব্যানার বিজ্ঞাপন স্লট নিয়ন্ত্রণ করুন
        </p>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          নির্ধারিত বিজ্ঞাপন স্লটসমূহ
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {standardSlots.map((slot) => (
            <div key={slot.placement} className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--color-text)]">{slot.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  স্লট কোড: {slot.placement} | সাইজ: {slot.size}
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                স্বয়ংক্রিয় সিএলএস সুরক্ষিত
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
